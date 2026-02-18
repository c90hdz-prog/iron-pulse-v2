// src/features/program/exercisePickerModal.js
import { EXERCISE_CATALOG } from "./exerciseCatalog.js";

export const MODAL_EXERCISE_PICKER = "EXERCISE_PICKER";

/**
 * payload:
 * {
 *   mode: "swap" | "add",
 *   dayId: "YYYY-MM-DD",
 *   splitName: string,
 *   slot?: number (1-based)         // for swap
 *   fromExerciseId?: string         // for swap lock checking
 *   title?: string
 * }
 */
export function exercisePickerHtml(payload = {}) {
  const title = payload.title || (payload.mode === "add" ? "Add Exercise" : "Swap Exercise");

  // catalog list
  const items = Object.values(EXERCISE_CATALOG || {})
    .filter(Boolean)
    .map((e) => ({
      id: e.id,
      name: e.name || e.id,
      helper: e.helper || "",
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

  return `
    <div class="modal" role="dialog" aria-modal="true">
      <div class="modalHeader">
        <div class="modalTitle">${title}</div>
        <button class="iconBtn" data-close>✕</button>
      </div>

      <div class="modalBody">
        <div class="field">
          <label>Search</label>
          <input id="pickerSearch" placeholder="Type: row, squat, curl..." />
        </div>

        <div style="margin-top:10px; display:grid; gap:8px;" id="pickerList">
          ${items
            .map(
              (e) => `
                <button class="pill pillSelectable" data-pick-exid="${e.id}" style="text-align:left;">
                  <div style="font-weight:800;">${e.name}</div>
                  ${
                    e.helper
                      ? `<div style="color:var(--muted); font-size:12px; margin-top:2px;">${e.helper}</div>`
                      : ""
                  }
                </button>
              `
            )
            .join("")}
        </div>
      </div>

      <div class="modalActions">
        <button class="btn" data-close>Cancel</button>
      </div>
    </div>
  `;
}
