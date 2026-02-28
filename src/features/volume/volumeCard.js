import { getWeekId } from "../../state/time.js";
import { monthKey } from "../../state/month.js";
import { selectCurrentWeekGauge, selectWeekCompetition } from "../../state/selectors.js";

/*
  - WEEK view: milestone gauge (vehicle progression) + self-competition
  - MONTH view: ratio compare
  - Expects (el, state, view)
*/

// ===========================
// Helpers
// ===========================
function sumVolumeForWeek(sets, weekId) {
  return sets.reduce((sum, s) => {
    const sWeek = s.weekId ?? getWeekId(new Date(s.dayId + "T00:00:00"));
    if (sWeek !== weekId) return sum;
    return sum + (Number(s.reps) || 0) * (Number(s.weight) || 0);
  }, 0);
}

function sumVolumeForMonth(sets, mKey) {
  return sets.reduce((sum, s) => {
    const sMonth = monthKey(new Date(s.ts ?? s.dayId));
    if (sMonth !== mKey) return sum;
    return sum + (Number(s.reps) || 0) * (Number(s.weight) || 0);
  }, 0);
}

function pct(current, baseline) {
  const denom = Math.max(1, baseline);
  const raw = current / denom;
  return Math.min(2, raw);
}

function fmtSigned(n) {
  const v = Math.round(Number(n) || 0);
  if (v === 0) return "0";
  return (v > 0 ? "+" : "−") + Math.abs(v).toLocaleString();
}

// ===========================
// Main Renderer
// ===========================
export function renderWeeklyVolume(el, state, view = "week") {
  const now = new Date();
  const sets = state.log.sets || [];

  const currentWeek = state.streak.weekId;
  const lastWeek = getWeekId(new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000));

  const currentMonth = monthKey(now);
  const lastMonth = monthKey(new Date(now.getFullYear(), now.getMonth() - 1, 1));

  let currentVol = 0;
  let baselineVol = 0;
  let metaLeft = "";
  let metaRight = "";
  let widthPct = 0;
  let extraMeta = "";

  // NEW: self-competition lines for week view
  let compLine1 = "";
  let compLine2 = "";

  // ===========================
  // WEEK VIEW (Milestone Gauge)
  // ===========================
  if (view === "week") {
    const gauge = selectCurrentWeekGauge(state);
    const comp = selectWeekCompetition(state);

    currentVol = gauge.volume;
    baselineVol = sumVolumeForWeek(sets, lastWeek);

    widthPct = Math.round((gauge.fill || 0) * 100);

    metaLeft = gauge.next
      ? `${gauge.remainingToNext.toLocaleString()} lbs to ${gauge.next.label}`
      : `MAXED: ${gauge.prev.label}`;

    metaRight = gauge.isMaxed
      ? `+${(gauge.overflow || 0).toLocaleString()} lbs`
      : gauge.next?.label || "";

    // Self-competition (ugly but motivating)
    const last = Math.round(comp.last || 0);
    const best = Math.round(comp.best || 0);
    const delta = Math.round(comp.delta || 0);
    const pctBest = best > 0 ? Math.round((comp.current / best) * 100) : 0;

    compLine1 = `vs last week: ${last.toLocaleString()} lbs (${fmtSigned(delta)})`;
    compLine2 = best > 0
      ? `best week: ${best.toLocaleString()} lbs (${pctBest}% of best)`
      : `best week: —`;

    extraMeta = `Week ${currentWeek}`;
  }

  // ===========================
  // MONTH VIEW (Ratio Compare)
  // ===========================
  else {
    currentVol = sumVolumeForMonth(sets, currentMonth);
    baselineVol = sumVolumeForMonth(sets, lastMonth);

    const p = pct(currentVol, baselineVol);
    widthPct = Math.round(p * 50); // 2.0x maps to 100%

    const ratio = (currentVol / Math.max(1, baselineVol));

    metaLeft = `vs last month: ${Math.round(baselineVol).toLocaleString()} lbs`;
    metaRight = `${ratio.toFixed(2)}x`;

    extraMeta = `Month ${currentMonth}`;
  }

  // ===========================
  // Render
  // ===========================
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

    ${
      view === "week"
        ? `
          <div style="margin-top:8px; font-size:12px; color: var(--muted); display:flex; justify-content:space-between; gap:10px;">
            <div>${compLine1}</div>
            <div>${compLine2}</div>
          </div>
        `
        : ""
    }

    <div style="margin-top:10px; color: var(--muted); font-size: 12px;">
      ${extraMeta}
    </div>
  `;

  el.querySelector("#volWeek")?.addEventListener("click", () => {
    renderWeeklyVolume(el, state, "week");
  });

  el.querySelector("#volMonth")?.addEventListener("click", () => {
    renderWeeklyVolume(el, state, "month");
  });
}
