/* ============================================
   NOTIFICATION DEMO MODULE
   DGA Design System - Notification Live Demo
   Single Responsibility: Demo interaction logic
   ============================================ */

class NotificationDemoManager {
    constructor() {
        this.preview = document.getElementById('notif-demo-preview');
        this.styleSelect = document.getElementById('notif-demo-style');

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
        this.styleSelect.addEventListener('change', () => this.render());
    }

    getIconSVG(style) {
        const icons = {
            critical: '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="10" fill="#D92D20"/><path d="M12 8v4m0 4h.01" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
            warning: '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" fill="#DC6803"/><path d="M12 9v4m0 4h.01" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
            success: '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="10" fill="#079455"/><path d="M8 12l2.5 2.5L16 9" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
            info: '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="10" fill="#1570EF"/><path d="M12 16v-4m0-4h.01" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
            neutral: '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="10" fill="#6C737F"/><path d="M12 16v-4m0-4h.01" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>'
        };
        return icons[style] || icons.critical;
    }

    render() {
        const style = this.styleSelect.value;
        const isRTL = this.toggles['rtl'] || false;
        const showIcon = this.toggles['icon'] !== false;
        const showLeadText = this.toggles['lead-text'] !== false;
        const showLink = this.toggles['link'] || false;
        const showButton = this.toggles['button'] || false;
        const showDismissible = this.toggles['dismissible'] !== false;

        const lang = isRTL ? 'ar' : 'en';
        const labels = {
            en: {
                lead: 'Important:',
                text: 'This is a very important banner message that requires attention',
                link: 'Learn more',
                button: 'Action Button',
                close: 'Dismiss',
                reset: 'Show notification'
            },
            ar: {
                lead: 'مهم:',
                text: 'هذه رسالة تنبيهية مهمة للغاية تستدعي التركيز.',
                link: 'تفاصيل',
                button: 'إجراء',
                close: 'إغلاق',
                reset: 'إظهار الإشعار'
            }
        };
        const l = labels[lang];

        const closeSVG = '<svg class="notification__close-icon" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M15 5L5 15M5 5l10 10" stroke="currentColor" stroke-width="1.67" stroke-linecap="round" stroke-linejoin="round"/></svg>';
        const arrowSVG = '<span class="btn__icon"><svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3.33 8h9.34M8 3.33L12.67 8 8 12.67" stroke="currentColor" stroke-width="1.33" stroke-linecap="round" stroke-linejoin="round"/></svg></span>';

        let iconHTML = '';
        if (showIcon) {
            iconHTML = `<span class="notification__icon">${this.getIconSVG(style)}</span>`;
        }

        let leadTextHTML = '';
        if (showLeadText) {
            leadTextHTML = `<span class="notification__lead-text">${l.lead}</span>`;
        }

        let actionsHTML = '';
        if (showLink || showButton) {
            let actionsContent = '';
            if (showLink) {
                actionsContent += `<a href="#" class="notification__link" onclick="event.preventDefault()">${l.link}</a>`;
            }
            if (showButton) {
                const buttonContent = isRTL
                    ? `${l.button}${arrowSVG}`
                    : `${arrowSVG}${l.button}`;
                actionsContent += `<button class="btn btn-neutral btn-medium" type="button">${buttonContent}</button>`;
            }
            actionsHTML = `<div class="notification__actions">${actionsContent}</div>`;
        }

        let closeHTML = '';
        if (showDismissible) {
            closeHTML = `<button class="notification__close" aria-label="${l.close}" onclick="this.closest('.notification').style.display='none'; document.getElementById('notif-demo-reset').style.display='flex';">${closeSVG}</button>`;
        }

        const html = `
            <div class="notification notification--${style}">
                <div class="notification__body">
                    <div class="notification__content">
                        ${iconHTML}
                        ${leadTextHTML}
                        <span class="notification__text">${l.text}</span>
                        ${actionsHTML}
                    </div>
                    ${closeHTML}
                </div>
                <div class="notification__line"></div>
            </div>
            <button id="notif-demo-reset" type="button" style="display: none; align-items: center; gap: 8px; padding: 8px 16px; background: var(--color-gray-100); border: 1px solid var(--color-gray-300); border-radius: 4px; cursor: pointer; font-family: var(--font-family-primary); font-size: 14px; color: var(--color-gray-700); margin-top: 8px;" onclick="document.getElementById('notif-demo-reset').style.display='none'; document.querySelector('#notif-demo-preview .notification').style.display='flex';">
                ${l.reset}
            </button>
        `;

        this.preview.innerHTML = html;
        this.preview.dir = isRTL ? 'rtl' : '';
    }
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { NotificationDemoManager };
}
