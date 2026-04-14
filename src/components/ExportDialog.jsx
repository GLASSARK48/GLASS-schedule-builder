import { useMemo } from 'react'
import { MEMBERS, DAYS, PALETTES } from '../data/members'

export default function ExportDialog({ schedule, onClose }) {
  const html = useMemo(() => generateHTML(schedule), [schedule])

  const handleCopy = () => {
    navigator.clipboard.writeText(html)
  }

  const handleDownload = () => {
    const blob = new Blob([html], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `chronova_schedule_w${schedule.weekNumber}_${schedule.palette}.html`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="export-overlay" onClick={onClose}>
      <div className="export-dialog" onClick={e => e.stopPropagation()}>
        <div className="export-dialog-header">
          <h2>EXPORT HTML</h2>
          <button className="btn btn-sm" onClick={onClose}>&times;</button>
        </div>
        <div className="export-dialog-body">
          <textarea readOnly value={html} />
        </div>
        <div className="export-dialog-footer">
          <button className="btn" onClick={handleCopy}>COPY</button>
          <button className="btn btn-accent" onClick={handleDownload}>DOWNLOAD</button>
        </div>
      </div>
    </div>
  )
}

function generateHTML(schedule) {
  const pal = PALETTES[schedule.palette] || PALETTES.A
  const isPortrait = schedule.orientation === 'portrait'
  const frameW = isPortrait ? 1080 : 1920
  const frameH = isPortrait ? 1440 : 1080
  const endShort = schedule.endDate.slice(5).replace('-', '.')

  const headerGrad = `linear-gradient(135deg, ${pal.colors[0]} 0%, ${pal.colors[1] || pal.colors[0]} 15%, ${pal.colors[2] || '#888'} 40%, ${pal.colors[3] || '#ccc'} 65%, ${pal.colors[4] || pal.colors[2] || '#f36'} 100%)`

  let dayCards = ''
  schedule.days.forEach((day, i) => {
    const isOff = day.slots.length === 0
    const isSat = i === 5
    const isFM = isSat && schedule.fanmeeting.enabled
    const dateShort = day.date ? day.date.slice(5).replace('-', '.') : ''

    if (isFM && isOff) {
      dayCards += `
    <!-- ${DAYS[i]} — FANMEETING -->
    <div class="day-card fanmeet">
      <div class="day-info">
        <span class="day">${DAYS[i]}</span>
        <span class="day-date">${dateShort}</span>
      </div>
      <div class="fm-content">
        <div class="fm-dots">
          ${MEMBERS.map(m => `<div class="fm-dot" style="background:${m.color}"></div>`).join('\n          ')}
        </div>
        <div class="fm-info">
          <div class="fm-title">${schedule.fanmeeting.title}</div>
          <div class="fm-sub">ALL MEMBERS</div>
        </div>
        <div class="fm-time">${schedule.fanmeeting.time}</div>
      </div>
    </div>`
      return
    }

    if (isOff) {
      dayCards += `
    <!-- ${DAYS[i]} — OFF -->
    <div class="day-card off">
      <div class="day-info">
        <span class="day">${DAYS[i]}</span>
        <span class="day-date">${dateShort}</span>
      </div>
      <div class="off-label">OFF</div>
    </div>`
      return
    }

    const s = day.slots[0]
    const m = MEMBERS.find(mm => mm.id === s.memberId)
    const multiTag = day.slots.length > 1 ? `\n      <div class="multi-indicator">${day.slots.length} STREAMS</div>` : ''
    const fmBadge = isFM ? `\n      <div class="fm-badge">+ FANMEET</div>` : ''
    const fmClass = isFM ? ' fanmeet-combo' : ''

    dayCards += `
    <!-- ${DAYS[i]} — ${m?.en || 'TBD'} -->
    <div class="day-card${fmClass}" style="--mc:${m?.color};--mr:${m?.r};--mg:${m?.g};--mb:${m?.b};">
      <div class="day-info">
        <span class="day">${DAYS[i]}</span>
        <span class="day-date">${dateShort}</span>
      </div>
      <div class="card-info">
        <div class="member-name">${m?.en || ''}</div>
        ${m?.jp !== m?.en ? `<div class="member-name-jp">${m?.jp || ''}</div>` : ''}
        <span class="tag">${s.tag}</span>
        ${s.title ? `<div class="stream-title">${s.title}</div>` : ''}
      </div>
      <div class="card-meta">
        <div class="time">${s.time}</div>
        <div class="platform-label">${getPlatformLabel(s.platform)}</div>
      </div>${multiTag}${fmBadge}
    </div>`
  })

  const memberDots = MEMBERS.map(m => `      <div class="dot" style="background:${m.color};"></div>`).join('\n')

  return `<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>CHRONOVA 2026 — Schedule W${schedule.weekNumber}</title>
<link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Instrument+Serif:ital@0;1&family=Outfit:wght@300;400;500;600;700&family=Inter:wght@400;500;600&family=Noto+Sans+JP:wght@400;500;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box;}
:root{
  --bg:#060608;--card:#0c0c10;--card2:#101016;
  --border:#1a1a24;--border-h:#2a2a38;
  --t:#e0e0e8;--t2:#8888a0;--t3:#555568;
  --chrome:linear-gradient(135deg,#2a2a3a 0%,#8888a0 20%,#e8e8f0 40%,#c0c0c8 50%,#4a4a5a 65%,#e0e0e8 80%,#8888a0 100%);
  --chrome-text:linear-gradient(180deg,#e8e8f0 0%,#b0b0c0 40%,#e0e0e8 50%,#8888a0 70%,#c0c0c8 100%);
  --arkhe:#FF2244;--charlo:#3D5AF1;--kaname:#00E5A0;
  --urumiya:#FF6B35;--shino:#7B61FF;--remu:#FF69B4;
}
body{
  background:#050507;
  font-family:'Inter','Noto Sans JP',sans-serif;
  color:var(--t);
  display:flex;justify-content:center;align-items:center;
  min-height:100vh;padding:40px 20px;
  -webkit-font-smoothing:antialiased;
}
.frame{
  width:${frameW}px;height:${frameH}px;
  position:relative;overflow:hidden;
  display:flex;flex-direction:column;
  background:${pal.colors[0]};
}

/* Noise */
.noise{position:absolute;inset:0;z-index:80;pointer-events:none;opacity:0.14;mix-blend-mode:overlay;background:url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.15'/%3E%3C/svg%3E");}
.noise-heavy{position:absolute;inset:0;z-index:81;pointer-events:none;opacity:0.05;mix-blend-mode:overlay;background:url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.6' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.28'/%3E%3C/svg%3E");}

/* Header */
.header{flex:0 0 130px;position:relative;z-index:10;background:${headerGrad};display:flex;align-items:center;padding:0 40px;overflow:hidden;}
.header::before{content:'';position:absolute;inset:0;z-index:2;background:url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.55' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.32'/%3E%3C/svg%3E");mix-blend-mode:overlay;opacity:0.3;pointer-events:none;}
.header::after{content:'';position:absolute;inset:0;z-index:3;pointer-events:none;background:radial-gradient(ellipse at center,transparent 30%,rgba(13,13,13,0.55) 100%);}
.header-line{position:absolute;bottom:0;left:0;right:0;height:2px;background:var(--chrome);z-index:10;opacity:0.7;}
.header-ghost{position:absolute;right:100px;top:50%;transform:translateY(-50%);font-family:'Syne',sans-serif;font-weight:800;font-size:160px;line-height:1;color:rgba(255,255,255,0.04);z-index:4;letter-spacing:-6px;}
.header-text{position:relative;z-index:5;display:flex;flex-direction:column;gap:2px;}
.header-text .label{font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:4px;color:rgba(255,255,255,0.5);text-transform:uppercase;}
.header-text h1{font-family:'Syne',sans-serif;font-weight:800;font-size:44px;letter-spacing:4px;line-height:1;color:#fff;text-shadow:0 2px 30px rgba(192,192,200,0.25);}
.header-text .sub{font-family:'Instrument Serif',serif;font-style:italic;font-size:13px;color:rgba(255,255,255,0.55);letter-spacing:2px;}
.header-text .date{font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:2px;color:rgba(255,255,255,0.4);margin-top:2px;}
.header-dots{position:absolute;right:40px;top:50%;transform:translateY(-50%);z-index:5;display:flex;gap:6px;}
.header-dots .dot{width:6px;height:28px;border-radius:3px;opacity:0.75;}

/* Schedule */
.schedule{flex:1;position:relative;z-index:10;display:flex;flex-direction:${isPortrait ? 'column' : 'row'};padding:16px 24px 12px;gap:8px;}
.schedule::before{content:'';position:absolute;top:0;left:0;right:0;height:120px;background:linear-gradient(180deg,rgba(192,192,200,0.04) 0%,transparent 100%);pointer-events:none;z-index:0;}

/* Day card */
.day-card{flex:1;position:relative;display:flex;${isPortrait ? 'align-items:center' : 'flex-direction:column;align-items:stretch'};background:#0E0E14;${isPortrait ? 'border-left:3px solid var(--mc)' : 'border-top:3px solid var(--mc)'};${isPortrait ? 'padding:0 20px 0 0' : 'padding:0 0 10px 0'};overflow:hidden;min-height:0;}
.day-card::before{content:'';position:absolute;inset:0;pointer-events:none;background:linear-gradient(${isPortrait ? '90deg' : '180deg'},rgba(var(--mr),var(--mg),var(--mb),0.06),transparent 35%);z-index:0;}

/* Day info */
.day-info{position:relative;z-index:2;${isPortrait ? 'width:72px' : 'width:auto'};flex-shrink:0;display:flex;${isPortrait ? 'flex-direction:column;align-items:center;justify-content:center;padding:8px 0;border-right:1px solid rgba(255,255,255,0.04)' : 'flex-direction:row;gap:8px;padding:10px 12px;border-bottom:1px solid rgba(255,255,255,0.04)'};}
.day{font-family:'Syne',sans-serif;font-weight:700;font-size:13px;letter-spacing:3px;color:var(--t);}
.day-date{font-family:'JetBrains Mono',monospace;font-size:9px;color:var(--t3);letter-spacing:1px;${isPortrait ? 'margin-top:2px' : ''};}

/* Card info */
.card-info{position:relative;z-index:2;flex:1;display:flex;flex-direction:column;gap:2px;${isPortrait ? 'padding:0 16px' : 'padding:8px 12px;flex:1'};min-width:0;}
.member-name{font-family:'Outfit',sans-serif;font-weight:600;font-size:18px;letter-spacing:2px;color:var(--t);}
.member-name-jp{font-family:'Noto Sans JP',sans-serif;font-weight:500;font-size:11px;color:var(--t2);}
.tag{display:inline-block;font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:2px;padding:2px 8px;border:1px solid rgba(var(--mr),var(--mg),var(--mb),0.25);color:var(--mc);width:fit-content;margin-top:2px;}
.stream-title{font-family:'Inter',sans-serif;font-size:10px;color:var(--t2);margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}

/* Meta */
.card-meta{position:relative;z-index:2;display:flex;flex-direction:column;${isPortrait ? 'align-items:flex-end;justify-content:center' : 'align-items:flex-start;padding:0 12px'};gap:4px;flex-shrink:0;}
.time{font-family:'JetBrains Mono',monospace;font-size:20px;font-weight:500;background:var(--chrome-text);-webkit-background-clip:text;-webkit-text-fill-color:transparent;letter-spacing:1px;}
.platform-label{font-family:'JetBrains Mono',monospace;font-size:9px;color:var(--t3);letter-spacing:1px;}

/* OFF */
.day-card.off{opacity:0.12;border-left-color:var(--t3);${isPortrait ? '' : 'border-top-color:var(--t3);'}}
.off-label{flex:1;font-family:'Outfit',sans-serif;font-weight:400;font-size:14px;letter-spacing:4px;color:var(--t3);padding:0 20px;}

/* Multi indicator */
.multi-indicator{position:absolute;top:4px;right:8px;font-family:'JetBrains Mono',monospace;font-size:8px;letter-spacing:1px;color:var(--t3);padding:2px 6px;border:1px solid rgba(255,255,255,0.06);z-index:3;}
.fm-badge{position:absolute;bottom:4px;right:8px;font-family:'JetBrains Mono',monospace;font-size:8px;letter-spacing:1px;color:#FF3366;padding:2px 6px;border:1px solid rgba(255,51,102,0.2);z-index:3;}

/* Fanmeeting */
.day-card.fanmeet,.day-card.fanmeet-combo{${isPortrait ? 'border-left:3px solid transparent;border-image:linear-gradient(180deg,#FF2244,#3D5AF1,#00E5A0,#FF6B35,#7B61FF,#FF69B4) 1' : 'border-top:3px solid transparent;border-image:linear-gradient(90deg,#FF2244,#3D5AF1,#00E5A0,#FF6B35,#7B61FF,#FF69B4) 1'};background:linear-gradient(90deg,rgba(255,45,45,0.04),rgba(255,107,53,0.03),rgba(255,204,2,0.02),transparent 50%) #0E0E14;}
.fm-content{position:relative;z-index:2;flex:1;display:flex;align-items:center;padding:0 20px;gap:16px;}
.fm-dots{display:flex;flex-direction:column;gap:3px;flex-shrink:0;}
.fm-dot{width:4px;height:14px;border-radius:2px;opacity:0.8;}
.fm-info{display:flex;flex-direction:column;gap:3px;}
.fm-title{font-family:'Syne',sans-serif;font-weight:800;font-size:20px;letter-spacing:3px;background:linear-gradient(90deg,#C0C0C8,#E8E8F0,#FF3366);-webkit-background-clip:text;-webkit-text-fill-color:transparent;}
.fm-sub{font-family:'Outfit',sans-serif;font-weight:400;font-size:11px;color:var(--t2);letter-spacing:1px;}
.fm-time{margin-left:auto;font-family:'JetBrains Mono',monospace;font-size:20px;font-weight:500;background:linear-gradient(90deg,#C0C0C8,#FF3366);-webkit-background-clip:text;-webkit-text-fill-color:transparent;letter-spacing:1px;}

/* Footer */
.footer{flex:0 0 44px;position:relative;z-index:10;display:flex;align-items:center;justify-content:space-between;padding:0 28px;background:#0A0A0E;border-top:1px solid var(--border);}
.footer span{font-family:'JetBrains Mono',monospace;font-size:8px;letter-spacing:2px;color:var(--t3);opacity:0.4;}
.footer .chrome-line{flex:1;height:1px;margin:0 16px;background:var(--chrome);opacity:0.15;}
</style>
</head>
<body>

<div class="frame">
  <div class="noise"></div>
  <div class="noise-heavy"></div>

  <!-- HEADER -->
  <div class="header">
    <div class="header-ghost">${schedule.weekNumber}</div>
    <div class="header-text">
      <span class="label">WEEKLY SCHEDULE</span>
      <h1>SCHEDULE</h1>
      <span class="sub">— Week ${schedule.weekNumber} —</span>
      <span class="date">${schedule.startDate.replace(/-/g, '.')} — ${endShort}</span>
    </div>
    <div class="header-dots">
${memberDots}
    </div>
    <div class="header-line"></div>
  </div>

  <!-- SCHEDULE -->
  <div class="schedule">
${dayCards}
  </div>

  <!-- FOOTER -->
  <div class="footer">
    <span>CHRONOVA 2026</span>
    <div class="chrome-line"></div>
    <span>WEEKLY SCHEDULE — W${schedule.weekNumber}</span>
  </div>
</div>

</body>
</html>`
}

function getPlatformLabel(id) {
  switch (id) {
    case 'youtube': return 'YouTube'
    case 'twitcast': return 'TwitCast'
    case 'twitch': return 'Twitch'
    default: return id
  }
}
