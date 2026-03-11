// src/features/program/exercisePickerModal.js
import { EXERCISE_CATALOG } from "./exerciseCatalog.js";

export const MODAL_EXERCISE_PICKER = "EXERCISE_PICKER";

/**
 * payload:
 * {
 *   mode: "swap" | "add",
 *   dayId: "YYYY-MM-DD",
 *   splitName: string,
 *   slot?: number (1-based),        // for swap
 *   fromExerciseId?: string,        // for swap lock checking
 *   title?: string
 * }
 */
export function exercisePickerHtml(payload = {}) {
  const isAdd = payload.mode === "add";
  const title = payload.title || (isAdd ? "Add Exercise" : "Swap Exercise");
  const sub = isAdd
    ? "Add one more movement to today’s workout."
    : "Choose a replacement for this slot.";

  const items = Object.values(EXERCISE_CATALOG || {})
    .filter(Boolean)
    .map((e) => ({
      id: e.id,
      name: e.name || e.id,
      helper: e.helper || "",
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

  return `
    <div class="modal modalPicker" role="dialog" aria-modal="true">
      <div class="modalHeader">
        <div>
          <div class="modalTitle">${title}</div>
          <div class="pickerSub">${sub}</div>
        </div>
        <button class="iconBtn" data-close aria-label="Close">✕</button>
      </div>

      <div class="pickerSearchWrap">
        <div class="field">
          <label for="pickerSearch">Search</label>
          <input
            id="pickerSearch"
            type="text"
            inputmode="search"
            autocomplete="off"
            autocapitalize="none"
            spellcheck="false"
            placeholder="Type: row, squat, curl..."
          />
        </div>
      </div>

      <div class="pickerList" id="pickerList">
        ${items
          .map(
            (e) => `
              <button
                class="pickerItem"
                data-pick-exid="${e.id}"
                type="button"
              >
                <div class="pickerItemName">${e.name}</div>
                ${
                  e.helper
                    ? `<div class="pickerItemHelp">${e.helper}</div>`
                    : ""
                }
              </button>
            `
          )
          .join("")}
      </div>

      <div class="modalActions">
        <button class="btn" data-close type="button">Cancel</button>
      </div>
    </div>
  `;
}
