/* ============================================
   FILTERS (FILTERATION) MODULE
   DGA Design System - Filteration behavior + live demo
   Matches dga-filteration: the trigger toggles the floating panel;
   checkbox choices are staged and only take effect on "Apply
   filters", which renders them as primary buttons with a remove ×.
   ============================================ */

class FilterManager {
    constructor() {
        this.content = document.getElementById('component-content');
        if (!this.content) return;

        /* Static showcase niceties: search filters its block's options */
        this.content.addEventListener('input', (e) => {
            const field = e.target.closest('.filteration__search .search-box__field');
            if (!field) return;
            const q = field.value.trim().toLowerCase();
            field.closest('.filteration__block')
                ?.querySelectorAll('.filteration__block-content--checkbox .checkbox')
                .forEach(opt => {
                    const label = opt.querySelector('.checkbox__label')?.textContent.toLowerCase() || '';
                    opt.style.display = !q || label.includes(q) ? '' : 'none';
                });
        });

        // Live demo (present only on the filters page)
        this.preview = document.getElementById('filters-demo-preview');
        if (this.preview) {
            this.toggles = {};
            this.open = false;
            this.expanded = false;
            this.searchQuery = '';
            this.applied = [];   // option ids
            this.staged = [];    // option ids
            this.initSwitches();
            this.render();
            this.bindDemo();
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

    t() {
        return this.toggles['rtl']
            ? {
                trigger: 'تصفية المنتجات', block: 'الفئة', search: 'بحث',
                apply: 'تطبيق التصفية', clear: 'مسح التصفية',
                more: (n) => `عرض ${n} المزيد`, less: 'عرض أقل',
                options: [
                    { id: 'electronics', label: 'إلكترونيات' }, { id: 'clothing', label: 'ملابس' },
                    { id: 'books', label: 'كتب' }, { id: 'home', label: 'المنزل والمطبخ' },
                    { id: 'sports', label: 'رياضة' }, { id: 'beauty', label: 'الجمال والعناية' },
                ],
            }
            : {
                trigger: 'Filter Products', block: 'Category', search: 'Search',
                apply: 'Apply filters', clear: 'Clear filters',
                more: (n) => `Show ${n} more`, less: 'Show less',
                options: [
                    { id: 'electronics', label: 'Electronics' }, { id: 'clothing', label: 'Clothing' },
                    { id: 'books', label: 'Books' }, { id: 'home', label: 'Home & Kitchen' },
                    { id: 'sports', label: 'Sports' }, { id: 'beauty', label: 'Beauty & Care' },
                ],
            };
    }

    optionHTML(opt) {
        const checked = this.staged.includes(opt.id);
        return `<label class="checkbox">
            <div class="checkbox__row">
                <div class="checkbox__control">
                    <input type="checkbox" class="checkbox__input" data-option="${opt.id}" ${checked ? 'checked' : ''}>
                    <span class="checkbox__box"><svg class="checkbox__icon checkbox__icon--check" viewBox="0 0 12 12"
                        fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10 3L4.5 8.5L2 6" stroke="currentColor"
                        stroke-width="1.67" stroke-linecap="round" stroke-linejoin="round"/></svg></span>
                </div>
                <span class="checkbox__label">${opt.label}</span>
            </div>
        </label>`;
    }

    render() {
        const t = this.t();
        const q = this.searchQuery.toLowerCase();
        let visible = this.expanded || q ? t.options : t.options.slice(0, 3);
        if (q) visible = t.options.filter(o => o.label.toLowerCase().includes(q));
        const hiddenCount = t.options.length - 3;

        const appliedButtons = this.applied.map(id => {
            const opt = t.options.find(o => o.id === id);
            return opt ? `<button type="button" class="btn btn-primary" data-remove-filter="${id}">
                ${opt.label}
                <span class="icon dga-icon-multiplication-sign"></span>
            </button>` : '';
        }).join('');

        this.preview.innerHTML = `
            <div class="filteration" style="max-width: 560px;">
                <div class="filteration__toolbar">
                    <button type="button" class="btn btn-neutral" data-filteration-toggle aria-expanded="${this.open}">
                        <span class="icon dga-icon-filter"></span>
                        ${t.trigger}
                        <span class="icon dga-icon-arrow-down-01"></span>
                    </button>
                    <div class="filteration__selected-filters">${appliedButtons}</div>
                </div>
                <div class="filteration__panel${this.open ? ' is-open' : ''}">
                    <div class="filteration__block">
                        <h3 class="filteration__block-title">${t.block}</h3>
                        <div class="filteration__search">
                            <div class="search-box">
                                <span class="search-box__icon"><span class="icon dga-icon-search-01"></span></span>
                                <input type="text" class="search-box__field" data-filter-search
                                    placeholder="${t.search}" aria-label="${t.search}" value="${this.searchQuery}">
                            </div>
                        </div>
                        <div class="filteration__block-content filteration__block-content--checkbox">
                            ${visible.map(o => this.optionHTML(o)).join('')}
                        </div>
                        <div class="filteration__block-actions">
                            ${!q && hiddenCount > 0 ? `<button type="button" class="btn btn-transparent btn-medium" data-show-more>
                                ${this.expanded ? t.less : t.more(hiddenCount)}
                                <span class="icon ${this.expanded ? 'dga-icon-arrow-up-01' : 'dga-icon-arrow-down-01'}"></span>
                            </button>` : ''}
                        </div>
                        <div class="filteration__divider"></div>
                    </div>
                    <div class="filteration__actions">
                        <button type="button" class="btn btn-neutral" data-apply>${t.apply}</button>
                        <button type="button" class="btn btn-secondary-outline" data-clear>${t.clear}</button>
                    </div>
                </div>
            </div>`;
        this.preview.dir = this.toggles['rtl'] ? 'rtl' : '';
    }

    bindDemo() {
        this.preview.addEventListener('click', (e) => {
            if (e.target.closest('[data-filteration-toggle]')) {
                this.open = !this.open;
                this.render();
                return;
            }
            if (e.target.closest('[data-show-more]')) {
                this.expanded = !this.expanded;
                this.render();
                return;
            }
            if (e.target.closest('[data-apply]')) {
                this.applied = [...this.staged];
                this.open = false;
                this.render();
                return;
            }
            if (e.target.closest('[data-clear]')) {
                this.staged = [];
                this.applied = [];
                this.render();
                return;
            }
            const rm = e.target.closest('[data-remove-filter]');
            if (rm) {
                const id = rm.dataset.removeFilter;
                this.applied = this.applied.filter(x => x !== id);
                this.staged = this.staged.filter(x => x !== id);
                this.render();
            }
        });

        this.preview.addEventListener('change', (e) => {
            const input = e.target.closest('[data-option]');
            if (!input) return;
            const id = input.dataset.option;
            this.staged = input.checked ? [...this.staged, id] : this.staged.filter(x => x !== id);
        });

        this.preview.addEventListener('input', (e) => {
            const field = e.target.closest('[data-filter-search]');
            if (!field) return;
            this.searchQuery = field.value;
            const pos = field.selectionStart;
            this.render();
            const fresh = this.preview.querySelector('[data-filter-search]');
            fresh.focus();
            fresh.setSelectionRange(pos, pos);
        });
    }
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FilterManager;
}
