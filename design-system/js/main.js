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
                defaultRoute: 'components-overview'
            }));
        }

        // Initialize global context menu inspector for .btn elements
        if (typeof ContextMenuManager !== 'undefined') {
            this._contextMenu = new ContextMenuManager();
            this._contextMenu.attachGlobal('#component-content');
        }

        // Listen for dynamically loaded components to reinitialize JS
        document.addEventListener('component:loaded', (e) => {
            this.initComponentModules(e.detail.componentId);
            this.buildTableOfContents();
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
            if (typeof CardDemoManager !== 'undefined') {
                this.register('cardsDemo', new CardDemoManager());
            }
        }

        // Tabs
        if (componentId === 'tabs') {
            if (typeof TabsDemoManager !== 'undefined') {
                this.register('tabsDemo', new TabsDemoManager());
            }
            if (typeof TabManager !== 'undefined') {
                this.register('tabs', new TabManager());
            }
        }

        // Pagination
        if (componentId === 'pagination') {
            if (typeof PaginationManager !== 'undefined') {
                this.register('pagination', new PaginationManager());
            }
            if (typeof PaginationDemoManager !== 'undefined') {
                this.register('paginationDemo', new PaginationDemoManager());
            }
        }

        // Filters
        if (componentId === 'filters' && typeof FilterManager !== 'undefined') {
            this.register('filters', new FilterManager());
        }

        // Text Input
        if (componentId === 'text-input' && typeof TextInputDemoManager !== 'undefined') {
            this.register('textInput', new TextInputDemoManager());
        }

        // Icons Showcase
        if (componentId === 'icons' && typeof IconsShowcase !== 'undefined') {
            this.register('icons', new IconsShowcase());
        }

        // Digital Stamp (uses its own init function for static showcase
        // stamps, plus a demo manager for the interactive live demo)
        if (componentId === 'digital-stamp' && typeof initDigitalStamps !== 'undefined') {
            initDigitalStamps();
            if (typeof DigitalStampDemoManager !== 'undefined') {
                this.register('digitalStampDemo', new DigitalStampDemoManager());
            }
        }

        // Sidebar nav demo (for the sidebar component preview)
        if (componentId === 'sidebar') {
            this.initSidebarNavDemo();
        }

        // Date Picker
        if (componentId === 'date-picker' && typeof DatePickerManager !== 'undefined') {
            this.register('datePicker', new DatePickerManager());
        }

        // Components Overview
        if (componentId === 'components-overview' && typeof ComponentsOverviewManager !== 'undefined') {
            this.register('componentsOverview', new ComponentsOverviewManager());
        }

        // Nav header — selection + sub-menu dropdowns + live demo
        if (componentId === 'nav-header') {
            if (typeof NavHeaderManager !== 'undefined') {
                this.register('navHeader', new NavHeaderManager());
            } else {
                this.initNavHeaderPreviewDemo();
            }
            if (typeof NavHeaderDemoManager !== 'undefined') {
                this.register('navHeaderDemo', new NavHeaderDemoManager());
            }
        }

        // Nav Drawer
        if (componentId === 'nav-drawer' && typeof NavDrawerManager !== 'undefined') {
            this.register('navDrawer', new NavDrawerManager());
        }

        // Buttons
        if (componentId === 'buttons' && typeof ButtonDemoManager !== 'undefined') {
            this.register('buttons', new ButtonDemoManager());
        }

        // Chips
        if (componentId === 'chips' && typeof ChipDemoManager !== 'undefined') {
            this.register('chips', new ChipDemoManager());
        }

        // Tags
        if (componentId === 'tags' && typeof TagDemoManager !== 'undefined') {
            this.register('tags', new TagDemoManager());
        }

        // Status Tag
        if (componentId === 'status-tag' && typeof StatusTagDemoManager !== 'undefined') {
            this.register('statusTag', new StatusTagDemoManager());
        }

        // Tables
        if (componentId === 'tables' && typeof TableDemoManager !== 'undefined') {
            this.register('tables', new TableDemoManager());
        }

        // Modal
        if (componentId === 'modal') {
            if (typeof ModalManager !== 'undefined') {
                this.register('modal', new ModalManager());
            }
            if (typeof ModalDemoManager !== 'undefined') {
                this.register('modalDemo', new ModalDemoManager());
            }
        }

        // Menus
        if (componentId === 'menus') {
            if (typeof MenuManager !== 'undefined') {
                this.register('menu', new MenuManager());
            }
            if (typeof MenuDemoManager !== 'undefined') {
                this.register('menuDemo', new MenuDemoManager());
            }
        }

        // Breadcrumbs
        if (componentId === 'breadcrumbs') {
            if (typeof BreadcrumbManager !== 'undefined') {
                this.register('breadcrumb', new BreadcrumbManager());
            }
            if (typeof BreadcrumbDemoManager !== 'undefined') {
                this.register('breadcrumbDemo', new BreadcrumbDemoManager());
            }
        }

        // Slideout Menu
        if (componentId === 'slideout-menu') {
            if (typeof SlideoutManager !== 'undefined') {
                this.register('slideout', new SlideoutManager());
            }
            if (typeof SlideoutDemoManager !== 'undefined') {
                this.register('slideoutDemo', new SlideoutDemoManager());
            }
        }

        // File Upload
        if (componentId === 'file-upload') {
            if (typeof FileUploadManager !== 'undefined') {
                this.register('fileUpload', new FileUploadManager());
            }
            if (typeof FileUploadDemoManager !== 'undefined') {
                this.register('fileUploadDemo', new FileUploadDemoManager());
            }
        }

        // Progress Indicator
        if (componentId === 'progress-indicator' && typeof ProgressIndicatorDemoManager !== 'undefined') {
            this.register('progressIndicator', new ProgressIndicatorDemoManager());
        }

        // Textarea
        if (componentId === 'textarea' && typeof TextareaDemoManager !== 'undefined') {
            this.register('textarea', new TextareaDemoManager());
        }

        // Radio Button
        if (componentId === 'radio' && typeof RadioDemoManager !== 'undefined') {
            this.register('radio', new RadioDemoManager());
        }

        // Checkbox
        if (componentId === 'checkbox' && typeof CheckboxDemoManager !== 'undefined') {
            this.register('checkbox', new CheckboxDemoManager());
        }

        // Notification
        if (componentId === 'notification' && typeof NotificationDemoManager !== 'undefined') {
            this.register('notification', new NotificationDemoManager());
        }

        // Notification Toast
        if (componentId === 'notification-toast' && typeof NotificationToastDemoManager !== 'undefined') {
            this.register('notificationToast', new NotificationToastDemoManager());
        }

        // Second Nav Header
        if (componentId === 'second-nav-header' && typeof SecondNavHeaderDemoManager !== 'undefined') {
            this.register('secondNavHeader', new SecondNavHeaderDemoManager());
        }

        // Footer
        if (componentId === 'footer' && typeof FooterDemoManager !== 'undefined') {
            this.register('footer', new FooterDemoManager());
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
    /**
     * Build sticky table of contents from page sections with scroll spy
     */
    buildTableOfContents() {
        const toc = document.getElementById('content-toc');
        const content = document.getElementById('component-content');
        if (!toc || !content) return;

        // Cleanup previous observer
        if (this._tocObserver) {
            this._tocObserver.disconnect();
            this._tocObserver = null;
        }

        // Collect sections: live-demo headings and showcase-section headings
        const sections = [];

        // Live demo heading
        const liveDemoHeading = content.querySelector('h2.live-demo__heading');
        if (liveDemoHeading) {
            const liveDemoParent = liveDemoHeading.closest('.live-demo');
            if (liveDemoParent) {
                liveDemoParent.id = 'section-live-demo';
                sections.push({ id: 'section-live-demo', label: 'Live demo' });
            }
        }

        // Showcase sections (Props, Horizontal Layout, etc.)
        content.querySelectorAll('.showcase-section').forEach(section => {
            const heading = section.querySelector('.showcase-header h2, .showcase-header .showcase-title');
            if (heading) {
                const text = heading.textContent.trim();
                const slug = 'section-' + text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-$/, '');
                section.id = slug;
                sections.push({ id: slug, label: text });
            }
        });

        // Empty state — hide TOC
        if (sections.length === 0) {
            toc.innerHTML = '';
            return;
        }

        // Build TOC HTML
        const links = sections.map(s =>
            `<li><a class="content-toc__item" href="#${s.id}" data-toc-target="${s.id}">${s.label}</a></li>`
        ).join('');

        toc.innerHTML = `
            <p class="content-toc__title">On this page</p>
            <ul class="content-toc__list">${links}</ul>
        `;

        // Smooth scroll on click
        toc.querySelectorAll('.content-toc__item').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.getElementById(link.dataset.tocTarget);
                if (target) {
                    const top = target.getBoundingClientRect().top + window.scrollY - 96;
                    window.scrollTo({ top, behavior: 'smooth' });
                }
            });
        });

        // Scroll spy with IntersectionObserver
        const tocLinks = toc.querySelectorAll('.content-toc__item');

        const setActive = (id) => {
            tocLinks.forEach(link => {
                link.classList.toggle('content-toc__item--active', link.dataset.tocTarget === id);
            });
        };

        this._tocObserver = new IntersectionObserver((entries) => {
            for (const entry of entries) {
                if (entry.isIntersecting) {
                    setActive(entry.target.id);
                }
            }
        }, {
            rootMargin: '-96px 0px -60% 0px'
        });

        sections.forEach(s => {
            const el = document.getElementById(s.id);
            if (el) this._tocObserver.observe(el);
        });
    }

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
