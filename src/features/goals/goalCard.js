export function renderGoalCard(el, state, onReset) {
  const goal = state.goals.weeklyGoal;
  const sessions = state.streak.sessionsThisWeek;
  const left = Math.max(0, goal - sessions);

  el.innerHTML = `
    <h3>Training Goal</h3>
    <div class="row">
      <div class="big">${left} session${left === 1 ? "" : "s"} left</div>
      <button class="iconBtn" id="btnResetWeek" title="Reset weekly goal progress">Reset</button>
    </div>
    <div style="margin-top:10px; display:flex; gap:8px;">
      ${["M","T","W","T","F","S","S"].map((d) => `<div class="pill" style="padding:10px 12px;">${d}</div>`).join("")}
    </div>
    <div style="margin-top:12px; color: var(--muted); font-size: 12px;">
      Intensity calendar stays visual for now. Logic later.
    </div>
  `;

  el.querySelector("#btnResetWeek")?.addEventListener("click", onReset);
}
