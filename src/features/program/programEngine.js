// src/features/program/programEngine.js
import { dayKey } from "../../state/date.js";
import { ex } from "./exerciseCatalog.js";

// 0 = Mon ... 6 = Sun (Monday = 0)
function dayIndex(date) {
  const js = date.getDay(); // 0 Sun ... 6 Sat
  return (js + 6) % 7;
}

function getPool(weeklyGoal) {
  const g = Math.max(2, Math.min(7, Number(weeklyGoal || 2)));
  return SPLITS[g] || SPLITS[2];
}

/**
 * overrideToday: { dayId, mode: "skip" | "override", offset?: number }
 * swapOverrides: { [splitName]: { [slotIndex1Based]: "exercise_catalog_id" } }
 */
export function getRecommendedPlan({ weeklyGoal, date, overrideToday, swapOverrides }) {
  const pool = getPool(weeklyGoal);
  const todayId = dayKey(date);

  const baseIdx = dayIndex(date) % pool.length;
  let idx = baseIdx;

  if (overrideToday && overrideToday.dayId === todayId) {
    if (overrideToday.mode === "skip") {
      idx = (baseIdx + 1) % pool.length;
    } else if (overrideToday.mode === "override") {
      const offset = Number(overrideToday.offset || 1);
      idx = (baseIdx + offset) % pool.length;
    }
  }

  const rawPlan = pool[idx] || pool[baseIdx];

  // Apply exercise overrides by split + slot (1-based slots)
  const overridden = applySwapOverrides(rawPlan.exercises || [], rawPlan.splitName, swapOverrides);

  // normalize exercises -> {id,name,helper,suggestedReps,group}
  const exercises = overridden.map((item) => {
    if (item && typeof item === "object") {
      return {
        id: item.id || "",
        name: item.name || "Exercise",
        helper: item.helper || "",
        suggestedReps: item.suggestedReps ?? null,
        group: item.group || "other",
      };
    }

    const e = ex(item);
    return {
      id: e.id,
      name: e.name,
      helper: e.helper || "",
      suggestedReps: e.suggestedReps ?? null,
      group: e.group || "other",
    };
  });

  return {
    splitName: rawPlan.splitName || "split",
    label: rawPlan.label || rawPlan.splitName || "Split",
    exercises,
  };
}

/**
 * swapOverrides: { [splitName]: { [slotIndex1Based]: "exercise_id" } }
 * slotIndex is 1..N (human-friendly)
 */
function applySwapOverrides(exercises, splitName, swapOverrides) {
  if (!swapOverrides || !splitName) return exercises;

  const bySplit = swapOverrides[splitName];
  if (!bySplit) return exercises;

  const out = exercises.slice();

  for (const [slotStr, newId] of Object.entries(bySplit)) {
    const slot1 = Number(slotStr);
    if (!Number.isFinite(slot1)) continue;

    const idx0 = slot1 - 1; // 1-based -> 0-based
    if (idx0 < 0 || idx0 >= out.length) continue;

    if (typeof newId !== "string" || !newId.trim()) continue;

    out[idx0] = ex(newId.trim());
  }

  return out;
}

/**
 * IMPORTANT:
 * Your SPLITS reference catalog IDs only.
 * ex("bench_press") ✅
 */
