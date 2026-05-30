/* ============================================
   NAV HEADER COMPONENT MODULE
   DGA Design System - Navigation Header
   - NavHeaderManager: menu-item selection + sub-menu dropdown behavior
   - NavHeaderDemoManager: live demo (RTL / full-width / breakpoint)
   ============================================ */

class NavHeaderManager {
    constructor(scope) {
        // Scope to the component-content area so we don't touch the app shell.
        this.scope = scope || document.getElementById('component-content') || document;
        this.bind();
    }

    bind() {
        // Sub-menu dropdown toggles
        this.scope.querySelectorAll('.header-menu-item[data-submenu]').forEach(item => {
            if (item.dataset.navBound) return;
            item.dataset.navBound = 'true';
            const panelId = item.getAttribute('data-submenu');
            const panel = document.getElementById(panelId);
            item.setAttribute('aria-haspopup', 'true');
            item.setAttribute('aria-expanded', 'false');

            item.addEventListener('click', (e) => {
                // Ignore clicks that originate inside the open panel (let the
                // sub-menu links work and don't re-toggle).
                if (e.target.closest('.header-sub-menu')) return;
                e.preventDefault();
                const isOpen = panel && panel.classList.contains('is-open');
                this.closeAll();
                if (panel && !isOpen) {
                    panel.classList.add('is-open');
                    item.setAttribute('aria-expanded', 'true');
                }
            });
        });

        // Plain menu-item selection (items without a sub-menu)
        this.scope.querySelectorAll('.navigation-header .header-menu-item:not([data-submenu])').forEach(item => {
            if (item.dataset.navSelBound) return;
            item.dataset.navSelBound = 'true';
            item.addEventListener('click', (e) => {
                e.preventDefault();
                if (item.classList.contains('header-menu-item--disabled')) return;
                const header = item.closest('.navigation-header');
                if (header) header.querySelectorAll('.header-menu-item').forEach(i => i.classList.remove('header-menu-item--selected'));
                item.classList.add('header-menu-item--selected');
            });
        });

        // Close dropdowns on outside click / ESC (bind once)
        if (!NavHeaderManager._globalBound) {
            NavHeaderManager._globalBound = true;
            document.addEventListener('click', (e) => {
                if (!e.target.closest('.header-menu-item[data-submenu]') && !e.target.closest('.header-sub-menu')) {
                    document.querySelectorAll('.header-sub-menu.is-open').forEach(p => p.classList.remove('is-open'));
                    document.querySelectorAll('.header-menu-item[aria-expanded="true"]').forEach(i => i.setAttribute('aria-expanded', 'false'));
                }
            });
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    document.querySelectorAll('.header-sub-menu.is-open').forEach(p => p.classList.remove('is-open'));
                    document.querySelectorAll('.header-menu-item[aria-expanded="true"]').forEach(i => i.setAttribute('aria-expanded', 'false'));
                }
            });
        }
    }

    closeAll() {
        document.querySelectorAll('.header-sub-menu.is-open').forEach(p => p.classList.remove('is-open'));
        this.scope.querySelectorAll('.header-menu-item[aria-expanded="true"]').forEach(i => i.setAttribute('aria-expanded', 'false'));
    }
}

/* ============================================
   NAV HEADER DEMO MANAGER
   Re-renders the live preview header for the RTL / full-width / breakpoint
   controls.
   ============================================ */

class NavHeaderDemoManager {
    constructor() {
        this.preview = document.getElementById('nav-header-demo-preview');
        this.breakpointSelect = document.getElementById('nav-header-demo-breakpoint');
        if (!this.preview) return;

        this.labels = {
            en: { logo: 'Platform Logo', links: ['Home', 'Services', 'Screens', 'Reports', 'Settings'], action: 'Action' },
            ar: { logo: 'شعار المنصة', links: ['الرئيسية', 'الخدمات', 'التدريب', 'المقالات', 'الإعدادات'], action: 'إجراء' },
        };

        this.toggles = {};
        this.initSwitches();
        if (this.breakpointSelect) this.breakpointSelect.addEventListener('change', () => this.render());
        this.render();
    }

