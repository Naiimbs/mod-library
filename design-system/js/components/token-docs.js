/* ============================================
   TOKEN DOCS MODULE
   DGA Design System — renders the "Classes" (utility classes) and
   "Styles" (CSS variables) documentation pages from the live theme.
   All values are read via getComputedStyle so the docs never drift
   from the loaded CSS (DGATheme.css + css/tokens.css).

   Layout: single scrollable page, sticky section nav with scroll-spy,
   click-to-copy on every token, and a global name filter.
   ============================================ */

const TD_ROOT = () => getComputedStyle(document.documentElement);
const tdResolve = (name) => TD_ROOT().getPropertyValue(name).trim();

const TD_COLOR_FAMILIES = [
    { key: 'sa',       label: 'Primary — Saudi Green', shades: [25, 50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] },
    { key: 'sad',      label: 'Saudi Green Dark',      shades: [100, 200, 300, 400, 500] },
    { key: 'gray',     label: 'Neutral',               shades: [25, 50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] },
    { key: 'gold',     label: 'Gold',                  shades: [25, 50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] },
    { key: 'lavender', label: 'Lavender',              shades: [25, 50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] },
    { key: 'success',  label: 'Success',               shades: [25, 50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] },
    { key: 'error',    label: 'Error',                 shades: [25, 50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] },
    { key: 'warning',  label: 'Warning',               shades: [25, 50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] },
    { key: 'info',     label: 'Info',                  shades: [25, 50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] },
];

const TD_GRADIENTS = [
    'gradient-sa600-sa500-90deg', 'gradient-sa700-sa600-45deg', 'gradient-sa950-sa600-45deg',
    'gradient-sa800-sa600-90deg', 'gradient-sa800-sa700-26deg', 'gradient-sa900-sa600-45deg',
];

const TD_RADII    = ['none', 'xs', 'sm', 'md', 'lg', 'xl', '2xl', 'full'];
const TD_SHADOWS  = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl'];
const TD_WIDTH_CLASSES = ['xxs', 'xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl', '6xl'];
const TD_TEXT_SIZES    = ['s', 'xs', 'sm', 'md', 'lg', 'xl', '2xl'];
const TD_DISPLAY_SIZES = ['xs', 'sm', 'md', 'lg', 'xl', '2xl'];
const TD_WEIGHTS       = ['regular', 'medium', 'semibold', 'bold'];
const TD_SPACINGS      = ['none', 'xxs', 'xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl', '6xl', '7xl', '8xl', '9xl', '10xl', '11xl'];

const tdEsc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');

/* Probe whether a utility class actually exists in the loaded CSS
   (e.g. DGATheme ships no *-sad-* utilities and skips border-color-gold-600). */
let tdProbeEl = null;
function tdClassApplies(cls, prop) {
    if (!tdProbeEl) {
        tdProbeEl = document.createElement('div');
        tdProbeEl.style.cssText = 'position:absolute;visibility:hidden;pointer-events:none;';
        document.body.appendChild(tdProbeEl);
    }
    tdProbeEl.className = '';
    const base = getComputedStyle(tdProbeEl)[prop];
    tdProbeEl.className = cls;
    const applied = getComputedStyle(tdProbeEl)[prop];
    tdProbeEl.className = '';
    return applied !== base;
}
function tdProbeCleanup() {
    tdProbeEl?.remove();
    tdProbeEl = null;
}

/* ---------- shared building blocks (all copy targets are <button>) ---------- */

/* One cell in a color scale row */
function tdScaleCell(copy, shade, value, previewHTML) {
    return `<button type="button" class="td-cell td-item" data-copy="${tdEsc(copy)}" data-name="${tdEsc(copy)}" title="${tdEsc(copy)}">
        ${previewHTML}
        <span class="td-cell__shade">${shade}</span>
        <span class="td-cell__value">${tdEsc(value)}</span>
    </button>`;
}

/* A full family scale row (Tailwind-style) */
function tdScaleRow(family, makeCell) {
    const cells = family.shades
        .map(sh => ({ sh, val: tdResolve(`--${family.key}-${sh}`) }))
        .filter(x => x.val)
        .map(x => makeCell(family.key, x.sh, x.val))
        .filter(Boolean);
    if (!cells.length) return '';
    return `<div class="td-family td-group">
        <div class="td-family__head">
            <span class="td-family__label">${family.label}</span>
            <span class="td-family__key">${family.key}</span>
        </div>
        <div class="td-scale">${cells.join('')}</div>
    </div>`;
}

