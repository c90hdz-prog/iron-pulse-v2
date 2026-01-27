import { selectSessionsThisWeek } from "../../state/selectors.js";

// src/features/goals/goalCard.js
export function renderGoalCard(el, state, onReset) {
  const goal = Math.max(2, Math.min(7, Number(state?.goals?.weeklyGoal ?? 2)));

  el.innerHTML = `
    <h3>Weekly Goal</h3>

    <div class="big">${goal} days / week</div>

    <div style="margin-top:10px; color:var(--muted); font-size:12px;">
      Pick how many training days you want this week. This drives your split.
    </div>

    <div style="margin-top:12px; display:flex; gap:8px; flex-wrap:wrap;">
      ${[2,3,4,5,6,7].map((n) => `
        <button
          class="pill pillSelectable ${n === goal ? "active" : ""}"
          data-goal="${n}"
          type="button"
        >
          ${n}
        </button>
      `).join("")}
    </div>

    <div style="margin-top:12px; display:flex; gap:10px; flex-wrap:wrap;">
      <button class="btn" id="btnGoalApply" type="button">Apply</button>
      <button class="btn" id="btnGoalReset" type="button">Reset week</button>
    </div>
  `;

  // UI-only selection until user clicks Apply
  let pending = goal;

  el.querySelectorAll("[data-goal]").forEach((btn) => {
    btn.addEventListener("click", () => {
      pending = Number(btn.getAttribute("data-goal") || goal);

      // update active styles
      el.querySelectorAll("[data-goal]").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      // bubble event up to main.js
      el.dispatchEvent(new CustomEvent("ip:setWeeklyGoal", {
        bubbles: true,
        detail: { goal: pending }
      }));
    });
  });

  el.querySelector("#btnGoalReset")?.addEventListener("click", () => {
    if (typeof onReset === "function") onReset();
  });
}
