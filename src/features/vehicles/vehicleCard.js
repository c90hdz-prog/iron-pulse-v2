import { getVehicleProgress, getSafeVehicleImgSrc } from "./vehicleProgress.js";

export function vehicleCardHtml({ weeklyTonnage = 0 } = {}) {
  const v = getVehicleProgress(weeklyTonnage);
  const { src, fallback } = getSafeVehicleImgSrc(v.currentId);

  const pct = Math.round((v.pctToNext ?? 1) * 100);
  const label = v.nextId
    ? `${titleCase(v.currentId)} → ${titleCase(v.nextId)} • ${pct}%`
    : `${titleCase(v.currentId)} • MAX`;

  return `
    <div class="card vehicleCard">
      <div class="vehicleTop">
        <img class="vehicleImg" src="${src}" data-fallback="${fallback}" alt="${v.currentId}" />
        <div class="vehicleMeta">
          <div class="vehicleTitle">${titleCase(v.currentId)}</div>
          <div class="vehicleSub">${label}</div>
          <div class="vehicleTonnage">${formatNum(weeklyTonnage)} volume</div>
        </div>
      </div>

      <div class="vehicleBar">
        <div class="vehicleBarFill" style="width:${pct}%"></div>
      </div>
    </div>
  `;
}

export function wireVehicleCard(root = document) {
  // handle missing images gracefully
  root.querySelectorAll("img.vehicleImg").forEach((img) => {
    img.addEventListener(
      "error",
      () => {
        const fb = img.getAttribute("data-fallback");
        if (fb && img.src !== fb) img.src = fb;
      },
      { once: true }
    );
  });
}

function titleCase(str = "") {
  return String(str)
    .replace(/([A-Z])/g, " $1")
    .replace(/[_-]/g, " ")
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatNum(n) {
  const x = Number(n) || 0;
  return x.toLocaleString();
}