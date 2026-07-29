/* ============================================
   COMPONENTS OVERVIEW MODULE
   DGA Design System - Search, category filter chips & navigation
   ============================================ */

class ComponentsOverviewManager {
    constructor() {
        this.searchInput = document.getElementById('overview-search');
        this.searchClear = document.getElementById('overview-search-clear');
        this.chipsRoot = document.getElementById('overview-chips');
        this.cards = document.querySelectorAll('.overview-card');
        this.categories = document.querySelectorAll('.overview-category');
        this.noResults = document.getElementById('overview-no-results');
        this.noResultsClear = document.getElementById('overview-no-results-clear');
        this.debounceTimer = null;
        this.activeCategory = 'all';

        this.init();
    }

    init() {
        this.buildChips();
        this.bindSearch();
        this.bindCardClicks();
    }

    /* Category filter chips, built from the category sections on the page */
    buildChips() {
        if (!this.chipsRoot) return;
        const total = document.querySelectorAll('.overview-card').length;
        const chips = [{ id: 'all', label: 'All', count: total }];
        this.categories.forEach(cat => {
            chips.push({
                id: cat.getAttribute('data-category'),
                label: cat.querySelector('.overview-category-title')?.textContent || '',
                count: parseInt(cat.getAttribute('data-total-count'), 10) || 0,
            });
        });
        this.chipsRoot.innerHTML = chips.map(c =>
            `<button type="button" class="overview-chip${c.id === 'all' ? ' is-active' : ''}" data-chip="${c.id}">
                ${c.label} <span class="overview-chip__count">${c.count}</span>
            </button>`).join('');

        this.chipsRoot.addEventListener('click', (e) => {
            const chip = e.target.closest('.overview-chip');
            if (!chip) return;
            this.activeCategory = chip.dataset.chip;
            this.chipsRoot.querySelectorAll('.overview-chip').forEach(c =>
                c.classList.toggle('is-active', c === chip));
            this.filterComponents();
        });
    }

    bindSearch() {
        if (!this.searchInput) return;

        this.searchInput.addEventListener('input', () => {
            clearTimeout(this.debounceTimer);
            this.debounceTimer = setTimeout(() => this.filterComponents(), 200);
        });

        if (this.searchClear) {
            this.searchClear.addEventListener('click', () => {
                this.searchInput.value = '';
                this.searchClear.style.display = 'none';
                this.filterComponents();
                this.searchInput.focus();
            });
        }

        if (this.noResultsClear) {
            this.noResultsClear.addEventListener('click', () => this.resetFilters());
        }

        /* "/" focuses search, matching the token docs pages */
        this._slashKey = (e) => {
            /* the router swaps pages; drop the listener once this instance is gone */
            if (!this.searchInput.isConnected) {
                document.removeEventListener('keydown', this._slashKey);
                return;
            }
            if (e.key === '/' && !/^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName)) {
                e.preventDefault();
                this.searchInput.focus();
            }
        };
        document.addEventListener('keydown', this._slashKey);
    }

    resetFilters() {
        this.searchInput.value = '';
        if (this.searchClear) this.searchClear.style.display = 'none';
        this.activeCategory = 'all';
        this.chipsRoot?.querySelectorAll('.overview-chip').forEach(c =>
            c.classList.toggle('is-active', c.dataset.chip === 'all'));
        this.filterComponents();
        this.searchInput.focus();
    }

    filterComponents() {
        const query = this.searchInput.value.trim().toLowerCase();

        if (this.searchClear) {
            this.searchClear.style.display = query ? 'flex' : 'none';
        }

        let totalVisible = 0;

        this.categories.forEach(category => {
            const cards = category.querySelectorAll('.overview-card');
            const totalCount = category.getAttribute('data-total-count');
            const inCategory = this.activeCategory === 'all' ||
                category.getAttribute('data-category') === this.activeCategory;
            let categoryVisible = 0;

            cards.forEach(card => {
                const name = (card.getAttribute('data-name') || '').toLowerCase();
                const matches = inCategory && (!query || name.includes(query));
                card.classList.toggle('overview-card--hidden', !matches);
                if (matches) categoryVisible++;
            });

            category.classList.toggle('overview-category--hidden', categoryVisible === 0);

            // Update count badge
            const countBadge = category.querySelector('.overview-category-count');
            if (countBadge) {
                countBadge.textContent = query ? categoryVisible : totalCount;
            }

            totalVisible += categoryVisible;
        });

        if (this.noResults) {
            this.noResults.style.display = totalVisible === 0 ? 'block' : 'none';
        }
    }

    bindCardClicks() {
        this.cards.forEach(card => {
            card.addEventListener('click', (e) => {
                e.preventDefault();
                const componentId = card.getAttribute('data-component');
                if (componentId) {
                    window.location.hash = componentId;
                }
            });
        });
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = ComponentsOverviewManager;
}
