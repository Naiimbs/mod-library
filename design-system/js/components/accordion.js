/* ============================================
   ACCORDION MODULE
   DGA Design System - Accordion behavior + live demo
   Delegated open/close matching the library: the body animates
   max-height to scrollHeight + 24 (the expanded bottom padding).
   ============================================ */

class AccordionManager {
    constructor() {
        this.content = document.getElementById('component-content');
        if (!this.content) return;

        /* Delegated toggle for every accordion on the page (showcases + demo) */
        this._onClick = (e) => {
            const header = e.target.closest('.accordion-item__header');
            if (!header || !this.content.contains(header)) return;
            const item = header.closest('.accordion-item');
            if (!item || item.classList.contains('disabled')) return;
            this.toggle(item);
        };
        this.content.addEventListener('click', this._onClick);

        // Live demo (present only on the accordion page)
        this.preview = document.getElementById('accordion-demo-preview');
        if (this.preview) {
            this.sizeSelect = document.getElementById('accordion-demo-size');
            this.iconSelect = document.getElementById('accordion-demo-icon');
            this.toggles = {};
            this.initSwitches();
            [this.sizeSelect, this.iconSelect].forEach(sel =>
                sel && sel.addEventListener('change', () => this.render()));
            this.render();
        }
    }

    toggle(item) {
        const body = item.querySelector('.accordion-item__body');
        const isOpen = item.classList.contains('active');
        const header = item.querySelector('.accordion-item__header');
        if (isOpen) {
            item.classList.remove('active');
            body.style.maxHeight = null;
            header?.setAttribute('aria-expanded', 'false');
        } else {
            item.classList.add('active');
            body.style.maxHeight = (body.scrollHeight + 24) + 'px';
            header?.setAttribute('aria-expanded', 'true');
        }
    }

    initSwitches() {
        document.querySelectorAll('.live-demo__switch[data-toggle]').forEach(btn => {
            const key = btn.dataset.toggle;
            this.toggles[key] = btn.classList.contains('active');

            btn.addEventListener('click', () => {
                this.toggles[key] = !this.toggles[key];
                btn.classList.toggle('active', this.toggles[key]);
                btn.setAttribute('aria-checked', String(this.toggles[key]));
                this.render();
            });
        });
    }

    itemHTML(title, body, opts) {
        const mods = [`accordion-item--${opts.size}`];
        if (opts.icon === 'leading') mods.push('accordion-item--icon-leading');
        if (opts.flush) mods.push('accordion-item--flush');
        if (opts.disabled) mods.push('disabled');
        const arrow = `<span class="accordion-item__arrow icon dga-icon-arrow-down-01" aria-hidden="true"></span>`;
        return `<li class="accordion-item ${mods.join(' ')}">
            <button type="button" class="accordion-item__header" aria-expanded="false">
                ${opts.icon === 'leading' ? arrow : ''}
                <span class="accordion-item__title">${title}</span>
                ${opts.icon === 'trailing' ? arrow : ''}
            </button>
            <div class="accordion-item__body"><p>${body}</p></div>
        </li>`;
    }

    render() {
        const isRTL = !!this.toggles['rtl'];
        const opts = {
            size: this.sizeSelect.value,
            icon: this.iconSelect.value,
            flush: !!this.toggles['flush'],
            disabled: !!this.toggles['disabled'],
        };
        const t = isRTL
            ? {
                items: [
                    ['ما هي بوابة الخدمات الرقمية؟', 'بوابة موحدة للوصول إلى الخدمات الحكومية الرقمية في المملكة.'],
                    ['كيف يمكنني إنشاء حساب؟', 'يمكنك التسجيل باستخدام النفاذ الوطني الموحد خلال دقائق.'],
                    ['هل الخدمة مجانية؟', 'نعم، جميع الخدمات الأساسية متاحة دون رسوم.'],
                ]
            }
            : {
                items: [
                    ['What is the digital services portal?', 'A unified portal for accessing government digital services in the Kingdom.'],
                    ['How do I create an account?', 'You can register with the national single sign-on in a few minutes.'],
                    ['Is the service free?', 'Yes. All core services are available at no charge.'],
                ]
            };
        this.preview.innerHTML = `<ul class="accordion" style="max-width: 520px; min-width: 320px;">${t.items.map(([q, a]) => this.itemHTML(q, a, opts)).join('')}</ul>`;
        this.preview.dir = isRTL ? 'rtl' : '';
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = AccordionManager;
}
