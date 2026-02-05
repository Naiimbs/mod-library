/* ============================================
   PAGINATION COMPONENT MODULE
   DGA Design System - Pagination Interactions
   Single Responsibility: Pagination interaction logic
   ============================================ */

/**
 * PaginationManager class for handling pagination interactions
 */
class PaginationManager {
    constructor(config = {}) {
        this.paginationSelector = config.paginationSelector || '.pagination';
        this.itemSelector = config.itemSelector || '.pagination-item';
        this.activeClass = config.activeClass || 'active';
        this.disabledClass = config.disabledClass || 'disabled';

        this.init();
    }

    /**
     * Initialize pagination interactions
     */
    init() {
        document.querySelectorAll(this.paginationSelector).forEach(pagination => {
            this.initPagination(pagination);
        });
    }

    /**
     * Initialize a single pagination container
     * @param {HTMLElement} container - Pagination container element
     */
    initPagination(container) {
        const items = container.querySelectorAll(this.itemSelector);

        items.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();

                // Skip if disabled or ellipsis
                if (item.classList.contains(this.disabledClass)) return;

                this.activateItem(container, item);
            });
        });

        // Set ARIA attributes
        container.setAttribute('role', 'navigation');
        container.setAttribute('aria-label', 'Pagination');
    }

    /**
     * Activate a specific pagination item
     * @param {HTMLElement} container - Pagination container
     * @param {HTMLElement} item - Item to activate
     */
    activateItem(container, item) {
        const items = container.querySelectorAll(this.itemSelector);

        // Check if it's a prev/next button
        const isPrevNext = item.querySelector('.pagination-icon');
        if (isPrevNext) {
            this.handleNavigation(container, item);
            return;
        }

        // Deactivate all items
        items.forEach(i => {
            i.classList.remove(this.activeClass);
            i.setAttribute('aria-current', 'false');
        });

        // Activate selected item
        item.classList.add(this.activeClass);
        item.setAttribute('aria-current', 'page');

        // Dispatch custom event
        container.dispatchEvent(new CustomEvent('pagination:change', {
            detail: {
                item: item,
                page: item.textContent.trim()
            }
        }));
    }

    /**
     * Handle prev/next navigation
     * @param {HTMLElement} container - Pagination container
     * @param {HTMLElement} navItem - Navigation item (prev/next)
     */
    handleNavigation(container, navItem) {
        const items = Array.from(container.querySelectorAll(this.itemSelector));
        const activeIndex = items.findIndex(item => item.classList.contains(this.activeClass));
        const isPrev = navItem === items[0];

        // Find numeric items only
        const numericItems = items.filter(item =>
            !item.classList.contains(this.disabledClass) &&
            !item.querySelector('.pagination-icon')
        );

        if (numericItems.length === 0) return;

        const currentNumericIndex = numericItems.findIndex(item =>
            item.classList.contains(this.activeClass)
        );

        let newIndex;
        if (isPrev) {
            newIndex = currentNumericIndex > 0 ? currentNumericIndex - 1 : 0;
        } else {
            newIndex = currentNumericIndex < numericItems.length - 1
                ? currentNumericIndex + 1
                : numericItems.length - 1;
        }

        if (numericItems[newIndex]) {
            this.activateItem(container, numericItems[newIndex]);
        }
    }

    /**
     * Go to a specific page
     * @param {HTMLElement} container - Pagination container
     * @param {number|string} page - Page number
     */
    goToPage(container, page) {
        const items = container.querySelectorAll(this.itemSelector);
        const targetItem = Array.from(items).find(item =>
            item.textContent.trim() === String(page) &&
            !item.classList.contains(this.disabledClass)
        );

        if (targetItem) {
            this.activateItem(container, targetItem);
        }
    }

    /**
     * Get current active page
     * @param {HTMLElement} container - Pagination container
     * @returns {string|null} - Current page number
     */
    getCurrentPage(container) {
        const activeItem = container.querySelector(`${this.itemSelector}.${this.activeClass}`);
        return activeItem ? activeItem.textContent.trim() : null;
    }
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PaginationManager;
}
