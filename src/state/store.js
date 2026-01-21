import { reducer, initialState } from "./reducer.js";
import { loadState, saveState } from "./storage.js";

export function createStore() {
  let state = loadState() ?? initialState;
  const listeners = new Set();

  const getState = () => state;

  const dispatch = (action) => {
    state = reducer(state, action);
    saveState(state);
    listeners.forEach((fn) => fn(state));
  };

  const subscribe = (fn) => {
    listeners.add(fn);
    return () => listeners.delete(fn);
  };

  return { getState, dispatch, subscribe };
}
