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
  setSelectedExercise
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

els.todaysSplit?.addEventListener("ip:focusExercise", (e) => {
  store.dispatch(ensureCurrentWeek());
  const { exercise, exerciseId } = e.detail || {};
  if (!exerciseId) return;

  // Mark origin so logged sets are "recommended"
  els.todaysSplit.setAttribute("data-origin", "recommended");

  store.dispatch(
    openModal(MODAL_EXERCISE_FOCUS, {
      exercise: exercise || "Exercise",
      exerciseId,
      slots: 3,
    })
  );
});

els.goalCard?.addEventListener("ip:setWeeklyGoal", (e) => {
  const goal = Math.max(2, Math.min(7, Number(e.detail?.goal || 2)));
  store.dispatch(setWeeklyGoal(goal));
  toast(`Weekly goal set to ${goal} days/week`);
  haptic("light");
});


// Open Log Set modal from Today Split (recommended exercise pills)
els.todaysSplit?.addEventListener("ip:logSet", (e) => {
  store.dispatch(ensureCurrentWeek());

  const { exercise, exerciseId, origin } = e.detail || {};

  // Stage 1: set selection so the UI highlights + shows focus panel
  if (exerciseId) {
    store.dispatch(setSelectedExercise({ id: exerciseId, name: exercise || "" }));
  }

  if (origin) els.todaysSplit.setAttribute("data-origin", origin);

  store.dispatch(
    openModal(MODAL_LOG_SET, {
      exercise: exercise || "Bench Press",
      exerciseId: exerciseId || "",
      recommendedName: exercise || "",
      recommendedId: exerciseId || "",
    })
  );
});

els.todaysSplit?.addEventListener("ip:skipToday", () => {
  const todayId = dayKey(new Date());

  store.dispatch(setTodayOverride({
    dayId: todayId,
    mode: "skip",
  }));

  toast("Skipped today ✅");
  haptic("light");
});

els.todaysSplit?.addEventListener("ip:nextSplit", () => {
  const todayId = dayKey(new Date());
  const cur = store.getState()?.program?.todayOverride;

  // only count offsets for today
  const curOffset = cur?.dayId === todayId ? Number(cur.offset || 0) : 0;

  store.dispatch(setTodayOverride({
    dayId: todayId,
    mode: "override",
    offset: curOffset + 1, // ✅ keep stepping forward
  }));

  toast("Next option →");
  haptic("light");
});


