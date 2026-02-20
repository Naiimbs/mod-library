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
        this.tabsSelector = config.tabsSelector || '.tab-list';
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
        const isRtl = container.closest('[dir="rtl"]') !== null;
        let newIndex = currentIndex;

        switch (e.key) {
            case 'ArrowLeft':
                e.preventDefault();
                if (isRtl) {
                    newIndex = currentIndex < tabs.length - 1 ? currentIndex + 1 : 0;
                } else {
                    newIndex = currentIndex > 0 ? currentIndex - 1 : tabs.length - 1;
                }
                break;
            case 'ArrowRight':
                e.preventDefault();
                if (isRtl) {
                    newIndex = currentIndex > 0 ? currentIndex - 1 : tabs.length - 1;
                } else {
                    newIndex = currentIndex < tabs.length - 1 ? currentIndex + 1 : 0;
                }
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

        // Skip disabled tabs
        const tabsArray = Array.from(tabs);
        let attempts = 0;
        while (attempts < tabsArray.length && (tabsArray[newIndex].disabled || tabsArray[newIndex].classList.contains('disabled'))) {
            if (e.key === 'ArrowRight' || (e.key === 'ArrowLeft' && isRtl)) {
                newIndex = newIndex < tabsArray.length - 1 ? newIndex + 1 : 0;
            } else {
                newIndex = newIndex > 0 ? newIndex - 1 : tabsArray.length - 1;
            }
            attempts++;
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

/* ============================================
   TABS DEMO MODULE
   Powers the live demo controls on the Tabs page.
   ============================================ */

class TabsDemoManager {
    constructor() {
        this.preview = document.getElementById('tabs-demo-preview');
        this.sizeSelect = document.getElementById('tabs-demo-size');
        this.countSelect = document.getElementById('tabs-demo-count');

        if (!this.preview) return;

        this.labels = {
            en: ['First Tab', 'Second Tab', 'Third Tab', 'Fourth Tab', 'Fifth Tab'],
            ar: ['\u062A\u0628\u0648\u064A\u0628 \u0623\u0648\u0644', '\u062A\u0628\u0648\u064A\u0628 \u062B\u0627\u0646\u064A', '\u062A\u0628\u0648\u064A\u0628 \u062B\u0627\u0644\u062B', '\u062A\u0628\u0648\u064A\u0628 \u0631\u0627\u0628\u0639', '\u062A\u0628\u0648\u064A\u0628 \u062E\u0627\u0645\u0633']
        };

        this.iconSVG = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8 17H16M11.018 2.764L4.235 8.039C3.624 8.505 3.319 8.739 3.098 9.029C2.902 9.288 2.753 9.579 2.658 9.889C2.551 10.238 2.551 10.614 2.551 11.365V17.8C2.551 18.92 2.551 19.48 2.769 19.908C2.961 20.284 3.267 20.59 3.643 20.782C4.071 21 4.631 21 5.751 21H18.251C19.371 21 19.931 21 20.359 20.782C20.735 20.59 21.041 20.284 21.233 19.908C21.451 19.48 21.451 18.92 21.451 17.8V11.365C21.451 10.614 21.451 10.238 21.344 9.889C21.249 9.579 21.1 9.288 20.904 9.029C20.683 8.739 20.378 8.505 19.767 8.039L12.984 2.764C12.508 2.401 12.27 2.22 12.008 2.152C11.777 2.092 11.534 2.092 11.303 2.152C11.041 2.22 10.803 2.401 10.327 2.764L11.018 2.764Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';

        this.activeIndex = 0;
        this.toggles = {};
        this.initSwitches();
        this.bindEvents();
        this.render();
    }

    initSwitches() {
        document.querySelectorAll('.live-demo__switch[data-toggle]').forEach(btn => {
            const key = btn.dataset.toggle;
            // Icons and divider default ON
            this.toggles[key] = btn.classList.contains('active');

            btn.addEventListener('click', () => {
                this.toggles[key] = !this.toggles[key];
                this.updateSwitchUI(key);
                this.render();
            });
        });
    }

    updateSwitchUI(key) {
        const btn = document.querySelector(`.live-demo__switch[data-toggle="${key}"]`);
        if (btn) {
            btn.classList.toggle('active', this.toggles[key]);
            btn.setAttribute('aria-checked', String(this.toggles[key]));
        }
    }

    bindEvents() {
        this.sizeSelect.addEventListener('change', () => this.render());
        this.countSelect.addEventListener('change', () => this.render());
    }

    render() {
        const size = this.sizeSelect.value;
        const count = parseInt(this.countSelect.value);
        const isRTL = this.toggles['rtl'] || false;
        const showIcons = this.toggles['icons'] || false;
        const showDivider = this.toggles['divider'] || false;
        const disableTab = this.toggles['disabled-tab'] || false;
        const lang = isRTL ? 'ar' : 'en';
        const tabLabels = this.labels[lang];

        // Ensure activeIndex is within bounds
        if (this.activeIndex >= count) this.activeIndex = 0;

        // Build size classes
        const listSizeClass = size !== 'md' ? ` tab-list--${size}` : '';
        const itemSizeClass = size !== 'md' ? ` tab-item--${size}` : '';

        // Build divider HTML
        const dividerHTML = showDivider ? '<div class="tab-list__divider"></div>' : '';

        // Build tab items
        let tabsHTML = '';
        for (let i = 0; i < count; i++) {
            const isActive = i === this.activeIndex;
            const isDisabled = disableTab && i === count - 1; // Disable last tab
            const activeClass = isActive ? ' active' : '';
            const disabledAttr = isDisabled ? ' disabled' : '';
            const ariaSelected = isActive ? 'true' : 'false';

            const iconHTML = showIcons ? `<span class="tab-item__icon">${this.iconSVG}</span>` : '';

            tabsHTML += `<button class="tab-item${itemSizeClass}${activeClass}" role="tab" aria-selected="${ariaSelected}"${disabledAttr}>`;
            if (isRTL) {
                tabsHTML += `<span class="tab-item__title">${tabLabels[i]}</span>`;
                tabsHTML += iconHTML;
            } else {
                tabsHTML += iconHTML;
                tabsHTML += `<span class="tab-item__title">${tabLabels[i]}</span>`;
            }
            tabsHTML += `<span class="tab-item__indicator"><span class="tab-item__indicator-bar"></span></span>`;
            tabsHTML += `</button>`;
        }

        const html = `
            <div class="tab-list${listSizeClass}" role="tablist">
                ${dividerHTML}
                <div class="tab-list__tabs">
                    ${tabsHTML}
                </div>
            </div>
        `;

        this.preview.innerHTML = html;
        this.preview.dir = isRTL ? 'rtl' : '';

        // Add click handlers to rendered tabs
        this.preview.querySelectorAll('.tab-item').forEach((tab, idx) => {
            tab.addEventListener('click', (e) => {
                e.preventDefault();
                if (tab.disabled) return;
                this.activeIndex = idx;
                this.render();
            });
        });
    }
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { TabManager, TabsDemoManager };
}
