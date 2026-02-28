import { createStore } from "./state/store.js";
import {
  updateSet,
  openModal,
  closeModal,
  addSet,
  resetWeek,
  completeSession,
  ensureCurrentWeek,
  setTodayOverride,
  setWeeklyGoal,
  clearTodayOverride,
  deleteSet,
  skipWeeklyGoalSetup,
  setSelectedExercise,

  // swaps + extras + edit mode
  setExerciseSwap,
  addExtraExercise,
  removeExtraExercise,
  clearExerciseSwapsForDay,
  clearExtrasForDay,
  toggleEditModeForDay,
  clearEditModeForDay,
} from "./state/actions.js";

import { renderModalRoot } from "./ui/modal.js";
import { toast } from "./ui/toast.js";
import { haptic } from "./ui/haptics.js";
import { beep } from "./ui/sound.js";

import { dayKey } from "./state/date.js";
import { getWeekId } from "./state/time.js";

import { renderTodaySummary } from "./features/todaySummary/todaySummaryCard.js";

import {
  selectTodaySummary,
  selectTodayExerciseSummary,
  selectSetsForTodayExercise
} from "./state/selectors.js";

import { MODAL_LOG_SET, loggingModalHtml }
from "./features/logging/loggingModal.js";

import { MODAL_EXERCISE_FOCUS, exerciseFocusHtml }
from "./features/focus/exerciseFocusModal.js";

import { MODAL_EXERCISE_PICKER, exercisePickerHtml }
from "./features/program/exercisePickerModal.js";

import { renderStreakBanner } from "./features/streak/streakBanner.js";
import { renderGoalCard } from "./features/goals/goalCard.js";
import { renderWeeklyVolume } from "./features/volume/volumeCard.js";
import { renderTodaysSplit } from "./features/split/todaysSplit.js";
import { renderAfterburnCard, MODAL_AFTERBURN }
from "./features/afterburn/afterburnModal.js";


const store = createStore();
store.dispatch(ensureCurrentWeek());

const els = {
  streakBanner: document.getElementById("streakBanner"),
  goalCard: document.getElementById("goalCard"),
  weeklyVolume: document.getElementById("weeklyVolume"),
  todaysSplit: document.getElementById("todaysSplit"),
  afterburn: document.getElementById("afterburn"),
  modalRoot: document.getElementById("modalRoot"),
  btnCTA: document.getElementById("btnCTA"),
  btnSettings: document.getElementById("btnSettings"),
  todaySummary: document.getElementById("todaySummary"),
};

// -------------------------
// Today Split Events
// -------------------------

els.todaysSplit?.addEventListener("ip:focusExercise", (e) => {
  store.dispatch(ensureCurrentWeek());
  const { exercise, exerciseId, suggestedReps } = e.detail || {};
  if (!exerciseId) return;

  // Mark origin so logged sets are "recommended"
  els.todaysSplit.setAttribute("data-origin", "recommended");

  store.dispatch(
    openModal(MODAL_EXERCISE_FOCUS, {
      exercise: exercise || "Exercise",
      exerciseId,
      suggestedReps: suggestedReps ?? null,
      slots: 3,
    })
  );
});

els.todaysSplit?.addEventListener("ip:toggleEditMode", (e) => {
  const todayId = e.detail?.dayId || dayKey(new Date());
  store.dispatch(toggleEditModeForDay(todayId));
  haptic("light");
});

els.todaysSplit?.addEventListener("ip:swapExercise", (e) => {
  const { dayId, splitName, slot, fromExerciseId } = e.detail || {};
  if (!dayId || !splitName || !slot || !fromExerciseId) return;

  // open picker modal
  store.dispatch(
    openModal(MODAL_EXERCISE_PICKER, {
      mode: "swap",
      dayId,
      splitName,
      slot,
      fromExerciseId,
      title: "Swap Exercise",
    })
  );
});

els.todaysSplit?.addEventListener("ip:addExtraExercise", (e) => {
  const dayId = e.detail?.dayId || dayKey(new Date());
  const splitName = els.todaysSplit?.getAttribute("data-split-name") || "split";

  store.dispatch(
    openModal(MODAL_EXERCISE_PICKER, {
      mode: "add",
      dayId,
      splitName,
      title: "Add Exercise",
    })
  );
});

