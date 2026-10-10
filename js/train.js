/* ---------- Train ---------- */
function dayPicker() {
  const t = today();
  const recent = [...S.sessions].sort((a, b) => a.date < b.date ? 1 : -1)[0];
  let nextId = S.days[0] && S.days[0].id;
  if (recent) { const i = S.days.findIndex(d => d.id === recent.dayId); if (i >= 0) nextId = S.days[(i + 1) % S.days.length].id; }
  const daysSinceBackup = S.lastBackup ? Math.round((dateMs(t) - dateMs(S.lastBackup)) / 864e5) : null;
  const needBackup = !syncReady() && S.sessions.length + S.hikes.length >= 2 && (daysSinceBackup === null || daysSinceBackup >= 7);
  return `${hero()}
  ${syncFailing() ? '<button class="banner" data-act="tab" data-tab="setup">⚠️ <b>GitHub backup not working</b> — check Setup.</button>' : ''}
  ${needBackup ? `<button class="banner" data-act="backup">💾 <b>Back up your logs</b> — ${daysSinceBackup === null ? 'no backup yet' : 'last one ' + daysSinceBackup + ' days ago'}. Tap to save a copy.</button>` : ''}
  ${S.days.length ? S.days.map(d => {
    const last = S.sessions.filter(s => s.dayId === d.id).map(s => s.date).sort().pop();
    const meta = last === t ? '<b>In progress today</b>' : last ? 'Last done ' + fmtDate(last) : 'Not done yet';
    return `<button class="daycard ${d.id === nextId ? 'next' : ''}" data-act="open-day" data-id="${d.id}">
      <span class="dname">${esc(d.name)}${d.id === nextId ? '<span class="pill">Up next</span>' : ''}</span>
      <span class="dmeta">${d.exercises.length} exercises · ${meta}</span><span class="chev">›</span></button>`;
  }).join('') : '<div class="empty">No days yet — add one in Setup.</div>'}
  ${(() => { const lh = S.hikes.map(h => h.date).sort().pop();
    return `<button class="daycard hikecard" data-act="hike-new"><span class="dname">${SHOE}Log a hike</span>
      <span class="dmeta">${lh ? 'Last hike ' + fmtDate(lh) : 'Distance, time and notes'}</span><span class="chev">›</span></button>`; })()}`;
}

/* ---------- Hikes ---------- */
function fmtDur(min) { if (!min) return '—'; const h = Math.floor(min / 60), m = min % 60; return h ? `${h}h ${String(m).padStart(2, '0')}m` : `${m} min`; }
function paceText(km, min) {
  if (!(km > 0) || !(min > 0)) return '';
  const p = min / km, pm = Math.floor(p), ps = Math.round((p - pm) * 60);
  return `${pm}:${String(ps === 60 ? 0 : ps).padStart(2, '0')} min/km · ${fmtN(round1(km / (min / 60)))} km/h`;
}
function hikeView() {
  const isNew = ui.hike === 'new';
  const h = isNew ? { date: today(), km: '', min: 0, elev: '', note: '' } : S.hikes.find(x => x.id === ui.hike);
  if (!h) { ui.hike = null; return dayPicker(); }
  return `<div class="bar"><button class="back" data-act="hike-cancel">‹ Back</button></div>
  <h1>${SHOE} ${isNew ? 'Log a hike' : 'Edit hike'}</h1>
  <div class="card" style="margin-top:12px">
    <label class="fl">Date<input type="date" id="h-date" value="${h.date}" max="${today()}"></label>
    <label class="fl">Distance<span class="unitin"><input id="h-km" inputmode="decimal" value="${h.km}" placeholder="0.0"><span>km</span></span></label>
    <div class="fl">Time<div class="two">
      <span class="unitin"><input id="h-h" inputmode="numeric" value="${h.min ? Math.floor(h.min / 60) : ''}" placeholder="0" aria-label="Hours"><span>h</span></span>
      <span class="unitin"><input id="h-m" inputmode="numeric" value="${h.min ? h.min % 60 : ''}" placeholder="0" aria-label="Minutes"><span>min</span></span></div></div>
    <label class="fl">Elevation gain (optional)<span class="unitin"><input id="h-elev" inputmode="numeric" value="${h.elev || ''}" placeholder="0"><span>m</span></span></label>
    <label class="fl">Notes<textarea id="h-note" rows="2" placeholder="Trail, weather, how it felt…">${esc(h.note || '')}</textarea></label>
    <div class="pace" id="h-pace">${paceText(h.km, h.min)}</div>
    <div class="row"><button class="btn hikebtn" data-act="hike-save">Save hike</button>${isNew ? '' : `<button class="btn danger" data-act="hike-del" data-id="${h.id}">Delete</button>`}</div>
  </div>`;
}
function hikeFormMin() { return (parseInt($('#h-h').value) || 0) * 60 + (parseInt($('#h-m').value) || 0); }