/* Card entry (gradients, shadows, radius, special colors) */
function tdCard(copy, label, value, previewHTML) {
    return `<button type="button" class="td-card td-item" data-copy="${tdEsc(copy)}" data-name="${tdEsc(copy)}" title="${tdEsc(copy)}">
        ${previewHTML}
        <span class="td-card__name">${tdEsc(label)}</span>
        ${value ? `<span class="td-card__value">${tdEsc(value)}</span>` : ''}
    </button>`;
}

/* Table row: name | value | live demo (spacing, gap, width, height) */
function tdRow(copy, value, demoHTML) {
    return `<div class="td-row td-item" data-name="${tdEsc(copy)}">
        <button type="button" class="td-row__name" data-copy="${tdEsc(copy)}" title="Copy ${tdEsc(copy)}">${tdEsc(copy)}</button>
        <span class="td-row__value">${tdEsc(value)}</span>
        <div class="td-row__demo">${demoHTML}</div>
    </div>`;
}

const tdTable = (rows) => `<div class="td-table td-group">
    <div class="td-table__head"><span>Name</span><span>Value</span><span>Preview</span></div>
    ${rows.join('')}
</div>`;

/* Typography specimen row */
function tdTypeRow(copy, meta, sampleHTML) {
    return `<div class="td-type td-item" data-name="${tdEsc(copy)}">
        <div class="td-type__meta">
            <button type="button" class="td-type__name" data-copy="${tdEsc(copy)}" title="Copy ${tdEsc(copy)}">${tdEsc(copy)}</button>
            <span class="td-type__value">${tdEsc(meta)}</span>
        </div>
        <div class="td-type__sample">${sampleHTML}</div>
    </div>`;
}

const tdCardGrid = (cards, mod) => `<div class="td-cards${mod ? ' td-cards--' + mod : ''} td-group">${cards.join('')}</div>`;
const tdGroupTitle = (t) => `<h3 class="td-group-title">${t}</h3>`;

/* ============================================
   Page shell
   ============================================ */

class TokenDocsPage {
    constructor(rootId, config) {
        this.root = document.getElementById(rootId);
        if (!this.root) return;
        this.config = config;
        this.sections = config.sections().filter(s => s);
        this.render();
        tdProbeCleanup();
        this.bindCopy();
        this.bindNav();
        this.bindSearch();
        this.observeSections();
    }

    render() {
        const navItems = this.sections.map(s =>
            `<button type="button" class="td-nav__item" data-target="${s.id}">${s.title}</button>`).join('');
        const sectionsHTML = this.sections.map(s =>
            `<section class="td-section" id="td-${s.id}" data-section="${s.id}">
                <h2 class="td-section__title">${s.title}</h2>
                ${s.note ? `<p class="td-section__note">${s.note}</p>` : ''}
                ${s.render()}
            </section>`).join('');

        this.root.innerHTML = `
            <header class="td-header">
                <div class="td-header__text">
                    <h1 class="td-title">${this.config.title}</h1>
                    <p class="td-subtitle">${this.config.subtitle}</p>
                </div>
                <div class="td-search">
                    <span class="td-search__icon dga-icon-search-01" aria-hidden="true"></span>
                    <input type="search" class="td-search__input" placeholder="${this.config.searchPlaceholder}"
                           aria-label="${this.config.searchPlaceholder}" autocomplete="off" spellcheck="false">
                    <span class="td-search__count" aria-live="polite"></span>
                </div>
            </header>
            <div class="td-body">
                <nav class="td-nav" aria-label="${this.config.title} sections">${navItems}</nav>
                <main class="td-content">
                    ${sectionsHTML}
                    <div class="td-empty" hidden>
                        <span class="td-empty__icon dga-icon-search-01" aria-hidden="true"></span>
                        <p>No tokens match your search.</p>
                    </div>
                </main>
            </div>
            <div class="td-toast" role="status" aria-live="polite" hidden></div>`;

        this.nav = this.root.querySelector('.td-nav');
        this.content = this.root.querySelector('.td-content');
        this.toast = this.root.querySelector('.td-toast');
        this.searchInput = this.root.querySelector('.td-search__input');
        this.searchCount = this.root.querySelector('.td-search__count');
        this.emptyState = this.root.querySelector('.td-empty');
        this.totalItems = this.root.querySelectorAll('.td-item').length;
        this.nav.querySelector('.td-nav__item')?.classList.add('is-active');
    }

