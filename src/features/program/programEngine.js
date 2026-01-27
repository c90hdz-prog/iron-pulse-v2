// src/features/program/programEngine.js
import { dayKey } from "../../state/date.js";
import { ex } from "./exerciseCatalog.js";


// 0 = Mon ... 6 = Sun
function dayIndex(date) {
  const js = date.getDay(); // 0 Sun ... 6 Sat
  return (js + 6) % 7;
}

function rotate(arr, offset = 0) {
  if (!arr.length) return arr;
  const n = ((offset % arr.length) + arr.length) % arr.length;
  return arr.slice(n).concat(arr.slice(0, n));
}

// ✅ Your SPLITS object stays as-is above this point.
// (Keep your SPLITS = { 2: [...], 3: [...], ... } exactly like you wrote it.)

function getPool(weeklyGoal) {
  const g = Math.max(2, Math.min(7, Number(weeklyGoal || 2)));
  return SPLITS[g] || SPLITS[2];
}

function basePlanFor({ weeklyGoal, date }) {
  const pool = getPool(weeklyGoal);
  const idx = dayIndex(date) % pool.length;
  return pool[idx];
}

export function getRecommendedPlan({ weeklyGoal, date, overrideToday }) {
  const todayId = dayKey(date);
  const pool = getPool(weeklyGoal);

  // 1) base pick
  const baseIdx = dayIndex(date) % pool.length;
  let idx = baseIdx;

  // 2) apply today-only override
  if (overrideToday && overrideToday.dayId === todayId) {
    if (overrideToday.mode === "skip") {
      idx = (baseIdx + 1) % pool.length;
    }

    if (overrideToday.mode === "override") {
      const offset = Number(overrideToday.offset || 1);
      idx = (baseIdx + offset) % pool.length;
    }
  }

  const plan = pool[idx] || pool[baseIdx];

  // 3) normalize exercises into {id,name,helper}
  const exercises = (plan.exercises || []).map((item) => {
    const e = typeof item === "string" ? ex(item) : item; // supports ex("Squat") objects already
    return { id: e.id, name: e.name, helper: e.helper || "" };
  });

  return { ...plan, exercises };
}
function slugId(name) {
  return String(name || "")
    .trim()
    .toLowerCase()
    .replaceAll(/[^a-z0-9]+/g, "-")
    .replaceAll(/^-+|-+$/g, "");
}

function pickByDay(list, date) {
  if (!list.length) return null;
  return list[dayIndex(date) % list.length];
}



