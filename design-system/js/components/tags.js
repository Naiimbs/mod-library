/* ============================================
   TAG DEMO MODULE
   DGA Design System - Interactive Tag Demo
   Powers the live demo controls on the Tags page.
   ============================================ */

class TagDemoManager {
    constructor() {
        this.preview = document.getElementById('tag-demo-preview');
        this.variantSelect = document.getElementById('tag-demo-variant');
        this.sizeSelect = document.getElementById('tag-demo-size');

        if (!this.preview) return;

        this.labels = {
            en: {
                tag: 'Tag',
                newItem: 'New',
            },
            ar: {
                tag: 'وسم',
                newItem: 'جديد',
            }
        };

        this.toggles = {};
        this.initSwitches();
        this.bindEvents();
        this.render();
    }

    initSwitches() {
        document.querySelectorAll('.live-demo__switch[data-toggle]').forEach(btn => {
            const key = btn.dataset.toggle;
            this.toggles[key] = false;

            btn.addEventListener('click', () => {
                if (key === 'icon-only') {
                    this.toggles['lead-icon'] = false;
                    this.toggles['trail-icon'] = false;
                    this.updateSwitchUI('lead-icon');
                    this.updateSwitchUI('trail-icon');
                } else if (key === 'lead-icon' || key === 'trail-icon') {
                    this.toggles['icon-only'] = false;
                    this.updateSwitchUI('icon-only');
                }

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
        this.variantSelect.addEventListener('change', () => this.render());
        this.sizeSelect.addEventListener('change', () => this.render());
    }

    iconPxForSize(size) {
        if (size === 'md') return 20;
        if (size === 'xs') return 14;
        return 16;
    }

    getLeadIconSVG(size) {
        const s = this.iconPxForSize(size);
        return `<span class="tag__icon"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="${s}" height="${s}"><path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd"/></svg></span>`;
    }

    getTrailIconSVG(size) {
        const s = this.iconPxForSize(size);
        return `<span class="tag__icon"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="${s}" height="${s}"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/></svg></span>`;
    }

    render() {
        const variant = this.variantSelect.value;
        const size = this.sizeSelect.value;
        const isRTL = this.toggles['rtl'] || false;
        const lang = isRTL ? 'ar' : 'en';
        const t = this.labels[lang];

        const classes = ['tag', `tag--${variant}`];

        if (size !== 'sm') {
            classes.push(`tag--${size}`);
        }

        if (this.toggles['outline']) {
            classes.push('tag--outline');
        }

        if (this.toggles['rounded']) {
            classes.push('tag--rounded');
        }

        if (this.toggles['icon-only']) {
            classes.push('tag--icon-only');
        }

        const leadIcon = this.getLeadIconSVG(size);
        const trailIcon = this.getTrailIconSVG(size);

        let innerHTML = '';
        if (this.toggles['icon-only']) {
            innerHTML = leadIcon;
        } else {
            if (this.toggles['lead-icon']) {
                innerHTML += leadIcon;
            }
            innerHTML += t.tag;
            if (this.toggles['trail-icon']) {
                innerHTML += trailIcon;
            }
        }

        const classStr = classes.join(' ');
        const tagHTML = `<span class="${classStr}">${innerHTML}</span>`;

        let secondTag = '';
        if (!this.toggles['icon-only'] && !this.toggles['lead-icon'] && !this.toggles['trail-icon']) {
            const innerWithIcon = leadIcon + t.newItem;
            secondTag = `<span class="${classStr}">${innerWithIcon}</span>`;
        }

        this.preview.innerHTML = tagHTML + (secondTag ? '\n' + secondTag : '');
        this.preview.dir = isRTL ? 'rtl' : '';

        // Darken the canvas when the On-Color variant is selected so the white-on-alpha
        // styling has the dark background it's designed for.
        this.preview.classList.toggle('live-demo__canvas--dark', variant === 'on-color');
    }
}
