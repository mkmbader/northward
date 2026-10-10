/* ---------- model ---------- */
const dayById = id => S.days.find(d => d.id === id);
const getSession = (dayId, date) => S.sessions.find(s => s.dayId === dayId && s.date === date);
function ensureSession(day, date) {
  let s = getSession(day.id, date);
  if (!s) { s = { id: uid(), dayId: day.id, dayName: day.name, date, entries: {} }; S.sessions.push(s); }
  return s;
}
function entryFor(s, e) {
  if (!s.entries[e.id]) s.entries[e.id] = { name: e.name, unit: e.unit, sets: [], note: '', done: false };
  return s.entries[e.id];
}
function lastFor(name, date, cur) {
  const n = norm(name); let best = null;
  for (const s of S.sessions) {
    if (s === cur || s.date > date) continue;
    for (const en of Object.values(s.entries))
      if (norm(en.name) === n && en.sets.length && (!best || s.date > best.date)) best = { date: s.date, entry: en };
  }
  return best;
}
// one point per date: the same exercise logged in two workouts on one date is merged
function seriesFor(name) {
  const n = norm(name), byDate = {};
  for (const s of S.sessions) for (const en of Object.values(s.entries)) {
    if (norm(en.name) !== n || !en.sets.length) continue;
    const p = byDate[s.date];
    byDate[s.date] = p ? { date: s.date, en: { ...p.en, sets: p.en.sets.concat(en.sets), note: [p.en.note, en.note].filter(Boolean).join(' · ') } } : { date: s.date, en };
  }
  return Object.values(byDate).sort((a, b) => a.date < b.date ? -1 : a.date > b.date ? 1 : 0);
}
function compact(st, unit) {
  const base = unit === 'sec' ? st.v + 's' : unit === 'm' ? st.v + 'm' : String(st.v);
  return st.kg ? (unit === 'reps' ? `${base}×${st.kg}kg` : `${base} @ ${st.kg}kg`) : base;
}

/* ---------- ui state ---------- */
const ui = { tab: 'train', dayId: null, date: today(), prog: null, metric: null, editEx: null, cal: today().slice(0, 7) };

function render() {
  applyTheme();
  const welcome = !S.profile.name;
  document.body.classList.toggle('welcome', welcome);
  document.querySelectorAll('#tabs button').forEach(b => b.classList.toggle('on', b.dataset.tab === ui.tab));
  const v = $('#view');
  if (welcome) v.innerHTML = welcomeView();
  else if (ui.hike) v.innerHTML = hikeView();
  else if (ui.tab === 'train') v.innerHTML = ui.dayId && dayById(ui.dayId) ? workoutView() : (ui.dayId = null, dayPicker());
  else if (ui.tab === 'progress') v.innerHTML = progressView();
  else if (ui.tab === 'history') v.innerHTML = historyView();
  else v.innerHTML = setupView();
  document.querySelectorAll('textarea.note').forEach(grow);
}
function grow(el) { el.style.height = 'auto'; el.style.height = el.scrollHeight + 'px'; }
let tt;
function toast(m) { const t = $('#toast'); t.textContent = m; t.classList.add('show'); clearTimeout(tt); tt = setTimeout(() => t.classList.remove('show'), 1800); }

