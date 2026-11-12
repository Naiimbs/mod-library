interface LockState {
  count: number;
  previous: string;
}

const states = new WeakMap<Document, LockState>();

/**
 * Locks page scrolling (`body { overflow: hidden }`) and returns the function
 * that releases this lock. Locks are counted per document, so overlays can
 * open and close in any order: the original `overflow` value is restored only
 * when the last lock is released.
 *
 * @internal Not part of the public API.
 */
export function lockBodyScroll(doc: Document): () => void {
  let state = states.get(doc);
  if (!state) {
    state = { count: 0, previous: '' };
    states.set(doc, state);
  }
  const current = state;
  if (current.count === 0) {
    current.previous = doc.body.style.overflow;
    doc.body.style.overflow = 'hidden';
  }
  current.count++;

  let released = false;
  return () => {
    if (released) return;
    released = true;
    current.count--;
    if (current.count === 0) doc.body.style.overflow = current.previous;
  };
}