const SPLITS = {
  2: [
    {
      splitName: "fullA",
      label: "Full Body A",
      exercises: [ex("squat"), ex("bench_press"), ex("row"), ex("overhead_press"), ex("lat_pulldown"), ex("romanian_deadlift")],
    },
    {
      splitName: "fullB",
      label: "Full Body B",
      exercises: [ex("deadlift"), ex("incline_press"), ex("lat_pulldown"), ex("leg_press"), ex("seated_row"), ex("lateral_raise")],
    },
  ],

  3: [
    { splitName: "fullA", label: "Full Body A", exercises: [ex("squat"), ex("bench_press"), ex("row"), ex("lat_pulldown"), ex("romanian_deadlift")] },
    { splitName: "fullB", label: "Full Body B", exercises: [ex("leg_press"), ex("incline_press"), ex("seated_row"), ex("overhead_press"), ex("hamstring_curl")] },
    { splitName: "fullC", label: "Full Body C", exercises: [ex("deadlift"), ex("bench_press"), ex("lat_pulldown"), ex("bulgarian_split_squat"), ex("row")] },
  ],

  4: [
    { splitName: "upperA", label: "Upper A", exercises: [ex("bench_press"), ex("row"), ex("overhead_press"), ex("lat_pulldown"), ex("triceps_pushdown")] },
    { splitName: "lowerA", label: "Lower A", exercises: [ex("squat"), ex("romanian_deadlift"), ex("leg_press"), ex("calf_raise"), ex("core_choice")] },
    { splitName: "upperB", label: "Upper B", exercises: [ex("incline_press"), ex("seated_row"), ex("lateral_raise"), ex("face_pull"), ex("bicep_curl")] },
    { splitName: "lowerB", label: "Lower B", exercises: [ex("deadlift"), ex("bulgarian_split_squat"), ex("hamstring_curl"), ex("calf_raise"), ex("core_choice")] },
  ],

  5: [
    { splitName: "push", label: "Push", exercises: [ex("bench_press"), ex("incline_press"), ex("overhead_press"), ex("lateral_raise"), ex("triceps_pushdown")] },
    { splitName: "pull", label: "Pull", exercises: [ex("deadlift"), ex("lat_pulldown"), ex("seated_row"), ex("face_pull"), ex("bicep_curl")] },
    { splitName: "legs", label: "Legs", exercises: [ex("squat"), ex("romanian_deadlift"), ex("leg_press"), ex("hamstring_curl"), ex("calf_raise")] },
    { splitName: "upper", label: "Upper (lighter)", exercises: [ex("bench_press"), ex("row"), ex("overhead_press"), ex("lat_pulldown"), ex("lateral_raise")] },
    { splitName: "lower", label: "Lower (lighter)", exercises: [ex("leg_press"), ex("lunges"), ex("hamstring_curl"), ex("calf_raise"), ex("core_choice")] },
  ],

  6: [
    { splitName: "pushA", label: "Push A", exercises: [ex("bench_press"), ex("overhead_press"), ex("incline_press"), ex("lateral_raise"), ex("triceps_pushdown")] },
    { splitName: "pullA", label: "Pull A", exercises: [ex("deadlift"), ex("lat_pulldown"), ex("seated_row"), ex("face_pull"), ex("bicep_curl")] },
    { splitName: "legsA", label: "Legs A", exercises: [ex("squat"), ex("romanian_deadlift"), ex("leg_press"), ex("hamstring_curl"), ex("calf_raise")] },
    { splitName: "pushB", label: "Push B", exercises: [ex("incline_press"), ex("bench_press"), ex("overhead_press"), ex("lateral_raise"), ex("triceps_pushdown")] },
    { splitName: "pullB", label: "Pull B", exercises: [ex("row"), ex("lat_pulldown"), ex("seated_row"), ex("face_pull"), ex("bicep_curl")] },
    { splitName: "legsB", label: "Legs B", exercises: [ex("deadlift"), ex("bulgarian_split_squat"), ex("hamstring_curl"), ex("leg_press"), ex("calf_raise")] },
  ],

  7: [
    { splitName: "pushA", label: "Push A", exercises: [ex("bench_press"), ex("overhead_press"), ex("incline_press"), ex("lateral_raise"), ex("triceps_pushdown")] },
    { splitName: "pullA", label: "Pull A", exercises: [ex("deadlift"), ex("lat_pulldown"), ex("seated_row"), ex("face_pull"), ex("bicep_curl")] },
    { splitName: "legsA", label: "Legs A", exercises: [ex("squat"), ex("romanian_deadlift"), ex("leg_press"), ex("hamstring_curl"), ex("calf_raise")] },
    { splitName: "pushB", label: "Push B", exercises: [ex("incline_press"), ex("bench_press"), ex("overhead_press"), ex("lateral_raise"), ex("triceps_pushdown")] },
    { splitName: "pullB", label: "Pull B", exercises: [ex("row"), ex("lat_pulldown"), ex("seated_row"), ex("face_pull"), ex("bicep_curl")] },
    { splitName: "legsB", label: "Legs B", exercises: [ex("deadlift"), ex("bulgarian_split_squat"), ex("hamstring_curl"), ex("leg_press"), ex("calf_raise")] },
    { splitName: "pump", label: "Pump / Accessories", exercises: [ex("lateral_raise"), ex("face_pull"), ex("bicep_curl"), ex("triceps_pushdown"), ex("core_choice")] },
  ],
};
