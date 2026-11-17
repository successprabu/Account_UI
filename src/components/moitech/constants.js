/** Expense categories (stored in villageName for type "E"); labels come from the translation files. */
export const EXPENSE_CATEGORIES = [
  'venue',
  'catering',
  'decoration',
  'photography',
  'videography',
  'bridal_wear',
  'groom_wear',
  'jewelry',
  'transportation',
  'accommodation',
  'gifts',
  'invitation_cards',
  'makeup',
  'music_entertainment',
  'wedding_favors',
  'floral_arrangements',
  'mehndi_artist',
  'priest',
  'honeymoon',
  'miscellaneous',
];

/** Kinds of non-cash moi (type "O"): ring, chain ("jain"), coin, pattam, other. */
export const OTHERS_TYPES = ['ring', 'jain', 'coin', 'pattam', 'others'];

/** Record types in the Transaction table. */
export const ENTRY_TYPES = { receipt: 'R', expense: 'E', others: 'O' };
