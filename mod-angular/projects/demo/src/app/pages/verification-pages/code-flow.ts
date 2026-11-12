import { DestroyRef, Signal, computed, inject, signal } from '@angular/core';
import { injectCountdown } from './countdown';

export type CodeState = 'idle' | 'busy' | 'error' | 'success' | 'resent';

export interface CodeFlow {
  readonly code: Signal<string>;
  readonly state: Signal<CodeState>;
  /** All boxes are filled. */
  readonly complete: Signal<boolean>;
  readonly busy: Signal<boolean>;
  /** Seconds until the code can be sent again. */
  readonly remaining: Signal<number>;
  /** Resend is not available yet. */
  readonly waiting: Signal<boolean>;
  setCode(value: string): void;
  verify(): void;
  resend(): void;
}

/**
 * Demo logic shared by the code-verification examples: the typed code, a
 * simulated check (a code of all zeros is "incorrect", any other complete
 * code succeeds) and the resend countdown. Call it in an injection context;
 * every timer is cleared when the component is destroyed.
 */
export function injectCodeFlow(length: number): CodeFlow {
  const destroyRef = inject(DestroyRef);
  const countdown = injectCountdown();
  const code = signal('');
  const state = signal<CodeState>('idle');
  const incorrect = '0'.repeat(length);
  let timer: ReturnType<typeof setTimeout> | undefined;

  destroyRef.onDestroy(() => clearTimeout(timer));
  // The page opens right after a code was sent.
  countdown.start();

  return {
    code: code.asReadonly(),
    state: state.asReadonly(),
    complete: computed(() => code().length === length),
    busy: computed(() => state() === 'busy'),
    remaining: countdown.remaining,
    waiting: countdown.running,

    setCode(value: string): void {
      code.set(value);
      // Editing the code cancels a running check and clears the last result.
      if (state() !== 'idle') {
        clearTimeout(timer);
        state.set('idle');
      }
    },

    verify(): void {
      if (state() === 'busy' || code().length !== length) return;
      state.set('busy');
      // Stand-in for the real verification request.
      timer = setTimeout(() => state.set(code() === incorrect ? 'error' : 'success'), 800);
    },

    resend(): void {
      if (countdown.running()) return;
      clearTimeout(timer);
      code.set('');
      state.set('resent');
      countdown.start();
    },
  };
}
