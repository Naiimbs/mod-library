/* ============================================
   CARDS COMPONENT MODULE
   DGA Design System - Card Interactions
   Single Responsibility: Card interaction logic
   ============================================ */

/**
 * CardManager class for handling card interactions
 */
class CardManager {
    constructor(config = {}) {
        this.expandableSelector = config.expandableSelector || '[data-card-expandable]';
        this.selectableSelector = config.selectableSelector || '[data-card-selectable]';
        this.collapsedClass = config.collapsedClass || 'card--collapsed';
        this.selectedClass = config.selectedClass || 'card--selected';
        this.disabledClass = config.disabledClass || 'card--disabled';

        this.init();
    }

    /**
     * Initialize card interactions
     */
    init() {
        this.initExpandableCards();
        this.initSelectableCards();
    }

    /**
     * Initialize expandable card functionality
     */
    initExpandableCards() {
        document.querySelectorAll(this.expandableSelector).forEach(card => {
            const toggle = card.querySelector('.card-toggle');
            if (!toggle) return;

            // Toggle button click
            toggle.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleExpand(card, toggle);
            });

            // Card click (excluding toggle button)
            card.addEventListener('click', (e) => {
                if (!e.target.closest('.card-toggle')) {
                    this.toggleExpand(card, toggle);
                }
            });
        });
    }

    /**
     * Toggle card expand/collapse state
     * @param {HTMLElement} card - Card element
     * @param {HTMLElement} toggle - Toggle button element
     */
    toggleExpand(card, toggle) {
        const isCollapsed = card.classList.toggle(this.collapsedClass);

        // Update toggle button
        toggle.textContent = isCollapsed ? '+' : '−';
        toggle.setAttribute('aria-label', isCollapsed ? 'Expand card' : 'Collapse card');
        toggle.setAttribute('aria-expanded', !isCollapsed);

        // Dispatch custom event
        card.dispatchEvent(new CustomEvent('card:toggle', {
            detail: { collapsed: isCollapsed }
        }));
    }

    /**
     * Initialize selectable card functionality
     */
    initSelectableCards() {
        document.querySelectorAll(this.selectableSelector).forEach(card => {
            card.addEventListener('click', () => {
                if (card.classList.contains(this.disabledClass)) return;
                this.toggleSelect(card);
            });

            // Keyboard accessibility
            card.setAttribute('tabindex', '0');
            card.setAttribute('role', 'checkbox');
            card.setAttribute('aria-checked', card.classList.contains(this.selectedClass));

            card.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    if (!card.classList.contains(this.disabledClass)) {
                        this.toggleSelect(card);
                    }
                }
            });
        });
    }

    /**
     * Toggle card selected state
     * @param {HTMLElement} card - Card element
     */
    toggleSelect(card) {
        const isSelected = card.classList.toggle(this.selectedClass);
        card.setAttribute('aria-checked', isSelected);

        // Dispatch custom event
        card.dispatchEvent(new CustomEvent('card:select', {
            detail: { selected: isSelected }
        }));
    }

    /**
     * Select a card programmatically
     * @param {HTMLElement} card - Card element
     */
    select(card) {
        if (!card.classList.contains(this.selectedClass)) {
            this.toggleSelect(card);
        }
    }

    /**
     * Deselect a card programmatically
     * @param {HTMLElement} card - Card element
     */
    deselect(card) {
        if (card.classList.contains(this.selectedClass)) {
            this.toggleSelect(card);
        }
    }

    /**
     * Expand a card programmatically
     * @param {HTMLElement} card - Card element
     */
    expand(card) {
        const toggle = card.querySelector('.card-toggle');
        if (card.classList.contains(this.collapsedClass) && toggle) {
            this.toggleExpand(card, toggle);
        }
    }

    /**
     * Collapse a card programmatically
     * @param {HTMLElement} card - Card element
     */
    collapse(card) {
        const toggle = card.querySelector('.card-toggle');
        if (!card.classList.contains(this.collapsedClass) && toggle) {
            this.toggleExpand(card, toggle);
        }
    }
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CardManager;
}
