import { useState } from 'react'
import { MEMBERS, TAGS, PLATFORMS } from '../data/members'

export default function DayEditor({ dayIndex, dayLabel, day, updateDay, isSaturday, fanmeeting }) {
  const [open, setOpen] = useState(false)

  const addSlot = () => {
    updateDay(dayIndex, prev => ({
      ...prev,
      slots: [...prev.slots, {
        memberId: MEMBERS[0].id,
        time: '21:00',
        tag: '',
        platform: 'youtube',
        title: '',
      }]
    }))
    setOpen(true)
  }

  const removeSlot = (slotIdx) => {
    updateDay(dayIndex, prev => ({
      ...prev,
      slots: prev.slots.filter((_, i) => i !== slotIdx)
    }))
  }

  const updateSlot = (slotIdx, field, value) => {
    updateDay(dayIndex, prev => ({
      ...prev,
      slots: prev.slots.map((s, i) => i === slotIdx ? { ...s, [field]: value } : s)
    }))
  }

  const dateShort = day.date ? day.date.slice(5).replace('-', '.') : ''
  const isOff = day.slots.length === 0 && !day.dayOff

  return (
    <div className="day-editor">
      <div className="day-editor-header" onClick={() => setOpen(!open)}>
        <div className="day-label">
          <span className={`collapse-arrow ${open ? 'open' : ''}`}>&#9654;</span>
          <span className="dow">{dayLabel}</span>
          <span className="date">{dateShort}</span>
          {day.dayOff && <span className="fm-indicator" style={{ background: '#555568' }}>休</span>}
          {!day.dayOff && day.slots.length > 0 && day.slots.map((s, i) => {
            const m = MEMBERS.find(mm => mm.id === s.memberId)
            return <span key={i} className="member-dot" style={{ background: m?.color }} />
          })}
          {isSaturday && fanmeeting.enabled && (
            <span className="fm-indicator">FM</span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {day.dayOff && <span className="slot-count">休</span>}
          {!day.dayOff && isOff && <span className="slot-count">OFF</span>}
          {!day.dayOff && !isOff && <span className="slot-count">{day.slots.length}</span>}
          <button className="btn btn-sm" onClick={e => { e.stopPropagation(); addSlot() }}>+</button>
        </div>
      </div>

      {open && (
        <div className="day-editor-body">
          <div className="toggle-row" style={{ marginBottom: 6 }}>
            <span className="toggle-label" style={{ fontSize: 10 }}>お休み (NO STREAMING)</span>
            <div
              className={`toggle ${day.dayOff ? 'on' : ''}`}
              style={{ transform: 'scale(0.8)' }}
              onClick={() => updateDay(dayIndex, prev => ({ ...prev, dayOff: !prev.dayOff }))}
            >
              <div className="knob" />
            </div>
          </div>
          {!day.dayOff && day.slots.length === 0 && (
            <div style={{ padding: '12px 0', color: 'var(--t3)', fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: 1 }}>
              OFF — 配信なし
            </div>
          )}
          {day.slots.map((slot, si) => (
            <div key={si} className="slot-editor">
              <button className="remove-slot" onClick={() => removeSlot(si)} title="Remove">&times;</button>
              <div className="field-row">
                <div className="field">
                  <label>メンバー</label>
                  <select value={slot.memberId} onChange={e => updateSlot(si, 'memberId', e.target.value)}>
                    {MEMBERS.map(m => (
                      <option key={m.id} value={m.id}>{m.en} ({m.jp})</option>
                    ))}
                  </select>
                </div>
                <div className="field">
                  <label>時間</label>
                  <input type="time" value={slot.time} onChange={e => updateSlot(si, 'time', e.target.value)} />
                </div>
              </div>
              <div className="field-row">
                <div className="field">
                  <label>タグ</label>
                  <select value={slot.tag} onChange={e => updateSlot(si, 'tag', e.target.value)}>
                    <option value="">なし</option>
                    {TAGS.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div className="field">
                  <label>配信先</label>
                  <select value={slot.platform} onChange={e => updateSlot(si, 'platform', e.target.value)}>
                    {PLATFORMS.map(p => (
                      <option key={p.id} value={p.id}>{p.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              {slot.platform === 'other' && (
                <div className="field">
                  <label>カスタムアイコン</label>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    {slot.customIcon ? (
                      <>
                        <img src={slot.customIcon} alt="" style={{ width: 28, height: 28, objectFit: 'contain', borderRadius: 2, border: '1px solid var(--border)' }} />
                        <button className="btn btn-sm" style={{ fontSize: 7, padding: '1px 4px' }}
                          onClick={() => updateSlot(si, 'customIcon', null)}>&times;</button>
                      </>
                    ) : (
                      <button className="btn btn-sm" onClick={() => {
                        const input = document.createElement('input')
                        input.type = 'file'; input.accept = 'image/*'
                        input.onchange = (e) => {
                          const file = e.target.files[0]; if (!file) return
                          const reader = new FileReader()
                          reader.onload = (ev) => updateSlot(si, 'customIcon', ev.target.result)
                          reader.readAsDataURL(file)
                        }
                        input.click()
                      }}>+ アイコン</button>
                    )}
                  </div>
                  {slot.customIcon && (
                    <div style={{ marginTop: 4 }}>
                      <label style={{ fontSize: 8, color: 'var(--t3)' }}>サイズ: {slot.customIconScale || 100}%</label>
                      <input type="range" min="50" max="200" step="5"
                        value={slot.customIconScale || 100}
                        onChange={e => updateSlot(si, 'customIconScale', parseInt(e.target.value))}
                        style={{ width: '100%' }} />
                    </div>
                  )}
                </div>
              )}
              <div className="field">
                <label>配信タイトル (任意)</label>
                <input
                  type="text"
                  value={slot.title}
                  placeholder="配信タイトル..."
                  onChange={e => updateSlot(si, 'title', e.target.value)}
                />
              </div>
            </div>
          ))}
          <button className="btn btn-sm" onClick={addSlot} style={{ width: '100%', marginTop: 4 }}>
            + 配信を追加
          </button>
        </div>
      )}
    </div>
  )
}
