/* ============================================
   SEARCH BOX MODULE
   DGA Design System - Search box behavior + live demo
   Focus grows the bottom press line; typing reveals the clear
   action; clearing refocuses the field.
   ============================================ */

class SearchBoxManager {
    constructor() {
        this.content = document.getElementById('component-content');
        if (!this.content) return;

        this.content.addEventListener('focusin', (e) => {
            const field = e.target.closest('.search-box__field');
            field?.closest('.search-box')?.classList.add('focus');
        });
        this.content.addEventListener('focusout', (e) => {
            const field = e.target.closest('.search-box__field');
            field?.closest('.search-box')?.classList.remove('focus');
        });
        this.content.addEventListener('input', (e) => {
            const field = e.target.closest('.search-box__field');
            if (field) this.updateActions(field.closest('.search-box'));
        });
        this.content.addEventListener('click', (e) => {
            const clear = e.target.closest('[data-search-clear]');
            if (!clear || !this.content.contains(clear)) return;
            const box = clear.closest('.search-box');
            const field = box.querySelector('.search-box__field');
            field.value = '';
            this.updateActions(box);
            field.focus();
        });

        this.content.querySelectorAll('.search-box').forEach(box => this.updateActions(box));

        // Live demo (present only on the search-box page)
        this.preview = document.getElementById('search-box-demo-preview');
        if (this.preview) {
            this.stateSelect = document.getElementById('search-box-demo-state');
            this.toggles = { clear: true };
            this.initSwitches();
            this.stateSelect.addEventListener('change', () => this.render());
            this.render();
        }
    }

    updateActions(box) {
        const field = box.querySelector('.search-box__field');
        const actions = box.querySelector('.search-box__actions');
        if (actions) actions.style.display = field.value ? '' : 'none';
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
        const state = this.stateSelect.value;
        const isRTL = !!this.toggles['rtl'];
        const t = isRTL
            ? { placeholder: 'ابحث في الخدمات...', label: 'بحث' }
            : { placeholder: 'Search services...', label: 'Search' };

        const mods = ['search-box'];
        if (state === 'error') mods.push('search-box--error');
        if (state === 'readonly') mods.push('search-box--readonly');
        if (state === 'disabled') mods.push('search-box--disabled');

        const feedback = state === 'error'
            ? `<span class="search-box__feedback-icon search-box__feedback-icon--error"><span class="icon dga-icon-cancel-circle"></span></span>`
            : state === 'success'
                ? `<span class="search-box__feedback-icon search-box__feedback-icon--success"><span class="icon dga-icon-checkmark-circle-02"></span></span>`
                : '';

        this.preview.innerHTML = `
            <div class="${mods.join(' ')}" style="max-width: 360px;">
                <span class="search-box__icon"><span class="icon dga-icon-search-01" aria-hidden="true"></span></span>
                <input type="text" class="search-box__field" placeholder="${t.placeholder}" aria-label="${t.label}"
                    ${state === 'disabled' ? 'disabled' : ''} ${state === 'readonly' ? 'readonly value="Read-only query"' : ''}>
                ${feedback}
                ${this.toggles['clear'] ? `<div class="search-box__actions" style="display:none;">
                    <button type="button" class="search-box__action-btn" data-search-clear aria-label="Clear search">
                        <span class="icon dga-icon-multiplication-sign"></span>
                    </button>
                </div>` : ''}
            </div>`;
        this.preview.dir = isRTL ? 'rtl' : '';
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = SearchBoxManager;
}
