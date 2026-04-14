import { MEMBERS, DAYS, PALETTES, PLATFORMS, DAY_COLORS, SCHEDULE_THEMES, TITLE_BLENDS } from '../data/members'
import { FIXED_FONTS, getJpFontStyle } from '../data/fonts'
import './PreviewPanel.css'

const FM_GRAD = 'linear-gradient(180deg, #3D5AF1, #00E5A0, #FF6B35, #7B61FF, #FF69B4)'
const DAYS_JP = ['月', '火', '水', '木', '金', '土', '日']

export default function PreviewPanel({ schedule, previewRef, scheduleRef }) {
  const pal = PALETTES[schedule.palette] || PALETTES.A
  const fs = schedule.fontScale || 1
  const endShort = schedule.endDate.slice(5).replace('-', '.')
  const isH = schedule.orientation === 'landscape'
  const title = schedule.scheduleTitle || 'SCHEDULE'
  const iconOp = schedule.iconOpacity ?? 0.25
  const adv = schedule.advanced || {}
  const iconPos = schedule.iconPositions || {}
  const fDisplay = FIXED_FONTS.display
  const fTime = FIXED_FONTS.time
  const fLabel = FIXED_FONTS.label
  const fName = FIXED_FONTS.name
  const fJp = getJpFontStyle(schedule.fonts)
  const sTheme = SCHEDULE_THEMES.find(t => t.id === schedule.scheduleTheme) || SCHEDULE_THEMES[0]
  const themeVars = {
    '--st-bg': sTheme.bg,
    '--st-card': sTheme.card,
    '--st-text': sTheme.text,
    '--st-sub': sTheme.sub,
    '--st-muted': sTheme.muted,
    '--st-border': sTheme.border,
    '--st-day-border': sTheme.dayBorder,
  }

  const palVars = {
    '--pal0': pal.colors[0],
    '--pal1': pal.colors[1] || pal.colors[0],
    '--pal2': pal.colors[2] || '#888',
    '--pal3': pal.colors[3] || '#ccc',
    '--pal4': pal.colors[4] || pal.colors[2] || '#f36',
  }

  const titlePos = schedule.titleImagePos || { x: 50, y: 50, scale: 100 }
  const titleBg = schedule.titleImage
    ? `url(${schedule.titleImage}) ${titlePos.x}% ${titlePos.y}% / ${titlePos.scale === 100 ? 'cover' : titlePos.scale + '%'} no-repeat`
    : `linear-gradient(135deg, ${pal.colors[0]} 0%, ${pal.colors[1] || pal.colors[0]} 20%, ${pal.colors[2] || '#888'} 50%, ${pal.colors[3] || '#ccc'} 75%, ${pal.colors[4] || '#f36'} 100%)`

  const titleBlend = schedule.titleBlend || 'dark'
  const titleOp = schedule.titleOverlay ?? 0.55
  const palGrad = `linear-gradient(135deg, ${pal.colors[0]} 0%, ${pal.colors[1] || pal.colors[0]} 25%, ${pal.colors[2] || '#888'} 50%, ${pal.colors[3] || '#ccc'} 75%, ${pal.colors[4] || '#f36'} 100%)`
  const chromeGrad = 'linear-gradient(135deg, #2a2a3a 0%, #8888a0 20%, #e8e8f0 40%, #c0c0c8 50%, #4a4a5a 65%, #e0e0e8 80%, #8888a0 100%)'

  const getTitleOverlayLayers = () => {
    switch (titleBlend) {
      case 'none':
        return []
      case 'dark':
        return [{ background: 'linear-gradient(180deg, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.55) 100%)' }]
      case 'pal-overlay':
        return [
          { background: palGrad, mixBlendMode: 'overlay', opacity: 0.55 },
          { background: 'linear-gradient(180deg, transparent 30%, rgba(0,0,0,0.5) 100%)' },
        ]
      case 'pal-multi':
        return [
          { background: palGrad, mixBlendMode: 'multiply', opacity: 0.55 },
          { background: 'linear-gradient(180deg, transparent 40%, rgba(0,0,0,0.4) 100%)' },
        ]
      case 'pal-screen':
        return [
          { background: palGrad, mixBlendMode: 'screen', opacity: 0.4 },
          { background: 'linear-gradient(180deg, transparent 40%, rgba(0,0,0,0.55) 100%)' },
        ]
      case 'pal-soft':
        return [
          { background: palGrad, mixBlendMode: 'soft-light', opacity: 0.55 },
          { background: 'linear-gradient(180deg, transparent 30%, rgba(0,0,0,0.45) 100%)' },
        ]
      case 'pal-hue':
        return [
          { background: palGrad, mixBlendMode: 'hue', opacity: 0.55 },
          { background: 'linear-gradient(180deg, transparent 30%, rgba(0,0,0,0.5) 100%)' },
        ]
      case 'pal-bottom':
        return [
          { background: `linear-gradient(180deg, transparent 20%, ${pal.colors[0]}cc 60%, ${pal.colors[4] || pal.colors[2] || '#f36'}ee 100%)`, opacity: 0.55 },
        ]
      case 'chrome':
        return [
          { background: chromeGrad, mixBlendMode: 'overlay', opacity: 0.35 },
          { background: 'linear-gradient(180deg, transparent 30%, rgba(0,0,0,0.5) 100%)' },
        ]
      default:
        return [{ background: 'linear-gradient(180deg, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.55) 100%)' }]
    }
  }

  /* ═══ helper: icon bg style ═══ */
  const iconBgStyle = (mIcon, ip, mode) => {
    const base = {
      backgroundImage: `url(${mIcon})`,
      opacity: iconOp,
      backgroundRepeat: 'no-repeat',
    }
    if (ip.fade) {
      // Fade mode: contain + mask で四辺フェード
      const maskH = mode === 'h'
        ? 'linear-gradient(to right, transparent 0%, black 15%, black 85%, transparent 100%)'
        : 'linear-gradient(to right, transparent 0%, black 20%, black 80%, transparent 100%)'
      const maskV = mode === 'h'
        ? 'linear-gradient(to bottom, transparent 0%, black 20%, black 80%, transparent 100%)'
        : 'linear-gradient(to bottom, transparent 0%, black 10%, black 75%, transparent 100%)'
      return {
        ...base,
        backgroundPosition: `${ip.x}% ${ip.y}%`,
        backgroundSize: ip.scale === 100 ? 'contain' : `${ip.scale}%`,
        WebkitMaskImage: `${maskH}, ${maskV}`,
        WebkitMaskComposite: 'destination-in',
        maskImage: `${maskH}, ${maskV}`,
        maskComposite: 'intersect',
      }
    }
    return {
      ...base,
      backgroundPosition: `${ip.x}% ${ip.y}%`,
      backgroundSize: `${ip.scale}%`,
    }
  }

  /* ═══ SLOT RENDERER (横 horizontal) ═══ */
  const renderSlot = (slot, si) => {
    const member = MEMBERS.find(m => m.id === slot.memberId)
    const mIcon = schedule.memberIcons[slot.memberId]
    const plat = PLATFORMS.find(p => p.id === slot.platform)
    const platIcon = plat?.icon
    const ip = iconPos[slot.memberId] || { x: 50, y: 50, scale: 100 }
    return (
      <div key={si} className="pv-slot" style={{
        '--mc': member?.color || '#888',
        '--mr': member?.r || 128,
        '--mg': member?.g || 128,
        '--mb': member?.b || 128,
      }}>
        <div className="pv-slot-bar" />
        {mIcon && (
          <div className="pv-slot-bg" style={iconBgStyle(mIcon, ip, 'h')} />
        )}
        {!ip.fade && <div className="pv-slot-bg-fade" />}
        <div className="pv-slot-glow" />
        <div className="pv-slot-info">
          {member?.jp !== member?.en && (
            <div className="pv-slot-jp" style={{ fontSize: (adv.slotJpSize || 20) * fs, ...fJp, color: member?.color }}>{member?.jp}</div>
          )}
          <div className="pv-slot-name" style={{ fontSize: (adv.slotEnSize || 12) * fs, ...fName }}>{member?.en}</div>
          {slot.tag && <span className="pv-slot-tag" style={{ fontSize: (adv.slotTagSize || 11) * fs, ...fLabel }}>{slot.tag}</span>}
        </div>
        <div className="pv-slot-plat-zone">
          {platIcon ? (
            <img className="pv-slot-plat-icon" src={platIcon} alt={plat.label}
              style={{ width: (adv.platIconSize || 28), height: Math.round((adv.platIconSize || 28) * 0.7), objectFit: 'contain' }} />
          ) : (
            plat?.label && <div className="pv-slot-platform" style={{ fontSize: 9 * fs }}>{plat.label}</div>
          )}
        </div>
        <div className="pv-slot-meta">
          <div className="pv-slot-time" style={{ fontSize: (adv.slotTimeSize || 22) * fs, ...fTime }}>{slot.time}</div>
        </div>
      </div>
    )
  }

  /* ═══ FM BADGE (横) ═══ */
  const ytIcon = PLATFORMS.find(p => p.id === 'youtube')?.icon
  const platSz = adv.platIconSize || 28
  const renderFmBadge = (compact = false) => (
    <div className={`pv-slot pv-slot-fm-badge ${compact ? 'pv-slot-fm-compact' : ''}`}>
      <div className="pv-slot-bar" style={{ background: FM_GRAD }} />
      <div className="pv-slot-info">
        {!compact && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div className="pv-fm-dots-row">
              {MEMBERS.map(m => <div key={m.id} className="pv-fm-dot-h" style={{ background: m.color }} />)}
            </div>
            <div className="pv-fm-title" style={{ fontSize: (adv.slotJpSize || 20) * fs, ...fDisplay }}>{schedule.fanmeeting.title}</div>
          </div>
        )}
        {compact && (
          <div>
            <div className="pv-fm-dots-row" style={{ marginBottom: 2 }}>
              {MEMBERS.map(m => <div key={m.id} className="pv-fm-dot-h" style={{ background: m.color }} />)}
            </div>
            <div className="pv-fm-title" style={{ fontSize: (adv.slotEnSize || 12) * fs, ...fDisplay, lineHeight: 1.2 }}>
              FAN<br/>MEETING
            </div>
          </div>
        )}
        <div className="pv-fm-jp" style={{ fontSize: (compact ? 9 : (adv.slotEnSize || 12)) * fs, ...fJp }}>ファンミ</div>
      </div>
      <div className="pv-slot-plat-zone">
        {ytIcon && <img className="pv-slot-plat-icon" src={ytIcon} alt="YouTube"
          style={{ width: platSz, height: Math.round(platSz * 0.7), objectFit: 'contain' }} />}
      </div>
      <div className="pv-slot-meta">
        <div className="pv-slot-time" style={{ fontSize: (adv.slotTimeSize || 22) * fs, ...fTime }}>{schedule.fanmeeting.time}</div>
      </div>
    </div>
  )

  /* ─── Vertical slot ─── */
  const renderSlotV = (slot, si) => {
    const member = MEMBERS.find(m => m.id === slot.memberId)
    const mIcon = schedule.memberIcons[slot.memberId]
    const plat = PLATFORMS.find(p => p.id === slot.platform)
    const platIcon = plat?.icon
    const ip = iconPos[slot.memberId] || { x: 50, y: 50, scale: 100 }
    return (
      <div key={si} className="pv-vslot" style={{
        '--mc': member?.color || '#888',
        '--mr': member?.r || 128,
        '--mg': member?.g || 128,
        '--mb': member?.b || 128,
      }}>
        <div className="pv-vslot-bar" />
        {mIcon && (
          <div className="pv-vslot-bg" style={iconBgStyle(mIcon, ip, 'v')} />
        )}
        {!ip.fade && <div className="pv-vslot-bg-fade" />}
        <div className="pv-slot-glow" />
        {member?.jp !== member?.en && (
          <div className="pv-vslot-jp-main" style={{ fontSize: (adv.vSlotJpSize || 18) * fs, color: member?.color, ...fJp }}>{member?.jp}</div>
        )}
        <div className="pv-vslot-en" style={{ fontSize: (adv.vSlotEnSize || 11) * fs, ...fName }}>{member?.en}</div>
        {slot.tag && <span className="pv-vslot-tag" style={{ fontSize: (adv.vSlotTagSize || 10) * fs, ...fLabel }}>{slot.tag}</span>}
        <div className="pv-vslot-time" style={{ fontSize: (adv.vSlotTimeSize || 20) * fs, ...fTime }}>{slot.time}</div>
        {platIcon ? (
          <img className="pv-slot-plat-icon" src={platIcon} alt={plat.label}
            style={{ width: (adv.platIconSize || 28), height: Math.round((adv.platIconSize || 28) * 0.7), objectFit: 'contain' }} />
        ) : (
          <div className="pv-vslot-platform" style={{ fontSize: 9 * fs }}>
            {plat?.label || slot.platform}
          </div>
        )}
      </div>
    )
  }

  /* ─── FM badge vertical ─── */
  const renderFmBadgeV = () => {
    return (
      <div className="pv-vslot pv-vslot-fm">
        <div className="pv-vslot-bar" style={{ background: 'linear-gradient(90deg, #3D5AF1, #00E5A0, #FF6B35, #7B61FF, #FF69B4)' }} />
        <div className="pv-fm-dots-row" style={{ justifyContent: 'center' }}>
          {MEMBERS.map(m => <div key={m.id} className="pv-fm-dot-h" style={{ background: m.color, width: 10, height: 3 }} />)}
        </div>
        <div className="pv-fm-title-v-block" style={{ ...fDisplay }}>
          <div className="pv-fm-line-fan" style={{ fontSize: 13 * fs }}>FAN</div>
          <div className="pv-fm-line-meeting" style={{ fontSize: 13 * fs }}>MEETING</div>
        </div>
        <div className="pv-vslot-jp-sub" style={{ fontSize: 9 * fs, ...fJp }}>ファンミ</div>
        <div className="pv-vslot-time" style={{ fontSize: (adv.vSlotTimeSize || 20) * fs, ...fTime }}>{schedule.fanmeeting.time}</div>
        {ytIcon && <img className="pv-slot-plat-icon" src={ytIcon} alt="YouTube"
          style={{ width: (adv.platIconSize || 28), height: Math.round((adv.platIconSize || 28) * 0.7), objectFit: 'contain' }} />}
      </div>
    )
  }

  const renderSchedule = () => {
    /* ═══ 横 HORIZONTAL ═══ */
    if (isH) {
      return (
        <div className="pv-schedule-zone pv-sched-h" style={themeVars}>
          {schedule.days.map((day, i) => {
            const isOff = day.slots.length === 0 && !day.dayOff
            const isDayOff = day.dayOff
            const isSat = i === 5
            const isFM = isSat && schedule.fanmeeting.enabled
            const dateShort = day.date ? day.date.slice(5).replace('-', '.') : ''
            const dc = DAY_COLORS[i]

            if (isDayOff) {
              return (
                <div key={i} className="pv-row pv-row-dayoff">
                  <div className="pv-row-day" style={{ borderColor: `rgba(${dc.r},${dc.g},${dc.b},0.08)` }}>
                    <span className="pv-dow" style={{ fontSize: (adv.dayDowSize || 16) * fs, color: dc.color }}>{DAYS[i]}</span>
                    <span className="pv-dow-jp" style={{ fontSize: 11 * fs, color: dc.color }}>{DAYS_JP[i]}</span>
                    <span className="pv-day-date" style={{ fontSize: (adv.dayDateSize || 13) * fs }}>{dateShort}</span>
                  </div>
                  <div className="pv-row-body pv-dayoff-body">
                    <div className="pv-dayoff-icon">☾</div>
                    <div className="pv-dayoff-text">
                      <span className="pv-dayoff-label" style={{ fontSize: 14 * fs, ...fDisplay }}>NO STREAMING</span>
                      <span className="pv-dayoff-jp" style={{ fontSize: 11 * fs, ...fJp }}>お休み</span>
                    </div>
                  </div>
                </div>
              )
            }

            if (isFM && isOff) {
              return (
                <div key={i} className="pv-row pv-row-fm">
                  <div className="pv-row-day" style={{ borderColor: `rgba(${dc.r},${dc.g},${dc.b},0.15)` }}>
                    <span className="pv-dow" style={{ fontSize: (adv.dayDowSize || 16) * fs, color: dc.color }}>{DAYS[i]}</span>
                    <span className="pv-dow-jp" style={{ fontSize: 11 * fs, color: dc.color }}>{DAYS_JP[i]}</span>
                    <span className="pv-day-date" style={{ fontSize: (adv.dayDateSize || 13) * fs }}>{dateShort}</span>
                  </div>
                  <div className="pv-row-slots pv-row-slots-h">
                    {renderFmBadge()}
                  </div>
                </div>
              )
            }

            if (isOff) {
              return (
                <div key={i} className="pv-row pv-row-off">
                  <div className="pv-row-day" style={{ borderColor: `rgba(${dc.r},${dc.g},${dc.b},0.08)` }}>
                    <span className="pv-dow" style={{ fontSize: (adv.dayDowSize || 16) * fs, color: dc.color }}>{DAYS[i]}</span>
                    <span className="pv-dow-jp" style={{ fontSize: 11 * fs, color: dc.color }}>{DAYS_JP[i]}</span>
                    <span className="pv-day-date" style={{ fontSize: (adv.dayDateSize || 13) * fs }}>{dateShort}</span>
                  </div>
                  <div className="pv-row-body">
                    <span className="pv-off-label" style={{ fontSize: 14 * fs }}>OFF</span>
                  </div>
                </div>
              )
            }

            return (
              <div key={i} className="pv-row">
                <div className="pv-row-day" style={{ borderColor: `rgba(${dc.r},${dc.g},${dc.b},0.15)` }}>
                  <span className="pv-dow" style={{ fontSize: (adv.dayDowSize || 16) * fs, color: dc.color }}>{DAYS[i]}</span>
                  <span className="pv-dow-jp" style={{ fontSize: 11 * fs, color: dc.color }}>{DAYS_JP[i]}</span>
                  <span className="pv-day-date" style={{ fontSize: (adv.dayDateSize || 13) * fs }}>{dateShort}</span>
                </div>
                <div className="pv-row-slots pv-row-slots-h">
                  {day.slots.map((slot, si) => renderSlot(slot, si))}
                  {isFM && renderFmBadge(day.slots.length > 0)}
                </div>
              </div>
            )
          })}
        </div>
      )
    }

    /* ═══ 縦 VERTICAL ═══ */
    return (
      <div className="pv-schedule-zone pv-sched-v" style={themeVars}>
        {schedule.days.map((day, i) => {
          const isDayOff = day.dayOff
          const isOff = day.slots.length === 0 && !isDayOff
          const isSat = i === 5
          const isFM = isSat && schedule.fanmeeting.enabled
          const dateShort = day.date ? day.date.slice(5).replace('-', '.') : ''
          const dc = DAY_COLORS[i]

          return (
            <div key={i} className={`pv-col ${isOff && !isFM ? 'pv-col-off' : ''} ${isDayOff ? 'pv-col-dayoff' : ''}`}
              style={{ '--dc': dc.color, '--dcr': dc.r, '--dcg': dc.g, '--dcb': dc.b }}>
              <div className="pv-col-day">
                <div className="pv-col-day-top">
                  <span className="pv-dow" style={{ fontSize: (adv.vDayDowSize || 14) * fs, color: dc.color }}>{DAYS[i]}</span>
                  <span className="pv-dow-jp" style={{ fontSize: 10 * fs, color: dc.color }}>{DAYS_JP[i]}</span>
                </div>
                <span className="pv-col-date" style={{ fontSize: (adv.vDayDateSize || 12) * fs }}>{dateShort}</span>
              </div>
              <div className="pv-col-slots">
                {isDayOff && (
                  <div className="pv-vslot-dayoff">
                    <div className="pv-dayoff-icon-v">☾</div>
                    <span className="pv-dayoff-jp-v" style={{ fontSize: 16 * fs, ...fJp }}>お休み</span>
                    <span className="pv-dayoff-en-v" style={{ fontSize: 7 * fs, ...fLabel }}>NO STREAMING</span>
                  </div>
                )}
                {!isDayOff && isOff && !isFM && (
                  <div className="pv-vslot-off">
                    <span className="pv-off-label" style={{ fontSize: 11 * fs }}>OFF</span>
                  </div>
                )}
                {!isDayOff && day.slots.map((slot, si) => renderSlotV(slot, si))}
                {!isDayOff && isFM && renderFmBadgeV()}
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div className="preview-panel">
      <div className="preview-scale-wrapper">
        <div ref={previewRef} className="preview-frame" style={palVars}>

          {/* ZONE 1: TITLE */}
          <div className="pv-title-zone">
            {schedule.titleImage && (
              <div className="pv-title-bg" style={{ background: titleBg, opacity: schedule.titleOverlay ?? 0.55 }} />
            )}
            {!schedule.titleImage && (
              <div className="pv-title-bg pv-title-bg-grad" style={{ background: titleBg }} />
            )}
            {getTitleOverlayLayers().map((layerStyle, li) => (
              <div key={li} className="pv-title-overlay" style={layerStyle} />
            ))}
            <div className="pv-title-content">
              <span className="pv-brand" style={{ fontSize: (adv.brandSize || 18) * fs }}>CHRONO REVERSE</span>
              <span className="pv-label" style={{ fontSize: (adv.labelSize || 20) * fs, ...fLabel }}>WEEKLY SCHEDULE</span>
              <h1 className="pv-title" style={{ fontSize: (adv.titleSize || 64) * fs, ...fDisplay }}>{title}</h1>
              <span className="pv-sub" style={{ fontSize: (adv.subSize || 16) * fs }}>— Week {schedule.weekNumber} —</span>
              <span className="pv-date" style={{ fontSize: (adv.dateSize || 18) * fs, ...fTime }}>
                {schedule.startDate.replace(/-/g, '.')} — {endShort}
              </span>
            </div>
            <div className="pv-title-dots">
              {MEMBERS.map(m => (
                <div key={m.id} className="pv-dot" style={{ background: m.color }} />
              ))}
            </div>
            <div className="pv-title-week-ghost" style={{ fontSize: 200 * fs }}>
              {schedule.weekNumber}
            </div>
          </div>

          <div className="pv-chrome-line" />

          {/* ZONE 2: SNAP */}
          <div className="pv-snap-zone" style={{
            backgroundImage: schedule.snapImage ? `url(${schedule.snapImage})` : 'none',
            backgroundColor: schedule.snapImage ? 'transparent' : '#808080',
          }}>
            {!schedule.snapImage && (
              <div className="pv-snap-empty-label" style={{ fontSize: 24 * fs }}>
                SNAP / IMAGE ZONE
              </div>
            )}
          </div>

          <div className="pv-chrome-line" />

          {/* ZONE 3: SCHEDULE */}
          <div ref={scheduleRef} className="pv-schedule-export-wrap" style={palVars}>
            {renderSchedule()}
            {/* FOOTER */}
            <div className="pv-footer">
              <span style={{ fontSize: 9 * fs }}>GLASS 2026</span>
              <div className="pv-footer-line" />
              <span style={{ fontSize: 9 * fs }}>W{schedule.weekNumber}</span>
            </div>
          </div>

          <div className="pv-noise" />
          <div className="pv-noise-heavy" />
        </div>
      </div>
    </div>
  )
}
