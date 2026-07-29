/* ============================================
   NAV HEADER COMPONENT MODULE
   DGA Design System - Navigation Header
   - NavHeaderManager: menu-item selection + sub-menu dropdown behavior
   - NavHeaderDemoManager: live demo driving EVERY Figma prop across the
     header (30150:148751) and its subcomponents: menu item (148312),
     action (148445), logo placeholder (149694), sub-menu (148877/148183).
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
                    document.querySelectorAll('#component-content .header-sub-menu.is-open').forEach(p => p.classList.remove('is-open'));
                    document.querySelectorAll('#component-content .header-menu-item[aria-expanded="true"]').forEach(i => i.setAttribute('aria-expanded', 'false'));
                }
            });
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    document.querySelectorAll('#component-content .header-sub-menu.is-open').forEach(p => p.classList.remove('is-open'));
                    document.querySelectorAll('#component-content .header-menu-item[aria-expanded="true"]').forEach(i => i.setAttribute('aria-expanded', 'false'));
                }
            });
        }
    }

    closeAll() {
        document.querySelectorAll('#component-content .header-sub-menu.is-open').forEach(p => p.classList.remove('is-open'));
        this.scope.querySelectorAll('.header-menu-item[aria-expanded="true"]').forEach(i => i.setAttribute('aria-expanded', 'false'));
    }
}

/* ============================================
   NAV HEADER DEMO MANAGER — full Figma prop matrix
   ============================================ */

