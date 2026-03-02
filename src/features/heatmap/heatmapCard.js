import { selectHeatmap90 } from "../../state/selectors.js";

function isoDay(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function startOfWeekSunday(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const dow = d.getDay(); // 0=Sun..6=Sat
  d.setDate(d.getDate() - dow);
  return d;
}

function addDays(date, n) {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

function monthShort(m) {
  return ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][m] || "";
}

export function renderHeatmapCard(el, state) {
  if (!el) return;

  const days = selectHeatmap90(state);

  // Active day = level > 0 (your C rule is already baked into selector)
  const activeCount = days.reduce((n, d) => n + ((d.level || 0) > 0 ? 1 : 0), 0);

  // Smart default (C):
  // - If user hasn't set preference: expanded until 7+ active days, then collapse
  const pref = state?.program?.prefs?.heatmapCollapsed; // null/true/false
  const smartDefaultCollapsed = activeCount >= 7;
  const collapsed = pref === null ? smartDefaultCollapsed : !!pref;

  const todayObj = days[days.length - 1];
  const todayLabel =
    (todayObj?.level || 0) > 0
      ? `Today: ${todayObj.volume.toLocaleString()} lbs${todayObj.session ? " • Session" : ""}${todayObj.afterburn ? " • Afterburn" : ""}`
      : `Today: none yet`;

  const btnText = collapsed ? "Show" : "Hide";

  // -------------------------
  // Collapsed summary view
  // -------------------------
  if (collapsed) {
    el.innerHTML = `
      <div class="card">
        <div class="row" style="align-items:center; justify-content:space-between;">
          <div class="cardTitle">90-Day Heatmap</div>
          <button class="pill" id="hmToggle">${btnText}</button>
        </div>

        <div style="margin-top:8px; color: var(--muted); font-size: 12px;">
          Active days: <b>${activeCount}</b> / 90
        </div>

        <div style="margin-top:6px; color: var(--muted); font-size: 12px;">
          ${todayLabel}
        </div>

        <div style="margin-top:10px; color: var(--muted); font-size: 12px;">
          (Afterburn days will get a ring/glow later ✅)
        </div>
      </div>
    `;

    el.querySelector("#hmToggle")?.addEventListener("click", () => {
      el.dispatchEvent(new CustomEvent("ip:toggleHeatmap", { bubbles: true }));
    });

    return;
  }

  // -------------------------
  // GitHub-style Expanded View
  // columns = weeks, rows = Sun..Sat
  // -------------------------

  // Map dayId -> data
  const byId = new Map();
  for (const d of days) byId.set(d.dayId, d);

  const first = days[0]?.date ? new Date(days[0].date) : new Date();
  const last = days[days.length - 1]?.date ? new Date(days[days.length - 1].date) : new Date();

  const gridStart = startOfWeekSunday(first);
  const gridEnd = addDays(last, 6 - last.getDay()); // end on Saturday

  const totalDays = Math.round((gridEnd - gridStart) / (24 * 60 * 60 * 1000)) + 1;
  const weekCols = Math.ceil(totalDays / 7);

  const todayId = isoDay(new Date());

  // Month labels: show label when a new month starts in a column
  const monthLabels = [];
  let lastMonth = null;
  for (let w = 0; w < weekCols; w++) {
    const colStart = addDays(gridStart, w * 7);
    const m = colStart.getMonth();
    const label = (lastMonth === null || m !== lastMonth) ? monthShort(m) : "";
    monthLabels.push(label);
    lastMonth = m;
  }

  // Build cells using absolute grid placement
  // Layout grid:
  // - Column 1 is labels (16px)
  // - Columns 2.. are weeks
  // - Rows 1..7 are Sun..Sat
  let cells = "";
  for (let w = 0; w < weekCols; w++) {
    for (let r = 0; r < 7; r++) {
      const date = addDays(gridStart, w * 7 + r);
      const dayId = isoDay(date);
      const d = byId.get(dayId);

      const lvl = d?.level || 0;
      const opacity = lvl === 0 ? 0.08 : 0.15 + lvl * 0.18;

      const inRange = dayId >= isoDay(first) && dayId <= isoDay(last);
      const isToday = dayId === todayId;

      // Hide cells outside the 90-day window (but keep spacing)
      const bg = inRange ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.0)";
      const cellOpacity = inRange ? opacity : 0;

      const outline = isToday ? "outline:1px solid rgba(255,255,255,0.35);" : "";

      const title = inRange
        ? `${dayId} • ${(d?.volume || 0).toLocaleString()} lbs${d?.session ? " • Session" : ""}${d?.afterburn ? " • Afterburn" : ""}`
        : "";

      cells += `
        <div
          class="hmCell"
          title="${title}"
          data-lvl="${lvl}"
          data-afterburn="${d?.afterburn ? "1" : "0"}"
          data-session="${d?.session ? "1" : "0"}"
          style="
            grid-column:${w + 2};
            grid-row:${r + 1};
            height:12px;
            border-radius:4px;
            background:${bg};
            opacity:${cellOpacity};
            ${outline}
          "
        ></div>
      `;
    }
  }

  // Day labels (Sun..Sat)
  const dayLabels = ["S","M","T","W","T","F","S"].map((ch, i) => `
    <div style="
      grid-column:1;
      grid-row:${i + 1};
      font-size:10px;
      color: var(--muted);
      line-height:12px;
      height:12px;
      display:flex;
      align-items:center;
      justify-content:center;
      opacity:${(i === 1 || i === 3 || i === 5) ? 1 : 0.4};
    ">${ch}</div>
  `).join("");

  // Month label row as a separate grid (aligns with week columns)
  const monthRow = `
    <div style="
      display:grid;
      grid-template-columns: 16px repeat(${weekCols}, 1fr);
      gap:6px;
      margin-top:8px;
      margin-bottom:6px;
    ">
      <div></div>
      ${monthLabels.map((m) => `
        <div style="font-size:10px; color: var(--muted); opacity:${m ? 1 : 0};">
          ${m || ""}
        </div>
      `).join("")}
    </div>
  `;

  el.innerHTML = `
    <div class="card">
      <div class="row" style="align-items:center; justify-content:space-between;">
        <div class="cardTitle">90-Day Heatmap</div>
        <button class="pill" id="hmToggle">${btnText}</button>
      </div>

      <div style="margin-top:6px; color: var(--muted); font-size: 12px;">
        Active days: <b>${activeCount}</b> / 90
      </div>

      ${monthRow}

      <div style="
        display:grid;
        grid-template-columns: 16px repeat(${weekCols}, 1fr);
        gap:6px;
        align-items:center;
      ">
        ${dayLabels}
        ${cells}
      </div>

      <div style="margin-top:10px; color: var(--muted); font-size: 12px;">
        Tip: days with Afterburn will get a ring/glow later ✅
      </div>
    </div>
  `;

  el.querySelector("#hmToggle")?.addEventListener("click", () => {
    el.dispatchEvent(new CustomEvent("ip:toggleHeatmap", { bubbles: true }));
  });
}