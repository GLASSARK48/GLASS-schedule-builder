// Fixed font styles (not user-configurable)
export const FIXED_FONTS = {
  display: { fontFamily: "'Syne', sans-serif", fontWeight: 800 },
  time:    { fontFamily: "'Orbitron', sans-serif", fontWeight: 700 },
  label:   { fontFamily: "'Orbitron', sans-serif", fontWeight: 400 },
  name:    { fontFamily: "'Outfit', sans-serif", fontWeight: 500 },
}

// JP font options (user-configurable)
export const JP_FONT_OPTIONS = [
  { id: 'cezanne', name: 'FOT-NewCezanne Pro', css: "'FOT-NewCezanne Pro', sans-serif", local: true },
  { id: 'matisse', name: 'FOT-Matisse Pro', css: "'FOT-Matisse Pro', serif", local: true },
  { id: 'zen-kaku', name: 'Zen Kaku Gothic New', css: "'Zen Kaku Gothic New', sans-serif" },
  { id: 'mplus', name: 'M PLUS 1p', css: "'M PLUS 1p', sans-serif" },
  { id: 'noto', name: 'Noto Sans JP', css: "'Noto Sans JP', sans-serif" },
  { id: 'zen-maru', name: 'Zen Maru Gothic', css: "'Zen Maru Gothic', sans-serif" },
  { id: 'kosugi', name: 'Kosugi Maru', css: "'Kosugi Maru', sans-serif" },
  { id: 'sawarabi', name: 'Sawarabi Gothic', css: "'Sawarabi Gothic', sans-serif" },
  { id: 'murecho', name: 'Murecho', css: "'Murecho', sans-serif" },
  { id: 'dela', name: 'Dela Gothic One', css: "'Dela Gothic One', sans-serif" },
  { id: 'rampart', name: 'Rampart One', css: "'Rampart One', sans-serif" },
  { id: 'rocknroll', name: 'RocknRoll One', css: "'RocknRoll One', sans-serif" },
]

// JP weight options
export const JP_WEIGHT_OPTIONS = [
  { value: 300, label: '300 Light' },
  { value: 400, label: '400 Regular' },
  { value: 500, label: '500 Medium' },
  { value: 700, label: '700 Bold' },
  { value: 800, label: '800 ExtraBold' },
  { value: 900, label: '900 Black' },
]

// Default font selections
export const DEFAULT_FONTS = {
  fontJp: 'zen-kaku',
  fontJpWeight: 900,
}

// Helper: get JP font style
export function getJpFontStyle(fonts) {
  const fontId = fonts?.fontJp || DEFAULT_FONTS.fontJp
  const opt = JP_FONT_OPTIONS.find(o => o.id === fontId) || JP_FONT_OPTIONS[0]
  const weight = fonts?.fontJpWeight ?? DEFAULT_FONTS.fontJpWeight
  return { fontFamily: opt.css, fontWeight: weight }
}
