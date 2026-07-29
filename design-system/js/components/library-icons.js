/* ============================================
   LIBRARY ICONS MODULE (v2)
   DGA Design System - full @platformscode/icons set.
   Second tab on the Icons page: pack-category sidebar (same
   categories as the icon font, derived from DGA_ICON_REGISTRY),
   nine styles (SVG stroke/solid + the seven icon-font styles),
   search, chunked grid with lazy inline currentColor SVGs, and
   a detail modal with variant previews, code tabs (component /
   font / svg), copy and SVG download.
   The DGA Font Icons tab is untouched.
   ============================================ */

const LIBICONS_CHUNK_SIZE = 240;

/* SVG variants come from assets/library-icons/{name}-{variant}.svg;
   font variants render through the icon font classes for the same name. */
const LIBICONS_VARIANTS = [
    { id: 'svg-stroke', label: 'SVG Stroke', kind: 'svg', variant: 'stroke' },
    { id: 'svg-solid', label: 'SVG Solid', kind: 'svg', variant: 'solid' },
    { id: 'font-stroke-rounded', label: 'Stroke Rounded', kind: 'font', classes: '' },
    { id: 'font-twotone-rounded', label: 'Twotone Rounded', kind: 'font', classes: 'twotone rounded' },
    { id: 'font-duotone-rounded', label: 'Duotone Rounded', kind: 'font', classes: 'duotone rounded' },
    { id: 'font-solid-rounded', label: 'Solid Rounded', kind: 'font', classes: 'solid rounded' },
    { id: 'font-bulk-rounded', label: 'Bulk Rounded', kind: 'font', classes: 'bulk rounded' },
    { id: 'font-stroke-sharp', label: 'Stroke Sharp', kind: 'font', classes: 'stroke sharp' },
    { id: 'font-solid-sharp', label: 'Solid Sharp', kind: 'font', classes: 'solid sharp' }
];

class LibraryIconsShowcase {
    constructor() {
        this.names = window.DGA_LIBRARY_ICONS || [];
        this.strokeOnly = new Set(window.DGA_LIBRARY_ICONS_STROKE_ONLY || []);
        this.solidOnly = new Set(window.DGA_LIBRARY_ICONS_SOLID_ONLY || []);
        this.variantIndex = 0;
        this.search = '';
        this.currentPack = 'all';
        this.filtered = this.names;
        this.renderedCount = 0;
        this.svgCache = new Map();          // "name-variant" -> svg markup
        this.debounceTimer = null;
        this.toastTimer = null;

        // Modal state
        this.modalName = null;
        this.modalVariantIndex = 0;
        this.modalTab = 'component';

        if (!document.getElementById('icons-view-library')) return;
        this.buildPacks();
        this.init();
    }

    /* Categories: same packs as the icon font. Font classes are
       "dga-icon-{name}" and SVG files are "{name}-{variant}.svg",
       so pack membership maps 1:1 by name. Anything the font does
       not carry lands in "Other". */
    buildPacks() {
        const svgSet = new Set(this.names);
        const assigned = new Set();
        this.fontNames = new Set();
        this.packs = [];
        this.nameToPackLabel = {};

        (window.DGA_ICON_REGISTRY || []).forEach(cat => {
            const members = [];
            cat.icons.forEach(cls => {
                const name = cls.replace(/^dga-icon-/, '');
                this.fontNames.add(name);
                if (svgSet.has(name) && !assigned.has(name)) {
                    assigned.add(name);
                    members.push(name);
                    this.nameToPackLabel[name] = cat.label;
                }
            });
            if (members.length) this.packs.push({ id: cat.id, label: cat.label, icons: members });
        });

        const leftover = this.names.filter(n => !assigned.has(n));
        if (leftover.length) {
            this.packs.push({ id: 'other', label: 'Other', icons: leftover });
            leftover.forEach(n => { this.nameToPackLabel[n] = 'Other'; });
        }
    }

    init() {
        this.bindTabs();
        this.renderPacksSidebar();
        this.renderVariantFilters();
        this.bindSearch();
        this.bindGridClicks();
        this.bindModal();
        this.setupObservers();
        this.applyFilter();
    }

    variant() { return LIBICONS_VARIANTS[this.variantIndex]; }

