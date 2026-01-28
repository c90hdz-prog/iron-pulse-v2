export const MODAL_EXERCISE_FOCUS = "EXERCISE_FOCUS";

export function exerciseFocusHtml(payload = {}, summary = {}, rows = []) {
  const name = payload.exercise || "Exercise";
  const sets = Number(summary.setsCount || 0);
  const totalLbs = Number(summary.totalLbs || 0);

  const goal = 3;
  const cap = 5;
  const goalDone = sets >= goal;
  const capped = sets >= cap;

  return `
    <div class="modal" role="dialog" aria-modal="true">
      <div class="modalHeader">
        <div class="modalTitle">${escapeHtml(name)}</div>
        <button class="iconBtn" data-close aria-label="Close">✕</button>
      </div>

      <div class="modalBody">
        <div style="color:var(--muted); font-size:12px; margin-bottom:10px;">
          Log sets for this exercise (${goal}–${cap})
        </div>

        <div class="row" style="margin-bottom:10px; gap:10px; flex-wrap:wrap;">
          <div class="pill">Sets today: <b>${sets}</b> / ${goal}${goalDone ? " ✅" : ""}</div>
          <div class="pill"><b>${totalLbs}</b> lbs logged</div>
        </div>

        <div class="card" style="padding:12px;">
          <div style="font-weight:800; margin-bottom:8px;">Quick logger</div>

          <div class="fieldRow">
            <div class="field">
              <label>Reps</label>
              <input id="fxReps" inputmode="numeric" placeholder="8" ${capped ? "disabled" : ""}/>
            </div>
            <div class="field">
              <label>Weight</label>
              <input id="fxWeight" inputmode="numeric" placeholder="135" ${capped ? "disabled" : ""}/>
            </div>
          </div>

          <div style="display:flex; gap:10px; margin-top:10px;">
            <button class="btn btnPrimary" id="fxLogBtn" ${capped ? "disabled" : ""}>
              ${capped ? "Cap reached" : "Log Set"}
            </button>
            <button class="btn" id="fxClearInputs" ${capped ? "disabled" : ""}>Clear</button>
          </div>

          <div id="fxHint" style="margin-top:8px; color:var(--muted); font-size:12px;">
            ${capped ? "Max sets done" : "Tip: 3 sets = Goal / 5 sets Max"}
          </div>
        </div>

        <div class="card" style="padding:12px; margin-top:10px;">
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
          <div class="row" style="align-items:flex-end;">
            <div style="font-weight:800;">Logged sets</div>
          </div>

          <div id="fxList" class="fxList">
            ${
              rows.length
                ? rows.map((s) => {
                    const lbs = (Number(s.reps) || 0) * (Number(s.weight) || 0);
                    return `
                      <div class="fxSetRow">
                        <div class="fxSetLeft">
                          <div class="fxMain"><b>${escapeHtml(s.reps)}</b> × <b>${escapeHtml(s.weight)}</b></div>
                          <div class="fxSub">${lbs} lbs</div>
                        </div>
                        <button class="fxDel" data-del-id="${escapeHtml(s.id)}" aria-label="Delete set">x</button>
                      </div>
                    `;
                  }).join("")
                : `<div style="color:var(--muted); font-size:12px;">No sets yet. Log your first set 💪</div>`
            }
          </div>
        </div>

        <div style="margin-top:12px;">
          <button class="btn" data-close style="width:100%;">Close</button>
        </div>
      </div>
    </div>
  `;
}



function escapeHtml(s) {
  return String(s ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
