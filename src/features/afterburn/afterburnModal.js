// src/features/afterburn/afterburnModal.js
import { dayKey } from "../../state/date.js";
import { setAfterburnForDay } from "../../state/actions.js";

export const MODAL_AFTERBURN = "AFTERBURN";

export function renderAfterburnCard(el, state, onOpen) {
  if (!el) return;

  const todayId = dayKey(new Date());
  const completedSession = state?.streak?.lastSessionDay === todayId;
  const afterburnDone = !!state?.log?.afterburnByDay?.[todayId];

  let desc = "Quick finisher to lock in the day.";
  let label = "Open";
  let disabled = false;

  if (!completedSession) {
    desc = "Complete your session to unlock Afterburn.";
    label = "Locked";
    disabled = true;
  } else if (afterburnDone) {
    desc = "Completed for today ✅";
    label = "Completed";
    disabled = true;
  }

  el.innerHTML = `
    <div class="card">
      <div class="cardTitle">Afterburn</div>
      <div style="margin-top:6px; color: var(--muted); font-size: 12px;">
        ${desc}
      </div>
      <div style="display:flex; gap:10px; margin-top:12px;">
        <button class="btn btnPrimary" id="btnAfterburnOpen" ${disabled ? "disabled" : ""}>
          ${label}
        </button>
      </div>
    </div>
  `;

  if (!disabled) {
    el.querySelector("#btnAfterburnOpen")?.addEventListener("click", () => onOpen?.());
  }
}

export function afterburnModalHtml(state) {
  const todayId = dayKey(new Date());
  const entry = state?.log?.afterburnByDay?.[todayId] || null;

  const doneLine = entry
    ? `Completed: <b>${entry.finisher}</b>${entry.durationSec ? ` (${entry.durationSec}s)` : ""} ✅`
    : `Not completed yet`;

  return `
    <div class="modal" role="dialog" aria-modal="true">
      <div class="modalHeader">
        <div class="modalTitle">Afterburn</div>
        <button class="iconBtn" data-close>✕</button>
      </div>

      <div class="modalBody">
        <div class="big">${doneLine}</div>

        <div style="margin-top:10px; color: var(--muted); font-size: 12px;">
          Bodyweight
        </div>

        <div id="abFinishersBW" style="display:flex; gap:10px; margin-top:10px; flex-wrap:wrap;">
          <button class="btn" data-finisher="Push-ups" data-kind="bw">Push-ups</button>
          <button class="btn" data-finisher="Plank" data-kind="bw">Plank</button>
          <button class="btn" data-finisher="Sit-ups" data-kind="bw">Sit-ups</button>
        </div>

        <div style="margin-top:12px; color: var(--muted); font-size: 12px;">
          Cardio
        </div>

        <div id="abFinishersCardio" style="display:flex; gap:10px; margin-top:10px; flex-wrap:wrap;">
          <button class="btn" data-finisher="Bike" data-kind="cardio">Bike</button>
          <button class="btn" data-finisher="Stairmaster" data-kind="cardio">Stairmaster</button>
          <button class="btn" data-finisher="Treadmill" data-kind="cardio">Treadmill</button>
        </div>

        <div style="margin-top:14px; color: var(--muted); font-size: 12px;">
          Timer (optional):
        </div>

        <div id="abDurRow" style="display:flex; gap:10px; margin-top:10px; flex-wrap:wrap;">
          <!-- injected by binder based on finisher type -->
        </div>

        <div style="margin-top:12px; font-size: 24px; font-weight: 800;" id="abTime">01:00</div>

        <div style="display:flex; gap:10px; margin-top:12px; flex-wrap:wrap;">
          <button class="btn" id="abStart">Start</button>
          <button class="btn" id="abReset">Reset</button>
        </div>
      </div>

      <div class="modalActions">
        <button class="btn" data-close>Close</button>
        <button class="btn btnPrimary" id="abComplete">Complete</button>
      </div>
    </div>
  `;
}

