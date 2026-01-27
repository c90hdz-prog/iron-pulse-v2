export const MODAL_LOG_SET = "LOG_SET";
export const MODAL_EXERCISE_FOCUS = "EXERCISE_FOCUS";

/* ---------- Log Set Modal ---------- */
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

        <div class="card" style="padding:12px; margin-top:10px;">
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

/* ---------- Exercise Focus Modal ---------- */
export function exerciseFocusHtml(payload = {}, summary = {}) {
  const name = payload.exercise || "Exercise";
  const sets = summary.setsCount || 0;
  const lbs = summary.totalLbs || 0;

  return `
    <div class="modal" role="dialog" aria-modal="true">
      <div class="modalHeader">
        <div class="modalTitle">${escapeHtml(name)}</div>
        <button class="iconBtn" data-close>✕</button>
      </div>

      <div class="modalBody">
        <div style="color:var(--muted); font-size:12px; margin-bottom:10px;">
          Stay here and log sets for this exercise.
        </div>

        <div class="row" style="margin-bottom:10px;">
          <div class="pill">${sets} sets today</div>
          <div class="pill">${lbs} lbs logged</div>
        </div>

        <div class="row" style="gap:10px;">
          <div class="field" style="flex:1;">
            <label>Reps</label>
            <input id="fxReps" inputmode="numeric" placeholder="8" />
          </div>
          <div class="field" style="flex:1;">
            <label>Weight</label>
            <input id="fxWeight" inputmode="numeric" placeholder="135" />
          </div>
        </div>

        <div style="margin-top:12px; display:flex; gap:10px;">
          <button class="btn" data-close>Close</button>
          <button class="btn btnPrimary" id="fxSave">Save Set</button>
        </div>

        <div style="margin-top:14px; border-top:1px solid var(--line); padding-top:12px;">
          <div style="font-weight:800; margin-bottom:8px;">Logged sets</div>
          <div id="fxList" style="display:grid; gap:8px;"></div>
        </div>
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
