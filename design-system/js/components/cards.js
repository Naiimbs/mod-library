/* ============================================
   CARDS COMPONENT MODULE
   DGA Design System - Card Interactions
   Single Responsibility: Card interaction logic
   ============================================ */

/**
 * CardManager class for handling card interactions
 */
/**
 * Chevron SVG used by the expandable card toggle. Single down-pointing
 * chevron — the .card--expanded state rotates it 180° via CSS.
 */
const CARD_CHEVRON_SVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="5 8 10 13 15 8"/></svg>';

class CardManager {
    constructor(config = {}) {
        this.expandableSelector = config.expandableSelector || '[data-card-expandable]';
        this.selectableSelector = config.selectableSelector || '[data-card-selectable]';
        this.expandedClass = config.expandedClass || 'card--expanded';
        this.selectedClass = config.selectedClass || 'card--selected';
        this.disabledClass = config.disabledClass || 'card--disabled';

        this.init();
    }

    /**
     * Initialize card interactions
     */
    init() {
        this.initExpandableCards();
        this.initSelectableCards();
    }

    /**
     * Initialize expandable card functionality. Each expandable card
     * needs a `.card-chevron` button inside it. Clicking the chevron or
     * the card surface toggles the `.card--expanded` state.
     */
    initExpandableCards() {
        document.querySelectorAll(this.expandableSelector).forEach(card => {
            // Make tabbable for keyboard users
            if (!card.hasAttribute('tabindex')) card.setAttribute('tabindex', '0');
            const chevron = card.querySelector('.card-chevron');

            const handle = (e) => {
                if (card.classList.contains(this.disabledClass)) return;
                e.stopPropagation();
                this.toggleExpand(card);
            };

            if (chevron) chevron.addEventListener('click', handle);
            card.addEventListener('click', (e) => {
                if (card.classList.contains(this.disabledClass)) return;
                if (e.target.closest('.card-chevron')) return; // handled above
                this.toggleExpand(card);
            });
            card.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    if (card.classList.contains(this.disabledClass)) return;
                    e.preventDefault();
                    this.toggleExpand(card);
                }
            });

            // Sync initial ARIA
            card.setAttribute('aria-expanded', card.classList.contains(this.expandedClass));
        });
    }

    /**
     * Toggle card expand/collapse state. CSS handles the visual chevron
     * rotation via the `.card--expanded` class.
     * @param {HTMLElement} card - Card element
     */
    toggleExpand(card) {
        const isExpanded = card.classList.toggle(this.expandedClass);
        card.setAttribute('aria-expanded', String(isExpanded));

        const chevron = card.querySelector('.card-chevron');
        if (chevron) {
            chevron.setAttribute('aria-label', isExpanded ? 'Collapse card' : 'Expand card');
        }

        card.dispatchEvent(new CustomEvent('card:toggle', {
            detail: { expanded: isExpanded }
        }));
    }

    /**
     * Initialize selectable card functionality
     */
    initSelectableCards() {
        document.querySelectorAll(this.selectableSelector).forEach(card => {
            card.addEventListener('click', () => {
                if (card.classList.contains(this.disabledClass)) return;
                this.toggleSelect(card);
            });

            // Keyboard accessibility
            card.setAttribute('tabindex', '0');
            card.setAttribute('role', 'checkbox');
            card.setAttribute('aria-checked', card.classList.contains(this.selectedClass));

            card.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    if (!card.classList.contains(this.disabledClass)) {
                        this.toggleSelect(card);
                    }
                }
            });
        });
    }

    /**
     * Toggle card selected state
     * @param {HTMLElement} card - Card element
     */
    toggleSelect(card) {
        const isSelected = card.classList.toggle(this.selectedClass);
        card.setAttribute('aria-checked', isSelected);

        // Dispatch custom event
        card.dispatchEvent(new CustomEvent('card:select', {
            detail: { selected: isSelected }
        }));
    }

    /**
     * Select a card programmatically
     * @param {HTMLElement} card - Card element
     */
    select(card) {
        if (!card.classList.contains(this.selectedClass)) {
            this.toggleSelect(card);
        }
    }

    /**
     * Deselect a card programmatically
     * @param {HTMLElement} card - Card element
     */
    deselect(card) {
        if (card.classList.contains(this.selectedClass)) {
            this.toggleSelect(card);
        }
    }

    /**
     * Expand a card programmatically
     * @param {HTMLElement} card - Card element
     */
    expand(card) {
        if (!card.classList.contains(this.expandedClass)) {
            this.toggleExpand(card);
        }
    }

    /**
     * Collapse a card programmatically
     * @param {HTMLElement} card - Card element
     */
    collapse(card) {
        if (card.classList.contains(this.expandedClass)) {
            this.toggleExpand(card);
        }
    }
}

