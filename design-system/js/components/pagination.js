/* ============================================
   PAGINATION COMPONENT MODULE
   DGA Design System - Pagination
   - paginationRange(): the ellipsis-truncation algorithm
   - PaginationManager: static markup interactivity (legacy support)
   - PaginationDemoManager: builds + drives a dynamic pagination
   ============================================ */

const PAGE_PREV_ICON = '<svg class="pagination-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>';
const PAGE_NEXT_ICON = '<svg class="pagination-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>';
const PAGE_DOTS = '…';

/**
 * Produce the sequence of page tokens to render: page numbers and '…'
 * gap markers. Mirrors the DgaPagination algorithm — always show the
 * first and last page, the current page, and `siblingCount` neighbours
 * either side; collapse the rest into ellipses.
 *
 * @param {number} total   total page count
 * @param {number} current current page (1-based)
 * @param {number} siblings sibling count each side of current
 * @returns {(number|'…')[]}
 */
function paginationRange(total, current, siblings) {
    // Pages we always want visible: first + last + current ± siblings.
    // 5 = first + last + current + the two ellipsis slots.
    const totalToShow = siblings * 2 + 5;
    if (totalToShow >= total) {
        return Array.from({ length: total }, (_, i) => i + 1);
    }

    const leftSibling = Math.max(current - siblings, 1);
    const rightSibling = Math.min(current + siblings, total);

    const showLeftDots = leftSibling > 2;
    const showRightDots = rightSibling < total - 1;

    const range = [];

    if (!showLeftDots && showRightDots) {
        // Near the start: 1..(left block), …, last
        const leftCount = 3 + siblings * 2;
        for (let i = 1; i <= leftCount; i++) range.push(i);
        range.push(PAGE_DOTS, total);
    } else if (showLeftDots && !showRightDots) {
        // Near the end: 1, …, (right block)..last
        const rightCount = 3 + siblings * 2;
        range.push(1, PAGE_DOTS);
        for (let i = total - rightCount + 1; i <= total; i++) range.push(i);
    } else if (showLeftDots && showRightDots) {
        // Middle: 1, …, current±siblings, …, last
        range.push(1, PAGE_DOTS);
        for (let i = leftSibling; i <= rightSibling; i++) range.push(i);
        range.push(PAGE_DOTS, total);
    } else {
        for (let i = 1; i <= total; i++) range.push(i);
    }
    return range;
}

/* ============================================
   PaginationManager — wires static .pagination markup (back-compat).
   ============================================ */

class PaginationManager {
    constructor(config = {}) {
        this.paginationSelector = config.paginationSelector || '.pagination[data-static]';
        this.init();
    }

    init() {
        document.querySelectorAll(this.paginationSelector).forEach(container => {
            container.querySelectorAll('.pagination-item').forEach(item => {
                if (item.dataset.pgBound) return;
                item.dataset.pgBound = 'true';
                item.addEventListener('click', (e) => {
                    e.preventDefault();
                    if (item.classList.contains('is-disabled') || item.classList.contains('pagination-ellipsis')) return;
                    if (item.classList.contains('pagination-item--nav')) return;
                    container.querySelectorAll('.pagination-item').forEach(i => {
                        i.classList.remove('is-active');
                        i.removeAttribute('aria-current');
                    });
                    item.classList.add('is-active');
                    item.setAttribute('aria-current', 'page');
                });
            });
        });
    }
}

/* ============================================
   PaginationDemoManager — live demo + a reusable dynamic renderer.
   ============================================ */

class PaginationDemoManager {
    constructor() {
        this.preview = document.getElementById('pagination-demo-preview');
        this.totalInput = document.getElementById('pagination-demo-total');
        this.siblingSelect = document.getElementById('pagination-demo-siblings');
        this.sizeSelect = document.getElementById('pagination-demo-size');
        if (!this.preview) return;

        this.current = 1;
        this.toggles = {};
        this.initSwitches();
        [this.totalInput, this.siblingSelect, this.sizeSelect].forEach(el => {
            if (el) el.addEventListener('change', () => { this.clampCurrent(); this.render(); });
        });
        this.render();
    }

    initSwitches() {
        document.querySelectorAll('.live-demo__switch[data-toggle]').forEach(btn => {
            const key = btn.dataset.toggle;
            this.toggles[key] = btn.getAttribute('aria-checked') === 'true';
            btn.addEventListener('click', () => {
                this.toggles[key] = !this.toggles[key];
                btn.classList.toggle('active', this.toggles[key]);
                btn.setAttribute('aria-checked', String(this.toggles[key]));
                this.render();
            });
        });
    }

    total() { return Math.max(1, parseInt(this.totalInput?.value, 10) || 10); }
    siblings() { return parseInt(this.siblingSelect?.value, 10) || 1; }

    clampCurrent() { this.current = Math.min(Math.max(1, this.current), this.total()); }

    render() {
        const total = this.total();
        const siblings = this.siblings();
        const size = this.sizeSelect ? this.sizeSelect.value : 'md';
        const isRTL = !!this.toggles['rtl'];
        const showLabels = !!this.toggles['labels'];
        this.clampCurrent();

        const navClasses = ['pagination'];
        if (size === 'sm') navClasses.push('pagination--sm');
        if (size === 'lg') navClasses.push('pagination--lg');

        const atStart = this.current === 1;
        const atEnd = this.current === total;
        const labelPrev = isRTL ? 'السابق' : 'Previous';
        const labelNext = isRTL ? 'التالي' : 'Next';

        const prev = `<button type="button" class="pagination-item pagination-item--nav${atStart ? ' is-disabled' : ''}" data-page="prev" aria-label="${labelPrev}"${atStart ? ' disabled' : ''}>${PAGE_PREV_ICON}${showLabels ? `<span>${labelPrev}</span>` : ''}</button>`;
        const next = `<button type="button" class="pagination-item pagination-item--nav${atEnd ? ' is-disabled' : ''}" data-page="next" aria-label="${labelNext}"${atEnd ? ' disabled' : ''}>${showLabels ? `<span>${labelNext}</span>` : ''}${PAGE_NEXT_ICON}</button>`;

        const pages = paginationRange(total, this.current, siblings).map(tok => {
            if (tok === PAGE_DOTS) return `<span class="pagination-item pagination-ellipsis" aria-hidden="true">${PAGE_DOTS}</span>`;
            const active = tok === this.current;
            return `<button type="button" class="pagination-item${active ? ' is-active' : ''}" data-page="${tok}"${active ? ' aria-current="page"' : ''}>${tok}</button>`;
        }).join('');

        this.preview.innerHTML = `<nav class="${navClasses.join(' ')}"${isRTL ? ' dir="rtl"' : ''} aria-label="Pagination">${prev}${pages}${next}</nav>`;

        // Wire navigation
        this.preview.querySelectorAll('.pagination-item[data-page]').forEach(btn => {
            btn.addEventListener('click', () => {
                if (btn.classList.contains('is-disabled')) return;
                const p = btn.dataset.page;
                if (p === 'prev') this.current = Math.max(1, this.current - 1);
                else if (p === 'next') this.current = Math.min(total, this.current + 1);
                else this.current = parseInt(p, 10);
                this.render();
                this.preview.dispatchEvent(new CustomEvent('pagination:change', { detail: { page: this.current }, bubbles: true }));
            });
        });
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { paginationRange, PaginationManager, PaginationDemoManager };
}
