/* ============================================
   BUTTON DEMO MODULE
   DGA Design System - Interactive Button Demo
   Powers the live demo controls on the Buttons page.
   ============================================ */

class ButtonDemoManager {
    constructor() {
        this.preview = document.getElementById('btn-demo-preview');
        this.variantSelect = document.getElementById('btn-demo-variant');
        this.sizeSelect = document.getElementById('btn-demo-size');
        this.stateSelect = document.getElementById('btn-demo-state');

        if (!this.preview) return;

        this.labels = {
            en: {
                button: 'Button',
                addItem: 'Add Item',
            },
            ar: {
                button: '\u0632\u0631',
                addItem: '\u0625\u0636\u0627\u0641\u0629 \u0639\u0646\u0635\u0631',
            }
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
                // Icon-only is mutually exclusive with leading/trailing icon
                if (key === 'icon-only') {
                    this.toggles['leading-icon'] = false;
                    this.toggles['trailing-icon'] = false;
                    this.updateSwitchUI('leading-icon');
                    this.updateSwitchUI('trailing-icon');
                } else if (key === 'leading-icon' || key === 'trailing-icon') {
                    this.toggles['icon-only'] = false;
                    this.updateSwitchUI('icon-only');
                }

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
        this.stateSelect.addEventListener('change', () => this.render());
    }

    getIconSVG(size) {
        const s = size === 'small' ? 16 : size === 'medium' ? 18 : 20;
        return `<span class="icon"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="${s}" height="${s}"><path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd"/></svg></span>`;
    }

    render() {
        const variant = this.variantSelect.value;
        const size = this.sizeSelect.value;
        const state = this.stateSelect.value;
        const isRTL = this.toggles['rtl'] || false;
        const isOnColor = this.toggles['on-color'] || false;
        const lang = isRTL ? 'ar' : 'en';
        const t = this.labels[lang];

        // Build class list
        const classes = ['btn', `btn-${variant}`];

        if (size !== 'large') {
            classes.push(`btn-${size}`);
        }

        if (isOnColor) {
            classes.push('btn-on-color');
        }

        if (this.toggles['destructive']) {
            classes.push('destructive');
        }

        if (this.toggles['selected']) {
            classes.push('selected');
        }

        if (this.toggles['loading']) {
            classes.push('btn-loading');
        }

        if (this.toggles['icon-only']) {
            classes.push('btn-icon-only');
        }

        // Build button inner HTML
        let innerHTML = '';
        const icon = this.getIconSVG(size);

        if (this.toggles['icon-only']) {
            innerHTML = icon;
        } else {
            if (this.toggles['leading-icon']) {
                innerHTML += icon;
            }
            innerHTML += t.button;
            if (this.toggles['trailing-icon']) {
                innerHTML += icon;
            }
        }

        // Build attributes
        const disabledAttr = state === 'disabled' ? ' disabled' : '';
        const pressedAttr = this.toggles['selected'] ? ' aria-pressed="true"' : '';
        const classStr = classes.join(' ');

        // Create two buttons: label-only and label+icon
        const buttonHTML = `<button class="${classStr}"${disabledAttr}${pressedAttr}>${innerHTML}</button>`;

        // Also show a second button with icon to compare
        let secondButton = '';
        if (!this.toggles['icon-only'] && !this.toggles['leading-icon'] && !this.toggles['trailing-icon']) {
            const innerWithIcon = icon + t.addItem;
            secondButton = `<button class="${classStr}"${disabledAttr}${pressedAttr}>${innerWithIcon}</button>`;
        }

        this.preview.innerHTML = buttonHTML + (secondButton ? '\n' + secondButton : '');

        // Update RTL direction
        this.preview.dir = isRTL ? 'rtl' : '';

        // Update preview background based on on-color toggle
        this.preview.classList.toggle('live-demo__canvas--dark', isOnColor);
    }
}
