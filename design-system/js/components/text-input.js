/* ============================================
   TEXT INPUT DEMO MODULE
   DGA Design System - Text Input Live Demo
   Single Responsibility: Demo interaction logic
   ============================================ */

class TextInputDemoManager {
    constructor() {
        this.preview = document.getElementById('ti-demo-preview');
        this.stateSelect = document.getElementById('ti-demo-state');
        this.styleSelect = document.getElementById('ti-demo-style');
        this.sizeSelect = document.getElementById('ti-demo-size');
        this.addonTypeSelect = document.getElementById('ti-demo-addon-type');
        this.addonStyleSelect = document.getElementById('ti-demo-addon-style');

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
        this.addonTypeSelect.addEventListener('change', () => this.render());
        this.addonStyleSelect.addEventListener('change', () => this.render());
    }

    render() {
        const state = this.stateSelect.value;
        const style = this.styleSelect.value;
        const size = this.sizeSelect.value;
        const addonType = this.addonTypeSelect.value;
        const addonStyle = this.addonStyleSelect.value;
        const isRTL = this.toggles['rtl'] || false;
        const isFilled = this.toggles['filled'] !== false;
        const isError = this.toggles['error'] || false;
        const showLabel = this.toggles['show-label'] !== false;
        const isRequired = this.toggles['required'] || false;
        const showHelper = this.toggles['helper-text'] || false;
        const hasLeading = this.toggles['leading-icon'] || false;
        const hasTrailing = this.toggles['trailing-icon'] || false;
        const hasPrefix = this.toggles['prefix'] || false;
        const hasSuffix = this.toggles['suffix'] || false;

        const lang = isRTL ? 'ar' : 'en';
        const labels = {
            en: { label: 'Label', placeholder: 'Placeholder', value: 'Input text', helper: 'This is a hint text to help the user.', errorHelper: 'This field is required.', prefix: 'https://', suffix: '.com', dropdownPrefix: '+966', dropdownSuffix: 'SAR' },
            ar: { label: 'التسمية', placeholder: 'نص العنصر النائب', value: 'نص الإدخال', helper: 'هذا نص تلميح لمساعدة المستخدم.', errorHelper: 'هذا الحقل مطلوب.', prefix: 'https://', suffix: '.com', dropdownPrefix: '٩٦٦+', dropdownSuffix: 'ر.س' }
        };
        const l = labels[lang];

        // Build field CSS classes
        const fieldClasses = ['text-input__field'];
        if (style === 'filled-darker') fieldClasses.push('text-input__field--filled-darker');
        if (style === 'filled-lighter') fieldClasses.push('text-input__field--filled-lighter');
        if (isError) fieldClasses.push('text-input__field--error');
        if (size === 'medium') fieldClasses.push('text-input__field--md');

        // Container classes
        const containerClasses = ['text-input'];
        if (state === 'disabled') containerClasses.push('text-input--disabled');

        // Input attributes
        const attrs = ['type="text"'];
        if (state === 'disabled') attrs.push('disabled');
        if (state === 'readonly') attrs.push('readonly');

        const value = isFilled ? `value="${l.value}"` : `placeholder="${l.placeholder}"`;

        // SVG icons
        const searchIcon = `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M17.5 17.5L13.875 13.875M15.833 9.167a6.667 6.667 0 1 1-13.333 0 6.667 6.667 0 0 1 13.333 0Z" stroke="currentColor" stroke-width="1.667" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
        const checkIcon = `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M16.667 5L7.5 14.167 3.333 10" stroke="currentColor" stroke-width="1.667" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
        const globeIcon = `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10 1.667a8.333 8.333 0 1 0 0 16.666 8.333 8.333 0 0 0 0-16.666Zm0 0c1.841 0 3.333 3.731 3.333 8.333s-1.492 8.333-3.333 8.333S6.667 14.602 6.667 10 8.159 1.667 10 1.667ZM1.667 10h16.666" stroke="currentColor" stroke-width="1.667" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
        const chevronIcon = `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 7.5l5 5 5-5" stroke="currentColor" stroke-width="1.667" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

        // Label
        let labelHTML = '';
        if (showLabel) {
            const labelClass = isRequired ? 'text-input__label text-input__label--required' : 'text-input__label';
            labelHTML = `<label class="${labelClass}">${l.label}</label>`;
        }

        // Build addon (prefix/suffix) HTML
        const sizeClass = size === 'medium' ? ' text-input__prefix--md' : '';
        const suffixSizeClass = size === 'medium' ? ' text-input__suffix--md' : '';
        const subtlePrefix = addonStyle === 'subtle' ? ' text-input__prefix--subtle' : '';
        const subtleSuffix = addonStyle === 'subtle' ? ' text-input__suffix--subtle' : '';
        const disabledPrefix = state === 'disabled' ? ' text-input__prefix--disabled' : '';
        const disabledSuffix = state === 'disabled' ? ' text-input__suffix--disabled' : '';

        let prefixHTML = '';
        let suffixHTML = '';

        if (hasPrefix) {
            if (addonType === 'dropdown') {
                prefixHTML = `<button type="button" class="text-input__prefix text-input__prefix--dropdown${subtlePrefix}${sizeClass}${disabledPrefix}" tabindex="0">
                    <span class="text-input__addon-icon">${globeIcon}</span>
                    ${l.dropdownPrefix}
                    <span class="text-input__addon-chevron">${chevronIcon}</span>
                </button>`;
            } else {
                prefixHTML = `<span class="text-input__prefix${subtlePrefix}${sizeClass}${disabledPrefix}">${l.prefix}</span>`;
            }
        }

        if (hasSuffix) {
            if (addonType === 'dropdown') {
                suffixHTML = `<button type="button" class="text-input__suffix text-input__suffix--dropdown${subtleSuffix}${suffixSizeClass}${disabledSuffix}" tabindex="0">
                    ${l.dropdownSuffix}
                    <span class="text-input__addon-chevron">${chevronIcon}</span>
                </button>`;
            } else {
                suffixHTML = `<span class="text-input__suffix${subtleSuffix}${suffixSizeClass}${disabledSuffix}">${l.suffix}</span>`;
            }
        }

        // Determine if we need a wrapper (icons or prefix/suffix)
        const needsWrapper = hasLeading || hasTrailing || hasPrefix || hasSuffix;

        let fieldHTML = '';
        if (needsWrapper) {
            const wrapperClasses = ['text-input__field-wrapper'];
            if (hasLeading) wrapperClasses.push('text-input__field-wrapper--leading');
            if (hasTrailing) wrapperClasses.push('text-input__field-wrapper--trailing');
            if (hasPrefix) wrapperClasses.push('text-input__field-wrapper--prefix');
            if (hasSuffix) wrapperClasses.push('text-input__field-wrapper--suffix');

            const leadingIcon = hasLeading ? `<span class="text-input__icon--leading">${searchIcon}</span>` : '';
            const trailingIcon = hasTrailing ? `<span class="text-input__icon--trailing">${checkIcon}</span>` : '';

            fieldHTML = `
                <div class="${wrapperClasses.join(' ')}">
                    ${prefixHTML}
                    ${leadingIcon}
                    <input class="${fieldClasses.join(' ')}" ${value} ${attrs.join(' ')}>
                    ${trailingIcon}
                    ${suffixHTML}
                </div>`;
        } else {
            fieldHTML = `<input class="${fieldClasses.join(' ')}" ${value} ${attrs.join(' ')}>`;
        }

        // Helper text
        let helperHTML = '';
        if (showHelper) {
            const helperClass = isError ? 'text-input__helper text-input__helper--error' : 'text-input__helper';
            const helperText = isError ? l.errorHelper : l.helper;
            const helperIcon = isError
                ? '<svg class="text-input__helper-icon" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8 5.333V8m0 2.667h.007M14.667 8A6.667 6.667 0 1 1 1.333 8a6.667 6.667 0 0 1 13.334 0Z" stroke="currentColor" stroke-width="1.333" stroke-linecap="round" stroke-linejoin="round"/></svg>'
                : '<svg class="text-input__helper-icon" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8 7.333V10.667M8 5.333h.007M14.667 8A6.667 6.667 0 1 1 1.333 8a6.667 6.667 0 0 1 13.334 0Z" stroke="currentColor" stroke-width="1.333" stroke-linecap="round" stroke-linejoin="round"/></svg>';
            helperHTML = `<span class="${helperClass}">${helperIcon}${helperText}</span>`;
        }

        const html = `
            <div class="${containerClasses.join(' ')}" style="width: 100%; max-width: 360px;">
                ${labelHTML}
                ${fieldHTML}
                ${helperHTML}
            </div>
        `;

        this.preview.innerHTML = html;
        this.preview.dir = isRTL ? 'rtl' : '';
    }
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { TextInputDemoManager };
}
