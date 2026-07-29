/* ============================================
   DATE PICKER COMPONENT MODULE
   DGA Design System - Date Picker Interactions
   Handles calendar rendering, date selection,
   month navigation, year dropdown, and keyboard support.
   ============================================ */

/**
 * DatePickerManager class
 * Manages all interactive date picker instances on the page.
 */
class DatePickerManager {
    constructor() {
        this.instances = [];
        this.init();
    }

    /**
     * Initialize all date picker instances on the page
     */
    init() {
        this.initLiveDemo();

        this.initInstance({
            containerId: 'interactive-datepicker',
            inputId: 'datepicker-input',
            panelId: 'datepicker-panel',
            gridId: 'datepicker-grid',
            monthLabelId: 'datepicker-month-label',
            yearLabelId: 'datepicker-year-label',
            yearDropdownId: 'datepicker-year-dropdown',
            yearTriggerId: 'datepicker-year-trigger',
            yearMenuId: 'datepicker-year-menu',
            prevBtnId: 'datepicker-prev',
            nextBtnId: 'datepicker-next',
            clearBtnId: 'datepicker-clear',
            todayBtnId: 'datepicker-today'
        });

        this.initInstance({
            containerId: 'interactive-datepicker-2',
            inputId: 'datepicker-input-2',
            panelId: 'datepicker-panel-2',
            gridId: 'datepicker-grid-2',
            monthLabelId: 'datepicker-month-label-2',
            yearLabelId: 'datepicker-year-label-2',
            yearDropdownId: 'datepicker-year-dropdown-2',
            yearTriggerId: 'datepicker-year-trigger-2',
            yearMenuId: 'datepicker-year-menu-2',
            prevBtnId: 'datepicker-prev-2',
            nextBtnId: 'datepicker-next-2',
            clearBtnId: 'datepicker-clear-2',
            todayBtnId: 'datepicker-today-2'
        });

        this.initStaticCalendarDemo();
        this.initPresetsDemo();
        this.initUseCaseCalendarDemos();
        this.initClickOutside();
        this.initKeyboard();
    }