    initSwitches() {
        document.querySelectorAll('.live-demo__switch[data-toggle]').forEach(btn => {
            const key = btn.dataset.toggle;
            this.toggles[key] = btn.getAttribute('aria-checked') === 'true';
            btn.addEventListener('click', () => {
                this.toggles[key] = !this.toggles[key];
                btn.classList.toggle('active', this.toggles[key]);
                btn.setAttribute('aria-checked', String(this.toggles[key]));
                this.render();
            });
        });
    }

    logoSVG() {
        return '<svg class="logo-placeholder__icon" width="40" height="40" viewBox="0 0 48 48" fill="none"><rect width="48" height="48" rx="4" fill="#F5F5F5"/><path d="M24 8C22.9 8 22 9.12 22 10.5V18L18 17.3C17.3 17.2 16.6 17.7 16.5 18.4C16.4 19.1 16.9 19.7 17.6 19.8L22 20.5V23L17 25.5C16.4 25.8 16.2 26.5 16.5 27.1C16.8 27.7 17.5 27.9 18.1 27.6L22 25.6V29L17 34C16.6 34.4 16.6 35 17 35.4C17.4 35.8 18 35.8 18.4 35.4L22 31.8V38C22 39.1 22.9 40 24 40C25.1 40 26 39.1 26 38V31.8L29.6 35.4C30 35.8 30.6 35.8 31 35.4C31.4 35 31.4 34.4 31 34L26 29V25.6L29.9 27.6C30.5 27.9 31.2 27.7 31.5 27.1C31.8 26.5 31.6 25.8 31 25.5L26 23V20.5L30.4 19.8C31.1 19.7 31.6 19.1 31.5 18.4C31.4 17.7 30.7 17.2 30 17.3L26 18V10.5C26 9.12 25.1 8 24 8Z" fill="#9DA4AE"/></svg>';
    }

    arrowSVG() {
        return '<svg class="header-menu-item__arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9L12 15L18 9"/></svg>';
    }

    actionIconSVG() {
        return '<svg class="header-action__icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 12H15"/><path d="M12 9L15 12L12 15"/></svg>';
    }

    render() {
        const bp = this.breakpointSelect ? this.breakpointSelect.value : 'desktop';
        const isRTL = !!this.toggles['rtl'];
        const fullWidth = !!this.toggles['fullwidth'];
        const t = isRTL ? this.labels.ar : this.labels.en;

        const logo = `<div class="logo-placeholder">${this.logoSVG()}<span class="logo-placeholder__text">${t.logo}</span></div>`;

        let inner;
        if (bp === 'mobile') {
            // <600: logo + hamburger
            inner = `<div class="navigation-header__left">${logo}</div>
<div class="navigation-header__right">
    <button type="button" class="header-menu-toggle" aria-label="Menu"><span class="dga-icon-menu-01" aria-hidden="true">≡</span></button>
</div>`;
        } else {
            const links = t.links.map((label, i) =>
                `<a href="#" class="header-menu-item${i === 0 ? ' header-menu-item--selected' : ''}" role="menuitem"><span class="header-menu-item__text">${label}</span>${this.arrowSVG()}</a>`
            ).join('');
            const menu = bp === 'tablet'
                ? ''  // 600-960: links collapse
                : `<nav class="navigation-menu" role="menubar">${links}</nav>`;
            const actions = `<div class="navigation-header__right">
    <a href="#" class="header-action header-action--outline">${this.actionIconSVG()}<span>${t.action}</span></a>
    <a href="#" class="header-action header-action--outline">${this.actionIconSVG()}<span>${t.action}</span></a>
    <a href="#" class="header-action header-action--primary">${this.actionIconSVG()}<span>${t.action}</span></a>
</div>`;
            const tabletToggle = bp === 'tablet'
                ? '<button type="button" class="header-menu-toggle" aria-label="Menu"><span aria-hidden="true">≡</span></button>'
                : '';
            inner = `<div class="navigation-header__left">${logo}${menu}</div>${tabletToggle}${actions}`;
        }

        this.preview.innerHTML = `<header class="navigation-header"${isRTL ? ' dir="rtl"' : ''} style="${fullWidth ? '' : 'max-width: 1200px; margin: 0 auto;'} border-bottom: 1px solid #E5E7EB; position: static;">${inner}</header>`;
        this.preview.dir = isRTL ? 'rtl' : '';
    }
}

function initNavHeader() {
    return new NavHeaderManager();
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { NavHeaderManager, NavHeaderDemoManager, initNavHeader };
}
