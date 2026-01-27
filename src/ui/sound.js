let ctx = null;

export function beep() {
  try {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();

    // In case it was suspended
    if (ctx.state === "suspended") ctx.resume();

    const o = ctx.createOscillator();
    const g = ctx.createGain();

    o.type = "sine";
    o.frequency.value = 880; // beep
    g.gain.value = 0.06;

    o.connect(g);
    g.connect(ctx.destination);

    o.start();
    o.stop(ctx.currentTime + 0.18);
  } catch {
    // ignore
  }
}