els.todaysSplit?.addEventListener("ip:removeExtraExercise", (e) => {
  const { dayId, exerciseId } = e.detail || {};
  if (!dayId || !exerciseId) return;

  // reducer hard-guards if logged
  store.dispatch(removeExtraExercise({ dayId, exerciseId }));
  toast("Removed");
  haptic("light");
});

// Next option (ONLY cycle button)
els.todaysSplit?.addEventListener("ip:nextSplit", () => {
  const todayId = dayKey(new Date());
  const sets = Array.isArray(store.getState()?.log?.sets) ? store.getState().log.sets : [];

  // Keep your current protection: once anything logged today, don't allow cycling
  if (sets.some((s) => s?.dayId === todayId)) {
    toast("Already logged today — split locked ✅");
    haptic("light");
    return;
  }

  const cur = store.getState()?.program?.todayOverride;
  const curOffset = cur?.dayId === todayId ? Number(cur.offset || 0) : 0;

  store.dispatch(setTodayOverride({
    dayId: todayId,
    mode: "override",
    offset: curOffset + 1,
  }));

  toast("Next option →");
  haptic("light");
});

els.goalCard?.addEventListener("ip:setWeeklyGoal", (e) => {
  const goal = Math.max(2, Math.min(7, Number(e.detail?.goal || 2)));
  store.dispatch(setWeeklyGoal(goal));
  toast(`Weekly goal set to ${goal} days/week`);
  haptic("light");
});

els.goalCard?.addEventListener("ip:skipWeeklyGoalSetup", () => {
  store.dispatch(skipWeeklyGoalSetup());
  toast("Goal set to 5 days ✅");
  haptic("light");
});