function render() {
  const state = store.getState();
  const modal = state.ui?.modal;
  const todayId = dayKey(new Date());
  const o = state.program?.todayOverride;
  if (o?.dayId && o.dayId !== todayId) {
    store.dispatch(clearTodayOverride(o.dayId));
  }

  // --- Cards ---
  renderStreakBanner(els.streakBanner, state);

  renderGoalCard(els.goalCard, state, () => {
    if (confirm("Reset this week's progress?")) {
      store.dispatch(resetWeek());
      toast("Weekly progress reset");
    }
  });

  renderWeeklyVolume(els.weeklyVolume, state);
  renderTodaysSplit(els.todaysSplit, state);
  renderTodaySummary(els.todaySummary, selectTodaySummary(state));
  renderAfterburnCard(els.afterburn, () => store.dispatch(openModal(MODAL_AFTERBURN)));

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

  // Log a set (manual/custom)
  const btnLog = els.todaysSplit?.querySelector("#btnLogSetFromSplit");
  if (btnLog) {
    btnLog.onclick = () => {
      store.dispatch(ensureCurrentWeek());
      els.todaysSplit?.setAttribute("data-origin", "custom");
      store.dispatch(openModal(MODAL_LOG_SET, { exercise: "Bench Press", exerciseId: "" }));
    };
  }

  // Log set for focused/selected exercise (from focus panel on the card)
  const btnLogSelected = els.todaysSplit?.querySelector("#btnLogSelectedSet");
  if (btnLogSelected) {
    btnLogSelected.onclick = () => {
      store.dispatch(ensureCurrentWeek());

      const selected = store.getState()?.ui?.selectedExercise;
      if (!selected?.id) return;

      els.todaysSplit?.setAttribute("data-origin", "recommended");

      store.dispatch(
        openModal(MODAL_LOG_SET, {
          exercise: selected.name || "Bench Press",
          exerciseId: selected.id,
          recommendedName: selected.name || "",
          recommendedId: selected.id,
        })
      );
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

    renderModalRoot(
      els.modalRoot,
      exerciseFocusHtml(modal.payload, summary),
      () => store.dispatch(closeModal())
    );

    bindExerciseFocusModal(modal.payload);
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
    else {
      // Pause
      stop();
    }
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

  // If user edits the recommended name, treat as custom
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

  // clear one-time origin so it doesn't stick
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

function bindExerciseFocusModal(payload) {
  const overlay = els.modalRoot.firstElementChild;
  if (!overlay) return;

  overlay.querySelectorAll("[data-close]").forEach((btn) =>
    btn.addEventListener("click", () => store.dispatch(closeModal()))
  );

  const exerciseId = payload.exerciseId || "";
  const exerciseName = payload.exercise || "Exercise";

  // Render logged list
  const list = overlay.querySelector("#fxList");
  const state = store.getState();
  const items = selectSetsForTodayExercise(state, exerciseId);

  if (list) {
    list.innerHTML = items.length
      ? items.map((s) => {
          const lbs = (Number(s.reps) || 0) * (Number(s.weight) || 0);
          return `
            <div class="pill" style="display:flex; justify-content:space-between; gap:10px;">
              <span>Set ${s.slotIndex || "?"}: ${s.reps} x ${s.weight}</span>
              <span>${lbs} lbs</span>
            </div>
          `;
        }).join("")
      : `<div style="color:var(--muted); font-size:12px;">No sets yet. Log your first set 💪</div>`;
  }

  // Add Set (increase slots up to 5)
  overlay.querySelector("#fxAddSet")?.addEventListener("click", () => {
    const nextSlots = Math.min(5, Number(payload.slots || 3) + 1);
    store.dispatch(openModal(MODAL_EXERCISE_FOCUS, { ...payload, slots: nextSlots }));
  });

  // Row buttons: Log / Edit / Clear
  overlay.querySelectorAll("[data-action]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const action = btn.getAttribute("data-action");
      const slot = Number(btn.getAttribute("data-slot") || 0);
      if (!slot) return;

      const repsEl = overlay.querySelector(`#fxReps_${slot}`);
      const weightEl = overlay.querySelector(`#fxWeight_${slot}`);

      const existing = items.find((s) => Number(s.slotIndex) === slot);

      if (action === "clear") {
        if (repsEl) repsEl.value = "";
        if (weightEl) weightEl.value = "";
        return;
      }

      if (action === "edit") {
        // unlock inputs for that slot
        if (repsEl) repsEl.disabled = false;
        if (weightEl) weightEl.disabled = false;

        // also re-enable the Log button for that slot by re-opening modal with same payload
        store.dispatch(openModal(MODAL_EXERCISE_FOCUS, { ...payload }));
        return;
      }

      if (action === "log") {
        const reps = Number(repsEl?.value || 0);
        const weight = Number(weightEl?.value || 0);

        if (!reps || !weight) {
          toast("Enter reps + weight");
          return;
        }

        const splitName = els.todaysSplit?.getAttribute("data-split-name") || "Session";
        const origin = els.todaysSplit?.getAttribute("data-origin") || "custom";

        if (existing) {
          store.dispatch(updateSet(existing.id, { reps, weight, ts: Date.now() }));
          toast(`Updated Set ${slot}`);
        } else {
          store.dispatch(addSet({
            id: crypto.randomUUID(),
            ts: Date.now(),
            dayId: dayKey(new Date()),
            weekId: getWeekId(new Date()),
            splitName,
            origin,
            exerciseId,
            exercise: exerciseName,
            reps,
            weight,
            slotIndex: slot,
          }));
          toast(`Logged Set ${slot}`);
        }

        haptic("light");

        // Keep focus modal open & refreshed
        store.dispatch(openModal(MODAL_EXERCISE_FOCUS, { ...payload }));
      }
    });
  });

  // Rest timer
  const display = overlay.querySelector("#fxTimerDisplay");
  const btnStart = overlay.querySelector("#fxTimerStart");
  const btnReset = overlay.querySelector("#fxTimerReset");

  let total = 120;
  let remaining = total;
  let running = false;
  let t = null;

  const renderTime = () => {
    const mm = String(Math.floor(remaining / 60)).padStart(2, "0");
    const ss = String(remaining % 60).padStart(2, "0");
    if (display) display.textContent = `${mm}:${ss}`;
  };

  const stop = () => {
    running = false;
    if (t) clearInterval(t);
    t = null;
    if (btnStart) btnStart.textContent = "Start";
  };

  const start = () => {
    if (running) return;
    running = true;
    if (btnStart) btnStart.textContent = "Pause";

    t = setInterval(() => {
      remaining -= 1;
      renderTime();
      if (remaining <= 0) {
        stop();
        remaining = 0;
        renderTime();
        beep();              // ✅ audio cue
        haptic("success");   // ✅ haptic cue
        toast("Rest done 💪");
      }
    }, 1000);
  };

  btnStart?.addEventListener("click", () => {
    if (!running) start();
    else stop();
  });

  btnReset?.addEventListener("click", () => {
    stop();
    remaining = total;
    renderTime();
  });

  renderTime();
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

// Optional: register service worker (comment out if you want)
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch(() => {});
  });
}
