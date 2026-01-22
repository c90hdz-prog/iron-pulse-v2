import { getWeekId } from "../../state/time.js";
import { monthKey } from "../../state/month.js";

export function renderWeeklyVolume(el, state, view = "week") {
  const now = new Date();
  const currentWeek = getWeekId(now);
  const currentMonth = monthKey(now);

  const sets = state.log.sets || [];

  const volume = sets.reduce((sum, s) => {
    if (view === "week" && getWeekId(new Date(s.ts)) !== currentWeek) return sum;
    if (view === "month" && monthKey(new Date(s.ts)) !== currentMonth) return sum;

    return sum + (Number(s.reps) || 0) * (Number(s.weight) || 0);
  }, 0);

  el.innerHTML = `
    <h3>${view === "week" ? "Weekly Volume" : "Monthly Volume"}</h3>

    <div class="row">
      <div class="big">${Math.round(volume).toLocaleString()} lbs</div>

      <div style="display:flex; gap:6px;">
        <button class="pill ${view === "week" ? "active" : ""}" id="volWeek">Week</button>
        <button class="pill ${view === "month" ? "active" : ""}" id="volMonth">Month</button>
      </div>
    </div>

    <div style="margin-top:10px; color: var(--muted); font-size: 12px;">
      ${view === "week" ? `Week ${currentWeek}` : `Month ${currentMonth}`}
    </div>
  `;

  el.querySelector("#volWeek")?.addEventListener("click", () => {
    renderWeeklyVolume(el, state, "week");
  });

  el.querySelector("#volMonth")?.addEventListener("click", () => {
    renderWeeklyVolume(el, state, "month");
  });
}
