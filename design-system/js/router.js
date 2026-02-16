/* ============================================
   ROUTER MODULE
   DGA Design System - Sidebar Navigation Router
   Handles routing between component sections
   with dynamic HTML loading
   ============================================ */

/**
 * Router class for handling component navigation
 * Dynamically loads component HTML partials via fetch()
 */
class Router {
    constructor(config = {}) {
        this.sidebarSelector = config.sidebarSelector || '.sidebar-link';
        this.contentContainerId = config.contentContainerId || 'component-content';
        this.mainNavSelector = config.mainNavSelector || '.main-nav-link';
        this.defaultRoute = config.defaultRoute || 'nav-header';
        this.activeClass = config.activeClass || 'active';
        this.componentsBasePath = config.componentsBasePath || 'components';

        // Cache for loaded component HTML
        this.cache = new Map();

        this.init();
    }

    /**
     * Initialize the router
     */
    init() {
        this.contentContainer = document.getElementById(this.contentContainerId);
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

        // Full-page views that hide the sidebar
        const fullPageViews = ['icons'];
        const isFullPage = fullPageViews.includes(hash);

        const mainContent = document.querySelector('.main-content');
        if (mainContent) {
            mainContent.classList.toggle('main-content--no-sidebar', isFullPage);
        }

        this.updateSidebarLinks(hash);
        this.updateMainNav(hash);
        this.loadComponent(hash);
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
     * Load component HTML dynamically
     * @param {string} componentId - Component ID to load
     */
    async loadComponent(componentId) {
        if (!this.contentContainer) return;

        // Check cache first
        if (this.cache.has(componentId)) {
            this.contentContainer.innerHTML = this.cache.get(componentId);
            this.onComponentLoaded(componentId);
            return;
        }

        // Build the path: components/{id}/{id}.html
        const url = `${this.componentsBasePath}/${componentId}/${componentId}.html`;

        try {
            const response = await fetch(url);
            if (!response.ok) {
                this.contentContainer.innerHTML = `
                    <div class="content-header">
                        <h1 class="content-title">${componentId}</h1>
                        <p class="content-description">Component not found.</p>
                    </div>`;
                return;
            }

            const html = await response.text();

            // Cache the result
            this.cache.set(componentId, html);

            // Inject into container
            this.contentContainer.innerHTML = html;
            this.onComponentLoaded(componentId);
        } catch (error) {
            console.error(`Failed to load component: ${componentId}`, error);
            this.contentContainer.innerHTML = `
                <div class="content-header">
                    <h1 class="content-title">${componentId}</h1>
                    <p class="content-description">Failed to load component.</p>
                </div>`;
        }
    }

    /**
     * Called after component HTML is injected into the DOM
     * Dispatches a custom event so JS modules can re-initialize
     * @param {string} componentId - The loaded component ID
     */
    onComponentLoaded(componentId) {
        window.scrollTo(0, 0);

        // Dispatch event for other modules to reinitialize
        document.dispatchEvent(new CustomEvent('component:loaded', {
            detail: { componentId }
        }));
    }

    /**
     * Update main navigation active states
     * Maps hashes to their parent top-level tab
     * @param {string} activeHash - Current active hash
     */
    updateMainNav(activeHash) {
        // Determine which top-level tab should be active
        const topLevelTabs = ['icons', 'screens'];
        const activeTab = topLevelTabs.includes(activeHash) ? activeHash : 'components';

        document.querySelectorAll(this.mainNavSelector).forEach(link => {
            const text = link.querySelector('.header-menu-item__text');
            if (!text) return;

            const tabName = text.textContent.trim().toLowerCase();
            let isActive = false;

            if (activeTab === 'icons') {
                isActive = tabName === 'icons';
            } else if (activeTab === 'screens') {
                isActive = tabName === 'screen templates';
            } else {
                isActive = tabName === 'components';
            }

            link.classList.toggle(this.activeClass, isActive);
            link.classList.toggle('header-menu-item--selected', isActive);
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
