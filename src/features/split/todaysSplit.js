import { dayKey } from "../../state/date.js";
import { getRecommendedPlan } from "../program/programEngine.js";

export function renderTodaysSplit(el, state) {
  const today = dayKey(new Date());
  const completedToday = state?.streak?.lastSessionDay === today;

  const plan = getRecommendedPlan({
    weeklyGoal: state?.goals?.weeklyGoal ?? 2,
    date: new Date(),
    // later: overrideIndex can come from state/program settings
  });
el.setAttribute("data-split-name", plan.splitName);
el.removeAttribute("data-origin");
el.removeAttribute("data-selected-ex");

  el.innerHTML = `
    <h3>Today's Split</h3>
    <div class="big">${plan.label}</div>

    <div style="margin-top:10px; color: var(--muted); font-size: 12px;">
      Recommended exercises:
    </div>

    <div style="margin-top:10px; display:grid; gap:8px;">
      ${plan.exercises.slice(0, 4).map((ex) => `
        <button class="pill" data-ex="${ex.name}" style="text-align:left;">
          ${ex.name}
        </button>
      `).join("")}
      ${plan.exercises.length > 4 ? `<div style="color:var(--muted); font-size:12px;">+ ${plan.exercises.length - 4} more</div>` : ""}
    </div>

    <div style="margin-top:12px; display:flex; gap:10px; flex-wrap: wrap;">
      <button class="btn" id="btnLogSetFromSplit">Log a set</button>
      <button class="btn" id="btnOpenSplit">View</button>
      <button class="btn btnPrimary" id="btnCompleteSession" ${completedToday ? "disabled" : ""}>
        ${completedToday ? "Completed Today ✅" : "Complete Session"}
      </button>
    </div>
  `;

  el.querySelectorAll("[data-ex]").forEach((btn) => {
  btn.addEventListener("click", () => {
    const exName = btn.getAttribute("data-ex");

    // Mark that this came from a recommended exercise tap
    el.setAttribute("data-origin", "recommended");

    // Prefill the modal exercise name
    el.setAttribute("data-selected-ex", exName);

    // Open modal via existing button handler
    el.querySelector("#btnLogSetFromSplit")?.click();
  });
});

}
