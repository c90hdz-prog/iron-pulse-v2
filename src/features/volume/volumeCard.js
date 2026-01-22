import { getWeekId } from "../../state/time.js";
import { monthKey } from "../../state/month.js";

function sumVolumeForWeek(sets, weekId) {
  return sets.reduce((sum, s) => {
    const sWeek = getWeekId(new Date(s.ts));
    if (sWeek !== weekId) return sum;
    return sum + (Number(s.reps) || 0) * (Number(s.weight) || 0);
  }, 0);
}

function sumVolumeForMonth(sets, mKey) {
  return sets.reduce((sum, s) => {
    const sMonth = monthKey(new Date(s.ts));
    if (sMonth !== mKey) return sum;
    return sum + (Number(s.reps) || 0) * (Number(s.weight) || 0);
  }, 0);
}

function pct(current, baseline) {
  // baseline = comparison period. If baseline is 0, treat as 1 to avoid divide-by-zero.
  const denom = Math.max(1, baseline);
  const raw = current / denom;
  // Cap at 200% so the bar doesn’t go insane; still shows “2.0x”
  return Math.min(2, raw);
}

export function renderWeeklyVolume(el, state, view = "week") {
  const now = new Date();
  const sets = state.log.sets || [];

  const currentWeek = getWeekId(now);
  const lastWeek = getWeekId(new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000));

  const currentMonth = monthKey(now);
  const lastMonth = monthKey(new Date(now.getFullYear(), now.getMonth() - 1, 1));

  let currentVol = 0;
  let baselineVol = 0;
  let metaLeft = "";
  let metaRight = "";

  if (view === "week") {
    currentVol = sumVolumeForWeek(sets, currentWeek);
    baselineVol = sumVolumeForWeek(sets, lastWeek);

    const ratio = (currentVol / Math.max(1, baselineVol));
    metaLeft = `vs last week: ${Math.round(baselineVol).toLocaleString()} lbs`;
    metaRight = `${ratio.toFixed(2)}x`;
  } else {
    currentVol = sumVolumeForMonth(sets, currentMonth);
    baselineVol = sumVolumeForMonth(sets, lastMonth);

    const ratio = (currentVol / Math.max(1, baselineVol));
    metaLeft = `vs last month: ${Math.round(baselineVol).toLocaleString()} lbs`;
    metaRight = `${ratio.toFixed(2)}x`;
  }

  const p = pct(currentVol, baselineVol); // 0.0 → 2.0
  const widthPct = Math.round(p * 50);    // 0..100 (since 2.0 maps to 100)

  el.innerHTML = `
    <h3>${view === "week" ? "Weekly Volume" : "Monthly Volume"}</h3>

    <div class="row">
      <div class="big">${Math.round(currentVol).toLocaleString()} lbs</div>

      <div style="display:flex; gap:6px;">
        <button class="pill ${view === "week" ? "active" : ""}" id="volWeek">Week</button>
        <button class="pill ${view === "month" ? "active" : ""}" id="volMonth">Month</button>
      </div>
    </div>

    <div class="barWrap" aria-label="Volume progress bar">
      <div class="barFill" style="width: ${widthPct}%;"></div>
    </div>

    <div class="barMeta">
      <div>${metaLeft}</div>
      <div>${metaRight}</div>
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
