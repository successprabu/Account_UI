export const transliterateToTamil = (tanglishText) => {
  
  const transliterationMap = {
    
      "a": "அ", "aa": "ஆ", "i": "இ", "ii": "ஈ", "u": "உ", "uu": "ஊ",
      "e": "எ", "ee": "ஏ", "ai": "ஐ", "o": "ஒ", "oo": "ஓ", "au": "ஔ",
      
      "k": "க்", "ka": "க", "kaa": "கா", "ki": "கி", "kii": "கீ", "ku": "கு", "kuu": "கூ", "ke": "கெ", "kee": "கே", "kai": "கை", "ko": "கொ", "koo": "கோ", "kau": "கௌ",
      
      "ng": "ங்", "nga": "ங", "ngaa": "ஙா", "ngi": "ஙி", "ngii": "ஙீ", "ngu": "ஙு", "nguu": "ஙூ", "nge": "ஙெ", "ngee": "ஙே", "ngai": "ஙை", "ngo": "ஙொ", "ngoo": "ஙோ", "ngau": "ஙௌ",
      
      "c": "ச்", "ca": "ச", "caa": "சா", "ci": "சி", "cii": "சீ", "cu": "சு", "cuu": "சூ", "ce": "செ", "cee": "சே", "cai": "சை", "co": "சொ", "coo": "சோ", "cau": "சௌ",
      
      "ch": "ச்", "cha": "ச", "chaa": "சா", "chi": "சி", "chii": "சீ", "chu": "சு", "chuu": "சூ", "che": "செ", "chee": "சே", "chai": "சை", "cho": "சொ", "choo": "சோ", "chau": "சௌ",
      
      "j": "ஜ்", "ja": "ஜ", "jaa": "ஜா", "ji": "ஜி", "jii": "ஜீ", "ju": "ஜு", "juu": "ஜூ", "je": "ஜெ", "jee": "ஜே", "jai": "ஜை", "jo": "ஜொ", "joo": "ஜோ", "jau": "ஜௌ",
      
      "nj": "ஞ்", "nja": "ஞ", "njaa": "ஞா", "nji": "ஞி", "njii": "ஞீ", "nju": "ஞு", "njuu": "ஞூ", "nje": "ஞெ", "njee": "ஞே", "njai": "ஞை", "njo": "ஞொ", "njoo": "ஞோ", "njau": "ஞௌ",
      
      "t": "ட்", "ta": "ட", "taa": "டா", "ti": "டி", "tii": "டீ", "tu": "டு", "tuu": "டூ", "te": "டெ", "tee": "டே", "tai": "டை", "to": "டொ", "too": "டோ", "tau": "டௌ",
      
      "n": "ண்", "na": "ண", "naa": "ணா", "ni": "ணி", "nii": "ணீ", "nu": "ணு", "nuu": "ணூ", "ne": "ணெ", "nee": "ணே", "nai": "ணை", "no": "ணொ", "noo": "ணோ", "nau": "ணௌ",
      
      "th": "த்", "tha": "த", "thaa": "தா", "thi": "தி", "thii": "தீ", "thu": "து", "thuu": "தூ", "the": "தெ", "thee": "தே", "thai": "தை", "tho": "தொ", "thoo": "தோ", "thau": "தௌ",
      
      "p": "ப்", "pa": "ப", "paa": "பா", "pi": "பி", "pii": "பீ", "pu": "பு", "puu": "பூ", "pe": "பெ", "pee": "பே", "pai": "பை", "po": "பொ", "poo": "போ", "pau": "பௌ",
      
      "m": "ம்", "ma": "ம", "maa": "மா", "mi": "மி", "mii": "மீ", "mu": "மு", "muu": "மூ", "me": "மெ", "mee": "மே", "mai": "மை", "mo": "மொ", "moo": "மோ", "mau": "மௌ",
      
      "y": "ய்", "ya": "ய", "yaa": "யா", "yi": "யி", "yii": "யீ", "yu": "யு", "yuu": "யூ", "ye": "யெ", "yee": "யே", "yai": "யை", "yo": "யொ", "yoo": "யோ", "yau": "யௌ",
      
      "r": "ர்", "ra": "ர", "raa": "ரா", "ri": "ரி", "rii": "ரீ", "ru": "ரு", "ruu": "ரூ", "re": "ரெ", "ree": "ரே", "rai": "ரை", "ro": "ரொ", "roo": "ரோ", "rau": "ரௌ",
      
      "l": "ல்", "la": "ல", "laa": "லா", "li": "லி", "lii": "லீ", "lu": "லு", "luu": "லூ", "le": "லெ", "lee": "லே", "lai": "லை", "lo": "லொ", "loo": "லோ", "lau": "லௌ",
      
      "v": "வ்", "va": "வ", "vaa": "வா", "vi": "வி", "vii": "வீ", "vu": "வு", "vuu": "வூ", "ve": "வெ", "vee": "வே", "vai": "வை", "vo": "வொ", "voo": "வோ", "vau": "வௌ",
      
      "z": "ழ்", "za": "ழ", "zaa": "ழா", "zi": "ழி", "zii": "ழீ", "zu": "ழு", "zuu": "ழூ", "ze": "ழெ", "zee": "ழே", "zai": "ழை", "zo": "ழொ", "zoo": "ழோ", "zau": "ழௌ",
      
      "zh": "ழ்", "zha": "ழ", "zhaa": "ழா", "zhi": "ழி", "zhii": "ழீ", "zhu": "ழு", "zhuu": "ழூ", "zhe": "ழெ", "zhee": "ழே", "zhai": "ழை", "zho": "ழொ", "zhoo": "ழோ", "zhau": "ழௌ",
      
      "l": "ள்", "lla": "ள", "llaa": "ளா", "lli": "ளி", "llii": "ளீ", "llu": "ளு", "lluu": "ளூ", "lle": "ளெ", "llee": "ளே", "llai": "ளை", "llo": "ளொ", "lloo": "ளோ", "llau": "ளௌ",
      
      "n": "ன்", "na": "ன", "naa": "னா", "ni": "னி", "nii": "னீ", "nu": "னு", "nuu": "னூ", "ne": "னெ", "nee": "னே", "nai": "னை", "no": "னொ", "noo": "னோ", "nau": "னௌ",
      
      "s": "ச்", "sa": "ச", "saa": "சா", "si": "சி", "sii": "சீ", "su": "சு", "suu": "சூ", "se": "செ", "see": "சே", "sai": "சை", "so": "சொ", "soo": "சோ", "sau": "சௌ",
      
      "sh": "ஷ்", "sha": "ஷ", "shaa": "ஷா", "shi": "ஷி", "shii": "ஷீ", 
  
        "q": "ஃ",
        "x": "ஃ",
    
    'sha': 'ஷ', 'shaa': 'ஷா', 'shi': 'ஷி', 'shii': 'ஷீ', 'shu': 'ஷு', 'shuu': 'ஷூ',
    'she': 'ஷெ', 'shee': 'ஷே', 'shai': 'ஷை', 'sho': 'ஷொ', 'shoo': 'ஷோ', 'shau': 'ஷௌ',
    'sh': 'ஷ்',

    'ha': 'ஹ', 'haa': 'ஹா', 'hi': 'ஹி', 'hii': 'ஹீ', 'hu': 'ஹு', 'huu': 'ஹூ',
    'he': 'ஹெ', 'hee': 'ஹே', 'hai': 'ஹை', 'ho': 'ஹொ', 'hoo': 'ஹோ', 'hau': 'ஹௌ',
    'h': 'ஹ்',

    'tra': 'ட்ர', 'traa': 'ட்ரா', 'tri': 'ட்ரி', 'trii': 'ட்ரீ', 'tru': 'ட்ரு', 'truu': 'ட்ரூ',
    'tre': 'ட்ரெ', 'tree': 'ட்ரே', 'trai': 'ட்ரை', 'tro': 'ட்ரொ', 'troo': 'ட்ரோ', 'trau': 'ட்ரௌ',
    'tr': 'ட்ர்',
    
    'ksha': 'க்ஷ', 'kshaa': 'க்ஷா', 'kshi': 'க்ஷி', 'kshii': 'க்ஷீ', 'kshu': 'க்ஷு', 'kshuu': 'க்ஷூ',
    'kshe': 'க்ஷெ', 'kshee': 'க்ஷே', 'kshai': 'க்ஷை', 'ksho': 'க்ஷொ', 'kshoo': 'க்ஷோ', 'kshau': 'க்ஷௌ',
    'ksh': 'க்ஷ்',

    '': ' '
};


  // Sort keys by length in descending order
  const sortedKeys = Object.keys(transliterationMap).sort((a, b) => b.length - a.length);

  const transliterateWord = (word) => {
    let result = '';
    let i = 0;

    while (i < word.length) {
      let matched = false;

      // Try to match the longest possible pattern first
      for (const key of sortedKeys) {
        if (word.substr(i, key.length).toLowerCase() === key) {
          result += transliterationMap[key];
          i += key.length;
          matched = true;
          break;
        }
      }

      // If no match is found, add the current character as-is
      if (!matched) {
        result += word[i];
        i++;
      }
    }

    return result;
  };

  // Split the text into words and transliterate each word
  const words = tanglishText.trim().split(/\s+/);
  let tamilText = '';

  words.forEach(word => {
    tamilText += transliterateWord(word) + ' ';
  });

  return tamilText.trim();
};
