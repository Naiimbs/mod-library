/* ============================================
   CHECKBOX DEMO MODULE
   DGA Design System - Checkbox Live Demo
   Single Responsibility: Demo interaction logic
   ============================================ */

class CheckboxDemoManager {
    constructor() {
        this.preview = document.getElementById('cb-demo-preview');
        this.stateSelect = document.getElementById('cb-demo-state');
        this.styleSelect = document.getElementById('cb-demo-style');
        this.sizeSelect = document.getElementById('cb-demo-size');

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
        this.sizeSelect.addEventListener('change', () => this.render());
    }

    render() {
        const state = this.stateSelect.value;
        const style = this.styleSelect.value;
        const size = this.sizeSelect.value;
        const isRTL = this.toggles['rtl'] || false;
        const isChecked = this.toggles['checked'] || false;
        const isIndeterminate = this.toggles['indeterminate'] || false;
        const showHelper = this.toggles['helper-text'] !== false;
        const showAlert = this.toggles['alert-message'] || false;

        const lang = isRTL ? 'ar' : 'en';
        const labels = {
            en: {
                options: ['Email notifications', 'SMS notifications', 'Push notifications'],
                helpers: ['Receive updates about your account via email.', 'Get text messages for important alerts.', 'Receive real-time alerts on your device.'],
                alert: 'This selection requires additional verification.'
            },
            ar: {
                options: ['إشعارات البريد الإلكتروني', 'إشعارات الرسائل النصية', 'إشعارات الدفع'],
                helpers: ['تلقي تحديثات حول حسابك عبر البريد الإلكتروني.', 'الحصول على رسائل نصية للتنبيهات المهمة.', 'تلقي تنبيهات فورية على جهازك.'],
                alert: 'هذا الاختيار يتطلب تحقق إضافي.'
            }
        };
        const l = labels[lang];

        const checkSVG = '<svg class="checkbox__icon checkbox__icon--check" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10 3L4.5 8.5L2 6" stroke="currentColor" stroke-width="1.67" stroke-linecap="round" stroke-linejoin="round"/></svg>';
        const minusSVG = '<svg class="checkbox__icon checkbox__icon--minus" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2.5 6h7" stroke="currentColor" stroke-width="1.67" stroke-linecap="round" stroke-linejoin="round"/></svg>';
        const alertIcon = '<svg class="checkbox__alert-icon" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8 5.333V8m0 2.667h.007M14.667 8A6.667 6.667 0 1 1 1.333 8a6.667 6.667 0 0 1 13.334 0Z" stroke="currentColor" stroke-width="1.333" stroke-linecap="round" stroke-linejoin="round"/></svg>';

        // Build checkbox classes
        const checkboxClasses = ['checkbox'];
        if (style === 'neutral') checkboxClasses.push('checkbox--neutral');
        if (state === 'disabled') checkboxClasses.push('checkbox--disabled');
        if (state === 'readonly') checkboxClasses.push('checkbox--readonly');
        if (isIndeterminate) checkboxClasses.push('checkbox--indeterminate');

        // Control size class
        let controlClass = 'checkbox__control';
        if (size === 'small') controlClass += ' checkbox__control--sm';
        if (size === 'xsmall') controlClass += ' checkbox__control--xs';

        const isDisabled = state === 'disabled';
        const disabledAttr = isDisabled ? 'disabled' : '';

        const optionsHTML = l.options.map((opt, i) => {
            const checked = isChecked && i === 0 ? 'checked' : '';

            let helperHTML = '';
            if (showHelper) {
                helperHTML = `<span class="checkbox__helper">${l.helpers[i]}</span>`;
            }

            let alertHTML = '';
            if (showAlert && i === 0) {
                alertHTML = `<div class="checkbox__alert">${alertIcon}<span class="checkbox__alert-text">${l.alert}</span></div>`;
            }

            return `
                <label class="${checkboxClasses.join(' ')}">
                    <div class="checkbox__row">
                        <div class="${controlClass}">
                            <span class="checkbox__ripple"></span>
                            <input type="checkbox" class="checkbox__input" name="demo-group" value="${i}" ${checked} ${disabledAttr}>
                            <span class="checkbox__box">
                                ${checkSVG}
                                ${minusSVG}
                            </span>
                        </div>
                        <span class="checkbox__label">${opt}</span>
                    </div>
                    ${helperHTML}
                    ${alertHTML}
                </label>
            `;
        }).join('');

        const html = `
            <div class="checkbox-group" style="width: 100%; max-width: 400px;">
                ${optionsHTML}
            </div>
        `;

        this.preview.innerHTML = html;
        this.preview.dir = isRTL ? 'rtl' : '';

        // Set indeterminate state on the first checkbox via JS
        if (isIndeterminate) {
            const firstInput = this.preview.querySelector('.checkbox__input');
            if (firstInput) {
                firstInput.indeterminate = true;
            }
        }
    }
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CheckboxDemoManager };
}
