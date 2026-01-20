
import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';
import OpenAI from 'openai';

// --- CONFIGURATION ---
const OPENAI_API_KEY = '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';
const BASE_URL = 'https://docs.google.com/spreadsheets/d/1b6pmIChESpeLzmdGseWYCSXoTisvQhRnrRv5nnLsiqU/export?format=csv';

// GIDs for each language from metadata or types
const LANGUAGES = [
    { code: 'bn', gid: '573962383' },
    { code: 'en', gid: '1711803682' },
    { code: 'hi', gid: '1209961589' },
    { code: 'as', gid: '54556265' },
    { code: 'or', gid: '1435471202' }
];

const openai = new OpenAI({
    apiKey: OPENAI_API_KEY,
});

/**
 * Simple CSV parser
 */
function parseCSV(text) {
    const result = [];
    let currentRow = [];
    let currentField = '';
    let inQuotes = false;

    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        const nextChar = text[i + 1];

        if (char === '"') {
            if (inQuotes && nextChar === '"') {
                currentField += '"';
                i++;
            } else {
                inQuotes = !inQuotes;
            }
        } else if (char === ',' && !inQuotes) {
            currentRow.push(currentField);
            currentField = '';
        } else if ((char === '\r' || char === '\n') && !inQuotes) {
            if (char === '\r' && nextChar === '\n') i++;
            currentRow.push(currentField);
            if (currentRow.some(field => field.trim() !== '')) {
                result.push(currentRow);
            }
            currentRow = [];
            currentField = '';
        } else {
            currentField += char;
        }
    }

    if (currentRow.length > 0 || currentField !== '') {
        currentRow.push(currentField);
        result.push(currentRow);
    }

    return result;
}

async function generateAudio(text, outputPath) {
    console.log(`Generating audio for: ${outputPath}`);
    const mp3 = await openai.audio.speech.create({
        model: "tts-1",
        voice: "alloy", // Recommended: alloy, echo, fable, onyx, nova, shimmer
        input: text.substring(0, 4000), // OpenAI TTS limit is 4096 chars per request
    });
    const buffer = Buffer.from(await mp3.arrayBuffer());
    await fs.promises.writeFile(outputPath, buffer);
}

async function main() {
    if (OPENAI_API_KEY === 'your_openai_api_key_here') {
        console.error('Error: Please set your OpenAI API Key in the script.');
        process.exit(1);
    }

    for (const lang of LANGUAGES) {
        console.log(`\n--- Processing Language: ${lang.code} ---`);
        const outputDir = path.join(process.cwd(), 'public', 'audio', lang.code);
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        try {
            const response = await fetch(`${BASE_URL}&gid=${lang.gid}`);
            const text = await response.text();
            const data = parseCSV(text);

            const chapters = data.slice(1).map((row, idx) => ({
                id: `chapter-${idx}`,
                title: (row[0] || 'Untitled').trim(),
                content: (row[3] || '').trim(),
            })).filter(ch => ch.content.length > 0);

            for (const chapter of chapters) {
                const fileName = `${chapter.id}.mp3`;
                const filePath = path.join(outputDir, fileName);

                if (fs.existsSync(filePath)) {
                    console.log(`Skipping existing: ${fileName}`);
                    continue;
                }

                const textToRead = `${chapter.title}. ${chapter.content}`;
                await generateAudio(textToRead, filePath);
                // Add a small delay to avoid rate limits
                await new Promise(r => setTimeout(r, 500));
            }
        } catch (error) {
            console.error(`Error processing ${lang.code}:`, error);
        }
    }
}

main();
