export const MEMBERS = [
  // { id: 'arkhe', en: 'ARKHE', jp: 'ARKHE', color: '#FF2244', r: 255, g: 34, b: 68 },  // 一旦外す
  { id: 'charlo', en: 'CHARLO', jp: 'しゃるろ', color: '#3D5AF1', r: 61, g: 90, b: 241 },
  { id: 'kaname', en: 'KANAME', jp: 'かなめ', color: '#00E5A0', r: 0, g: 229, b: 160 },
  { id: 'urumiya', en: 'URUMIYA', jp: 'うるみや', color: '#FF6B35', r: 255, g: 107, b: 53 },
  { id: 'shino', en: 'SHINO', jp: 'しの', color: '#7B61FF', r: 123, g: 97, b: 255 },
  { id: 'remu', en: 'REMU', jp: 'れむ', color: '#FF69B4', r: 255, g: 105, b: 180 },
]

export const TAGS = ['TALK', 'GAME', 'SING', 'ASMR', 'COLLAB', 'CRAFT', 'CHAT', 'WATCH', 'DRAW', 'OTHER']

export const PLATFORMS = [
  { id: 'youtube', label: 'YouTube', icon: '/icons/youtube.svg', iconScale: 1 },
  { id: 'twitcast', label: 'TwitCast', icon: '/icons/twitcast.png', iconScale: 1.35 },
  { id: 'other', label: 'その他', icon: null },
]

export const DAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']

// Japanese calendar style: weekdays neutral, SAT=blue, SUN=red
export const DAY_COLORS = [
  { color: '#c0c0c8', light: '#4a4a5a', r: 192, g: 192, b: 200 },  // MON
  { color: '#c0c0c8', light: '#4a4a5a', r: 192, g: 192, b: 200 },  // TUE
  { color: '#c0c0c8', light: '#4a4a5a', r: 192, g: 192, b: 200 },  // WED
  { color: '#c0c0c8', light: '#4a4a5a', r: 192, g: 192, b: 200 },  // THU
  { color: '#c0c0c8', light: '#4a4a5a', r: 192, g: 192, b: 200 },  // FRI
  { color: '#5588DD', light: '#2255AA', r: 85, g: 136, b: 221 },    // SAT — blue
  { color: '#DD4444', light: '#CC2222', r: 221, g: 68, b: 68 },     // SUN — red
]

export const PALETTES = {
  A: { id: 'A', name: 'CHROME VOID', colors: ['#0A0A0F', '#1A1A2E', '#C0C0C8', '#E8E8F0', '#FF3366'] },
  B: { id: 'B', name: 'SIGNAL RED', colors: ['#0D0D0D', '#FF2D2D', '#FF6B35', '#FFCC02'] },
  C: { id: 'C', name: 'GLACIER PULSE', colors: ['#070B10', '#0F1923', '#00D4FF', '#B388FF', '#E0F7FF'] },
  D: { id: 'D', name: 'RUST PROTOCOL', colors: ['#0C0A08', '#A65E2E', '#D4763A', '#F0D9B5'] },
  E: { id: 'E', name: 'DUAL AXIS', colors: ['#000000', '#222222', '#FF3366', '#3D5AF1', '#FFFFFF'] },
  F: { id: 'F', name: 'AURORA FADE', colors: ['#050510', '#00E5A0', '#B388FF', '#FFD700'] },
  G: { id: 'G', name: 'NOVA GRAPHITE', colors: ['#0B0B0F', '#4A4A5A', '#8888A0', '#F2F2F8'] },
  H: { id: 'H', name: 'ELECTRIC INDIGO', colors: ['#08080E', '#3D5AF1', '#7B61FF', '#C4B5FD'] },
  I: { id: 'I', name: 'SAND PROTOCOL', colors: ['#0E0C08', '#C9A96E', '#E8D5A3', '#F5EDE0'] },
  J: { id: 'J', name: 'DEEP SIGNAL', colors: ['#080810', '#FF2244', '#3D5AF1', '#C0C0C8'] },
}

