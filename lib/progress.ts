/**
 * Smooth progress for a step whose real progress cannot be observed (a
 * WebAssembly decode, a canvas encode). The value moves from `from` towards
 * `to` and slows down as it gets closer, so it never reaches `to` before the
 * step is really finished; stop() then jumps to `to`.
 *
 * All values are fractions between 0 and 1. `expectedMs` is a rough guess of
 * how long the step takes; a wrong guess only changes the speed of the bar.
 */
export function creep(
  report: (value: number) => void,
  from: number,
  to: number,
  expectedMs: number,
): () => void {
  const started = Date.now();
  const tau = Math.max(300, expectedMs / 2);

  const tick = () => {
    const elapsed = Date.now() - started;
    report(to - (to - from) * Math.exp(-elapsed / tau));
  };

  tick();
  const timer = setInterval(tick, 150);

  return () => {
    clearInterval(timer);
    report(to);
  };
}

/** Lets the browser paint between two heavy synchronous steps. */
export function nextFrame(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 0));
}
