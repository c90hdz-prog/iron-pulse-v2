// src/features/volume/volumeCard.js
import { getWeekId } from "../../state/time.js";
import { monthKey } from "../../state/month.js";
import { selectCurrentWeekGauge } from "../../state/selectors.js";

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
function vehicleAsset(label = "") {
  const key = String(label || "").trim().toLowerCase();
  const map = {
    "dirt bike": "assets/vehicles/dirt-bike.png",
    "motorcycle": "assets/vehicles/motorcycle.png",
    "sedan": "assets/vehicles/sedan.png",
    "suv": "assets/vehicles/suv.png",
    "pickup": "assets/vehicles/pickup.png",
    "delivery truck": "assets/vehicles/delivery-truck.png",
    "box truck": "assets/vehicles/box-truck.png",
    "semi truck": "assets/vehicles/semi-truck.png",
    "fire truck": "assets/vehicles/fire-truck.png",
    "battle tank": "assets/vehicles/battle-tank.png",
  };
  return map[key] || null;
}

function vehicleEmoji(label = "") {
  const key = String(label || "").trim().toLowerCase();
  const map = {
    "dirt bike": "🏍️",
    "motorcycle": "🏍️",
    "sedan": "🚗",
    "suv": "🚙",
    "pickup": "🛻",
    "delivery truck": "🚚",
    "box truck": "🚚",
    "semi truck": "🚛",
    "fire truck": "🚒",
    "battle tank": "🪖",
  };
  return map[key] || "🏁";
}

function vehicleChipHtml(label, kind = "current") {
  const src = vehicleAsset(label);
  const emoji = vehicleEmoji(label);
  const isNext = kind === "next";

  return `
    <div class="ipVeh ${isNext ? "isNext" : "isCurrent"}">
      ${
        src
          ? `
            <img
              class="ipVehImg"
              src="${src}"
              alt="${label}"
              onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"
            />
            <div class="ipVehEmoji" style="display:none;">${emoji}</div>
          `
          : `<div class="ipVehEmoji">${emoji}</div>`
      }
      <div class="ipVehLabel">${label || "Milestone"}</div>
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
  let vehicleRow = "";
  if (activeView === "week") {
    const currentLabel = gauge?.prev?.label || "Current";
    const nextLabel = gauge?.next?.label || (gauge?.isMaxed ? "MAX" : "Next");

    vehicleRow = `
      <div class="ipVehRow">
        ${vehicleChipHtml(currentLabel, "current")}
        <div class="ipVehArrow">→</div>
        ${vehicleChipHtml(nextLabel, "next")}
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

