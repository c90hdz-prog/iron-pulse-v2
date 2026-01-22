export function haptic(type = "tap") {
  // Web vibration support is mostly Android; iOS typically ignores it.
  if (!("vibrate" in navigator)) return;

  const patterns = {
    tap: 10,
    success: [10, 30, 10],
    warning: [30],
  };

  const pattern = patterns[type] ?? patterns.tap;

  try {
    navigator.vibrate(pattern);
  } catch {
    // ignore
  }
}