    /**
     * Initialize a single date picker instance
     */
    initInstance(config) {
        const container = document.getElementById(config.containerId);
        if (!container) return;

        const input = document.getElementById(config.inputId);
        const panel = document.getElementById(config.panelId);
        const grid = document.getElementById(config.gridId);
        const monthLabel = document.getElementById(config.monthLabelId);
        const yearLabel = document.getElementById(config.yearLabelId);
        const yearDropdown = document.getElementById(config.yearDropdownId);
        const yearTrigger = document.getElementById(config.yearTriggerId);
        const yearMenu = document.getElementById(config.yearMenuId);
        const prevBtn = document.getElementById(config.prevBtnId);
        const nextBtn = document.getElementById(config.nextBtnId);
        const clearBtn = document.getElementById(config.clearBtnId);
        const todayBtn = document.getElementById(config.todayBtnId);

        if (!input || !panel || !grid) return;

        const today = new Date();
        const instance = {
            container,
            input,
            panel,
            grid,
            monthLabel,
            yearLabel,
            yearDropdown,
            yearTrigger,
            yearMenu,
            prevBtn,
            nextBtn,
            clearBtn,
            todayBtn,
            currentMonth: today.getMonth(),
            currentYear: today.getFullYear(),
            selectedDate: null,
            isOpen: false
        };

        this.instances.push(instance);

        // Bind events
        input.addEventListener('click', () => this.togglePanel(instance));

        if (prevBtn) {
            prevBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.navigateMonth(instance, -1);
            });
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.navigateMonth(instance, 1);
            });
        }

        if (clearBtn) {
            clearBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.clearSelection(instance);
            });
        }

        if (todayBtn) {
            todayBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.selectToday(instance);
            });
        }

        if (yearTrigger && yearDropdown) {
            yearTrigger.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleYearDropdown(instance);
            });
        }

        // Render initial calendar
        this.renderCalendar(instance);
        this.buildYearMenu(instance);
    }

    /**
     * Toggle the calendar panel open/close
     */
    togglePanel(instance) {
        if (instance.isOpen) {
            this.closePanel(instance);
        } else {
            // Close all other panels first
            this.instances.forEach(inst => {
                if (inst !== instance && inst.isOpen) {
                    this.closePanel(inst);
                }
            });
            this.openPanel(instance);
        }
    }

    /**
     * Open the calendar panel
     */
    openPanel(instance) {
        instance.isOpen = true;
        instance.container.classList.add('is-open');
        instance.input.classList.add('date-field__input--active');
    }

    /**
     * Close the calendar panel
     */
    closePanel(instance) {
        instance.isOpen = false;
        instance.container.classList.remove('is-open');
        instance.input.classList.remove('date-field__input--active');
        // Also close year dropdown
        if (instance.yearDropdown) {
            instance.yearDropdown.classList.remove('is-open');
        }
    }

    /**
     * Navigate months forward or backward
     */
    navigateMonth(instance, direction) {
        instance.currentMonth += direction;
        if (instance.currentMonth > 11) {
            instance.currentMonth = 0;
            instance.currentYear++;
        } else if (instance.currentMonth < 0) {
            instance.currentMonth = 11;
            instance.currentYear--;
        }
        this.renderCalendar(instance);
        this.updateHeader(instance);
    }

    /**
     * Render the calendar grid for the current month/year
     */
    renderCalendar(instance) {
        const grid = instance.grid;
        grid.innerHTML = '';

        const year = instance.currentYear;
        const month = instance.currentMonth;
        const today = new Date();
        const todayDate = today.getDate();
        const todayMonth = today.getMonth();
        const todayYear = today.getFullYear();

        // First day of the month (0 = Sunday)
        const firstDay = new Date(year, month, 1).getDay();
        // Days in current month
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        // Days in previous month
        const daysInPrevMonth = new Date(year, month, 0).getDate();

        // Previous month filler cells
        for (let i = firstDay - 1; i >= 0; i--) {
            const cell = this.createDateCell(daysInPrevMonth - i, ['date-cell--outside', 'date-cell--disabled']);
            grid.appendChild(cell);
        }

        // Current month cells
        for (let day = 1; day <= daysInMonth; day++) {
            const classes = [];

            // Check if today
            if (day === todayDate && month === todayMonth && year === todayYear) {
                classes.push('date-cell--today');
            }

            // Check if selected
            if (instance.selectedDate &&
                day === instance.selectedDate.getDate() &&
                month === instance.selectedDate.getMonth() &&
                year === instance.selectedDate.getFullYear()) {
                classes.push('date-cell--selected');
            }

            const cell = this.createDateCell(day, classes);
            cell.addEventListener('click', (e) => {
                e.stopPropagation();
                this.selectDate(instance, year, month, day);
            });
            grid.appendChild(cell);
        }

        // Next month filler cells
        const totalCells = grid.children.length;
        const remaining = totalCells <= 35 ? 35 - totalCells : 42 - totalCells;
        for (let i = 1; i <= remaining; i++) {
            const cell = this.createDateCell(i, ['date-cell--outside', 'date-cell--disabled']);
            grid.appendChild(cell);
        }

        this.updateHeader(instance);
    }

    /**
     * Create a date cell element
     */
    createDateCell(day, classes = []) {
        const cell = document.createElement('div');
        cell.className = 'date-cell';
        classes.forEach(cls => cell.classList.add(cls));
        cell.textContent = day;
        return cell;
    }

    /**
     * Update header labels (month + year)
     */
    updateHeader(instance) {
        const months = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];

        if (instance.monthLabel) {
            instance.monthLabel.textContent = months[instance.currentMonth];
        }
        if (instance.yearLabel) {
            instance.yearLabel.textContent = instance.currentYear;
        }

        // Update year menu selected state
        this.updateYearMenuSelection(instance);
    }

    /**
     * Format a date as "Month DD, YYYY"
     */
    formatDate(year, month, day) {
        const months = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        return `${months[month]} ${String(day).padStart(2, '0')}, ${year}`;
    }

    /**
     * Select a date
     */
    selectDate(instance, year, month, day) {
        instance.selectedDate = new Date(year, month, day);
        instance.input.value = this.formatDate(year, month, day);
        this.renderCalendar(instance);
        this.closePanel(instance);
    }

    /**
     * Select today
     */
    selectToday(instance) {
        const today = new Date();
        instance.currentMonth = today.getMonth();
        instance.currentYear = today.getFullYear();
        this.selectDate(instance, today.getFullYear(), today.getMonth(), today.getDate());
    }

    /**
     * Clear the selection
     */
    clearSelection(instance) {
        instance.selectedDate = null;
        instance.input.value = '';
        this.renderCalendar(instance);
    }

    /**
     * Build the year dropdown menu
     */
    buildYearMenu(instance) {
        if (!instance.yearMenu) return;

        instance.yearMenu.innerHTML = '';
        const currentYear = new Date().getFullYear();
        const startYear = currentYear - 10;
        const endYear = currentYear + 10;

        for (let year = startYear; year <= endYear; year++) {
            const option = document.createElement('div');
            option.className = 'year-dropdown__option';
            option.textContent = year;
            option.dataset.year = year;

            if (year === instance.currentYear) {
                option.classList.add('year-dropdown__option--selected');
            }

            option.addEventListener('click', (e) => {
                e.stopPropagation();
                instance.currentYear = year;
                this.renderCalendar(instance);
                this.updateHeader(instance);
                if (instance.yearDropdown) {
                    instance.yearDropdown.classList.remove('is-open');
                }
            });

            instance.yearMenu.appendChild(option);
        }
    }

    /**
     * Toggle the year dropdown
     */
    toggleYearDropdown(instance) {
        if (!instance.yearDropdown) return;
        instance.yearDropdown.classList.toggle('is-open');

        // Scroll to selected year
        if (instance.yearDropdown.classList.contains('is-open') && instance.yearMenu) {
            const selected = instance.yearMenu.querySelector('.year-dropdown__option--selected');
            if (selected) {
                selected.scrollIntoView({ block: 'center', behavior: 'instant' });
            }
        }
    }

    /**
     * Update the year dropdown selected state
     */
    updateYearMenuSelection(instance) {
        if (!instance.yearMenu) return;
        instance.yearMenu.querySelectorAll('.year-dropdown__option').forEach(opt => {
            opt.classList.toggle(
                'year-dropdown__option--selected',
                parseInt(opt.dataset.year) === instance.currentYear
            );
        });
    }

    /**
     * Initialize the static calendar demo (cell clicks)
     */
    initStaticCalendarDemo() {
        const staticGrid = document.querySelector('#static-calendar-demo .date-picker__grid');
        if (!staticGrid) return;

        staticGrid.querySelectorAll('.date-cell:not(.date-cell--outside):not(.date-cell--disabled)').forEach(cell => {
            cell.addEventListener('click', () => {
                // Remove previous selection
                staticGrid.querySelectorAll('.date-cell--selected').forEach(c => {
                    c.classList.remove('date-cell--selected');
                });
                cell.classList.add('date-cell--selected');
            });
        });

        // Static year dropdown toggle
        const staticYearDropdown = document.getElementById('static-year-dropdown');
        if (staticYearDropdown) {
            const trigger = staticYearDropdown.querySelector('.year-dropdown__trigger');
            if (trigger) {
                trigger.addEventListener('click', (e) => {
                    e.stopPropagation();
                    staticYearDropdown.classList.toggle('is-open');
                });
            }
        }
    }

    /**
     * Initialize Quick Option Presets demo
     * Clicking a preset highlights it and updates the calendar grid
     */
    initPresetsDemo() {
        const container = document.getElementById('presets-demo');
        if (!container) return;

        const options = container.querySelectorAll('.date-picker__preset-option');
        const grid = document.getElementById('presets-grid');
        const monthLabel = document.getElementById('presets-month-label');

        options.forEach(option => {
            option.addEventListener('click', () => {
                // Remove active from all
                options.forEach(o => o.classList.remove('date-picker__preset-option--active'));
                option.classList.add('date-picker__preset-option--active');

                // Compute date range based on preset
                if (grid) {
                    const preset = option.dataset.preset;
                    const today = new Date(2024, 0, 3); // Use Jan 3, 2024 to match static demo
                    let start = null;
                    let end = null;

                    switch (preset) {
                        case 'today':
                            start = new Date(today);
                            end = new Date(today);
                            break;
                        case 'this-week': {
                            const dayOfWeek = today.getDay();
                            start = new Date(today);
                            start.setDate(today.getDate() - dayOfWeek);
                            end = new Date(start);
                            end.setDate(start.getDate() + 6);
                            break;
                        }
                        case 'last-week': {
                            const dayOfWeek = today.getDay();
                            start = new Date(today);
                            start.setDate(today.getDate() - dayOfWeek - 7);
                            end = new Date(start);
                            end.setDate(start.getDate() + 6);
                            break;
                        }
                        case 'this-month':
                            start = new Date(today.getFullYear(), today.getMonth(), 1);
                            end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
                            break;
                        case 'last-month':
                            start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
                            end = new Date(today.getFullYear(), today.getMonth(), 0);
                            break;
                        case 'last-3-months':
                            start = new Date(today.getFullYear(), today.getMonth() - 3, today.getDate());
                            end = new Date(today);
                            break;
                        case 'last-7-days':
                            start = new Date(today);
                            start.setDate(today.getDate() - 6);
                            end = new Date(today);
                            break;
                        case 'last-30-days':
                            start = new Date(today);
                            start.setDate(today.getDate() - 29);
                            end = new Date(today);
                            break;
                        case 'last-90-days':
                            start = new Date(today);
                            start.setDate(today.getDate() - 89);
                            end = new Date(today);
                            break;
                    }

                    this.renderPresetsGrid(grid, monthLabel, start, end);
                }
            });
        });
    }

    /**
     * Re-render the presets calendar grid with range highlighting
     */
    renderPresetsGrid(grid, monthLabel, rangeStart, rangeEnd) {
        // Show the month of rangeStart
        const year = rangeStart.getFullYear();
        const month = rangeStart.getMonth();
        const months = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];

        if (monthLabel) {
            monthLabel.textContent = months[month];
        }

        grid.innerHTML = '';

        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const daysInPrevMonth = new Date(year, month, 0).getDate();

        // Reference "today" for the demo
        const todayRef = new Date(2024, 0, 3);

        // Previous month filler
        for (let i = firstDay - 1; i >= 0; i--) {
            const cell = this.createDateCell(daysInPrevMonth - i, ['date-cell--outside', 'date-cell--disabled']);
            grid.appendChild(cell);
        }

        // Current month cells with range highlighting
        for (let day = 1; day <= daysInMonth; day++) {
            const cellDate = new Date(year, month, day);
            const classes = [];

            // Today
            if (day === todayRef.getDate() && month === todayRef.getMonth() && year === todayRef.getFullYear()) {
                classes.push('date-cell--today');
            }

            // Range logic
            if (rangeStart && rangeEnd) {
                const startTime = rangeStart.getTime();
                const endTime = rangeEnd.getTime();
                const cellTime = cellDate.getTime();

                if (startTime === endTime && cellTime === startTime) {
                    classes.push('date-cell--selected');
                } else if (cellTime === startTime) {
                    classes.push('date-cell--range-start');
                } else if (cellTime === endTime) {
                    classes.push('date-cell--range-end');
                } else if (cellTime > startTime && cellTime < endTime) {
                    classes.push('date-cell--range-mid');
                }
            }

            const cell = this.createDateCell(day, classes);
            grid.appendChild(cell);
        }

        // Next month filler
        const totalCells = grid.children.length;
        const remaining = totalCells <= 35 ? 35 - totalCells : 42 - totalCells;
        for (let i = 1; i <= remaining; i++) {
            const cell = this.createDateCell(i, ['date-cell--outside', 'date-cell--disabled']);
            grid.appendChild(cell);
        }
    }

    /**
     * Initialize click interactions for use case static calendar demos
     */
    initUseCaseCalendarDemos() {
        // All static grids (except the ones with ranges or the presets grid)
        const staticPanels = document.querySelectorAll('.date-picker__panel--static');
        staticPanels.forEach(panel => {
            // Skip the presets calendar (handled separately)
            if (panel.id === 'presets-calendar') return;
            // Skip if it's the #static-calendar-demo (handled by initStaticCalendarDemo)
            if (panel.closest('#static-calendar-demo')) return;

            const grid = panel.querySelector('.date-picker__grid');
            if (!grid) return;

            // Check if this grid has range cells - if so, skip individual selection
            const hasRange = grid.querySelector('.date-cell--range-start, .date-cell--range-mid, .date-cell--range-end');
            if (hasRange) return;

            grid.querySelectorAll('.date-cell:not(.date-cell--outside):not(.date-cell--disabled)').forEach(cell => {
                cell.addEventListener('click', () => {
                    grid.querySelectorAll('.date-cell--selected').forEach(c => c.classList.remove('date-cell--selected'));
                    cell.classList.add('date-cell--selected');
                });
            });
        });
    }

    /* ============================================
       LIVE DEMO - Interactive Preview
       ============================================ */

    /**
     * Initialize the live demo controls and render initial state
     */
    initLiveDemo() {
        this.demoState = document.getElementById('dp-demo-state');
        this.demoPreview = document.getElementById('dp-demo-preview');

        if (!this.demoPreview) return;

        // Toggle states matching library boolean props (DgaDatepicker)
        this.toggles = {
            'rtl': false,
            'input-field': true,   // default ON
            'range': false,
            'quick-options': false,
            'submit-button': false
        };

        this.demoLabels = {
            en: {
                label: 'Date',
                startLabel: 'Start Date',
                endLabel: 'End Date',
                placeholder: 'Month DD, YYYY',
                filledValue: 'January 19, 2024',
                startValue: 'January 19, 2024',
                endValue: 'January 28, 2024',
                errorValue: 'Invalid date',
                errorMsg: 'Please enter a valid date.',
                helper: 'Click the field to select a date.',
                month: 'January',
                year: '2024',
                quickOption: 'Quick Option',
                presets: ['Today', 'This week', 'Last week', 'This month', 'Last month', 'Last 7 days'],
                weekdays: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
                clear: 'Clear',
                apply: 'Apply'
            },
            ar: {
                label: '\u0627\u0644\u062A\u0627\u0631\u064A\u062E',
                startLabel: '\u062A\u0627\u0631\u064A\u062E \u0627\u0644\u0628\u062F\u0627\u064A\u0629',
                endLabel: '\u062A\u0627\u0631\u064A\u062E \u0627\u0644\u0646\u0647\u0627\u064A\u0629',
                placeholder: '\u0627\u0644\u0634\u0647\u0631 \u064A\u0648\u0645\u060C \u0633\u0646\u0629',
                filledValue: '19 \u064A\u0646\u0627\u064A\u0631 2024',
                startValue: '19 \u064A\u0646\u0627\u064A\u0631 2024',
                endValue: '28 \u064A\u0646\u0627\u064A\u0631 2024',
                errorValue: '\u062A\u0627\u0631\u064A\u062E \u063A\u064A\u0631 \u0635\u0627\u0644\u062D',
                errorMsg: '\u064A\u0631\u062C\u0649 \u0625\u062F\u062E\u0627\u0644 \u062A\u0627\u0631\u064A\u062E \u0635\u0627\u0644\u062D.',
                helper: '\u0627\u0646\u0642\u0631 \u0639\u0644\u0649 \u0627\u0644\u062D\u0642\u0644 \u0644\u0627\u062E\u062A\u064A\u0627\u0631 \u062A\u0627\u0631\u064A\u062E.',
                month: '\u064A\u0646\u0627\u064A\u0631',
                year: '2024',
                quickOption: '\u062E\u064A\u0627\u0631 \u0633\u0631\u064A\u0639',
                presets: ['\u0627\u0644\u064A\u0648\u0645', '\u0647\u0630\u0627 \u0627\u0644\u0623\u0633\u0628\u0648\u0639', '\u0627\u0644\u0623\u0633\u0628\u0648\u0639 \u0627\u0644\u0645\u0627\u0636\u064A', '\u0647\u0630\u0627 \u0627\u0644\u0634\u0647\u0631', '\u0627\u0644\u0634\u0647\u0631 \u0627\u0644\u0645\u0627\u0636\u064A', '\u0622\u062E\u0631 7 \u0623\u064A\u0627\u0645'],
                weekdays: ['\u0623\u062D', '\u0627\u062B', '\u062B\u0644', '\u0623\u0631', '\u062E\u0645', '\u062C\u0645', '\u0633\u0628'],
                clear: '\u0645\u0633\u062D',
                apply: '\u062A\u0637\u0628\u064A\u0642'
            }
        };

        // Init toggle switches
        document.querySelectorAll('.live-demo__switch[data-toggle]').forEach(btn => {
            const key = btn.dataset.toggle;
            btn.addEventListener('click', () => {
                this.toggles[key] = !this.toggles[key];
                btn.classList.toggle('active', this.toggles[key]);
                btn.setAttribute('aria-checked', String(this.toggles[key]));
                this.renderLiveDemo();
            });
        });

        // Init dropdown
        this.demoState.addEventListener('change', () => this.renderLiveDemo());

        this.renderLiveDemo();
    }

    /**
     * Render the live demo preview based on toggle + dropdown states.
     * Toggles map to DgaDatepicker boolean props:
     *   input-field  → show date field(s) above calendar
     *   range        → dual start/end fields + range highlighting
     *   quick-options → presets sidebar (qick-options in library)
     *   submit-button → footer with Clear / Apply actions
     */
    renderLiveDemo() {
        const state = this.demoState.value;
        const isRTL = this.toggles['rtl'] || false;
        const lang = isRTL ? 'ar' : 'en';
        const t = this.demoLabels[lang];
        const isDisabled = state === 'disabled';
        const isError = state === 'error';
        const isFilled = state === 'filled';

        const showField = this.toggles['input-field'];
        const showRange = this.toggles['range'];
        const showPresets = this.toggles['quick-options'];
        const showSubmit = this.toggles['submit-button'];

        this.demoPreview.dir = isRTL ? 'rtl' : '';

        let html = '';

        // Outer wrapper: with-presets layout if quick-options is ON
        if (showPresets) {
            html += '<div class="date-picker--with-presets" style="pointer-events: none;">';
            html += this.buildPresetsHTML(t);
            html += '<div>';
        }

        // Inner container
        const attachedClass = showField && !showRange ? ' date-picker--attached' : '';
        html += `<div class="${attachedClass}" style="max-width: 312px;">`;

        // Date field(s)
        if (showField) {
            if (showRange) {
                html += '<div class="date-picker__dual-fields">';
                html += this.buildFieldHTML(t.startLabel, isDisabled, isError, isFilled ? t.startValue : '', t.placeholder, isError);
                html += this.buildFieldHTML(t.endLabel, isDisabled, isError, isFilled ? t.endValue : '', t.placeholder, false);
                html += '</div>';
            } else {
                html += this.buildFieldHTML(t.label, isDisabled, isError, isFilled ? t.filledValue : '', t.placeholder, isError);
            }
        }

        // Calendar panel (always shown unless disabled)
        if (!isDisabled) {
            html += this.buildCalendarPanelHTML(t, showRange, isFilled, showSubmit);
        }

        html += '</div>';

        // Close presets wrapper
        if (showPresets) {
            html += '</div></div>';
        }

        this.demoPreview.innerHTML = html;
    }

    /**
     * Build a date field HTML string
     */
    buildFieldHTML(label, isDisabled, isError, value, placeholder, showError) {
        const disabledClass = isDisabled ? ' date-field--disabled' : '';
        const inputErrorClass = isError ? ' date-field__input--error' : '';
        const disabledAttr = isDisabled ? ' disabled' : '';
        const lang = this.toggles['rtl'] ? 'ar' : 'en';
        const inputValue = isError ? this.demoLabels[lang].errorValue : value;
        const valAttr = inputValue ? ` value="${inputValue}"` : '';
        const phAttr = inputValue ? '' : ` placeholder="${placeholder}"`;

        const calendarSVG = '<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6.667 1.667v3.333M13.333 1.667v3.333M2.917 7.575h14.166M17.5 7.083v7.084c0 3.333-1.667 5-5 5H7.5c-3.333 0-5-1.667-5-5V7.083c0-3.333 1.667-5 5-5h5c3.333 0 5 1.667 5 5Z" stroke="currentColor" stroke-width="1.25" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/></svg>';

        let html = `<div class="date-field${disabledClass}">`;
        html += `<label class="date-field__label">${label}</label>`;
        html += '<div class="date-field__wrapper">';
        html += `<input type="text" class="date-field__input${inputErrorClass}"${valAttr}${phAttr}${disabledAttr} readonly>`;
        html += `<span class="date-field__icon">${calendarSVG}</span>`;
        html += '</div>';

        if (showError && isError) {
            const t = this.demoLabels[lang];
            const errorSVG = '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8 5.333V8m0 2.667h.007M14.667 8A6.667 6.667 0 1 1 1.333 8a6.667 6.667 0 0 1 13.334 0Z" stroke="currentColor" stroke-width="1.333" stroke-linecap="round" stroke-linejoin="round"/></svg>';
            html += `<span class="date-field__helper date-field__helper--error">${errorSVG} ${t.errorMsg}</span>`;
        }

        html += '</div>';
        return html;
    }

    /**
     * Build a static calendar panel HTML string
     * @param {object} t - localized labels
     * @param {boolean} isRange - range toggle state
     * @param {boolean} isFilled - filled state from dropdown
     * @param {boolean} showSubmit - submit-button toggle state
     */
    buildCalendarPanelHTML(t, isRange, isFilled, showSubmit) {
        const prevArrow = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M5 12L12 19M5 12L12 5"/></svg>';
        const nextArrow = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>';
        const yearArrow = '<svg class="year-dropdown__arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9L12 15L18 9"/></svg>';

        let html = '<div class="date-picker__panel date-picker__panel--static" style="margin-top: var(--spacing-xs);">';

        // Header
        html += '<div class="date-picker__header">';
        html += '<div class="date-picker__nav">';
        html += `<span class="date-picker__month-label">${t.month}</span>`;
        html += '<div class="year-dropdown">';
        html += `<button class="year-dropdown__trigger" type="button">${t.year} ${yearArrow}</button>`;
        html += '</div></div>';
        html += '<div class="date-picker__arrows">';
        html += `<button class="date-picker__nav-btn" type="button">${prevArrow}</button>`;
        html += `<button class="date-picker__nav-btn" type="button">${nextArrow}</button>`;
        html += '</div></div>';

        // Weekdays
        html += '<div class="date-picker__weekdays">';
        t.weekdays.forEach(d => { html += `<span class="date-picker__weekday">${d}</span>`; });
        html += '</div>';

        // Grid - January 2024
        html += '<div class="date-picker__grid">';
        const outsidePrev = [25, 26, 27, 28, 29];
        outsidePrev.forEach(d => { html += `<div class="date-cell date-cell--outside">${d}</div>`; });

        for (let day = 1; day <= 31; day++) {
            let cls = 'date-cell';
            if (day === 3) cls += ' date-cell--today';

            if (isFilled) {
                if (isRange) {
                    if (day === 19) cls += ' date-cell--range-start';
                    else if (day > 19 && day < 28) cls += ' date-cell--range-mid';
                    else if (day === 28) cls += ' date-cell--range-end';
                } else {
                    if (day === 19) cls += ' date-cell--selected';
                }
            }

            html += `<div class="${cls}">${day}</div>`;
        }

        const outsideNext = [1, 2, 3, 4, 5, 6];
        outsideNext.forEach(d => { html += `<div class="date-cell date-cell--outside">${d}</div>`; });
        html += '</div>';

        // Footer with submit buttons (maps to submit-button prop)
        if (showSubmit) {
            html += '<div class="date-picker__footer">';
            html += `<button class="date-picker__footer-btn date-picker__footer-btn--clear" type="button">${t.clear}</button>`;
            html += `<button class="date-picker__footer-btn date-picker__footer-btn--today" type="button">${t.apply}</button>`;
            html += '</div>';
        }

        html += '</div>';
        return html;
    }

    /**
     * Build presets sidebar HTML (maps to qick-options prop)
     */
    buildPresetsHTML(t) {
        let html = '<div class="date-picker__presets">';
        html += `<span class="date-picker__presets-title">${t.quickOption}</span>`;
        t.presets.forEach(p => {
            html += `<button class="date-picker__preset-option" type="button">${p}</button>`;
        });
        html += '</div>';
        return html;
    }

    /**
     * Initialize click-outside to close
     */
    initClickOutside() {
        document.addEventListener('click', (e) => {
            this.instances.forEach(instance => {
                if (!instance.container.contains(e.target)) {
                    this.closePanel(instance);
                }
            });

            // Close static year dropdown
            const staticYearDropdown = document.getElementById('static-year-dropdown');
            if (staticYearDropdown && !staticYearDropdown.contains(e.target)) {
                staticYearDropdown.classList.remove('is-open');
            }
        });
    }

    /**
     * Initialize keyboard navigation
     */
    initKeyboard() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.instances.forEach(instance => {
                    if (instance.isOpen) {
                        this.closePanel(instance);
                        instance.input.focus();
                    }
                });
            }
        });
    }
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DatePickerManager;
}
