/* ============================================
   TABLE DEMO MODULE
   DGA Design System - Interactive Table Demo
   Powers the live demo controls on the Tables page and adds light
   interactivity (sortable headers, select-all + per-row checkboxes,
   filter button toggle) to the static showcase tables.
   ============================================ */

class TableDemoManager {
    constructor() {
        this.preview = document.getElementById('table-demo-preview');
        this.densitySelect = document.getElementById('table-demo-density');
        this.sortSelect = document.getElementById('table-demo-sort');
        this.cellTypeSelect = document.getElementById('table-demo-cell-type');

        if (!this.preview) return;

        this.labels = {
            en: {
                name: 'Name',
                role: 'Role',
                team: 'Team',
                status: 'Status',
                joined: 'Joined',
                row: [
                    { name: 'Sara Al-Otaibi',  role: 'Admin',     team: 'Platform',   status: 'Active',   joined: 'Jan 12, 2026' },
                    { name: 'Khalid Al-Subaie', role: 'Editor',    team: 'Content',    status: 'Pending',  joined: 'Feb 04, 2026' },
                    { name: 'Maya Hassan',     role: 'Reviewer',  team: 'QA',         status: 'Active',   joined: 'Mar 18, 2026' },
                    { name: 'Omar Al-Harbi',   role: 'Viewer',    team: 'Analytics',  status: 'Inactive', joined: 'Apr 02, 2026' },
                ],
            },
            ar: {
                name: 'الاسم',
                role: 'الدور',
                team: 'الفريق',
                status: 'الحالة',
                joined: 'تاريخ الانضمام',
                row: [
                    { name: 'سارة العتيبي',   role: 'مدير',     team: 'المنصة',     status: 'نشط',      joined: '12 يناير 2026' },
                    { name: 'خالد السبيعي',  role: 'محرر',     team: 'المحتوى',    status: 'قيد المراجعة', joined: '04 فبراير 2026' },
                    { name: 'مايا حسن',     role: 'مراجع',    team: 'الجودة',     status: 'نشط',      joined: '18 مارس 2026' },
                    { name: 'عمر الحربي',    role: 'مشاهد',    team: 'التحليلات',  status: 'غير نشط',  joined: '02 أبريل 2026' },
                ],
            },
        };

        this.toggles = {};
        this.sortState = { column: 'name', direction: 'asc' };
        this.initSwitches();
        this.bindEvents();
        this.render();
        this.bindShowcaseTables();
    }