// -------------------------
// Render loop
// -------------------------
function render() {
  const state = store.getState();
    // -------------------------
  // Goal card placement (DOM move)
  // -------------------------
  const needsGoalSetup = (state?.goals?.goalHandledWeekId !== state?.streak?.weekId);

  // Move the existing #goalCard container node to the right spot
  // (Render order alone does NOT move it)
  const parent = els.goalCard?.parentElement;
  if (parent && els.goalCard) {
    if (needsGoalSetup) {
      // Put goal card above streakBanner
      if (els.streakBanner && els.goalCard.nextSibling !== els.streakBanner) {
        parent.insertBefore(els.goalCard, els.streakBanner);
      }
    } else {
      // Put goal card near the bottom (after Afterburn)
      if (els.afterburn) {
        // Insert after afterburn
        const after = els.afterburn.nextSibling;
        if (after) parent.insertBefore(els.goalCard, after);
        else parent.appendChild(els.goalCard);
      } else {
        // fallback: last in parent
        parent.appendChild(els.goalCard);
      }
    }
  }
  const modal = state.ui?.modal;
  const todayId = dayKey(new Date());

  // Clear todayOverride if it belongs to an old day
  const o = state.program?.todayOverride;
  if (o?.dayId && o.dayId !== todayId) {
    store.dispatch(clearTodayOverride(o.dayId));
  }

  // ✅ Today-only cleanup for swaps/extras/editmode
  // If user comes back next day, we drop old day maps automatically.
  const swaps = state.program?.exerciseSwapsByDay || {};
  Object.keys(swaps).forEach((d) => {
    if (d !== todayId) store.dispatch(clearExerciseSwapsForDay(d));
  });

  const extras = state.program?.extraExercisesByDay || {};
  Object.keys(extras).forEach((d) => {
    if (d !== todayId) store.dispatch(clearExtrasForDay(d));
  });

  const edits = state.program?.editModeByDay || {};
  Object.keys(edits).forEach((d) => {
    if (d !== todayId) store.dispatch(clearEditModeForDay(d));
  });

  // --- Cards ---
  // --- Cards ---
  renderStreakBanner(els.streakBanner, state);
  renderWeeklyVolume(els.weeklyVolume, state);
  renderTodaysSplit(els.todaysSplit, state);
  renderTodaySummary(els.todaySummary, selectTodaySummary(state));
  renderAfterburnCard(els.afterburn, () => store.dispatch(openModal(MODAL_AFTERBURN)));

  // Render goal card (it will *appear* top or bottom because we moved the container above)
  renderGoalCard(els.goalCard, state, () => {
    if (confirm("Reset this week's progress?")) {
      store.dispatch(resetWeek());
      toast("Weekly progress reset");
    }
  });
  

  // --- Button wiring (SAFE: onclick overwrites each render) ---

  // Complete Session
  const btnComplete = els.todaysSplit?.querySelector("#btnCompleteSession");
  if (btnComplete) {
    btnComplete.onclick = () => {
      const before = store.getState().streak.lastSessionDay;

      store.dispatch(ensureCurrentWeek());

      const splitName = els.todaysSplit.getAttribute("data-split-name") || "Session";
      store.dispatch(completeSession({ splitName }));

      const after = store.getState().streak.lastSessionDay;

      if (before !== after) {
        toast("Session complete ✅");
        haptic("success");

        requestAnimationFrame(() => {
          const btn = els.todaysSplit.querySelector("#btnCompleteSession");
          if (!btn) return;
          btn.classList.remove("pulseWin");
          void btn.offsetWidth;
          btn.classList.add("pulseWin");
          setTimeout(() => btn.classList.remove("pulseWin"), 700);
        });
      } else {
        toast("Already completed today");
      }
    };
  }

  // --- Modal switch (ONE place, no duplicates) ---
  if (!modal?.open) {
    renderModalRoot(els.modalRoot, null, () => {});
    return;
  }

  if (modal.type === MODAL_EXERCISE_FOCUS) {
    const exId = modal.payload?.exerciseId || "";
    const summary = selectTodayExerciseSummary(state, exId);
    const rows = selectSetsForTodayExercise(state, exId);

    renderModalRoot(
      els.modalRoot,
      exerciseFocusHtml(modal.payload, summary, rows),
      () => store.dispatch(closeModal())
    );

    bindExerciseFocusModal(modal.payload);
    return;
  }

  if (modal.type === MODAL_EXERCISE_PICKER) {
    renderModalRoot(
      els.modalRoot,
      exercisePickerHtml(modal.payload),
      () => store.dispatch(closeModal())
    );

    bindExercisePickerModal(modal.payload);
    return;
  }

  if (modal.type === MODAL_LOG_SET) {
    renderModalRoot(
      els.modalRoot,
      loggingModalHtml(modal.payload),
      () => store.dispatch(closeModal())
    );
    bindLogSetModal();
    return;
  }

  if (modal.type === MODAL_AFTERBURN) {
    renderModalRoot(
      els.modalRoot,
      simpleAfterburnModalHtml(),
      () => store.dispatch(closeModal())
    );
    bindAfterburnModal();
    return;
  }

  // Unknown modal fallback
  renderModalRoot(els.modalRoot, null, () => store.dispatch(closeModal()));
}

store.subscribe(render);
render();

// CTA
els.btnCTA.addEventListener("click", () => {
  store.dispatch(ensureCurrentWeek());
  store.dispatch(openModal(MODAL_LOG_SET));
});

// Settings placeholder
els.btnSettings.addEventListener("click", () => {
  toast("Settings modal tomorrow ✅");
});

// -------------------------
// Picker modal binder
// -------------------------
function bindExercisePickerModal(payload) {
  const overlay = els.modalRoot.firstElementChild;
  if (!overlay) return;

  overlay.querySelectorAll("[data-close]").forEach((btn) =>
    btn.addEventListener("click", () => store.dispatch(closeModal()))
  );

  const search = overlay.querySelector("#pickerSearch");
  const list = overlay.querySelector("#pickerList");

  const filterList = () => {
    const q = String(search?.value || "").trim().toLowerCase();
    if (!list) return;
    list.querySelectorAll("[data-pick-exid]").forEach((btn) => {
      const text = btn.textContent.toLowerCase();
      btn.style.display = !q || text.includes(q) ? "" : "none";
    });
  };

  search?.addEventListener("input", filterList);

  list?.querySelectorAll("[data-pick-exid]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const picked = btn.getAttribute("data-pick-exid") || "";
      if (!picked) return;

      const todayId = payload.dayId || dayKey(new Date());

      if (payload.mode === "swap") {
        store.dispatch(setExerciseSwap({
          dayId: todayId,
          splitName: payload.splitName,
          slot: payload.slot,            // 1-based
          exerciseId: picked,
          fromExerciseId: payload.fromExerciseId, // reducer hard-guard uses this
        }));
        toast("Swapped ✅");
        haptic("light");
      } else if (payload.mode === "add") {
        store.dispatch(addExtraExercise({ dayId: todayId, exerciseId: picked }));
        toast("Added ✅");
        haptic("light");
      }

      store.dispatch(closeModal());
    });
  });

  // Autofocus
  search?.focus?.();
}