    /* -- copy to clipboard, with visual feedback + toast -- */
    bindCopy() {
        this.root.addEventListener('click', (e) => {
            const btn = e.target.closest('[data-copy]');
            if (!btn) return;
            const text = btn.dataset.copy;
            const write = navigator.clipboard
                ? navigator.clipboard.writeText(text)
                : Promise.reject();
            write.catch(() => {
                const ta = document.createElement('textarea');
                ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
                document.body.appendChild(ta); ta.select();
                try { document.execCommand('copy'); } catch (_) { /* unsupported */ }
                ta.remove();
            }).finally(() => this.flashCopied(btn, text));
        });
    }

    flashCopied(btn, text) {
        btn.classList.add('is-copied');
        clearTimeout(btn._tdTimer);
        btn._tdTimer = setTimeout(() => btn.classList.remove('is-copied'), 1200);
        this.toast.innerHTML = `<span class="dga-icon-checkmark-circle-02" aria-hidden="true"></span> Copied <code>${tdEsc(text)}</code>`;
        this.toast.hidden = false;
        this.toast.classList.add('is-visible');
        clearTimeout(this._toastTimer);
        this._toastTimer = setTimeout(() => {
            this.toast.classList.remove('is-visible');
            this._toastHide = setTimeout(() => { this.toast.hidden = true; }, 200);
        }, 1600);
    }

    /* -- section nav: smooth scroll (buttons, not #hash links: hash drives the router) -- */
    bindNav() {
        this.nav.addEventListener('click', (e) => {
            const item = e.target.closest('.td-nav__item');
            if (!item) return;
            const target = this.root.querySelector(`#td-${item.dataset.target}`);
            if (!target) return;
            this._navLock = Date.now();
            this.setActiveNav(item.dataset.target);
            const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
            const top = target.getBoundingClientRect().top + window.scrollY - 96;
            window.scrollTo({ top, behavior: reduced ? 'auto' : 'smooth' });
        });
    }

    setActiveNav(id) {
        this.nav.querySelectorAll('.td-nav__item').forEach(b =>
            b.classList.toggle('is-active', b.dataset.target === id));
    }

    observeSections() {
        const sections = [...this.root.querySelectorAll('.td-section')];
        if (!sections.length) return;
        let ticking = false;
        this._spy = () => {
            /* the router swaps pages; drop the listener once this instance is gone */
            if (!this.root.isConnected) {
                window.removeEventListener('scroll', this._spy);
                return;
            }
            if (ticking) return;
            ticking = true;
            requestAnimationFrame(() => {
                ticking = false;
                /* skip spy updates for a beat after a nav click */
                if (this._navLock && Date.now() - this._navLock < 700) return;
                const visible = sections.filter(s => !s.hidden);
                if (!visible.length) return;
                const atBottom = window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2;
                let current = visible[0];
                if (atBottom) {
                    current = visible[visible.length - 1];
                } else {
                    const line = 132; /* px below viewport top = "current section" line */
                    for (const s of visible) {
                        if (s.getBoundingClientRect().top <= line) current = s;
                    }
                }
                this.setActiveNav(current.dataset.section);
            });
        };
        window.addEventListener('scroll', this._spy, { passive: true });
    }

    /* -- filter every token on the page by name -- */
    bindSearch() {
        this.searchInput.addEventListener('input', () => this.applyFilter());
        document.addEventListener('keydown', this._slashKey = (e) => {
            /* the router swaps pages; drop the listener once this instance is gone */
            if (!this.root.isConnected) {
                document.removeEventListener('keydown', this._slashKey);
                return;
            }
            if (e.key === '/' && !/^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName)) {
                e.preventDefault();
                this.searchInput.focus();
            }
        });
    }

    applyFilter() {
        const q = this.searchInput.value.trim().toLowerCase();
        let shown = 0;
        this.root.querySelectorAll('.td-item').forEach(item => {
            const hit = !q || item.dataset.name.toLowerCase().includes(q);
            item.hidden = !hit;
            if (hit) shown++;
        });
        /* hide groups, then sections, that have no visible tokens */
        this.root.querySelectorAll('.td-group').forEach(g => {
            g.hidden = !g.querySelector('.td-item:not([hidden])');
        });
        this.root.querySelectorAll('.td-group-title').forEach(t => {
            let el = t.nextElementSibling;
            t.hidden = !(el && el.classList.contains('td-group') && !el.hidden);
        });
        this.root.querySelectorAll('.td-section').forEach(sec => {
            const any = sec.querySelector('.td-item:not([hidden])');
            sec.hidden = !any;
            this.nav.querySelector(`[data-target="${sec.dataset.section}"]`)?.classList.toggle('is-dimmed', !any);
        });
        this.emptyState.hidden = shown !== 0;
        this.searchCount.textContent = q ? `${shown} of ${this.totalItems}` : '';
    }
}