    initSwitches() {
        document.querySelectorAll('.live-demo__switch[data-toggle]').forEach(btn => {
            const key = btn.dataset.toggle;
            this.toggles[key] = btn.getAttribute('aria-checked') === 'true';

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
        if (this.densitySelect) {
            this.densitySelect.addEventListener('change', () => this.render());
        }
        if (this.sortSelect) {
            this.sortSelect.addEventListener('change', () => {
                this.sortState.column = this.sortSelect.value;
                this.render();
            });
        }
        if (this.cellTypeSelect) {
            this.cellTypeSelect.addEventListener('change', () => this.render());
        }
    }

    // Map a Role value (en or ar) to a status-tag variant for the "Status tag"
    // cell type demo.
    roleStatusVariant(role) {
        const r = role.toLowerCase();
        if (r.includes('admin')   || role.includes('مدير'))   return 'success';
        if (r.includes('editor')  || role.includes('محرر'))   return 'info';
        if (r.includes('reviewer')|| role.includes('مراجع'))  return 'warning';
        return 'neutral';
    }

    // Render a single Role-column <td> in the style chosen by the Cell type
    // select. Mirrors every variant documented in the "Body Cell Types" section.
    renderRoleCell(role) {
        const type = this.cellTypeSelect ? this.cellTypeSelect.value : 'text';
        switch (type) {
            case 'link':
                return `<td class="table__cell--link">${role}</td>`;
            case 'tag':
                return `<td><span class="tag tag--neutral tag--sm">${role}</span></td>`;
            case 'status': {
                const v = this.roleStatusVariant(role);
                return `<td><span class="status-tag status-tag--sm status-tag--subtle status-tag--${v}"><span class="status-tag__dot"></span><span class="status-tag__label">${role}</span></span></td>`;
            }
            case 'action':
                return `<td class="table__cell--action"><button type="button" class="table__action" aria-label="${role}">${this.arrowSVG()}</button></td>`;
            case 'checkbox':
                return `<td><input type="checkbox" class="table__checkbox" aria-label="${role}"></td>`;
            case 'text':
            default:
                return `<td>${role}</td>`;
        }
    }

    statusTagClass(status) {
        const s = status.toLowerCase();
        if (s.includes('active') || s === 'نشط') return 'status-tag--success';
        if (s.includes('pending') || s.includes('review') || s.includes('مراجع')) return 'status-tag--warning';
        if (s.includes('inactive') || s.includes('غير')) return 'status-tag--neutral';
        return 'status-tag--neutral';
    }

    sortRows(rows, column, direction) {
        if (!direction) return rows;
        const sorted = [...rows].sort((a, b) => a[column].localeCompare(b[column], 'en'));
        return direction === 'desc' ? sorted.reverse() : sorted;
    }

    render() {
        const density = this.densitySelect ? this.densitySelect.value : 'regular';
        const isRTL = !!this.toggles['rtl'];
        const showSelection = !!this.toggles['selection'];
        const showSort = !!this.toggles['sort'];
        const showFilter = !!this.toggles['filter'];
        const striped = !!this.toggles['striped'];
        const bordered = !!this.toggles['bordered'];

        const lang = isRTL ? 'ar' : 'en';
        const t = this.labels[lang];

        const tableClasses = ['table'];
        if (density === 'compact') tableClasses.push('table--compact');
        if (density === 'relaxed') tableClasses.push('table--relaxed');
        if (striped) tableClasses.push('table--striped');
        if (bordered) tableClasses.push('table--bordered');

        const sortCol = showSort ? this.sortState.column : null;
        const sortDir = showSort ? this.sortState.direction : null;
        const rows = this.sortRows(t.row, sortCol || 'name', sortCol ? sortDir : null);

        const headerCell = (key, label) => {
            if (!showSort || key === 'status' || key === 'joined') {
                return `<th>${label}</th>`;
            }
            const active = sortCol === key ? sortDir : '';
            return `<th><button type="button" class="table__sort" data-sort="${active}" data-sort-key="${key}">
    <span>${label}</span>
    <span class="table__sort-icon" aria-hidden="true"></span>
</button></th>`;
        };

        const filterCell = showFilter
            ? `<th class="table__cell--action">
    <button type="button" class="table__filter" aria-pressed="false" aria-label="Filter">
        <span class="table__filter-icon">${this.filterSVG()}</span>
    </button>
</th>`
            : '';

        const selectAllCell = showSelection
            ? `<th class="table__cell--checkbox">
    <input type="checkbox" class="table__checkbox" data-role="select-all" aria-label="Select all rows">
</th>`
            : '';

        const head = `<thead><tr>${selectAllCell}${headerCell('name', t.name)}${headerCell('role', t.role)}${headerCell('team', t.team)}<th>${t.status}</th><th>${t.joined}</th>${filterCell}</tr></thead>`;

        const body = `<tbody>${rows.map(r => `<tr>
    ${showSelection ? '<td class="table__cell--checkbox"><input type="checkbox" class="table__checkbox" aria-label="Select row"></td>' : ''}
    <td class="table__cell--link">${r.name}</td>
    ${this.renderRoleCell(r.role)}
    <td>${r.team}</td>
    <td><span class="status-tag status-tag--sm status-tag--subtle ${this.statusTagClass(r.status)}"><span class="status-tag__dot"></span><span class="status-tag__label">${r.status}</span></span></td>
    <td>${r.joined}</td>
    ${showFilter ? '<td class="table__cell--action"><button type="button" class="table__action" aria-label="Open row">' + this.arrowSVG() + '</button></td>' : ''}
</tr>`).join('')}</tbody>`;

        this.preview.innerHTML = `<div class="table-wrapper">
    <table class="${tableClasses.join(' ')}">${head}${body}</table>
</div>`;

        this.preview.dir = isRTL ? 'rtl' : '';

        this.bindLiveDemoBehaviors();
    }

    bindLiveDemoBehaviors() {
        // Sort header clicks
        this.preview.querySelectorAll('.table__sort').forEach(btn => {
            btn.addEventListener('click', () => {
                const key = btn.dataset.sortKey;
                if (this.sortState.column === key) {
                    this.sortState.direction = this.sortState.direction === 'asc' ? 'desc' : 'asc';
                } else {
                    this.sortState.column = key;
                    this.sortState.direction = 'asc';
                }
                if (this.sortSelect) this.sortSelect.value = key;
                this.render();
            });
        });

        // Select-all toggling per-row checkboxes
        const selectAll = this.preview.querySelector('[data-role="select-all"]');
        const rowBoxes = this.preview.querySelectorAll('tbody .table__checkbox');
        const refreshSelectAll = () => {
            if (!selectAll) return;
            const total = rowBoxes.length;
            const checked = [...rowBoxes].filter(c => c.checked).length;
            selectAll.checked = checked > 0 && checked === total;
            selectAll.indeterminate = checked > 0 && checked < total;
        };
        if (selectAll) {
            selectAll.addEventListener('change', () => {
                rowBoxes.forEach(c => { c.checked = selectAll.checked; });
                this.markSelectedRows();
                refreshSelectAll();
            });
        }
        rowBoxes.forEach(c => c.addEventListener('change', () => {
            this.markSelectedRows();
            refreshSelectAll();
        }));

        // Filter button toggle
        this.preview.querySelectorAll('.table__filter').forEach(btn => {
            btn.addEventListener('click', () => {
                const pressed = btn.getAttribute('aria-pressed') === 'true';
                btn.setAttribute('aria-pressed', String(!pressed));
                btn.classList.toggle('is-active', !pressed);
            });
        });
    }

    markSelectedRows() {
        this.preview.querySelectorAll('tbody tr').forEach(tr => {
            const box = tr.querySelector('.table__checkbox');
            tr.classList.toggle('is-selected', !!(box && box.checked));
        });
    }

    // Attach the same interactive behaviors (sort, select-all, filter) to
    // the static showcase tables that opt in via [data-table-interactive].
    bindShowcaseTables() {
        document.querySelectorAll('[data-table-interactive]').forEach(scope => {
            // Sort
            scope.querySelectorAll('.table__sort').forEach(btn => {
                btn.addEventListener('click', () => {
                    const cur = btn.dataset.sort || '';
                    const next = cur === 'asc' ? 'desc' : cur === 'desc' ? '' : 'asc';
                    // Clear sibling sort indicators
                    scope.querySelectorAll('.table__sort').forEach(o => { if (o !== btn) o.dataset.sort = ''; });
                    btn.dataset.sort = next;
                });
            });

            // Select-all + rows
            const selectAll = scope.querySelector('[data-role="select-all"]');
            const rowBoxes = scope.querySelectorAll('tbody .table__checkbox');
            const refresh = () => {
                if (!selectAll) return;
                const total = rowBoxes.length;
                const checked = [...rowBoxes].filter(c => c.checked).length;
                selectAll.checked = checked > 0 && checked === total;
                selectAll.indeterminate = checked > 0 && checked < total;
            };
            const markRows = () => {
                rowBoxes.forEach(c => {
                    const tr = c.closest('tr');
                    if (tr) tr.classList.toggle('is-selected', c.checked);
                });
            };
            if (selectAll) {
                selectAll.addEventListener('change', () => {
                    rowBoxes.forEach(c => { c.checked = selectAll.checked; });
                    markRows();
                    refresh();
                });
            }
            rowBoxes.forEach(c => c.addEventListener('change', () => {
                markRows();
                refresh();
            }));
            refresh();

            // Filter buttons
            scope.querySelectorAll('.table__filter').forEach(btn => {
                btn.addEventListener('click', () => {
                    const pressed = btn.getAttribute('aria-pressed') === 'true';
                    btn.setAttribute('aria-pressed', String(!pressed));
                    btn.classList.toggle('is-active', !pressed);
                });
            });
        });
    }

    filterSVG() {
        return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h12L9.5 9v4.5L6.5 12V9L2 3z"/></svg>';
    }

    arrowSVG() {
        return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 8h10M9 4l4 4-4 4"/></svg>';
    }
}