// -------------------------
// Existing binders (unchanged below)
// -------------------------
function bindLogSetModal() {
  const overlay = els.modalRoot.firstElementChild;
  if (!overlay) return;

  overlay.querySelectorAll("[data-close]").forEach((btn) =>
    btn.addEventListener("click", () => store.dispatch(closeModal()))
  );

  const makeCustomExerciseId = (name) =>
    "custom:" + String(name || "")
      .trim()
      .toLowerCase()
      .replaceAll(/[^a-z0-9]+/g, "-")
      .replaceAll(/^-+|-+$/g, "");

  const inExercise = overlay.querySelector("#inExercise");
  const inReps = overlay.querySelector("#inReps");
  const inWeight = overlay.querySelector("#inWeight");

  // Timer logic
  const display = overlay.querySelector("#timerDisplay");
  const btnStart = overlay.querySelector("#btnTimerStart");
  const btnReset = overlay.querySelector("#btnTimerReset");

  let total = 120; // seconds
  let remaining = total;
  let running = false;
  let t = null;

  const renderTime = () => {
    const mm = String(Math.floor(remaining / 60)).padStart(2, "0");
    const ss = String(remaining % 60).padStart(2, "0");
    display.textContent = `${mm}:${ss}`;
  };

  const stop = () => {
    running = false;
    if (t) clearInterval(t);
    t = null;
    btnStart.textContent = "Start";
  };

  const start = () => {
    if (running) return;
    running = true;
    btnStart.textContent = "Pause";
    t = setInterval(() => {
      remaining -= 1;
      renderTime();
      if (remaining <= 0) {
        stop();
        remaining = 0;
        renderTime();
        toast("Rest done 💪");
      }
    }, 1000);
  };

  btnStart.addEventListener("click", () => {
    if (!running) start();
    else stop();
  });

  btnReset.addEventListener("click", () => {
    stop();
    remaining = total;
    renderTime();
  });

  renderTime();

  overlay.querySelector("#btnSaveSet")?.addEventListener("click", () => {
    const splitName = els.todaysSplit?.getAttribute("data-split-name") || "Session";
    const originAttr = els.todaysSplit?.getAttribute("data-origin") || "custom";

    const exerciseName = (inExercise.value || "").trim();
    const recommendedId = inExercise.dataset.exid || "";
    const recommendedName = inExercise.dataset.exname || "";

    const isStillRecommended =
      originAttr === "recommended" &&
      exerciseName === recommendedName &&
      !!recommendedId;

    const exerciseId = isStillRecommended ? recommendedId : makeCustomExerciseId(exerciseName);
    const origin = isStillRecommended ? "recommended" : "custom";

    const entry = {
      id: crypto.randomUUID(),
      ts: Date.now(),
      dayId: dayKey(new Date()),
      weekId: getWeekId(new Date()),
      splitName,
      origin,
      exerciseId,
      exercise: exerciseName,
      reps: Number(inReps.value || 0),
      weight: Number(inWeight.value || 0),
    };

    els.todaysSplit?.removeAttribute("data-origin");

    if (!entry.exercise) {
      toast("Add an exercise name");
      return;
    }

    store.dispatch(addSet(entry));
    toast("Set saved");
    store.dispatch(closeModal());
  });
}

function recommendRepsByName(exerciseName = "") {
  const n = exerciseName.toLowerCase();
  if (/(deadlift|squat|bench|press|row|rdl|leg press|pull)/.test(n)) return 6;
  if (/(incline|split squat|pulldown|extension|curl)/.test(n)) return 10;
  if (/(lateral|raise|calf|tricep|bicep|fly|rear delt)/.test(n)) return 12;
  return 8;
}

