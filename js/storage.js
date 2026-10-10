/* ---------- storage ---------- */
function load() {
  try { const r = localStorage.getItem(KEY); if (r) { const d = JSON.parse(r); if (d && Array.isArray(d.days)) { d.hikes = d.hikes || []; return d; } } } catch (e) {}
  return { version: 1, days: seedDays(), sessions: [], hikes: [], lastBackup: null };
}
let S = load();
// a parsed backup file, or null if it isn't one
function asBackup(d) {
  if (!d || !Array.isArray(d.days) || !Array.isArray(d.sessions)) return null;
  d.hikes = d.hikes || []; return d;
}
function clean() {
  S.sessions.forEach(s => { for (const [k, en] of Object.entries(s.entries)) if (!en.sets.length && !en.note && !en.done) delete s.entries[k]; });
  S.sessions = S.sessions.filter(s => Object.keys(s.entries).length);
}
function save() {
  clean();
  try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { toast('⚠️ Could not save'); }
}

