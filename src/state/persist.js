// src/state/persist.js
const STORAGE_KEY = "iron_pulse_v2_state_v1";

export function loadPersistedState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
}

export function savePersistedState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore write errors
  }
}

// Only keep durable state; drop UI stuff like modals
export function selectPersistSubset(state) {
  return {
    goals: { weeklyGoal: state?.goals?.weeklyGoal ?? 2 },

    log: {
      sets: Array.isArray(state?.log?.sets) ? state.log.sets : [],
      sessions: Array.isArray(state?.log?.sessions) ? state.log.sessions : [],
    },

    streak: {
      weekId: state?.streak?.weekId ?? null,
      streakWeeks: state?.streak?.streakWeeks ?? 0,
      lastSessionDay: state?.streak?.lastSessionDay ?? null,
    },

    program: {
      todayOverride: state?.program?.todayOverride ?? null,

      // persist swaps (durable, but we’ll usually clear per day)
      exerciseSwapsByDay:
        state?.program?.exerciseSwapsByDay && typeof state.program.exerciseSwapsByDay === "object"
          ? state.program.exerciseSwapsByDay
          : {},
    },
  };
}
