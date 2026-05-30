/* ============================================
   MENU COMPONENT MODULE
   DGA Design System - Menu (dropdown / context list)
   - MenuManager: dropdown triggers, outside-click/ESC close, item
     selection, trailing-switch toggle
   - MenuDemoManager: powers the interactive live demo
   ============================================ */

const MENU_FILE_ICON  = '<span class="dga-icon-file-01" aria-hidden="true"></span>';
const MENU_CHECK_ICON  = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 10l4 4 8-8"/></svg>';
const MENU_ARROW_ICON  = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 10h10M11 6l4 4-4 4"/></svg>';

class MenuManager {
    constructor(scope) {
        this.scope = scope || document.getElementById('component-content') || document;
        this.bind();
    }

    bind() {
        // Dropdown triggers
        this.scope.querySelectorAll('[data-menu-trigger]').forEach(trigger => {
            if (trigger.dataset.menuBound) return;
            trigger.dataset.menuBound = 'true';
            const id = trigger.getAttribute('data-menu-trigger');
            const menu = document.getElementById(id);
            trigger.setAttribute('aria-haspopup', 'true');
            trigger.setAttribute('aria-expanded', 'false');
            trigger.addEventListener('click', (e) => {
                e.stopPropagation();
                const isOpen = menu && menu.classList.contains('is-open');
                this.closeAll();
                if (menu && !isOpen) {
                    menu.classList.add('is-open');
                    trigger.setAttribute('aria-expanded', 'true');
                }
            });
        });

        // Item selection (single-select within a group marked data-menu-select)
        this.scope.querySelectorAll('.menu-item:not(.menu-item--disabled)').forEach(item => {
            if (item.dataset.menuItemBound) return;
            item.dataset.menuItemBound = 'true';
            item.addEventListener('click', (e) => {
                // Switch toggle handled separately; ignore clicks on it
                if (e.target.closest('.menu-switch')) return;
                const group = item.closest('[data-menu-select]');
                if (group) {
                    group.querySelectorAll('.menu-item').forEach(i => i.classList.remove('menu-item--selected'));
                    item.classList.add('menu-item--selected');
                }
            });
        });

        // Trailing switches
        this.scope.querySelectorAll('.menu-switch').forEach(sw => {
            if (sw.dataset.menuSwitchBound) return;
            sw.dataset.menuSwitchBound = 'true';
            sw.addEventListener('click', (e) => {
                e.stopPropagation();
                const on = sw.classList.toggle('is-on');
                sw.setAttribute('aria-checked', String(on));
            });
        });

        if (!MenuManager._globalBound) {
            MenuManager._globalBound = true;
            document.addEventListener('click', (e) => {
                if (!e.target.closest('.menu') && !e.target.closest('[data-menu-trigger]')) {
                    MenuManager.closeAllMenus();
                }
            });
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') MenuManager.closeAllMenus();
            });
        }
    }

    closeAll() { MenuManager.closeAllMenus(); }

    static closeAllMenus() {
        document.querySelectorAll('.menu-anchor .menu.is-open').forEach(m => m.classList.remove('is-open'));
        document.querySelectorAll('[data-menu-trigger][aria-expanded="true"]').forEach(t => t.setAttribute('aria-expanded', 'false'));
    }
}

/* ============================================
   MENU DEMO MANAGER
   ============================================ */

class MenuDemoManager {
    constructor() {
        this.preview = document.getElementById('menu-demo-preview');
        this.trailSelect = document.getElementById('menu-demo-trail');
        this.stateSelect = document.getElementById('menu-demo-state');
        if (!this.preview) return;

        this.labels = {
            en: { group: 'Group label', item: 'Item Label', tag: 'Label' },
            ar: { group: 'عنوان مجموعة', item: 'نص العنصر', tag: 'وسم' },
        };

        this.toggles = {};
        this.initSwitches();
        [this.trailSelect, this.stateSelect].forEach(s => { if (s) s.addEventListener('change', () => this.render()); });
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

    trailMarkup(type, lang) {
        const t = this.labels[lang];
        switch (type) {
            case 'text':   return '<span class="menu-item__trail menu-item__trail--text">+99</span>';
            case 'icon':   return `<span class="menu-item__trail-icon">${MENU_ARROW_ICON}</span>`;
            case 'check':  return `<span class="menu-item__trail-icon">${MENU_CHECK_ICON}</span>`;
            case 'tag':    return `<span class="menu-item__trail"><span class="tag tag--neutral tag--sm">${t.tag}</span></span>`;
            case 'switch': return '<span class="menu-switch is-on" role="switch" aria-checked="true"><span class="menu-switch__thumb"></span></span>';
            default:       return '';
        }
    }

    render() {
        const trail = this.trailSelect ? this.trailSelect.value : 'none';
        const state = this.stateSelect ? this.stateSelect.value : 'default';
        const isRTL = !!this.toggles['rtl'];
        const lang = isRTL ? 'ar' : 'en';
        const t = this.labels[lang];

        const itemClass = (i) => {
            const c = ['menu-item'];
            if (state === 'selected' && i === 0) c.push('menu-item--selected');
            if (state === 'disabled' && i === 2) c.push('menu-item--disabled');
            return c.join(' ');
        };

        const items = [0, 1, 2].map(i =>
            `<div class="${itemClass(i)}" role="menuitem" tabindex="0">
    <span class="menu-item__icon">${MENU_FILE_ICON}</span>
    <span class="menu-item__label">${t.item}</span>
    ${this.trailMarkup(trail, lang)}
</div>`).join('');

        this.preview.innerHTML = `<div class="menu${isRTL ? ' menu--rtl' : ''}"${isRTL ? ' dir="rtl"' : ''} role="menu">
    <div class="menu-group" data-menu-select>
        <p class="menu-group__label">${t.group}</p>
        ${items}
    </div>
</div>`;

        // Re-bind switches inside the freshly rendered demo
        this.preview.querySelectorAll('.menu-switch').forEach(sw => {
            sw.addEventListener('click', (e) => {
                e.stopPropagation();
                const on = sw.classList.toggle('is-on');
                sw.setAttribute('aria-checked', String(on));
            });
        });
    }
}

function initMenus() { return new MenuManager(); }

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { MenuManager, MenuDemoManager, initMenus };
}
