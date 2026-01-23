import { getWeekId } from "./time.js";
import { dayKey } from "./date.js";

export function countSessionsForWeek(state, weekId) {
  const sessions = state?.log?.sessions || [];
  return sessions.filter((s) => s.weekId === weekId).length;
}

export function selectSessionsThisWeek(state) {
  const nowWeek = getWeekId(new Date());
  return countSessionsForWeek(state, nowWeek);
}

// Optional helpers (nice to have)
export function selectTodayId() {
  return dayKey(new Date());
}

export function selectCurrentWeekId() {
  return getWeekId(new Date());
}
export function selectSetsToday(state) {
  const today = dayKey(new Date());
  return (state.log.sets || []).filter(s => s.dayId === today);
}

/**
 * Returns total volume logged today
 */
export function selectTodayVolume(state) {
  return selectSetsToday(state).reduce(
    (sum, s) => sum + (s.reps || 0) * (s.weight || 0),
    0
  );
}

/**
 * Returns unique exercises performed today
 */
export function selectExercisesToday(state) {
  const set = new Set();
  selectSetsToday(state).forEach(s => {
    if (s.exercise) set.add(s.exercise);
  });
  return Array.from(set);
}

/**
 * Returns whether today’s session was completed
 */
export function selectIsSessionCompletedToday(state) {
  const today = dayKey(new Date());
  return state.streak.lastSessionDay === today;
}

/**
 * Returns TODAY STATUS
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

/**
 * Aggregated Today Summary (future-proof)
 */
export function selectTodaySummary(state) {
  return {
    status: selectTodayStatus(state),
    sets: selectSetsToday(state).length,
    volume: selectTodayVolume(state),
    exercises: selectExercisesToday(state),
  };
}