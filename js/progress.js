/* ---------- Progress ---------- */
const METRIC_F = {
  top:   en => Math.max(...en.sets.map(s => s.kg || 0)),
  e1rm:  en => Math.max(...en.sets.map(s => (s.kg || 0) * (1 + s.v / 30))),
  vol:   en => en.sets.reduce((a, s) => a + s.v * (s.kg || 0), 0),
  best:  en => Math.max(...en.sets.map(s => s.v)),
  total: en => en.sets.reduce((a, s) => a + s.v, 0)
};
function metricsFor(unit, hasKg) {
  const short = (UNIT[unit] || UNIT.reps).short, list = [];
  if (hasKg) list.push(['top', 'Top weight', 'kg']);
  if (hasKg && unit === 'reps') list.push(['e1rm', 'Est. 1-rep max', 'kg'], ['vol', 'Volume', 'kg']);
  list.push(['best', unit === 'sec' ? 'Longest hold' : unit === 'm' ? 'Longest carry' : 'Best set', short]);
  list.push(['total', unit === 'sec' ? 'Total time' : unit === 'm' ? 'Total distance' : 'Total reps', short]);
  return list;
}
function chart(pts, unit) {
  if (!pts.length) return `<div class="empty">No data yet — log this exercise and the chart appears here.</div>`;
  const W = 340, H = 200, pl = 34, pr = 16, pt = 18, pb = 24;
  const ys = pts.map(p => p.y); let lo = Math.min(...ys), hi = Math.max(...ys);
  if (lo === hi) { lo = Math.max(0, lo - 1); hi = hi + 1; }
  const pad = (hi - lo) * 0.12; lo = Math.max(0, lo - pad); hi += pad;
  const ts = pts.map(p => dateMs(p.date)), t0 = Math.min(...ts), t1 = Math.max(...ts);
  const X = t => t1 === t0 ? pl + (W - pl - pr) / 2 : pl + (t - t0) / (t1 - t0) * (W - pl - pr);
  const Y = v => pt + (1 - (v - lo) / (hi - lo)) * (H - pt - pb);
  const xy = pts.map((p, i) => [X(ts[i]), Y(p.y)]);
  const line = xy.map((q, i) => `${i ? 'L' : 'M'}${q[0].toFixed(1)},${q[1].toFixed(1)}`).join(' ');
  const area = `${line} L${xy[xy.length - 1][0].toFixed(1)},${H - pb} L${xy[0][0].toFixed(1)},${H - pb} Z`;
  let g = '';
  [lo, (lo + hi) / 2, hi].forEach(v => { const y = Y(v).toFixed(1); g += `<line class="gd" x1="${pl}" x2="${W - pr}" y1="${y}" y2="${y}"/><text x="${pl - 6}" y="${+y + 3}" text-anchor="end">${fmtN(round1(v))}</text>`; });
  const lp = xy[xy.length - 1];
  return `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Progress chart">${g}
    ${pts.length > 1 ? `<path class="ar" d="${area}"/><path class="ln" d="${line}"/>` : ''}
    ${xy.map(q => `<circle class="dt" cx="${q[0].toFixed(1)}" cy="${q[1].toFixed(1)}" r="${pts.length > 25 ? 2.5 : 4}"/>`).join('')}
    <text class="val" x="${Math.min(lp[0], W - pr - 2)}" y="${lp[1] - 9}" text-anchor="${pts.length > 1 ? 'end' : 'middle'}">${fmtN(pts[pts.length - 1].y)} ${unit}</text>
    <text x="${pl}" y="${H - 6}">${fmtDate(pts[0].date)}</text>
    ${pts.length > 1 ? `<text x="${W - pr}" y="${H - 6}" text-anchor="end">${fmtDate(pts[pts.length - 1].date)}</text>` : ''}</svg>`;
}
function progressView() {
  const groups = [], seen = new Set();
  S.days.forEach(d => {
    const items = d.exercises.filter(e => e.unit !== 'done' && !seen.has(norm(e.name)));
    items.forEach(e => seen.add(norm(e.name)));
    if (items.length) groups.push({ label: d.name, items: items.map(e => ({ name: e.name, unit: e.unit })) });
  });
  const older = [];
  S.sessions.forEach(s => Object.values(s.entries).forEach(en => {
    if (en.unit !== 'done' && en.sets.length && !seen.has(norm(en.name))) { seen.add(norm(en.name)); older.push({ name: en.name, unit: en.unit }); }
  }));
  if (older.length) groups.push({ label: 'No longer in a day', items: older });
  const all = groups.flatMap(g => g.items);
  if (!all.length) return `<h1>Progress</h1><div class="empty">Add exercises in Setup first.</div>`;
  if (!ui.prog || !all.some(x => norm(x.name) === ui.prog)) {
    const withData = all.find(x => seriesFor(x.name).length); ui.prog = norm((withData || all[0]).name);
  }
  const cur = all.find(x => norm(x.name) === ui.prog);
  const ser = seriesFor(cur.name);
  const hasKg = ser.some(p => p.en.sets.some(s => s.kg > 0));
  const ms = metricsFor(cur.unit, hasKg);
  if (!ms.some(m => m[0] === ui.metric)) ui.metric = ms[0][0];
  const m = ms.find(m => m[0] === ui.metric);
  const pts = ser.map(p => ({ date: p.date, y: round1(METRIC_F[m[0]](p.en)) }));
  let stats = '';
  if (pts.length) {
    const first = pts[0].y, last = pts[pts.length - 1].y, best = Math.max(...pts.map(p => p.y)), ch = round1(last - first);
    const pct = first > 0 && pts.length > 1 ? ` (${ch >= 0 ? '+' : ''}${Math.round(ch / first * 100)}%)` : '';
    stats = `<div class="stats">
      <div class="stat"><div class="k">Latest</div><div class="v">${fmtN(last)}<span class="small"> ${m[2]}</span></div></div>
      <div class="stat"><div class="k">Best</div><div class="v">${fmtN(best)}<span class="small"> ${m[2]}</span></div></div>
      <div class="stat"><div class="k">Change</div><div class="v ${ch > 0 ? 'up' : ''}">${ch > 0 ? '+' : ''}${fmtN(ch)}<span class="small">${pct}</span></div></div></div>`;
  }
  return `<h1>Progress</h1><p class="sub">Exercises with the same name are linked across days.</p>
  <select class="big" id="progsel">${groups.map(g => `<optgroup label="${esc(g.label)}">${g.items.map(x => {
    const c = seriesFor(x.name).length;
    return `<option value="${esc(norm(x.name))}" ${norm(x.name) === ui.prog ? 'selected' : ''}>${esc(x.name)}${c ? ' · ' + c : ''}</option>`;
  }).join('')}</optgroup>`).join('')}</select>
  <div class="chips">${ms.map(x => `<button class="chip ${x[0] === ui.metric ? 'on' : ''}" data-act="metric" data-m="${x[0]}">${x[1]}</button>`).join('')}</div>
  <div class="card">${chart(pts, m[2])}</div>${stats}
  ${ser.length ? `<h2>Log</h2><div class="card">${[...ser].reverse().map(p => `<div class="logrow"><div class="ld">${fmtDate(p.date, true)}</div><div>${p.en.sets.map(st => compact(st, p.en.unit)).join(', ')}</div>${p.en.note ? `<div class="ln">${esc(p.en.note)}</div>` : ''}</div>`).join('')}</div>` : ''}
  ${m[0] === 'e1rm' ? '<p class="small">Est. 1-rep max uses the Epley formula: weight × (1 + reps/30). It is a trend indicator, not something to test.</p>' : ''}`;
}

