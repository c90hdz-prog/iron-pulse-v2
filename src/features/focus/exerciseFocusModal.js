export const MODAL_EXERCISE_FOCUS = "EXERCISE_FOCUS";

export function exerciseFocusHtml(payload = {}, summary = {}, rows = []) {
  const name = payload.exercise || "Exercise";
  const slots = clampSlots(payload.slots ?? 3);

  const setsCount = summary.setsCount || 0;
  const totalLbs = summary.totalLbs || 0;

  return `
    <div class="modal" role="dialog" aria-modal="true">
      <div class="modalHeader">
        <div class="modalTitle">${escapeHtml(name)}</div>
        <button class="iconBtn" data-close>✕</button>
      </div>

      <div class="modalBody">
        <div style="color:var(--muted); font-size:12px; margin-bottom:10px;">
          Log sets here (3 → up to 5). Each set locks when logged.
        </div>

        <div class="row" style="margin-bottom:12px;">
          <div class="pill">${setsCount} sets today</div>
          <div class="pill">${totalLbs} lbs</div>
        </div>

        <!-- Set Rows -->
        <div id="fxRows" style="display:grid; gap:10px;">
          ${renderRows(slots, rows)}
        </div>

        <div style="display:flex; gap:10px; margin-top:12px;">
          <button class="btn" data-close>Close</button>
          <button class="btn" id="fxAddSet" ${slots >= 5 ? "disabled" : ""}>Add Set</button>
        </div>

        <!-- Rest Timer -->
        <div class="card" style="padding:12px; margin-top:14px;">
          <div class="row">
            <div>
              <div style="font-weight:800;">Rest Timer</div>
              <div style="color:var(--muted); font-size:12px;">2:00 default</div>
            </div>
            <div class="pill" id="fxTimerDisplay">02:00</div>
          </div>

          <div style="display:flex; gap:10px; margin-top:10px;">
            <button class="btn" id="fxTimerStart">Start</button>
            <button class="btn" id="fxTimerReset">Reset</button>
          </div>
        </div>

        <div style="margin-top:14px; border-top:1px solid var(--line); padding-top:12px;">
          <div style="font-weight:800; margin-bottom:8px;">Logged sets</div>
          <div id="fxList" style="display:grid; gap:8px;"></div>
        </div>
      </div>
    </div>
  `;
}

function renderRows(slots, rows) {
  // rows is an array of logged sets sorted by slotIndex
  const bySlot = new Map();
  rows.forEach((s) => bySlot.set(Number(s.slotIndex || 0), s));

  let html = "";
  for (let i = 1; i <= slots; i++) {
    const existing = bySlot.get(i);
    const done = !!existing;

    html += `
      <div class="card" style="padding:12px;">
        <div class="row" style="margin-bottom:8px;">
          <div style="font-weight:800;">Set ${i}</div>
          ${done ? `<div class="pill">Done ✅</div>` : `<div class="pill">Pending</div>`}
        </div>

        <div class="row" style="gap:10px;">
          <div class="field" style="flex:1;">
            <label>Reps</label>
            <input id="fxReps_${i}" inputmode="numeric" placeholder="8" value="${done ? escapeHtml(existing.reps) : ""}" ${done ? "disabled" : ""}/>
          </div>

          <div class="field" style="flex:1;">
            <label>Weight</label>
            <input id="fxWeight_${i}" inputmode="numeric" placeholder="135" value="${done ? escapeHtml(existing.weight) : ""}" ${done ? "disabled" : ""}/>
          </div>
        </div>

        <div style="display:flex; gap:10px; margin-top:10px;">
          <button class="btn btnPrimary" data-slot="${i}" data-action="log" ${done ? "disabled" : ""}>
            Log
          </button>
          ${
            done
              ? `<button class="btn" data-slot="${i}" data-action="edit">Edit</button>`
              : `<button class="btn" data-slot="${i}" data-action="clear">Clear</button>`
          }
        </div>
      </div>
    `;
  }
  return html;
}

function clampSlots(n) {
  const x = Number(n) || 3;
  return Math.max(3, Math.min(5, x));
}

function escapeHtml(s) {
  return String(s ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
