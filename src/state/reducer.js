import { getWeekId } from "./time.js";
import { dayKey } from "./date.js";

import {
  OPEN_MODAL,
  CLOSE_MODAL,
  ADD_SET,
  UPDATE_SET,
  SET_WEEKLY_GOAL,
  RESET_WEEK,
  COMPLETE_SESSION,
  ENSURE_CURRENT_WEEK,
  SET_SELECTED_EXERCISE,
  SET_TODAY_OVERRIDE,
  CLEAR_TODAY_OVERRIDE
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
    sets: [], // { id, ts, exercise, reps, weight }
    sessions: [], // later: { id, ts, splitName }
  },
  streak: {
    weekId: getWeekId(),
    sessionsThisWeek: 0, // will compute later from sessions/log events
    streakWeeks: 0,
    lastSessionDay: null,
  },
  program: {
  todayOverride: null, // { dayId, mode, splitKey?, offset? }
},

};

export function reducer(state, action) {
  switch (action.type) {
    case OPEN_MODAL:
      return { ...state, ui: { ...state.ui, modal: { open: true, type: action.modalType, payload: action.payload } } };

    case CLOSE_MODAL:
      return { ...state, ui: { ...state.ui, modal: { open: false, type: null, payload: {} } } };

    case ADD_SET:
      return { ...state, log: { ...state.log, sets: [action.entry, ...state.log.sets] } };

    case SET_WEEKLY_GOAL:
      return { ...state, goals: { ...state.goals, weeklyGoal: Math.max(1, Number(action.goal) || 2) } };

    case RESET_WEEK: {
      const weekId = state.streak.weekId;
      return {
        ...state,
        log: {
          ...state.log,
          sessions: (state.log.sessions || []).filter(s => s.weekId !== weekId),
        },
        streak: {
          ...state.streak,
          lastSessionDay: null,
        },
      };
    }

case SET_TODAY_OVERRIDE: {
  const o = action.payload || null;
  return {
    ...state,
    program: {
      ...state.program,
      todayOverride: o,
    },
  };
}

case CLEAR_TODAY_OVERRIDE: {
  const dayId = action.payload?.dayId;
  const cur = state.program?.todayOverride;
  const keep = cur && dayId && cur.dayId !== dayId ? cur : null;
  return {
    ...state,
    program: {
      ...state.program,
      todayOverride: keep,
    },
  };
}

    case ENSURE_CURRENT_WEEK: {
      const nowWeek = getWeekId(new Date());
      if (nowWeek === state.streak.weekId) return state;

      // Week changed → update streak based on whether last week met goal
      const oldWeekId = state.streak.weekId;
      const sessionsLastWeek = (state.log.sessions || []).filter(s => s.weekId === oldWeekId).length;
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

case UPDATE_SET: {
  const sets = Array.isArray(state.log.sets) ? state.log.sets : [];
  return {
    ...state,
    log: {
      ...state.log,
      sets: sets.map((s) => (s.id === action.id ? { ...s, ...action.patch } : s)),
    },
  };
}


    case COMPLETE_SESSION: {
      // Always ensure week is current before applying session
      const nowWeek = getWeekId(new Date());
      const isNewWeek = nowWeek !== state.streak.weekId;

      // If new week, rollover first (same logic as ENSURE_CURRENT_WEEK)
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

      // Guard: only allow 1 completed session per day
      if (nextState.streak.lastSessionDay === today) {
        return nextState;
      }

      const session = {
        id: crypto.randomUUID(),
        ts: Date.now(),
        splitName: action.payload?.splitName ?? "Session",
        weekId: nowWeek,
      };

      return {
        ...nextState,
        log: {
          ...nextState.log,
          sessions: [session, ...(nextState.log.sessions || [])],
        },
        streak: {
          ...nextState.streak,
          lastSessionDay: today,
        },


      };
    }


    default:
      return state;
  }
}
