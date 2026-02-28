// src/features/goals/goalCard.js

function goalNeedsSetup(state) {
  const weekId = state?.streak?.weekId || "";
  const handled = state?.goals?.goalHandledWeekId || null;
  return !!weekId && handled !== weekId;
}

function emit(el, name, detail = {}) {
  el?.dispatchEvent(new CustomEvent(name, { detail, bubbles: true }));
}

function clampGoal(n) {
  const v = Number(n);
  if (!Number.isFinite(v)) return 5;
  return Math.max(2, Math.min(7, v));
}

export function renderGoalCard(el, state, onReset = null) {
  if (!el) return;

  const needsSetup = goalNeedsSetup(state);
  const currentGoal = clampGoal(state?.goals?.weeklyGoal ?? 5);
  const sessionsThisWeek = Number(state?.streak?.sessionsThisWeek ?? 0);
  const locked = !!state?.goals?.goalLocked;

  const defaultPick = 5;

  // ===========================
  // SETUP MODE (Top of week)
  // ===========================
  if (needsSetup) {
    el.innerHTML = `
      <div class="card">
        <div class="cardTitle">Set your goal for this week</div>

        <div style="margin-top:6px; color: var(--muted); font-size: 12px;">
          Pick how many workout days you’re aiming for.
        </div>

        <div style="display:flex; gap:6px; flex-wrap:wrap; margin-top:10px;">
          ${[2,3,4,5,6,7].map(n => `
            <button class="pill ${n === defaultPick ? "active" : ""}" data-goal="${n}">
              ${n} days
            </button>
          `).join("")}
        </div>

        <div style="display:flex; gap:10px; margin-top:12px;">
          <button class="btn btnPrimary" id="btnGoalSave">Save</button>
          <button class="btn" id="btnGoalSkip">Skip</button>
        </div>

        <div style="margin-top:10px; color: var(--muted); font-size: 12px;">
          If you skip, we’ll default to <b>5 days</b>.
        </div>
      </div>
    `;

    let picked = defaultPick;

    el.querySelectorAll("[data-goal]").forEach((btn) => {
      btn.addEventListener("click", () => {
        picked = clampGoal(btn.getAttribute("data-goal"));
        el.querySelectorAll("[data-goal]").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
      });
    });

    el.querySelector("#btnGoalSave")?.addEventListener("click", () => {
      emit(el, "ip:setWeeklyGoal", { goal: picked });
    });

    el.querySelector("#btnGoalSkip")?.addEventListener("click", () => {
      emit(el, "ip:skipWeeklyGoalSetup", {});
    });

    return;
  }

  // ===========================
  // COMPACT MODE (Bottom)
  // ===========================
  el.innerHTML = `
    <div class="card">
      <div class="cardTitle">Weekly goal</div>

      <div class="row" style="align-items:center; margin-top:6px;">
        <div class="big">${currentGoal} days</div>
        <div style="color: var(--muted); font-size: 12px;">
          ${sessionsThisWeek}/${currentGoal} completed
        </div>
      </div>

      <div style="display:flex; gap:6px; flex-wrap:wrap; margin-top:10px;">
        ${[2,3,4,5,6,7].map(n => `
          <button 
            class="pill ${n === currentGoal ? "active" : ""}" 
            data-goal="${n}"
            ${locked ? "disabled" : ""}>
            ${n}
          </button>
        `).join("")}
      </div>

      <div style="display:flex; gap:10px; margin-top:12px;">
        <button class="btn" id="btnGoalReset">Reset week</button>
      </div>

      <div style="margin-top:10px; color: var(--muted); font-size: 12px;">
        ${locked 
          ? "Goal locked — reset week to change it."
          : "You can change your goal anytime."}
      </div>
    </div>
  `;

  // Only allow clicks if not locked
  el.querySelectorAll("[data-goal]").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (locked) return;
      const goal = clampGoal(btn.getAttribute("data-goal"));
      emit(el, "ip:setWeeklyGoal", { goal });
    });
  });

  el.querySelector("#btnGoalReset")?.addEventListener("click", () => {
    if (typeof onReset === "function") onReset();
  });
}
