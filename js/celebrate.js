/* ---------- celebrations: workout complete, hike saved ---------- */
const still = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

// the animated part of each theme's scene, drawn over its landscape
function sceneExtra(theme, kind) {
  if (kind === 'hike') {
    const trail = {
      fjord: 'M20 148 C 90 140, 150 132, 210 112 S 290 70, 322 26',
      fjell: 'M20 160 C 90 150, 140 140, 180 112 S 200 40, 210 14',
      midnattssol: 'M20 160 Q 100 140 170 128 T 262 104'
    }[theme];
    let h = `<path class="cel-trail" pathLength="100" d="${trail}" fill="none" style="stroke:var(--hike)" stroke-width="4" stroke-linecap="round"/>`;
    if (theme === 'fjell') // red trail marks appear along the way
      h += [[60, 153], [120, 144], [168, 122], [190, 90], [203, 55]].map(([x, y], i) =>
        `<path class="cel-pop" style="fill:var(--acc);animation-delay:${(0.3 + i * 0.4).toFixed(1)}s" d="M${x - 6} ${y - 8} h12 v3.5 h-4.2 v8 h-3.6 v-8 h-4.2z"/>`).join('');
    else {
      const [x, y] = theme === 'fjord' ? [322, 26] : [262, 104];
      h += `<circle class="cel-pop" style="fill:var(--hike);stroke:var(--bg);animation-delay:2.1s" stroke-width="3" cx="${x}" cy="${y}" r="7"/>`;
    }
    return h;
  }
  if (theme === 'fjord') return `<path pathLength="100" d="M30 146 C 70 130, 90 110, 105 80 S 122 45, 130 30" fill="none" style="stroke:var(--ink)" stroke-width="2" stroke-dasharray="1 3" stroke-linecap="round" opacity=".35"/>
    <path class="cel-trail" pathLength="100" d="M30 146 C 70 130, 90 110, 105 80 S 122 45, 130 30" fill="none" style="stroke:var(--acc)" stroke-width="4" stroke-linecap="round"/>
    <g class="cel-flag"><path d="M130 31 V-6" style="stroke:var(--ink)" stroke-width="2.5" stroke-linecap="round"/><path d="M131 -5 L160 3 L131 12Z" style="fill:var(--acc)"/></g>`;
  if (theme === 'fjell') return [[195, 152, 30, 10, '#7E878E'], [192, 135, 23, 9, '#99A1A7'], [197, 120, 17, 8, '#7E878E'], [194, 107, 12, 7, '#AEB7BE']]
    .map(([x, y, rx, ry, c], i) => `<g class="cel-stone" style="animation-delay:${(0.2 + i * 0.5).toFixed(1)}s"><ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${c}"/>${i === 3
      ? `<path d="M${x - 7} ${y - 4} h14 v3 h-5.5 v7 h-3 v-7 h-5.5z" style="fill:var(--acc)"/>` : ''}</g>`).join('');
  return ''; // midnattssol: the sun rises (CSS on .sun)
}

function confetti(n) {
  const st = getComputedStyle(document.documentElement), v = k => st.getPropertyValue(k).trim();
  const colors = [v('--acc'), v('--hike'), v('--soft'), v('--card'), v('--hike-soft'), v('--acc')];
  let h = '';
  for (let i = 0; i < n; i++) {
    const w = 6 + Math.round(Math.random() * 6);
    h += `<i style="left:${Math.round(Math.random() * 100)}%;width:${w}px;height:${Math.round(w * (1.2 + Math.random()))}px;background:${colors[i % colors.length]};--d:${(2.4 + Math.random() * 1.4).toFixed(2)}s;--w:${(Math.random() * 0.9).toFixed(2)}s"></i>`;
  }
  return `<div class="confetti" aria-hidden="true">${h}</div>`;
}