/* ============================================
   CLASSES page — utility classes applied live
   ============================================ */

function tdClassesSections() {
    return [
        {
            id: 'background', title: 'Background Color',
            note: 'Applied live from DGATheme.css. Click a swatch to copy its class.',
            render: () =>
                TD_COLOR_FAMILIES.map(f => tdScaleRow(f, (fam, sh, val) =>
                    tdClassApplies(`background-color-${fam}-${sh}`, 'backgroundColor')
                        ? tdScaleCell(`background-color-${fam}-${sh}`, sh, val,
                            `<span class="td-swatch background-color-${fam}-${sh}"></span>`)
                        : '')).join('') +
                tdGroupTitle('Gradients') +
                tdCardGrid(TD_GRADIENTS.map(g =>
                    tdCard(g, g, '', `<span class="td-card__preview ${g}"></span>`)), 'wide'),
        },
        {
            id: 'text-color', title: 'Text Color',
            render: () => TD_COLOR_FAMILIES.map(f => tdScaleRow(f, (fam, sh, val) =>
                tdClassApplies(`text-${fam}-${sh}`, 'color')
                    ? tdScaleCell(`text-${fam}-${sh}`, sh, val,
                        `<span class="td-swatch td-swatch--text"><b class="text-${fam}-${sh}">Aa</b></span>`)
                    : '')).join(''),
        },
        {
            id: 'border-color', title: 'Border Color',
            render: () => TD_COLOR_FAMILIES.map(f => tdScaleRow(f, (fam, sh, val) =>
                tdClassApplies(`border-color-${fam}-${sh}`, 'borderTopColor')
                    ? tdScaleCell(`border-color-${fam}-${sh}`, sh, val,
                        `<span class="td-swatch td-swatch--border border-color-${fam}-${sh}"></span>`)
                    : '')).join(''),
        },
        {
            id: 'radius', title: 'Border Radius',
            render: () => tdCardGrid(TD_RADII
                .filter(r => tdResolve(`--radius-${r}`))
                .map(r => tdCard(`border-radius-${r}`, `border-radius-${r}`, tdResolve(`--radius-${r}`),
                    `<span class="td-card__preview td-card__preview--radius border-radius-${r}"></span>`))),
        },
        {
            id: 'shadow', title: 'Shadow',
            render: () => `<div class="td-shadow-canvas td-group">${TD_SHADOWS.map(s =>
                tdCard(`shadow-${s}`, `shadow-${s}`, '',
                    `<span class="td-card__preview td-card__preview--shadow shadow-${s}"></span>`)).join('')}</div>`,
        },
        {
            id: 'gap', title: 'Gap',
            render: () => tdTable(TD_SPACINGS
                .filter(g => tdResolve(`--spacing-${g}`) !== '')
                .map(g => tdRow(`gap-${g}`, tdResolve(`--spacing-${g}`),
                    `<span class="td-gap-demo gap-${g}"><i></i><i></i><i></i></span>`))),
        },
        {
            id: 'width', title: 'Width',
            render: () => tdTable(TD_WIDTH_CLASSES
                .filter(w => tdResolve(`--width-${w}`))
                .map(w => tdRow(`width-${w}`, tdResolve(`--width-${w}`),
                    `<span class="td-bar-track"><i class="td-bar width-${w}"></i></span>`))),
        },
        {
            id: 'column', title: 'Column',
            note: 'Spans inside the 12-column grid.',
            render: () => tdTable([...Array(12)].map((_, i) =>
                tdRow(`col-${i + 1}`, `${i + 1} / 12`,
                    `<span class="td-col-demo"><i class="col-${i + 1}"></i></span>`))),
        },
        {
            id: 'typography', title: 'Typography',
            render: () =>
                tdGroupTitle('Text') +
                `<div class="td-group">${TD_TEXT_SIZES.flatMap(sz => TD_WEIGHTS.map(w =>
                    tdTypeRow(`text-${sz}-${w}`, tdResolve(`--text-${sz}`) || '',
                        `<span class="text-${sz}-${w}">The quick brown fox jumps over the lazy dog</span>`))).join('')}</div>` +
                tdGroupTitle('Display') +
                `<div class="td-group">${TD_DISPLAY_SIZES.flatMap(sz => TD_WEIGHTS.map(w =>
                    tdTypeRow(`display-${sz}-${w}`, tdResolve(`--display-${sz}`) || '',
                        `<span class="display-${sz}-${w}">Aa</span>`))).join('')}</div>`,
        },
    ];
}

