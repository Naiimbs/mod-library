/* ============================================
   SLIDEOUT MENU COMPONENT MODULE
   DGA Design System - Slideout (side panel)
   - SlideoutManager: open/close a real sliding panel + backdrop
   - SlideoutDemoManager: powers the live demo
   ============================================ */

const SLIDEOUT_ICON  = '<span class="dga-icon-add-01" aria-hidden="true"></span>';
const SLIDEOUT_CLOSE = '<span class="dga-icon-cancel-01" aria-hidden="true"></span>';
const SLIDEOUT_FILE  = '<span class="dga-icon-file-01" aria-hidden="true"></span>';

class SlideoutManager {
    constructor() {
        this.lastFocused = null;
        this.bind();
    }

    bind() {
        document.querySelectorAll('[data-slideout-open]').forEach(trigger => {
            if (trigger.dataset.slideoutBound) return;
            trigger.dataset.slideoutBound = 'true';
            trigger.addEventListener('click', () => {
                const id = trigger.getAttribute('data-slideout-open');
                this.open(document.getElementById(id));
            });
        });

        document.querySelectorAll('.slideout-backdrop').forEach(backdrop => {
            if (backdrop.dataset.slideoutBound) return;
            backdrop.dataset.slideoutBound = 'true';
            backdrop.addEventListener('click', (e) => {
                if (e.target === backdrop) this.closeGroup(backdrop);
            });
        });

        document.querySelectorAll('[data-slideout-close]').forEach(btn => {
            if (btn.dataset.slideoutCloseBound) return;
            btn.dataset.slideoutCloseBound = 'true';
            btn.addEventListener('click', () => {
                const panel = btn.closest('.slideout');
                this.close(panel);
            });
        });

        if (!SlideoutManager._escBound) {
            SlideoutManager._escBound = true;
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    const panel = document.querySelector('.slideout.is-open');
                    if (panel) this.close(panel);
                }
            });
        }
    }

    open(panel) {
        if (!panel) return;
        this.lastFocused = document.activeElement;
        // The matching backdrop is the panel's previous sibling or shares an id mapping
        const backdrop = panel.previousElementSibling && panel.previousElementSibling.classList.contains('slideout-backdrop')
            ? panel.previousElementSibling
            : document.querySelector(`.slideout-backdrop[data-for="${panel.id}"]`);
        if (backdrop) backdrop.classList.add('is-open');
        panel.classList.add('is-open');
        document.body.style.overflow = 'hidden';
        const focusable = panel.querySelector('button, [href], input, [tabindex]:not([tabindex="-1"])');
        if (focusable) focusable.focus();
    }

    close(panel) {
        if (!panel) return;
        panel.classList.remove('is-open');
        const backdrop = panel.previousElementSibling && panel.previousElementSibling.classList.contains('slideout-backdrop')
            ? panel.previousElementSibling
            : document.querySelector(`.slideout-backdrop[data-for="${panel.id}"]`);
        if (backdrop) backdrop.classList.remove('is-open');
        document.body.style.overflow = '';
        if (this.lastFocused && this.lastFocused.focus) this.lastFocused.focus();
    }

    closeGroup(backdrop) {
        backdrop.classList.remove('is-open');
        const panel = backdrop.nextElementSibling && backdrop.nextElementSibling.classList.contains('slideout')
            ? backdrop.nextElementSibling
            : document.getElementById(backdrop.getAttribute('data-for'));
        if (panel) panel.classList.remove('is-open');
        document.body.style.overflow = '';
    }
}

/* ============================================
   SLIDEOUT DEMO MANAGER
   Renders an inline slideout panel for the live demo (no fixed slide).
   ============================================ */

class SlideoutDemoManager {
    constructor() {
        this.preview = document.getElementById('slideout-demo-preview');
        this.bodySelect = document.getElementById('slideout-demo-body');
        if (!this.preview) return;

        this.labels = {
            en: { title: 'Title', desc: 'Description goes here.', group: 'Group label', item: 'Item Label', cancel: 'Action', confirm: 'Action', customTitle: 'Swap with content component', customBody: 'Replace this slot with any component' },
            ar: { title: 'عنوان', desc: 'هنا يوضع الوصف.', group: 'عنوان المجموعة', item: 'نص العنصر', cancel: 'إجراء', confirm: 'إجراء', customTitle: 'استبدل هذا العنصر بأي عنصر آخر', customBody: 'يمكن استبدال هذه المنطقة بأي مكون' },
        };

        this.toggles = {};
        this.initSwitches();
        if (this.bodySelect) this.bodySelect.addEventListener('change', () => this.render());
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

    render() {
        const body = this.bodySelect ? this.bodySelect.value : 'menu';
        const isRTL = !!this.toggles['rtl'];
        const gray = !!this.toggles['gray'];
        const right = !!this.toggles['right'];
        const t = isRTL ? this.labels.ar : this.labels.en;

        const classes = ['slideout', 'slideout--inline'];
        if (gray) classes.push('slideout--gray');
        if (right) classes.push('slideout--right');
        if (isRTL) classes.push('slideout--rtl');

        let bodyHTML;
        if (body === 'custom') {
            bodyHTML = `<div class="slideout-custom"><h4 class="slideout-custom__title">${t.customTitle}</h4><p class="slideout-custom__body">${t.customBody}</p></div>`;
        } else {
            const items = [0, 1, 2].map(() =>
                `<div class="menu-item" role="menuitem" tabindex="0"><span class="menu-item__icon">${SLIDEOUT_FILE}</span><span class="menu-item__label">${t.item}</span></div>`
            ).join('');
            bodyHTML = `<div class="menu" role="menu"><div class="menu-group"><p class="menu-group__label">${t.group}</p>${items}</div></div>`;
        }

        this.preview.innerHTML = `<div class="${classes.join(' ')}"${isRTL ? ' dir="rtl"' : ''}>
    <div class="slideout__header">
        <span class="slideout__icon">${SLIDEOUT_ICON}</span>
        <div class="slideout__heading">
            <h3 class="slideout__title">${t.title}</h3>
            <p class="slideout__description">${t.desc}</p>
        </div>
        <button type="button" class="slideout__close" aria-label="Close">${SLIDEOUT_CLOSE}</button>
    </div>
    <div class="slideout__body">${bodyHTML}</div>
    <div class="slideout__footer">
        <button class="btn btn-secondary-outline">${t.cancel}</button>
        <button class="btn btn-primary">${t.confirm}</button>
    </div>
</div>`;
    }
}

function initSlideout() { return new SlideoutManager(); }

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { SlideoutManager, SlideoutDemoManager, initSlideout };
}