// biggest top-weight increase in this workout compared to the last time each exercise was done
function bestGain(s) {
  let best = null;
  for (const en of Object.values(s.entries)) {
    const top = Math.max(0, ...en.sets.map(st => st.kg || 0)), last = lastFor(en.name, s.date, s);
    if (!top || !last) continue;
    const gain = round1(top - Math.max(0, ...last.entry.sets.map(st => st.kg || 0)));
    if (gain > 0 && (!best || gain > best.gain)) best = { gain, name: en.name };
  }
  return best;
}
function daysThisWeek(date) {
  const d = new Date(date + 'T12:00:00'); d.setDate(d.getDate() - (d.getDay() + 6) % 7);
  const mon = new Date(d.getTime() - d.getTimezoneOffset() * 6e4).toISOString().slice(0, 10);
  return new Set(S.sessions.filter(s => s.date >= mon && s.date <= date).map(s => s.dayId)).size;
}

function celebrate(kind, x) {
  const theme = curTheme(), name = S.profile.name, who = name ? ', ' + esc(name) : '';
  let kick, title, sub, stats;
  if (kind === 'workout') {
    const d = dayById(x.dayId), en = Object.values(x.entries), gain = bestGain(x);
    kick = 'ØKT FULLFØRT';
    title = (theme === 'midnattssol' ? 'Herlig' : 'Toppen nådd') + who + '!';
    sub = `${esc(d.name)} is done.` + (theme === 'fjell' ? ' En stein til på varden.' : theme === 'midnattssol' ? ' ' + saying() + '.' : '');
    stats = [[`${d.exercises.length}/${d.exercises.length}`, 'exercises'], [`${daysThisWeek(x.date)} of ${S.days.length}`, 'days this week'],
      gain ? [`+${fmtN(gain.gain)} kg`, esc(gain.name)] : [String(en.reduce((a, e) => a + e.sets.length, 0)), 'sets']];
  } else {
    kick = 'TUR FULLFØRT';
    title = 'Godt gått' + who + '!';
    sub = 'Another hike in the legs. Fjellet venter.';
    stats = [[`<span id="cel-km">0</span> km`, 'distance'], [fmtDur(x.min), 'time'], x.elev ? [`${x.elev} m`, 'elevation'] : [paceText(x.km, x.min).split(' · ')[1] || '—', 'speed']];
  }
  const el = document.createElement('div');
  el.className = 'cel'; el.setAttribute('role', 'dialog'); el.setAttribute('aria-label', kick);
  el.innerHTML = `<div class="cel-scene">${landscape(theme, curMode(), { cls: 'cel-art', top: 110, extra: sceneExtra(theme, kind), rays: theme === 'midnattssol', fit: 'meet' })}</div>
    <div class="cel-body"><div class="cel-kick">${kick}</div><h1>${title}</h1><p class="sub">${sub}</p>
      <div class="stats">${stats.map(([v, k]) => `<div class="stat"><div class="v">${v}</div><div class="k">${k}</div></div>`).join('')}</div></div>
    <button class="btn primary cel-done" data-act="cel-close">Ferdig</button>
    ${still() ? '' : confetti(44)}`;
  document.body.appendChild(el);
  if (kind === 'hike') countUp($('#cel-km'), x.km);
}
function countUp(el, to) {
  if (still()) { el.textContent = fmtN(to); return; }
  const t0 = performance.now(), dur = 2000;
  const step = t => { const p = Math.min(1, (t - t0) / dur); el.textContent = fmtN(round1(to * (1 - Math.pow(1 - p, 3)))); if (p < 1) requestAnimationFrame(step); };
  requestAnimationFrame(step);
}

// a workout is complete once every exercise of the day is logged; celebrate that only once
function checkComplete(s) {
  const d = dayById(s.dayId);
  if (s.celebrated || !d.exercises.length || !d.exercises.every(e => s.entries[e.id] && s.entries[e.id].logged)) return;
  s.celebrated = true; save(); celebrate('workout', s);
}
