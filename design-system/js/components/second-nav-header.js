/* ============================================
   SECOND NAV HEADER DEMO MODULE
   DGA Design System - Interactive Demo
   Powers the live demo controls on the
   Second Nav Header page.
   ============================================ */

class SecondNavHeaderDemoManager {
    constructor() {
        this.preview = document.getElementById('second-nav-demo-preview');
        this.styleSelect = document.getElementById('second-nav-demo-style');

        if (!this.preview) return;

        this.labels = {
            en: {
                weather: 'Cloudy',
                date: '3-Sep-2024',
                time: '2:30 PM',
                location: 'Al-Riyadh'
            },
            ar: {
                weather: '\u063A\u0627\u0626\u0645',
                date: '3-\u0633\u0628\u062A\u0645\u0628\u0631-2024',
                time: '2:30 \u0645\u0633\u0627\u0621\u064B',
                location: '\u0627\u0644\u0631\u064A\u0627\u0636'
            }
        };

        this.contentItems = [
            { icon: 'dga-icon-cloud', key: 'weather' },
            { icon: 'dga-icon-calendar-04', key: 'date' },
            { icon: 'dga-icon-time-04', key: 'time' },
            { icon: 'dga-icon-location-01', key: 'location' }
        ];

        this.actionIcons = [
            'dga-icon-mic-01',
            'dga-icon-zoom-out-area',
            'dga-icon-zoom-in-area',
            'dga-icon-view'
        ];

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

    render() {
        const variant = this.styleSelect.value;
        const isRTL = this.toggles['rtl'] || false;
        const showDivider = this.toggles['divider'] !== false;
        const showContent = this.toggles['content'] !== false;
        const showItem2 = this.toggles['item2'] !== false;
        const showItem3 = this.toggles['item3'] !== false;
        const showItem4 = this.toggles['item4'] !== false;
        const showActions = this.toggles['actions'] !== false;
        const showAction2 = this.toggles['action2'] !== false;
        const showAction3 = this.toggles['action3'] !== false;
        const showAction4 = this.toggles['action4'] !== false;

        const lang = isRTL ? 'ar' : 'en';
        const t = this.labels[lang];
        const onColorClass = variant === 'primary' ? ' btn-on-color' : '';

        // Map item visibility: index 0 = showContent, 1 = showItem2, 2 = showItem3, 3 = showItem4
        const itemVisibility = [showContent, showItem2, showItem3, showItem4];

        // Build content items (only if at least one item is visible)
        let contentHTML = '';
        const visibleItems = this.contentItems.filter((_, i) => itemVisibility[i]);
        if (visibleItems.length > 0) {
            const items = visibleItems.map(item =>
                `<div class="second-nav-header__item">
                    <span class="second-nav-header__item-icon icon ${item.icon}"></span>
                    <span class="second-nav-header__item-text">${t[item.key]}</span>
                </div>`
            ).join('');
            contentHTML = `<div class="second-nav-header__content">${items}</div>`;
        }

        // Map action visibility: index 0 = showAction4 (mic), 1 = showAction3 (zoom-out), 2 = showAction2 (zoom-in), 3 = showActions (view)
        const actionVisibility = [showAction4, showAction3, showAction2, showActions];

        // Build action buttons (only if showActions is on and at least one action visible)
        let actionsHTML = '';
        if (showActions) {
            const visibleActions = this.actionIcons.filter((_, i) => actionVisibility[i]);
            if (visibleActions.length > 0) {
                const buttons = visibleActions.map(icon =>
                    `<button class="btn btn-subtle btn-medium btn-icon-only${onColorClass}" type="button">
                        <span class="icon ${icon}"></span>
                    </button>`
                ).join('');
                actionsHTML = `<div class="second-nav-header__actions">${buttons}</div>`;
            }
        }

        // Build divider
        const dividerHTML = showDivider ? '<div class="second-nav-header__divider"></div>' : '';

        const html = `
            <div class="second-nav-header second-nav-header--${variant}" ${isRTL ? 'dir="rtl"' : ''}>
                ${contentHTML}
                ${actionsHTML}
                ${dividerHTML}
            </div>
        `;

        this.preview.innerHTML = html;
    }
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { SecondNavHeaderDemoManager };
}
