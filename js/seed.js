/* ---------- seed program ---------- */
function ex(name, section, target, unit = 'reps', weighted = true, perSide = false) {
  return { id: uid(), name, section, target, unit, weighted, perSide };
}
function seedDays() {
  return [
    { id: uid(), name: 'Strength & core', exercises: [
      ex('Warm-up', 'Warm-up', '', 'done', false),
      ex('Goblet squat', 'Legs', '3×10 · 8–10 → 15–24 kg'),
      ex('Romanian deadlift', 'Legs', '3×10 · 12 → 24–36 kg (both dumbbells)'),
      ex('Calf raises', 'Legs', '2×15 · body weight → 8–12 kg dumbbell'),
      ex('Glute bridge', 'Legs', '3×12 · body weight → 30–48 kg barbell'),
      ex('Plank', 'Core', '3×30 sec → build to 45–60 sec', 'sec', false),
      ex('Russian twist', 'Core', '3×10 per side · 2–4 → 6–10 kg', 'reps', true, true)
    ]},
    { id: uid(), name: 'Legs & push', exercises: [
      ex('Warm-up', 'Warm-up', '', 'done', false),
      ex('Step-ups', 'Legs', '3×10 per leg · body weight → 3–6 kg per hand', 'reps', true, true),
      ex('Lunges', 'Legs', '3×10 per leg · body weight → 3–6 kg per hand', 'reps', true, true),
      ex('Leg press', 'Legs', '3×12 · 30–40 → 45–75 kg (machines vary)'),
      ex('Lat pulldown', 'Upper body', '3×12 · 25–30 → 24–36 kg'),
      ex('Overhead press', 'Upper body', '2×12 · 3–4 → 3–6 kg per dumbbell')
    ]},
    { id: uid(), name: 'Balance & pull', exercises: [
      ex('Warm-up', 'Warm-up', '', 'done', false),
      ex('Bulgarian split squat', 'Legs', '2×8 per leg · body weight → 3–6 kg per hand', 'reps', true, true),
      ex('Step-downs', 'Legs', '2×8 per leg · body weight', 'reps', false, true),
      ex('Side steps / hip abduction', 'Legs', '2×12 per side · light–medium band or machine', 'reps', true, true),
      ex('Bench press', 'Upper body', '3×10 · empty bar (15–20 kg) → 25–35 kg'),
      ex('Seated row', 'Upper body', '3×12 · 20 → 21–33 kg')
    ]}
  ];
}
