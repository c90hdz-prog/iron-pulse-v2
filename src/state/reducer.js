// src/state/reducer.js
import { getWeekId } from "./time.js";
import { dayKey } from "./date.js";

import {
  OPEN_MODAL,
  CLOSE_MODAL,
  ADD_SET,
  UPDATE_SET,
  DELETE_SET,
  SET_WEEKLY_GOAL,
  RESET_WEEK,
  COMPLETE_SESSION,
  ENSURE_CURRENT_WEEK,
  SET_SELECTED_EXERCISE,
  SET_TODAY_OVERRIDE,
  CLEAR_TODAY_OVERRIDE,

  // swaps
  SET_EXERCISE_SWAP,
  CLEAR_EXERCISE_SWAPS_FOR_DAY,
  CLEAR_EXERCISE_SWAP,

  // extras
  ADD_EXTRA_EXERCISE,
  REMOVE_EXTRA_EXERCISE,
  CLEAR_EXTRAS_FOR_DAY,

  // edit mode
  TOGGLE_EDIT_MODE_FOR_DAY,
  CLEAR_EDIT_MODE_FOR_DAY,
} from "./actions.js";

export const initialState = {
  ui: {
    modal: { open: false, type: null, payload: {} },
    selectedExercise: { id: null, name: null },
  },

  goals: {
    weeklyGoal: 2,
  },

  log: {
    sets: [],
    sessions: [],
  },

  streak: {
    weekId: getWeekId(),
    sessionsThisWeek: 0,
    streakWeeks: 0,
    lastSessionDay: null,
  },

  program: {
    todayOverride: null,

    // exerciseSwapsByDay[dayId][splitName][slotIndex1Based] = "exercise_catalog_id"
    exerciseSwapsByDay: {},

    // extraExercisesByDay[dayId] = ["exercise_catalog_id", ...]
    extraExercisesByDay: {},

    // editModeByDay[dayId] = true/false
    editModeByDay: {},
  },
};

function hasSetsForExerciseOnDay(state, dayId, exerciseId) {
  const sets = Array.isArray(state?.log?.sets) ? state.log.sets : [];
  return sets.some((s) => s?.dayId === dayId && s?.exerciseId === exerciseId);
}

