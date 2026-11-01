// Words people use when describing fabric, mapped onto the terms used in the product data.
// Shared by catalogue search and the demo AI discovery interpreter.

export const COLOUR_SYNONYMS = {
  red: ['red', 'scarlet', 'crimson', 'maroon', 'burgundy'],
  black: ['black', 'dark', 'ebony'],
  gold: ['gold', 'golden', 'mustard'],
  yellow: ['yellow', 'lemon', 'sunshine'],
  blue: ['blue', 'navy', 'royal', 'indigo', 'sky', 'azure'],
  white: ['white', 'ivory'],
  cream: ['cream', 'beige', 'off-white'],
  green: ['green', 'emerald', 'olive', 'lime'],
  orange: ['orange', 'copper', 'amber', 'terracotta', 'rust'],
  brown: ['brown', 'earth', 'earthy', 'chocolate', 'clay', 'tan'],
  pink: ['pink', 'rose', 'blush', 'fuchsia'],
  purple: ['purple', 'lilac', 'violet', 'lavender', 'plum'],
  teal: ['teal', 'turquoise', 'aqua'],
};

export const PATTERN_SYNONYMS = {
  floral: ['floral', 'flower', 'flowers', 'flowery', 'blooms', 'bloom', 'petals', 'roses'],
  geometric: ['geometric', 'geometry', 'shapes', 'angular', 'lines'],
  diamond: ['diamond', 'diamonds', 'rhombus'],
  zigzag: ['zigzag', 'zig-zag', 'chevron', 'chevrons'],
  circles: ['circle', 'circles', 'rings', 'round', 'bubbles'],
  rings: ['rings', 'interlocking', 'union'],
  stripes: ['stripe', 'stripes', 'striped', 'bands'],
  waves: ['wave', 'waves', 'wavy', 'ripples', 'water', 'river'],
  dots: ['dot', 'dots', 'spots', 'polka', 'spotty'],
  stars: ['star', 'stars', 'starry'],
  leaves: ['leaf', 'leaves', 'foliage', 'botanical', 'nature', 'tropical'],
  shells: ['shell', 'shells', 'cowrie', 'cowries'],
  checks: ['check', 'checks', 'checked', 'plaid', 'kente', 'woven', 'strip'],
  'mud cloth': ['mud', 'mudcloth', 'bogolan'],
  abstract: ['abstract', 'organic', 'shapes', 'artistic'],
  heritage: ['heritage', 'traditional', 'tradition', 'classic', 'cultural'],
  sun: ['sun', 'sunburst', 'medallion', 'medallions', 'radiating'],
};

export const CATEGORY_SYNONYMS = {
  traditional: ['traditional', 'heritage', 'classic', 'ceremony', 'ceremonial', 'zambian', 'independence'],
  modern: ['modern', 'contemporary', 'fashion', 'trendy', 'stylish', 'wax'],
  wedding: ['wedding', 'weddings', 'celebration', 'celebrations', 'party', 'kitchen', 'bride', 'bridal', 'engagement', 'anniversary'],
  floral: ['floral', 'flowers', 'flower'],
  geometric: ['geometric', 'geometry'],
  children: ['children', 'childrens', 'child', 'kids', 'kid', 'baby', 'school', 'little'],
  premium: ['premium', 'designer', 'luxury', 'luxurious', 'special', 'limited', 'sateen'],
  other: ['mud', 'mudcloth', 'kente', 'strip', 'woven', 'west'],
};

export const STOP_WORDS = new Set([
  'a', 'an', 'and', 'the', 'with', 'for', 'of', 'in', 'on', 'or', 'to', 'some', 'any', 'i', 'im', 'am', 'looking',
  'want', 'would', 'like', 'need', 'something', 'that', 'is', 'are', 'my', 'me', 'please', 'find', 'show',
  'fabric', 'fabrics', 'material', 'materials', 'chitenge', 'chitenges', 'print', 'prints', 'pattern', 'patterns',
  'design', 'designs', 'colour', 'colours', 'color', 'colors', 'suitable', 'perfect', 'nice', 'beautiful', 'by', 'from',
]);

export function tokenize(text) {
  return String(text || '')
    .toLowerCase()
    .normalize('NFKD').replace(/[̀-ͯ]/g, '')
    .replace(/['’]s\b/g, 's')
    .split(/[^a-z0-9-]+/)
    .filter(Boolean);
}

/** Expand a word to itself plus the canonical terms it is a synonym for. */
export function expandTerm(word) {
  const out = new Set([word]);
  if (word.length > 3 && word.endsWith('s')) out.add(word.slice(0, -1));
  for (const map of [COLOUR_SYNONYMS, PATTERN_SYNONYMS, CATEGORY_SYNONYMS]) {
    for (const [canonical, words] of Object.entries(map)) if (words.includes(word)) out.add(canonical);
  }
  return [...out];
}
