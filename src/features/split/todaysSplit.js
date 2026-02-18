// src/features/split/todaysSplit.js
import { dayKey } from "../../state/date.js";
import { getRecommendedPlan } from "../program/programEngine.js";
import { ex } from "../program/exerciseCatalog.js";

function splitMeta(splitName, label) {
  const map = {
    push: { title: label || "Push", desc: "Pressing for chest, shoulders, triceps." },
    pull: { title: label || "Pull", desc: "Rowing and pulling for a thicker back and arms." },
    legs: { title: label || "Legs", desc: "Squats and hinges for lower body strength." },
    upper: { title: label || "Upper", desc: "Balanced upper-body work with moderate intensity." },
    lower: { title: label || "Lower", desc: "Lower-body work with moderate intensity." },
  };

  return map[splitName] || { title: label || "Today", desc: "Your recommended session for today." };
}

function calcTodayStats(sets, todayId) {
  const byId = new Map();

  for (const s of sets) {
    if (!s || s.dayId !== todayId) continue;
    const exid = s.exerciseId || "";
    if (!exid) continue;

    const reps = Number(s.reps || 0) || 0;
    const weight = Number(s.weight || 0) || 0;
    const lbs = reps * weight;

    const cur = byId.get(exid) || { sets: 0, lbs: 0 };
    cur.sets += 1;
    cur.lbs += lbs;
    byId.set(exid, cur);
  }

  return byId;
}

