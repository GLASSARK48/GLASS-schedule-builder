import { MEMBERS } from './members'
import { DEFAULT_FONTS } from './fonts'

export function createDefaultSchedule() {
  const today = new Date()
  const dayOfWeek = today.getDay()
  const monday = new Date(today)
  monday.setDate(today.getDate() - ((dayOfWeek + 6) % 7))

  const weekNum = getWeekNumber(monday)
  const days = []

  for (let i = 0; i < 7; i++) {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    days.push({
      date: formatDate(d),
      slots: [],
      dayOff: false,   // true = お休み / NO STREAMING
    })
  }

  // Default member icons (null = no image)
  const memberIcons = {}
  const iconPositions = {} // { memberId: { x: 50, y: 50, scale: 100 } }
  MEMBERS.forEach(m => {
    memberIcons[m.id] = null
    iconPositions[m.id] = { x: 50, y: 50, scale: 100 }
  })

  return {
    weekNumber: weekNum,
    startDate: formatDate(monday),
    endDate: formatDate(new Date(monday.getTime() + 6 * 86400000)),
    palette: 'A',
    orientation: 'portrait',   // 'portrait' | 'landscape'
    scheduleTitle: 'SCHEDULE', // editable title text
    days,
    fanmeeting: {
      enabled: false,
      time: '20:00',
      title: 'FANMEETING',
    },
    // Images
    titleImage: null,      // title zone background
    titleOverlay: 0.55,    // title overlay opacity (0~1)
    titleBlend: 'dark',    // title blend mode
    snapImage: null,       // single snap zone image
    memberIcons,           // per-member icon images
    // Schedule zone color theme
    scheduleTheme: 'dark',
    // Font selections per category
    fonts: { ...DEFAULT_FONTS },
    // Font size scale (1 = default)
    fontScale: 1.0,
    // Icon background opacity (0~1)
    iconOpacity: 0.25,
    // Per-member icon position/scale
    iconPositions,
    // Advanced per-element overrides
    advanced: {
      titleSize: 64,
      labelSize: 14,
      subSize: 16,
      dateSize: 18,
      slotJpSize: 20,
      slotEnSize: 12,
      slotTagSize: 11,
      slotTimeSize: 22,
      dayDowSize: 16,
      dayDateSize: 13,
      platIconSize: 28,
      vSlotJpSize: 18,
      vSlotEnSize: 11,
      vSlotTagSize: 10,
      vSlotTimeSize: 20,
      vDayDowSize: 14,
      vDayDateSize: 12,
    },
  }
}

export function getWeekNumber(d) {
  const oneJan = new Date(d.getFullYear(), 0, 1)
  return Math.ceil(((d - oneJan) / 86400000 + oneJan.getDay() + 1) / 7)
}

export function formatDate(d) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}
