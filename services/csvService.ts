
import { Chapter } from '../types';

const BASE_URL = 'https://docs.google.com/spreadsheets/d/1b6pmIChESpeLzmdGseWYCSXoTisvQhRnrRv5nnLsiqU/export?format=csv';

/**
 * Enhanced CSV parser to handle quotes and multiple lines correctly.
 */
function parseCSV(text: string): string[][] {
  const result: string[][] = [];
  let currentRow: string[] = [];
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

export const fetchChapters = async (gid: string): Promise<Chapter[]> => {
  try {
    const response = await fetch(`${BASE_URL}&gid=${gid}`);
    if (!response.ok) throw new Error('Network response was not ok');
    const text = await response.text();
    const data = parseCSV(text);
    
    // Mapping: row[0]=name, row[1]=date, row[2]=writer(index), row[3]=data
    const rawChapters = data.slice(1).map((row, idx) => {
      const rawIndex = row[2]?.replace(/[^0-9]/g, '');
      const sortOrder = rawIndex ? parseInt(rawIndex, 10) : idx;

      return {
        id: `chapter-${idx}`,
        title: (row[0] || 'Untitled').trim(),
        subtitle: (row[1] || '').trim(),
        writer: (row[2] || '').trim(),
        content: (row[3] || '').trim(),
        sortOrder: sortOrder
      };
    }).filter(ch => ch.content.length > 0);

    const sortedChapters = rawChapters.sort((a, b) => a.sortOrder - b.sortOrder);

    return sortedChapters.map((ch, idx) => ({
      id: ch.id,
      title: ch.title,
      subtitle: ch.subtitle,
      writer: ch.writer,
      content: ch.content,
      index: idx
    }));
  } catch (error) {
    console.error('Error fetching CSV:', error);
    return [];
  }
};
