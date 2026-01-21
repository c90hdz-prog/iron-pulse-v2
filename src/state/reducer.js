import { OPEN_MODAL, CLOSE_MODAL, ADD_SET, SET_WEEKLY_GOAL, RESET_WEEK } from "./actions.js";

const getWeekId = (d = new Date()) => {
  // Simple week id: YYYY-WW (not ISO-perfect, but consistent for now)
  const year = d.getFullYear();
  const jan1 = new Date(year, 0, 1);
  const days = Math.floor((d - jan1) / 86400000);
  const week = Math.floor((days + jan1.getDay()) / 7) + 1;
  return `${year}-W${String(week).padStart(2, "0")}`;
};

export const initialState = {
  ui: {
    modal: { open: false, type: null, payload: {} },
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

    case RESET_WEEK:
      return {
        ...state,
        streak: { ...state.streak, sessionsThisWeek: 0 },
      };

    default:
      return state;
  }
}
