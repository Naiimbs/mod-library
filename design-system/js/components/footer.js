/* ============================================
   FOOTER DEMO MODULE
   DGA Design System - Interactive Demo
   Powers the live demo controls on the
   Footer page.
   ============================================ */

class FooterDemoManager {
    constructor() {
        this.preview = document.getElementById('footer-demo-preview');
        this.bgSelect = document.getElementById('footer-demo-bg');

        if (!this.preview) return;

        this.labels = {
            en: {
                groups: ['Group Label', 'Group Label', 'Group Label', 'Group Label', 'Group Label'],
                link: 'Footer Link',
                socialTitle: 'Social Media',
                accessibilityTitle: 'Accessibility Tools',
                legalCaption: 'All Right Reserved For Digital Government Authority &copy; 2024',
                terms: 'Terms and Conditions',
                privacy: 'Privacy Policy',
                logoText: 'Platform Logo'
            },
            ar: {
                groups: ['عنوان مجموعة', 'عنوان مجموعة', 'عنوان مجموعة', 'عنوان مجموعة', 'عنوان مجموعة'],
                link: 'رابط الجزء السفلي',
                socialTitle: 'تواصل معنا',
                accessibilityTitle: 'أدوات الاتاحة والوصول',
                legalCaption: 'جميع الحقوق محفوظة لهيئة الحكومة الرقمية &copy; 2024',
                terms: 'الشروط والأحكام',
                privacy: 'سياسة الخصوصية',
                logoText: 'شعار المنصة'
            }
        };

        this.socialIcons = [
            { label: 'X (Twitter)', icon: 'dga-icon-new-twitter' },
            { label: 'Instagram', icon: 'dga-icon-instagram' },
            { label: 'YouTube', icon: 'dga-icon-youtube' },
            { label: 'LinkedIn', icon: 'dga-icon-linkedin-01' }
        ];

        this.accessibilityIcons = [
            { label: 'Font size', icon: 'dga-icon-text-font' },
            { label: 'Contrast', icon: 'dga-icon-eye' },
            { label: 'Screen reader', icon: 'dga-icon-view' }
        ];

        this.logoSvg = '<svg class="footer__logo-icon" width="32" height="32" viewBox="0 0 32 32" fill="none"><rect width="32" height="32" rx="4" fill="#F5F5F5"/><path d="M16 6C15.3 6 14.7 6.75 14.7 7.67V12L12 11.53C11.53 11.47 11.07 11.8 11 12.27C10.93 12.73 11.27 13.13 11.73 13.2L14.7 13.67V15.33L11.33 17C10.93 17.2 10.8 17.67 11 18.07C11.2 18.47 11.67 18.6 12.07 18.4L14.7 17.07V19.33L11.33 22.67C11.07 22.93 11.07 23.33 11.33 23.6C11.6 23.87 12 23.87 12.27 23.6L14.7 21.2V25.33C14.7 26.27 15.3 27 16 27C16.7 27 17.3 26.27 17.3 25.33V21.2L19.73 23.6C20 23.87 20.4 23.87 20.67 23.6C20.93 23.33 20.93 22.93 20.67 22.67L17.3 19.33V17.07L19.93 18.4C20.33 18.6 20.8 18.47 21 18.07C21.2 17.67 21.07 17.2 20.67 17L17.3 15.33V13.67L20.27 13.2C20.73 13.13 21.07 12.73 21 12.27C20.93 11.8 20.47 11.47 20 11.53L17.3 12V7.67C17.3 6.75 16.7 6 16 6Z" fill="#9DA4AE"/></svg>';

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
        this.bgSelect.addEventListener('change', () => this.render());
    }

    buildIconButtons(icons, isDark) {
        const onColorClass = isDark ? ' btn-on-color' : '';
        return icons.map(icon =>
            `<button class="btn btn-secondary-outline btn-medium btn-icon-only${onColorClass}" type="button" aria-label="${icon.label}">
                <span class="icon ${icon.icon}"></span>
            </button>`
        ).join('');
    }