/* ============================================
   STYLES page — CSS variables with live resolved values
   ============================================ */

function tdStylesSections() {
    const rowIf = (name, demo) => {
        const val = tdResolve(name);
        return val ? tdRow(name, val, demo(val)) : '';
    };
    return [
        {
            id: 'color', title: 'Color',
            note: 'Values resolve live from the loaded theme. Click a swatch to copy its variable.',
            render: () =>
                TD_COLOR_FAMILIES.map(f => tdScaleRow(f, (fam, sh, val) =>
                    tdScaleCell(`--${fam}-${sh}`, sh, val,
                        `<span class="td-swatch" style="background-color:${val};"></span>`))).join('') +
                tdGroupTitle('Special') +
                tdCardGrid(['--text-default', '--border-black', '--alpha-white', '--alpha-white-80', '--alpha-white-70', '--alpha-white-60', '--alpha-white-30']
                    .map(n => {
                        const v = tdResolve(n);
                        return v ? tdCard(n, n, v,
                            `<span class="td-card__preview td-card__preview--alpha"><i style="background-color:${v};"></i></span>`) : '';
                    }).filter(Boolean)),
        },
        {
            id: 'radius', title: 'Border Radius',
            render: () => tdCardGrid(TD_RADII
                .map(r => {
                    const v = tdResolve(`--radius-${r}`);
                    return v ? tdCard(`--radius-${r}`, `--radius-${r}`, v,
                        `<span class="td-card__preview td-card__preview--radius" style="border-radius:${v};"></span>`) : '';
                }).filter(Boolean)),
        },
        {
            id: 'spacing', title: 'Spacing',
            render: () => tdTable(TD_SPACINGS.map(s =>
                rowIf(`--spacing-${s}`, v =>
                    `<span class="td-bar-track"><i class="td-bar" style="width:${v === '0px' ? '2px' : v};"></i></span>`))
                .filter(Boolean)),
        },
        {
            id: 'text', title: 'Text',
            render: () => TD_TEXT_SIZES.map(s => {
                const v = tdResolve(`--text-${s}`);
                return v ? tdTypeRow(`--text-${s}`, v,
                    `<span style="font-size:${v};">The quick brown fox jumps over the lazy dog</span>`) : '';
            }).filter(Boolean).join(''),
        },
        {
            id: 'display', title: 'Display',
            render: () => TD_DISPLAY_SIZES.map(s => {
                const v = tdResolve(`--display-${s}`);
                return v ? tdTypeRow(`--display-${s}`, v,
                    `<span style="font-size:${v};font-weight: var(--font-weight-semibold);line-height:1.15;">Aa</span>`) : '';
            }).filter(Boolean).join(''),
        },
        {
            id: 'font-weight', title: 'Font Weight',
            render: () => ['light', 'regular', 'medium', 'semibold', 'bold'].map(w => {
                const v = tdResolve(`--font-weight-${w}`);
                return v ? tdTypeRow(`--font-weight-${w}`, v,
                    `<span style="font-size:22px;font-weight:${v};">The quick brown fox jumps over the lazy dog</span>`) : '';
            }).filter(Boolean).join(''),
        },
        {
            id: 'height', title: 'Height',
            render: () => tdTable(['s', 'm', 'l'].map(h =>
                rowIf(`--height-${h}`, v =>
                    `<span class="td-height-demo" style="height:${v};"></span>`))
                .filter(Boolean)),
        },
        {
            id: 'width', title: 'Width',
            render: () => tdTable(TD_WIDTH_CLASSES.map(w =>
                rowIf(`--width-${w}`, v =>
                    `<span class="td-bar-track"><i class="td-bar" style="width:min(${v},100%);"></i></span>`))
                .filter(Boolean)),
        },
    ];
}

class TokenClassesPage extends TokenDocsPage {
    constructor() {
        super('classes-page', {
            title: 'Classes',
            subtitle: 'Utility classes from the DGA base theme, rendered live. Click any swatch or name to copy the class.',
            searchPlaceholder: 'Filter classes…',
            sections: tdClassesSections,
        });
    }
}

class TokenStylesPage extends TokenDocsPage {
    constructor() {
        super('styles-page', {
            title: 'Styles',
            subtitle: 'Design token CSS variables with their live resolved values. Click any swatch or name to copy the variable.',
            searchPlaceholder: 'Filter variables…',
            sections: tdStylesSections,
        });
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { TokenClassesPage, TokenStylesPage };
}
