/* ============================================
   STATUS TAG DEMO MODULE
   DGA Design System - Interactive Status Tag Demo
   Powers the live demo controls on the Status Tag page.
   ============================================ */

class StatusTagDemoManager {
    constructor() {
        this.preview = document.getElementById('status-tag-demo-preview');
        this.variantSelect = document.getElementById('status-tag-demo-variant');
        this.sizeSelect = document.getElementById('status-tag-demo-size');
        this.styleSelect = document.getElementById('status-tag-demo-style');

        if (!this.preview) return;

        this.labels = {
            en: 'Status',
            ar: 'حالة',
        };

        this.toggles = {};
        this.initSwitches();
        this.bindEvents();
        this.render();
    }

    initSwitches() {
        document.querySelectorAll('.live-demo__switch[data-toggle]').forEach(btn => {
            const key = btn.dataset.toggle;
            this.toggles[key] = false;

            btn.addEventListener('click', () => {
                this.toggles[key] = !this.toggles[key];
                this.updateSwitchUI(key);
                this.render();
            });
        });
    }

    updateSwitchUI(key) {
        const btn = document.querySelector(`.live-demo__switch[data-toggle="${key}"]`);
        if (btn) {
            btn.classList.toggle('active', this.toggles[key]);
            btn.setAttribute('aria-checked', String(this.toggles[key]));
        }
    }

    bindEvents() {
        this.variantSelect.addEventListener('change', () => this.render());
        this.sizeSelect.addEventListener('change', () => this.render());
        this.styleSelect.addEventListener('change', () => this.render());
    }

    render() {
        const variant = this.variantSelect.value;
        const size = this.sizeSelect.value;
        const style = this.styleSelect.value;
        const isRTL = this.toggles['rtl'] || false;
        const label = isRTL ? this.labels.ar : this.labels.en;

        const classes = [
            'status-tag',
            `status-tag--${size}`,
            `status-tag--${style}`,
            `status-tag--${variant}`,
        ].join(' ');

        this.preview.innerHTML = `<span class="${classes}">
    <span class="status-tag__dot"></span>
    <span class="status-tag__label">${label}</span>
</span>`;

        this.preview.dir = isRTL ? 'rtl' : '';
    }
}