/* ============================================
   CARD DEMO MANAGER
   Powers the live demo controls on the Cards page.
   Renders the preview card dynamically based on the sidebar controls.
   ============================================ */

class CardDemoManager {
    constructor() {
        this.preview = document.getElementById('card-demo-preview');
        this.effectSelect = document.getElementById('card-demo-effect');
        this.stateSelect = document.getElementById('card-demo-state');
        this.typeSelect = document.getElementById('card-demo-type');

        if (!this.preview) return;

        this.labels = {
            en: {
                title: 'Card Title',
                body: 'Card content placeholder text goes here',
                primary: 'Action',
                secondary: 'Action',
                customTitle: 'Swap with content component',
                customBody: 'Replace this slot with any component',
                tag: 'Tag',
                ratingCount: '12 reviews',
            },
            ar: {
                title: 'عنوان البطاقة',
                body: 'نص محتوى البطاقة يظهر هنا',
                primary: 'إجراء',
                secondary: 'إجراء',
                customTitle: 'استبدل هذا العنصر بأي عنصر آخر',
                customBody: 'يمكن استبدال هذه المنطقة بأي مكون',
                tag: 'وسم',
                ratingCount: '12 تقييم',
            },
        };

        // A small SVG placeholder evoking a Saudi flag against a soft sky so
        // the image slot has something visible without any network request.
        // Consumers swap this for a real <img src> in production.
        this.placeholderImage = "data:image/svg+xml;utf8," + encodeURIComponent(
            "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300' preserveAspectRatio='xMidYMid slice'>" +
            "<defs>" +
                "<linearGradient id='sky' x1='0' y1='0' x2='0' y2='1'>" +
                    "<stop offset='0%' stop-color='#c9e3ec'/>" +
                    "<stop offset='100%' stop-color='#e6eef0'/>" +
                "</linearGradient>" +
                "<radialGradient id='cloud' cx='0.3' cy='0.4' r='0.7'>" +
                    "<stop offset='0%' stop-color='#ffffff' stop-opacity='0.6'/>" +
                    "<stop offset='100%' stop-color='#ffffff' stop-opacity='0'/>" +
                "</radialGradient>" +
            "</defs>" +
            "<rect width='400' height='300' fill='url(#sky)'/>" +
            "<rect width='400' height='300' fill='url(#cloud)'/>" +
            "<ellipse cx='80' cy='90' rx='90' ry='18' fill='#ffffff' fill-opacity='0.55'/>" +
            "<ellipse cx='320' cy='130' rx='110' ry='20' fill='#ffffff' fill-opacity='0.45'/>" +
            // flag pole
            "<rect x='120' y='40' width='4' height='240' fill='#a08862'/>" +
            "<circle cx='122' cy='40' r='5' fill='#a08862'/>" +
            // flag (slight wave)
            "<path d='M124 70 Q170 60, 220 75 Q270 90, 310 80 L310 170 Q270 180, 220 165 Q170 150, 124 160 Z' fill='#136e3a'/>" +
            // arabic shahada (suggestive curves only)
            "<path d='M170 105 Q195 95, 220 105 Q245 115, 270 105' stroke='#ffffff' stroke-width='2.5' fill='none' stroke-linecap='round'/>" +
            "<path d='M175 125 Q200 118, 230 125' stroke='#ffffff' stroke-width='2' fill='none' stroke-linecap='round'/>" +
            // sword
            "<path d='M170 145 L260 145' stroke='#ffffff' stroke-width='2' fill='none' stroke-linecap='round'/>" +
            "<polygon points='258,142 268,145 258,148' fill='#ffffff'/>" +
            "</svg>"
        );

        this.toggles = {};
        this.initSwitches();
        this.bindEvents();
        this.render();
    }

