/** Infer muscle group from free-text exercise names (logged in workouts). */
const MUSCLE_RULES = [
  { group: 'Chest', keywords: ['chest', 'bench', 'pectoral', 'fly', 'push-up', 'pushup', 'dip', 'crossover'] },
  { group: 'Back', keywords: ['back', 'lat', 'row', 'pull-up', 'pullup', 'pulldown', 'deadlift', 'shrug'] },
  { group: 'Legs', keywords: ['leg', 'quad', 'hamstring', 'glute', 'squat', 'lunge', 'calf', 'leg press', 'hack'] },
  { group: 'Shoulders', keywords: ['shoulder', 'deltoid', 'ohp', 'overhead', 'lateral raise', 'rear delt'] },
  { group: 'Biceps', keywords: ['bicep', 'curl', 'hammer'] },
  { group: 'Triceps', keywords: ['tricep', 'extension', 'skullcrusher', 'pushdown', 'pressdown'] },
  { group: 'Abs', keywords: ['core', 'ab ', 'abs', 'plank', 'crunch'] },
];

export function inferMuscleGroup(name) {
  const n = String(name || '').toLowerCase();
  for (const { group, keywords } of MUSCLE_RULES) {
    if (keywords.some((k) => n.includes(k))) return group;
  }
  return 'Other';
}

function parseNum(v) {
  const n = parseFloat(String(v).replace(',', '.'));
  return Number.isFinite(n) ? n : null;
}

/** Max weight logged for an exercise in one session (best set by weight). */
export function maxWeightForExercise(exercise) {
  let max = 0;
  for (const set of exercise.sets || []) {
    const w = parseNum(set.weight);
    if (w != null && w > max) max = w;
  }
  return max;
}

function liftSeriesKey(name) {
  const n = String(name || '').toLowerCase();
  if ((/bench|incline|decline/.test(n) || /dumbbell press/.test(n)) && !/shoulder|arnold|overhead/.test(n)) {
    return 'bench';
  }
  if (/squat|leg press|hack squat|goblet squat/.test(n)) return 'squat';
  if (/deadlift|\brdl\b|romanian/.test(n)) return 'deadlift';
  return null;
}

function formatMonthLabel(year, monthIndex) {
  return new Date(year, monthIndex, 1).toLocaleString('default', { month: 'short' });
}

/**
 * Last `months` calendar months (including current), each with max bench/squat/deadlift from history.
 */
export function buildLiftProgression(workoutHistory, months = 6) {
  const now = new Date();
  const buckets = [];
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    buckets.push({
      key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
      label: formatMonthLabel(d.getFullYear(), d.getMonth()),
      bench: null,
      squat: null,
      deadlift: null,
    });
  }

  for (const session of workoutHistory || []) {
    if (!session?.date || !session.exercises?.length) continue;
    const ym = session.date.slice(0, 7);
    const bucket = buckets.find((b) => b.key === ym);
    if (!bucket) continue;

    for (const ex of session.exercises) {
      const series = liftSeriesKey(ex.name);
      if (!series) continue;
      const m = maxWeightForExercise(ex);
      if (m <= 0) continue;
      const cur = bucket[series];
      if (cur == null || m > cur) bucket[series] = m;
    }
  }

  // Forward-fill so lines connect when a month had no matching lift
  let lastB = null;
  let lastS = null;
  let lastD = null;
  return buckets.map((b) => {
    if (b.bench != null) lastB = b.bench;
    if (b.squat != null) lastS = b.squat;
    if (b.deadlift != null) lastD = b.deadlift;
    return {
      month: b.label,
      bench: b.bench ?? lastB,
      squat: b.squat ?? lastS,
      deadlift: b.deadlift ?? lastD,
    };
  });
}

/** Sets completed per muscle group (from exercise names in all sessions). */
export function buildMuscleDistribution(workoutHistory) {
  const counts = {};
  for (const session of workoutHistory || []) {
    const exercises = session.exercises;
    if (!exercises?.length) continue;
    for (const ex of exercises) {
      const g = inferMuscleGroup(ex.name);
      const n = (ex.sets && ex.sets.length) || 0;
      counts[g] = (counts[g] || 0) + n;
    }
  }

  const order = ['Chest', 'Back', 'Biceps', 'Triceps', 'Shoulders', 'Abs', 'Legs'];
  const rows = order
    .map((name) => ({ name, value: counts[name] || 0 }));

  return rows;
}

