/**
 * Copies text to the clipboard: async Clipboard API first, hidden-textarea fallback
 * otherwise (same approach as the original docs site). Always resolves.
 */
export function copyToClipboard(doc: Document, text: string): Promise<void> {
  const clipboard = doc.defaultView?.navigator.clipboard;
  const write = clipboard?.writeText ? clipboard.writeText(text) : Promise.reject(new Error('Clipboard API unavailable'));
  return write.catch(() => {
    const area = doc.createElement('textarea');
    area.value = text;
    area.style.position = 'fixed';
    area.style.opacity = '0';
    doc.body.appendChild(area);
    area.select();
    try {
      doc.execCommand('copy');
    } catch {
      /* unsupported */
    }
    area.remove();
  });
}
