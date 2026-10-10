/* ---------- actions ---------- */
const ACT = {
  tab(b) { ui.tab = b.dataset.tab; ui.editEx = null; ui.hike = null; render(); scrollTo(0, 0); },
  'hike-new'() { ui.hike = 'new'; render(); scrollTo(0, 0); },
  'hike-edit'(b) { ui.hike = b.dataset.id; render(); scrollTo(0, 0); },
  'hike-cancel'() { ui.hike = null; render(); scrollTo(0, 0); },
  'hike-save'() {
    const km = num($('#h-km').value), min = hikeFormMin();
    if (!(km > 0)) { toast('Enter a distance'); $('#h-km').focus(); return; }
    const data = { date: $('#h-date').value || today(), km: Math.round(km * 100) / 100, min,
      elev: parseInt($('#h-elev').value) || 0, note: $('#h-note').value.trim() };
    if (ui.hike === 'new') S.hikes.push({ id: uid(), ...data });
    else Object.assign(S.hikes.find(x => x.id === ui.hike), data);
    ui.hike = null; ui.cal = data.date.slice(0, 7); save(); requestSync(); render(); scrollTo(0, 0); toast('Hike saved');
  },
  'hike-del'(b) {
    if (!confirm('Delete this hike?')) return;
    S.hikes = S.hikes.filter(x => x.id !== b.dataset.id); ui.hike = null; save(); requestSync(); render(); toast('Hike deleted');
  },
  'open-day'(b) { ui.dayId = b.dataset.id; ui.date = today(); render(); scrollTo(0, 0); },
  back() { ui.dayId = null; render(); scrollTo(0, 0); },
  'add-set'(b) {
    const d = dayById(ui.dayId), e = curEx(b.dataset.ex), card = b.closest('.card');
    const vIn = card.querySelector('.in-v'), kIn = card.querySelector('.in-kg');
    const v = num(vIn.value), kg = kIn ? num(kIn.value) : NaN;
    if (!(v > 0)) { toast('Enter ' + (UNIT[e.unit] || UNIT.reps).short + ' first'); vIn.focus(); return; }
    const en = entryFor(ensureSession(d, ui.date), e); en.name = e.name; en.unit = e.unit;
    en.sets.push(kg > 0 ? { v, kg } : { v }); en.logged = false;
    save(); refreshCard(e);
  },
  'del-set'(b) {
    const s = getSession(ui.dayId, ui.date), e = curEx(b.dataset.ex);
    if (s && s.entries[e.id]) { s.entries[e.id].sets.splice(+b.dataset.i, 1); s.entries[e.id].logged = false; save(); refreshCard(e); }
  },
  'toggle-done'(b) {
    const e = curEx(b.dataset.ex), en = entryFor(ensureSession(dayById(ui.dayId), ui.date), e);
    en.done = !en.done; en.logged = en.done; save(); requestSync(); refreshCard(e);
  },
  log(b) {
    const e = curEx(b.dataset.ex), en = entryFor(ensureSession(dayById(ui.dayId), ui.date), e);
    en.logged = true; save(); requestSync(); refreshCard(e); toast('Logged');
  },
  metric(b) { ui.metric = b.dataset.m; render(); },
  'cal-move'(b) { ui.cal = shiftMonth(ui.cal, +b.dataset.n); render(); },
  'cal-day'(b) {
    const items = document.querySelectorAll(`details.hist[data-date="${b.dataset.date}"]`);
    items.forEach(el => { el.open = true; el.classList.remove('flash'); void el.offsetWidth; el.classList.add('flash'); });
    if (items[0]) items[0].scrollIntoView({ behavior: 'smooth', block: 'start' });
  },
  'open-session'(b) { const s = S.sessions.find(x => x.id === b.dataset.id); ui.tab = 'train'; ui.dayId = s.dayId; ui.date = s.date; render(); scrollTo(0, 0); },
  'del-session'(b) {
    if (!confirm('Delete this workout? This cannot be undone.')) return;
    S.sessions = S.sessions.filter(x => x.id !== b.dataset.id); save(); render(); toast('Workout deleted');
  },
  'ex-edit'(b) { ui.editEx = b.dataset.ex; render(); },
  'ex-cancel'() { ui.editEx = null; render(); },
  'ex-move'(b) {
    const d = dayById(b.dataset.day), i = +b.dataset.i, j = i + +b.dataset.dir;
    [d.exercises[i], d.exercises[j]] = [d.exercises[j], d.exercises[i]]; save(); render();
  },
  'ex-add'(b) {
    const d = dayById(b.dataset.day), sec = d.exercises.length ? d.exercises[d.exercises.length - 1].section : 'Exercises';
    const e = ex('New exercise', sec, ''); d.exercises.push(e); ui.editEx = e.id; save(); render();
    const n = $('.exedit .f-name'); if (n) { n.focus(); n.select(); }
  },
  'ex-save'(b) {
    const box = b.closest('.exedit'), d = dayById(b.dataset.day), e = d.exercises.find(x => x.id === b.dataset.ex);
    const name = box.querySelector('.f-name').value.trim() || 'Untitled';
    if (norm(name) !== norm(e.name)) {
      const has = S.sessions.some(s => Object.values(s.entries).some(en => norm(en.name) === norm(e.name)));
      if (has && confirm(`Also rename "${e.name}" in your past logs? This keeps the progress chart connected.`))
        S.sessions.forEach(s => Object.values(s.entries).forEach(en => { if (norm(en.name) === norm(e.name)) en.name = name; }));
    }
    e.name = name;
    e.section = box.querySelector('.f-sec').value.trim();
    e.target = box.querySelector('.f-tgt').value.trim();
    e.unit = box.querySelector('.f-unit').value;
    e.weighted = box.querySelector('.f-w').checked;
    e.perSide = box.querySelector('.f-ps').checked;
    ui.editEx = null; save(); render(); toast('Saved');
  },
  'ex-del'(b) {
    const d = dayById(b.dataset.day), e = d.exercises.find(x => x.id === b.dataset.ex);
    if (!confirm(`Remove "${e.name}" from ${d.name}? Past logs are kept.`)) return;
    d.exercises = d.exercises.filter(x => x.id !== e.id); ui.editEx = null; save(); render();
  },
  'day-add'() { S.days.push({ id: uid(), name: 'Day ' + String.fromCharCode(65 + S.days.length), exercises: [] }); save(); render(); },
  'day-del'(b) {
    const d = dayById(b.dataset.day);
    if (!confirm(`Delete "${d.name}"? Its past workouts stay in History.`)) return;
    S.days = S.days.filter(x => x.id !== d.id); save(); render();
  },
  async backup() {
    const ok = await shareFile(`lift-log-backup-${today()}.json`, toJSON(S), 'application/json');
    if (ok) { S.lastBackup = today(); save(); render(); toast('Backup created'); }
  },
  restore() { $('#restore').click(); },
  async 'sync-save'() {
    const repo = $('#sy-repo').value.trim(), tok = $('#sy-token').value.trim();
    const msg = m => { const el = $('#sy-msg'); if (el) el.textContent = m; };
    if (!/^[\w.-]+\/[\w.-]+$/.test(repo) || !(tok || SY.token)) return msg('Enter a repository (owner/repo-name) and paste a token first');
    if (repo !== SY.repo) SY.sha = null;
    SY.repo = repo; if (tok) SY.token = tok; SY.err = null; SY.failSince = null; saveSync(); render();
    msg('Testing…'); const m = await testSync(); msg(m);
    if (m.startsWith('✅')) requestSync();
  },
  async 'sync-now'() {
    if (SY.err === 'exists' && !confirm("GitHub already has a backup this phone didn't make. Overwrite it with the data on this phone? Older versions stay in the repo history.")) return;
    toast('Backing up…'); await syncNow(true);
    toast(SY.err ? '⚠️ Backup failed' : SY.dirty ? 'Offline: will retry' : 'Backed up to GitHub');
  },
  'sync-clear'() {
    if (!confirm('Remove the GitHub token from this phone?')) return;
    SY.token = ''; saveSync(); render(); toast('Token removed');
  },
  async csv() { await shareFile(`lift-log-${today()}.csv`, toCSV(), 'text/csv'); },
  'reset-prog'() {
    if (!confirm('Replace your days with the original plan? Your logged workouts are kept.')) return;
    S.days = seedDays(); save(); render(); toast('Days reset');
  }
};

