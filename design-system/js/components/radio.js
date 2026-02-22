/* ============================================
   RADIO BUTTON DEMO MODULE
   DGA Design System - Radio Button Live Demo
   Single Responsibility: Demo interaction logic
   ============================================ */

class RadioDemoManager {
    constructor() {
        this.preview = document.getElementById('radio-demo-preview');
        this.stateSelect = document.getElementById('radio-demo-state');
        this.styleSelect = document.getElementById('radio-demo-style');

        if (!this.preview) return;

        this.toggles = {};
        this.initSwitches();
        this.bindEvents();
        this.render();
    }

    initSwitches() {
        document.querySelectorAll('.live-demo__switch[data-toggle]').forEach(btn => {
            const key = btn.dataset.toggle;
            this.toggles[key] = btn.classList.contains('active');

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
        this.stateSelect.addEventListener('change', () => this.render());
        this.styleSelect.addEventListener('change', () => this.render());
    }

    render() {
        const state = this.stateSelect.value;
        const style = this.styleSelect.value;
        const isRTL = this.toggles['rtl'] || false;
        const isSelected = this.toggles['selected'] || false;
        const showHelper = this.toggles['helper-text'] !== false;
        const showAlert = this.toggles['alert-message'] || false;

        const lang = isRTL ? 'ar' : 'en';
        const labels = {
            en: {
                options: ['Standard delivery', 'Express delivery', 'Same-day delivery'],
                helpers: ['Free shipping. Arrives in 5-7 business days.', 'SAR 25.00. Arrives in 1-2 business days.', 'SAR 50.00. Available in select cities only.'],
                alert: 'This selection requires additional verification.'
            },
            ar: {
                options: ['توصيل عادي', 'توصيل سريع', 'توصيل في نفس اليوم'],
                helpers: ['شحن مجاني. يصل خلال 5-7 أيام عمل.', '25 ريال. يصل خلال 1-2 يوم عمل.', '50 ريال. متاح في مدن محددة فقط.'],
                alert: 'هذا الاختيار يتطلب تحقق إضافي.'
            }
        };
        const l = labels[lang];

        const alertIcon = '<svg class="radio__alert-icon" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8 5.333V8m0 2.667h.007M14.667 8A6.667 6.667 0 1 1 1.333 8a6.667 6.667 0 0 1 13.334 0Z" stroke="currentColor" stroke-width="1.333" stroke-linecap="round" stroke-linejoin="round"/></svg>';

        // Build radio classes
        const radioClasses = ['radio'];
        if (style === 'neutral') radioClasses.push('radio--neutral');
        if (state === 'disabled') radioClasses.push('radio--disabled');
        if (state === 'readonly') radioClasses.push('radio--readonly');

        const isDisabled = state === 'disabled';
        const disabledAttr = isDisabled ? 'disabled' : '';

        const optionsHTML = l.options.map((opt, i) => {
            const checked = isSelected && i === 0 ? 'checked' : '';

            let helperHTML = '';
            if (showHelper) {
                helperHTML = `<span class="radio__helper">${l.helpers[i]}</span>`;
            }

            let alertHTML = '';
            if (showAlert && i === 0) {
                alertHTML = `<div class="radio__alert">${alertIcon}<span class="radio__alert-text">${l.alert}</span></div>`;
            }

            return `
                <label class="${radioClasses.join(' ')}">
                    <div class="radio__row">
                        <div class="radio__control">
                            <span class="radio__ripple"></span>
                            <input type="radio" class="radio__input" name="demo-group" value="${i}" ${checked} ${disabledAttr}>
                            <span class="radio__circle"></span>
                        </div>
                        <span class="radio__label">${opt}</span>
                    </div>
                    ${helperHTML}
                    ${alertHTML}
                </label>
            `;
        }).join('');

        const html = `
            <div class="radio-group" style="width: 100%; max-width: 400px;">
                ${optionsHTML}
            </div>
        `;

        this.preview.innerHTML = html;
        this.preview.dir = isRTL ? 'rtl' : '';
    }
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { RadioDemoManager };
}
