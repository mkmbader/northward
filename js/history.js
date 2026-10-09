/* ---------- History ---------- */
const DUMBBELL = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.5 7v10M3.5 9.5v5M17.5 7v10M20.5 9.5v5M6.5 12h11"/></svg>';
function shiftMonth(ym, n) {
  const [y, m] = ym.split('-').map(Number), d = new Date(y, m - 1 + n, 1);
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
}
function calendar() {
  const [y, m] = ui.cal.split('-').map(Number);
  const first = new Date(y, m - 1, 1), nDays = new Date(y, m, 0).getDate();
  const offset = (first.getDay() + 6) % 7; // Monday = 0
  const t = today(), thisMonth = t.slice(0, 7);
  const byDate = {};
  S.sessions.forEach(s => { (byDate[s.date] = byDate[s.date] || []).push(s); });
  const hikeDate = {};
  S.hikes.forEach(h => { (hikeDate[h.date] = hikeDate[h.date] || []).push(h); });
  let cells = '';
  for (let i = 0; i < offset; i++) cells += '<span class="cd blank"></span>';
  for (let d = 1; d <= nDays; d++) {
    const iso = `${ui.cal}-${String(d).padStart(2, '0')}`, list = byDate[iso], hk = hikeDate[iso];
    const cls = (iso === t ? ' today' : '') + (iso > t ? ' future' : '');
    if (list || hk) {
      const names = (list || []).map(s => (dayById(s.dayId) || {}).name || s.dayName || 'Workout')
        .concat((hk || []).map(h => `Hike ${fmtN(h.km)} km`)).join(', ');
      const kind = list && hk ? ' both' : hk ? ' hike' : '';
      const icon = list && hk ? `<span class="duo">${DUMBBELL}${SHOE}</span>` : hk ? SHOE : DUMBBELL;
      cells += `<button class="cd on${kind}${cls}" data-act="cal-day" data-date="${iso}" aria-label="${esc(fmtDate(iso, true) + ': ' + names)}">${icon}</button>`;
    } else cells += `<span class="cd${cls}">${d}</span>`;
  }
  const count = Object.keys(byDate).filter(k => k.startsWith(ui.cal)).length;
  const mHikes = S.hikes.filter(h => h.date.startsWith(ui.cal));
  const mKm = round1(mHikes.reduce((a, h) => a + (h.km || 0), 0));
  // active days in the current week (Mon–Sun)
  const now = new Date(t + 'T12:00:00'), mon = new Date(now); mon.setDate(now.getDate() - (now.getDay() + 6) % 7);
  const monIso = new Date(mon.getTime() - mon.getTimezoneOffset() * 6e4).toISOString().slice(0, 10);
  const week = new Set(Object.keys(byDate).concat(Object.keys(hikeDate)).filter(k => k >= monIso && k <= t)).size;
  return `<div class="card cal">
    <div class="calhead"><button class="ib" data-act="cal-move" data-n="-1" aria-label="Previous month">‹</button>
      <div class="calt"><b>${first.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</b>
      <span class="small">${count} workout day${count === 1 ? '' : 's'}${mHikes.length ? ` · <span class="hk">${mHikes.length} hike${mHikes.length === 1 ? '' : 's'}, ${fmtN(mKm)} km</span>` : ''}</span>
      ${ui.cal === thisMonth ? `<span class="small">${week} active day${week === 1 ? '' : 's'} this week</span>` : ''}</div>
      <button class="ib" data-act="cal-move" data-n="1" ${ui.cal >= thisMonth ? 'disabled' : ''} aria-label="Next month">›</button></div>
    <div class="calgrid">${['M', 'T', 'W', 'T', 'F', 'S', 'S'].map(w => `<span class="wd">${w}</span>`).join('')}${cells}</div></div>`;
}
function historyView() {
  const items = S.sessions.filter(s => s.date.startsWith(ui.cal)).map(s => ({ kind: 'w', date: s.date, s }))
    .concat(S.hikes.filter(h => h.date.startsWith(ui.cal)).map(h => ({ kind: 'h', date: h.date, h })))
    .sort((a, b) => a.date < b.date ? 1 : a.date > b.date ? -1 : 0);
  const head = `<h1>History</h1>${calendar()}`;
  if (!items.length) return head + `<div class="empty">No activity in this month.</div>`;
  return head + items.map(it => {
    if (it.kind === 'h') {
      const h = it.h, pace = paceText(h.km, h.min);
      return `<details class="card hist hike" data-date="${h.date}"><summary><span><b>${fmtDate(h.date, true)}</b> · <span class="hk">${SHOE} Hike</span></span><span class="muted">${fmtN(h.km)} km ›</span></summary>
        <div class="hstats"><div><div class="k">Distance</div><div class="v">${fmtN(h.km)} km</div></div>
          <div><div class="k">Time</div><div class="v">${fmtDur(h.min)}</div></div>
          ${pace ? `<div><div class="k">Pace</div><div class="v">${pace.split(' · ')[0].replace(' min/km', '')}<span class="small"> /km</span></div></div>` : ''}
          ${h.elev ? `<div><div class="k">Elevation</div><div class="v">+${h.elev} m</div></div>` : ''}</div>
        ${h.note ? `<div class="ln" style="margin-top:10px">${esc(h.note)}</div>` : ''}
        <div class="row"><button class="btn" data-act="hike-edit" data-id="${h.id}">Edit</button><button class="btn danger" data-act="hike-del" data-id="${h.id}">Delete</button></div></details>`;
    }
    const s = it.s;
    const d = dayById(s.dayId), ens = Object.values(s.entries);
    return `<details class="card hist" data-date="${s.date}"><summary><span><b>${fmtDate(s.date, true)}</b> · ${esc(d ? d.name : (s.dayName || 'Deleted day'))}</span><span class="muted">${ens.length} ›</span></summary>
      ${ens.map(en => `<div class="hrow"><div class="hn">${esc(en.name)}</div><div class="hv">${en.unit === 'done' ? (en.done ? '✓ done' : '') : en.sets.map(st => compact(st, en.unit)).join(', ')}</div>${en.note ? `<div class="ln">${esc(en.note)}</div>` : ''}</div>`).join('')}
      <div class="row">${d ? `<button class="btn" data-act="open-session" data-id="${s.id}">Open &amp; edit</button>` : ''}<button class="btn danger" data-act="del-session" data-id="${s.id}">Delete</button></div></details>`;
  }).join('');
}