    /* ------------------------------------------
       COLLECTION TABS
       ------------------------------------------ */
    bindTabs() {
        const fontTab = document.getElementById('icons-tab-font');
        const libTab = document.getElementById('icons-tab-library');
        const fontView = document.getElementById('icons-view-font');
        const libView = document.getElementById('icons-view-library');
        if (!fontTab || !libTab || !fontView || !libView) return;

        const select = (lib) => {
            fontView.classList.toggle('icons-view-hidden', lib);
            libView.classList.toggle('icons-view-hidden', !lib);
            fontTab.classList.toggle('active', !lib);
            libTab.classList.toggle('active', lib);
            fontTab.setAttribute('aria-selected', String(!lib));
            libTab.setAttribute('aria-selected', String(lib));
        };
        fontTab.addEventListener('click', () => select(false));
        libTab.addEventListener('click', () => select(true));
    }

    /* ------------------------------------------
       PACKS SIDEBAR (mirrors the font tab)
       ------------------------------------------ */
    renderPacksSidebar() {
        const container = document.getElementById('libicons-packs-list');
        if (!container) return;
        container.innerHTML = '';
        const frag = document.createDocumentFragment();

        frag.appendChild(this.createPackItem('all', 'All Icons', this.names.length, null));
        this.packs.forEach(p => frag.appendChild(this.createPackItem(p.id, p.label, p.icons.length, p.icons[0])));
        container.appendChild(frag);
        this.highlightActivePack();

        container.addEventListener('click', (e) => {
            const btn = e.target.closest('.icons-pack-item');
            if (!btn || btn.dataset.pack === this.currentPack) return;
            this.currentPack = btn.dataset.pack;
            this.highlightActivePack();
            this.applyFilter();
        });
    }

    createPackItem(id, label, count, previewName) {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'icons-pack-item';
        btn.dataset.pack = id;

        const iconWrap = document.createElement('span');
        iconWrap.className = 'icons-pack-icon';
        if (previewName && this.fontNames.has(previewName)) {
            const el = document.createElement('span');
            el.className = 'icon dga-icon-' + previewName;
            iconWrap.appendChild(el);
        }
        btn.appendChild(iconWrap);

        const nameEl = document.createElement('span');
        nameEl.className = 'icons-pack-name';
        nameEl.textContent = label;
        btn.appendChild(nameEl);

        const countEl = document.createElement('span');
        countEl.className = 'icons-pack-count';
        countEl.textContent = count;
        btn.appendChild(countEl);
        return btn;
    }

    highlightActivePack() {
        document.querySelectorAll('#libicons-packs-list .icons-pack-item').forEach(b =>
            b.classList.toggle('icons-pack-item--active', b.dataset.pack === this.currentPack));
    }

