export const transliterateToTamil = (tanglishText) => {
  const transliterationMap = {
    'aa': 'ஆ', 'ii': 'ஈ', 'uu': 'ஊ', 'ee': 'ஏ', 'ai': 'ஐ', 'oo': 'ஓ', 'au': 'ஔ',
    'a': 'அ', 'i': 'இ', 'u': 'உ', 'e': 'எ', 'o': 'ஒ',
    'ka': 'க', 'ki': 'கி', 'ku': 'கு', 'ke': 'கெ', 'kai': 'கை', 'ko': 'கொ', 'koo': 'கூ',
    'k': 'க்',
    'nga': 'ங', 'ngi': 'ஙி', 'ngu': 'ஙு', 'nge': 'ஙெ', 'ngai': 'ஙை', 'ngo': 'ஙொ', 'ngoo': 'ஙூ',
    'ng': 'ங்',
    'cha': 'ச', 'chi': 'சி', 'chu': 'சு', 'che': 'செ', 'chai': 'சை', 'cho': 'சொ', 'choo': 'சூ',
    'ch': 'ச்',
    'ja': 'ஜ', 'ji': 'ஜி', 'ju': 'ஜு', 'je': 'ஜெ', 'jai': 'ஜை', 'jo': 'ஜொ', 'joo': 'ஜூ',
    'j': 'ஜ்',
    'nya': 'ஞ', 'nyi': 'ஞி', 'nyu': 'ஞு', 'nye': 'ஞெ', 'nyai': 'ஞை', 'nyo': 'ஞொ', 'nyoo': 'ஞூ',
    'ny': 'ஞ்',
    'ta': 'ட', 'ti': 'டி', 'tu': 'டு', 'te': 'டெ', 'tai': 'டை', 'to': 'டொ', 'too': 'டூ',
    't': 'ட்',
    'na': 'ண', 'ni': 'ணி', 'nu': 'ணு', 'ne': 'ணெ', 'nai': 'ணை', 'no': 'ணொ', 'noo': 'ணூ',
    'n': 'ண்',
    'tha': 'த', 'thi': 'தி', 'thu': 'து', 'the': 'தெ', 'thai': 'தை', 'tho': 'தொ', 'thoo': 'தூ',
    'th': 'த்',
    'pa': 'ப', 'pi': 'பி', 'pu': 'பு', 'pe': 'பெ', 'pai': 'பை', 'po': 'பொ', 'poo': 'பூ',
    'p': 'ப்',
    'ma': 'ம', 'mi': 'மி', 'mu': 'மு', 'me': 'மெ', 'mai': 'மை', 'mo': 'மொ', 'moo': 'மூ',
    'm': 'ம்',
    'ya': 'ய', 'yi': 'யி', 'yu': 'யு', 'ye': 'யெ', 'yai': 'யை', 'yo': 'யொ', 'yoo': 'யூ',
    'y': 'ய்',
    'ra': 'ர', 'ri': 'ரி', 'ru': 'ரு', 're': 'ரெ', 'rai': 'ரை', 'ro': 'ரொ', 'roo': 'ரூ',
    'r': 'ர்',
    'la': 'ல','laa': 'லா', 'li': 'லி', 'lu': 'லு', 'le': 'லெ', 'lai': 'லை', 'lo': 'லொ', 'loo': 'லூ',
    'l': 'ல்',
    'va': 'வ', 'vaa': 'வா','vi': 'வி', 'vu': 'வு', 've': 'வெ', 'vai': 'வை', 'vo': 'வொ', 'voo': 'வூ',
    'v': 'வ்',
    'sha': 'ஷ', 'shi': 'ஷி', 'shu': 'ஷு', 'she': 'ஷெ', 'shai': 'ஷை', 'sho': 'ஷொ', 'shoo': 'ஷூ',
    'sh': 'ஷ்',
    'sa': 'ச', 'si': 'சி', 'su': 'சு', 'se': 'செ', 'sai': 'சை', 'so': 'சொ', 'soo': 'சூ',
    's': 'ச்',
    'ha': 'ஹ', 'hi': 'ஹி', 'hu': 'ஹு', 'he': 'ஹெ', 'hai': 'ஹை', 'ho': 'ஹொ', 'hoo': 'ஹூ',
    'h': 'ஹ்',
    'lla': 'ள', 'lli': 'ளி', 'llu': 'ளு', 'lle': 'ளெ', 'llai': 'ளை', 'llo': 'ளொ', 'lloo': 'ளூ',
    'll': 'ள்',
    'zha': 'ழ', 'zhi': 'ழி', 'zhu': 'ழு', 'zhe': 'ழெ', 'zhai': 'ழை', 'zho': 'ழொ', 'zhoo': 'ழூ',
    'zh': 'ழ்',
    'tra': 'ட்ர', 'tri': 'ட்ரி', 'tru': 'ட்ரு', 'tre': 'ட்ரெ', 'trai': 'ட்ரை', 'tro': 'ட்ரொ', 'troo': 'ட்ரூ',
    'tr': 'ட்ர்',
    'gna': 'ஞ', 'gni': 'ஞி', 'gnu': 'ஞு', 'gne': 'ஞெ', 'gnai': 'ஞை', 'gno': 'ஞொ', 'gnoo': 'ஞூ',
    'gn': 'ஞ்',
    ' ': ' '
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
