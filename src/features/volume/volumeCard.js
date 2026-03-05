// src/features/volume/volumeCard.js
import { getWeekId } from "../../state/time.js";
import { monthKey } from "../../state/month.js";
import { selectCurrentWeekGauge } from "../../state/selectors.js";
import { getVehicleProgress, getVehicleImgSrc } from "../vehicles/vehicleProgress.js";

/*
  Apple polish:
  - Week tab: vehicle hero (current → next), soft glass, depth, micro animation
  - Month tab: pure analytics, same polish but no vehicles
  - Persists selected tab using el.dataset.volView
*/

function sumVolumeForWeek(sets, weekId) {
  return sets.reduce((sum, s) => {
    const sWeek =
      s.weekId ??
      getWeekId(new Date(String(s.dayId || "") + "T00:00:00"));
    if (sWeek !== weekId) return sum;
    return sum + (Number(s.reps) || 0) * (Number(s.weight) || 0);
  }, 0);
}

function sumVolumeForMonth(sets, mKey) {
  return sets.reduce((sum, s) => {
    const ts = s.ts ?? Date.parse(String(s.dayId || "")) ?? 0;
    const sMonth = monthKey(new Date(ts));
    if (sMonth !== mKey) return sum;
    return sum + (Number(s.reps) || 0) * (Number(s.weight) || 0);
  }, 0);
}

function pct(current, baseline) {
  const denom = Math.max(1, baseline);
  const raw = current / denom;
  return Math.min(2, raw);
}

function fmt(n) {
  return Math.round(Number(n) || 0).toLocaleString();
}

// label -> asset path (optional)

function titleCase(str = "") {
  return String(str)
    .replace(/([A-Z])/g, " $1")
    .replace(/[_-]/g, " ")
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function vehicleChipHtml(vehicleId, kind = "current") {
  const isNext = kind === "next";
  const src = getVehicleImgSrc(vehicleId);
  const fallback = getVehicleImgSrc("sedan"); // you have sedan.png for sure

  return `
    <div class="ipVeh ${isNext ? "isNext" : "isCurrent"}">
      <img
        class="ipVehImg"
        src="${src}"
        alt="${vehicleId}"
        data-fallback="${fallback}"
        onerror="const fb=this.dataset.fallback; if(fb && this.src!==fb) this.src=fb;"
      />
      <div class="ipVehLabel">${titleCase(vehicleId)}</div>
    </div>
  `;
}


export function renderWeeklyVolume(el, state, view = null) {
  if (!el) return;

  const remembered = el.dataset.volView || "week";
  const activeView = view || remembered;

  const now = new Date();
  const sets = state?.log?.sets || [];

  const currentWeek = state?.streak?.weekId || getWeekId(now);
  const lastWeek = getWeekId(new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000));

  const currentMonth = monthKey(now);
  const lastMonth = monthKey(new Date(now.getFullYear(), now.getMonth() - 1, 1));

  let currentVol = 0;
  let baselineVol = 0;
  let metaLeft = "";
  let metaRight = "";
  let widthPct = 0;
  let extraMeta = "";

  // WEEK (milestone gauge)
  let gauge = null;
  if (activeView === "week") {
    gauge = selectCurrentWeekGauge(state);
    currentVol = gauge.volume || 0;
    baselineVol = sumVolumeForWeek(sets, lastWeek);
    widthPct = Math.round((gauge.fill || 0) * 100);

    metaLeft = gauge.next
      ? `${fmt(gauge.remainingToNext)} lbs to ${gauge.next.label}`
      : `MAXED: ${gauge.prev?.label || "MAX"}`;

    metaRight = gauge.isMaxed
      ? `+${fmt(gauge.overflow)} lbs`
      : `${gauge.next?.label || ""}`;

    extraMeta = `Week ${currentWeek}`;
  } else {
    // MONTH (ratio compare)
    currentVol = sumVolumeForMonth(sets, currentMonth);
    baselineVol = sumVolumeForMonth(sets, lastMonth);

    const p = pct(currentVol, baselineVol);
    widthPct = Math.round(p * 50);

    const ratio = currentVol / Math.max(1, baselineVol);
    metaLeft = `vs last month: ${fmt(baselineVol)} lbs`;
    metaRight = `${ratio.toFixed(2)}x`;
    extraMeta = `Month ${currentMonth}`;
  }

  // Vehicles only on week view
// Vehicles only on week view
let vehicleRow = "";
if (activeView === "week") {
  const v = getVehicleProgress(currentVol); // currentVol is gauge.volume in week mode
  const currentId = v.currentId;
  const nextId = v.nextId || "interstellar";

  vehicleRow = `
    <div class="ipVehRow">
      ${vehicleChipHtml(currentId, "current")}
      <div class="ipVehArrow">→</div>
      ${vehicleChipHtml(nextId, "next")}
    </div>
  `;
}

  el.innerHTML = `
    <div class="card ipGlass">
      <div class="row ipTopRow">
        <div>
          <div class="cardTitle">Weekly Volume</div>
          <div class="ipBig">${fmt(currentVol)} <span class="ipUnit">lbs</span></div>
        </div>

        <div class="ipSeg">
          <button class="pill ${activeView === "week" ? "active" : ""}" id="volWeek">Week</button>
          <button class="pill ${activeView === "month" ? "active" : ""}" id="volMonth">Month</button>
        </div>
      </div>

      <div class="ipBarWrap" aria-label="Volume progress bar">
        <div class="ipBarFill" style="width:${widthPct}%;"></div>
        <div class="ipBarShine"></div>
      </div>

      <div class="ipMeta">
        <div class="ipMetaLeft">${metaLeft}</div>
        <div class="ipMetaRight">${metaRight}</div>
      </div>

      ${vehicleRow}

      <div class="ipFoot">${extraMeta}</div>
    </div>
  `;

  // Micro-animation: restart fill transition on update
  const fill = el.querySelector(".ipBarFill");
  if (fill) {
    fill.classList.remove("ipAnimate");
    void fill.offsetWidth;
    fill.classList.add("ipAnimate");
  }

  el.querySelector("#volWeek")?.addEventListener("click", () => {
    el.dataset.volView = "week";
    renderWeeklyVolume(el, state, "week");
  });

  el.querySelector("#volMonth")?.addEventListener("click", () => {
    el.dataset.volView = "month";
    renderWeeklyVolume(el, state, "month");
  });
}

