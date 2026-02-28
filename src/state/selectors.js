import { getWeekId } from "./time.js";
import { dayKey } from "./date.js";
import { calcWeekVolume, buildWeeklyGauge } from "../features/volume/volumeEngine.js";

// -------------------------
// Core selectors
// -------------------------
export const selectSets = (state) => (Array.isArray(state?.log?.sets) ? state.log.sets : []);

export const selectCurrentWeekId = (state) => state?.streak?.weekId || getWeekId(new Date());

export const selectCurrentWeekVolume = (state) => {
  const sets = selectSets(state);
  const weekId = selectCurrentWeekId(state);
  if (!weekId) return 0;
  return calcWeekVolume(sets, weekId);
};

export const selectCurrentWeekGauge = (state) => {
  const volume = selectCurrentWeekVolume(state);
  return buildWeeklyGauge(volume);
};

// -------------------------
// Today exercise focus
// -------------------------
export function selectSetsForTodayExercise(state, exerciseId) {
  const todayId = dayKey(new Date());
  const sets = Array.isArray(state?.log?.sets) ? state.log.sets : [];
  return sets
    .filter((s) => s.dayId === todayId && s.exerciseId === exerciseId)
    .sort((a, b) => (a.slotIndex ?? 999) - (b.slotIndex ?? 999) || (a.ts - b.ts));
}

export function selectTodayExerciseSummary(state, exerciseId) {
  const items = selectSetsForTodayExercise(state, exerciseId);
  const setsCount = items.length;
  const totalLbs = items.reduce((sum, s) => sum + (Number(s.reps) || 0) * (Number(s.weight) || 0), 0);
  return { setsCount, totalLbs };
}

// -------------------------
// Sessions / streak helpers
// -------------------------
export function countSessionsForWeek(state, weekId) {
  const sessions = state?.log?.sessions || [];
  return sessions.filter((s) => s.weekId === weekId).length;
}

export function selectSessionsThisWeek(state) {
  const weekId = selectCurrentWeekId(state);
  return countSessionsForWeek(state, weekId);
}

// -------------------------
// Today summary helpers
// -------------------------
export function selectTodayId() {
  return dayKey(new Date());
}

export function selectSetsToday(state) {
  const today = dayKey(new Date());
  return (state?.log?.sets || []).filter((s) => s.dayId === today);
}

/** Returns total volume logged today */
export function selectTodayVolume(state) {
  return selectSetsToday(state).reduce((sum, s) => sum + (s.reps || 0) * (s.weight || 0), 0);
}

/** Returns unique exercises performed today */
export function selectExercisesToday(state) {
  const set = new Set();
  selectSetsToday(state).forEach((s) => {
    if (s.exercise) set.add(s.exercise);
  });
  return Array.from(set);
}

/** Returns whether today’s session was completed */
export function selectIsSessionCompletedToday(state) {
  const today = dayKey(new Date());
  return state?.streak?.lastSessionDay === today;
}

/**
 * TODAY STATUS
 * - not_started
 * - in_progress
 * - completed
 */
export function selectTodayStatus(state) {
  const setsToday = selectSetsToday(state).length;
  const completed = selectIsSessionCompletedToday(state);

  if (completed) return "completed";
  if (setsToday > 0) return "in_progress";
  return "not_started";
}

/** Aggregated Today Summary */
export function selectTodaySummary(state) {
  return {
    status: selectTodayStatus(state),
    sets: selectSetsToday(state).length,
    volume: selectTodayVolume(state),
    exercises: selectExercisesToday(state),
  };
}

// -------------------------
// NEW: Weekly self-competition
// -------------------------
function prevWeekIdFromDate(now = new Date()) {
  return getWeekId(new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000));
}

export function selectLastWeekId(state) {
  // We compute last week based on "now". This matches your current UX.
  // If you want it based on streak.weekId instead, we can do that next.
  return prevWeekIdFromDate(new Date());
}

export function selectLastWeekVolume(state) {
  const sets = selectSets(state);
  const lastWeekId = selectLastWeekId(state);
  return calcWeekVolume(sets, lastWeekId);
}

export function selectBestWeekVolume(state) {
  const sets = selectSets(state);
  if (!sets.length) return 0;

  // Build a weekId -> volume map (fast enough for your current scale)
  const byWeek = new Map();
  for (const s of sets) {
    const w = s.weekId;
    if (!w) continue;
    const v = (Number(s.reps) || 0) * (Number(s.weight) || 0);
    byWeek.set(w, (byWeek.get(w) || 0) + v);
  }

  let best = 0;
  for (const v of byWeek.values()) best = Math.max(best, v);
  return Math.round(best);
}

export function selectWeekDelta(state) {
  const cur = selectCurrentWeekVolume(state);
  const last = selectLastWeekVolume(state);
  return Math.round(cur - last);
}

export function selectWeekCompetition(state) {
  const currentWeekId = selectCurrentWeekId(state);
  const lastWeekId = selectLastWeekId(state);

  const current = selectCurrentWeekVolume(state);
  const last = selectLastWeekVolume(state);
  const best = selectBestWeekVolume(state);

  const delta = Math.round(current - last);
  const ratio = current / Math.max(1, last);
  const pctToBest = best > 0 ? Math.min(1, current / best) : 0;

  return {
    currentWeekId,
    lastWeekId,
    current,
    last,
    best,
    delta,
    ratio,
    pctToBest,
  };
}