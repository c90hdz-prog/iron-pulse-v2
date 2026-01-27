export const EXERCISE_CATALOG = {
  press: {
    id: "press",
    name: "Bench / Chest Press",
    helper: "Any variation: DB, barbell, smith, machine",
  },
  row: {
    id: "row",
    name: "Back Rows",
    helper: "Any variation: cable, DB, machine, barbell",
  },
  overhead: {
    id: "overhead",
    name: "Shoulder Press",
    helper: "Any variation: DB, machine, barbell",
  },
  squat: {
    id: "squat",
    name: "Squats",
    helper: "Any variation: barbell, hack, smith, goblet",
  },
  hinge: {
    id: "hinge",
    name: "Hip Hinge",
    helper: "Any variation: RDL, deadlift, hip thrust",
  },
  lunge: {
    id: "lunge",
    name: "Lunges / Split Squat",
    helper: "Any variation: DB, smith, bodyweight",
  },
  pull: {
    id: "pull",
    name: "Pull-down / Pull-up",
    helper: "Any variation: lat pulldown, assisted pull-up",
  },
  curl: {
    id: "curl",
    name: "Bicep Curls",
    helper: "Any variation: DB, cable, machine",
  },
  triceps: {
    id: "triceps",
    name: "Triceps Press",
    helper: "Any variation: rope, bar, machine",
  },
  core: {
    id: "core",
    name: "Core",
    helper: "Any variation: plank, crunch, hanging raise",
  },
};

export function ex(id) {
  return EXERCISE_CATALOG[id] || { id, name: id, helper: "" };
}
