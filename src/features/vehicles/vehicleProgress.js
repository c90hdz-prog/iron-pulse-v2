// src/features/vehicles/vehicleProgress.js
import { VOLUME_MILESTONES } from "../volume/volumeEngine.js";

export function getVehicleProgress(volume = 0) {
  const milestones = [...VOLUME_MILESTONES].sort((a, b) => a.lbs - b.lbs);
  const v = Number(volume) || 0;

  if (!milestones.length) {
    return {
      currentId: "start",
      currentLabel: "Start",
      nextId: null,
      nextLabel: null,
      isMaxed: false,
    };
  }

  // Before first milestone
  if (v < milestones[0].lbs) {
    return {
      currentId: milestones[0].id,
      currentLabel: milestones[0].label,
      nextId: milestones[1]?.id ?? null,
      nextLabel: milestones[1]?.label ?? null,
      isMaxed: false,
    };
  }

  // Find highest reached milestone
  let current = milestones[0];
  for (const m of milestones) {
    if (v >= m.lbs) current = m;
  }

  const currentIndex = milestones.findIndex((m) => m.id === current.id);
  const next = milestones[currentIndex + 1] ?? null;

  // Maxed
  if (!next) {
    return {
      currentId: current.id,
      currentLabel: current.label,
      nextId: null,
      nextLabel: null,
      isMaxed: true,
    };
  }

  return {
    currentId: current.id,
    currentLabel: current.label,
    nextId: next.id,
    nextLabel: next.label,
    isMaxed: false,
  };
}

export function getVehicleImgSrc(vehicleId) {
  const isGitHubPages = location.hostname.includes("github.io");
  const base = isGitHubPages ? "/iron-pulse-v2" : "";
  return `${base}/assets/icons/vehicles/${vehicleId}.webp`;
}