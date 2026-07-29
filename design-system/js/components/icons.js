/* ============================================
   ICONS SHOWCASE MODULE (v4)
   DGA Design System - Icon Browser
   Pack sidebar, smart multi-word search, chunked grid rendering
   (infinite scroll), per-tile quick copy, detail modal with
   style variants.
   ============================================ */

const ICON_VARIANTS = [
    { label: 'Stroke Rounded', classes: '' },
    { label: 'Twotone Rounded', classes: 'twotone rounded' },
    { label: 'Duotone Rounded', classes: 'duotone rounded' },
    { label: 'Solid Rounded', classes: 'solid rounded' },
    { label: 'Bulk Rounded', classes: 'bulk rounded' },
    { label: 'Stroke Sharp', classes: 'stroke sharp' },
    { label: 'Solid Sharp', classes: 'solid sharp' }
];

const ICONS_CHUNK_SIZE = 240;

class IconsShowcase {
    constructor(config = {}) {
        this.registry = window.DGA_ICON_REGISTRY || [];
        this.gridContainerId = config.gridContainerId || 'icons-grid-container';
        this.packsListId = config.packsListId || 'icons-packs-list';
        this.searchInputId = config.searchInputId || 'icons-search';
        this.searchClearId = config.searchClearId || 'icons-search-clear';
        this.toastId = config.toastId || 'icons-copy-toast';

        this.currentPack = 'all';
        this.currentSearch = '';
        this.currentVariantIndex = 0;
        this.debounceTimer = null;
        this.toastTimer = null;
        this.activeTab = 'html';
        this.activeIconClass = '';
        this.activeIconPack = '';
        this.activeVariantIndex = 0;

        /* chunked rendering state */
        this._pending = [];
        this._rendered = 0;
        this._sentinelObserver = null;

        // Build reverse lookup: iconClass -> category, plus a searchable
        // name per icon ("dga-icon-arrow-left-01" -> "arrow left 01")
        this.iconToCategory = {};
        this.searchName = {};
        this.registry.forEach(cat => {
            cat.icons.forEach(ic => {
                this.iconToCategory[ic] = cat;
                this.searchName[ic] = ic.replace('dga-icon-', '').replace(/[-_]+/g, ' ').toLowerCase();
            });
        });

        this.init();
    }

    init() {
        this.renderPacksSidebar();
        this.renderTypeFilters();
        this.renderIcons();
        this.bindEvents();
    }

    /* ------------------------------------------
       ICON PACKS SIDEBAR
       ------------------------------------------ */
    renderPacksSidebar() {
        const container = document.getElementById(this.packsListId);
        if (!container) return;
        container.innerHTML = '';

        const fragment = document.createDocumentFragment();

        // "All" item
        const allBtn = this.createPackItem('all', 'All Icons', this.getTotalCount(), null);
        if (this.currentPack === 'all') allBtn.classList.add('icons-pack-item--active');
        fragment.appendChild(allBtn);

        this.registry.forEach(cat => {
            const previewIcon = cat.icons[0] || null;
            const label = this.formatPackLabel(cat.label);
            const btn = this.createPackItem(cat.id, label, cat.icons.length, previewIcon);
            if (this.currentPack === cat.id) btn.classList.add('icons-pack-item--active');
            fragment.appendChild(btn);
        });

        container.appendChild(fragment);
    }

    createPackItem(id, label, count, previewIconClass) {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'icons-pack-item';
        btn.dataset.pack = id;

        // Icon preview
        const iconWrap = document.createElement('span');
        iconWrap.className = 'icons-pack-icon';
        if (previewIconClass) {
            const iconEl = document.createElement('span');
            iconEl.className = 'icon ' + previewIconClass;
            iconWrap.appendChild(iconEl);
        }
        btn.appendChild(iconWrap);

        // Name
        const nameEl = document.createElement('span');
        nameEl.className = 'icons-pack-name';
        nameEl.textContent = label;
        btn.appendChild(nameEl);

        // Count
        const countEl = document.createElement('span');
        countEl.className = 'icons-pack-count';
        countEl.textContent = count;
        btn.appendChild(countEl);

        return btn;
    }

