/* ============================================
   TEXTAREA DEMO MODULE
   DGA Design System - Textarea Live Demo
   Single Responsibility: Demo interaction logic
   ============================================ */

class TextareaDemoManager {
    constructor() {
        this.preview = document.getElementById('ta-demo-preview');
        this.stateSelect = document.getElementById('ta-demo-state');
        this.styleSelect = document.getElementById('ta-demo-style');
        this.rowsSelect = document.getElementById('ta-demo-rows');

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
        this.rowsSelect.addEventListener('change', () => this.render());
    }

    render() {
        const state = this.stateSelect.value;
        const style = this.styleSelect.value;
        const rows = parseInt(this.rowsSelect.value);
        const isRTL = this.toggles['rtl'] || false;
        const isFilled = this.toggles['filled'] !== false;
        const isError = this.toggles['error'] || false;
        const isResize = this.toggles['resize'] !== false;
        const showLabel = this.toggles['show-label'] !== false;
        const isRequired = this.toggles['required'] || false;
        const showHelper = this.toggles['helper-text'] || false;

        const lang = isRTL ? 'ar' : 'en';
        const labels = {
            en: { label: 'Description', placeholder: 'Enter your text here...', value: 'Entered text content that the user has typed into the field.', helper: 'This is a hint text to help the user.', errorHelper: 'This field is required.' },
            ar: { label: 'الوصف', placeholder: 'أدخل النص هنا...', value: 'نص تم إدخاله في حقل النص المتعدد الأسطر', helper: 'هذا نص تلميح لمساعدة المستخدم.', errorHelper: 'هذا الحقل مطلوب.' }
        };
        const l = labels[lang];

        // Build CSS classes
        const fieldClasses = ['textarea__field'];
        if (style === 'filled-darker') fieldClasses.push('textarea__field--filled-darker');
        if (style === 'filled-lighter') fieldClasses.push('textarea__field--filled-lighter');
        if (isError) fieldClasses.push('textarea__field--error');
        if (!isResize) fieldClasses.push('textarea__field--no-resize');

        const containerClasses = ['textarea'];
        if (state === 'disabled') containerClasses.push('textarea--disabled');

        // Attributes
        const attrs = [];
        attrs.push(`rows="${rows}"`);
        if (state === 'disabled') attrs.push('disabled');
        if (state === 'readonly') attrs.push('readonly');

        const content = isFilled ? l.value : '';
        const placeholder = isFilled ? '' : `placeholder="${l.placeholder}"`;

        // Label
        let labelHTML = '';
        if (showLabel) {
            const labelClass = isRequired ? 'textarea__label textarea__label--required' : 'textarea__label';
            labelHTML = `<label class="${labelClass}">${l.label}</label>`;
        }

        // Helper text
        let helperHTML = '';
        if (showHelper) {
            const helperClass = isError ? 'textarea__helper textarea__helper--error' : 'textarea__helper';
            const helperText = isError ? l.errorHelper : l.helper;
            const helperIcon = isError
                ? '<svg class="textarea__helper-icon" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8 5.333V8m0 2.667h.007M14.667 8A6.667 6.667 0 1 1 1.333 8a6.667 6.667 0 0 1 13.334 0Z" stroke="currentColor" stroke-width="1.333" stroke-linecap="round" stroke-linejoin="round"/></svg>'
                : '<svg class="textarea__helper-icon" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8 7.333V10.667M8 5.333h.007M14.667 8A6.667 6.667 0 1 1 1.333 8a6.667 6.667 0 0 1 13.334 0Z" stroke="currentColor" stroke-width="1.333" stroke-linecap="round" stroke-linejoin="round"/></svg>';
            helperHTML = `<span class="${helperClass}">${helperIcon}${helperText}</span>`;
        }

        const html = `
            <div class="${containerClasses.join(' ')}" style="width: 100%; max-width: 400px;">
                ${labelHTML}
                <textarea class="${fieldClasses.join(' ')}" ${placeholder} ${attrs.join(' ')}>${content}</textarea>
                ${helperHTML}
            </div>
        `;

        this.preview.innerHTML = html;
        this.preview.dir = isRTL ? 'rtl' : '';
    }
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { TextareaDemoManager };
}
