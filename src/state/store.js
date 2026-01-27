import { reducer, initialState } from "./reducer.js";
import { loadPersistedState, savePersistedState, selectPersistSubset } from "./persist.js";

export function createStore() {
  let state = initialState;

  // Load persisted subset + merge onto initialState (so new fields get defaults)
  const persisted = loadPersistedState();
  if (persisted) {
    state = {
      ...initialState,
      ...persisted,
      // deep merge the known nested objects so we don’t lose defaults
      goals: { ...initialState.goals, ...persisted.goals },
      log: { ...initialState.log, ...persisted.log },
      streak: { ...initialState.streak, ...persisted.streak }, 
      program: { ...initialState.program, ...persisted.program },
      ui: { ...initialState.ui }, // always reset UI
    };
  }

  const listeners = new Set();

  function getState() {
    return state;
  }

  function dispatch(action) {
    state = reducer(state, action);

    // Persist only durable state
    savePersistedState(selectPersistSubset(state));

    listeners.forEach((fn) => fn());
    return action;
  }

  function subscribe(fn) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  }

  return { getState, dispatch, subscribe };
}