// --- SPLITS (weight-log friendly, simple names) ---
const SPLITS = {
  2: [
    {
      splitName: "fullA",
      label: "Full Body A",
      exercises: [ex("Squat"), ex("Bench Press"), ex("Back Rows"), ex("Shoulder Press"), ex("Lat Pulldown"), ex("RDL")],
    },
    {
      splitName: "fullB",
      label: "Full Body B",
      exercises: [ex("Deadlift"), ex("Incline Press"), ex("Weighted Pull-up / Pulldown"), ex("Leg Press"), ex("Chest Supported Row"), ex("Lateral Raise")],
    },
  ],

  3: [
    { splitName: "fullA", label: "Full Body A", exercises: [ex("Squat"), ex("Bench Press"), ex("Back Rows"), ex("Lat Pulldown"), ex("RDL")] },
    { splitName: "fullB", label: "Full Body B", exercises: [ex("Leg Press"), ex("Incline Press"), ex("Chest Supported Row"), ex("Shoulder Press"), ex("Hamstring Curl")] },
    { splitName: "fullC", label: "Full Body C", exercises: [ex("Deadlift"), ex("Bench Press"), ex("Weighted Pull-up / Pulldown"), ex("Split Squat"), ex("Cable Row")] },
  ],

  4: [
    { splitName: "upperA", label: "Upper A", exercises: [ex("Bench Press"), ex("Back Rows"), ex("Shoulder Press"), ex("Lat Pulldown")] },
    { splitName: "lowerA", label: "Lower A", exercises: [ex("Squat"), ex("RDL"), ex("Leg Press"), ex("Calf Raise")] },
    { splitName: "upperB", label: "Upper B", exercises: [ex("Incline Press"), ex("Chest Supported Row"), ex("Lateral Raise"), ex("Cable Row")] },
    { splitName: "lowerB", label: "Lower B", exercises: [ex("Deadlift"), ex("Split Squat"), ex("Hamstring Curl"), ex("Leg Extension")] },
  ],

  5: [
    { splitName: "push", label: "Push", exercises: [ex("Bench Press"), ex("Incline Press"), ex("Shoulder Press"), ex("Lateral Raise")] },
    { splitName: "pull", label: "Pull", exercises: [ex("Back Rows"), ex("Lat Pulldown"), ex("Cable Row"), ex("Chest Supported Row")] },
    { splitName: "legs", label: "Legs", exercises: [ex("Squat"), ex("RDL"), ex("Leg Press"), ex("Hamstring Curl")] },
    { splitName: "upper", label: "Upper (lighter)", exercises: [ex("Bench Press"), ex("Back Rows"), ex("Shoulder Press")] },
    { splitName: "lower", label: "Lower (lighter)", exercises: [ex("Leg Press"), ex("Split Squat"), ex("Calf Raise")] },
  ],

  6: [
    { splitName: "pushA", label: "Push A", exercises: [ex("Bench Press"), ex("Shoulder Press"), ex("Incline Press")] },
    { splitName: "pullA", label: "Pull A", exercises: [ex("Back Rows"), ex("Lat Pulldown"), ex("Cable Row")] },
    { splitName: "legsA", label: "Legs A", exercises: [ex("Squat"), ex("RDL"), ex("Leg Press")] },
    { splitName: "pushB", label: "Push B", exercises: [ex("Incline Press"), ex("Bench Press"), ex("Lateral Raise")] },
    { splitName: "pullB", label: "Pull B", exercises: [ex("Chest Supported Row"), ex("Lat Pulldown"), ex("Back Rows")] },
    { splitName: "legsB", label: "Legs B", exercises: [ex("Deadlift"), ex("Split Squat"), ex("Hamstring Curl")] },
  ],

  7: [
    // reuse 6-day sequence
    { splitName: "pushA", label: "Push A", exercises: [ex("Bench Press"), ex("Shoulder Press"), ex("Incline Press")] },
    { splitName: "pullA", label: "Pull A", exercises: [ex("Back Rows"), ex("Lat Pulldown"), ex("Cable Row")] },
    { splitName: "legsA", label: "Legs A", exercises: [ex("Squat"), ex("RDL"), ex("Leg Press")] },
    { splitName: "pushB", label: "Push B", exercises: [ex("Incline Press"), ex("Bench Press"), ex("Lateral Raise")] },
    { splitName: "pullB", label: "Pull B", exercises: [ex("Chest Supported Row"), ex("Lat Pulldown"), ex("Back Rows")] },
    { splitName: "legsB", label: "Legs B", exercises: [ex("Deadlift"), ex("Split Squat"), ex("Hamstring Curl")] },

    // easy accessory day (still weight-loggable)
    { splitName: "pump", label: "Pump / Accessories (easy)", exercises: [ex("Lateral Raise"), ex("Cable Row"), ex("Leg Extension"), ex("Hamstring Curl")] },
  ],
};

function planListForGoal(weeklyGoal) {
  const g = Math.min(7, Math.max(2, Number(weeklyGoal || 2)));
  return SPLITS[g] || SPLITS[2];
}

function normalizePlan(raw) {
  const splitName = raw.splitName || slugId(raw.label || "split");
  const label = raw.label || splitName;

  // Ensure every exercise is an object: {id, name, helper}
  const exercises = (raw.exercises || []).map((item) => {
    // Your SPLITS already uses ex("Name") which returns an object
    if (item && typeof item === "object") {
      return {
        id: item.id || slugId(item.name),
        name: item.name || "Exercise",
        helper: item.helper || "",
      };
    }

    // Fallback if something is still a string
    const e = ex(item);
    return { id: e.id, name: e.name, helper: e.helper };
  });

  return { splitName, label, exercises };
}


