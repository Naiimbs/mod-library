/* ============================================
   COMPONENTS OVERVIEW MODULE
   DGA Design System - Search & Navigation
   ============================================ */

class ComponentsOverviewManager {
    constructor() {
        this.searchInput = document.getElementById('overview-search');
        this.searchClear = document.getElementById('overview-search-clear');
        this.cards = document.querySelectorAll('.overview-card');
        this.categories = document.querySelectorAll('.overview-category');
        this.noResults = document.getElementById('overview-no-results');
        this.debounceTimer = null;

        this.init();
    }

    init() {
        this.bindSearch();
        this.bindCardClicks();
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
            let categoryVisible = 0;

            cards.forEach(card => {
                const name = (card.getAttribute('data-name') || '').toLowerCase();
                const matches = !query || name.includes(query);
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
