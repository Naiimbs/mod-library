/* ============================================
   ROUTER MODULE
   DGA Design System - Sidebar Navigation Router
   Handles routing between component sections
   ============================================ */

/**
 * Router class for handling component navigation
 * Single Responsibility: Only handles routing logic
 */
class Router {
    constructor(config = {}) {
        this.sidebarSelector = config.sidebarSelector || '.sidebar-link';
        this.sectionSelector = config.sectionSelector || '.component-section';
        this.mainNavSelector = config.mainNavSelector || '.main-nav-link';
        this.defaultRoute = config.defaultRoute || 'nav-header';
        this.activeClass = config.activeClass || 'active';

        this.init();
    }

    /**
     * Initialize the router
     */
    init() {
        this.bindEvents();
        this.handleRouting();
    }

    /**
     * Bind event listeners
     */
    bindEvents() {
        // Sidebar link clicks
        document.querySelectorAll(this.sidebarSelector).forEach(link => {
            link.addEventListener('click', (e) => this.handleLinkClick(e));
        });

        // Listen for URL hash changes
        window.addEventListener('hashchange', () => this.handleRouting());
    }

    /**
     * Handle sidebar link clicks
     * @param {Event} e - Click event
     */
    handleLinkClick(e) {
        e.preventDefault();
        const componentId = e.currentTarget.getAttribute('data-component');
        if (componentId) {
            window.location.hash = componentId;
        }
    }

    /**
     * Handle routing based on URL hash
     */
    handleRouting() {
        const hash = window.location.hash.slice(1) || this.defaultRoute;

        this.updateSidebarLinks(hash);
        this.updateSections(hash);
        this.updateMainNav(hash);
    }

    /**
     * Update sidebar link active states
     * @param {string} activeHash - Current active hash
     */
    updateSidebarLinks(activeHash) {
        document.querySelectorAll(this.sidebarSelector).forEach(link => {
            const component = link.getAttribute('data-component');
            link.classList.toggle(this.activeClass, component === activeHash);
        });
    }

    /**
     * Update visible content section
     * @param {string} activeHash - Current active hash
     */
    updateSections(activeHash) {
        document.querySelectorAll(this.sectionSelector).forEach(section => {
            const isActive = section.id === activeHash;
            section.classList.toggle(this.activeClass, isActive);

            if (isActive) {
                window.scrollTo(0, 0);
            }
        });
    }

    /**
     * Update main navigation active states
     * @param {string} activeHash - Current active hash
     */
    updateMainNav(activeHash) {
        document.querySelectorAll(this.mainNavSelector).forEach(link => {
            const href = link.getAttribute('href');
            if (href && href.startsWith('#')) {
                link.classList.toggle(this.activeClass, href === '#' + activeHash);
            }
        });
    }

    /**
     * Navigate to a specific component
     * @param {string} componentId - Component ID to navigate to
     */
    navigateTo(componentId) {
        window.location.hash = componentId;
    }
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Router;
}
