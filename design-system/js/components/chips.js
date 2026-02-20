/* ============================================
   CHIP DEMO MODULE
   DGA Design System - Interactive Chip Demo
   Powers the live demo controls on the Chips page.
   ============================================ */

class ChipDemoManager {
    constructor() {
        this.preview = document.getElementById('chip-demo-preview');
        this.sizeSelect = document.getElementById('chip-demo-size');
        this.stateSelect = document.getElementById('chip-demo-state');
        this.styleSelect = document.getElementById('chip-demo-style');

        if (!this.preview) return;

        this.labels = {
            en: {
                chip: 'Item',
                addItem: 'Add Item',
            },
            ar: {
                chip: '\u0627\u062E\u062A\u064A\u0627\u0631',
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
        this.sizeSelect.addEventListener('change', () => this.render());
        this.stateSelect.addEventListener('change', () => this.render());
        this.styleSelect.addEventListener('change', () => this.render());
    }

    getLeadIconSVG(size) {
        const s = size === 'small' ? 14 : size === 'medium' ? 16 : 18;
        return `<span class="chip__icon"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="${s}" height="${s}"><path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd"/></svg></span>`;
    }

    getTrailIconSVG(size) {
        const s = size === 'small' ? 14 : size === 'medium' ? 16 : 18;
        return `<span class="chip__icon"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="${s}" height="${s}"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/></svg></span>`;
    }

    render() {
        const style = this.styleSelect.value;
        const size = this.sizeSelect.value;
        const state = this.stateSelect.value;
        const isRTL = this.toggles['rtl'] || false;
        const isOnColor = this.toggles['on-color'] || false;
        const lang = isRTL ? 'ar' : 'en';
        const t = this.labels[lang];

        // Build class list
        const classes = ['chip', `chip-${style}`];

        if (size === 'medium') {
            classes.push('chip-medium');
        } else if (size === 'small') {
            classes.push('chip-small');
        }

        if (this.toggles['rounded']) {
            classes.push('chip-rounded');
        }

        if (isOnColor) {
            classes.push('chip-on-color');
        }

        if (this.toggles['selected']) {
            classes.push('selected');
        }

        // Build chip inner HTML
        let innerHTML = '';
        const leadIcon = this.getLeadIconSVG(size);
        const trailIcon = this.getTrailIconSVG(size);

        if (this.toggles['leading-icon']) {
            innerHTML += leadIcon;
        }
        innerHTML += t.chip;
        if (this.toggles['trailing-icon']) {
            innerHTML += trailIcon;
        }

        // Build attributes
        const disabledAttr = state === 'disabled' ? ' disabled' : '';
        const pressedAttr = this.toggles['selected'] ? ' aria-pressed="true"' : '';
        const classStr = classes.join(' ');

        // Render chip
        const chipHTML = `<button class="${classStr}"${disabledAttr}${pressedAttr}>${innerHTML}</button>`;

        // Also show a second chip with icon to compare
        let secondChip = '';
        if (!this.toggles['leading-icon'] && !this.toggles['trailing-icon']) {
            const innerWithIcon = leadIcon + t.addItem;
            secondChip = `<button class="${classStr}"${disabledAttr}${pressedAttr}>${innerWithIcon}</button>`;
        }

        this.preview.innerHTML = chipHTML + (secondChip ? '\n' + secondChip : '');

        // Update RTL direction
        this.preview.dir = isRTL ? 'rtl' : '';

        // Update preview background based on on-color toggle
        this.preview.classList.toggle('live-demo__canvas--dark', isOnColor);
    }
}
