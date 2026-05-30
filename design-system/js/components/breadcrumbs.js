/* ============================================
   BREADCRUMB COMPONENT MODULE
   DGA Design System - Breadcrumb navigation
   - BreadcrumbManager: overflow ( ... ) dropdown open/close
   - BreadcrumbDemoManager: live demo
   ============================================ */

const BREADCRUMB_CHEVRON = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 4l4 4-4 4"/></svg>';

class BreadcrumbManager {
    constructor(scope) {
        this.scope = scope || document.getElementById('component-content') || document;
        this.bind();
    }

    bind() {
        this.scope.querySelectorAll('.breadcrumb-overflow__toggle').forEach(toggle => {
            if (toggle.dataset.bcBound) return;
            toggle.dataset.bcBound = 'true';
            const menu = toggle.parentElement.querySelector('.menu');
            toggle.setAttribute('aria-haspopup', 'true');
            toggle.setAttribute('aria-expanded', 'false');
            toggle.addEventListener('click', (e) => {
                e.stopPropagation();
                const isOpen = menu && menu.classList.contains('is-open');
                BreadcrumbManager.closeAll();
                if (menu && !isOpen) {
                    menu.classList.add('is-open');
                    toggle.setAttribute('aria-expanded', 'true');
                }
            });
        });

        if (!BreadcrumbManager._globalBound) {
            BreadcrumbManager._globalBound = true;
            document.addEventListener('click', (e) => {
                if (!e.target.closest('.breadcrumb-overflow')) BreadcrumbManager.closeAll();
            });
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') BreadcrumbManager.closeAll();
            });
        }
    }

    static closeAll() {
        document.querySelectorAll('.breadcrumb-overflow .menu.is-open').forEach(m => m.classList.remove('is-open'));
        document.querySelectorAll('.breadcrumb-overflow__toggle[aria-expanded="true"]').forEach(t => t.setAttribute('aria-expanded', 'false'));
    }
}

/* ============================================
   BREADCRUMB DEMO MANAGER
   ============================================ */

class BreadcrumbDemoManager {
    constructor() {
        this.preview = document.getElementById('breadcrumb-demo-preview');
        this.depthSelect = document.getElementById('breadcrumb-demo-depth');
        if (!this.preview) return;

        this.labels = {
            en: ['Home', 'Services', 'Category', 'Subcategory', 'Current Page'],
            ar: ['الرئيسية', 'الخدمات', 'الفئة', 'الفئة الفرعية', 'الصفحة الحالية'],
        };

        this.toggles = {};
        this.initSwitches();
        if (this.depthSelect) this.depthSelect.addEventListener('change', () => this.render());
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

    sep() {
        return `<span class="breadcrumb-separator" aria-hidden="true">${BREADCRUMB_CHEVRON}</span>`;
    }

    render() {
        const depth = this.depthSelect ? parseInt(this.depthSelect.value, 10) : 4;
        const isRTL = !!this.toggles['rtl'];
        const overflow = !!this.toggles['overflow'];
        const lang = isRTL ? 'ar' : 'en';
        const all = this.labels[lang];

        // Build a trail of `depth` crumbs: first labels + last = Current.
        const trail = [];
        for (let i = 0; i < depth - 1; i++) trail.push(all[i % (all.length - 1)]);
        trail.push(all[all.length - 1]); // current

        let html = '';
        if (overflow && trail.length > 3) {
            // Root + overflow(...) + last middle + current
            const hidden = trail.slice(1, trail.length - 2);
            html += `<span class="breadcrumb-item"><a href="#" class="breadcrumb-link">${trail[0]}</a></span>`;
            html += this.sep();
            html += `<span class="breadcrumb-item breadcrumb-overflow">
    <button type="button" class="breadcrumb-overflow__toggle" aria-label="Show more">…</button>
    <div class="menu" role="menu">
        <div class="menu-group">
            ${hidden.map(l => `<a href="#" class="menu-item" role="menuitem"><span class="menu-item__label">${l}</span></a>`).join('')}
        </div>
    </div>
</span>`;
            html += this.sep();
            html += `<span class="breadcrumb-item"><a href="#" class="breadcrumb-link">${trail[trail.length - 2]}</a></span>`;
            html += this.sep();
            html += `<span class="breadcrumb-item"><span class="breadcrumb-current" aria-current="page">${trail[trail.length - 1]}</span></span>`;
        } else {
            trail.forEach((label, i) => {
                if (i > 0) html += this.sep();
                const isCurrent = i === trail.length - 1;
                html += isCurrent
                    ? `<span class="breadcrumb-item"><span class="breadcrumb-current" aria-current="page">${label}</span></span>`
                    : `<span class="breadcrumb-item"><a href="#" class="breadcrumb-link">${label}</a></span>`;
            });
        }

        this.preview.innerHTML = `<nav class="breadcrumb${isRTL ? ' breadcrumb--rtl' : ''}"${isRTL ? ' dir="rtl"' : ''} aria-label="Breadcrumb">${html}</nav>`;

        // Bind the overflow dropdown in the freshly rendered demo
        if (window.DGA && window.DGA.get && window.DGA.get('breadcrumb')) {
            new BreadcrumbManager(this.preview);
        }
    }
}

function initBreadcrumbs() { return new BreadcrumbManager(); }

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { BreadcrumbManager, BreadcrumbDemoManager, initBreadcrumbs };
}