function bindExerciseFocusModal(payload) {
  const overlay = els.modalRoot.firstElementChild;
  if (!overlay) return;

  overlay.querySelectorAll("[data-close]").forEach((btn) =>
    btn.addEventListener("click", () => store.dispatch(closeModal()))
  );

  const exerciseId = payload.exerciseId || "";
  const exerciseName = payload.exercise || "Exercise";
  const todayId = dayKey(new Date());

  const stateNow = store.getState();
  const cap = 5;

  const allSets = Array.isArray(stateNow?.log?.sets) ? stateNow.log.sets : [];
  const lastForExercise = allSets.find((s) => s.exerciseId === exerciseId);
  const suggestedReps =
    Number(lastForExercise?.reps) ||
    Number(payload?.suggestedReps) ||
    recommendRepsByName(exerciseName);

  const suggestedWeight = Number(lastForExercise?.weight) || "";

  const inReps = overlay.querySelector("#fxReps");
  const inWeight = overlay.querySelector("#fxWeight");
  const btnLog = overlay.querySelector("#fxLogBtn");
  const btnClear = overlay.querySelector("#fxClearInputs");

  let editingId = null;

  function setModeLog() {
    editingId = null;
    if (btnLog) btnLog.textContent = "Log Set";
  }

  if (inReps && !inReps.value) inReps.value = String(suggestedReps);
  if (inWeight && !inWeight.value && suggestedWeight !== "") inWeight.value = String(suggestedWeight);

  btnClear?.addEventListener("click", () => {
    setModeLog();
    if (inReps) inReps.value = String(recommendRepsByName(exerciseName));
    if (inWeight) inWeight.value = "";
  });

  btnLog?.addEventListener("click", () => {
    const cur = store.getState();
    const rowsToday = selectSetsForTodayExercise(cur, exerciseId);

    const reps = Number(inReps?.value || 0);
    const weight = Number(inWeight?.value || 0);

    if (!reps || !weight) {
      toast("Enter reps + weight");
      return;
    }

    if (!editingId && rowsToday.length >= cap) {
      toast("5-set cap reached");
      return;
    }

    if (editingId) {
      store.dispatch(updateSet(editingId, { reps, weight, ts: Date.now() }));
      toast("Set updated");
      haptic("light");
      setModeLog();
    } else {
      const splitName = els.todaysSplit?.getAttribute("data-split-name") || "Session";
      const origin = els.todaysSplit?.getAttribute("data-origin") || "custom";

      store.dispatch(addSet({
        id: crypto.randomUUID(),
        ts: Date.now(),
        dayId: todayId,
        weekId: getWeekId(new Date()),
        splitName,
        origin,
        exerciseId,
        exercise: exerciseName,
        reps,
        weight,
      }));

      toast("Set logged");
      haptic("light");
    }

    store.dispatch(openModal(MODAL_EXERCISE_FOCUS, payload));
  });

  overlay.querySelectorAll("[data-del-id]").forEach((b) => {
    b.addEventListener("click", () => {
      const id = b.getAttribute("data-del-id");
      if (!id) return;
      store.dispatch(deleteSet(id));
      toast("Set deleted");
      haptic("light");
      if (editingId === id) setModeLog();
      store.dispatch(openModal(MODAL_EXERCISE_FOCUS, payload));
    });
  });

  // Rest Timer + Overlay (unchanged)
  const DEFAULT_TOTAL = 120;
  const FINISH_HOLD_MS = 1200;
  let total = DEFAULT_TOTAL;
  let remaining = total;
  let running = false;
  let t = null;

  const displaySmall = overlay.querySelector("#fxTimerDisplay");
  const btnStartSmall = overlay.querySelector("#fxTimerStart");
  const btnResetSmall = overlay.querySelector("#fxTimerReset");

  const overlayEl = overlay.querySelector("#fxTimerOverlay");
  const bigDisplay = overlay.querySelector("#fxTimerBig");
  const hint = overlay.querySelector("#fxTimerHint");
  const btnOverlayClose = overlay.querySelector("#fxTimerOverlayClose");
  const btnOverlayToggle = overlay.querySelector("#fxTimerOverlayToggle");
  const btnOverlayReset = overlay.querySelector("#fxTimerOverlayReset");

  const fmt = (secs) => {
    const mm = String(Math.floor(secs / 60)).padStart(2, "0");
    const ss = String(secs % 60).padStart(2, "0");
    return `${mm}:${ss}`;
  };

  const renderTimer = () => {
    const txt = fmt(Math.max(0, remaining));
    if (displaySmall) displaySmall.textContent = txt;
    if (bigDisplay) bigDisplay.textContent = txt;

    const label = running ? "Pause" : "Start";
    if (btnStartSmall) btnStartSmall.textContent = label;
    if (btnOverlayToggle) btnOverlayToggle.textContent = label;

    if (hint) {
      if (remaining <= 0) hint.textContent = "Done ✅";
      else hint.textContent = running ? "Resting…" : "Tap Start to begin.";
    }
  };

  const stopTimer = () => {
    running = false;
    if (t) clearInterval(t);
    t = null;
    renderTimer();
  };

  const closeOverlay = () => {
    if (!overlayEl) return;
    const active = document.activeElement;
    if (active && overlayEl.contains(active)) {
      (displaySmall || btnStartSmall || overlay.querySelector("[data-close]"))?.focus?.();
    }
    overlayEl.classList.add("hidden");
    overlayEl.setAttribute("aria-hidden", "true");
  };

  const openOverlay = () => {
    if (!overlayEl) return;
    overlayEl.classList.remove("hidden");
    overlayEl.setAttribute("aria-hidden", "false");
  };

  const finishTimer = () => {
    stopTimer();
    remaining = 0;
    renderTimer();
    beep();
    haptic("success");
    toast("Rest done 💪");
    overlayEl?.classList.add("timerDone");
    setTimeout(() => {
      overlayEl?.classList.remove("timerDone");
      remaining = total;
      renderTimer();
      closeOverlay();
    }, FINISH_HOLD_MS);
  };

  const startTimer = () => {
    if (running) return;
    if (remaining <= 0) remaining = total;
    running = true;
    renderTimer();
    t = setInterval(() => {
      remaining -= 1;
      renderTimer();
      if (remaining <= 0) finishTimer();
    }, 1000);
  };

  const toggleTimer = () => {
    if (running) stopTimer();
    else startTimer();
  };

  displaySmall?.addEventListener("click", openOverlay);
  btnOverlayClose?.addEventListener("click", closeOverlay);

  btnStartSmall?.addEventListener("click", () => {
    openOverlay();
    toggleTimer();
  });

  btnOverlayToggle?.addEventListener("click", toggleTimer);

  const resetTimer = () => {
    stopTimer();
    remaining = total;
    renderTimer();
  };

  btnResetSmall?.addEventListener("click", () => {
    openOverlay();
    resetTimer();
  });

  btnOverlayReset?.addEventListener("click", resetTimer);

  renderTimer();
}

