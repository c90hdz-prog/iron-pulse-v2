export function renderWeeklyVolume(el, state) {
  // For now: fake computed volume = sum(reps * weight) from last 7 days
  const weekMs = 7 * 24 * 60 * 60 * 1000;
  const now = Date.now();
  const vol = state.log.sets
    .filter(s => now - s.ts <= weekMs)
    .reduce((sum, s) => sum + (Number(s.reps)||0) * (Number(s.weight)||0), 0);

  el.innerHTML = `
    <h3>Weekly Volume</h3>
    <div class="row">
      <div class="big">${Math.round(vol).toLocaleString()} lbs</div>
      <div class="pill">Week</div>
    </div>
    <div style="margin-top:12px; color: var(--muted); font-size: 12px;">
      Tomorrow: add Month toggle (button, not swipe).
    </div>
  `;
}