document.addEventListener('click', ev => {
  const b = ev.target.closest('[data-act]'); if (!b || b.disabled) return;
  const f = ACT[b.dataset.act]; if (f) f(b, ev);
});
document.addEventListener('input', ev => {
  const t = ev.target;
  if (['h-km', 'h-h', 'h-m'].includes(t.id)) { $('#h-pace').textContent = paceText(num($('#h-km').value), hikeFormMin()); return; }
  if (t.matches('textarea.note')) {
    grow(t);
    const e = curEx(t.dataset.ex), en = entryFor(ensureSession(dayById(ui.dayId), ui.date), e);
    en.name = e.name; en.unit = e.unit; en.note = t.value; en.logged = false; save(); refreshLog(e);
  }
});
document.addEventListener('change', ev => {
  const t = ev.target;
  if (t.id === 'wdate') { ui.date = t.value || today(); render(); }
  else if (t.id === 'progsel') { ui.prog = t.value; ui.metric = null; render(); }
  else if (t.matches('input.dayname')) { const d = dayById(t.dataset.day); d.name = t.value.trim() || d.name; save(); }
  else if (t.id === 'restore' && t.files[0]) {
    const r = new FileReader();
    r.onload = () => {
      try {
        const data = JSON.parse(r.result);
        if (!Array.isArray(data.days) || !Array.isArray(data.sessions)) throw 0;
        data.hikes = data.hikes || [];
        if (!confirm(`Restore backup with ${data.sessions.length} workouts? This replaces what is on this phone now.`)) return;
        S = data; save(); ui.dayId = null; render(); toast('Backup restored');
      } catch (e) { alert('That file is not a valid Lift Log backup.'); }
      t.value = '';
    };
    r.readAsText(t.files[0]);
  }
});
document.addEventListener('keydown', ev => {
  if (ev.key === 'Enter' && ev.target.closest('.add')) { ev.preventDefault(); ev.target.closest('.add').querySelector('.addbtn').click(); }
});

if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => {});
render();
$('#testbadge').hidden = IS_PROD;
// GitHub backup: retry a Log that couldn't upload, when back online or on the next start
addEventListener('online', () => syncNow());
syncNow();
// ask the browser not to evict localStorage under storage pressure
if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => {});
