export function renderTodaysSplit(el) {
  el.innerHTML = `
    <h3>Today’s Split</h3>
    <div class="big">Push (recommended)</div>
    <div style="margin-top:10px; color: var(--muted); font-size: 12px;">
      Later: swap/custom exercises (keep defaults as recommendations).
    </div>
    <div style="margin-top:12px; display:flex; gap:10px;">
      <button class="btn" id="btnLogSetFromSplit">Log a set</button>
      <button class="btn" id="btnOpenSplit">View</button>
    </div>
  `;
}
