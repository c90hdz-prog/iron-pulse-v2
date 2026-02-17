// src/state/actions.js

export const OPEN_MODAL = "OPEN_MODAL";
export const CLOSE_MODAL = "CLOSE_MODAL";

export const ADD_SET = "ADD_SET";
export const UPDATE_SET = "UPDATE_SET";
export const DELETE_SET = "DELETE_SET";

export const SET_WEEKLY_GOAL = "SET_WEEKLY_GOAL";
export const RESET_WEEK = "RESET_WEEK";

export const SET_SELECTED_EXERCISE = "SET_SELECTED_EXERCISE";

export const SET_TODAY_OVERRIDE = "SET_TODAY_OVERRIDE";
export const CLEAR_TODAY_OVERRIDE = "CLEAR_TODAY_OVERRIDE";

export const COMPLETE_SESSION = "COMPLETE_SESSION";
export const ENSURE_CURRENT_WEEK = "ENSURE_CURRENT_WEEK";

// ===========================
// Exercise Swap Overrides
// ===========================
export const SET_EXERCISE_SWAP = "SET_EXERCISE_SWAP";
export const CLEAR_EXERCISE_SWAPS_FOR_DAY = "CLEAR_EXERCISE_SWAPS_FOR_DAY";
export const CLEAR_EXERCISE_SWAP = "CLEAR_EXERCISE_SWAP";

export const setExerciseSwap = (payload) => ({
  // payload: { dayId, splitName, slot (1-based), exerciseId (catalog id) }
  type: SET_EXERCISE_SWAP,
  payload,
});

export const clearExerciseSwapsForDay = (dayId) => ({
  type: CLEAR_EXERCISE_SWAPS_FOR_DAY,
  payload: { dayId },
});

export const clearExerciseSwap = (payload) => ({
  // payload: { dayId, splitName, slot (1-based) }
  type: CLEAR_EXERCISE_SWAP,
  payload,
});

// ===========================
// Existing actions
// ===========================
export const deleteSet = (id) => ({
  type: DELETE_SET,
  id,
});

export function setTodayOverride(payload) {
  // payload: { dayId, mode: "skip" | "override", splitKey?: string, offset?: number }
  return { type: SET_TODAY_OVERRIDE, payload };
}

export function clearTodayOverride(dayId) {
  return { type: CLEAR_TODAY_OVERRIDE, payload: { dayId } };
}

export const updateSet = (id, patch) => ({
  type: UPDATE_SET,
  id,
  patch,
});

export function setSelectedExercise(payload) {
  return { type: SET_SELECTED_EXERCISE, payload };
}

export const openModal = (modalType, payload = {}) => ({
  type: OPEN_MODAL,
  modalType,
  payload,
});

export const closeModal = () => ({ type: CLOSE_MODAL });

export const addSet = (entry) => ({ type: ADD_SET, entry });
export const setWeeklyGoal = (goal) => ({ type: SET_WEEKLY_GOAL, goal });
export const resetWeek = () => ({ type: RESET_WEEK });

export const completeSession = (payload = {}) => ({
  type: COMPLETE_SESSION,
  payload,
});

export const ensureCurrentWeek = () => ({
  type: ENSURE_CURRENT_WEEK,
});