    /* ------------------------------------------
       STYLE (VARIANT) FILTERS
       ------------------------------------------ */
    renderVariantFilters() {
        const list = document.getElementById('libicons-variant-list');
        if (!list) return;
        list.innerHTML = '';
        LIBICONS_VARIANTS.forEach((v, i) => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'libicons-variant-btn' + (i === this.variantIndex ? ' active' : '');
            btn.dataset.index = i;
            btn.textContent = v.label;
            list.appendChild(btn);
        });
        list.addEventListener('click', (e) => {
            const btn = e.target.closest('.libicons-variant-btn');
            if (!btn) return;
            const idx = parseInt(btn.dataset.index, 10);
            if (idx === this.variantIndex) return;
            this.variantIndex = idx;
            list.querySelectorAll('.libicons-variant-btn').forEach(b =>
                b.classList.toggle('active', b === btn));
            this.applyFilter();
        });
    }

    /* ------------------------------------------
       SEARCH + FILTER PIPELINE
       ------------------------------------------ */
    bindSearch() {
        const input = document.getElementById('libicons-search');
        const clear = document.getElementById('libicons-search-clear');
        if (!input) return;
        input.addEventListener('input', () => {
            if (clear) clear.style.display = input.value ? '' : 'none';
            clearTimeout(this.debounceTimer);
            this.debounceTimer = setTimeout(() => {
                this.search = input.value.trim().toLowerCase();
                this.applyFilter();
            }, 150);
        });
        if (clear) clear.addEventListener('click', () => {
            input.value = '';
            clear.style.display = 'none';
            this.search = '';
            this.applyFilter();
            input.focus();
        });
    }

    applyFilter() {
        let base = this.currentPack === 'all'
            ? this.names
            : (this.packs.find(p => p.id === this.currentPack) || { icons: [] }).icons;

        // font styles can only render icons the font actually has
        if (this.variant().kind === 'font') base = base.filter(n => this.fontNames.has(n));

        const words = this.search.split(/\s+/).filter(Boolean);
        this.filtered = words.length ? base.filter(n => words.every(w => n.includes(w))) : base;

        this.renderedCount = 0;
        const grid = document.getElementById('libicons-grid');
        if (grid) grid.innerHTML = '';
        this.renderChunk();
        this.updateResultsBar(base.length);
    }

    updateResultsBar(baseLen) {
        const bar = document.getElementById('libicons-results-bar');
        if (!bar) return;
        const packLabel = this.currentPack === 'all'
            ? 'All Icons'
            : (this.packs.find(p => p.id === this.currentPack) || {}).label || '';
        let text = (this.search ? this.filtered.length + ' of ' + baseLen : String(this.filtered.length))
            + ' icons · ' + packLabel + ' · ' + this.variant().label;
        if (this.variant().kind === 'font') text += ' (icon font)';
        bar.textContent = text;
    }

    /* ------------------------------------------
       CHUNKED GRID + LAZY INLINE SVG
       ------------------------------------------ */
    setupObservers() {
        const sentinel = document.getElementById('libicons-sentinel');
        if (sentinel && 'IntersectionObserver' in window) {
            this.chunkObserver = new IntersectionObserver((entries) => {
                if (entries.some(e => e.isIntersecting)) this.renderChunk();
            }, { rootMargin: '600px' });
            this.chunkObserver.observe(sentinel);
        }
        this.tileObserver = ('IntersectionObserver' in window)
            ? new IntersectionObserver((entries) => {
                for (const e of entries) {
                    if (!e.isIntersecting) continue;
                    this.tileObserver.unobserve(e.target);
                    this.loadTileSvg(e.target);
                }
            }, { rootMargin: '300px' })
            : null;
    }

    renderChunk() {
        const grid = document.getElementById('libicons-grid');
        if (!grid || this.renderedCount >= this.filtered.length) return;
        const frag = document.createDocumentFragment();
        const end = Math.min(this.renderedCount + LIBICONS_CHUNK_SIZE, this.filtered.length);
        for (let i = this.renderedCount; i < end; i++) {
            frag.appendChild(this.createTile(this.filtered[i]));
        }
        this.renderedCount = end;
        grid.appendChild(frag);
    }

    svgFileFor(name, svgVariant) {
        let v = svgVariant;
        if (v === 'solid' && this.strokeOnly.has(name)) v = 'stroke';
        if (v === 'stroke' && this.solidOnly.has(name)) v = 'solid';
        return name + '-' + v + '.svg';
    }

    createTile(name) {
        const v = this.variant();
        const item = document.createElement('button');
        item.type = 'button';
        item.className = 'icons-grid-item';
        item.dataset.iconName = name;
        item.title = name;

        if (v.kind === 'font') {
            const el = document.createElement('span');
            el.className = 'icon dga-icon-' + name + (v.classes ? ' ' + v.classes : '');
            item.appendChild(el);
        } else {
            const holder = document.createElement('span');
            holder.className = 'libicons-svg';
            item.appendChild(holder);
            if (this.tileObserver) this.tileObserver.observe(item);
            else this.loadTileSvg(item);
        }

        const nameEl = document.createElement('span');
        nameEl.className = 'icons-grid-item-name';
        nameEl.textContent = name.replace(/-/g, ' ');
        item.appendChild(nameEl);

        const copyBtn = document.createElement('span');
        copyBtn.className = 'icons-grid-item-copy';
        copyBtn.setAttribute('role', 'button');
        copyBtn.setAttribute('aria-label', 'Copy icon name');
        copyBtn.title = 'Copy icon name';
        copyBtn.innerHTML = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
            'stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
            '<rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>' +
            '<path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>';
        item.appendChild(copyBtn);

        return item;
    }

    fetchSvg(name, svgVariant) {
        const file = this.svgFileFor(name, svgVariant);
        if (this.svgCache.has(file)) return Promise.resolve(this.svgCache.get(file));
        return fetch('assets/library-icons/' + file)
            .then(r => r.ok ? r.text() : Promise.reject(new Error(r.status)))
            .then(svg => { this.svgCache.set(file, svg); return svg; });
    }

    loadTileSvg(item) {
        const name = item.dataset.iconName;
        const v = this.variant();
        if (v.kind !== 'svg') return;
        const indexAtLoad = this.variantIndex;
        this.fetchSvg(name, v.variant).then(svg => {
            if (!item.isConnected || this.variantIndex !== indexAtLoad) return;
            const holder = item.querySelector('.libicons-svg');
            if (holder) holder.innerHTML = svg;
        }).catch(() => { /* tile keeps its skeleton */ });
    }

    /* ------------------------------------------
       GRID CLICKS: quick copy or open modal
       ------------------------------------------ */
    bindGridClicks() {
        const grid = document.getElementById('libicons-grid');
        if (!grid) return;
        grid.addEventListener('click', (e) => {
            const item = e.target.closest('.icons-grid-item');
            if (!item) return;
            const name = item.dataset.iconName;
            if (e.target.closest('.icons-grid-item-copy')) {
                this.copyText(name, 'Copied "' + name + '"');
            } else {
                this.openModal(name);
            }
        });
    }

    /* ------------------------------------------
       DETAIL MODAL
       ------------------------------------------ */
    bindModal() {
        const overlay = document.getElementById('libicons-modal-overlay');
        if (!overlay) return;

        const closeBtn = document.getElementById('libicons-modal-close');
        if (closeBtn) closeBtn.addEventListener('click', () => this.closeModal());
        overlay.addEventListener('click', (e) => { if (e.target === overlay) this.closeModal(); });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && overlay.style.display !== 'none') this.closeModal();
        });

        const variants = document.getElementById('libicons-modal-variants');
        if (variants) variants.addEventListener('click', (e) => {
            const btn = e.target.closest('.icons-modal-variant-btn');
            if (!btn || btn.disabled) return;
            this.modalVariantIndex = parseInt(btn.dataset.variantIndex, 10);
            variants.querySelectorAll('.icons-modal-variant-btn').forEach(b =>
                b.classList.toggle('icons-modal-variant-btn--active',
                    parseInt(b.dataset.variantIndex, 10) === this.modalVariantIndex));
            this.updateModalPreview();
            this.updateModalCode();
        });

        const tabs = document.getElementById('libicons-modal-tabs');
        if (tabs) tabs.addEventListener('click', (e) => {
            const tab = e.target.closest('.icons-modal-tab');
            if (!tab) return;
            this.modalTab = tab.dataset.tab;
            tabs.querySelectorAll('.icons-modal-tab').forEach(t =>
                t.classList.toggle('icons-modal-tab--active', t === tab));
            this.updateModalCode();
        });

        const copyBtn = document.getElementById('libicons-modal-copy');
        if (copyBtn) copyBtn.addEventListener('click', () => {
            const code = document.getElementById('libicons-modal-code-content');
            if (code) this.copyText(code.textContent, 'Code copied');
        });

        const copyName = document.getElementById('libicons-modal-copy-name');
        if (copyName) copyName.addEventListener('click', () => {
            if (this.modalName) this.copyText(this.modalName, 'Copied "' + this.modalName + '"');
        });

        const dl = document.getElementById('libicons-modal-download');
        if (dl) dl.addEventListener('click', () => this.downloadSvg());
    }

    openModal(name) {
        const overlay = document.getElementById('libicons-modal-overlay');
        if (!overlay) return;
        this.modalName = name;
        // start the modal on the grid's current style when possible
        this.modalVariantIndex = (this.variant().kind === 'font' && !this.fontNames.has(name))
            ? 0 : this.variantIndex;
        this.modalTab = 'component';

        const title = document.getElementById('libicons-modal-title');
        if (title) title.textContent = name.replace(/-/g, ' ');
        const subtitle = document.getElementById('libicons-modal-subtitle');
        if (subtitle) {
            const pack = this.nameToPackLabel[name] || 'Other';
            const availability = this.fontNames.has(name)
                ? 'SVG + icon font' : 'SVG only';
            subtitle.textContent = 'Icon Pack: ' + pack + ' · ' + availability;
        }
        const nameCode = document.getElementById('libicons-modal-name');
        if (nameCode) nameCode.textContent = name;

        this.renderModalVariants();
        this.updateModalPreview();

        const tabs = document.querySelectorAll('#libicons-modal-tabs .icons-modal-tab');
        tabs.forEach((t, i) => t.classList.toggle('icons-modal-tab--active', i === 0));
        this.updateModalCode();

        overlay.style.display = '';
        document.body.style.overflow = 'hidden';
    }

    closeModal() {
        const overlay = document.getElementById('libicons-modal-overlay');
        if (!overlay) return;
        overlay.style.display = 'none';
        document.body.style.overflow = '';
    }

    renderModalVariants() {
        const container = document.getElementById('libicons-modal-variants');
        if (!container) return;
        container.innerHTML = '';
        const name = this.modalName;
        LIBICONS_VARIANTS.forEach((v, i) => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'icons-modal-variant-btn' +
                (i === this.modalVariantIndex ? ' icons-modal-variant-btn--active' : '');
            btn.dataset.variantIndex = i;
            btn.title = v.label;

            const preview = document.createElement('span');
            preview.className = 'libicons-modal-variant-icon';
            if (v.kind === 'font') {
                if (this.fontNames.has(name)) {
                    const el = document.createElement('span');
                    el.className = 'icon dga-icon-' + name + (v.classes ? ' ' + v.classes : '');
                    preview.appendChild(el);
                } else {
                    btn.disabled = true;
                    btn.title = v.label + ' — not available in the icon font';
                }
            } else {
                this.fetchSvg(name, v.variant).then(svg => {
                    if (this.modalName === name) preview.innerHTML = svg;
                }).catch(() => {});
            }
            btn.appendChild(preview);
            container.appendChild(btn);
        });
    }

    updateModalPreview() {
        const holder = document.getElementById('libicons-modal-icon');
        const label = document.getElementById('libicons-modal-preview-label');
        if (!holder) return;
        const v = LIBICONS_VARIANTS[this.modalVariantIndex];
        const name = this.modalName;
        if (label) label.textContent = v.label;
        holder.innerHTML = '';
        if (v.kind === 'font') {
            const el = document.createElement('span');
            el.className = 'icon dga-icon-' + name + (v.classes ? ' ' + v.classes : '');
            holder.appendChild(el);
        } else {
            this.fetchSvg(name, v.variant).then(svg => {
                if (this.modalName === name && LIBICONS_VARIANTS[this.modalVariantIndex] === v) {
                    holder.innerHTML = svg;
                }
            }).catch(() => {});
        }
    }

    updateModalCode() {
        const code = document.getElementById('libicons-modal-code-content');
        if (!code) return;
        const v = LIBICONS_VARIANTS[this.modalVariantIndex];
        const name = this.modalName;

        if (this.modalTab === 'component') {
            const variantAttr = v.kind === 'svg'
                ? v.variant
                : (v.classes.indexOf('solid') !== -1 ? 'solid' : 'stroke');
            code.textContent = '<dga-icon name="' + name + '" variant="' + variantAttr + '" size="24"></dga-icon>';
        } else if (this.modalTab === 'font') {
            code.textContent = this.fontNames.has(name)
                ? '<span class="icon dga-icon-' + name + (v.kind === 'font' && v.classes ? ' ' + v.classes : '') + '"></span>'
                : '/* This icon is not part of the icon font — use the SVG or the component. */';
        } else {
            const file = this.svgFileFor(name, v.kind === 'svg' ? v.variant : 'stroke');
            const cached = this.svgCache.get(file);
            if (cached) {
                code.textContent = cached;
            } else {
                code.textContent = 'Loading SVG…';
                this.fetchSvg(name, v.kind === 'svg' ? v.variant : 'stroke').then(svg => {
                    if (this.modalName === name && this.modalTab === 'svg') code.textContent = svg;
                }).catch(() => { code.textContent = 'Could not load the SVG.'; });
            }
        }
    }

    downloadSvg() {
        const name = this.modalName;
        const v = LIBICONS_VARIANTS[this.modalVariantIndex];
        const svgVariant = v.kind === 'svg' ? v.variant : 'stroke';
        this.fetchSvg(name, svgVariant).then(svg => {
            const blob = new Blob([svg], { type: 'image/svg+xml' });
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = this.svgFileFor(name, svgVariant);
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(a.href);
            this.showToast('Downloaded ' + a.download);
        }).catch(() => this.showToast('Could not download the SVG.'));
    }

    /* ------------------------------------------
       UTILITIES
       ------------------------------------------ */
    copyText(text, message) {
        const done = () => this.showToast(message || 'Copied');
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(done).catch(() => this.fallbackCopy(text, done));
        } else {
            this.fallbackCopy(text, done);
        }
    }

    fallbackCopy(text, done) {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand('copy'); } catch (e) { /* no-op */ }
        document.body.removeChild(ta);
        done();
    }

    showToast(message) {
        const toast = document.getElementById('icons-copy-toast');
        if (!toast) return;
        toast.textContent = message;
        toast.classList.add('is-visible');
        clearTimeout(this.toastTimer);
        this.toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 2000);
    }
}
