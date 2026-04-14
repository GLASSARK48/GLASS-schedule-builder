import { useState, useCallback, useRef, useEffect } from 'react'
import { createDefaultSchedule } from './data/defaults'
import EditorPanel from './components/EditorPanel'
import PreviewPanel from './components/PreviewPanel'

const STORAGE_KEY = 'chronova-schedule-v1'

function loadSavedSchedule() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const saved = JSON.parse(raw)
      // Merge with defaults to pick up any new fields
      const defaults = createDefaultSchedule()
      return { ...defaults, ...saved }
    }
  } catch (e) {
    console.warn('Failed to load saved schedule:', e)
  }
  return createDefaultSchedule()
}

export default function App() {
  const [schedule, setSchedule] = useState(loadSavedSchedule)
  const previewRef = useRef(null)
  const scheduleRef = useRef(null)

  // Auto-save to localStorage on every change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(schedule))
    } catch (e) {
      // localStorage full (DataURL images can be large)
      console.warn('Auto-save failed:', e)
    }
  }, [schedule])

  const updateSchedule = useCallback((updater) => {
    setSchedule(prev => typeof updater === 'function' ? updater(prev) : { ...prev, ...updater })
  }, [])

  const updateDay = useCallback((dayIndex, updater) => {
    setSchedule(prev => {
      const days = [...prev.days]
      days[dayIndex] = typeof updater === 'function' ? updater(days[dayIndex]) : { ...days[dayIndex], ...updater }
      return { ...prev, days }
    })
  }, [])

  const resetSchedule = useCallback(() => {
    const fresh = createDefaultSchedule()
    setSchedule(fresh)
    localStorage.removeItem(STORAGE_KEY)
  }, [])

  return (
    <div className="app">
      <EditorPanel
        schedule={schedule}
        updateSchedule={updateSchedule}
        updateDay={updateDay}
        previewRef={previewRef}
        scheduleRef={scheduleRef}
        resetSchedule={resetSchedule}
      />
      <PreviewPanel schedule={schedule} previewRef={previewRef} scheduleRef={scheduleRef} />
    </div>
  )
}
