/* ---------- themes: day/dusk, landscapes, Norwegian touches ---------- */
const THEMES = { fjord: 'Fjord', fjell: 'Fjell', midnattssol: 'Midnattssol' };
const HOME = { lat: 52.37, lon: 4.9 }; // Amsterdam: dusk follows its real sunset and sunrise

const curTheme = () => THEMES[S.profile.theme] ? S.profile.theme : 'fjord';

// sunrise/sunset as ms timestamps for the given day (NOAA approximation, ±2 min)
function sunTimes(d) {
  const rad = Math.PI / 180, base = Date.UTC(d.getFullYear(), d.getMonth(), d.getDate());
  const g = 2 * Math.PI / 365 * Math.floor((base - Date.UTC(d.getFullYear(), 0, 1)) / 864e5);
  const eqt = 229.18 * (0.000075 + 0.001868 * Math.cos(g) - 0.032077 * Math.sin(g) - 0.014615 * Math.cos(2 * g) - 0.040849 * Math.sin(2 * g));
  const decl = 0.006918 - 0.399912 * Math.cos(g) + 0.070257 * Math.sin(g) - 0.006758 * Math.cos(2 * g) + 0.000907 * Math.sin(2 * g) - 0.002697 * Math.cos(3 * g) + 0.00148 * Math.sin(3 * g);
  const ha = Math.acos(Math.cos(90.833 * rad) / (Math.cos(HOME.lat * rad) * Math.cos(decl)) - Math.tan(HOME.lat * rad) * Math.tan(decl)) / rad;
  const noon = 720 - 4 * HOME.lon - eqt;
  return { rise: base + (noon - 4 * ha) * 6e4, set: base + (noon + 4 * ha) * 6e4 };
}
function curMode() {
  const now = new Date(), t = sunTimes(now);
  return now < t.rise || now >= t.set ? 'dusk' : 'day';
}

function applyTheme() {
  const el = document.documentElement, theme = curTheme(), mode = curMode(), sky = ART[theme][mode].sky;
  el.dataset.theme = theme; el.dataset.mode = mode; el.style.setProperty('--sky', sky);
  $('meta[name="theme-color"]').content = sky;
  // iOS takes the home-screen icon at "Add to Home Screen", so point it at the current theme
  $('link[rel="apple-touch-icon"]').href = `icons/${theme}-180.png`;
  $('link[rel="icon"]').href = `icons/${theme}-512.png`;
}

/* ---------- landscapes ---------- */
const ART = {
  fjord: {
    h: 150,
    day: { sky: '#DCE8EC', back: '#BCD0D8', snow: '#FFFFFF', mid: '#86A8B7', front: '#3F6E82', water: '#2B5668', ripple: '#7FA3B3' },
    dusk: { sky: '#34546E', back: '#577A94', snow: '#C9D7DF', mid: '#40607A', front: '#2D4859', water: '#22394A', ripple: '#8CC3DD', moon: '#E9EEF0' },
    draw: c => `${c.moon ? `<circle cx="362" cy="16" r="9" fill="${c.moon}"/><circle cx="367" cy="13" r="8" fill="${c.sky}"/>
      <circle cx="60" cy="14" r="1.3" fill="${c.moon}"/><circle cx="196" cy="10" r="1" fill="${c.moon}"/><circle cx="262" cy="34" r="1.1" fill="${c.moon}"/>` : ''}
      <path d="M0 95 L40 62 L80 74 L130 30 L175 66 L220 44 L270 72 L322 26 L390 66 V150 H0Z" fill="${c.back}"/>
      <path d="M122 38 L130 30 L139 38 L134 36 L129 41Z M314 34 L322 26 L331 35 L326 33 L320 38Z" fill="${c.snow}"/>
      <path d="M0 112 L60 82 L112 100 L160 72 L215 104 L262 78 L330 108 L390 88 V150 H0Z" fill="${c.mid}"/>
      <path d="M0 128 L70 106 L140 120 L200 100 L280 124 L342 110 L390 118 V150 H0Z" fill="${c.front}"/>
      <rect y="130" width="390" height="20" fill="${c.water}"/>
      <path d="M30 137 H90 M150 141 H230 M280 137 H350" stroke="${c.ripple}" stroke-width="1.5" stroke-linecap="round"/>`
  },
  fjell: {
    h: 170,
    day: { sky: '#E4ECF1', back: '#AEB7BE', snow: '#FFFFFF', mid: '#5D666E', front: '#33393F', rock: '#7E878E' },
    dusk: { sky: '#4A4B63', back: '#6B6470', snow: '#F4B9A6', mid: '#474A51', front: '#33373C', rock: '#5E5A62', band1: '#6E5A72', band2: '#9A6E7A' },
    draw: c => `${c.band1 ? `<rect y="40" width="390" height="130" fill="${c.band1}"/><rect y="80" width="390" height="90" fill="${c.band2}"/>` : ''}
      <path d="M0 120 L70 64 L120 90 L210 14 L270 70 L310 48 L390 104 V170 H0Z" fill="${c.back}"/>
      <path d="M210 14 L236 44 L225 41 L214 51 L203 39 L190 46Z M310 48 L325 60 L316 59 L306 64Z" fill="${c.snow}"/>
      <path d="M0 145 L90 108 L150 126 L230 90 L300 124 L390 112 V170 H0Z" fill="${c.mid}"/>
      <path d="M0 162 L120 146 L250 156 L390 142 V170 H0Z" fill="${c.front}"/>
      <ellipse cx="340" cy="146" rx="13" ry="8" fill="${c.rock}"/>
      <path d="M334 141 H346 V144 H341.5 V150 H338.5 V144 H334Z" style="fill:var(--acc)"/>`
  },
  midnattssol: {
    h: 170,
    day: { sky: '#FCE9DA', halo: '#F6B98E', sun: '#F29A64', h1: '#D9B8CC', h2: '#A684B4', h3: '#6B4F8A', f1: '#F6B98E', f2: '#FBF7F1' },
    dusk: { sky: '#5E4670', halo: '#D98A6A', sun: '#F7B184', h1: '#7B5A86', h2: '#5A4270', h3: '#45345A', f1: '#F7B184', f2: '#E7D3E8', band1: '#8A5A72', band2: '#C27A6E' },
    draw: (c, o = {}) => `${c.band1 ? `<rect y="40" width="390" height="130" fill="${c.band1}"/><rect y="84" width="390" height="86" fill="${c.band2}"/>` : ''}
      <g class="sun">${o.rays ? `<g class="rays" stroke="${c.halo}" stroke-width="5" stroke-linecap="round"><path d="M292 -6 V-28 M240 46 H218 M344 46 H366 M255 9 L240 -6 M329 9 L344 -6 M255 83 L240 98 M329 83 L344 98"/></g>` : ''}
        <circle cx="292" cy="46" r="36" fill="${c.halo}"/><circle cx="292" cy="46" r="24" fill="${c.sun}"/></g>
      <path d="M0 104 Q60 62 120 90 T240 84 T390 100 V170 H0Z" fill="${c.h1}"/>
      <path d="M0 124 Q80 90 160 116 T320 108 T390 112 V170 H0Z" fill="${c.h2}"/>
      <path d="M0 150 Q100 130 200 146 T390 140 V170 H0Z" fill="${c.h3}"/>
      <circle cx="44" cy="158" r="3" fill="${c.f1}"/><circle cx="62" cy="163" r="2.5" fill="${c.f2}"/><circle cx="118" cy="156" r="3" fill="${c.sun}"/>
      <circle cx="232" cy="162" r="2.5" fill="${c.f2}"/><circle cx="340" cy="155" r="3" fill="${c.f1}"/>`
  }
};
// a theme's landscape; `top` adds sky above it (for the celebration), `extra` is drawn on top
function landscape(theme, mode, { cls = 'hero-art', top = 0, extra = '', rays = false, fit = 'slice' } = {}) {
  const a = ART[theme], h = a.h;
  return `<svg class="${cls}" viewBox="0 ${-top} 390 ${h + top}" preserveAspectRatio="xMidYMax ${fit}" style="aspect-ratio:390/${h + top}" aria-hidden="true">
    ${a.draw(a[mode], { rays })}${extra}<rect y="${h - 4}" width="390" height="4" style="fill:var(--bg)"/></svg>`;
}