function workoutView() {
  const d = dayById(ui.dayId);
  const groups = [];
  d.exercises.forEach(e => { let g = groups.find(g => g.name === e.section); if (!g) groups.push(g = { name: e.section, items: [] }); g.items.push(e); });
  return `<div class="bar"><button class="back" data-act="back">‹ Days</button>
    <input type="date" id="wdate" value="${ui.date}" max="${today()}"></div>
    <h1>${esc(d.name)}</h1>
    ${ui.date !== today() ? `<p class="sub">Logging for ${fmtDate(ui.date, true)}</p>` : ''}
    ${groups.map(g => `<h2>${esc(g.name || 'Exercises')}</h2>` + g.items.map(e => `<div class="card" id="c-${e.id}">${cardInner(d, e)}</div>`).join('')).join('')}
    ${d.exercises.length ? `<p class="hint">Everything saves automatically on this phone.${syncReady() ? ' Tap Log to back up an exercise to GitHub.' : ''}</p>` : '<div class="empty">This day has no exercises — add some in Setup.</div>'}`;
}

function cardInner(d, e) {
  const s = getSession(d.id, ui.date), en = s && s.entries[e.id];
  const sets = en ? en.sets : [], note = en ? en.note : '';
  const u = UNIT[e.unit] || UNIT.reps;
  let h = `<div class="chead"><div><div class="ename">${esc(e.name)}${e.perSide ? ' <span class="tag">per side</span>' : ''}</div>${e.target ? `<div class="target">${esc(e.target)}</div>` : ''}</div>`;
  if (e.unit === 'done') {
    const done = en && en.done;
    h += `<button class="check ${done ? 'on' : ''}" data-act="toggle-done" data-ex="${e.id}">${done ? '✓ Done' : 'Mark done'}</button></div>`;
  } else {
    h += `</div>`;
    const last = lastFor(e.name, ui.date, s);
    if (last) h += `<div class="last">Last · ${fmtDate(last.date)}: <b>${last.entry.sets.map(st => compact(st, e.unit)).join(', ')}</b></div>`;
    h += `<div class="sets">${sets.map((st, i) => `<div class="set"><span class="sn">${i + 1}</span><span class="sv"><b>${fmtN(st.v)}</b> ${u.short}${st.kg ? ` · <b>${fmtN(st.kg)}</b> kg` : ''}</span><button class="x" data-act="del-set" data-ex="${e.id}" data-i="${i}" aria-label="Remove set">×</button></div>`).join('')}</div>`;
    const pf = sets.length ? sets[sets.length - 1] : (last ? last.entry.sets[0] : null);
    h += `<div class="add">
      <label><input class="in-v" inputmode="${e.unit === 'reps' ? 'numeric' : 'decimal'}" placeholder="0" value="${pf ? pf.v : ''}" aria-label="${u.label}"><span>${u.short}</span></label>
      ${e.weighted ? `<label><input class="in-kg" inputmode="decimal" placeholder="BW" value="${pf && pf.kg ? pf.kg : ''}" aria-label="Weight in kg"><span>kg</span></label>` : ''}
      <button class="addbtn" data-act="add-set" data-ex="${e.id}">+ Set ${sets.length + 1}</button></div>`;
  }
  h += `<textarea class="note" data-ex="${e.id}" rows="1" placeholder="Notes…">${esc(note)}</textarea>`;
  return h + logBar(e, en);
}
function logBar(e, en) {
  if (!en || !(en.sets.length || en.note || en.done)) return '';
  return `<div class="logbar"><button class="check ${en.logged ? 'on' : ''}" data-act="log" data-ex="${e.id}">${en.logged ? '✓ Logged' : 'Log'}</button></div>`;
}
// update only the Log button, so typing in the note keeps focus
function refreshLog(e) {
  const c = $('#c-' + e.id); if (!c) return;
  const s = getSession(ui.dayId, ui.date), html = logBar(e, s && s.entries[e.id]), bar = c.querySelector('.logbar');
  if (bar) bar.outerHTML = html; else c.insertAdjacentHTML('beforeend', html);
}
function refreshCard(e) { const c = $('#c-' + e.id); if (c) { c.innerHTML = cardInner(dayById(ui.dayId), e); c.querySelectorAll('textarea.note').forEach(grow); } }
const curEx = id => dayById(ui.dayId).exercises.find(x => x.id === id);

