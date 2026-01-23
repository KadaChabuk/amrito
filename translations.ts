import { Language } from '../types';

interface Translation {
    titlePrefix: string;
    titleMain: string;
    spineText: string;
    subtitle: string;
    organization: string;
    collectionEdit: string;
    touchToOpen: string;
    selectLanguage: string;
    index: string;
    bookmarks: string;
    quotes: string;
    allChapters: string;
    noQuotes: string;
    noBookmarks: string;
    viewIndex: string;
    backToCover: string;
    loading: string;
    listen: string;
    preparingAudio: string;
    playing: string;
    paused: string;
    stop: string;
    resumeReading: string;
    yes: string;
    no: string;
}

export const translations: Record<string, Translation> = {
    bn: {
        titlePrefix: 'শ্রীশ্রীবালক ব্রহ্মচারীর',
        titleMain: 'শৈশব কাহিনী',
        spineText: 'শৈশব কাহিনী',
        subtitle: 'ডিজিটাল সংকলন',
        organization: 'শ্রীশ্রীবালক ব্রহ্মচারী সেবা প্রতিষ্ঠান',
        author: 'লেখক',
        selectLanguage: 'ভাষা নির্বাচন করুন',
        touchToOpen: 'খুলতে স্পর্শ করুন',
        loading: 'বই লোড হচ্ছে...',
        listen: 'শুনুন',
        preparingAudio: 'অডিও প্রস্তুত হচ্ছে...',
        playing: 'চলছে',
        paused: 'থামানো আছে',
        stop: 'বন্ধ করুন',
        index: 'সূচীপত্র',
        bookmarks: 'বুকমার্ক',
        quotes: 'উদ্ধৃতি',
        allChapters: 'সব অধ্যায়',
        noQuotes: 'কোনো উদ্ধৃতি সংরক্ষণ করা হয়নি।',
        noBookmarks: 'বুকমার্ক করা কোনো অধ্যায় নেই।',
        viewIndex: 'সুচীপত্র দেখুন',
        backToCover: 'প্রচ্ছদে ফিরুন',
        resumeReading: 'আগের অবস্থান থেকে পড়া শুরু করুন',
        yes: 'হ্যাঁ',
        no: 'না',
    },
    en: {
        titlePrefix: 'Sri Sri Balak Brahmachari\'s',
        titleMain: 'Childhood Stories',
        spineText: 'Childhood Stories',
        subtitle: 'Digital Compilation',
        organization: 'Sri Sri Balak Brahmachari Seva Pratisthan',
        author: 'Author',
        selectLanguage: 'Select Language',
        touchToOpen: 'TOUCH TO OPEN',
        loading: 'Loading book...',
        listen: 'Listen',
        preparingAudio: 'Preparing Audio...',
        playing: 'Playing',
        paused: 'Paused',
        stop: 'Stop',
        index: 'Table of Contents',
        bookmarks: 'Bookmarks',
        quotes: 'Quotes',
        allChapters: 'All Chapters',
        noQuotes: 'No quotes saved.',
        noBookmarks: 'No bookmarked chapters.',
        viewIndex: 'View Index',
        backToCover: 'Back to Cover',
        resumeReading: 'Resume from last position',
        yes: 'Yes',
        no: 'No',
    },
    hi: {
        titlePrefix: 'श्री श्री बालक ब्रह्मचारी जी की',
        titleMain: 'बचपन की कहानियाँ',
        spineText: 'बचपन की कहानियाँ',
        subtitle: 'डिजिटल संकलन',
        organization: 'श्री श्री बालक ब्रह्मचारी सेवा प्रतिष्ठान',
        author: 'लेखक',
        selectLanguage: 'भाषा चुनें',
        touchToOpen: 'खोलने के लिए स्पर्श करें',
        loading: 'किताब लोड हो रही है...',
        listen: 'सुनें',
        preparingAudio: 'ऑडियो तैयार हो रहा है...',
        playing: 'चल रहा है',
        paused: 'रुका हुआ',
        stop: 'बंद करें',
        index: 'विषय सूची',
        bookmarks: 'बुकमार्क',
        quotes: 'उद्धरण',
        allChapters: 'सभी अध्याय',
        noQuotes: 'कोई उद्धरण सहेजा नहीं गया।',
        noBookmarks: 'कोई बुकमार्क किए गए अध्याय नहीं।',
        viewIndex: 'सूची देखें',
        backToCover: 'कवर पर वापस जाएं',
        resumeReading: 'पिछली स्थिति से पढ़ना शुरू करें',
        yes: 'हाँ',
        no: 'नहीं',
    },
    or: {
        titlePrefix: 'ଶ୍ରୀ ଶ୍ରୀ ବାଳକ ବ୍ରହ୍ମଚାରୀଙ୍କ',
        titleMain: 'ଶୈଶବ କାହାଣୀ',
        spineText: 'ଶୈଶବ କାହାଣୀ',
        subtitle: 'ଡିଜିଟାଲ୍ ସଂକଳନ',
        organization: 'ଶ୍ରୀ ଶ୍ରୀ ବାଳକ ବ୍ରହ୍ମଚାରୀ ସେବା ପ୍ରତିଷ୍ଠାନ',
        author: 'ଲେଖକ',
        selectLanguage: 'ଭାଷା ଚୟନ କରନ୍ତୁ',
        touchToOpen: 'ଖୋଲିବାକୁ ସ୍ପର୍ଶ କରନ୍ତୁ',
        loading: 'ବହି ଲୋଡ୍ ହେଉଛି...',
        listen: 'ଶୁଣନ୍ତୁ',
        preparingAudio: 'ଅଡିଓ ପ୍ରସ୍ତୁତ ହେଉଛି...',
        playing: 'ଚାଲୁଅଛି',
        paused: 'ଅଟକିଛି',
        stop: 'ବନ୍ଦ କରନ୍ତୁ',
        index: 'ସୂଚୀପତ୍ର',
        bookmarks: 'ବୁକମାର୍କ',
        quotes: 'ଉଦ୍ଧୃତି',
        allChapters: 'ସମସ୍ତ ଅଧ୍ୟାୟ',
        noQuotes: 'କୌଣସି ଉଦ୍ଧୃତି ସଂରକ୍ଷିତ ହୋଇନାହିଁ।',
        noBookmarks: 'କୌଣସି ବୁକମାର୍କ ଅଧ୍ୟାୟ ନାହିଁ।',
        viewIndex: 'ସୂଚୀ ଦେଖନ୍ତୁ',
        backToCover: 'କଭରକୁ ଫେରନ୍ତୁ',
        resumeReading: 'ପୂର୍ବ ସ୍ଥାନରୁ ପଢ଼ା ଆରମ୍ଭ କରନ୍ତୁ',
        yes: 'ହଁ',
        no: 'ନା',
    },
    as: {
        titlePrefix: 'শ্ৰীশ্ৰীবালক ব্ৰহ্মচাৰীৰ',
        titleMain: 'শৈশৱ কাহিনী',
        spineText: 'শৈশৱ কাহিনী',
        subtitle: 'ডিজিটেল সংকলন',
        organization: 'শ্ৰীশ্ৰীবালক ব্ৰহ্মচাৰী সেৱা প্ৰতিষ্ঠান',
        author: 'লেখক',
        selectLanguage: 'ভাষা নিৰ্বাচন কৰক',
        touchToOpen: 'খুলিবলৈ স্পর্শ কৰক',
        loading: 'কিতাপ লোড হৈ আছে...',
        listen: 'শুনক',
        preparingAudio: 'অডিঅ’ প্ৰস্তুত হৈ আছে...',
        playing: 'চলি আছে',
        paused: 'ৰখোৱা হৈছে',
        stop: 'বন্ধ কৰক',
        index: 'সূচীপত্ৰ',
        bookmarks: 'বুকমার্ক',
        quotes: 'উদ্ধৃতি',
        allChapters: 'সকলো অধ্যায়',
        noQuotes: 'কোনো উদ্ধৃতি সংৰক্ষণ কৰা হোৱা নাই।',
        noBookmarks: 'বুকমার্ক কৰা কোনো অধ্যায় নাই।',
        viewIndex: 'সূচী চাওক',
        backToCover: 'প্রচ্ছদলৈ উভতি যাওক',
        resumeReading: 'আগৰ স্থানৰ পৰা পঢ়া আৰম্ভ কৰক',
        yes: 'হয়',
        no: 'নহয়',
        loading: 'LOADING'
    }
};

export const getTranslation = (langCode: string) => {
    return translations[langCode] || translations['bn'];
};
