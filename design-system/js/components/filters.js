/* ============================================
   FILTERS COMPONENT MODULE
   DGA Design System - Filter Interactions
   Figma Reference: 30150:36683, 30150:36417, 30150:36646
   ============================================ */

/**
 * FilterManager class for handling filter interactions
 */
class FilterManager {
    constructor(config = {}) {
        this.dropdownSelector = config.dropdownSelector || '.filter-dropdown';
        this.buttonSelector = config.buttonSelector || '.filter-button';
        this.contentSelector = config.contentSelector || '.filter-dropdown__content';
        this.optionSelector = config.optionSelector || '.filter-option';
        this.searchSelector = config.searchSelector || '.filter-search__input';
        this.showMoreSelector = config.showMoreSelector || '.filter-show-more';
        this.overlaySelector = config.overlaySelector || '.filter-overlay';
        this.panelSelector = config.panelSelector || '.filter-panel';
        this.openClass = 'is-open';
        this.expandedClass = 'is-expanded';

        this.init();
    }

    /**
     * Initialize all filter components
     */
    init() {
        this.initDropdowns();
        this.initOptions();
        this.initSearch();
        this.initShowMore();
        this.initOverlays();
        this.initClickOutside();
        this.initKeyboardNavigation();
        this.initComprehensiveDemo();
    }

