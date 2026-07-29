/* ============================================
   CODE VIEW MODULE
   DGA Design System — attaches a "Code" toggle to every showcase
   preview and live-demo canvas on component pages. The HTML snippet
   is serialized from the live preview DOM on each open, so it always
   matches exactly what is rendered (including live-demo state).
   ============================================ */

(function () {
    'use strict';

    const CV_SKIP_PAGES = new Set(['icons', 'classes', 'styles', 'components-overview', 'screens']);
    const CV_VOID = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'source', 'track', 'wbr']);
    const CV_SVG_SELFCLOSE = new Set(['path', 'circle', 'line', 'rect', 'polyline', 'polygon', 'ellipse', 'use', 'stop']);
    const CV_IGNORE = (el) =>
        el.classList?.contains('showcase-label') ||
        el.classList?.contains('cv') ||
        el.hasAttribute?.('data-code-ignore');

    /* ---------- serialize a preview subtree to formatted HTML ---------- */

    function cvAttrs(el) {
        return [...el.attributes]
            .filter(a => !a.name.startsWith('data-cv'))
            .map(a => a.value === '' ? a.name : `${a.name}="${a.value}"`)
            .join(' ');
    }

    function cvText(node, depth) {
        const t = node.textContent.replace(/\s+/g, ' ').trim();
        return t ? '    '.repeat(depth) + t : '';
    }

    function cvNode(el, depth) {
        if (el.nodeType === Node.TEXT_NODE) return cvText(el, depth);
        if (el.nodeType !== Node.ELEMENT_NODE) return '';
        const tag = el.tagName.toLowerCase();
        if (tag === 'script' || tag === 'style' || CV_IGNORE(el)) return '';

        const pad = '    '.repeat(depth);
        const attrs = cvAttrs(el);
        const openInner = `${tag}${attrs ? ' ' + attrs : ''}`;

        if (CV_VOID.has(tag)) return `${pad}<${openInner}>`;
        if (CV_SVG_SELFCLOSE.has(tag) && !el.childNodes.length) return `${pad}<${openInner} />`;

        const open = `<${openInner}>`;
        const kids = [...el.childNodes].map(n => cvNode(n, depth + 1)).filter(Boolean);

        if (!kids.length) return `${pad}${open}</${tag}>`;
        /* inline a single short text child */
        if (el.children.length === 0 && kids.length === 1 &&
            open.length + kids[0].trim().length < 88) {
            return `${pad}${open}${kids[0].trim()}</${tag}>`;
        }
        return [pad + open, ...kids, `${pad}</${tag}>`].join('\n');
    }

    function cvSerialize(container) {
        /* showcase-row is docs scaffolding — emit its children as the snippet */
        const nodes = [...container.childNodes].flatMap(n =>
            n.classList?.contains('showcase-row') ? [...n.childNodes] : [n]);
        return nodes.map(n => cvNode(n, 0)).filter(Boolean).join('\n');
    }

    /* ---------- lightweight HTML syntax highlighting ---------- */

    const cvEsc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

    function cvHighlight(code) {
        return cvEsc(code)
            .replace(/(&lt;\/?)([a-zA-Z][\w-]*)/g, '$1<span class="cv-tag">$2</span>')
            .replace(/([\w-]+)=(&quot;[^&]*?&quot;)/g, '<span class="cv-attr">$1</span>=<span class="cv-str">$2</span>');
    }

    /* ---------- widget ---------- */

    function cvBuild(sourceEl, insertAfterEl) {
        const wrap = document.createElement('div');
        wrap.className = 'cv';
        wrap.innerHTML = `
            <div class="cv-bar">
                <span class="cv-lines" hidden></span>
                <button type="button" class="cv-btn cv-btn--toggle" aria-expanded="false">
                    <span class="cv-glyph" aria-hidden="true">&lt;/&gt;</span> Code
                </button>
                <button type="button" class="cv-btn cv-btn--copy" hidden>Copy</button>
            </div>
            <div class="cv-panel" hidden><pre class="cv-pre" dir="ltr"><code></code></pre></div>`;

        const toggle = wrap.querySelector('.cv-btn--toggle');
        const copyBtn = wrap.querySelector('.cv-btn--copy');
        const linesEl = wrap.querySelector('.cv-lines');
        const panel = wrap.querySelector('.cv-panel');
        const codeEl = wrap.querySelector('code');
        let raw = '';
        let observer = null;
        let refreshTimer = null;

        const render = () => {
            raw = cvSerialize(sourceEl);
            codeEl.innerHTML = cvHighlight(raw);
            const n = raw ? raw.split('\n').length : 0;
            linesEl.textContent = `${n} line${n === 1 ? '' : 's'}`;
        };

        toggle.addEventListener('click', () => {
            const open = panel.hidden;
            if (open) {
                render();
                /* live-update the snippet while open (e.g. toggling live-demo
                   properties re-renders the canvas — the code follows along) */
                observer = new MutationObserver(() => {
                    clearTimeout(refreshTimer);
                    refreshTimer = setTimeout(render, 120);
                });
                observer.observe(sourceEl, { childList: true, subtree: true, attributes: true, characterData: true });
            } else {
                observer?.disconnect();
                observer = null;
                clearTimeout(refreshTimer);
            }
            panel.hidden = !open;
            copyBtn.hidden = !open;
            linesEl.hidden = !open;
            toggle.setAttribute('aria-expanded', String(open));
            toggle.classList.toggle('is-open', open);
        });

        copyBtn.addEventListener('click', () => {
            const done = () => {
                copyBtn.textContent = 'Copied ✓';
                copyBtn.classList.add('is-done');
                clearTimeout(copyBtn._t);
                copyBtn._t = setTimeout(() => {
                    copyBtn.textContent = 'Copy';
                    copyBtn.classList.remove('is-done');
                }, 1400);
            };
            if (navigator.clipboard) {
                navigator.clipboard.writeText(raw).then(done).catch(done);
            } else {
                const ta = document.createElement('textarea');
                ta.value = raw; ta.style.cssText = 'position:fixed;opacity:0;';
                document.body.appendChild(ta); ta.select();
                try { document.execCommand('copy'); } catch (_) { /* unsupported */ }
                ta.remove(); done();
            }
        });

        insertAfterEl.insertAdjacentElement('afterend', wrap);
    }

    function cvEnhance(componentId) {
        if (CV_SKIP_PAGES.has(componentId)) return;
        const content = document.getElementById('component-content');
        if (!content) return;

        /* showcase previews: the code panel slots directly under each preview */
        content.querySelectorAll('.showcase-preview, .component-preview').forEach(preview => {
            if (preview.nextElementSibling?.classList?.contains('cv')) return;
            if (!preview.children.length) return;
            cvBuild(preview, preview);
        });

        /* live demos: one panel for the canvas, placed after the demo body */
        content.querySelectorAll('.live-demo').forEach(demo => {
            const canvas = demo.querySelector('.live-demo__canvas');
            const body = demo.querySelector('.live-demo__body');
            if (!canvas || !body) return;
            if (body.nextElementSibling?.classList?.contains('cv')) return;
            cvBuild(canvas, body);
        });
    }

    document.addEventListener('component:loaded', (e) => {
        cvEnhance(e.detail?.componentId || '');
    });
})();