    formatPackLabel(label) {
        return label.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
                    .replace(/ /g, ' + ');
    }

    getTotalCount() {
        return this.registry.reduce((sum, cat) => sum + cat.icons.length, 0);
    }

    /* ------------------------------------------
       ICON TYPE FILTERS
       ------------------------------------------ */
    renderTypeFilters() {
        const container = document.querySelector('.icons-type-filters-list');
        if (!container) return;
        container.innerHTML = '';

        const fragment = document.createDocumentFragment();

        ICON_VARIANTS.forEach((variant, i) => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'icons-type-filter-btn';
            if (i === this.currentVariantIndex) btn.classList.add('icons-type-filter-btn--active');
            btn.dataset.variantIndex = i;

            const label = document.createElement('span');
            label.textContent = variant.label;
            btn.appendChild(label);

            fragment.appendChild(btn);
        });

        container.appendChild(fragment);
    }

    /* ------------------------------------------
       SEARCH MATCHING
       Multi-word: every word of the query must appear in the icon's
       normalized name ("arrow left" matches dga-icon-arrow-left-01).
       ------------------------------------------ */
    getQueryWords() {
        return this.currentSearch.toLowerCase().replace(/[-_]+/g, ' ').split(/\s+/).filter(Boolean);
    }

    iconMatches(iconClass, words) {
        if (!words.length) return true;
        const name = this.searchName[iconClass] || iconClass;
        return words.every(w => name.includes(w));
    }

    countMatchesAllPacks(words) {
        let n = 0;
        this.registry.forEach(cat => {
            cat.icons.forEach(ic => { if (this.iconMatches(ic, words)) n++; });
        });
        return n;
    }

    /* ------------------------------------------
       ICONS GRID — chunked rendering with infinite scroll
       ------------------------------------------ */
    renderIcons() {
        const container = document.getElementById(this.gridContainerId);
        if (!container) return;
        container.innerHTML = '';
        if (this._sentinelObserver) {
            this._sentinelObserver.disconnect();
            this._sentinelObserver = null;
        }

        const words = this.getQueryWords();

        // Flat render queue: group headers (when browsing all packs) + icons
        this._pending = [];
        this.registry.forEach(cat => {
            if (this.currentPack !== 'all' && this.currentPack !== cat.id) return;
            const matching = words.length ? cat.icons.filter(ic => this.iconMatches(ic, words)) : cat.icons;
            if (!matching.length) return;
            if (this.currentPack === 'all') {
                this._pending.push({ header: this.formatPackLabel(cat.label), count: matching.length });
            }
            matching.forEach(ic => this._pending.push({ icon: ic }));
        });
        this._rendered = 0;

        const totalIcons = this._pending.filter(e => e.icon).length;
        this.updateResultsBar(totalIcons, words);

        if (totalIcons === 0) {
            let html = '<div class="icons-no-results">' +
                '<span class="icons-no-results-icon dga-icon-search-01" aria-hidden="true"></span>' +
                '<p>No icons match "<strong>' + this.escapeHtml(this.currentSearch.trim()) + '</strong>"' +
                (this.currentPack !== 'all' ? ' in this pack' : '') + '.</p>';
            if (this.currentPack !== 'all') {
                const allCount = this.countMatchesAllPacks(words);
                if (allCount > 0) {
                    html += '<button type="button" class="icons-no-results-all" id="icons-search-all-btn">' +
                        'Search all packs (' + allCount + ' match' + (allCount === 1 ? '' : 'es') + ')</button>';
                }
            }
            container.innerHTML = html + '</div>';
            const allBtn = document.getElementById('icons-search-all-btn');
            if (allBtn) allBtn.addEventListener('click', () => this.selectPack('all'));
            return;
        }

        this.renderNextChunk(container);
    }

    renderNextChunk(container) {
        const fragment = document.createDocumentFragment();
        const gridVariant = ICON_VARIANTS[this.currentVariantIndex] || ICON_VARIANTS[0];
        const end = Math.min(this._rendered + ICONS_CHUNK_SIZE, this._pending.length);

        for (let i = this._rendered; i < end; i++) {
            const entry = this._pending[i];
            if (entry.header) {
                const h = document.createElement('div');
                h.className = 'icons-grid-group';
                h.innerHTML = '<span class="icons-grid-group-name">' + this.escapeHtml(entry.header) + '</span>' +
                    '<span class="icons-grid-group-count">' + entry.count + '</span>';
                fragment.appendChild(h);
            } else {
                fragment.appendChild(this.createGridItem(entry.icon, gridVariant));
            }
        }
        this._rendered = end;

        // Remove old sentinel, append batch, re-arm sentinel if more remains
        container.querySelector('.icons-grid-sentinel')?.remove();
        container.appendChild(fragment);

        if (this._rendered < this._pending.length) {
            const sentinel = document.createElement('div');
            sentinel.className = 'icons-grid-sentinel';
            sentinel.setAttribute('aria-hidden', 'true');
            container.appendChild(sentinel);
            if (!this._sentinelObserver) {
                this._sentinelObserver = new IntersectionObserver((entries) => {
                    if (entries.some(e => e.isIntersecting)) this.renderNextChunk(container);
                }, { rootMargin: '600px 0px' });
            }
            this._sentinelObserver.observe(sentinel);
        }
    }

    createGridItem(iconClass, gridVariant) {
        const item = document.createElement('button');
        item.type = 'button';
        item.className = 'icons-grid-item';
        item.dataset.iconClass = iconClass;
        item.title = iconClass;

        const iconEl = document.createElement('span');
        iconEl.className = 'icon ' + iconClass + (gridVariant.classes ? ' ' + gridVariant.classes : '');
        item.appendChild(iconEl);

        const nameEl = document.createElement('span');
        nameEl.className = 'icons-grid-item-name';
        nameEl.textContent = this.formatIconName(iconClass);
        item.appendChild(nameEl);

        // Quick copy (class name) without opening the modal
        const copyBtn = document.createElement('span');
        copyBtn.className = 'icons-grid-item-copy';
        copyBtn.setAttribute('role', 'button');
        copyBtn.setAttribute('aria-label', 'Copy class name');
        copyBtn.title = 'Copy class name';
        copyBtn.innerHTML = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
            'stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
            '<rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>' +
            '<path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>';
        item.appendChild(copyBtn);

        return item;
    }

    updateResultsBar(totalIcons, words) {
        const bar = document.getElementById('icons-results-bar');
        if (!bar) return;
        const packLabel = this.currentPack === 'all'
            ? 'all packs'
            : this.formatPackLabel(this.registry.find(c => c.id === this.currentPack)?.label || this.currentPack);
        let html = '<strong>' + totalIcons.toLocaleString() + '</strong> icon' + (totalIcons === 1 ? '' : 's') +
            (words.length ? ' matching' : '') + ' in ' + this.escapeHtml(packLabel);

        // Offer widening the search when a pack is selected
        if (words.length && this.currentPack !== 'all') {
            const allCount = this.countMatchesAllPacks(words);
            if (allCount > totalIcons) {
                html += ' &middot; <button type="button" class="icons-results-bar-all" id="icons-search-all-btn">' +
                    allCount.toLocaleString() + ' in all packs</button>';
            }
        }
        bar.innerHTML = html;
        const allBtn = document.getElementById('icons-search-all-btn');
        if (allBtn) allBtn.addEventListener('click', () => this.selectPack('all'));
    }

    selectPack(packId) {
        this.currentPack = packId;
        const packsList = document.getElementById(this.packsListId);
        packsList?.querySelectorAll('.icons-pack-item').forEach(i =>
            i.classList.toggle('icons-pack-item--active', i.dataset.pack === packId));
        this.renderIcons();
    }

    formatIconName(iconClass) {
        return iconClass
            .replace('dga-icon-', '')
            .replace(/-/g, ' ')
            .replace(/\b\w/g, c => c.toUpperCase());
    }

    /* ------------------------------------------
       EVENT BINDING
       ------------------------------------------ */
    bindEvents() {
        const searchInput = document.getElementById(this.searchInputId);
        const searchClear = document.getElementById(this.searchClearId);

        // Search
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                clearTimeout(this.debounceTimer);
                this.debounceTimer = setTimeout(() => {
                    this.currentSearch = e.target.value;
                    if (searchClear) {
                        searchClear.style.display = this.currentSearch ? 'block' : 'none';
                    }
                    this.renderIcons();
                }, 200);
            });

            // Esc inside the field clears the query
            searchInput.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && searchInput.value) {
                    e.stopPropagation();
                    searchInput.value = '';
                    this.currentSearch = '';
                    if (searchClear) searchClear.style.display = 'none';
                    this.renderIcons();
                }
            });

            // "/" focuses search, matching the other docs pages
            this._slashKey = (e) => {
                if (!searchInput.isConnected) {
                    document.removeEventListener('keydown', this._slashKey);
                    return;
                }
                if (e.key === '/' && !/^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName)) {
                    e.preventDefault();
                    searchInput.focus();
                }
            };
            document.addEventListener('keydown', this._slashKey);
        }

        // Clear search
        if (searchClear) {
            searchClear.addEventListener('click', () => {
                if (searchInput) { searchInput.value = ''; searchInput.focus(); }
                this.currentSearch = '';
                searchClear.style.display = 'none';
                this.renderIcons();
            });
        }

        // Pack sidebar clicks
        const packsList = document.getElementById(this.packsListId);
        if (packsList) {
            packsList.addEventListener('click', (e) => {
                const item = e.target.closest('.icons-pack-item');
                if (!item) return;
                this.selectPack(item.dataset.pack);
            });
        }

        // Type filter clicks
        const typeFilters = document.querySelector('.icons-type-filters-list');
        if (typeFilters) {
            typeFilters.addEventListener('click', (e) => {
                const btn = e.target.closest('.icons-type-filter-btn');
                if (!btn) return;
                this.currentVariantIndex = parseInt(btn.dataset.variantIndex, 10);
                typeFilters.querySelectorAll('.icons-type-filter-btn').forEach(b =>
                    b.classList.remove('icons-type-filter-btn--active'));
                btn.classList.add('icons-type-filter-btn--active');
                this.renderIcons();
            });
        }

        // Grid clicks: quick copy or open modal
        const gridContainer = document.getElementById(this.gridContainerId);
        if (gridContainer) {
            gridContainer.addEventListener('click', (e) => {
                const item = e.target.closest('.icons-grid-item');
                if (!item) return;
                const iconClass = item.dataset.iconClass;
                if (!iconClass) return;
                if (e.target.closest('.icons-grid-item-copy')) {
                    this.copyText(iconClass);
                    return;
                }
                this.openModal(iconClass);
            });
        }

        // Modal events
        this.bindModalEvents();
    }

    /* ------------------------------------------
       MODAL
       ------------------------------------------ */
    bindModalEvents() {
        const overlay = document.getElementById('icons-modal-overlay');
        const closeBtn = document.getElementById('icons-modal-close');
        const copyBtn = document.getElementById('icons-modal-copy');
        const downloadBtn = document.getElementById('icons-modal-download');
        const copyClassBtn = document.getElementById('icons-modal-copy-class');

        // Close modal
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.closeModal());
        }
        if (overlay) {
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) this.closeModal();
            });
        }

        // Escape key (self-cleaning when the page is swapped out)
        this._escKey = (e) => {
            if (overlay && !overlay.isConnected) {
                document.removeEventListener('keydown', this._escKey);
                return;
            }
            if (e.key === 'Escape') this.closeModal();
        };
        document.addEventListener('keydown', this._escKey);

        // Tab switching
        const tabContainer = document.querySelector('.icons-modal-tabs');
        if (tabContainer) {
            tabContainer.addEventListener('click', (e) => {
                const tab = e.target.closest('.icons-modal-tab');
                if (!tab) return;
                this.activeTab = tab.dataset.tab;
                tabContainer.querySelectorAll('.icons-modal-tab').forEach(t =>
                    t.classList.remove('icons-modal-tab--active'));
                tab.classList.add('icons-modal-tab--active');
                this.updateCodeContent();
            });
        }

        // Copy code
        if (copyBtn) {
            copyBtn.addEventListener('click', () => {
                const codeEl = document.getElementById('icons-modal-code-content');
                if (codeEl) this.copyText(codeEl.textContent);
            });
        }

        // Copy class
        if (copyClassBtn) {
            copyClassBtn.addEventListener('click', () => {
                this.copyText(this.getFullClassString());
            });
        }

        // Download SVG
        if (downloadBtn) {
            downloadBtn.addEventListener('click', () => this.downloadSVG());
        }

        // Style variant clicks
        const variantsContainer = document.getElementById('icons-modal-variants');
        if (variantsContainer) {
            variantsContainer.addEventListener('click', (e) => {
                const btn = e.target.closest('.icons-modal-variant-btn');
                if (!btn) return;
                const idx = parseInt(btn.dataset.variantIndex, 10);
                this.activeVariantIndex = idx;
                variantsContainer.querySelectorAll('.icons-modal-variant-btn').forEach(b =>
                    b.classList.remove('icons-modal-variant-btn--active'));
                btn.classList.add('icons-modal-variant-btn--active');
                this.updatePreviewIcon();
                this.updateCodeContent();
                this.updateClassDisplay();
            });
        }
    }

    openModal(iconClass) {
        const overlay = document.getElementById('icons-modal-overlay');
        if (!overlay) return;

        this.activeIconClass = iconClass;
        const category = this.iconToCategory[iconClass];
        this.activeIconPack = category ? category.label : '';
        this.activeVariantIndex = 0; // Default: Stroke Rounded

        // Title
        const titleEl = document.getElementById('icons-modal-title');
        if (titleEl) titleEl.textContent = this.formatIconName(iconClass);

        // Subtitle
        const subtitleEl = document.getElementById('icons-modal-subtitle');
        if (subtitleEl) subtitleEl.textContent = 'Icon Pack: ' + this.formatPackLabel(this.activeIconPack);

        // Preview icon (default variant)
        this.updatePreviewIcon();

        // Style variants
        this.renderStyleVariants(iconClass);

        // Preview label
        const previewLabel = document.getElementById('icons-modal-preview-label');
        if (previewLabel) previewLabel.textContent = ICON_VARIANTS[0].label;

        // Reset to HTML tab
        this.activeTab = 'html';
        const tabs = document.querySelectorAll('.icons-modal-tab');
        tabs.forEach(t => t.classList.remove('icons-modal-tab--active'));
        if (tabs[0]) tabs[0].classList.add('icons-modal-tab--active');

        // Code content
        this.updateCodeContent();

        // Class name
        this.updateClassDisplay();

        // Show modal
        overlay.style.display = '';
        document.body.style.overflow = 'hidden';
    }

    closeModal() {
        const overlay = document.getElementById('icons-modal-overlay');
        if (overlay) overlay.style.display = 'none';
        document.body.style.overflow = '';
    }

    getActiveVariant() {
        return ICON_VARIANTS[this.activeVariantIndex] || ICON_VARIANTS[0];
    }

    getFullClassString() {
        const variant = this.getActiveVariant();
        if (variant.classes) {
            return this.activeIconClass + ' ' + variant.classes;
        }
        return this.activeIconClass;
    }

    updatePreviewIcon() {
        const display = document.getElementById('icons-modal-icon');
        if (!display) return;
        display.innerHTML = '';

        const variant = this.getActiveVariant();
        const iconEl = document.createElement('span');
        iconEl.className = 'icon ' + this.activeIconClass;
        if (variant.classes) {
            iconEl.className += ' ' + variant.classes;
        }
        display.appendChild(iconEl);

        // Update preview label
        const previewLabel = document.getElementById('icons-modal-preview-label');
        if (previewLabel) previewLabel.textContent = variant.label;
    }

    renderStyleVariants(iconClass) {
        const container = document.getElementById('icons-modal-variants');
        if (!container) return;
        container.innerHTML = '';

        ICON_VARIANTS.forEach((variant, i) => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'icons-modal-variant-btn';
            if (i === this.activeVariantIndex) btn.classList.add('icons-modal-variant-btn--active');
            btn.dataset.variantIndex = i;
            btn.title = variant.label;

            const iconEl = document.createElement('span');
            iconEl.className = 'icon ' + iconClass;
            if (variant.classes) {
                iconEl.className += ' ' + variant.classes;
            }
            btn.appendChild(iconEl);

            container.appendChild(btn);
        });
    }

    updateClassDisplay() {
        const classNameEl = document.getElementById('icons-modal-class-name');
        if (classNameEl) classNameEl.textContent = this.getFullClassString();
    }

    updateCodeContent() {
        const codeEl = document.getElementById('icons-modal-code-content');
        if (!codeEl) return;

        const ic = this.activeIconClass;
        const variant = this.getActiveVariant();
        const fullClass = this.getFullClassString();
        const category = this.iconToCategory[ic];
        const fontFamily = category
            ? 'dga-fonts-icons-' + category.id
            : '';

        switch (this.activeTab) {
            case 'html':
                codeEl.textContent = '<span class="icon ' + fullClass + '"></span>';
                break;
            case 'css':
                codeEl.textContent =
                    '.' + ic + ' {\n' +
                    '    font-family: \'' + fontFamily + '\' !important;\n' +
                    '}\n\n' +
                    '/* Usage */\n' +
                    '.icon.' + ic + (variant.classes ? '.' + variant.classes.replace(/ /g, '.') : '') + ' {\n' +
                    '    speak: never;\n' +
                    '    font-style: normal;\n' +
                    '    font-weight: normal;\n' +
                    '    font-variant: normal;\n' +
                    '    text-transform: none;\n' +
                    '    line-height: 1;\n' +
                    '    -webkit-font-smoothing: antialiased;\n' +
                    '    -moz-osx-font-smoothing: grayscale;\n' +
                    '}';
                break;
            case 'json':
                codeEl.textContent = JSON.stringify({
                    name: this.formatIconName(ic),
                    class: fullClass,
                    variant: variant.label,
                    pack: category ? category.label : '',
                    fontFamily: fontFamily,
                    html: '<span class="icon ' + fullClass + '"></span>'
                }, null, 2);
                break;
            case 'svg':
                codeEl.textContent =
                    '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">\n' +
                    '    <foreignObject width="24" height="24">\n' +
                    '        <span xmlns="http://www.w3.org/1999/xhtml"\n' +
                    '              class="icon ' + fullClass + '"\n' +
                    '              style="font-size: var(--font-size-2xl);line-height:1;">\n' +
                    '        </span>\n' +
                    '    </foreignObject>\n' +
                    '</svg>';
                break;
        }
    }

    downloadSVG() {
        const ic = this.activeIconClass;
        const fullClass = this.getFullClassString();
        const svgContent =
            '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">\n' +
            '    <foreignObject width="24" height="24">\n' +
            '        <span xmlns="http://www.w3.org/1999/xhtml"\n' +
            '              class="icon ' + fullClass + '"\n' +
            '              style="font-size: var(--font-size-2xl);line-height:1;">\n' +
            '        </span>\n' +
            '    </foreignObject>\n' +
            '</svg>';

        const blob = new Blob([svgContent], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = ic + '.svg';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        this.showToast('Downloaded ' + ic + '.svg');
    }

    /* ------------------------------------------
       UTILITIES
       ------------------------------------------ */
    copyText(text) {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(() => {
                this.showToast('Copied ' + text);
            }).catch(() => this.fallbackCopy(text));
        } else {
            this.fallbackCopy(text);
        }
    }

    fallbackCopy(text) {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        this.showToast('Copied ' + text);
    }

    showToast(message) {
        const toast = document.getElementById(this.toastId);
        if (!toast) return;
        toast.textContent = message;
        toast.classList.add('is-visible');
        clearTimeout(this.toastTimer);
        this.toastTimer = setTimeout(() => {
            toast.classList.remove('is-visible');
        }, 2000);
    }

    escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }
}
