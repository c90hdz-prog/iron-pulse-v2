function formatNumber(n) {
  const x = Number(n || 0);
  return x.toLocaleString();
}

export function renderTodaySummary(el, summary) {
  if (!el) return;

  const status = summary?.status || "not_started";
  const sets = summary?.sets || 0;
  const volume = summary?.volume || 0;
  const exercises = summary?.exercises || [];

  const statusLabel =
    status === "completed" ? "Completed ✅" :
    status === "in_progress" ? "In progress" :
    "Not started";

  const topExercises = exercises.slice(0, 3);
  const extra = Math.max(0, exercises.length - topExercises.length);

  el.innerHTML = `
    <h3>Today</h3>

    <div class="row">
      <div class="big">${statusLabel}</div>
      <div class="pill">${sets} set${sets === 1 ? "" : "s"}</div>
    </div>

    <div style="margin-top:10px;" class="barMeta">
      <div>Volume</div>
      <div>${formatNumber(volume)}</div>
    </div>

    <div style="margin-top:10px; color: var(--muted); font-size: 12px;">
      Exercises
    </div>

    <div style="margin-top:8px; display:flex; gap:8px; flex-wrap:wrap;">
      ${
        topExercises.length
          ? topExercises.map((name) => `<span class="pill">${name}</span>`).join("")
          : `<span class="pill">None yet</span>`
      }
      ${extra > 0 ? `<span class="pill">+${extra} more</span>` : ""}
    </div>
  `;
}