function simpleAfterburnModalHtml() {
  return `
    <div class="modal" role="dialog" aria-modal="true">
      <div class="modalHeader">
        <div class="modalTitle">Afterburn</div>
        <button class="iconBtn" data-close>✕</button>
      </div>
      <div class="modalBody">
        <div class="big">Pick a finisher</div>
        <div style="color:var(--muted); font-size: 12px;">Tomorrow: add a tiny timer + completion stamp.</div>
        <div style="display:flex; gap:10px; margin-top:10px;">
          <button class="btn" data-finisher="Push-ups">Push-ups</button>
          <button class="btn" data-finisher="Plank">Plank</button>
          <button class="btn" data-finisher="Bike">Bike</button>
        </div>
      </div>
      <div class="modalActions">
        <button class="btn" data-close>Close</button>
        <button class="btn btnPrimary" id="btnAfterburnComplete">Complete</button>
      </div>
    </div>
  `;
}

function bindAfterburnModal() {
  const overlay = els.modalRoot.firstElementChild;
  if (!overlay) return;

  overlay.querySelectorAll("[data-close]").forEach((btn) =>
    btn.addEventListener("click", () => store.dispatch(closeModal()))
  );

  let chosen = null;
  overlay.querySelectorAll("[data-finisher]").forEach((btn) => {
    btn.addEventListener("click", () => {
      chosen = btn.getAttribute("data-finisher");
      toast(`${chosen} selected`);
    });
  });

  overlay.querySelector("#btnAfterburnComplete")?.addEventListener("click", () => {
    toast(chosen ? `Afterburn complete: ${chosen}` : "Afterburn complete");
    store.dispatch(closeModal());
  });
}

// Optional: register service worker
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch(() => {});
  });
}
