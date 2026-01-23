import { dayKey } from "../../state/date.js";

/**
 * Simple, extendable "Program Engine"
 * - Input: weeklyGoal (2..7) + date
 * - Output: a plan: { splitName, label, exercises[] }
 *
 * exercises: { id, name, repsHint?, setsHint? }
 * (Hints are optional. We can add later without backtracking.)
 */

const EX = {
  bench: { id: "bench", name: "Bench Press" },
  inclineDb: { id: "inclineDb", name: "Incline DB Press" },
  ohp: { id: "ohp", name: "Overhead Press" },
  dips: { id: "dips", name: "Dips" },
  triceps: { id: "triceps", name: "Triceps Pushdown" },

  row: { id: "row", name: "Cable Row" },
  lat: { id: "lat", name: "Lat Pulldown" },
  pullups: { id: "pullups", name: "Pull-ups" },
  curls: { id: "curls", name: "Bicep Curls" },
  facepull: { id: "facepull", name: "Face Pulls" },

  squat: { id: "squat", name: "Squat" },
  rdl: { id: "rdl", name: "Romanian Deadlift" },
  legpress: { id: "legpress", name: "Leg Press" },
  calves: { id: "calves", name: "Calf Raises" },
  core: { id: "core", name: "Core (Plank)" },

  full1: { id: "full1", name: "Goblet Squat" },
  full2: { id: "full2", name: "Push-ups" },
  full3: { id: "full3", name: "DB Rows" },
  full4: { id: "full4", name: "RDL (Light)" },
  full5: { id: "full5", name: "Farmer Carry" },
};

const SPLITS = {
  PUSH: {
    splitName: "Push",
    label: "Push (recommended)",
    exercises: [EX.bench, EX.inclineDb, EX.ohp, EX.dips, EX.triceps],
  },
  PULL: {
    splitName: "Pull",
    label: "Pull (recommended)",
    exercises: [EX.row, EX.lat, EX.pullups, EX.facepull, EX.curls],
  },
  LEGS: {
    splitName: "Legs",
    label: "Legs (recommended)",
    exercises: [EX.squat, EX.rdl, EX.legpress, EX.calves, EX.core],
  },
  FULL: {
    splitName: "Full Body",
    label: "Full Body (recommended)",
    exercises: [EX.full1, EX.full2, EX.full3, EX.full4, EX.full5],
  },
  LIGHT: {
    splitName: "Light",
    label: "Light / Recovery (recommended)",
    exercises: [EX.core, EX.calves, EX.facepull, EX.curls],
  },
};

/**
 * Map weeklyGoal -> split sequence for the week.
 * Keep this simple now; easy to tweak later.
 */
function getWeeklySequence(weeklyGoal) {
  const g = Math.min(7, Math.max(2, Number(weeklyGoal) || 2));

  // Philosophy:
  // 2–3 days: Full Body emphasis (more bang per day)
  // 4–5 days: PPL with extra day if needed
  // 6–7 days: lighter day(s) built in to reduce burnout
  if (g === 2) return [SPLITS.FULL, SPLITS.FULL];
  if (g === 3) return [SPLITS.FULL, SPLITS.PUSH, SPLITS.FULL];

  if (g === 4) return [SPLITS.PUSH, SPLITS.PULL, SPLITS.LEGS, SPLITS.FULL];
  if (g === 5) return [SPLITS.PUSH, SPLITS.PULL, SPLITS.LEGS, SPLITS.PUSH, SPLITS.FULL];

  if (g === 6) return [SPLITS.PUSH, SPLITS.PULL, SPLITS.LEGS, SPLITS.PUSH, SPLITS.PULL, SPLITS.LIGHT];
  return [SPLITS.PUSH, SPLITS.PULL, SPLITS.LEGS, SPLITS.PUSH, SPLITS.PULL, SPLITS.LEGS, SPLITS.LIGHT];
}

/**
 * Returns the recommended plan for the date based on weeklyGoal and an optional override index.
 * overrideIndex lets you "skip" to next split without rewriting the engine.
 */
export function getRecommendedPlan({ weeklyGoal, date = new Date(), overrideIndex = null } = {}) {
  const seq = getWeeklySequence(weeklyGoal);
  const dow = date.getDay(); // 0=Sun..6=Sat
  const index = overrideIndex != null ? (overrideIndex % seq.length) : (dow % seq.length);
  const base = seq[index];

  return {
    dayId: dayKey(date),
    splitIndex: index,
    splitName: base.splitName,
    label: base.label,
    exercises: base.exercises,
  };
}

/**
 * Small helper to get the next split index (for Skip).
 */
export function nextSplitIndex(currentIndex, weeklyGoal) {
  const seq = getWeeklySequence(weeklyGoal);
  return (Number(currentIndex) + 1) % seq.length;
}
