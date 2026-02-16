/* ============================================
   MAIN ENTRY POINT
   DGA Design System - Application Initialization
   ============================================ */

/**
 * DGADesignSystem - Main application class
 * Follows Open/Closed Principle: Open for extension, closed for modification
 */
class DGADesignSystem {
    constructor() {
        this.modules = new Map();
        this.initialized = false;
    }

    /**
     * Register a module with the design system
     * @param {string} name - Module name
     * @param {Object} module - Module instance
     */
    register(name, module) {
        this.modules.set(name, module);
        return this;
    }

    /**
     * Get a registered module
     * @param {string} name - Module name
     * @returns {Object|undefined} - Module instance
     */
    get(name) {
        return this.modules.get(name);
    }

    /**
     * Initialize the design system
     */
    init() {
        if (this.initialized) return;

        // Initialize Router
        if (typeof Router !== 'undefined') {
            this.register('router', new Router({
                defaultRoute: 'nav-header'
            }));
        }

        // Listen for dynamically loaded components to reinitialize JS
        document.addEventListener('component:loaded', (e) => {
            this.initComponentModules(e.detail.componentId);
        });

        // Initialize demo interactions for the shell (main app header)
        this.initNavigationHeaderDemo();

        this.initialized = true;
        console.log('DGA Design System initialized');
    }

    /**
     * Initialize JS modules relevant to the loaded component
     * Called each time a component's HTML is injected into the DOM
     * @param {string} componentId - The component that was loaded
     */
    initComponentModules(componentId) {
        // Cards
        if (componentId === 'cards' && typeof CardManager !== 'undefined') {
            this.register('cards', new CardManager());
        }

        // Tabs
        if (componentId === 'tabs' && typeof TabManager !== 'undefined') {
            this.register('tabs', new TabManager());
        }

        // Pagination
        if (componentId === 'pagination' && typeof PaginationManager !== 'undefined') {
            this.register('pagination', new PaginationManager());
        }

        // Filters
        if (componentId === 'filters' && typeof FilterManager !== 'undefined') {
            this.register('filters', new FilterManager());
        }

        // Text Input
        if (componentId === 'text-input' && typeof TextInputManager !== 'undefined') {
            this.register('textInput', new TextInputManager());
        }

        // Icons Showcase
        if (componentId === 'icons' && typeof IconsShowcase !== 'undefined') {
            this.register('icons', new IconsShowcase());
        }

        // Digital Stamp (uses its own init function)
        if (componentId === 'digital-stamp' && typeof initDigitalStamps !== 'undefined') {
            initDigitalStamps();
        }

        // Sidebar nav demo (for the sidebar component preview)
        if (componentId === 'sidebar') {
            this.initSidebarNavDemo();
        }

        // Nav header demo (for the nav-header component preview)
        if (componentId === 'nav-header') {
            this.initNavHeaderPreviewDemo();
        }
    }

    /**
     * Initialize sidebar navigation demo interactions
     * (for the sidebar component preview, not the main app sidebar)
     */
    initSidebarNavDemo() {
        document.querySelectorAll('.sidebar-nav-demo .sidebar-nav-item').forEach(item => {
            item.addEventListener('click', function (e) {
                e.preventDefault();
                const parent = this.closest('.sidebar-nav-demo');
                if (parent) {
                    parent.querySelectorAll('.sidebar-nav-item').forEach(i =>
                        i.classList.remove('active')
                    );
                }
                this.classList.add('active');
            });
        });
    }

    /**
     * Initialize navigation header preview demo interactions
     * (for the nav-header component preview inside content area)
     */
    initNavHeaderPreviewDemo() {
        const previewContainer = document.getElementById('component-content');
        if (!previewContainer) return;

        const menuItems = previewContainer.querySelectorAll('.navigation-header .header-menu-item');
        const actionButtons = previewContainer.querySelectorAll('.navigation-header .header-action--outline');

        menuItems.forEach(item => {
            item.addEventListener('click', function (e) {
                e.preventDefault();
                const parent = this.closest('.navigation-header');
                if (parent) {
                    parent.querySelectorAll('.header-menu-item').forEach(i =>
                        i.classList.remove('header-menu-item--selected')
                    );
                }
                this.classList.add('header-menu-item--selected');
            });
        });

        actionButtons.forEach(btn => {
            btn.addEventListener('click', function (e) {
                e.preventDefault();
                const parent = this.closest('.navigation-header');
                if (parent) {
                    parent.querySelectorAll('.header-action--outline').forEach(b =>
                        b.classList.remove('header-action--selected')
                    );
                }
                this.classList.add('header-action--selected');
            });
        });
    }

    /**
     * Initialize main navigation header demo interactions
     * (the actual app header — always present in the shell)
     */
    initNavigationHeaderDemo() {
        const header = document.querySelector('.layout > .navigation-header');
        if (!header) return;

        const menuItems = header.querySelectorAll('.header-menu-item');
        const actionButtons = header.querySelectorAll('.header-action--outline');

        menuItems.forEach(item => {
            item.addEventListener('click', function (e) {
                const href = this.getAttribute('href');
                // Allow hash navigation for real destinations
                if (href && href.length > 1 && href.startsWith('#')) {
                    // Let the browser follow the link; router handles the rest
                } else {
                    e.preventDefault();
                }
                menuItems.forEach(i => i.classList.remove('header-menu-item--selected'));
                this.classList.add('header-menu-item--selected');
            });
        });

        actionButtons.forEach(btn => {
            btn.addEventListener('click', function (e) {
                e.preventDefault();
                actionButtons.forEach(b => b.classList.remove('header-action--selected'));
                this.classList.add('header-action--selected');
            });
        });
    }
}

// Create global instance
window.DGA = new DGADesignSystem();

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', function () {
    window.DGA.init();
});
