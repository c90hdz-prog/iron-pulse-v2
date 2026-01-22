export const OPEN_MODAL = "OPEN_MODAL";
export const CLOSE_MODAL = "CLOSE_MODAL";
export const ADD_SET = "ADD_SET";
export const SET_WEEKLY_GOAL = "SET_WEEKLY_GOAL";
export const RESET_WEEK = "RESET_WEEK";

export const openModal = (modalType, payload = {}) => ({ type: OPEN_MODAL, modalType, payload });
export const closeModal = () => ({ type: CLOSE_MODAL });

export const addSet = (entry) => ({ type: ADD_SET, entry });
export const setWeeklyGoal = (goal) => ({ type: SET_WEEKLY_GOAL, goal });
export const resetWeek = () => ({ type: RESET_WEEK });

export const COMPLETE_SESSION = "COMPLETE_SESSION";
export const ENSURE_CURRENT_WEEK = "ENSURE_CURRENT_WEEK";

export const completeSession = (payload = {}) => ({
  type: COMPLETE_SESSION,
  payload,
});

export const ensureCurrentWeek = () => ({
  type: ENSURE_CURRENT_WEEK,
});
