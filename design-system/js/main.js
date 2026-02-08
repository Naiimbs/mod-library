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

        // Initialize Card Manager
        if (typeof CardManager !== 'undefined') {
            this.register('cards', new CardManager());
        }

        // Initialize Tab Manager
        if (typeof TabManager !== 'undefined') {
            this.register('tabs', new TabManager());
        }

        // Initialize Pagination Manager
        if (typeof PaginationManager !== 'undefined') {
            this.register('pagination', new PaginationManager());
        }

        // Initialize Filter Manager
        if (typeof FilterManager !== 'undefined') {
            this.register('filters', new FilterManager());
        }

        // Initialize Text Input Manager
        if (typeof TextInputManager !== 'undefined') {
            this.register('textInput', new TextInputManager());
        }

        // Initialize demo interactions
        this.initDemoInteractions();

        this.initialized = true;
        console.log('DGA Design System initialized');
    }

    /**
     * Initialize demo-specific interactions
     */
    initDemoInteractions() {
        // Sidebar nav demo interactions
        this.initSidebarNavDemo();

        // Navigation header demo
        this.initNavigationHeaderDemo();
    }

    /**
     * Initialize sidebar navigation demo interactions
     */
    initSidebarNavDemo() {
        document.querySelectorAll('.sidebar-nav-demo .sidebar-nav-item').forEach(item => {
            item.addEventListener('click', function(e) {
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
     * Initialize navigation header demo interactions
     */
    initNavigationHeaderDemo() {
        const menuItems = document.querySelectorAll('.navigation-header .header-menu-item');
        const actionButtons = document.querySelectorAll('.navigation-header .header-action--outline');

        menuItems.forEach(item => {
            item.addEventListener('click', function(e) {
                e.preventDefault();
                menuItems.forEach(i => i.classList.remove('header-menu-item--selected'));
                this.classList.add('header-menu-item--selected');
            });
        });

        actionButtons.forEach(btn => {
            btn.addEventListener('click', function(e) {
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
document.addEventListener('DOMContentLoaded', function() {
    window.DGA.init();
});
