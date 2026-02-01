
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

  // --- Core ---
  plank: {
    id: "plank",
    name: "Plank",
    helper: "30–45 sec hold (2–3 sets)",
    suggestedReps: 1,
  },
  core_choice: {
    id: "core_choice",
    name: "Core (Choice)",
    helper: "Pick any: crunches, hanging raises, cable crunch",
    suggestedReps: 12,
  },
};

export function ex(id) {
  return EXERCISE_CATALOG[id] || { id, name: String(id || "Exercise"), helper: "", suggestedReps: 8 };
}
