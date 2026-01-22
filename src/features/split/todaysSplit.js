import { dayKey } from "../../state/date.js";

export function renderTodaysSplit(el, state) {
  const today = dayKey(new Date());
  const completedToday = state?.streak?.lastSessionDay === today;

  el.innerHTML = `
    <h3>Today's Split</h3>
    <div class="big">Push (recommended)</div>
    <div style="margin-top:10px; color: var(--muted); font-size: 12px;">
      Later: swap/custom exercises (keep defaults as recommendations).
    </div>

    <div style="margin-top:12px; display:flex; gap:10px; flex-wrap: wrap;">
      <button class="btn" id="btnLogSetFromSplit">Log a set</button>
      <button class="btn" id="btnOpenSplit">View</button>

      <button class="btn btnPrimary" id="btnCompleteSession" ${completedToday ? "disabled" : ""}>
        ${completedToday ? "Completed Today ✅" : "Complete Session"}
      </button>
    </div>
  `;
}
