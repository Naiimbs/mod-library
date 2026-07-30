/* ============================================
   DROPDOWN MODULE
   DGA Design System - Dropdown behavior + live demo
   Delegated open/close/select for every dropdown on the page,
   matching the library: single-select swaps the trigger label and
   shows a tick; multi-select toggles checkboxes and joins labels.
   ============================================ */

class DropdownManager {
    constructor() {
        this.content = document.getElementById('component-content');
        if (!this.content) return;
        /* the router swaps the markup INSIDE #component-content — the container
           itself never disconnects. Anchor the stale-instance guard to this
           page's root node so listeners from earlier visits self-remove instead
           of stacking (stacked listeners re-toggle the same click, which made
           the dropdown need several clicks to open). */
        this.pageRoot = this.content.firstElementChild;

        this._onClick = (e) => {
            /* the router swapped pages; drop the listener once this instance is gone */
            if (!this.pageRoot || !this.pageRoot.isConnected) {
                document.removeEventListener('click', this._onClick);
                return;
            }
            // option click (before trigger handling: options live inside the dropdown)
            const option = e.target.closest('.dropdown__option');
            if (option && this.content.contains(option)) {
                this.handleOption(option);
                return;
            }
            const btn = e.target.closest('.dropdown__btn');
            if (btn && this.content.contains(btn)) {
                const dd = btn.closest('.dropdown');
                if (dd.classList.contains('dropdown--disabled') || dd.classList.contains('dropdown--readonly')) return;
                const willOpen = !btn.classList.contains('open');
                this.closeAll();
                btn.classList.toggle('open', willOpen);
                btn.setAttribute('aria-expanded', String(willOpen));
                return;
            }
            // outside click closes everything
            this.closeAll();
        };
        document.addEventListener('click', this._onClick);

        this._onKey = (e) => {
            if (!this.pageRoot || !this.pageRoot.isConnected) {
                document.removeEventListener('click', this._onClick);
                document.removeEventListener('keydown', this._onKey);
                return;
            }
            if (e.key === 'Escape') this.closeAll();
        };
        document.addEventListener('keydown', this._onKey);

        // Live demo (present only on the dropdown page)
        this.preview = document.getElementById('dropdown-demo-preview');
        if (this.preview) {
            this.sizeSelect = document.getElementById('dropdown-demo-size');
            this.variantSelect = document.getElementById('dropdown-demo-variant');
            this.stateSelect = document.getElementById('dropdown-demo-state');
            this.toggles = {};
            this.initSwitches();
            [this.sizeSelect, this.variantSelect, this.stateSelect].forEach(sel =>
                sel && sel.addEventListener('change', () => this.render()));
            this.render();
        }
    }

    closeAll() {
        if (!this.pageRoot || !this.pageRoot.isConnected) return;
        this.content.querySelectorAll('.dropdown__btn.open').forEach(b => {
            b.classList.remove('open');
            b.setAttribute('aria-expanded', 'false');
        });
    }

    handleOption(option) {
        const dd = option.closest('.dropdown');
        const btn = dd.querySelector('.dropdown__btn');
        const label = dd.querySelector('.dropdown__label');
        const multi = dd.classList.contains('dropdown--multi-select');

        if (multi) {
            option.classList.toggle('selected');
        } else {
            dd.querySelectorAll('.dropdown__option.selected').forEach(o => o.classList.remove('selected'));
            option.classList.add('selected');
        }

        const selected = [...dd.querySelectorAll('.dropdown__option.selected .dropdown__option-label')]
            .map(el => el.textContent.trim());
        if (label) {
            label.textContent = selected.join(', ');
            label.classList.toggle('dropdown__label--selection', selected.length > 0);
        }

        if (!multi) {
            btn.classList.remove('open');
            btn.setAttribute('aria-expanded', 'false');
        }
    }

    /* ---------- live demo ---------- */
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

    optionHTML(labelText, multi, selected) {
        if (multi) {
            return `<li><button type="button" class="dropdown__option dropdown__option--checkbox${selected ? ' selected' : ''}">
                <span class="dropdown__option-icon-container"><span class="dropdown__option-icon icon dga-icon-tick-02"></span></span>
                <span class="dropdown__option-label">${labelText}</span>
            </button></li>`;
        }
        return `<li><button type="button" class="dropdown__option${selected ? ' selected' : ''}">
            <span class="dropdown__option-label">${labelText}</span>
            <span class="dropdown__option-icon icon dga-icon-tick-02"></span>
        </button></li>`;
    }

    render() {
        const size = this.sizeSelect.value;
        const variant = this.variantSelect.value;
        const state = this.stateSelect.value;
        const multi = !!this.toggles['multi'];
        const isRTL = !!this.toggles['rtl'];

        const t = isRTL
            ? { label: 'المنطقة', placeholder: 'اختر منطقة', options: ['الرياض', 'مكة المكرمة', 'المدينة المنورة', 'المنطقة الشرقية'] }
            : { label: 'Region', placeholder: 'Select a region', options: ['Riyadh', 'Makkah', 'Madinah', 'Eastern Province'] };

        const mods = ['dropdown', `dropdown--${size}`];
        if (variant !== 'default') mods.push(`dropdown--${variant}`);
        if (state === 'error') mods.push('dropdown--error');
        if (state === 'disabled') mods.push('dropdown--disabled');
        if (state === 'readonly') mods.push('dropdown--readonly');
        if (multi) mods.push('dropdown--multi-select');

        const feedback = state === 'error'
            ? `<span class="dropdown__feedback-icon dropdown__feedback-icon--error"><span class="icon dga-icon-cancel-circle"></span></span>`
            : '';

        this.preview.innerHTML = `
            <div class="dropdown-field" style="max-width: 320px;">
                ${this.toggles['label'] ? `<span class="dropdown-field__label">${t.label}</span>` : ''}
                <div class="${mods.join(' ')}">
                    <button type="button" class="dropdown__btn" aria-haspopup="listbox" aria-expanded="false"
                        ${state === 'disabled' || state === 'readonly' ? 'disabled' : ''}>
                        <span class="dropdown__label"></span>
                        <span class="dropdown__label-placeholder">${t.placeholder}</span>
                        ${feedback}
                        <span class="dropdown__chevron icon dga-icon-arrow-down-01" aria-hidden="true"></span>
                    </button>
                    <ul class="dropdown__list" role="listbox">
                        ${t.options.map(o => this.optionHTML(o, multi, false)).join('')}
                    </ul>
                </div>
            </div>`;
        this.preview.dir = isRTL ? 'rtl' : '';
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = DropdownManager;
}
