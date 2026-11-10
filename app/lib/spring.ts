/**
 * Tiny interruptible spring, specified the way Apple does it:
 * `response` (seconds to ~one oscillation period) and `damping` (1 = critically
 * damped, no overshoot; <1 bounces). Re-targeting keeps the live value AND
 * velocity, so motion can be grabbed and reversed on any frame.
 */
export type SpringConfig = { response: number; damping: number };

export const SPRINGS = {
  /** Reposition / move: no bounce. */
  move: { response: 0.4, damping: 1 },
  /** Drawer / sheet: slight bounce, only used when the gesture carried momentum. */
  sheet: { response: 0.3, damping: 0.8 },
  /** Press feedback: fast, no bounce. */
  press: { response: 0.22, damping: 1 },
} satisfies Record<string, SpringConfig>;

const STEP = 1 / 240;
const REST_DELTA = 0.001;
const REST_SPEED = 0.01;

export class Spring {
  value: number;
  velocity = 0;
  private target: number;
  private cfg: SpringConfig = SPRINGS.move;
  private raf = 0;
  private last = 0;

  constructor(initial: number, private onUpdate: (v: number) => void) {
    this.value = initial;
    this.target = initial;
  }

  /** Animate to `target` from the current value, inheriting current (or supplied) velocity. */
  to(target: number, cfg: SpringConfig = SPRINGS.move, velocity?: number) {
    this.target = target;
    this.cfg = cfg;
    if (velocity !== undefined) this.velocity = velocity;
    if (!this.raf) {
      this.last = performance.now();
      this.raf = requestAnimationFrame(this.tick);
    }
  }

  /** Jump (also used for 1:1 direct manipulation and reduced motion). */
  set(value: number) {
    this.stop();
    this.value = value;
    this.target = value;
    this.velocity = 0;
    this.onUpdate(value);
  }

  stop() {
    cancelAnimationFrame(this.raf);
    this.raf = 0;
  }

  private tick = (now: number) => {
    let dt = Math.min((now - this.last) / 1000, 0.064);
    this.last = now;
    const omega = (2 * Math.PI) / this.cfg.response;
    const k = omega * omega;
    const c = 2 * this.cfg.damping * omega;
    while (dt > 0) {
      const h = Math.min(dt, STEP);
      const accel = -k * (this.value - this.target) - c * this.velocity;
      this.velocity += accel * h;
      this.value += this.velocity * h;
      dt -= h;
    }
    if (
      Math.abs(this.value - this.target) < REST_DELTA &&
      Math.abs(this.velocity) < REST_SPEED
    ) {
      this.value = this.target;
      this.velocity = 0;
      this.raf = 0;
      this.onUpdate(this.value);
      return;
    }
    this.onUpdate(this.value);
    this.raf = requestAnimationFrame(this.tick);
  };
}

/** Where a release at `velocity` (px/s) would coast to rest (UIScrollView-style decay). */
export function project(velocity: number, decelerationRate = 0.998) {
  return ((velocity / 1000) * decelerationRate) / (1 - decelerationRate);
}

/** Resistance past an edge instead of a hard stop. */
export function rubberBand(offset: number, dimension: number, c = 0.55) {
  return (1 - 1 / ((offset * c) / dimension + 1)) * dimension;
}

export const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;
