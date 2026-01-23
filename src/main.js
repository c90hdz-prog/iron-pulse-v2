import { createStore } from "./state/store.js";
import { openModal, closeModal, addSet, resetWeek, completeSession, ensureCurrentWeek } from "./state/actions.js";
import { renderModalRoot } from "./ui/modal.js";
import { toast } from "./ui/toast.js";
import { haptic } from "./ui/haptics.js";
import { dayKey } from "./state/date.js";
import { getWeekId } from "./state/time.js";
import { renderTodaySummary } from "./features/todaySummary/todaySummaryCard.js";
import { selectTodaySummary } from "./state/selectors.js";

import { MODAL_LOG_SET, loggingModalHtml } from "./features/logging/loggingModal.js";
import { renderStreakBanner } from "./features/streak/streakBanner.js";
import { renderGoalCard } from "./features/goals/goalCard.js";
import { renderWeeklyVolume } from "./features/volume/volumeCard.js";
import { renderTodaysSplit } from "./features/split/todaysSplit.js";
import { renderAfterburnCard, MODAL_AFTERBURN } from "./features/afterburn/afterburnModal.js";

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

// Open Log Set modal from Today Split (recommended exercise pills)
els.todaysSplit?.addEventListener("ip:logSet", (e) => {
  store.dispatch(ensureCurrentWeek());

  const { exercise, exerciseId, origin } = e.detail || {};
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


function render() {
  const state = store.getState();

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

  // Hook split buttons after render
const btnComplete = els.todaysSplit.querySelector("#btnCompleteSession");
if (btnComplete) {
  btnComplete.onclick = () => {
    const before = store.getState().streak.lastSessionDay;

    store.dispatch(ensureCurrentWeek());

    // use the current split name instead of hardcoding "Push"
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


const btnLog = els.todaysSplit.querySelector("#btnLogSetFromSplit");
if (btnLog) {
  btnLog.onclick = () => {
    store.dispatch(ensureCurrentWeek());
    els.todaysSplit.setAttribute("data-origin", "custom");
    store.dispatch(openModal(MODAL_LOG_SET, { exercise: "Bench Press", exerciseId: "" }));
  };
}





  // Modal
  const modal = state.ui.modal;
  if (!modal.open) {
    renderModalRoot(els.modalRoot, null, () => {});
    return;
  }

  if (modal.type === MODAL_LOG_SET) {
    renderModalRoot(els.modalRoot, loggingModalHtml(modal.payload), () => store.dispatch(closeModal()));
    bindLogSetModal();
    return;
  }

  if (modal.type === MODAL_AFTERBURN) {
    renderModalRoot(els.modalRoot, simpleAfterburnModalHtml(), () => store.dispatch(closeModal()));
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