function padDate(y, m, d) {
  return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

/** GitHub-style grid: columns = weeks, rows = Mon–Sun; values -1 future, 0 none, 1–3 intensity */
export function buildConsistencyHeatmap(workoutHistory, weeks = 52) {
  const dayStats = new Map();
  for (const session of workoutHistory || []) {
    if (!session?.date) continue;
    const prev = dayStats.get(session.date) || { sets: 0, volume: 0, seconds: 0 };
    prev.seconds += session.time || 0;
    prev.volume += session.totalVolume || 0;
    if (session.exercises?.length) {
      prev.sets += session.exercises.reduce((a, e) => a + (e.sets?.length || 0), 0);
    } else {
      prev.sets += 1;
    }
    dayStats.set(session.date, prev);
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const start = new Date(today);
  start.setDate(start.getDate() - (weeks * 7 - 1));

  const grid = [];
  for (let w = 0; w < weeks; w++) {
    const column = [];
    for (let dow = 0; dow < 7; dow++) {
      const cell = new Date(start);
      cell.setDate(start.getDate() + w * 7 + dow);
      if (cell > today) {
        column.push({ intensity: -1, dateStr: null });
        continue;
      }
      const dateStr = padDate(cell.getFullYear(), cell.getMonth() + 1, cell.getDate());
      const stats = dayStats.get(dateStr);
      let intensity = 0;
      if (stats) {
        const { sets, volume, seconds } = stats;
        if (sets >= 18 || volume >= 4000 || seconds >= 3600) intensity = 3;
        else if (sets >= 8 || volume >= 1500 || seconds >= 1200) intensity = 2;
        else intensity = 1;
      }
      column.push({ intensity, dateStr });
    }
    grid.push(column);
  }
  return grid;
}

export function buildMonthlyConsistency(workoutHistory) {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  
  const weeks = [
     { week: 'Week 1', label: '1st - 7th', sets: 0, volume: 0, time: 0 },
     { week: 'Week 2', label: '8th - 14th', sets: 0, volume: 0, time: 0 },
     { week: 'Week 3', label: '15th - 21st', sets: 0, volume: 0, time: 0 },
     { week: 'Week 4', label: '22nd+', sets: 0, volume: 0, time: 0 }
  ];
  
  for (const session of workoutHistory || []) {
      if (!session?.date) continue;
      // Local date parsing correctly
      const parts = session.date.split('-');
      const d = new Date(parts[0], parts[1] - 1, parts[2]);
      
      if (d.getFullYear() === year && d.getMonth() === month) {
         const date = d.getDate();
         let wIdx = 0;
         if (date >= 8 && date <= 14) wIdx = 1;
         else if (date >= 15 && date <= 21) wIdx = 2;
         else if (date >= 22) wIdx = 3;
         
         const sets = session.totalSets ?? session.exercises?.reduce((a, e) => a + (e.sets?.length || 0), 0) ?? 0;
         weeks[wIdx].sets += sets;
         weeks[wIdx].volume += (session.totalVolume || 0);
         weeks[wIdx].time += (session.time || 0);
      }
  }
  return weeks;
}

export function hasAnalyticsData(workoutHistory) {
  return Array.isArray(workoutHistory) && workoutHistory.length > 0;
}

/** Consecutive calendar days (local) ending today that have at least one logged workout. */
export function computeCurrentStreak(workoutHistory) {
  const dates = new Set((workoutHistory || []).map((w) => w.date).filter(Boolean));
  if (dates.size === 0) return 0;
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  let streak = 0;
  for (;;) {
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    if (dates.has(key)) {
      streak++;
      d.setDate(d.getDate() - 1);
    } else break;
    if (streak > 4000) break;
  }
  return streak;
}

/** Distinct workout days in the last 7 calendar days (including today). */
export function computeWorkoutsLast7Days(workoutHistory) {
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  const start = new Date(end);
  start.setDate(start.getDate() - 6);
  start.setHours(0, 0, 0, 0);
  const seen = new Set();
  for (const w of workoutHistory || []) {
    if (!w.date) continue;
    const t = new Date(`${w.date}T12:00:00`);
    if (t >= start && t <= end) seen.add(w.date);
  }
  return seen.size;
}

export function buildQuickInsights(workoutHistory) {
  const out = [];
  const streak = computeCurrentStreak(workoutHistory);
  const week = computeWorkoutsLast7Days(workoutHistory);

  if (streak > 0) {
    out.push({ type: 'success', message: `You're on a ${streak}-day workout streak.` });
  }
  if (week === 0 && (workoutHistory?.length || 0) > 0) {
    out.push({
      type: 'warning',
      message: 'No logged sessions in the last 7 days. Even a short session keeps momentum.',
    });
  } else if (week === 0) {
    out.push({
      type: 'info',
      message: 'Finish a workout from the Workouts tab to build history, streaks, and analytics.',
    });
  } else {
    out.push({ type: 'success', message: `${week} workout day(s) logged in the last 7 days.` });
  }

  const dist = buildMuscleDistribution(workoutHistory);
  const chest = dist.find((x) => x.name === 'Chest')?.value || 0;
  const legs = dist.find((x) => x.name === 'Legs')?.value || 0;
  if (chest > 0 && legs > 0 && chest > legs * 2.5) {
    out.push({
      type: 'warning',
      message: 'Chest volume is much higher than legs lately — consider more lower-body work for balance.',
    });
  }

  out.push({
    type: 'info',
    message: 'On training days, prioritize protein, fluids, and sleep for recovery.',
  });

  return out.slice(0, 5);
}