// Schedule zone color themes
export const SCHEDULE_THEMES = [
  // ── ベーシック ──
  { id: 'dark',    name: 'ダーク',       bg: '#060608', card: '#0c0c12', text: '#e0e0e8', sub: '#8888a0', muted: '#555568', border: 'rgba(255,255,255,0.04)', dayBorder: 0.25 },
  { id: 'white',   name: 'ホワイト',     bg: '#f4f4f6', card: '#ffffff', text: '#1a1a2e', sub: '#5a5a70', muted: '#9999aa', border: 'rgba(0,0,0,0.08)', dayBorder: 0.15 },
  { id: 'navy',    name: 'ネイビー',     bg: '#0a1020', card: '#0f1830', text: '#c8d4e8', sub: '#6878a0', muted: '#3a4868', border: 'rgba(100,140,220,0.08)', dayBorder: 0.2 },
  { id: 'wine',    name: 'ワイン',       bg: '#180a10', card: '#220e18', text: '#e8d0d8', sub: '#a06878', muted: '#684050', border: 'rgba(220,80,120,0.08)', dayBorder: 0.2 },
  { id: 'forest',  name: 'フォレスト',   bg: '#081210', card: '#0e1c18', text: '#c8e8d8', sub: '#68a088', muted: '#3a6850', border: 'rgba(80,200,140,0.08)', dayBorder: 0.2 },
  { id: 'violet',  name: 'バイオレット', bg: '#100a1a', card: '#180e28', text: '#d8d0e8', sub: '#8878a8', muted: '#584880', border: 'rgba(140,100,240,0.08)', dayBorder: 0.2 },
  { id: 'amber',   name: 'アンバー',     bg: '#14100a', card: '#201a0e', text: '#e8dcc8', sub: '#a89068', muted: '#68583a', border: 'rgba(200,160,80,0.08)', dayBorder: 0.2 },
  { id: 'slate',   name: 'スレート',     bg: '#0e1014', card: '#161a20', text: '#d0d4dc', sub: '#7880a0', muted: '#484e68', border: 'rgba(120,140,180,0.08)', dayBorder: 0.2 },
  // ── 蛍光 / ネオン ──
  { id: 'neon-pink',  name: 'ネオンピンク',  bg: '#0a0008', card: '#140010', text: '#ff69b4', sub: '#ff3390', muted: '#80205a', border: 'rgba(255,105,180,0.1)', dayBorder: 0.3 },
  { id: 'neon-cyan',  name: 'ネオンシアン',  bg: '#000a0c', card: '#001418', text: '#00ffdd', sub: '#00ccaa', muted: '#206860', border: 'rgba(0,255,220,0.1)', dayBorder: 0.3 },
  { id: 'neon-lime',  name: 'ネオンライム',  bg: '#040a00', card: '#0a1400', text: '#b0ff00', sub: '#88cc00', muted: '#446600', border: 'rgba(176,255,0,0.1)', dayBorder: 0.3 },
  { id: 'neon-orange', name: 'ネオンオレンジ', bg: '#0c0600', card: '#180c00', text: '#ff8800', sub: '#cc6600', muted: '#664400', border: 'rgba(255,136,0,0.1)', dayBorder: 0.3 },
  // ── ノイズグラデーション ──
  { id: 'noise-void',   name: 'Nボイド',     bg: '#08080c', card: '#0e0e14', text: '#c0c0d0', sub: '#6868a0', muted: '#404060', border: 'rgba(100,100,180,0.06)', dayBorder: 0.2, noise: 'void' },
  { id: 'noise-ember',  name: 'Nエンバー',   bg: '#0c0804', card: '#161008', text: '#e8c8a0', sub: '#a07850', muted: '#604828', border: 'rgba(200,120,60,0.06)', dayBorder: 0.2, noise: 'ember' },
  { id: 'noise-aurora', name: 'Nオーロラ',   bg: '#040810', card: '#081018', text: '#b0e0e8', sub: '#5898a0', muted: '#305860', border: 'rgba(80,200,220,0.06)', dayBorder: 0.2, noise: 'aurora' },
  { id: 'noise-acid',   name: 'Nアシッド',   bg: '#060a04', card: '#0c1408', text: '#c8f0a0', sub: '#78a850', muted: '#486028', border: 'rgba(140,220,60,0.06)', dayBorder: 0.2, noise: 'acid' },
]

// Title image blend / overlay modes
export const TITLE_BLENDS = [
  { id: 'dark',        name: 'ダーク',       desc: '暗めグラデ' },
  { id: 'pal-overlay', name: 'パレット',     desc: 'パレット色overlay' },
  { id: 'pal-multi',   name: 'マルチプライ', desc: 'パレット色multiply' },
  { id: 'pal-screen',  name: 'スクリーン',   desc: 'パレット色screen' },
  { id: 'pal-soft',    name: 'ソフトライト', desc: 'パレット色soft-light' },
  { id: 'pal-hue',     name: '色相',         desc: 'パレット色hue' },
  { id: 'pal-bottom',  name: '下グラデ',     desc: '下部のみパレットグラデ' },
  { id: 'chrome',      name: 'クローム',     desc: 'クロームグラデ' },
  { id: 'none',        name: 'なし',         desc: 'オーバーレイなし' },
]
