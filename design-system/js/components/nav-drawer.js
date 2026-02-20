/* ============================================
   NAV DRAWER COMPONENT MODULE
   DGA Design System - Navigation Drawer Interactions
   Figma Reference: 30150:160274, 30150:161144, 30150:160799
   ============================================ */

/**
 * NavDrawerManager - Handles navigation drawer interactions
 * - Expand/collapse parent sub-menus with smooth animation
 * - Item selection with visual indicator
 * - Keyboard navigation (arrow keys, enter, space)
 */
class NavDrawerManager {
    constructor(config = {}) {
        this.containerSelector = config.containerSelector || '#component-content';
        this.drawerSelector = config.drawerSelector || '.nav-drawer';
        this.parentSelector = config.parentSelector || '.nav-drawer-item--parent';
        this.childrenSelector = config.childrenSelector || '.nav-drawer-item__children';
        this.itemSelector = config.itemSelector || '.nav-drawer-item';
        this.expandedClass = 'nav-drawer-item--expanded';
        this.childrenOpenClass = 'nav-drawer-item__children--open';
        this.selectedClass = 'nav-drawer-item--selected';
        this.disabledClass = 'nav-drawer-item--disabled';
        this.dividerClass = 'nav-drawer-item--divider';

        this.container = document.querySelector(this.containerSelector);
        if (this.container) {
            this.init();
        }
    }

    /**
     * Initialize all interactions
     */
    init() {
        this.initParentToggles();
        this.initItemSelection();
        this.initKeyboardNavigation();
    }

    /**
     * Initialize expand/collapse toggles for parent items
     */
    initParentToggles() {
        const parents = this.container.querySelectorAll(this.parentSelector);

        parents.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleParent(button);
            });
        });
    }

    /**
     * Toggle a parent item's expanded/collapsed state
     * @param {HTMLElement} button - The parent button element
     */
    toggleParent(button) {
        const isExpanded = button.classList.contains(this.expandedClass);
        const group = button.closest('.nav-drawer-item--group');
        const children = group
            ? group.querySelector(this.childrenSelector)
            : button.nextElementSibling;

        // Toggle expanded state
        button.classList.toggle(this.expandedClass);
        button.setAttribute('aria-expanded', !isExpanded);

        // Toggle children visibility
        if (children) {
            children.classList.toggle(this.childrenOpenClass);
        }
    }

    /**
     * Initialize item selection (click to select)
     */
    initItemSelection() {
        const items = this.container.querySelectorAll(this.itemSelector);

        items.forEach(item => {
            // Skip parents, dividers, and disabled items
            if (item.classList.contains('nav-drawer-item--parent') ||
                item.classList.contains(this.dividerClass) ||
                item.classList.contains(this.disabledClass)) {
                return;
            }

            item.addEventListener('click', (e) => {
                e.preventDefault();
                this.selectItem(item);
            });
        });
    }

    /**
     * Select an item within its drawer
     * @param {HTMLElement} item - The item to select
     */
    selectItem(item) {
        // Find parent drawer
        const drawer = item.closest(this.drawerSelector);
        const scope = drawer || this.container;

        // Remove selected from all items in the same drawer
        scope.querySelectorAll('.' + this.selectedClass).forEach(selected => {
            selected.classList.remove(this.selectedClass);
        });

        // Add selected to clicked item
        item.classList.add(this.selectedClass);
    }

    /**
     * Initialize keyboard navigation
     */
    initKeyboardNavigation() {
        const drawers = this.container.querySelectorAll(this.drawerSelector);

        drawers.forEach(drawer => {
            drawer.addEventListener('keydown', (e) => {
                this.handleKeydown(e, drawer);
            });
        });
    }

    /**
     * Handle keyboard events within a drawer
     * @param {KeyboardEvent} e - The keyboard event
     * @param {HTMLElement} drawer - The drawer container
     */
    handleKeydown(e, drawer) {
        const visibleItems = this.getVisibleItems(drawer);
        const currentIndex = visibleItems.indexOf(document.activeElement);

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                if (currentIndex < visibleItems.length - 1) {
                    visibleItems[currentIndex + 1].focus();
                } else if (visibleItems.length > 0) {
                    visibleItems[0].focus();
                }
                break;

            case 'ArrowUp':
                e.preventDefault();
                if (currentIndex > 0) {
                    visibleItems[currentIndex - 1].focus();
                } else if (visibleItems.length > 0) {
                    visibleItems[visibleItems.length - 1].focus();
                }
                break;

            case 'Home':
                e.preventDefault();
                if (visibleItems.length > 0) {
                    visibleItems[0].focus();
                }
                break;

            case 'End':
                e.preventDefault();
                if (visibleItems.length > 0) {
                    visibleItems[visibleItems.length - 1].focus();
                }
                break;

            case 'Enter':
            case ' ':
                if (document.activeElement &&
                    document.activeElement.classList.contains('nav-drawer-item--parent')) {
                    e.preventDefault();
                    this.toggleParent(document.activeElement);
                }
                break;
        }
    }

    /**
     * Get all visible (non-hidden, non-disabled) focusable items in a drawer
     * @param {HTMLElement} drawer - The drawer container
     * @returns {HTMLElement[]} Array of visible items
     */
    getVisibleItems(drawer) {
        const allItems = drawer.querySelectorAll(this.itemSelector);
        return Array.from(allItems).filter(item => {
            // Skip dividers and disabled items
            if (item.classList.contains(this.dividerClass) ||
                item.classList.contains(this.disabledClass)) {
                return false;
            }

            // Skip items inside collapsed children containers
            const parentChildren = item.closest(this.childrenSelector);
            if (parentChildren && !parentChildren.classList.contains(this.childrenOpenClass)) {
                return false;
            }

            return true;
        });
    }
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NavDrawerManager;
}
