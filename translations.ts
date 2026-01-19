import { Language } from '../types';

interface Translation {
    titlePrefix: string;
    titleMain: string;
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
}

export const translations: Record<string, Translation> = {
    bn: {
        titlePrefix: 'শ্রীশ্রীবালক ব্রহ্মচারীর',
        titleMain: 'শৈশব কাহিনী',
        subtitle: 'ডিজিটাল সংকলন',
        organization: 'শ্রীশ্রীবালক ব্রহ্মচারী সেবা প্রতিষ্ঠান',
        collectionEdit: 'সংগ্রহ ও সম্পাদনা',
        touchToOpen: 'TOUCH TO OPEN',
        selectLanguage: 'ভাষা নির্বাচন করুন',
        index: 'সূচীপত্র',
        bookmarks: 'বুকমার্ক',
        quotes: 'উদ্ধৃতি',
        allChapters: 'সব অধ্যায়',
        noQuotes: 'কোনো উদ্ধৃতি সংরক্ষণ করা হয়নি।',
        noBookmarks: 'বুকমার্ক করা কোনো অধ্যায় নেই।',
        viewIndex: 'সুচীপত্র দেখুন',
        backToCover: 'প্রচ্ছদে ফিরুন',
        loading: 'LOADING'
    },
    en: {
        titlePrefix: 'Sri Sri Balak Brahmachari\'s',
        titleMain: 'Childhood Stories',
        subtitle: 'Digital Compilation',
        organization: 'Sri Sri Balak Brahmachari Seva Pratisthan',
        collectionEdit: 'Collection & Editing',
        touchToOpen: 'TOUCH TO OPEN',
        selectLanguage: 'Select Language',
        index: 'Table of Contents',
        bookmarks: 'Bookmarks',
        quotes: 'Quotes',
        allChapters: 'All Chapters',
        noQuotes: 'No quotes saved.',
        noBookmarks: 'No bookmarked chapters.',
        viewIndex: 'View Index',
        backToCover: 'Back to Cover',
        loading: 'LOADING'
    },
    hi: {
        titlePrefix: 'श्री श्री बालक ब्रह्मचारी जी की',
        titleMain: 'बचपन की कहानियाँ',
        subtitle: 'डिजिटल संकलन',
        organization: 'श्री श्री बालक ब्रह्मचारी सेवा प्रतिष्ठान',
        collectionEdit: 'संग्रह और संपादन',
        touchToOpen: 'TOUCH TO OPEN',
        selectLanguage: 'भाषा चुनें',
        index: 'विषय सूची',
        bookmarks: 'बुकमार्क',
        quotes: 'उद्धरण',
        allChapters: 'सभी अध्याय',
        noQuotes: 'कोई उद्धरण सहेजा नहीं गया।',
        noBookmarks: 'कोई बुकमार्क किए गए अध्याय नहीं।',
        viewIndex: 'सूची देखें',
        backToCover: 'कवर पर वापस जाएं',
        loading: 'LOADING'
    },
    or: {
        titlePrefix: 'ଶ୍ରୀ ଶ୍ରୀ ବାଳକ ବ୍ରହ୍ମଚାରୀଙ୍କ',
        titleMain: 'ଶୈଶବ କାହାଣୀ',
        subtitle: 'ଡିଜିଟାଲ୍ ସଂକଳନ',
        organization: 'ଶ୍ରୀ ଶ୍ରୀ ବାଳକ ବ୍ରହ୍ମଚାରୀ ସେବା ପ୍ରତିଷ୍ଠାନ',
        collectionEdit: 'ସଂଗ୍ରହ ଓ ସମ୍ପାଦନା',
        touchToOpen: 'TOUCH TO OPEN',
        selectLanguage: 'ଭାଷା ଚୟନ କରନ୍ତୁ',
        index: 'ସୂଚୀପତ୍ର',
        bookmarks: 'ବୁକମାର୍କ',
        quotes: 'ଉଦ୍ଧୃତି',
        allChapters: 'ସମସ୍ତ ଅଧ୍ୟାୟ',
        noQuotes: 'କୌଣସି ଉଦ୍ଧୃତି ସଂରକ୍ଷିତ ହୋଇନାହିଁ।',
        noBookmarks: 'କୌଣସି ବୁକମାର୍କ ଅଧ୍ୟାୟ ନାହିଁ।',
        viewIndex: 'ସୂଚୀ ଦେଖନ୍ତୁ',
        backToCover: 'କଭରକୁ ଫେରନ୍ତୁ',
        loading: 'LOADING'
    },
    as: {
        titlePrefix: 'শ্ৰীশ্ৰীবালক ব্ৰহ্মচাৰীৰ',
        titleMain: 'শৈশৱ কাহিনী',
        subtitle: 'ডিজিটেল সংকলন',
        organization: 'শ্ৰীশ্ৰীবালক ব্ৰহ্মচাৰী সেৱা প্ৰতিষ্ঠান',
        collectionEdit: 'সংগ্ৰহ আৰু সম্পাদনা',
        touchToOpen: 'TOUCH TO OPEN',
        selectLanguage: 'ভাষা নিৰ্বাচন কৰক',
        index: 'সূচীপত্ৰ',
        bookmarks: 'বুকমার্ক',
        quotes: 'উদ্ধৃতি',
        allChapters: 'সকলো অধ্যায়',
        noQuotes: 'কোনো উদ্ধৃতি সংৰক্ষণ কৰা হোৱা নাই।',
        noBookmarks: 'বুকমার্ক কৰা কোনো অধ্যায় নাই।',
        viewIndex: 'সূচী চাওক',
        backToCover: 'প্রচ্ছদলৈ উভতি যাওক',
        loading: 'LOADING'
    }
};

export const getTranslation = (langCode: string) => {
    return translations[langCode] || translations['bn'];
};
