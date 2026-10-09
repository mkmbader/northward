/* ---------- helpers ---------- */
const KEY = 'liftlog.v1';
const PROD_HOST = 'mkmbader.github.io';
const IS_PROD = location.hostname === PROD_HOST;
const $ = (s, r = document) => r.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const uid = () => Math.random().toString(36).slice(2, 10);
const norm = n => String(n || '').trim().toLowerCase();
const num = v => parseFloat(String(v ?? '').replace(',', '.'));
const round1 = n => Math.round(n * 10) / 10;
const fmtN = n => Number.isInteger(n) ? String(n) : n.toFixed(1);
const today = () => { const d = new Date(); d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); return d.toISOString().slice(0, 10); };
const dateMs = iso => new Date(iso + 'T12:00:00').getTime();
function fmtDate(iso, long) {
  const d = new Date(iso + 'T12:00:00');
  const o = { day: 'numeric', month: 'short' };
  if (long) o.weekday = 'short';
  if (d.getFullYear() !== new Date().getFullYear()) o.year = 'numeric';
  return d.toLocaleDateString(undefined, o);
}
const SHOE = '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 7.5h4.5l1.2 3.3 3.3 1.4 6.2 1.6c2 .5 3.3 1.9 3.3 3.7H4a1 1 0 0 1-1-1z"/><path d="M3 20.5h18.5M10.2 10.2l1.3-1.5M13 11.3l1.3-1.5"/></svg>';
const UNIT = {
  reps: { short: 'reps', label: 'Reps' },
  sec:  { short: 'sec',  label: 'Seconds (holds)' },
  m:    { short: 'm',    label: 'Distance (m)' },
  done: { short: '',     label: 'Just a checkbox' }
};

