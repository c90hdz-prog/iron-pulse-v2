import { dayKey } from "../../state/date.js";
import { getRecommendedPlan } from "../program/programEngine.js";

export function renderTodaysSplit(el, state) {
  const todayId = dayKey(new Date());
  const completedToday = state?.streak?.lastSessionDay === todayId;


const todayOverride = state?.program?.todayOverride;
const overrideToday = todayOverride?.dayId === todayId ? todayOverride : null;

const plan = getRecommendedPlan({
  weeklyGoal: state?.goals?.weeklyGoal ?? 2,
  date: new Date(),
  overrideToday: state?.program?.todayOverride ?? null,
});





  el.setAttribute("data-split-name", plan.splitName);

  const selected = {
    id: el.getAttribute("data-selected-exid"),
    name: el.getAttribute("data-selected-ex"),
  };

  const sets = Array.isArray(state?.log?.sets) ? state.log.sets : [];

  const selectedSetsToday =
    selected?.id
      ? sets.filter((s) => s.dayId === todayId && s.exerciseId === selected.id).length
      : 0;

  el.innerHTML = `
    <h3>Today's Split</h3>
    <div class="big">${plan.label}</div>
    <div style="margin-top:10px; display:flex; gap:10px; flex-wrap:wrap;">
      <button class="btn" id="btnSkipToday">Skip today</button>
      <button class="btn" id="btnNextSplit">Next option</button>
    </div>

    <div style="margin-top:10px; color: var(--muted); font-size: 12px;">
      Recommended exercises:
    </div>

    <div style="margin-top:10px; display:grid; gap:8px;">
      ${plan.exercises.slice(0, 4).map((ex) => {
        const active = selected?.id === ex.id;
        return `
          <button
            class="pill pillSelectable ${active ? "active" : ""}"
            data-ex="${ex.name}"
            data-exid="${ex.id}"
            style="text-align:left;"
          >
            ${ex.name}
          </button>
        `;
      }).join("")}

      ${plan.exercises.length > 4
        ? `<div style="color:var(--muted); font-size:12px;">+ ${plan.exercises.length - 4} more</div>`
        : ""}
    </div>

    ${
      selected?.id
        ? `
          <div class="focusPanel" style="margin-top:12px;">
            <div class="row">
              <div>
                <div style="font-weight:800;">Focused: ${selected.name}</div>
                <div style="color:var(--muted); font-size:12px;">
                  Sets today: ${selectedSetsToday}/3 (goal)
                </div>
              </div>
              <div class="pill">${selectedSetsToday}</div>
            </div>

            <div style="display:flex; gap:10px; margin-top:10px;">
              <button class="btn btnPrimary" id="btnLogSelectedSet">Log set for ${selected.name}</button>
            </div>
          </div>
        `
        : ""
    }

    <div style="margin-top:12px; display:flex; gap:10px; flex-wrap: wrap;">
      <button class="btn" id="btnLogSetFromSplit">Log a set</button>
      <button class="btn" id="btnOpenSplit">View</button>
      <button class="btn btnPrimary" id="btnCompleteSession" ${completedToday ? "disabled" : ""}>
        ${completedToday ? "Completed Today ✅" : "Complete Session"}
      </button>
    </div>
  `;

  // Pills: dispatch a single event; main.js will set selected + open modal
  el.querySelectorAll("[data-ex]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const exName = btn.getAttribute("data-ex") || "Exercise";
      const exId = btn.getAttribute("data-exid") || "";

      // Persist selection on the card element (survives re-render)
      el.setAttribute("data-selected-ex", exName);
      el.setAttribute("data-selected-exid", exId);

      // Fire event (optional for later focus modal)
      el.dispatchEvent(
        new CustomEvent("ip:focusExercise", {
          bubbles: true,
          detail: { exercise: exName, exerciseId: exId, origin: "recommended" },
        })
      );
    });
  });
  el.querySelector("#btnLogSelectedSet")?.addEventListener("click", () => {
    if (!selected?.id || !selected?.name) return;

    // mark origin as recommended so main.js saves it correctly
    el.setAttribute("data-origin", "recommended");

    // set one-time selection so your existing btnLogSetFromSplit handler uses it
    el.setAttribute("data-selected-ex", selected.name);
    el.setAttribute("data-selected-exid", selected.id);

    // reuse your existing flow
    el.querySelector("#btnLogSetFromSplit")?.click();
  });
el.querySelector("#btnSkipToday")?.addEventListener("click", () => {
  el.dispatchEvent(new CustomEvent("ip:skipToday", { bubbles: true }));
});

el.querySelector("#btnNextSplit")?.addEventListener("click", () => {
  el.dispatchEvent(new CustomEvent("ip:nextSplit", { bubbles: true }));
});


}
