// src/features/todaySummary/todaySummaryCard.js

function fmt(n) {
  return Math.round(Number(n) || 0).toLocaleString();
}

export function renderTodaySummary(el, summary) {
  if (!el) return;

  const s = summary || {};
  const status = s.status || "not_started";
  const sets = Number(s.sets || 0);
  const volume = Number(s.volume || 0);
  const exercises = Array.isArray(s.exercises) ? s.exercises : [];

  const statusLabel =
    status === "completed" ? "Completed ✅" :
    status === "in_progress" ? "In progress" :
    "Not started";

    
  el.innerHTML = `
    <div class="card">
      <div class="cardTitle">Today</div>

      <div class="row" style="align-items:center; justify-content:space-between; margin-top:6px;">
        <div class="big">${statusLabel}</div>
        <div style="color: var(--muted); font-size: 12px;">
          ${sets} sets • ${fmt(volume)} lbs
        </div>
      </div>

      <div style="margin-top:10px; color: var(--muted); font-size: 12px;">
        Exercises: ${exercises.length ? exercises.join(", ") : "—"}
      </div>
      ${summary.afterburn ? `
      <div style="margin-top:6px; font-size:12px; color:var(--muted);">
        Afterburn: 
        <b>
          ${summary.afterburn.finisher} • 
          ${summary.afterburn.durationSec >= 60
            ? Math.round(summary.afterburn.durationSec / 60) + " min"
            : summary.afterburn.durationSec + " sec"}
          ✅
        </b>
      </div>
    ` : ""}
    </div>
  `;
}
