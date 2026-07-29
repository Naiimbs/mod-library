/* ============================================
   INLINE ALERT DEMO MODULE
   DGA Design System - Interactive Inline Alert Demo
   Powers the live demo controls on the Inline Alert page.
   ============================================ */

class InlineAlertDemoManager {
    constructor() {
        this.preview = document.getElementById('inline-alert-demo-preview');
        this.typeSelect = document.getElementById('inline-alert-demo-type');

        if (!this.preview || !this.typeSelect) return;

        this.icons = {
            neutral: 'dga-icon-help-circle',
            info: 'dga-icon-help-circle',
            error: 'dga-icon-help-circle',
            warning: 'dga-icon-alert-02',
            success: 'dga-icon-tick-02',
        };

        this.labels = {
            en: {
                title: { neutral: 'Neutral alert', info: 'Info alert', error: 'Error alert', warning: 'Warning alert', success: 'Success alert' },
                helper: 'Supporting text explains what happened and what the user can do next.',
                action1: 'Primary action',
                action2: 'Dismiss',
                closeLabel: 'Dismiss',
            },
            ar: {
                title: { neutral: 'تنبيه عام', info: 'تنبيه معلومات', error: 'تنبيه خطأ', warning: 'تنبيه تحذير', success: 'تنبيه نجاح' },
                helper: 'نص مساعد يوضح ما حدث وما يمكن للمستخدم فعله بعد ذلك.',
                action1: 'إجراء أساسي',
                action2: 'تجاهل',
                closeLabel: 'إغلاق',
            }
        };

        this.toggles = { helper: true };
        this.initSwitches();
        this.typeSelect.addEventListener('change', () => this.render());
        this.render();
    }

    initSwitches() {
        document.querySelectorAll('.live-demo__switch[data-toggle]').forEach(btn => {
            const key = btn.dataset.toggle;
            if (!(key in this.toggles)) this.toggles[key] = btn.classList.contains('active');

            btn.addEventListener('click', () => {
                this.toggles[key] = !this.toggles[key];
                btn.classList.toggle('active', this.toggles[key]);
                btn.setAttribute('aria-checked', String(this.toggles[key]));
                this.render();
            });
        });
    }

    render() {
        const type = this.typeSelect.value;
        const isRTL = !!this.toggles['rtl'];
        const t = this.labels[isRTL ? 'ar' : 'en'];
        const colored = this.toggles['colored'] ? ` inline-alert--${type}-bg` : '';
        const helper = this.toggles['helper'];

        let html = `<div class="inline-alert inline-alert--${type}${colored}" style="max-width: 560px;">`;
        html += `<div class="inline-alert__header${helper ? '' : ' inline-alert__header--centered'}">`;
        html += `<div class="inline-alert__icon"><span class="icon ${this.icons[type]}"></span></div>`;
        html += `<div class="inline-alert__body">`;
        html += `<h4 class="inline-alert__title text-md-semibold"${helper ? '' : ' style="margin-bottom:0;"'}>${t.title[type]}</h4>`;
        if (helper) html += `<p class="inline-alert__content text-sm-regular">${t.helper}</p>`;
        html += `</div>`;
        if (this.toggles['close']) {
            html += `<div class="inline-alert__close">
                <button type="button" class="btn btn-transparent btn-icon-only btn-small" aria-label="${t.closeLabel}" data-demo-close>
                    <span class="icon dga-icon-multiplication-sign"></span>
                </button></div>`;
        }
        html += `</div>`;
        if (this.toggles['actions']) {
            html += `<div class="inline-alert__action">
                <button type="button" class="btn btn-subtle btn-small">${t.action1}</button>
                <button type="button" class="btn btn-transparent btn-small">${t.action2}</button>
            </div>
            <div class="inline-alert__action-mobile">
                <button type="button" class="btn btn-secondary-outline">${t.action1}</button>
                <button type="button" class="btn btn-transparent">${t.action2}</button>
            </div>`;
        }
        html += `</div>`;

        this.preview.innerHTML = html;
        this.preview.dir = isRTL ? 'rtl' : '';

        this.preview.querySelector('[data-demo-close]')?.addEventListener('click', (e) => {
            e.target.closest('.inline-alert').remove();
        });
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = InlineAlertDemoManager;
}
