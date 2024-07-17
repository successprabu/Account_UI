// Function to transliterate Tanglish text to Tamil
export const transliterateToTamil = (tanglishText) => {
  const transliterationMap = {
    'a': 'அ', 'b': 'ப', 'c': 'ச', 'd': 'ட', 'e': 'எ', 'f': 'ஃ', 'g': 'க',
    'h': 'ஹ', 'i': 'இ', 'j': 'ஜ', 'k': 'க', 'l': 'ள', 'm': 'ம', 'n': 'ந',
    'o': 'ஒ', 'p': 'ப', 'q': 'ஃ', 'r': 'ர', 's': 'ஸ', 't': 'ட', 'u': 'உ',
    'v': 'வ', 'w': 'வ', 'x': 'ஷ', 'y': 'ய', 'z': 'ழ',

    // Common Tamil syllables (case insensitive)
    'ka': 'க', 'ki': 'கி', 'ku': 'கு', 'ke': 'கெ', 'kai': 'கை', 'ko': 'கொ', 'koo': 'கூ',
    'sa': 'ஸ', 'si': 'ஸி', 'su': 'ஸு', 'se': 'ஸெ', 'sai': 'ஸை', 'so': 'ஸொ', 'soo': 'ஸூ',
    // Add more syllables as needed

    // Handle case insensitivity
    'A': 'அ', 'B': 'ப', 'C': 'ச', 'D': 'ட', 'E': 'எ', 'F': 'ஃ', 'G': 'க',
    'H': 'ஹ', 'I': 'இ', 'J': 'ஜ', 'K': 'க', 'L': 'ள', 'M': 'ம', 'N': 'ந',
    'O': 'ஒ', 'P': 'ப', 'Q': 'ஃ', 'R': 'ர', 'S': 'ஸ', 'T': 'ட', 'U': 'உ',
    'V': 'வ', 'W': 'வ', 'X': 'ஷ', 'Y': 'ய', 'Z': 'ழ',

    ' ': ' '
  };

  let tamilText = '';
  let buffer = '';

  for (let i = 0; i < tanglishText.length; i++) {
    const char = tanglishText[i].toLowerCase();
    buffer += char;

    // Check if buffer matches any Tamil syllable
    if (transliterationMap[buffer]) {
      tamilText += transliterationMap[buffer];
      buffer = ''; // Reset buffer
    } else {
      // Check if current character matches a single Tamil character
      if (transliterationMap[char]) {
        tamilText += transliterationMap[char];
        buffer = ''; // Reset buffer
      } else {
        // If no match found, add the current character(s) to output as-is
        tamilText += buffer;
        buffer = ''; // Reset buffer
      }
    }
  }

  // Append any remaining characters in buffer to output
  tamilText += buffer;

  return tamilText;
};


