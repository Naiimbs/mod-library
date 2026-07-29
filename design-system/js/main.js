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
        this.initLanguageToggle();
        this.initThemeToggle();
        this.initMobileMenu();

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
        if (componentId === 'icons' && typeof LibraryIconsShowcase !== 'undefined') {
            this.register('libraryIcons', new LibraryIconsShowcase());
        }
        if (componentId === 'service-page' && typeof ServicePageManager !== 'undefined') {
            this.register('servicePage', new ServicePageManager());
        }

        // Token docs — Classes (utility classes) + Styles (CSS variables)
        if (componentId === 'classes' && typeof TokenClassesPage !== 'undefined') {
            this.register('classesPage', new TokenClassesPage());
        }
        if (componentId === 'styles' && typeof TokenStylesPage !== 'undefined') {
            this.register('stylesPage', new TokenStylesPage());
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

        // Inline Alert
        if (componentId === 'inline-alert' && typeof InlineAlertDemoManager !== 'undefined') {
            this.register('inlineAlert', new InlineAlertDemoManager());
        }

        // Avatar
        if (componentId === 'avatar' && typeof AvatarDemoManager !== 'undefined') {
            this.register('avatar', new AvatarDemoManager());
        }

        // Progress Bar (linear + circular)
        if (componentId === 'progress-bar' && typeof ProgressBarDemoManager !== 'undefined') {
            this.register('progressBar', new ProgressBarDemoManager());
        }

        // Accordion
        if (componentId === 'accordion' && typeof AccordionManager !== 'undefined') {
            this.register('accordion', new AccordionManager());
        }

        // Dropdown
        if (componentId === 'dropdown' && typeof DropdownManager !== 'undefined') {
            this.register('dropdown', new DropdownManager());
        }

        // Search Box
        if (componentId === 'search-box' && typeof SearchBoxManager !== 'undefined') {
            this.register('searchBox', new SearchBoxManager());
        }

        // Rating
        if (componentId === 'rating' && typeof RatingManager !== 'undefined') {
            this.register('rating', new RatingManager());
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

        // Cleanup previous observer / scroll spy
        if (this._tocObserver) {
            this._tocObserver.disconnect();
            this._tocObserver = null;
        }
        if (this._tocSpy) {
            window.removeEventListener('scroll', this._tocSpy);
            this._tocSpy = null;
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

        // Scroll spy: the active section is the last one whose top has
        // crossed a line just below the header (robust for short sections
        // and the page bottom, unlike per-section intersection callbacks).
        const tocLinks = toc.querySelectorAll('.content-toc__item');

        const setActive = (id) => {
            tocLinks.forEach(link => {
                link.classList.toggle('content-toc__item--active', link.dataset.tocTarget === id);
            });
        };

        let ticking = false;
        this._tocSpy = () => {
            if (ticking) return;
            ticking = true;
            requestAnimationFrame(() => {
                ticking = false;
                const els = sections.map(s => document.getElementById(s.id)).filter(Boolean);
                if (!els.length) return;
                const atBottom = window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2;
                let current = els[0];
                if (atBottom) {
                    current = els[els.length - 1];
                } else {
                    for (const el of els) {
                        if (el.getBoundingClientRect().top <= 140) current = el;
                    }
                }
                setActive(current.id);
            });
        };
        window.addEventListener('scroll', this._tocSpy, { passive: true });
        this._tocSpy();
    }

    /**
     * Global language / direction toggle (the عربي button in the header).
     * Switches the whole app between English (LTR) and Arabic (RTL),
     * translates the platform navigation labels, and remembers the choice.
     */
    initLanguageToggle() {
        const toggle = document.querySelector('.layout > .navigation-header .lang-toggle');
        if (!toggle) return;
        const label = toggle.querySelector('span');

        const dict = {
            en: {
                logo: 'Platform Logo', home: 'Home', styles: 'Styles', classes: 'Classes',
                components: 'Components', screens: 'Screen Templates', icons: 'Icons',
                aboutTeam: 'About Team', search: 'Search', themeToggle: 'Toggle dark mode',
            },
            ar: {
                logo: 'شعار المنصة', home: 'الرئيسية', styles: 'الأنماط', classes: 'الفئات',
                components: 'المكونات', screens: 'قوالب الشاشات', icons: 'الأيقونات',
                aboutTeam: 'عن الفريق', search: 'بحث', themeToggle: 'تبديل الوضع الداكن',
            },
        };

        const apply = (isArabic) => {
            document.documentElement.setAttribute('dir', isArabic ? 'rtl' : 'ltr');
            document.documentElement.setAttribute('lang', isArabic ? 'ar' : 'en');
            if (label) label.textContent = isArabic ? 'English' : 'عربي';
            const t = dict[isArabic ? 'ar' : 'en'];
            document.querySelectorAll('.layout > .navigation-header [data-i18n]').forEach(el => {
                const key = el.dataset.i18n;
                if (t[key]) el.textContent = t[key];
            });
            document.querySelectorAll('.layout > .navigation-header [data-i18n-aria]').forEach(el => {
                const key = el.dataset.i18nAria;
                if (t[key]) el.setAttribute('aria-label', t[key]);
            });
        };

        this._isArabic = false;
        try { this._isArabic = localStorage.getItem('dga-lang') === 'ar'; } catch (_) { /* private mode */ }
        apply(this._isArabic);

        toggle.addEventListener('click', (e) => {
            e.preventDefault();
            this._isArabic = !this._isArabic;
            apply(this._isArabic);
            try { localStorage.setItem('dga-lang', this._isArabic ? 'ar' : 'en'); } catch (_) { /* private mode */ }
        });
    }
    /**
     * Light / dark theme toggle. The saved choice is applied by an inline
     * head script before styles load; this wires the header button and
     * exposes toggleTheme() for the mobile panel's cloned action.
     */
    initThemeToggle() {
        const btn = document.querySelector('.layout > .navigation-header .theme-toggle');

        this.toggleTheme = () => {
            const dark = document.documentElement.getAttribute('data-theme') !== 'dark';
            if (dark) {
                document.documentElement.setAttribute('data-theme', 'dark');
            } else {
                document.documentElement.removeAttribute('data-theme');
            }
            try { localStorage.setItem('dga-theme', dark ? 'dark' : 'light'); } catch (_) { /* private mode */ }
        };

        btn?.addEventListener('click', (e) => {
            e.preventDefault();
            this.toggleTheme();
        });
    }


    /**
     * Hamburger for the platform header (NDS dga-header responsive
     * behavior): below 900px the desktop menu hides and this button opens
     * a full-width panel mirroring the menu plus the outline actions.
     */
    initMobileMenu() {
        const btn = document.getElementById('header-menu-btn');
        const panel = document.getElementById('header-mobile-menu');
        const header = document.querySelector('.layout > .navigation-header');
        if (!btn || !panel || !header) return;

        const rebuild = () => {
            const menu = header.querySelector('.navigation-menu');
            // scope to the desktop actions area — the panel's own clones also
            // live inside the header and must not be re-cloned
            const actions = [...header.querySelectorAll('.navigation-header__right .header-action--outline')];
            panel.innerHTML = menu ? menu.innerHTML : '';
            if (actions.length) {
                const row = document.createElement('div');
                row.className = 'header-mobile-menu__actions';
                actions.forEach(a => row.appendChild(a.cloneNode(true)));
                panel.appendChild(row);
            }
        };

        const close = () => {
            panel.classList.remove('is-open');
            btn.setAttribute('aria-expanded', 'false');
        };

        btn.addEventListener('click', () => {
            const open = !panel.classList.contains('is-open');
            if (open) rebuild();
            panel.classList.toggle('is-open', open);
            btn.setAttribute('aria-expanded', String(open));
        });

        // navigating from the panel closes it (the cloned items keep their
        // hash hrefs, so the router picks the navigation up as usual) and
        // moves the selected state on the desktop menu to match
        panel.addEventListener('click', (e) => {
            const themeBtn = e.target.closest('.theme-toggle');
            if (themeBtn) {
                e.preventDefault();
                this.toggleTheme();
                return;
            }
            const item = e.target.closest('.header-menu-item');
            if (!item) return;
            const href = item.getAttribute('href');
            header.querySelectorAll('.navigation-menu .header-menu-item').forEach(d => {
                d.classList.toggle('header-menu-item--selected', d.getAttribute('href') === href);
            });
            close();
        });

        document.addEventListener('click', (e) => {
            if (!header.contains(e.target)) close();
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') close();
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
