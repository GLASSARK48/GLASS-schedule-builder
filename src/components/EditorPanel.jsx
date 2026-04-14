import { useState, useRef, useEffect } from 'react'
import { toPng } from 'html-to-image'
import { MEMBERS, TAGS, PLATFORMS, DAYS, PALETTES, SCHEDULE_THEMES, TITLE_BLENDS } from '../data/members'
import { getWeekNumber, formatDate } from '../data/defaults'
import { JP_FONT_OPTIONS, JP_WEIGHT_OPTIONS, DEFAULT_FONTS } from '../data/fonts'
import DayEditor from './DayEditor'

export default function EditorPanel({ schedule, updateSchedule, updateDay, previewRef, resetSchedule }) {
  const fileRef = useRef(null)
  const isH = schedule.orientation === 'landscape'
  const [advancedOpen, setAdvancedOpen] = useState(false)
  const [iconPosOpen, setIconPosOpen] = useState({}) // { memberId: true/false }
  const adv = schedule.advanced || {}
  const iconPos = schedule.iconPositions || {}

  // === Week date recalc ===
  const recalcDates = (startStr) => {
    const start = new Date(startStr)
    const days = schedule.days.map((day, i) => {
      const d = new Date(start)
      d.setDate(start.getDate() + i)
      return { ...day, date: formatDate(d) }
    })
    const end = new Date(start)
    end.setDate(start.getDate() + 6)
    updateSchedule({ startDate: startStr, endDate: formatDate(end), weekNumber: getWeekNumber(start), days })
  }

  // === Image upload helper ===
  const handleImageUpload = (callback) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = (e) => {
      const file = e.target.files[0]
      if (!file) return
      const reader = new FileReader()
      reader.onload = (ev) => callback(ev.target.result)
      reader.readAsDataURL(file)
    }
    input.click()
  }

  // === Font CSS pre-embed for export ===
  // Only embed Latin/essential fonts (skip CJK subsets which are huge)
  // Latin fonts: Syne, Outfit, Inter, JetBrains Mono, Orbitron, Instrument Serif
  const fontCSSRef = useRef(null)
  const LATIN_FONTS_URL = 'https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Instrument+Serif:ital@0;1&family=Outfit:wght@300;400;500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500;700&family=Orbitron:wght@400;500;700;900&display=swap'
  useEffect(() => {
    const embedFonts = async () => {
      try {
        await document.fonts.ready
        // 1. Fetch Latin font CSS only (small, fast)
        const cssResp = await fetch(LATIN_FONTS_URL)
        let fontCSS = await cssResp.text()

        // 2. Collect local @font-face rules (FOT-NewCezanne, FOT-Matisse)
        const localRules = []
        for (const ss of document.styleSheets) {
          try {
            for (const rule of ss.cssRules) {
              if (rule.type === CSSRule.FONT_FACE_RULE) localRules.push(rule.cssText)
            }
          } catch { /* cross-origin, skip */ }
        }
        fontCSS += '\n' + localRules.join('\n')

        // 3. Convert all font URLs to base64 data URIs
        const urls = [...new Set([...fontCSS.matchAll(/url\((https?:\/\/[^)]+)\)/g)].map(m => m[1]))]
        console.log('Embedding', urls.length, 'Latin font files...')
        let ok = 0
        for (const url of urls) {
          try {
            const r = await fetch(url)
            if (!r.ok) continue
            const blob = await r.blob()
            const b64 = await new Promise(res => {
              const rd = new FileReader()
              rd.onloadend = () => res(rd.result)
              rd.readAsDataURL(blob)
            })
            fontCSS = fontCSS.split(url).join(b64)
            ok++
          } catch { /* skip */ }
        }

        // 4. Also fetch CJK font CSS and append (URLs stay as-is, browser will fetch during render)
        const CJK_URL = 'https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700;900&family=Zen+Kaku+Gothic+New:wght@400;500;700;900&family=M+PLUS+1p:wght@400;500;700;800;900&family=Zen+Maru+Gothic:wght@400;500;700;900&family=Kosugi+Maru&family=Sawarabi+Gothic&family=Murecho:wght@400;500;700;800;900&family=Dela+Gothic+One&family=Rampart+One&family=RocknRoll+One&display=swap'
        try {
          const cjkResp = await fetch(CJK_URL)
          const cjkCSS = await cjkResp.text()
          fontCSS += '\n' + cjkCSS
        } catch { /* CJK CSS fetch failed, continue */ }

        fontCSSRef.current = fontCSS
        console.log(`Fonts embedded: ${ok}/${urls.length}, ${Math.round(fontCSS.length / 1024)} KB`)
      } catch (e) {
        console.warn('Font embed failed:', e)
      }
    }
    embedFonts()
  }, [])

  // === PNG Export (fixed 1080x1440) ===
  const [exporting, setExporting] = useState(false)
  const handleExportPNG = async () => {
    if (!previewRef.current || exporting) return
    setExporting(true)
    const el = previewRef.current
    const wrapper = el.parentElement // .preview-scale-wrapper
    const panel = wrapper.parentElement // .preview-panel

    // Save originals
    const saved = {
      elTransform: el.style.transform,
      elOrigin: el.style.transformOrigin,
      wrapW: wrapper.style.width,
      wrapH: wrapper.style.height,
      wrapOvf: wrapper.style.overflow,
      wrapPos: wrapper.style.position,
      panelOvf: panel.style.overflow,
      panelW: panel.style.width,
      panelMinW: panel.style.minWidth,
    }

    // Expand everything to full 1080x1440 — no clipping
    el.style.transform = 'none'
    el.style.transformOrigin = 'top left'
    wrapper.style.width = '1080px'
    wrapper.style.height = '1440px'
    wrapper.style.overflow = 'visible'
    wrapper.style.position = 'relative'
    panel.style.overflow = 'visible'
    panel.style.width = '1080px'
    panel.style.minWidth = '1080px'

    // Triple rAF to ensure full layout settle
    await new Promise(r => requestAnimationFrame(() =>
      requestAnimationFrame(() => requestAnimationFrame(r))
    ))

    try {
      const opts = {
        width: 1080,
        height: 1440,
        pixelRatio: 1,
        style: {
          transform: 'none',
          transformOrigin: 'top left',
        },
        skipAutoScale: true,
      }
      // Use pre-embedded font CSS if available
      if (fontCSSRef.current) {
        opts.fontEmbedCSS = fontCSSRef.current
      }
      // Double render: first pass caches resources, second produces accurate output
      await toPng(el, opts)
      const dataUrl = await toPng(el, opts)

      const link = document.createElement('a')
      const suffix = isH ? 'h' : 'v'
      link.download = `chronova_schedule_w${schedule.weekNumber}_${suffix}.png`
      link.href = dataUrl
      link.click()
    } catch (err) {
      console.error('Export failed:', err)
      alert('Export failed: ' + err.message)
    } finally {
      el.style.transform = saved.elTransform
      el.style.transformOrigin = saved.elOrigin
      wrapper.style.width = saved.wrapW
      wrapper.style.height = saved.wrapH
      wrapper.style.overflow = saved.wrapOvf
      wrapper.style.position = saved.wrapPos
      panel.style.overflow = saved.panelOvf
      panel.style.width = saved.panelW
      panel.style.minWidth = saved.panelMinW
      setExporting(false)
    }
  }

  // === JSON import/export ===
  const handleExportJSON = () => {
    const data = { ...schedule }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `chronova_schedule_w${schedule.weekNumber}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImportJSON = () => { fileRef.current?.click() }
  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        updateSchedule(() => JSON.parse(ev.target.result))
      } catch { alert('Invalid JSON') }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  // === Advanced field helper ===
  const advField = (label, key, min, max, step = 1) => (
    <div className="adv-field">
      <label>{label}</label>
      <div className="adv-field-row">
        <input
          type="range"
          min={min} max={max} step={step}
          value={adv[key] ?? min}
          onChange={e => updateSchedule(prev => ({
            ...prev,
            advanced: { ...prev.advanced, [key]: parseFloat(e.target.value) }
          }))}
        />
        <span className="adv-val">{adv[key] ?? min}</span>
      </div>
    </div>
  )

  return (
    <div className="editor-panel">
      <div className="panel-header">
        <h1>SCHEDULE BUILDER</h1>
        <div className="sub">GLASS 2026 — TOOL</div>
      </div>

      {/* Orientation toggle */}
      <div className="section">
        <div className="section-title">// レイアウト</div>
        <div className="orient-toggle">
          <button
            className={`orient-btn ${!isH ? 'active' : ''}`}
            onClick={() => updateSchedule({ orientation: 'portrait' })}
          >縦 VERTICAL</button>
          <button
            className={`orient-btn ${isH ? 'active' : ''}`}
            onClick={() => updateSchedule({ orientation: 'landscape' })}
          >横 HORIZONTAL</button>
        </div>
      </div>

      {/* Week settings */}
      <div className="section">
        <div className="section-title">// 週設定</div>
        <div className="field-row">
          <div className="field">
            <label>週の開始日 (月曜)</label>
            <input type="date" value={schedule.startDate} onChange={e => recalcDates(e.target.value)} />
          </div>
          <div className="field">
            <label>週番号</label>
            <input type="number" value={schedule.weekNumber} readOnly style={{ opacity: 0.5 }} />
          </div>
        </div>
      </div>

      {/* Schedule title */}
      <div className="section">
        <div className="section-title">// タイトル文字</div>
        <div className="field">
          <label>表示タイトル</label>
          <input
            type="text"
            value={schedule.scheduleTitle || 'SCHEDULE'}
            onChange={e => updateSchedule({ scheduleTitle: e.target.value })}
            placeholder="SCHEDULE"
          />
        </div>
      </div>

      {/* Palette */}
      <div className="section">
        <div className="section-title">// パレット</div>
        <div className="palette-grid">
          {Object.values(PALETTES).map(p => (
            <div
              key={p.id}
              className={`palette-chip ${schedule.palette === p.id ? 'active' : ''}`}
              onClick={() => updateSchedule({ palette: p.id })}
              title={p.name}
            >
              {p.colors.map((c, i) => (
                <div key={i} className="swatch" style={{ background: c }} />
              ))}
              <span className="pid">{p.id}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Font scale + icon opacity */}
      <div className="section">
        <div className="section-title">// 表示設定</div>
        <div className="field">
          <label>スケジュールテーマ</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 4 }}>
            {SCHEDULE_THEMES.map(t => (
              <button
                key={t.id}
                className={`btn btn-sm ${schedule.scheduleTheme === t.id ? 'active' : ''}`}
                style={{
                  background: t.bg,
                  color: t.text,
                  border: schedule.scheduleTheme === t.id ? `2px solid ${t.text}` : `1px solid ${t.border}`,
                  fontSize: 9,
                  padding: '3px 8px',
                  borderRadius: 2,
                }}
                onClick={() => updateSchedule({ scheduleTheme: t.id })}
              >{t.name}</button>
            ))}
          </div>
        </div>
        <div className="field">
          <label>文字サイズ — {Math.round((schedule.fontScale || 1) * 100)}%</label>
          <input
            type="range" min="0.6" max="1.6" step="0.05"
            value={schedule.fontScale}
            onChange={e => updateSchedule({ fontScale: parseFloat(e.target.value) })}
            style={{ width: '100%' }}
          />
        </div>
        <div className="field">
          <label>アイコン透明度 — {Math.round((schedule.iconOpacity ?? 0.25) * 100)}%</label>
          <input
            type="range" min="0" max="1" step="0.05"
            value={schedule.iconOpacity ?? 0.25}
            onChange={e => updateSchedule({ iconOpacity: parseFloat(e.target.value) })}
            style={{ width: '100%' }}
          />
        </div>
      </div>

      {/* JP Font picker */}
      <div className="section">
        <div className="section-title">// 日本語フォント</div>
        <div className="field">
          <label>フォント</label>
          <select
            value={(schedule.fonts || {}).fontJp || DEFAULT_FONTS.fontJp}
            onChange={e => updateSchedule(prev => ({
              ...prev,
              fonts: { ...(prev.fonts || DEFAULT_FONTS), fontJp: e.target.value }
            }))}
            style={{
              width: '100%',
              background: 'var(--card2)',
              color: 'var(--t)',
              border: '1px solid var(--border)',
              padding: '5px 8px',
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 11,
            }}
          >
            {JP_FONT_OPTIONS.map(opt => (
              <option key={opt.id} value={opt.id}>{opt.name}</option>
            ))}
          </select>
        </div>
        <div className="field" style={{ marginTop: 6 }}>
          <label>太さ — {(schedule.fonts || {}).fontJpWeight ?? DEFAULT_FONTS.fontJpWeight}</label>
          <select
            value={(schedule.fonts || {}).fontJpWeight ?? DEFAULT_FONTS.fontJpWeight}
            onChange={e => updateSchedule(prev => ({
              ...prev,
              fonts: { ...(prev.fonts || DEFAULT_FONTS), fontJpWeight: parseInt(e.target.value) }
            }))}
            style={{
              width: '100%',
              background: 'var(--card2)',
              color: 'var(--t)',
              border: '1px solid var(--border)',
              padding: '5px 8px',
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 11,
            }}
          >
            {JP_WEIGHT_OPTIONS.map(w => (
              <option key={w.value} value={w.value}>{w.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Title image */}
      <div className="section">
        <div className="section-title">// タイトル画像</div>
        <div className="image-upload-row">
          {schedule.titleImage ? (
            <div className="image-thumb" style={{ backgroundImage: `url(${schedule.titleImage})` }}>
              <button className="thumb-remove" onClick={() => updateSchedule({ titleImage: null })}>&times;</button>
            </div>
          ) : (
            <div className="image-placeholder" onClick={() => handleImageUpload(src => updateSchedule({ titleImage: src }))}>
              + アップロード
            </div>
          )}
          <div style={{ fontSize: 10, color: 'var(--t3)', fontFamily: "'JetBrains Mono', monospace" }}>
            1080 x ~350px recommended
          </div>
        </div>
        <div className="field" style={{ marginTop: 8 }}>
          <label>合成モード</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3, marginTop: 4 }}>
            {TITLE_BLENDS.map(b => (
              <button
                key={b.id}
                className={`btn btn-sm ${(schedule.titleBlend || 'dark') === b.id ? 'active' : ''}`}
                style={{
                  fontSize: 9,
                  padding: '3px 7px',
                  borderRadius: 2,
                  border: (schedule.titleBlend || 'dark') === b.id ? '1px solid var(--t2)' : '1px solid var(--border)',
                  background: (schedule.titleBlend || 'dark') === b.id ? 'var(--card2)' : 'transparent',
                  color: (schedule.titleBlend || 'dark') === b.id ? 'var(--t)' : 'var(--t3)',
                }}
                onClick={() => updateSchedule({ titleBlend: b.id })}
                title={b.desc}
              >{b.name}</button>
            ))}
          </div>
        </div>
        <div className="field" style={{ marginTop: 8 }}>
          <label>タイトル画像 透明度 — {Math.round((schedule.titleOverlay ?? 0.55) * 100)}%</label>
          <input
            type="range" min="0" max="1" step="0.05"
            value={schedule.titleOverlay ?? 0.55}
            onChange={e => updateSchedule({ titleOverlay: parseFloat(e.target.value) })}
            style={{ width: '100%' }}
          />
        </div>
      </div>

      {/* Member icons */}
      <div className="section">
        <div className="section-title">// メンバーアイコン</div>
        <div className="member-icons-grid">
          {MEMBERS.map(m => (
            <div key={m.id} className="member-icon-item">
              <div
                className="member-icon-preview"
                style={{
                  borderColor: m.color,
                  backgroundImage: schedule.memberIcons[m.id] ? `url(${schedule.memberIcons[m.id]})` : 'none',
                }}
                onClick={() => handleImageUpload(src =>
                  updateSchedule(prev => ({
                    ...prev,
                    memberIcons: { ...prev.memberIcons, [m.id]: src }
                  }))
                )}
              >
                {!schedule.memberIcons[m.id] && <span style={{ fontSize: 8, color: 'var(--t3)' }}>+</span>}
              </div>
              <span className="member-icon-label" style={{ color: m.color }}>{m.en.slice(0, 3)}</span>
              <div style={{ display: 'flex', gap: 2 }}>
                {schedule.memberIcons[m.id] && (
                  <button
                    className="btn btn-sm"
                    style={{ fontSize: 7, padding: '1px 4px' }}
                    onClick={() => setIconPosOpen(prev => ({ ...prev, [m.id]: !prev[m.id] }))}
                    title="位置調整"
                  >⚙</button>
                )}
                {schedule.memberIcons[m.id] && (
                  <button
                    className="btn btn-sm"
                    style={{ fontSize: 7, padding: '1px 4px' }}
                    onClick={() => updateSchedule(prev => ({
                      ...prev,
                      memberIcons: { ...prev.memberIcons, [m.id]: null }
                    }))}
                  >&times;</button>
                )}
              </div>
            </div>
          ))}
        </div>
        {/* Per-icon position controls */}
        {MEMBERS.map(m => {
          if (!iconPosOpen[m.id] || !schedule.memberIcons[m.id]) return null
          const pos = iconPos[m.id] || { x: 50, y: 50, scale: 100 }
          const updatePos = (field, val) => updateSchedule(prev => ({
            ...prev,
            iconPositions: {
              ...prev.iconPositions,
              [m.id]: { ...(prev.iconPositions?.[m.id] || { x: 50, y: 50, scale: 100 }), [field]: val }
            }
          }))
          return (
            <div key={m.id} className="icon-pos-panel" style={{ marginTop: 6, padding: '6px 8px', background: 'var(--card2)', border: `1px solid ${m.color}33`, borderRadius: 2 }}>
              <div style={{ fontSize: 9, fontFamily: "'JetBrains Mono', monospace", color: m.color, letterSpacing: 1, marginBottom: 4 }}>
                {m.jp} ({m.en}) — 位置調整
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: 8, color: 'var(--t3)' }}>X: {pos.x}%</label>
                  <input type="range" min="0" max="100" step="1" value={pos.x}
                    onChange={e => updatePos('x', parseInt(e.target.value))}
                    style={{ width: '100%' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: 8, color: 'var(--t3)' }}>Y: {pos.y}%</label>
                  <input type="range" min="0" max="100" step="1" value={pos.y}
                    onChange={e => updatePos('y', parseInt(e.target.value))}
                    style={{ width: '100%' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: 8, color: 'var(--t3)' }}>拡大: {pos.scale}%</label>
                  <input type="range" min="20" max="600" step="5" value={pos.scale}
                    onChange={e => updatePos('scale', parseInt(e.target.value))}
                    style={{ width: '100%' }} />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Fanmeeting */}
      <div className="section">
        <div className="section-title">// ファンミーティング (土曜)</div>
        <div className="toggle-row">
          <span className="toggle-label">ファンミ有効</span>
          <div
            className={`toggle ${schedule.fanmeeting.enabled ? 'on' : ''}`}
            onClick={() => updateSchedule(prev => ({
              ...prev,
              fanmeeting: { ...prev.fanmeeting, enabled: !prev.fanmeeting.enabled }
            }))}
          >
            <div className="knob" />
          </div>
        </div>
        {schedule.fanmeeting.enabled && (
          <div className="field-row" style={{ marginTop: 8 }}>
            <div className="field">
              <label>時間</label>
              <input type="time" value={schedule.fanmeeting.time}
                onChange={e => updateSchedule(prev => ({ ...prev, fanmeeting: { ...prev.fanmeeting, time: e.target.value } }))} />
            </div>
            <div className="field">
              <label>タイトル</label>
              <input type="text" value={schedule.fanmeeting.title}
                onChange={e => updateSchedule(prev => ({ ...prev, fanmeeting: { ...prev.fanmeeting, title: e.target.value } }))} />
            </div>
          </div>
        )}
      </div>

      {/* Day editors */}
      <div className="section">
        <div className="section-title">// 日別スケジュール</div>
        {schedule.days.map((day, i) => (
          <DayEditor
            key={i}
            dayIndex={i}
            dayLabel={DAYS[i]}
            day={day}
            updateDay={updateDay}
            isSaturday={i === 5}
            fanmeeting={schedule.fanmeeting}
          />
        ))}
      </div>

      {/* Snap image */}
      <div className="section">
        <div className="section-title">// スナップ画像</div>
        <div className="image-upload-row">
          {schedule.snapImage ? (
            <div className="image-thumb" style={{ backgroundImage: `url(${schedule.snapImage})`, height: 120 }}>
              <button className="thumb-remove" onClick={() => updateSchedule({ snapImage: null })}>&times;</button>
            </div>
          ) : (
            <div className="image-placeholder" onClick={() => handleImageUpload(src => updateSchedule({ snapImage: src }))}>
              + アップロード
            </div>
          )}
          <div style={{ fontSize: 10, color: 'var(--t3)', fontFamily: "'JetBrains Mono', monospace" }}>
            1080 x ~500px recommended
          </div>
        </div>
      </div>

      {/* Advanced mode */}
      <div className="section">
        <div className="section-title" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}
          onClick={() => setAdvancedOpen(!advancedOpen)}>
          <span className={`collapse-arrow ${advancedOpen ? 'open' : ''}`}>▸</span>
          // 詳細設定
        </div>
        {advancedOpen && (
          <div className="adv-grid">
            <div className="adv-group">
              <div className="adv-group-title">タイトルゾーン</div>
              {advField('タイトル', 'titleSize', 20, 80)}
              {advField('ラベル', 'labelSize', 6, 20)}
              {advField('サブタイトル', 'subSize', 6, 24)}
              {advField('日付', 'dateSize', 6, 30)}
            </div>
            <div className="adv-group">
              <div className="adv-group-title">横モード スロット</div>
              {advField('JP名', 'slotJpSize', 8, 32)}
              {advField('EN名', 'slotEnSize', 6, 24)}
              {advField('タグ', 'slotTagSize', 6, 18)}
              {advField('時刻', 'slotTimeSize', 8, 36)}
              {advField('曜日', 'dayDowSize', 8, 28)}
              {advField('日付', 'dayDateSize', 6, 22)}
            </div>
            <div className="adv-group">
              <div className="adv-group-title">縦モード スロット</div>
              {advField('JP名', 'vSlotJpSize', 8, 32)}
              {advField('EN名', 'vSlotEnSize', 6, 24)}
              {advField('タグ', 'vSlotTagSize', 6, 18)}
              {advField('時刻', 'vSlotTimeSize', 8, 36)}
              {advField('曜日', 'vDayDowSize', 8, 28)}
              {advField('日付', 'vDayDateSize', 6, 22)}
            </div>
            <div className="adv-group">
              <div className="adv-group-title">アイコン</div>
              {advField('配信アイコン', 'platIconSize', 12, 48)}
            </div>
          </div>
        )}
      </div>

      {/* Data */}
      <div className="section">
        <div className="section-title">// データ管理</div>
        <div className="json-actions">
          <button className="btn btn-sm" onClick={handleExportJSON}>保存</button>
          <button className="btn btn-sm" onClick={handleImportJSON}>読込</button>
          <button className="btn btn-sm" onClick={() => {
            if (confirm('リセットしますか？画像含め全てが初期化されます')) resetSchedule()
          }}>リセット</button>
          <input ref={fileRef} type="file" accept=".json" style={{ display: 'none' }} onChange={handleFileChange} />
        </div>
        <div style={{ marginTop: 8, fontFamily: "'JetBrains Mono', monospace", fontSize: 8, letterSpacing: 1, color: '#555568' }}>
          AUTO-SAVE: ON (localStorage)
        </div>
      </div>

      {/* Export */}
      <div className="actions-bar">
        <button className="btn btn-accent" onClick={handleExportPNG} disabled={exporting} style={{ flex: 1, opacity: exporting ? 0.5 : 1 }}>
          {exporting ? 'エクスポート中...' : 'EXPORT PNG (1080x1440)'}
        </button>
      </div>
    </div>
  )
}
