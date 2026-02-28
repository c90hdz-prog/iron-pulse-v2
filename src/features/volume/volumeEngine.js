export const VOLUME_MILESTONES = [
  { id: "skateboard", label: "Skateboard", lbs: 2000 },
  { id: "dirtbike", label: "Dirt Bike", lbs: 5000 },
  { id: "sedan", label: "Sedan", lbs: 8000 },
  { id: "pickup", label: "Pickup Truck", lbs: 12000 },
  { id: "suv", label: "SUV", lbs: 16000 },
  { id: "van", label: "Van", lbs: 20000 },
  { id: "sports", label: "Sports Car", lbs: 24000 },
  { id: "ambulance", label: "Ambulance", lbs: 30000 },
  { id: "bus", label: "City Bus", lbs: 40000 },
];

export function calcSetVolume(set) {
  const reps = Number(set?.reps ?? 0);
  const weight = Number(set?.weight ?? 0);
  if (!Number.isFinite(reps) || !Number.isFinite(weight)) return 0;
  if (reps <= 0 || weight <= 0) return 0;
  return reps * weight;
}

export function calcWeekVolume(sets, weekId) {
  let total = 0;
  for (const s of sets || []) {
    if (!s) continue;
    if (s.weekId !== weekId) continue;
    total += calcSetVolume(s);
  }
  return Math.round(total);
}

export function buildWeeklyGauge(volume, milestones = VOLUME_MILESTONES) {
  const ms = [...milestones].sort((a, b) => a.lbs - b.lbs);
  if (!ms.length) {
    return { volume, prev: null, next: null, fill: 0, remainingToNext: 0, isMaxed: false };
  }

  if (volume <= ms[0].lbs) {
    const next = ms[0];
    return {
      volume,
      prev: { id: "start", label: "Start", lbs: 0 },
      next,
      fill: next.lbs === 0 ? 1 : clamp(volume / next.lbs, 0, 1),
      remainingToNext: Math.max(0, next.lbs - volume),
      isMaxed: false,
    };
  }

  let prev = ms[0];
  let next = null;

  for (let i = 0; i < ms.length; i++) {
    if (ms[i].lbs <= volume) prev = ms[i];
    if (ms[i].lbs > volume) { next = ms[i]; break; }
  }

  if (!next) {
    return {
      volume,
      prev,
      next: null,
      fill: 1,
      remainingToNext: 0,
      isMaxed: true,
      overflow: volume - prev.lbs,
    };
  }

  const span = next.lbs - prev.lbs;
  const fill = span <= 0 ? 1 : clamp((volume - prev.lbs) / span, 0, 1);

  return {
    volume,
    prev,
    next,
    fill,
    remainingToNext: Math.max(0, next.lbs - volume),
    isMaxed: false,
  };
}

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}