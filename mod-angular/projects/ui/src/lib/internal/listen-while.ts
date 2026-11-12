import { DestroyRef, Renderer2, effect, inject, untracked } from '@angular/core';

/**
 * Listens to a `document` event only while `active()` is true (for example
 * while a popup is open), instead of a permanent `(document:…)` host listener
 * that would run, and schedule change detection, on every event for every
 * component instance on the page.
 *
 * Must be called in an injection context (constructor or field initializer).
 * The listener is attached after the render in which `active()` turned true,
 * so the click that opened a popup is never seen as an outside click.
 *
 * @internal Not part of the public API.
 */
export function listenOnDocumentWhile<E extends Event = Event>(
  active: () => boolean,
  eventName: string,
  handler: (event: E) => void,
): void {
  const renderer = inject(Renderer2);
  let unlisten: (() => void) | null = null;

  effect(() => {
    const on = active();
    untracked(() => {
      if (on && !unlisten) {
        unlisten = renderer.listen('document', eventName, (event: E) => handler(event));
      } else if (!on && unlisten) {
        unlisten();
        unlisten = null;
      }
    });
  });

  inject(DestroyRef).onDestroy(() => {
    unlisten?.();
    unlisten = null;
  });
}
