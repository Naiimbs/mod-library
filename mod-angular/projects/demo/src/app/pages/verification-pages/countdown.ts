import { DestroyRef, Signal, computed, inject, signal } from '@angular/core';

/** Seconds a user waits before a code or link can be sent again. */
export const RESEND_SECONDS = 30;

export interface Countdown {
  /** Seconds left; 0 when the countdown is over. */
  readonly remaining: Signal<number>;
  readonly running: Signal<boolean>;
  start(seconds?: number): void;
}

/**
 * One-second countdown for "Resend" links. Call it in an injection context
 * (a field initialiser or the constructor): the interval is cleared when the
 * component is destroyed.
 */
export function injectCountdown(): Countdown {
  const destroyRef = inject(DestroyRef);
  const remaining = signal(0);
  let timer: ReturnType<typeof setInterval> | undefined;

  const stop = (): void => {
    clearInterval(timer);
    timer = undefined;
  };
  destroyRef.onDestroy(stop);

  return {
    remaining: remaining.asReadonly(),
    running: computed(() => remaining() > 0),
    start(seconds = RESEND_SECONDS): void {
      stop();
      remaining.set(seconds);
      timer = setInterval(() => {
        remaining.update((value) => Math.max(0, value - 1));
        if (remaining() === 0) stop();
      }, 1000);
    },
  };
}
