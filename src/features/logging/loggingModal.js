export const MODAL_LOG_SET = "LOG_SET";

export function loggingModalHtml(payload = {}) {
  const exercise = payload.exercise ?? "";

  return `
    <div class="modal" role="dialog" aria-modal="true">
      <div class="modalHeader">
        <div class="modalTitle">Log Set</div>
        <button class="iconBtn" data-close>✕</button>
      </div>

      <div class="modalBody">
        <div class="field">
          <label>Exercise</label>
          <input
            id="inExercise"
            placeholder="Bench Press"
            value="${escapeHtml(exercise)}"
            data-exname="${escapeHtml(payload.recommendedName || "")}"
            data-exid="${escapeHtml(payload.recommendedId || "")}"
          />
        </div>

        <div class="row" style="gap:10px;">
          <div class="field" style="flex:1;">
            <label>Reps</label>
            <input id="inReps" inputmode="numeric" placeholder="8" />
          </div>
          <div class="field" style="flex:1;">
            <label>Weight</label>
            <input id="inWeight" inputmode="numeric" placeholder="135" />
          </div>
        </div>

        <div class="card" style="padding:12px; margin-top:4px;">
          <div class="row">
            <div>
              <div style="font-weight:800;">Rest Timer</div>
              <div style="color:var(--muted); font-size:12px;">2:00 default</div>
            </div>
            <div class="pill" id="timerDisplay">02:00</div>
          </div>

          <div style="display:flex; gap:10px; margin-top:10px;">
            <button class="btn" id="btnTimerStart">Start</button>
            <button class="btn" id="btnTimerReset">Reset</button>
          </div>
        </div>
      </div>

      <div class="modalActions">
        <button class="btn" data-close>Cancel</button>
        <button class="btn btnPrimary" id="btnSaveSet">Save Set</button>
      </div>
    </div>
  `;
}

function escapeHtml(s) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
