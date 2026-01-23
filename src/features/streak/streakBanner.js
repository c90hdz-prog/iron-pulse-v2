import { selectSessionsThisWeek } from "../../state/selectors.js";

export function renderStreakBanner(el, state) {
  const sessionsThisWeek = selectSessionsThisWeek(state);
  const goal = state.goals.weeklyGoal;
  const streakWeeks = state.streak.streakWeeks;

  el.innerHTML = `
    <div class="row">
      <div>
        <div class="big">${sessionsThisWeek}/${goal} sessions</div>
        <div style="color: var(--muted); font-size: 12px;">
          ${goal - sessionsThisWeek > 0
            ? `${goal - sessionsThisWeek} left this week`
            : "Goal met 🎉"}
        </div>
      </div>

      <div class="pill ${sessionsThisWeek >= goal ? "active" : ""}">
        🔥 ${streakWeeks} wk streak
      </div>
    </div>
  `;
}
