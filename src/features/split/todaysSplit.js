import { dayKey } from "../../state/date.js";
import { getRecommendedPlan } from "../program/programEngine.js";

function splitMeta(splitName, label) {
  // Simple optional descriptions (edit freely)
  const map = {
    push: { title: label || "Push", desc: "Pressing for chest, shoulders, triceps." },
    pull: { title: label || "Pull", desc: "Rowing and pulling for a thicker back and arms." },
    legs: { title: label || "Legs", desc: "Squats and hinges for lower body strength." },
    upper: { title: label || "Upper", desc: "Balanced upper-body work with moderate intensity." },
    lower: { title: label || "Lower", desc: "Lower-body work with moderate intensity." },
  };

  return map[splitName] || { title: label || "Today", desc: "Your recommended session for today." };
}

function calcTodayStats(sets, todayId) {
  // totals by exerciseId for today
  const byId = new Map();

  for (const s of sets) {
    if (!s || s.dayId !== todayId) continue;

    const exid = s.exerciseId || "";
    if (!exid) continue;

    const reps = Number(s.reps || 0) || 0;
    const weight = Number(s.weight || 0) || 0;
    const lbs = reps * weight;

    const cur = byId.get(exid) || { sets: 0, lbs: 0 };
    cur.sets += 1;
    cur.lbs += lbs;
    byId.set(exid, cur);
  }

  return byId;
}

export function renderTodaysSplit(el, state) {
  const todayId = dayKey(new Date());
  const completedToday = state?.streak?.lastSessionDay === todayId;

  const plan = getRecommendedPlan({
    weeklyGoal: state?.goals?.weeklyGoal ?? 2,
    date: new Date(),
    overrideToday: state?.program?.todayOverride ?? null,
    swapOverrides: state?.program?.exerciseSwapsByDay?.[todayId] ?? null,
  });

  el.setAttribute("data-split-name", plan.splitName);

  const selected = {
    id: el.getAttribute("data-selected-exid"),
    name: el.getAttribute("data-selected-ex"),
  };

  const sets = Array.isArray(state?.log?.sets) ? state.log.sets : [];
  const statsById = calcTodayStats(sets, todayId);

  const meta = splitMeta(plan.splitName, plan.label);

  const minSets = 3;
  const topFive = plan.exercises.slice(0, 5);

  const allDone =
    topFive.length > 0 &&
    topFive.every((exObj) => {
      const st = statsById.get(exObj.id) || { sets: 0, lbs: 0 };
      return st.sets >= minSets;
    });

  el.innerHTML = `
    <div class="todayCard ${allDone ? "allDone" : ""}">
      <div class="todayHeader">
        <div>
          <div class="todayTitle">${meta.title}</div>
          <div class="todayDesc">${meta.desc}</div>
        </div>

        <button class="btn btnGhost" id="btnSkipToday">SKIP TODAY</button>
      </div>

      <div class="todayList">
        ${topFive
          .map((exObj) => {
            const active = selected?.id === exObj.id;
            const st = statsById.get(exObj.id) || { sets: 0, lbs: 0 };

            const isStarted = st.sets > 0;
            const isDone = st.sets >= minSets;

            return `
              <button
                class="todayRow 
                  ${active ? "active" : ""} 
                  ${isStarted ? "started" : ""} 
                  ${isDone ? "done" : ""}"
                data-ex="${exObj.name}"
                data-exid="${exObj.id}"
                data-sreps="${exObj.suggestedReps ?? ""}"
                style="text-align:left;"
              >
                <div class="rowTop">
                  <div class="rowName">${exObj.name}</div>
                  <div class="rowChevron">${isDone ? "✓" : "›"}</div>
                </div>

                <div class="rowLink">Log sets</div>

                <div class="rowBottom">
                  <div class="rowMin">Min ${minSets} sets</div>
                  <div class="rowLbs">${st.lbs} lbs logged</div>
                </div>
              </button>
            `;
          })
          .join("")}
      </div>
    </div>

    <div style="margin-top:14px; display:flex; gap:10px; flex-wrap: wrap;">
      <button class="btn" id="btnNextSplit">Next option</button>
      <button class="btn" id="btnOpenSplit">View</button>
      <button class="btn btnPrimary" id="btnCompleteSession" ${completedToday ? "disabled" : ""}>
        ${completedToday ? "Completed Today ✅" : "Complete Session"}
      </button>
    </div>
  `;

  // Exercise row click
  el.querySelectorAll("[data-ex]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const exName = btn.getAttribute("data-ex") || "Exercise";
      const exId = btn.getAttribute("data-exid") || "";
      const suggestedReps = Number(btn.getAttribute("data-sreps") || 0) || null;

      el.setAttribute("data-selected-ex", exName);
      el.setAttribute("data-selected-exid", exId);

      el.dispatchEvent(
        new CustomEvent("ip:focusExercise", {
          bubbles: true,
          detail: {
            exercise: exName,
            exerciseId: exId,
            origin: "recommended",
            suggestedReps,
          },
        })
      );
    });
  });

  el.querySelector("#btnSkipToday")?.addEventListener("click", () => {
    el.dispatchEvent(new CustomEvent("ip:skipToday", { bubbles: true }));
  });

  el.querySelector("#btnNextSplit")?.addEventListener("click", () => {
    el.dispatchEvent(new CustomEvent("ip:nextSplit", { bubbles: true }));
  });
}