function fmt(secs) {
  const mm = String(Math.floor(secs / 60)).padStart(2, "0");
  const ss = String(secs % 60).padStart(2, "0");
  return `${mm}:${ss}`;
}

export function bindAfterburnModal(overlay, store, onClose, { toast, haptic, beep } = {}) {
  if (!overlay) return;

  overlay.querySelectorAll("[data-close]").forEach((btn) =>
    btn.addEventListener("click", () => onClose?.())
  );

  const todayId = dayKey(new Date());

  // selection
  let finisher = null;
  let total = 60;
  let remaining = total;

  // timer state
  let running = false;
  let t = null;

  const elTime = overlay.querySelector("#abTime");
  const btnStart = overlay.querySelector("#abStart");
  const btnReset = overlay.querySelector("#abReset");

  const render = () => {
    if (elTime) elTime.textContent = fmt(Math.max(0, remaining));
    if (btnStart) btnStart.textContent = running ? "Pause" : "Start";
  };

  const stop = () => {
    running = false;
    if (t) clearInterval(t);
    t = null;
    render();
  };

  const start = () => {
    if (running) return;
    if (remaining <= 0) remaining = total;
    running = true;
    render();
    t = setInterval(() => {
      remaining -= 1;
      render();
      if (remaining <= 0) {
        stop();
        remaining = 0;
        render();
        beep?.();
        haptic?.("success");
        toast?.("Afterburn timer done ✅");
      }
    }, 1000);
  };

  const toggle = () => (running ? stop() : start());

  btnStart?.addEventListener("click", toggle);

  btnReset?.addEventListener("click", () => {
    stop();
    remaining = total;
    render();
  });

  const durRow = overlay.querySelector("#abDurRow");

  function setActiveFinisherButton(clickedBtn) {
    overlay.querySelectorAll("[data-finisher]").forEach((b) => b.classList.remove("active"));
    clickedBtn.classList.add("active");
  }
  function setDurations(listSecs, defaultSec) {
    if (!durRow) return;

    durRow.innerHTML = listSecs.map((sec) => {
      const label = sec >= 60 ? `${Math.round(sec / 60)} min` : `${sec}s`;
      const active = sec === defaultSec ? "active" : "";
      return `<button class="pill ${active}" data-dur="${sec}">${label}</button>`;
    }).join("");

    // set timer values
    total = defaultSec;
    remaining = defaultSec;
    stop();
    render();

    // wire clicks
    durRow.querySelectorAll("[data-dur]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const v = Number(btn.getAttribute("data-dur"));
        if (!Number.isFinite(v) || v <= 0) return;

        total = v;
        remaining = v;

        durRow.querySelectorAll("[data-dur]").forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");

        stop();
        render();
      });
    });
  }

  // default preset (bodyweight)
  setDurations([30, 60, 120], 60);

    overlay.querySelectorAll("[data-finisher]").forEach((btn) => {
      btn.addEventListener("click", () => {
        finisher = btn.getAttribute("data-finisher") || "Afterburn";
        const kind = btn.getAttribute("data-kind") || "bw";

        // ✅ keep selected highlighted
        setActiveFinisherButton(btn);

        // Switch duration presets based on type
        if (kind === "cardio") {
          setDurations([300, 600, 900], 600); // 5/10/15 min, default 10
        } else {
          setDurations([30, 60, 120], 60);     // 30/60/90 sec, default 60
        }

        toast?.(`${finisher} selected`);
        haptic?.("light");
      });
    });

  overlay.querySelector("#abComplete")?.addEventListener("click", () => {
    const picked = finisher || "Afterburn";

    store.dispatch(
      setAfterburnForDay({
        dayId: todayId,
        finisher: picked,
        durationSec: total,
      })
    );

    toast?.(`Afterburn complete: ${picked} ✅`);
    haptic?.("success");
    onClose?.();
  });

  render();
}