    initSwitches() {
        document.querySelectorAll('.live-demo__switch[data-toggle]').forEach(btn => {
            const key = btn.dataset.toggle;
            this.toggles[key] = btn.getAttribute('aria-checked') === 'true';

            btn.addEventListener('click', () => {
                this.toggles[key] = !this.toggles[key];
                btn.classList.toggle('active', this.toggles[key]);
                btn.setAttribute('aria-checked', String(this.toggles[key]));
                this.render();
            });
        });
    }

    bindEvents() {
        [this.effectSelect, this.stateSelect, this.typeSelect].forEach(sel => {
            if (sel) sel.addEventListener('change', () => this.render());
        });
    }

    iconSVG() {
        return '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>';
    }

    starSVG() {
        return '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>';
    }

    // Render five stars with the demo's preset rating of 3.5 (4 filled,
    // 1 half, 0 empty? no — 3 full, 1 half, 1 empty for the demo). Real
    // apps drive this dynamically; the demo just shows the look.
    renderRating(countLabel) {
        const stars = [];
        const score = 3.5;
        for (let i = 1; i <= 5; i++) {
            if (i <= Math.floor(score)) {
                stars.push(`<span class="card-rating__star card-rating__star--filled">${this.starSVG()}</span>`);
            } else if (i - 0.5 <= score) {
                stars.push(`<span class="card-rating__star card-rating__star--half">${this.starSVG()}</span>`);
            } else {
                stars.push(`<span class="card-rating__star">${this.starSVG()}</span>`);
            }
        }
        return `<div class="card-rating">
    <div class="card-rating__stars" role="img" aria-label="${score} out of 5">${stars.join('')}</div>
    <p class="card-rating__count">${countLabel}</p>
</div>`;
    }