    /**
     * Initialize filter dropdowns
     */
    initDropdowns() {
        document.querySelectorAll(this.dropdownSelector).forEach(dropdown => {
            const button = dropdown.querySelector(this.buttonSelector);
            const content = dropdown.querySelector(this.contentSelector);

            if (button && content) {
                button.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    this.toggleDropdown(dropdown, button, content);
                });

                // Set ARIA attributes
                const id = `filter-content-${Math.random().toString(36).substr(2, 9)}`;
                content.id = id;
                button.setAttribute('aria-haspopup', 'true');
                button.setAttribute('aria-expanded', 'false');
                button.setAttribute('aria-controls', id);
            }
        });
    }

    /**
     * Toggle dropdown open/close
     */
    toggleDropdown(dropdown, button, content) {
        const isOpen = content.classList.contains(this.openClass);

        // Close all other dropdowns first
        this.closeAllDropdowns();

        if (!isOpen) {
            button.classList.add(this.openClass);
            content.classList.add(this.openClass);
            button.setAttribute('aria-expanded', 'true');

            // Focus first option or search input
            const search = content.querySelector(this.searchSelector);
            if (search) {
                search.focus();
            } else {
                const firstOption = content.querySelector(this.optionSelector);
                if (firstOption) {
                    firstOption.focus();
                }
            }

            // Dispatch custom event
            dropdown.dispatchEvent(new CustomEvent('filter:open', { detail: { dropdown } }));
        }
    }

    /**
     * Close all open dropdowns
     */
    closeAllDropdowns() {
        document.querySelectorAll(this.dropdownSelector).forEach(dropdown => {
            const button = dropdown.querySelector(this.buttonSelector);
            const content = dropdown.querySelector(this.contentSelector);

            if (button && content) {
                button.classList.remove(this.openClass);
                content.classList.remove(this.openClass);
                button.setAttribute('aria-expanded', 'false');
            }
        });
    }

    /**
     * Initialize filter options (checkboxes)
     */
    initOptions() {
        document.querySelectorAll(this.optionSelector).forEach(option => {
            const checkbox = option.querySelector('input[type="checkbox"]');

            if (checkbox) {
                // Allow clicking anywhere on the option to toggle
                option.addEventListener('click', (e) => {
                    if (e.target !== checkbox) {
                        checkbox.checked = !checkbox.checked;
                        checkbox.dispatchEvent(new Event('change', { bubbles: true }));
                    }
                });

                // Handle checkbox change
                checkbox.addEventListener('change', () => {
                    this.handleSelectionChange(option.closest(this.dropdownSelector) || option.closest(this.panelSelector));
                });
            }
        });
    }

    /**
     * Handle selection change - update badge count
     */
    handleSelectionChange(container) {
        if (!container) return;

        const checkboxes = container.querySelectorAll(`${this.optionSelector} input[type="checkbox"]`);
        const checkedCount = Array.from(checkboxes).filter(cb => cb.checked).length;
        const badge = container.querySelector('.filter-button__badge');
        const button = container.querySelector(this.buttonSelector);

        if (badge) {
            badge.textContent = checkedCount;
            badge.style.display = checkedCount > 0 ? 'inline-flex' : 'none';
        }

        // Dispatch custom event
        container.dispatchEvent(new CustomEvent('filter:change', {
            detail: {
                count: checkedCount,
                selected: Array.from(checkboxes).filter(cb => cb.checked).map(cb => ({
                    value: cb.value,
                    label: cb.closest(this.optionSelector).querySelector('.filter-option__label')?.textContent
                }))
            }
        }));
    }

    /**
     * Initialize search functionality
     */
    initSearch() {
        document.querySelectorAll(this.searchSelector).forEach(searchInput => {
            searchInput.addEventListener('input', (e) => {
                this.filterOptions(searchInput, e.target.value);
            });

            // Clear search on escape
            searchInput.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    searchInput.value = '';
                    this.filterOptions(searchInput, '');
                }
            });
        });
    }

    /**
     * Filter options based on search query
     */
    filterOptions(searchInput, query) {
        const container = searchInput.closest(this.dropdownSelector) || searchInput.closest(this.panelSelector);
        if (!container) return;

        const options = container.querySelectorAll(this.optionSelector);
        const normalizedQuery = query.toLowerCase().trim();

        options.forEach(option => {
            const label = option.querySelector('.filter-option__label')?.textContent?.toLowerCase() || '';
            const matches = label.includes(normalizedQuery);
            option.style.display = matches ? '' : 'none';
        });

        // Dispatch custom event
        container.dispatchEvent(new CustomEvent('filter:search', {
            detail: { query, visibleCount: Array.from(options).filter(o => o.style.display !== 'none').length }
        }));
    }

    /**
     * Initialize show more/less functionality
     */
    initShowMore() {
        document.querySelectorAll(this.showMoreSelector).forEach(button => {
            const container = button.closest(this.dropdownSelector) || button.closest(this.panelSelector);
            const hiddenOptions = container?.querySelectorAll('.filter-option--hidden');

            if (hiddenOptions && hiddenOptions.length > 0) {
                button.addEventListener('click', () => {
                    const isExpanded = button.classList.contains(this.expandedClass);

                    hiddenOptions.forEach(option => {
                        option.style.display = isExpanded ? 'none' : '';
                    });

                    button.classList.toggle(this.expandedClass);

                    // Update button text
                    const textElement = button.querySelector('.filter-show-more__text');
                    if (textElement) {
                        const showText = textElement.dataset.showText || `Show ${hiddenOptions.length} more`;
                        const hideText = textElement.dataset.hideText || 'Show less';
                        textElement.textContent = isExpanded ? showText : hideText;
                    }
                });
            }
        });
    }

    /**
     * Initialize overlay panels
     */
    initOverlays() {
        document.querySelectorAll(this.overlaySelector).forEach(overlay => {
            overlay.addEventListener('click', () => {
                this.closeOverlayPanel();
            });
        });

        // Initialize close buttons in panels
        document.querySelectorAll('.filter-panel__close').forEach(closeBtn => {
            closeBtn.addEventListener('click', () => {
                this.closeOverlayPanel();
            });
        });
    }

    /**
     * Open overlay panel
     */
    openOverlayPanel(panelId) {
        const panel = document.getElementById(panelId);
        const overlay = document.querySelector(this.overlaySelector);

        if (panel) {
            panel.classList.add(this.openClass);
            document.body.style.overflow = 'hidden';
        }

        if (overlay) {
            overlay.classList.add(this.openClass);
        }
    }

    /**
     * Close overlay panel
     */
    closeOverlayPanel() {
        document.querySelectorAll(`${this.panelSelector}.${this.openClass}`).forEach(panel => {
            panel.classList.remove(this.openClass);
        });

        document.querySelectorAll(`${this.overlaySelector}.${this.openClass}`).forEach(overlay => {
            overlay.classList.remove(this.openClass);
        });

        document.body.style.overflow = '';
    }

    /**
     * Initialize click outside to close
     */
    initClickOutside() {
        document.addEventListener('click', (e) => {
            const isInsideDropdown = e.target.closest(this.dropdownSelector);
            const isInsidePanel = e.target.closest(this.panelSelector);

            if (!isInsideDropdown && !isInsidePanel) {
                this.closeAllDropdowns();
            }
        });
    }

    /**
     * Initialize keyboard navigation
     */
    initKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeAllDropdowns();
                this.closeOverlayPanel();
            }
        });

        // Arrow key navigation within options
        document.querySelectorAll(this.contentSelector).forEach(content => {
            content.addEventListener('keydown', (e) => {
                if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                    e.preventDefault();
                    const options = Array.from(content.querySelectorAll(`${this.optionSelector}:not([style*="display: none"])`));
                    const currentIndex = options.indexOf(document.activeElement?.closest(this.optionSelector));

                    let newIndex;
                    if (e.key === 'ArrowDown') {
                        newIndex = currentIndex < options.length - 1 ? currentIndex + 1 : 0;
                    } else {
                        newIndex = currentIndex > 0 ? currentIndex - 1 : options.length - 1;
                    }

                    const newOption = options[newIndex];
                    if (newOption) {
                        newOption.focus();
                        newOption.setAttribute('tabindex', '0');
                    }
                }
            });
        });
    }

    /**
     * Get selected values from a filter
     */
    getSelectedValues(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return [];

        const checkboxes = container.querySelectorAll(`${this.optionSelector} input[type="checkbox"]:checked`);
        return Array.from(checkboxes).map(cb => ({
            value: cb.value,
            label: cb.closest(this.optionSelector).querySelector('.filter-option__label')?.textContent
        }));
    }

    /**
     * Clear all selections in a filter
     */
    clearSelections(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const checkboxes = container.querySelectorAll(`${this.optionSelector} input[type="checkbox"]`);
        checkboxes.forEach(cb => {
            cb.checked = false;
        });

        this.handleSelectionChange(container);
    }

    /**
     * Set selections programmatically
     */
    setSelections(containerId, values) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const checkboxes = container.querySelectorAll(`${this.optionSelector} input[type="checkbox"]`);
        checkboxes.forEach(cb => {
            cb.checked = values.includes(cb.value);
        });

        this.handleSelectionChange(container);
    }

    /**
     * Initialize comprehensive demo with dynamic tags
     */
    initComprehensiveDemo() {
        // LTR Demo
        this.initComprehensiveDemoInstance('comprehensive-filter-ltr', 'comprehensive-tags-ltr');
        // RTL Demo
        this.initComprehensiveDemoInstance('comprehensive-filter-rtl', 'comprehensive-tags-rtl');
    }

    /**
     * Initialize a single comprehensive demo instance
     */
    initComprehensiveDemoInstance(filterId, tagsContainerId) {
        const filterDropdown = document.getElementById(filterId);
        const tagsContainer = document.getElementById(tagsContainerId);

        if (!filterDropdown || !tagsContainer) return;

        const checkboxes = filterDropdown.querySelectorAll('.filter-option input[type="checkbox"]');
        const badge = filterDropdown.querySelector('.filter-button__badge');
        const clearAllBtn = filterDropdown.querySelector('.comprehensive-clear-all');
        const applyBtn = filterDropdown.querySelector('.comprehensive-apply');
        const clearSectionBtns = filterDropdown.querySelectorAll('.comprehensive-clear-btn');

        // Update tags when checkbox changes
        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                this.updateComprehensiveTags(filterDropdown, tagsContainer, badge);
            });
        });

        // Clear all button
        if (clearAllBtn) {
            clearAllBtn.addEventListener('click', () => {
                checkboxes.forEach(cb => cb.checked = false);
                this.updateComprehensiveTags(filterDropdown, tagsContainer, badge);
            });
        }

        // Apply button - just close dropdown for demo
        if (applyBtn) {
            applyBtn.addEventListener('click', () => {
                this.closeAllDropdowns();
            });
        }

        // Section clear buttons
        clearSectionBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const section = btn.closest('.filter-section');
                if (section) {
                    section.querySelectorAll('.filter-option input[type="checkbox"]').forEach(cb => {
                        cb.checked = false;
                    });
                    this.updateComprehensiveTags(filterDropdown, tagsContainer, badge);
                }
            });
        });

        // Initialize tags on load
        this.updateComprehensiveTags(filterDropdown, tagsContainer, badge);
    }

    /**
     * Update tags display for comprehensive demo
     */
    updateComprehensiveTags(filterDropdown, tagsContainer, badge) {
        const checkboxes = filterDropdown.querySelectorAll('.filter-option input[type="checkbox"]:checked');
        const isRtl = filterDropdown.closest('[dir="rtl"]') !== null;

        // Clear existing tags
        tagsContainer.innerHTML = '';

        // Create tags for each checked item
        checkboxes.forEach(checkbox => {
            const label = checkbox.dataset.label || checkbox.value;
            const tag = document.createElement('span');
            tag.className = 'filter-tag';
            tag.innerHTML = `
                <span>${label}</span>
                <button class="filter-tag__remove" type="button" aria-label="${isRtl ? 'إزالة الفلتر' : 'Remove filter'}">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M18 6L6 18M6 6l12 12"/>
                    </svg>
                </button>
            `;

            // Remove tag on click
            tag.querySelector('.filter-tag__remove').addEventListener('click', () => {
                checkbox.checked = false;
                this.updateComprehensiveTags(filterDropdown, tagsContainer, badge);
            });

            tagsContainer.appendChild(tag);
        });

        // Update badge count
        if (badge) {
            const count = checkboxes.length;
            badge.textContent = count;
            badge.style.display = count > 0 ? 'inline-flex' : 'none';
        }
    }
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FilterManager;
}