const MARK = {
  fjord: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 5l2.5 7h-5z" fill="currentColor"/></svg>',
  fjell: '<span class="tmark">T</span>',
  midnattssol: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 17h18M7 17a5 5 0 0 1 10 0M12 4v3M5 8l2 2M19 8l-2 2"/></svg>'
};

/* ---------- Norwegian touches ---------- */
const SAYINGS = [
  'Ut på tur, aldri sur', 'Fjellet venter', 'Det finnes ikke dårlig vær, bare dårlige klær', 'Øvelse gjør mester',
  'Sakte, men sikkert', 'Steg for steg', 'Alle monner drar', 'Ingen fjell er for høye', 'Det er ingen skam å snu',
  'Nordover, alltid', 'Den lengste reisen begynner med ett skritt', 'Fjorden er stille', 'Toppen er bare halvveis',
  'Friluftsliv starter her', 'Bedre føre var enn etter snar'
];
function saying() {
  const d = new Date(), day = Math.floor((d - new Date(d.getFullYear(), 0, 0)) / 864e5);
  return SAYINGS[(day + d.getFullYear()) % SAYINGS.length];
}
function greeting() {
  const h = new Date().getHours(), name = S.profile.name;
  const g = curMode() === 'dusk' ? 'God kveld' : h < 11 ? 'God morgen' : 'Hei';
  return name ? `${g}, ${esc(name)}` : g;
}
function nbDate() {
  const s = new Date().toLocaleDateString('nb-NO', { weekday: 'long', day: 'numeric', month: 'long' });
  return s.charAt(0).toUpperCase() + s.slice(1);
}
function hero() {
  const theme = curTheme();
  return `<header class="hero"><div class="hero-txt">
    <div class="brand">${MARK[theme]}NORTHWARD</div>
    <h1>${greeting()}</h1>
    <p class="sub">${nbDate()} · ${saying()}</p></div>
    ${landscape(theme, curMode())}</header>`;
}
function themePicker() {
  const mode = curMode();
  return `<div class="themes">${Object.entries(THEMES).map(([k, name]) => `<button class="themecard ${k === curTheme() ? 'on' : ''}" data-act="theme-pick" data-theme="${k}" style="background:${ART[k][mode].sky}">
    ${landscape(k, mode, { cls: 'theme-art' })}<span>${name}</span></button>`).join('')}</div>`;
}

// switch day/dusk at sunset and sunrise while the app is open
setInterval(() => {
  const m = curMode();
  if (m === document.documentElement.dataset.mode) return;
  applyTheme();
  if (ui.tab === 'train' && !ui.dayId && !ui.hike) render();
}, 5 * 6e4);
