// src/features/vehicles/vehicleProgress.js

export const VEHICLE_ORDER = [
  "dirtbike",
  "sedan",
  "pickup",
  "suv",
  "bus",
  "firetruck",
  "cargotruck",
  "helicopter",
  "privatejet",
  "interstellar",
];

// Set your tonnage thresholds (weekly volume). Tweak anytime.
export const VEHICLE_THRESHOLDS = [
  { id: "dirtbike", min: 0 },
  { id: "sedan", min: 25000 },
  { id: "pickup", min: 50000 },
  { id: "suv", min: 75000 },
  { id: "bus", min: 100000 },
  { id: "firetruck", min: 150000 },
  { id: "cargotruck", min: 200000 },
  { id: "helicopter", min: 300000 },
  { id: "privatejet", min: 400000 },
  { id: "interstellar", min: 500000 },
];

export function getVehicleForTonnage(tonnage, thresholds = VEHICLE_THRESHOLDS) {
  const t = Number(tonnage) || 0;
  let current = thresholds[0]?.id || "dirtbike";

  for (const step of thresholds) {
    if (t >= step.min) current = step.id;
  }
  return current;
}

export function getVehicleProgress(tonnage, thresholds = VEHICLE_THRESHOLDS) {
  const t = Number(tonnage) || 0;

  // Find current step index
  let idx = 0;
  for (let i = 0; i < thresholds.length; i++) {
    if (t >= thresholds[i].min) idx = i;
  }

  const cur = thresholds[idx];
  const next = thresholds[idx + 1] || null;

  const curMin = cur.min;
  const nextMin = next ? next.min : cur.min;

  const pct = next
    ? Math.max(0, Math.min(1, (t - curMin) / (nextMin - curMin)))
    : 1;

  return {
    currentId: cur.id,
    nextId: next?.id ?? null,
    currentMin: curMin,
    nextMin: next?.min ?? null,
    pctToNext: pct,
  };
}

export function getVehicleImgSrc(vehicleId) {
  return `/assets/icons/vehicles/${vehicleId}.png`;
}
// optional: safe fallback if a file isn't in the folder yet
export function getSafeVehicleImgSrc(vehicleId) {
  const src = getVehicleImgSrc(vehicleId);
  // Use sedan as a safe default (since you have it)
  return { src, fallback: getVehicleImgSrc("sedan") };
}