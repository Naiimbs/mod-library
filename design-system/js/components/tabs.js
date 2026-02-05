/* ============================================
   TABS COMPONENT MODULE
   DGA Design System - Tab Interactions
   Single Responsibility: Tab interaction logic
   ============================================ */

/**
 * TabManager class for handling tab interactions
 */
class TabManager {
    constructor(config = {}) {
        this.tabsSelector = config.tabsSelector || '.tabs';
        this.tabItemSelector = config.tabItemSelector || '.tab-item';
        this.activeClass = config.activeClass || 'active';

        this.init();
    }

    /**
     * Initialize tab interactions
     */
    init() {
        document.querySelectorAll(this.tabsSelector).forEach(tabContainer => {
            this.initTabContainer(tabContainer);
        });
    }

    /**
     * Initialize a single tab container
     * @param {HTMLElement} container - Tab container element
     */
    initTabContainer(container) {
        const tabs = container.querySelectorAll(this.tabItemSelector);

        tabs.forEach((tab, index) => {
            // Click handler
            tab.addEventListener('click', (e) => {
                e.preventDefault();
                this.activateTab(container, tab);
            });

            // Keyboard navigation
            tab.setAttribute('tabindex', tab.classList.contains(this.activeClass) ? '0' : '-1');
            tab.setAttribute('role', 'tab');
            tab.setAttribute('aria-selected', tab.classList.contains(this.activeClass));

            tab.addEventListener('keydown', (e) => {
                this.handleKeydown(e, container, tabs, index);
            });
        });

        // Set ARIA attributes on container
        container.setAttribute('role', 'tablist');
    }

    /**
     * Activate a specific tab
     * @param {HTMLElement} container - Tab container element
     * @param {HTMLElement} tab - Tab element to activate
     */
    activateTab(container, tab) {
        const tabs = container.querySelectorAll(this.tabItemSelector);

        // Deactivate all tabs
        tabs.forEach(t => {
            t.classList.remove(this.activeClass);
            t.setAttribute('aria-selected', 'false');
            t.setAttribute('tabindex', '-1');
        });

        // Activate selected tab
        tab.classList.add(this.activeClass);
        tab.setAttribute('aria-selected', 'true');
        tab.setAttribute('tabindex', '0');
        tab.focus();

        // Dispatch custom event
        container.dispatchEvent(new CustomEvent('tab:change', {
            detail: {
                tab: tab,
                index: Array.from(tabs).indexOf(tab)
            }
        }));
    }

    /**
     * Handle keyboard navigation
     * @param {KeyboardEvent} e - Keyboard event
     * @param {HTMLElement} container - Tab container
     * @param {NodeList} tabs - All tab elements
     * @param {number} currentIndex - Current tab index
     */
    handleKeydown(e, container, tabs, currentIndex) {
        let newIndex = currentIndex;

        switch (e.key) {
            case 'ArrowLeft':
                e.preventDefault();
                newIndex = currentIndex > 0 ? currentIndex - 1 : tabs.length - 1;
                break;
            case 'ArrowRight':
                e.preventDefault();
                newIndex = currentIndex < tabs.length - 1 ? currentIndex + 1 : 0;
                break;
            case 'Home':
                e.preventDefault();
                newIndex = 0;
                break;
            case 'End':
                e.preventDefault();
                newIndex = tabs.length - 1;
                break;
            default:
                return;
        }

        this.activateTab(container, tabs[newIndex]);
    }

    /**
     * Get the active tab in a container
     * @param {HTMLElement} container - Tab container
     * @returns {HTMLElement|null} - Active tab element
     */
    getActiveTab(container) {
        return container.querySelector(`${this.tabItemSelector}.${this.activeClass}`);
    }

    /**
     * Activate tab by index
     * @param {HTMLElement} container - Tab container
     * @param {number} index - Tab index to activate
     */
    activateTabByIndex(container, index) {
        const tabs = container.querySelectorAll(this.tabItemSelector);
        if (tabs[index]) {
            this.activateTab(container, tabs[index]);
        }
    }
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TabManager;
}