class NavHeaderDemoManager {
    constructor() {
        this.preview = document.getElementById('nav-header-demo-preview');
        if (!this.preview) return;

        this.sel = {
            breakpoint: document.getElementById('nav-header-demo-breakpoint'),
            logoSize: document.getElementById('nav-header-demo-logo-size'),
            logoPos: document.getElementById('nav-header-demo-logo-pos'),
            itemState: document.getElementById('nav-header-demo-item-state'),
            actionState: document.getElementById('nav-header-demo-action-state'),
            actionIcon: document.getElementById('nav-header-demo-action-icon'),
            submenu: document.getElementById('nav-header-demo-submenu'),
            linkStyle: document.getElementById('nav-header-demo-linkstyle'),
        };

        this.labels = {
            en: {
                logo: 'Platform Logo', links: ['Home', 'Services', 'Reports', 'Settings'], action: 'Action',
                groups: [['For individuals', [['Personal account', 'Manage your profile and requests'], ['Documents', 'Certificates and records']]],
                         ['For business', [['Organizations', 'Register and manage entities'], ['Analytics', 'Usage and performance']]]],
            },
            ar: {
                logo: 'شعار المنصة', links: ['الرئيسية', 'الخدمات', 'المقالات', 'الإعدادات'], action: 'إجراء',
                groups: [['للأفراد', [['الحساب الشخصي', 'إدارة ملفك وطلباتك'], ['المستندات', 'الشهادات والسجلات']]],
                         ['للأعمال', [['المنشآت', 'تسجيل الكيانات وإدارتها'], ['التحليلات', 'الاستخدام والأداء']]]],
            },
        };

        this.toggles = {};
        this.initSwitches();
        Object.values(this.sel).forEach(el => el && el.addEventListener('change', () => this.render()));
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

    stateClasses(state, base) {
        if (state === 'hovered') return ' demo-hovered';
        if (state === 'pressed') return ' demo-pressed';
        if (state === 'focused') return ' demo-focused';
        if (state === 'disabled') return ` ${base}--disabled`;
        return '';
    }

    logoHTML(t) {
        const size = this.sel.logoSize.value;
        const pos = this.sel.logoPos.value;
        const px = size === 'small' ? 32 : size === 'large' ? 64 : 48;
        const mods = [size !== 'medium' ? `logo-placeholder--${size}` : '', pos === 'top' ? 'logo-placeholder--top' : ''].filter(Boolean).join(' ');
        return `<div class="logo-placeholder ${mods}">
            <svg class="logo-placeholder__icon" width="${px}" height="${px}" viewBox="0 0 48 48" fill="none"><rect width="48" height="48" rx="4" fill="#F5F5F5"/><path d="M24 8C22.9 8 22 9.12 22 10.5V18L18 17.3C17.3 17.2 16.6 17.7 16.5 18.4C16.4 19.1 16.9 19.7 17.6 19.8L22 20.5V23L17 25.5C16.4 25.8 16.2 26.5 16.5 27.1C16.8 27.7 17.5 27.9 18.1 27.6L22 25.6V29L17 34C16.6 34.4 16.6 35 17 35.4C17.4 35.8 18 35.8 18.4 35.4L22 31.8V38C22 39.1 22.9 40 24 40C25.1 40 26 39.1 26 38V31.8L29.6 35.4C30 35.8 30.6 35.8 31 35.4C31.4 35 31.4 34.4 31 34L26 29V25.6L29.9 27.6C30.5 27.9 31.2 27.7 31.5 27.1C31.8 26.5 31.6 25.8 31 25.5L26 23V20.5L30.4 19.8C31.1 19.7 31.6 19.1 31.5 18.4C31.4 17.7 30.7 17.2 30 17.3L26 18V10.5C26 9.12 25.1 8 24 8Z" fill="#9DA4AE"/></svg>
            <span class="logo-placeholder__text">${t.logo}</span>
        </div>`;
    }

    arrowSVG() {
        return '<svg class="header-menu-item__arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9L12 15L18 9"/></svg>';
    }

    actionIconSVG() {
        return '<svg class="header-action__icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 12H15"/><path d="M12 9L15 12L12 15"/></svg>';
    }

    menuHTML(t) {
        const itemState = this.sel.itemState.value;
        const withIcon = this.toggles['item-icon'];
        const icon = withIcon ? '<span class="header-menu-item__icon"><span class="icon dga-icon-dashboard-square-01" aria-hidden="true"></span></span>' : '';
        return `<nav class="navigation-menu" role="menubar">` + t.links.map((label, i) => {
            // Item 0 carries the Selected prop; item 1 carries the State prop.
            const selected = i === 0 && this.toggles['item-selected'];
            const state = i === 1 ? this.stateClasses(itemState, 'header-menu-item') : '';
            const submenuAttr = i === 1 && this.sel.submenu.value !== 'closed' ? ' aria-expanded="true"' : '';
            return `<a href="#" onclick="return false;" class="header-menu-item${selected ? ' header-menu-item--selected' : ''}${state}" role="menuitem"${submenuAttr}>
                ${icon}<span class="header-menu-item__text">${label}</span>${i === 1 ? this.arrowSVG() : ''}
            </a>`;
        }).join('') + `</nav>`;
    }

    actionHTML(t, kind, extra = '') {
        const iconPos = this.sel.actionIcon.value;
        const iconOnly = this.toggles['action-icon-only'];
        const mods = [kind, iconPos === 'top' ? 'header-action--top' : '', iconOnly ? 'header-action--icon-only' : '', extra].filter(Boolean).join(' ');
        const label = iconOnly ? '' : `<span>${t.action}</span>`;
        return `<a href="#" onclick="return false;" class="header-action ${mods}"${iconOnly ? ` aria-label="${t.action}"` : ''}>${this.actionIconSVG()}${label}</a>`;
    }

    submenuHTML(t) {
        const mode = this.sel.submenu.value;
        if (mode === 'closed') return '';
        const style = this.sel.linkStyle.value;
        const iconFor = (i) => {
            if (style === 'text') return '';
            const glyphs = ['dga-icon-user', 'dga-icon-file-01', 'dga-icon-building-01', 'dga-icon-analytics-01'];
            const cls = style === 'boxed' ? 'header-sub-menu-item__icon header-sub-menu-item__icon--bg' : 'header-sub-menu-item__icon';
            return `<span class="${cls}"><span class="${glyphs[i % glyphs.length]}" aria-hidden="true"></span></span>`;
        };
        let i = 0;
        const groups = t.groups.map(([g, items]) => `<div class="header-sub-menu-group">
            <p class="header-sub-menu-group__label">${g}</p>
            ${items.map(([label, helper]) => `<a href="#" onclick="return false;" class="header-sub-menu-item">
                ${iconFor(i++)}
                <span class="header-sub-menu-item__body">
                    <span class="header-sub-menu-item__label">${label}</span>
                    <span class="header-sub-menu-item__helper">${helper}</span>
                </span>
            </a>`).join('')}
        </div>`).join('');
        return `<div class="header-sub-menu header-sub-menu--full${mode === 'brand' ? ' header-sub-menu--brand' : ''}" style="position: static; display: flex;">${groups}</div>`;
    }

    render() {
        const bp = this.sel.breakpoint.value;
        const isRTL = !!this.toggles['rtl'];
        const fullWidth = !!this.toggles['fullwidth'];
        const divider = !!this.toggles['divider'];
        const t = isRTL ? this.labels.ar : this.labels.en;
        const actionState = this.stateClasses(this.sel.actionState.value, 'header-action');

        const logo = this.logoHTML(t);
        const hamburger = '<button type="button" class="header-menu-btn" style="display:inline-flex;" aria-label="Menu"><span class="icon dga-icon-menu-01" aria-hidden="true"></span></button>';

        let inner;
        if (bp === 'mobile') {
            // Figma <600: leading action, centered branding, hamburger at the end
            inner = `<div class="navigation-header__right" style="order:-1;">${this.actionHTML(t, 'header-action--primary header-action--icon-only')}</div>
                <div class="navigation-header__left" style="flex:1;justify-content:center;">${logo}</div>
                <span style="order:10;">${hamburger}</span>`;
        } else if (bp === 'tablet') {
            // Figma 600–960: hamburger start, centered branding, icon-only actions
            inner = `${hamburger}
                <div class="navigation-header__left" style="flex:1;justify-content:center;">${logo}</div>
                <div class="navigation-header__right">
                    ${this.actionHTML(t, 'header-action--outline header-action--icon-only', actionState)}
                    ${this.actionHTML(t, 'header-action--primary header-action--icon-only')}
                </div>`;
        } else {
            inner = `<div class="navigation-header__left">${logo}${this.menuHTML(t)}</div>
                <div class="navigation-header__right">
                    ${this.actionHTML(t, 'header-action--outline', actionState)}
                    ${this.actionHTML(t, 'header-action--outline')}
                    ${this.toggles['action-selected'] ? this.actionHTML(t, 'header-action--primary') : this.actionHTML(t, 'header-action--outline')}
                </div>`;
        }

        const widthStyle = bp === 'mobile' ? 'max-width: 560px; margin: 0 auto;'
            : bp === 'tablet' ? 'max-width: 900px; margin: 0 auto;'
            : fullWidth ? '' : 'max-width: 1280px; margin: 0 auto;';

        this.preview.innerHTML = `<div style="width: 100%;">
            <header class="navigation-header" style="${widthStyle} position: static; ${divider ? 'border-bottom: 1px solid var(--gray-300);' : ''}">${inner}</header>
            ${bp === 'desktop' ? this.submenuHTML(t) : ''}
        </div>`;
        this.preview.dir = isRTL ? 'rtl' : '';
    }
}

function initNavHeader() {
    return new NavHeaderManager();
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { NavHeaderManager, NavHeaderDemoManager, initNavHeader };
}
