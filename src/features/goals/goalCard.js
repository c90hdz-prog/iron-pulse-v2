import { selectSessionsThisWeek } from "../../state/selectors.js";

export function renderGoalCard(el, state, onReset) {
  const goal = state.goals.weeklyGoal;
  const sessionsThisWeek = selectSessionsThisWeek(state);
  const left = Math.max(0, goal - sessionsThisWeek);

  el.innerHTML = `
    <h3>Weekly Goal</h3>

    <div class="row" style="margin-top:6px;">
      <div class="big">${goal} days / week</div>
      <button class="pill" id="btnResetWeek">Reset</button>
    </div>

    <div style="margin-top:8px; color: var(--muted); font-size: 12px;">
      ${left > 0 ? `${left} days remaining` : "Goal completed 💪"}
    </div>

    <div class="row" style="margin-top:10px;">
      ${Array.from({ length: goal }).map((_, i) => `
        <div class="pill ${i < sessionsThisWeek ? "active" : ""}">
          ${i < sessionsThisWeek ? "✓" : "○"}
        </div>
      `).join("")}
    </div>
  `;

  el.querySelector("#btnResetWeek")?.addEventListener("click", onReset);
}