    render() {
        const effect = this.effectSelect ? this.effectSelect.value : 'with-shadow';
        const state = this.stateSelect ? this.stateSelect.value : 'default';
        const type = this.typeSelect ? this.typeSelect.value : 'default';

        // Read every rich-card toggle. The defaults match the Figma defaults
        // for the Card component.
        const showTitle       = this.toggles['title'] !== false;
        const showDescription = this.toggles['description'] !== false;
        const showIcon        = !!this.toggles['icon'];
        const showImage       = !!this.toggles['image'];
        const showCustom      = !!this.toggles['custom'];
        const showTags        = !!this.toggles['tags'];
        const showRating      = !!this.toggles['rating'];
        const showPrimary     = !!this.toggles['primary-action'];
        const showSecondary   = !!this.toggles['secondary-action'];
        // Footer is only valid on the Default card type per Figma.
        const showFooter      = (showPrimary || showSecondary) && type === 'default';
        const isExpanded      = !!this.toggles['expanded'];
        const isRTL           = !!this.toggles['rtl'];
        const t               = isRTL ? this.labels.ar : this.labels.en;

        const classes = ['card'];
        if (effect === 'no-shadow') classes.push('card--no-shadow');
        if (effect === 'stroke') classes.push('card--stroke');
        if (type === 'expandable') classes.push('card--expandable');
        if (type === 'selectable') classes.push('card--selectable');
        if (state === 'selected' && type === 'selectable') classes.push('card--selected');
        if (state === 'disabled') classes.push('card--disabled');
        if (state === 'focused') classes.push('is-focused-demo');
        if (type === 'expandable' && isExpanded) classes.push('card--expanded');

        // Per Figma rich card: image sits inside the card padding (not
        // full-bleed), and the featured icon renders as a separate sibling
        // BELOW the image — they are independent slots.
        const iconMarkup = showIcon ? `<div class="card-icon">${this.iconSVG()}</div>` : '';
        const image = showImage
            ? `<div class="card-image"><img src="${this.placeholderImage}" alt="" /></div>`
            : '';
        const standaloneIcon = iconMarkup;

        const selectIndicator = type === 'selectable'
            ? '<div class="card-select-indicator" aria-hidden="true"></div>'
            : '';
        const chevron = type === 'expandable'
            ? `<button type="button" class="card-chevron" aria-label="${isExpanded ? 'Collapse card' : 'Expand card'}">${CARD_CHEVRON_SVG}</button>`
            : '';

        // Title + body content block — only emit if at least one is shown.
        let content = '';
        if (showTitle || showDescription) {
            const titleEl = showTitle ? `<h3 class="card-title">${t.title}</h3>` : '';
            const bodyEl = showDescription ? `<p class="card-body">${t.body}</p>` : '';
            content = `<div class="card-content">${titleEl}${bodyEl}</div>`;
        }

        const customSlot = showCustom
            ? `<div class="card-custom">
    <h4 class="card-custom__title">${t.customTitle}</h4>
    <p class="card-custom__body">${t.customBody}</p>
</div>`
            : '';

        const tagsSlot = showTags
            ? `<div class="card-tags">
    <span class="tag tag--neutral tag--sm">${t.tag}</span>
    <span class="tag tag--neutral tag--sm">${t.tag}</span>
    <span class="tag tag--neutral tag--sm">${t.tag}</span>
</div>`
            : '';

        const ratingSlot = showRating ? this.renderRating(t.ratingCount) : '';

        const footer = showFooter
            ? `<div class="card-footer">
    ${showSecondary ? `<button class="btn btn-secondary-outline">${t.secondary}</button>` : ''}
    ${showPrimary ? `<button class="btn btn-primary">${t.primary}</button>` : ''}
</div>`
            : '';

        const inner = `${selectIndicator}
${image}
${standaloneIcon}
${content}
${customSlot}
${tagsSlot}
${ratingSlot}
${footer}
${chevron}`;

        this.preview.innerHTML = `<article class="${classes.join(' ')}">${inner}</article>`;
        this.preview.dir = isRTL ? 'rtl' : '';

        // Hook into CardManager interactivity for expandable + selectable types.
        const cm = (window.DGA && window.DGA.get && window.DGA.get('cards')) || null;
        const card = this.preview.querySelector('.card');
        if (cm && card && state !== 'disabled') {
            if (type === 'expandable') {
                card.setAttribute('data-card-expandable', '');
                card.setAttribute('tabindex', '0');
                card.setAttribute('aria-expanded', String(isExpanded));
                const chevronBtn = card.querySelector('.card-chevron');
                if (chevronBtn) chevronBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    cm.toggleExpand(card);
                });
                card.addEventListener('click', (e) => {
                    if (e.target.closest('.card-chevron')) return;
                    cm.toggleExpand(card);
                });
            }
            if (type === 'selectable') {
                card.setAttribute('data-card-selectable', '');
                card.setAttribute('tabindex', '0');
                card.setAttribute('role', 'checkbox');
                card.setAttribute('aria-checked', String(card.classList.contains('card--selected')));
                card.addEventListener('click', () => cm.toggleSelect(card));
            }
        }

        // The "Focused" State select option simulates :focus-visible visually
        // for the docs. We add a marker class and explicit inset-ring shadow
        // so reviewers can preview the focused appearance without tabbing in.
        if (state === 'focused' && card && (type === 'expandable' || type === 'selectable')) {
            const inset = 'inset 0 0 0 2px #161616';
            const base = effect === 'with-shadow'
                ? 'rgba(16, 24, 40, 0.1) 0px 4px 8px -2px, rgba(16, 24, 40, 0.06) 0px 2px 4px -2px'
                : '';
            card.style.boxShadow = base ? `${inset}, ${base}` : inset;
            if (effect !== 'with-shadow') card.style.borderColor = 'transparent';
        }
    }
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CardManager, CardDemoManager };
}