    render() {
        const bg = this.bgSelect.value;
        const isRTL = this.toggles['rtl'] || false;
        const showNavLinks = this.toggles['navLinks'] !== false;
        const showSocialMedia = this.toggles['socialMedia'] !== false;
        const showAccessibility = this.toggles['accessibility'] !== false;
        const showLegalLinks = this.toggles['legalLinks'] !== false;
        const showLogos = this.toggles['logos'] !== false;

        const isDark = bg === 'dark';
        const lang = isRTL ? 'ar' : 'en';
        const t = this.labels[lang];
        const darkClass = isDark ? ' footer--dark' : '';
        const dirAttr = isRTL ? ' dir="rtl"' : '';

        // Build nav link groups
        let navLinksHTML = '';
        if (showNavLinks) {
            const groups = t.groups.map(label => `
                <div class="footer__group">
                    <h3 class="footer__group-label">${label}</h3>
                    <div class="footer__link-group">
                        <ul class="footer__link-list">
                            ${Array(5).fill(`<li><a href="#" class="footer__link">${t.link}</a></li>`).join('')}
                        </ul>
                    </div>
                </div>
            `).join('');

            // Social/Accessibility extra group
            let extraSections = '';
            if (showSocialMedia) {
                extraSections += `
                    <div class="footer__social-section">
                        <h3 class="footer__group-label">${t.socialTitle}</h3>
                        <div class="footer__social-icons">${this.buildIconButtons(this.socialIcons, isDark)}</div>
                    </div>`;
            }
            if (showAccessibility) {
                extraSections += `
                    <div class="footer__social-section">
                        <h3 class="footer__group-label">${t.accessibilityTitle}</h3>
                        <div class="footer__social-icons">${this.buildIconButtons(this.accessibilityIcons, isDark)}</div>
                    </div>`;
            }

            let extraGroupHTML = '';
            if (extraSections) {
                extraGroupHTML = `<div class="footer__group footer__group--extra">${extraSections}</div>`;
            }

            navLinksHTML = `
                <div class="footer__nav-links">
                    ${groups + extraGroupHTML}
                </div>`;
        }

        // Build legal links row
        let legalLinksHTML = '';
        if (showLegalLinks) {
            legalLinksHTML = `
                <ul class="footer__legal-links">
                    ${Array(8).fill(`<li><a href="#" class="footer__link footer__link--underline">${t.link}</a></li>`).join('')}
                </ul>`;
        }

        // Build logos
        let logosHTML = '';
        if (showLogos) {
            const logoItem = isRTL
                ? `<div class="footer__logo"><span class="footer__logo-text">${t.logoText}</span>${this.logoSvg}</div>`
                : `<div class="footer__logo">${this.logoSvg}<span class="footer__logo-text">${t.logoText}</span></div>`;
            logosHTML = `<div class="footer__logos">${logoItem}${logoItem}</div>`;
        }

        // Build legal section
        const legalContentHTML = `
            <div class="footer__legal-content">
                ${legalLinksHTML}
                <div class="footer__legal-info">
                    <p class="footer__legal-caption">${t.legalCaption}</p>
                    <ul class="footer__extra-links">
                        <li><a href="#" class="footer__link">${t.terms}</a></li>
                        <li><a href="#" class="footer__link">${t.privacy}</a></li>
                    </ul>
                </div>
            </div>`;

        const legalHTML = `
            <div class="footer__legal">
                ${legalContentHTML + logosHTML}
            </div>`;

        const html = `
            <footer class="footer${darkClass}"${dirAttr}>
                <div class="footer__content">
                    ${navLinksHTML}
                    ${legalHTML}
                </div>
            </footer>`;

        this.preview.innerHTML = html;
    }
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { FooterDemoManager };
}
