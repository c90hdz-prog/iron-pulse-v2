export function renderStreakBanner(el, state) {
  const goal = state.goals.weeklyGoal;
  const sessions = state.streak.sessionsThisWeek;

  el.innerHTML = `
    <h3>Streak</h3>
    <div class="row">
      <div class="big">${sessions}/${goal} sessions this week</div>
      <div class="pill">Streak: ${state.streak.streakWeeks} weeks</div>
    </div>
    <div style="margin-top:10px; display:flex; gap:8px;">
      ${Array.from({ length: goal }).map((_, i) => {
        const filled = i < sessions;
        return `<div style="height:10px; flex:1; border-radius:999px; border:1px solid var(--line); background:${filled ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.18)"}"></div>`;
      }).join("")}
    </div>
  `;
}
