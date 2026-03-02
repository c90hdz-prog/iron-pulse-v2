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
  const today = dayKey(new Date());

  const afterburnEntry = state?.log?.afterburnByDay?.[today] || null;

  return {
    status: selectTodayStatus(state),
    sets: selectSetsToday(state).length,
    volume: selectTodayVolume(state),
    exercises: selectExercisesToday(state),

    afterburn: afterburnEntry
      ? {
          finisher: afterburnEntry.finisher,
          durationSec: afterburnEntry.durationSec,
        }
      : null,
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

// -------------------------
// Heatmap (last 90 days)
// -------------------------
function isoDay(date) {
  // YYYY-MM-DD local
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function addDays(date, delta) {
  const d = new Date(date);
  d.setDate(d.getDate() + delta);
  return d;
}

function volumeForDay(sets, dayId) {
  let v = 0;
  for (const s of sets || []) {
    if (!s || s.dayId !== dayId) continue;
    v += (Number(s.reps) || 0) * (Number(s.weight) || 0);
  }
  return Math.round(v);
}

// Turns raw volume into 0..4 intensity buckets (tweak thresholds later)
function volumeLevel(vol) {
  if (vol <= 0) return 0;
  if (vol < 3000) return 1;
  if (vol < 8000) return 2;
  if (vol < 15000) return 3;
  return 4;
}

export function selectHeatmap90(state) {
  const sets = selectSets(state);
  const afterburnByDay = state?.log?.afterburnByDay || {};
  const sessions = Array.isArray(state?.log?.sessions) ? state.log.sessions : [];

  const end = new Date(); // today
  const start = addDays(end, -89);

  // Build a fast lookup of completed-session days from sessions.ts
  const completedDays = new Set();
  for (const s of sessions) {
    const ts = Number(s?.ts);
    if (!Number.isFinite(ts) || ts <= 0) continue;
    completedDays.add(isoDay(new Date(ts)));
  }

  // Also include streak.lastSessionDay (covers edge cases)
  if (state?.streak?.lastSessionDay) {
    completedDays.add(state.streak.lastSessionDay);
  }

  const days = [];
  for (let i = 0; i < 90; i++) {
    const date = addDays(start, i);
    const dayId = isoDay(date);

    const vol = volumeForDay(sets, dayId);
    const didAfterburn = !!afterburnByDay[dayId];
    const didSession = completedDays.has(dayId);

    // C RULE: active if volume OR session OR afterburn
    const active = vol > 0 || didSession || didAfterburn;

    // Intensity: volume-based, but if active with 0 volume, show light level 1
    const lvl = vol > 0 ? volumeLevel(vol) : (active ? 1 : 0);

    days.push({
      dayId,
      date,
      volume: vol,
      level: lvl,
      afterburn: didAfterburn, // for your future ring/glow ✅
      session: didSession,     // new: for tooltip / styling later
    });
  }

  return days;
}