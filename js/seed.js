/* ---------- seed program ---------- */
function ex(name, section, target, unit = 'reps', weighted = true, perSide = false) {
  return { id: uid(), name, section, target, unit, weighted, perSide };
}
function seedDays() {
  return [
    { id: uid(), name: 'Day A · Strength & pull', exercises: [
      ex('Warm-up A', 'Warm-up', '10 min easy run, then 1 min single-leg balance', 'done', false),
      ex('Goblet squat', 'Legs', '3×10 · 8–10 → 15–24 kg'),
      ex('Romanian deadlift', 'Legs', '3×10 · 12 → 24–36 kg (both dumbbells)'),
      ex('Side steps / hip abduction', 'Legs', '2×12 per side · light–medium band or machine', 'reps', true, true),
      ex('Calf raises', 'Legs', '2×15 · body weight → 8–12 kg dumbbell'),
      ex('Lat pulldown', 'Upper body & core', '3×12 · 25–30 → 24–36 kg'),
      ex('Seated row', 'Upper body & core', '3×12 · 20 → 21–33 kg'),
      ex('Bird dog', 'Upper body & core', '2×8 per side · body weight', 'reps', false, true)
    ]},
    { id: uid(), name: 'Day B · Balance & core', exercises: [
      ex('Warm-up B', 'Warm-up', '10 min easy StairMaster, then 1 min single-leg balance', 'done', false),
      ex('Step-ups', 'Legs', '3×10 per leg · body weight → 3–6 kg per hand', 'reps', true, true),
      ex('Lunges', 'Legs', '3×10 per leg · body weight → 3–6 kg per hand', 'reps', true, true),
      ex('Step-downs', 'Legs', '2×8 per leg · body weight', 'reps', false, true),
      ex('Calf raises', 'Legs', '2×15 · same as Day A'),
      ex('Plank', 'Core', '3×30 sec → build to 45–60 sec', 'sec', false),
      ex('Side plank', 'Core', '2×20 sec per side → build to 30–45 sec', 'sec', false, true),
      ex('Dead bug', 'Core', '2×8 per side', 'reps', false, true)
    ]},
    { id: uid(), name: 'Day C · Power & push', exercises: [
      ex('Warm-up C', 'Warm-up', '10 min incline treadmill walk, then 1 min single-leg balance', 'done', false),
      ex('Leg press', 'Legs', '3×12 · 30–40 → 45–75 kg (machines vary)'),
      ex('Bulgarian split squat', 'Legs', '2×8 per leg · body weight → 3–6 kg per hand', 'reps', true, true),
      ex('Hip thrust', 'Legs', '3×12 · glute bridge → 30–48 kg barbell'),
      ex('Push-ups', 'Upper body & core', '3×8–10 · knees/bench → full push-ups (note which)', 'reps', false),
      ex('Shoulder press', 'Upper body & core', '2×12 · 3–4 → 3–6 kg per dumbbell'),
      ex("Farmer's carry", 'Upper body & core', '2 rounds of 20–30 m · 8–10 → 15 kg per hand', 'm'),
      ex('Woodchop', 'Upper body & core', '2×10 per side · 5 → 8–10 kg', 'reps', true, true)
    ]}
  ];
}

