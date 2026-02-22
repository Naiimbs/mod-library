/* ============================================
   NOTIFICATION TOAST DEMO MODULE
   DGA Design System - Notification Toast Live Demo
   Single Responsibility: Demo interaction logic
   ============================================ */

class NotificationToastDemoManager {
    constructor() {
        this.preview = document.getElementById('toast-demo-preview');
        this.typeSelect = document.getElementById('toast-demo-type');

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
        this.typeSelect.addEventListener('change', () => this.render());
    }

    getIconSVG(type) {
        const icons = {
            neutral: '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="9" stroke="#6C737F" stroke-width="2"/><path d="M12 16v-4m0-4h.01" stroke="#6C737F" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
            info: '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="9" stroke="#1570EF" stroke-width="2"/><path d="M12 16v-4m0-4h.01" stroke="#1570EF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
            critical: '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="#D92D20" stroke-width="2" fill="none"/><path d="M12 9v4m0 4h.01" stroke="#D92D20" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
            warning: '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="9" stroke="#DC6803" stroke-width="2"/><path d="M12 8v4m0 4h.01" stroke="#DC6803" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
            success: '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="9" stroke="#079455" stroke-width="2"/><path d="M8 12l2.5 2.5L16 9.5" stroke="#079455" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>'
        };
        return icons[type] || icons.neutral;
    }

    render() {
        const type = this.typeSelect.value;
        const isRTL = this.toggles['rtl'] || false;
        const isMobile = this.toggles['mobile'] || false;
        const showHelperText = this.toggles['helper-text'] !== false;
        const showActions = this.toggles['actions'] !== false;
        const showSecondaryAction = this.toggles['secondary-action'] !== false;
        const showCloseButton = this.toggles['close-button'] !== false;

        const lang = isRTL ? 'ar' : 'en';
        const labels = {
            en: {
                title: 'Notification/Alert message title',
                helper: 'When a Notification/Alert needs a further detailed explanation, it goes here.',
                button: 'Button',
                close: 'Dismiss',
                reset: 'Show toast'
            },
            ar: {
                title: 'عنوان رسالة الاشعار أو التنبيه',
                helper: 'يكتب المحتوى الإضافي هنا في حال ان رسالة الاشعار أو التنبيه تحتاج الى شرح أو تفصيل.',
                button: 'إجراء',
                close: 'إغلاق',
                reset: 'إظهار الإشعار'
            }
        };
        const l = labels[lang];

        const closeSVG = '<svg class="notification-toast__close-icon" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M15 5L5 15M5 5l10 10" stroke="currentColor" stroke-width="1.67" stroke-linecap="round" stroke-linejoin="round"/></svg>';

        const mobileClass = isMobile ? ' notification-toast--mobile' : '';

        const iconHTML = `<div class="notification-toast__icon">${this.getIconSVG(type)}</div>`;

        const helperHTML = showHelperText
            ? `<p class="notification-toast__helper">${l.helper}</p>`
            : '';

        const textHTML = `<div class="notification-toast__text">
            <p class="notification-toast__title">${l.title}</p>
            ${helperHTML}
        </div>`;

        const closeHTML = showCloseButton
            ? `<button class="notification-toast__close" aria-label="${l.close}" onclick="this.closest('.notification-toast').style.display='none'; document.getElementById('toast-demo-reset').style.display='flex';">${closeSVG}</button>`
            : '';

        let actionsHTML = '';
        if (showActions) {
            const btnClass = isMobile
                ? 'btn btn-secondary-solid btn-full-width'
                : 'btn btn-subtle btn-medium';
            const secondaryHTML = showSecondaryAction
                ? `<button class="${btnClass}" type="button">${l.button}</button>`
                : '';
            actionsHTML = `<div class="notification-toast__actions">
                <button class="${btnClass}" type="button">${l.button}</button>
                ${secondaryHTML}
            </div>`;
        }

        let headerHTML;
        if (isMobile) {
            // Mobile: icon + close in header, text separate
            headerHTML = `<div class="notification-toast__header">
                ${iconHTML}
                ${closeHTML}
            </div>
            ${textHTML}`;
        } else {
            // Desktop: icon + text + close in one row
            headerHTML = `<div class="notification-toast__header">
                ${iconHTML}
                ${textHTML}
                ${closeHTML}
            </div>`;
        }

        const html = `
            <div class="notification-toast notification-toast--${type}${mobileClass}">
                ${headerHTML}
                ${actionsHTML}
                <div class="notification-toast__line"></div>
            </div>
            <button id="toast-demo-reset" type="button" style="display: none; align-items: center; gap: 8px; padding: 8px 16px; background: var(--color-gray-100); border: 1px solid var(--color-gray-300); border-radius: 4px; cursor: pointer; font-family: var(--font-family-primary); font-size: 14px; color: var(--color-gray-700); margin-top: 8px;" onclick="document.getElementById('toast-demo-reset').style.display='none'; document.querySelector('#toast-demo-preview .notification-toast').style.display='flex';">
                ${l.reset}
            </button>
        `;

        this.preview.innerHTML = html;
        this.preview.dir = isRTL ? 'rtl' : '';
    }
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { NotificationToastDemoManager };
}
