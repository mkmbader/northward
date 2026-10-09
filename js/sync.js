/* ---------- GitHub backup settings ---------- */
const SYNC_KEY = 'northward.sync';
function loadSync() {
  try { const r = localStorage.getItem(SYNC_KEY); if (r) return JSON.parse(r); } catch (e) {}
  return { repo: '', token: '' };
}
let SY = loadSync();
function saveSync() { try { localStorage.setItem(SYNC_KEY, JSON.stringify(SY)); } catch (e) { toast('⚠️ Could not save'); } }
function gh(path, opts = {}) {
  return fetch(`https://api.github.com/repos/${SY.repo}${path}`, { ...opts, headers: {
    Authorization: 'Bearer ' + SY.token, Accept: 'application/vnd.github+json', ...opts.headers } });
}
async function testSync() {
  const r = await gh('').catch(() => null);
  if (!r) return '⚠️ No connection. Are you online?';
  if (r.status === 401) return '⚠️ Token rejected: wrong or expired';
  if (r.status === 404) return '⚠️ Repo not found: check the name, and that the token includes this repo';
  if (!r.ok) return '⚠️ GitHub error ' + r.status;
  const j = await r.json();
  return j.private ? '✅ Connected to ' + j.full_name : '⚠️ Connected, but this repo is PUBLIC. Make it private.';
}

