/* ---------- Setup ---------- */
function setupView() {
  const secs = [...new Set(S.days.flatMap(d => d.exercises.map(e => e.section)).filter(Boolean))];
  return `<h1>Setup</h1><p class="sub">Change your days as your plan evolves. Tap an exercise to edit it. Past logs are always kept.</p>
  <datalist id="secs">${secs.map(s => `<option value="${esc(s)}">`).join('')}</datalist>
  ${S.days.map(d => `<div class="card">
    <input class="dayname" data-day="${d.id}" value="${esc(d.name)}" aria-label="Day name">
    ${d.exercises.map((e, i) => exRow(d, e, i)).join('')}
    <div class="row"><button class="btn" data-act="ex-add" data-day="${d.id}">+ Exercise</button><button class="btn danger" data-act="day-del" data-day="${d.id}">Delete day</button></div>
  </div>`).join('')}
  <button class="btn wide" data-act="day-add">+ Add a day</button>
  <h2>Your data</h2>
  <div class="card"><p class="small" style="margin-top:0">${syncReady() ? 'Logged exercises and saved hikes are backed up to GitHub (see below). You can still save a copy yourself. Last manual backup' : 'Logs live only on this phone. Save a backup regularly (e.g. to iCloud Drive). Last backup'}: <b>${S.lastBackup ? fmtDate(S.lastBackup) : 'never'}</b>.</p>
    <button class="btn wide" data-act="backup">💾 Back up (JSON — restorable)</button>
    <button class="btn wide" data-act="restore">↩︎ Restore from backup</button>
    <button class="btn wide" data-act="csv">📄 Export CSV (for spreadsheets)</button>
    <button class="btn wide danger" data-act="reset-prog">Reset days to original plan (keeps logs)</button></div>
  ${syncCard()}`;
}
function syncCard() {
  const hint = SY.token ? `Saved ••••${esc(SY.token.slice(-4))}. Paste to replace` : 'github_pat_…';
  return `<h2>Backup to GitHub</h2>
  <div class="card">
    <p class="small" id="sy-status" style="margin-top:0" ${syncStatus() ? '' : 'hidden'}>${syncStatus()}</p>
    <label class="fl">Repository<input id="sy-repo" value="${esc(SY.repo)}" placeholder="owner/repo-name" autocapitalize="off" autocorrect="off" spellcheck="false"></label>
    <label class="fl">Token<input id="sy-token" type="password" placeholder="${hint}" autocomplete="off"></label>
    <p class="small" id="sy-msg"></p>
    <div class="row" style="margin-top:0"><button class="btn primary" data-act="sync-save">Save &amp; test</button>${syncReady() ? '<button class="btn" data-act="sync-now">Back up now</button><button class="btn" data-act="sync-restore">Restore from GitHub</button>' : ''}${SY.token ? '<button class="btn danger" data-act="sync-clear">Remove token</button>' : ''}</div></div>`;
}
function exRow(d, e, i) {
  if (ui.editEx === e.id) return `<div class="exedit">
    <label class="fl">Name<input class="f-name" value="${esc(e.name)}"></label>
    <label class="fl">Section<input class="f-sec" list="secs" value="${esc(e.section)}"></label>
    <label class="fl">Target / plan<input class="f-tgt" value="${esc(e.target)}" placeholder="e.g. 3×10 · 8 → 15 kg"></label>
    <label class="fl">Log as<select class="f-unit">${Object.entries(UNIT).map(([k, u]) => `<option value="${k}" ${k === e.unit ? 'selected' : ''}>${u.label}</option>`).join('')}</select></label>
    <label class="ck"><input type="checkbox" class="f-w" ${e.weighted ? 'checked' : ''}> Track weight (kg)</label>
    <label class="ck"><input type="checkbox" class="f-ps" ${e.perSide ? 'checked' : ''}> Per side / per leg</label>
    <div class="row"><button class="btn primary" data-act="ex-save" data-day="${d.id}" data-ex="${e.id}">Save</button><button class="btn" data-act="ex-cancel">Cancel</button><button class="btn danger" data-act="ex-del" data-day="${d.id}" data-ex="${e.id}">Remove</button></div></div>`;
  return `<div class="exrow"><div class="exinfo" data-act="ex-edit" data-ex="${e.id}"><div class="ename">${esc(e.name)}</div><div class="target">${esc(e.section)}${e.target ? ' · ' + esc(e.target) : ''}</div></div>
    <button class="ib" data-act="ex-move" data-day="${d.id}" data-i="${i}" data-dir="-1" ${i === 0 ? 'disabled' : ''} aria-label="Move up">↑</button>
    <button class="ib" data-act="ex-move" data-day="${d.id}" data-i="${i}" data-dir="1" ${i === d.exercises.length - 1 ? 'disabled' : ''} aria-label="Move down">↓</button></div>`;
}

/* ---------- export / import ---------- */
async function shareFile(name, text, type) {
  const file = new File([text], name, { type });
  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    try { await navigator.share({ files: [file], title: name }); return true; }
    catch (e) { if (e.name === 'AbortError') return false; }
  }
  const url = URL.createObjectURL(file), a = document.createElement('a');
  a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 3000);
  return true;
}
function toCSV() {
  const q = v => { v = String(v ?? ''); return /[",\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; };
  const head = ['date', 'day', 'exercise', 'set', 'value', 'unit', 'kg', 'done', 'minutes', 'elevation_m', 'note'], rows = [];
  S.sessions.forEach(s => {
    const dn = (dayById(s.dayId) || {}).name || s.dayName || '';
    Object.values(s.entries).forEach(en => {
      if (en.sets.length) en.sets.forEach((st, i) => rows.push([s.date, dn, en.name, i + 1, st.v, (UNIT[en.unit] || {}).short, st.kg || '', '', '', '', i === 0 ? en.note : '']));
      else rows.push([s.date, dn, en.name, '', '', '', '', en.done ? 'yes' : '', '', '', en.note]);
    });
  });
  S.hikes.forEach(h => rows.push([h.date, 'Hike', 'Hike', '', h.km, 'km', '', '', h.min || '', h.elev || '', h.note]));
  rows.sort((a, b) => a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0);
  return [head].concat(rows).map(r => r.map(q).join(',')).join('\n');
}