export function reducer(state, action) {
  switch (action.type) {
    case OPEN_MODAL:
      return {
        ...state,
        ui: { ...state.ui, modal: { open: true, type: action.modalType, payload: action.payload } },
      };

    case CLOSE_MODAL:
      return {
        ...state,
        ui: { ...state.ui, modal: { open: false, type: null, payload: {} } },
      };

    case ADD_SET:
      return { ...state, log: { ...state.log, sets: [action.entry, ...state.log.sets] } };

    case UPDATE_SET: {
      const sets = Array.isArray(state.log.sets) ? state.log.sets : [];
      return {
        ...state,
        log: { ...state.log, sets: sets.map((s) => (s.id === action.id ? { ...s, ...action.patch } : s)) },
      };
    }

    case DELETE_SET: {
      const sets = Array.isArray(state.log.sets) ? state.log.sets : [];
      return { ...state, log: { ...state.log, sets: sets.filter((s) => s.id !== action.id) } };
    }

    case SET_WEEKLY_GOAL:
      return { ...state, goals: { ...state.goals, weeklyGoal: Math.max(1, Number(action.goal) || 2) } };

    case RESET_WEEK: {
      const weekId = state.streak.weekId;
      return {
        ...state,
        log: { ...state.log, sessions: (state.log.sessions || []).filter((s) => s.weekId !== weekId) },
        streak: { ...state.streak, lastSessionDay: null },
      };
    }

    case SET_TODAY_OVERRIDE:
      return { ...state, program: { ...state.program, todayOverride: action.payload || null } };

    case CLEAR_TODAY_OVERRIDE: {
      const dayId = action.payload?.dayId;
      const cur = state.program?.todayOverride;
      const keep = cur && dayId && cur.dayId !== dayId ? cur : null;
      return { ...state, program: { ...state.program, todayOverride: keep } };
    }

    // ===========================
    // Edit Mode
    // ===========================
    case TOGGLE_EDIT_MODE_FOR_DAY: {
      const dayId = action.payload?.dayId;
      if (!dayId) return state;

      const cur = state.program?.editModeByDay || {};
      const nextVal = !cur[dayId];

      return {
        ...state,
        program: {
          ...state.program,
          editModeByDay: {
            ...cur,
            [dayId]: nextVal,
          },
        },
      };
    }

    case CLEAR_EDIT_MODE_FOR_DAY: {
      const dayId = action.payload?.dayId;
      if (!dayId) return state;

      const cur = state.program?.editModeByDay || {};
      if (!cur[dayId]) return state;

      const next = { ...cur };
      delete next[dayId];

      return { ...state, program: { ...state.program, editModeByDay: next } };
    }

    // ===========================
    // Swap Overrides (Today-only)
    // ===========================
    case SET_EXERCISE_SWAP: {
      const p = action.payload || {};
      const dayId = p.dayId;
      const splitName = p.splitName;
      const slot = Number(p.slot); // 1-based
      const exerciseId = String(p.exerciseId || "").trim();
      const fromExerciseId = String(p.fromExerciseId || "").trim();

      if (!dayId || !splitName || !Number.isFinite(slot) || slot < 1) return state;
      if (!exerciseId) return state;

      // HARD GUARD: can't swap if that original exercise has any sets logged today
      if (fromExerciseId && hasSetsForExerciseOnDay(state, dayId, fromExerciseId)) return state;

      const current = state.program?.exerciseSwapsByDay || {};
      const byDay = current[dayId] || {};
      const bySplit = byDay[splitName] || {};

      return {
        ...state,
        program: {
          ...state.program,
          exerciseSwapsByDay: {
            ...current,
            [dayId]: {
              ...byDay,
              [splitName]: { ...bySplit, [slot]: exerciseId },
            },
          },
        },
      };
    }

    case CLEAR_EXERCISE_SWAPS_FOR_DAY: {
      const dayId = action.payload?.dayId;
      if (!dayId) return state;

      const current = state.program?.exerciseSwapsByDay || {};
      if (!current[dayId]) return state;

      const next = { ...current };
      delete next[dayId];

      return { ...state, program: { ...state.program, exerciseSwapsByDay: next } };
    }

    case CLEAR_EXERCISE_SWAP: {
      const p = action.payload || {};
      const dayId = p.dayId;
      const splitName = p.splitName;
      const slot = Number(p.slot);

      if (!dayId || !splitName || !Number.isFinite(slot) || slot < 1) return state;

      const current = state.program?.exerciseSwapsByDay || {};
      const byDay = current[dayId];
      const bySplit = byDay?.[splitName];
      if (!byDay || !bySplit || !bySplit[slot]) return state;

      const nextSplit = { ...bySplit };
      delete nextSplit[slot];

      const nextDay = { ...byDay, [splitName]: nextSplit };

      return {
        ...state,
        program: {
          ...state.program,
          exerciseSwapsByDay: { ...current, [dayId]: nextDay },
        },
      };
    }

    // ===========================
    // Extras (Unlimited, Today-only)
    // ===========================
    case ADD_EXTRA_EXERCISE: {
      const p = action.payload || {};
      const dayId = p.dayId;
      const exerciseId = String(p.exerciseId || "").trim();
      if (!dayId || !exerciseId) return state;

      const cur = state.program?.extraExercisesByDay || {};
      const list = Array.isArray(cur[dayId]) ? cur[dayId] : [];

      // prevent duplicates
      if (list.includes(exerciseId)) return state;

      return {
        ...state,
        program: {
          ...state.program,
          extraExercisesByDay: {
            ...cur,
            [dayId]: [...list, exerciseId],
          },
        },
      };
    }

    case REMOVE_EXTRA_EXERCISE: {
      const p = action.payload || {};
      const dayId = p.dayId;
      const exerciseId = String(p.exerciseId || "").trim();
      if (!dayId || !exerciseId) return state;

      // HARD GUARD: can't remove if it has logged sets today
      if (hasSetsForExerciseOnDay(state, dayId, exerciseId)) return state;

      const cur = state.program?.extraExercisesByDay || {};
      const list = Array.isArray(cur[dayId]) ? cur[dayId] : [];
      if (!list.length) return state;

      const nextList = list.filter((id) => id !== exerciseId);

      return {
        ...state,
        program: {
          ...state.program,
          extraExercisesByDay: {
            ...cur,
            [dayId]: nextList,
          },
        },
      };
    }

    case CLEAR_EXTRAS_FOR_DAY: {
      const dayId = action.payload?.dayId;
      if (!dayId) return state;

      const cur = state.program?.extraExercisesByDay || {};
      if (!cur[dayId]) return state;

      const next = { ...cur };
      delete next[dayId];

      return { ...state, program: { ...state.program, extraExercisesByDay: next } };
    }

    case ENSURE_CURRENT_WEEK: {
      const nowWeek = getWeekId(new Date());
      if (nowWeek === state.streak.weekId) return state;

      const oldWeekId = state.streak.weekId;
      const sessionsLastWeek = (state.log.sessions || []).filter((s) => s.weekId === oldWeekId).length;
      const metGoal = sessionsLastWeek >= state.goals.weeklyGoal;

      return {
        ...state,
        streak: {
          ...state.streak,
          weekId: nowWeek,
          sessionsThisWeek: 0,
          streakWeeks: metGoal ? state.streak.streakWeeks + 1 : 0,
          lastSessionDay: null,
        },
      };
    }

    case SET_SELECTED_EXERCISE:
      return {
        ...state,
        ui: {
          ...state.ui,
          selectedExercise: {
            id: action.payload?.id ?? null,
            name: action.payload?.name ?? null,
          },
        },
      };

    case COMPLETE_SESSION: {
      const nowWeek = getWeekId(new Date());
      const isNewWeek = nowWeek !== state.streak.weekId;

      let nextState = state;
      if (isNewWeek) {
        const metGoal = state.streak.sessionsThisWeek >= state.goals.weeklyGoal;
        nextState = {
          ...state,
          streak: {
            ...state.streak,
            weekId: nowWeek,
            sessionsThisWeek: 0,
            streakWeeks: metGoal ? state.streak.streakWeeks + 1 : 0,
            lastSessionDay: null,
          },
        };
      }

      const today = dayKey(new Date());
      if (nextState.streak.lastSessionDay === today) return nextState;

      const session = {
        id: crypto.randomUUID(),
        ts: Date.now(),
        splitName: action.payload?.splitName ?? "Session",
        weekId: nowWeek,
      };

      return {
        ...nextState,
        log: { ...nextState.log, sessions: [session, ...(nextState.log.sessions || [])] },
        streak: { ...nextState.streak, lastSessionDay: today },
      };
    }

    default:
      return state;
  }
}
