import { DestroyRef, effect, inject, untracked } from '@angular/core';

/** Open overlays and popups (modal, slideout, menus, …) in opening order; the last is topmost. */
const stack: object[] = [];

/**
 * Shared by the overlays that close on a document-level Escape, so that one
 * key press closes only the topmost one.
 *
 * @internal Not part of the public API.
 */
export const overlayStack = {
  push(overlay: object): void {
    if (!stack.includes(overlay)) stack.push(overlay);
  },
  remove(overlay: object): void {
    const index = stack.indexOf(overlay);
    if (index !== -1) stack.splice(index, 1);
  },
  isTop(overlay: object): boolean {
    return stack[stack.length - 1] === overlay;
  },
};

/**
 * Keeps `overlay` on the stack while `active()` is true. For popups that close
 * on a document-level Escape (menu, breadcrumb overflow, nav header): while
 * one is open it is the topmost layer, so an enclosing modal ignores the key.
 * Must be called in an injection context.
 *
 * @internal Not part of the public API.
 */
export function registerOverlayWhile(active: () => boolean, overlay: object): void {
  effect(() => {
    const on = active();
    untracked(() => (on ? overlayStack.push(overlay) : overlayStack.remove(overlay)));
  });
  inject(DestroyRef).onDestroy(() => overlayStack.remove(overlay));
}
