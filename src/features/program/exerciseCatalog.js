
export const EXERCISE_CATALOG = {
  // --- Lower / legs (main) ---
  squat: {
    id: "squat",
    name: "Squat",
    helper: "Any variation: barbell, smith, hack, machine",
    suggestedReps: 6,
  },
  romanian_deadlift: {
    id: "romanian_deadlift",
    name: "Romanian Deadlift",
    helper: "Any variation: barbell, dumbbell",
    suggestedReps: 8,
  },
  deadlift: {
    id: "deadlift",
    name: "Deadlift",
    helper: "Any variation: barbell, trap bar",
    suggestedReps: 5,
  },
  leg_press: {
    id: "leg_press",
    name: "Leg Press",
    helper: "Machine variation (adjust foot position as needed)",
    suggestedReps: 10,
  },
  bulgarian_split_squat: {
    id: "bulgarian_split_squat",
    name: "Bulgarian Split Squat",
    helper: "Any variation: dumbbell, smith, bodyweight",
    suggestedReps: 8,
  },
  lunges: {
    id: "lunges",
    name: "Walking Lunges",
    helper: "Any variation: dumbbell, bodyweight",
    suggestedReps: 10,
  },
  hamstring_curl: {
    id: "hamstring_curl",
    name: "Hamstring Curl",
    helper: "Machine variation",
    suggestedReps: 12,
  },
  calf_raise: {
    id: "calf_raise",
    name: "Calf Raise",
    helper: "Any variation: machine, dumbbell",
    suggestedReps: 15,
  },

  // --- Upper pushing ---
  bench_press: {
    id: "bench_press",
    name: "Bench Press",
    helper: "Any variation: dumbbell, barbell, smith, machine",
    suggestedReps: 6, // ✅ locked
  },
  incline_press: {
    id: "incline_press",
    name: "Incline Press",
    helper: "Any variation: dumbbell, barbell, smith, machine",
    suggestedReps: 10,
  },
  overhead_press: {
    id: "overhead_press",
    name: "Overhead Press",
    helper: "Any variation: dumbbell, barbell, machine",
    suggestedReps: 8,
  },
  lateral_raise: {
    id: "lateral_raise",
    name: "Lateral Raise",
    helper: "Any variation: dumbbell, cable, machine",
    suggestedReps: 12,
  },
  triceps_pushdown: {
    id: "triceps_pushdown",
    name: "Triceps Pushdown",
    helper: "Any variation: rope, bar, machine",
    suggestedReps: 12,
  },

  // --- Upper pulling ---
  row: {
    id: "row",
    name: "Row",
    helper: "Any variation: cable, dumbbell, machine, barbell",
    suggestedReps: 8,
  },
  seated_row: {
    id: "seated_row",
    name: "Seated Row",
    helper: "Any variation: cable, machine",
    suggestedReps: 10,
  },
  lat_pulldown: {
    id: "lat_pulldown",
    name: "Lat Pulldown",
    helper: "Any variation: pulldown, assisted pull-up, pull-up",
    suggestedReps: 8,
  },
  face_pull: {
    id: "face_pull",
    name: "Face Pull",
    helper: "Cable variation (rear delts / posture)",
    suggestedReps: 12,
  },
  bicep_curl: {
    id: "bicep_curl",
    name: "Bicep Curl",
    helper: "Any variation: dumbbell, barbell, cable, machine",
    suggestedReps: 10,
  },

  // --- Push add-ons (weighted only) ---
  chest_fly: {
    id: "chest_fly",
    name: "Chest Fly",
    helper: "Any variation: cable, machine, dumbbell",
    suggestedReps: 12,
  },
  chest_press_machine: {
    id: "chest_press_machine",
    name: "Chest Press (Machine)",
    helper: "Machine variation (neutral or wide grip)",
    suggestedReps: 10,
  },
  cable_press: {
    id: "cable_press",
    name: "Cable Press",
    helper: "Cable press (standing or bench), controlled reps",
    suggestedReps: 10,
  },
  shoulder_press_machine: {
    id: "shoulder_press_machine",
    name: "Shoulder Press (Machine)",
    helper: "Machine shoulder press variation",
    suggestedReps: 10,
  },
  front_raise: {
    id: "front_raise",
    name: "Front Raise",
    helper: "Any variation: dumbbell, cable, plate",
    suggestedReps: 12,
  },
  triceps_extension: {
    id: "triceps_extension",
    name: "Triceps Extension",
    helper: "Any variation: cable, dumbbell, machine (overhead or skullcrusher style)",
    suggestedReps: 12,
  },
  close_grip_press: {
    id: "close_grip_press",
    name: "Close-Grip Press",
    helper: "Any variation: barbell, smith, machine",
    suggestedReps: 8,
  },

  // --- Pull add-ons (weighted only) ---
  pull_over: {
    id: "pull_over",
    name: "Pullover",
    helper: "Any variation: cable, dumbbell, machine",
    suggestedReps: 12,
  },
  chest_supported_row: {
    id: "chest_supported_row",
    name: "Chest-Supported Row",
    helper: "Any variation: machine, dumbbell, incline bench",
    suggestedReps: 10,
  },
  cable_row: {
    id: "cable_row",
    name: "Cable Row",
    helper: "Cable row variation (V-bar, wide, single handle)",
    suggestedReps: 10,
  },
  machine_row: {
    id: "machine_row",
    name: "Row (Machine)",
    helper: "Machine row variation (any grip)",
    suggestedReps: 10,
  },
  reverse_fly: {
    id: "reverse_fly",
    name: "Reverse Fly",
    helper: "Any variation: cable, machine, dumbbell",
    suggestedReps: 12,
  },
  lat_iso_row: {
    id: "lat_iso_row",
    name: "Lat-Focused Row",
    helper: "Any variation: cable, machine (elbow path toward hips)",
    suggestedReps: 10,
  },
  preacher_curl: {
    id: "preacher_curl",
    name: "Preacher Curl",
    helper: "Any variation: machine, dumbbell, barbell",
    suggestedReps: 10,
  },
  cable_curl: {
    id: "cable_curl",
    name: "Cable Curl",
    helper: "Cable curl variation (straight bar or rope)",
    suggestedReps: 12,
  },
  incline_curl: {
    id: "incline_curl",
    name: "Incline Curl",
    helper: "Dumbbell incline curl variation",
    suggestedReps: 10,
  },
  shrug: {
    id: "shrug",
    name: "Shrug",
    helper: "Any variation: dumbbell, barbell, machine",
    suggestedReps: 12,
  },

  // --- Legs add-ons (weighted only) ---
  leg_extension: {
    id: "leg_extension",
    name: "Leg Extension",
    helper: "Machine variation",
    suggestedReps: 12,
  },
  hip_thrust: {
    id: "hip_thrust",
    name: "Hip Thrust",
    helper: "Any variation: barbell, smith, machine",
    suggestedReps: 8,
  },
  glute_bridge: {
    id: "glute_bridge",
    name: "Glute Bridge",
    helper: "Any variation: barbell, dumbbell",
    suggestedReps: 10,
  },
  hack_squat: {
    id: "hack_squat",
    name: "Hack Squat",
    helper: "Machine variation",
    suggestedReps: 8,
  },
  smith_squat: {
    id: "smith_squat",
    name: "Smith Squat",
    helper: "Smith machine squat variation (controlled depth)",
    suggestedReps: 8,
  },
  leg_curl_seated: {
    id: "leg_curl_seated",
    name: "Seated Leg Curl",
    helper: "Machine variation",
    suggestedReps: 12,
  },
  leg_curl_lying: {
    id: "leg_curl_lying",
    name: "Lying Leg Curl",
    helper: "Machine variation",
    suggestedReps: 12,
  },
  adductor: {
    id: "adductor",
    name: "Adductor",
    helper: "Machine variation",
    suggestedReps: 12,
  },
  abductor: {
    id: "abductor",
    name: "Abductor",
    helper: "Machine variation",
    suggestedReps: 12,
  },

  // --- Optional accessories (still weighted) ---
  calf_press: {
    id: "calf_press",
    name: "Calf Press",
    helper: "Any variation: leg press calf press, machine",
    suggestedReps: 15,
  },
  cable_crunch: {
    id: "cable_crunch",
    name: "Cable Crunch",
    helper: "Cable crunch (kneeling or standing)",
    suggestedReps: 12,
  },

};

export function ex(id) {
  return EXERCISE_CATALOG[id] || { id, name: String(id || "Exercise"), helper: "", suggestedReps: 8 };
}
