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

/* ---------- GitHub automatic upload ---------- */
const SYNC_FILE = 'lift-log.json', SYNC_DELAY = 30e3;
const syncReady = () => !!(SY.repo && SY.token);
let syncTimer = null, syncing = false, syncAgain = false, changes = 0;

// JSON with two-space indent, but each set on one line
function toJSON(data) {
  return JSON.stringify(data, null, 2).replace(/\{\n\s+"v": ([^,\n]+)(?:,\n\s+"kg": ([^\n]+))?\n\s+\}/g,
    (m, v, kg) => kg ? `{ "v": ${v}, "kg": ${kg} }` : `{ "v": ${v} }`);
}
function b64(s) {
  const bytes = new TextEncoder().encode(s); let bin = '';
  for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(bin);
}
function commitMsg() {
  const n = (k, w) => `${k} ${w}${k === 1 ? '' : 's'}`;
  return `Backup ${today()} ${new Date().toTimeString().slice(0, 5)} · ${n(S.sessions.length, 'workout')}, ${n(S.hikes.length, 'hike')}`;
}

// called by save(): remember there are changes and upload after SYNC_DELAY of quiet
function markDirty() {
  if (!syncReady()) return;
  changes++;
  if (!SY.dirty) { SY.dirty = true; saveSync(); refreshSyncUI(); }
  clearTimeout(syncTimer); syncTimer = setTimeout(syncNow, SYNC_DELAY);
}
async function remoteSha() {
  const r = await gh('/contents/' + SYNC_FILE);
  if (r.status === 404) return null;
  if (!r.ok) throw r.status;
  return (await r.json()).sha;
}
async function upload(force) {
  // a file this device never uploaded or restored is only overwritten when forced
  if (!SY.sha) {
    const sha = await remoteSha();
    if (sha && !force) return 'exists';
    SY.sha = sha;
  }
  const put = () => gh('/contents/' + SYNC_FILE, { method: 'PUT',
    body: JSON.stringify({ message: commitMsg(), content: b64(toJSON(S)), ...(SY.sha ? { sha: SY.sha } : {}) }) });
  let r = await put();
  if (r.status === 409 || r.status === 422) { SY.sha = await remoteSha(); r = await put(); } // changed elsewhere: phone wins
  if (!r.ok) return r.status;
  SY.sha = (await r.json()).content.sha;
  return 'ok';
}
async function syncNow(force = false) {
  clearTimeout(syncTimer);
  if (!syncReady() || !(SY.dirty || force)) return;
  if (syncing) { syncAgain = true; return; }
  syncing = true; syncAgain = false;
  const at = changes;
  let res;
  try { res = await upload(force); } catch (e) { res = typeof e === 'number' ? e : 'offline'; }
  if (res === 'ok') { if (changes === at) SY.dirty = false; SY.lastSync = Date.now(); SY.err = null; SY.failSince = null; }
  else if (res !== 'offline') { SY.err = res; SY.failSince = SY.failSince || Date.now(); }
  saveSync(); syncing = false; refreshSyncUI();
  if (syncAgain) syncNow();
}

/* ---------- GitHub status text ---------- */
const SYNC_ERR = {
  401: 'Backup failed: token rejected or expired. Paste a new one',
  403: "Backup failed: token can't write. Give it Contents: Read and write",
  404: 'Backup failed: repo not found',
  exists: "GitHub already has a backup this phone didn't make. Restore it, or tap Back up now to overwrite"
};
function since(ms) {
  const m = Math.round((Date.now() - ms) / 6e4);
  return m < 60 ? m + ' min' : m < 1440 ? Math.round(m / 60) + ' h' : Math.round(m / 1440) + ' days';
}
function syncStatus() {
  if (!syncReady()) return '';
  if (SY.err) return '⚠️ ' + (SYNC_ERR[SY.err] || `GitHub error ${SY.err}. Will retry`) + ' · failing for ' + since(SY.failSince);
  if (SY.dirty) return '⏳ Changes waiting to upload';
  if (!SY.lastSync) return '';
  return '✅ Backed up ' + (Date.now() - SY.lastSync < 6e4 ? 'just now' : since(SY.lastSync) + ' ago');
}
const syncFailing = () => syncReady() && SY.err && Date.now() - SY.failSince > 864e5;
function refreshSyncUI() {
  const el = $('#sy-status'); if (!el) return;
  el.textContent = syncStatus(); el.hidden = !el.textContent;
}