export function renderTodaysSplit(el, state) {
  const todayId = dayKey(new Date());
  const completedToday = state?.streak?.lastSessionDay === todayId;

  const sets = Array.isArray(state?.log?.sets) ? state.log.sets : [];
  const statsById = calcTodayStats(sets, todayId);

  const plan = getRecommendedPlan({
    weeklyGoal: state?.goals?.weeklyGoal ?? 2,
    date: new Date(),
    overrideToday: state?.program?.todayOverride ?? null,
    swapOverrides: state?.program?.exerciseSwapsByDay?.[todayId] ?? null,
  });

  el.setAttribute("data-split-name", plan.splitName);

  const selected = {
    id: el.getAttribute("data-selected-exid"),
    name: el.getAttribute("data-selected-ex"),
  };

  const meta = splitMeta(plan.splitName, plan.label);

  const minSets = 3;

  // Base 5
  const topFive = plan.exercises.slice(0, 5);

  // Extras for today (unlimited)
  const extrasIds = Array.isArray(state?.program?.extraExercisesByDay?.[todayId])
    ? state.program.extraExercisesByDay[todayId]
    : [];

  const extras = extrasIds.map((id) => ex(id)).filter(Boolean);

  const allDone =
    topFive.length > 0 &&
    topFive.every((exObj) => {
      const st = statsById.get(exObj.id) || { sets: 0, lbs: 0 };
      return st.sets >= minSets;
    });

  const editMode = !!state?.program?.editModeByDay?.[todayId];

  // For UI locking: swaps/removals blocked if ANY sets exist for that exerciseId today
  const hasSetsFor = (exerciseId) => {
    const st = statsById.get(exerciseId) || { sets: 0 };
    return st.sets > 0;
  };

  // Header right button: Next option (ONLY cycle button)
  // Second small button: Edit toggle
  const editBtnLabel = editMode ? "DONE" : "EDIT";

  // Build rows
  const renderRow = (exObj, opts = {}) => {
    const active = selected?.id === exObj.id;
    const st = statsById.get(exObj.id) || { sets: 0, lbs: 0 };

    const isStarted = st.sets > 0;
    const isDone = st.sets >= minSets;

    const isExtra = !!opts.isExtra;

    // Edit controls:
    // - Base 5: show "Swap" affordance (but disabled if started)
    // - Extras: show remove (but disabled if started)
    const swapDisabled = isStarted;
    const removeDisabled = isStarted;

    const rightIcon = isDone ? "✓" : "›";

    const editAffordance = editMode
      ? isExtra
        ? `<button class="iconBtn miniDanger" data-remove-exid="${exObj.id}" ${
            removeDisabled ? "disabled" : ""
          } title="${removeDisabled ? "Can't remove (already logged)" : "Remove"}">✕</button>`
        : `<button class="iconBtn mini" data-swap-slot="${opts.slot || 1}" data-from-exid="${exObj.id}" ${
            swapDisabled ? "disabled" : ""
          } title="${swapDisabled ? "Can't swap (already logged)" : "Swap"}">↻</button>`
      : "";

    // When editMode is ON, tapping the row:
    // - base rows open swap picker (unless disabled)
    // - extra rows do nothing (use X)
    // When editMode is OFF, tapping opens focus log modal (existing behavior)
    const dataAttrs = [
      `data-ex="${exObj.name}"`,
      `data-exid="${exObj.id}"`,
      `data-sreps="${exObj.suggestedReps ?? ""}"`,
      isExtra ? `data-extra="1"` : `data-extra="0"`,
      opts.slot ? `data-slot="${opts.slot}"` : "",
      // helps main.js decide behavior
      `data-editmode="${editMode ? "1" : "0"}"`,
      `data-started="${isStarted ? "1" : "0"}"`,
    ]
      .filter(Boolean)
      .join(" ");

    return `
      <button
        class="todayRow
          ${active ? "active" : ""}
          ${isStarted ? "started" : ""}
          ${isDone ? "done" : ""}"
        ${dataAttrs}
        style="text-align:left;"
      >
        <div class="rowTop">
          <div class="rowName">${exObj.name}</div>

          <div style="display:flex; gap:8px; align-items:center;">
            ${editAffordance}
            <div class="rowChevron">${rightIcon}</div>
          </div>
        </div>

        <div class="rowLink">${editMode ? (isExtra ? "Extra" : swapDisabled ? "Locked" : "Swap") : "Log sets"}</div>

        <div class="rowBottom">
          <div class="rowMin">Min ${minSets} sets</div>
          <div class="rowLbs">${st.lbs} lbs logged</div>
        </div>
      </button>
    `;
  };

  el.innerHTML = `
    <div class="todayCard ${allDone ? "allDone" : ""}">
      <div class="todayHeader">
        <div>
          <div class="todayTitle">${meta.title}</div>
          <div class="todayDesc">${meta.desc}</div>
          ${editMode ? `<div class="todayHint">Edit mode: swap/remove is blocked once an exercise has logged sets.</div>` : ""}
        </div>

        <div style="display:flex; gap:10px; align-items:center;">
          <button class="btn btnGhost" id="btnNextSplit">NEXT OPTION</button>
          <button class="btn btnGhost" id="btnToggleEdit">${editBtnLabel}</button>
        </div>
      </div>

      <div class="todayList">
        ${topFive
          .map((exObj, i) => renderRow(exObj, { slot: i + 1, isExtra: false }))
          .join("")}

        ${
          extras.length
            ? `<div style="margin-top:10px; color:var(--muted); font-size:12px;">Extras</div>`
            : ""
        }

        ${extras.map((exObj) => renderRow(exObj, { isExtra: true })).join("")}

        ${
          allDone
            ? `
              <div style="margin-top:10px;">
                <button class="btn" id="btnAddExercise">+ Add exercise</button>
              </div>
            `
            : ""
        }
      </div>
    </div>

    <div style="margin-top:14px; display:flex; gap:10px; flex-wrap: wrap;">
      <button class="btn" id="btnOpenSplit">View</button>
      <button class="btn btnPrimary" id="btnCompleteSession" ${completedToday ? "disabled" : ""}>
        ${completedToday ? "Completed Today ✅" : "Complete Session"}
      </button>
    </div>
  `;

  // Row click behavior
  el.querySelectorAll("[data-exid]").forEach((btn) => {
    btn.onclick = () => {
      const exName = btn.getAttribute("data-ex") || "Exercise";
      const exId = btn.getAttribute("data-exid") || "";
      const suggestedReps = Number(btn.getAttribute("data-sreps") || 0) || null;

      const isEdit = btn.getAttribute("data-editmode") === "1";
      const started = btn.getAttribute("data-started") === "1";
      const isExtra = btn.getAttribute("data-extra") === "1";
      const slot = Number(btn.getAttribute("data-slot") || 0);

      // persist selection (for highlight)
      el.setAttribute("data-selected-ex", exName);
      el.setAttribute("data-selected-exid", exId);

      // In edit mode:
      // - base rows open picker (if not started)
      // - extras: do nothing (remove uses X)
      if (isEdit) {
        if (!isExtra && !started && slot > 0) {
          el.dispatchEvent(
            new CustomEvent("ip:swapExercise", {
              bubbles: true,
              detail: {
                dayId: todayId,
                splitName: plan.splitName,
                slot, // 1-based
                fromExerciseId: exId,
              },
            })
          );
        }
        return;
      }

      // Normal mode: open focus modal
      el.dispatchEvent(
        new CustomEvent("ip:focusExercise", {
          bubbles: true,
          detail: {
            exercise: exName,
            exerciseId: exId,
            origin: "recommended",
            suggestedReps,
          },
        })
      );
    };
  });

  // Swap buttons (↻) — redundant with row click, but more obvious UX
  el.querySelectorAll("[data-swap-slot]").forEach((b) => {
    b.onclick = (ev) => {
      ev.stopPropagation();
      const slot = Number(b.getAttribute("data-swap-slot") || 0);
      const fromExerciseId = b.getAttribute("data-from-exid") || "";
      if (!slot || !fromExerciseId) return;
      if (hasSetsFor(fromExerciseId)) return;

      el.dispatchEvent(
        new CustomEvent("ip:swapExercise", {
          bubbles: true,
          detail: { dayId: todayId, splitName: plan.splitName, slot, fromExerciseId },
        })
      );
    };
  });

  // Remove extra
  el.querySelectorAll("[data-remove-exid]").forEach((b) => {
    b.onclick = (ev) => {
      ev.stopPropagation();
      const exerciseId = b.getAttribute("data-remove-exid") || "";
      if (!exerciseId) return;
      if (hasSetsFor(exerciseId)) return;

      el.dispatchEvent(
        new CustomEvent("ip:removeExtraExercise", {
          bubbles: true,
          detail: { dayId: todayId, exerciseId },
        })
      );
    };
  });

  // Add exercise (only shown when allDone)
  const btnAdd = el.querySelector("#btnAddExercise");
  if (btnAdd) {
    btnAdd.onclick = () => {
      el.dispatchEvent(new CustomEvent("ip:addExtraExercise", { bubbles: true, detail: { dayId: todayId } }));
    };
  }

  // Next option button
  const btnNext = el.querySelector("#btnNextSplit");
  if (btnNext) {
    btnNext.onclick = () => {
      el.dispatchEvent(new CustomEvent("ip:nextSplit", { bubbles: true }));
    };
  }

  // Toggle edit button
  const btnEdit = el.querySelector("#btnToggleEdit");
  if (btnEdit) {
    btnEdit.onclick = () => {
      el.dispatchEvent(new CustomEvent("ip:toggleEditMode", { bubbles: true, detail: { dayId: todayId } }));
    };
  }
}
