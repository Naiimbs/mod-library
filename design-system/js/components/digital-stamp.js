/**
 * Digital Stamp Component - JavaScript
 * DGA Design System
 *
 * Provides interactive functionality for the Digital Stamp component,
 * including toggle expand/collapse behavior.
 */

class DigitalStamp {
    constructor(element) {
        this.element = element;
        this.toggleBtn = element.querySelector('.digital-stamp__toggle');
        this.isOpened = element.classList.contains('digital-stamp--opened');

        this.init();
    }

    init() {
        if (this.toggleBtn) {
            this.toggleBtn.addEventListener('click', this.toggle.bind(this));
        }
    }

    toggle() {
        this.isOpened = !this.isOpened;
        this.element.classList.toggle('digital-stamp--opened', this.isOpened);

        // Update ARIA attributes
        this.toggleBtn.setAttribute('aria-expanded', this.isOpened.toString());

        // Dispatch custom event
        this.element.dispatchEvent(new CustomEvent('digitalstamp:toggle', {
            detail: { isOpened: this.isOpened },
            bubbles: true
        }));
    }

    open() {
        if (!this.isOpened) {
            this.toggle();
        }
    }

    close() {
        if (this.isOpened) {
            this.toggle();
        }
    }

    destroy() {
        if (this.toggleBtn) {
            this.toggleBtn.removeEventListener('click', this.toggle.bind(this));
        }
    }
}

// Auto-initialize all digital stamps on the page
function initDigitalStamps() {
    const stamps = document.querySelectorAll('.digital-stamp');
    stamps.forEach(stamp => {
        if (!stamp.dataset.initialized) {
            new DigitalStamp(stamp);
            stamp.dataset.initialized = 'true';
        }
    });
}

// Initialize on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDigitalStamps);
} else {
    initDigitalStamps();
}

/* ============================================
   DIGITAL STAMP DEMO MANAGER
   Powers the live demo controls on the Digital Stamp page.
   Renders the stamp dynamically based on Device/Extension/Opened/RTL
   controls, with extension-specific content per Figma frame 25079:5361.
   ============================================ */

// Flag glyph from the design-system icon font. The container provides the
// Saudi-green background so the icon-font glyph stays visible in white.
const DIGITAL_STAMP_FLAG_SVG = '<span class="dga-icon-flag-01" aria-hidden="true"></span>';

// Use the design-system icon font (utilities/Icons_Css/*) instead of inline
// SVGs so the stamp picks up theme color/size and stays consistent with the
// rest of the components.
const DIGITAL_STAMP_CHEVRON_SVG   = '<span class="dga-icon-arrow-down-01" aria-hidden="true"></span>';
const DIGITAL_STAMP_LINK_ICON_SVG = '<span class="dga-icon-link-01" aria-hidden="true"></span>';
const DIGITAL_STAMP_SHIELD_SVG    = '<span class="dga-icon-security-check" aria-hidden="true"></span>';

// Verified-badge glyph from the icon font for the DGA registration row.
const DIGITAL_STAMP_DGA_LOGO_SVG = '<span class="dga-icon-checkmark-badge-01" aria-hidden="true"></span>';

/**
 * Extension-specific content table per Figma frame 25079:5361.
 * Each key maps to localized title + description for the .gov.sa / .edu.sa /
 * etc. verification card. The Secure-HTTPS card and the Registration card
 * use generic copy that doesn't change per extension.
 */
const DIGITAL_STAMP_EXTENSIONS = {
    '.gov.sa': {
        en: {
            kind: 'Government',
            title: 'Official Saudi Government websites URL ends with',
            description: 'Website belongs to an official government organization in the Kingdom of Saudi Arabia always ends with .gov.sa.',
        },
        ar: {
            kind: 'حكومي',
            title: 'روابط المواقع الإلكترونية الرسمية الحكومية تنتهي بـ',
            description: 'جميع روابط المواقع الرسمية التابعة للجهات الحكومية في المملكة العربية السعودية تنتهي بـ .gov.sa',
        },
    },
    '.edu.sa': {
        en: {
            kind: 'Educational',
            title: 'Official Saudi educational websites URL ends with',
            description: 'Website belongs to an official educational organization in the Kingdom of Saudi Arabia always ends with .edu.sa.',
        },
        ar: {
            kind: 'تعليمي',
            title: 'روابط المواقع الإلكترونية الرسمية التعليمية تنتهي بـ',
            description: 'جميع روابط المواقع الرسمية التابعة للجهات التعليمية في المملكة العربية السعودية تنتهي بـ .edu.sa',
        },
    },
    '.med.sa': {
        en: {
            kind: 'Medical',
            title: 'Official Saudi medical websites URL ends with',
            description: 'Website belongs to an official medical organization in the Kingdom of Saudi Arabia always ends with .med.sa.',
        },
        ar: {
            kind: 'طبي',
            title: 'روابط المواقع الإلكترونية الرسمية الطبية تنتهي بـ',
            description: 'جميع روابط المواقع الرسمية التابعة للجهات الطبية في المملكة العربية السعودية تنتهي بـ .med.sa',
        },
    },
    '.org.sa': {
        en: {
            kind: 'Non-profit / NGO',
            title: 'Official Saudi non-profit organizations websites URL ends with',
            description: 'Website belongs to an official non-profit organization in the Kingdom of Saudi Arabia always ends with .org.sa.',
        },
        ar: {
            kind: 'غير ربحي / منظمات',
            title: 'روابط المواقع الإلكترونية الرسمية للمنظمات غير الربحية تنتهي بـ',
            description: 'جميع روابط المواقع الرسمية التابعة للمنظمات غير الربحية في المملكة العربية السعودية تنتهي بـ .org.sa',
        },
    },
    '.sch.sa': {
        en: {
            kind: 'Schools',
            title: 'Official Saudi school websites URL ends with',
            description: 'Website belongs to an official school in the Kingdom of Saudi Arabia always ends with .sch.sa.',
        },
        ar: {
            kind: 'مدارس',
            title: 'روابط المواقع الإلكترونية الرسمية للمدارس تنتهي بـ',
            description: 'جميع روابط المواقع الرسمية التابعة للمدارس في المملكة العربية السعودية تنتهي بـ .sch.sa',
        },
    },
    '.sa': {
        en: {
            kind: 'Saudi authorities & initiatives',
            title: 'Official Saudi authorities and initiatives websites URL ends with',
            description: 'Website belongs to an official Saudi authority or initiative in the Kingdom of Saudi Arabia always ends with .sa.',
        },
        ar: {
            kind: 'هيئات ومبادرات سعودية',
            title: 'روابط المواقع الإلكترونية الرسمية للهيئات والمبادرات السعودية تنتهي بـ',
            description: 'جميع روابط المواقع الرسمية التابعة للهيئات والمبادرات السعودية تنتهي بـ .sa',
        },
    },
};

/** Static copy that doesn't change per extension. */
const DIGITAL_STAMP_COPY = {
    en: {
        promptShort:   'A government website registered with the Digital Government Authority.',
        howYouKnow:    'How you know?',
        httpsTitle:    'Official Secure websites use',
        httpsTag:      'HTTPS',
        httpsDescription: 'Ensure the website is using the HTTPS protocol.',
        registeredAt:  'Registered on Digital Government Authority:',
        registrationNumber: '20230103200',
    },
    ar: {
        promptShort:   'موقع حكومي مسجل لدى هيئة الحكومة الرقمية.',
        howYouKnow:    'كيف تتحقق؟',
        httpsTitle:    'المواقع الإلكترونية الحكومية الموثوقة تستخدم بروتوكول',
        httpsTag:      'HTTPS',
        httpsDescription: 'تحقق من أن الموقع يستخدم بروتوكول HTTPS',
        registeredAt:  'مسجل لدى هيئة الحكومة الرقمية برقم:',
        registrationNumber: '20230103200',
    },
};

class DigitalStampDemoManager {
    constructor() {
        this.preview = document.getElementById('ds-demo-preview');
        this.deviceSelect = document.getElementById('ds-demo-device');
        this.extensionSelect = document.getElementById('ds-demo-extension');

        if (!this.preview) return;

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
        if (this.deviceSelect)    this.deviceSelect.addEventListener('change', () => this.render());
        if (this.extensionSelect) this.extensionSelect.addEventListener('change', () => this.render());
    }

    render() {
        const device      = this.deviceSelect ? this.deviceSelect.value : 'desktop';
        const extKey      = this.extensionSelect ? this.extensionSelect.value : '.gov.sa';
        const isOpened    = !!this.toggles['opened'];
        const isRTL       = !!this.toggles['rtl'];
        const lang        = isRTL ? 'ar' : 'en';
        const ext         = DIGITAL_STAMP_EXTENSIONS[extKey][lang];
        const t           = DIGITAL_STAMP_COPY[lang];

        const classes = ['digital-stamp'];
        if (device === 'mobile') classes.push('digital-stamp--mobile');
        if (isOpened) classes.push('digital-stamp--opened');
        if (isRTL) classes.push('digital-stamp--rtl');

        const bar = `<div class="digital-stamp__content">
    <div class="digital-stamp__flag" style="background-color: #006923;">${DIGITAL_STAMP_FLAG_SVG}</div>
    <p class="digital-stamp__text">${t.promptShort}</p>
    <button type="button" class="digital-stamp__toggle" aria-expanded="${isOpened}">
        <span>${t.howYouKnow}</span>
        <span class="digital-stamp__toggle-icon">${DIGITAL_STAMP_CHEVRON_SVG}</span>
    </button>
</div>`;

        const extensionSection = isOpened
            ? `<div class="digital-stamp__extension">
    <div class="digital-stamp__verification-card">
        <div class="digital-stamp__verification-icon">${DIGITAL_STAMP_LINK_ICON_SVG}</div>
        <div class="digital-stamp__verification-text">
            <p class="digital-stamp__verification-title">${ext.title} <span class="highlight">${extKey}</span></p>
            <p class="digital-stamp__verification-description">${ext.description}</p>
        </div>
    </div>
    <div class="digital-stamp__verification-card">
        <div class="digital-stamp__verification-icon">${DIGITAL_STAMP_SHIELD_SVG}</div>
        <div class="digital-stamp__verification-text">
            <p class="digital-stamp__verification-title">${t.httpsTitle} <span class="highlight">${t.httpsTag}</span></p>
            <p class="digital-stamp__verification-description">${t.httpsDescription}</p>
        </div>
    </div>
</div>
<div class="digital-stamp__registration">
    <div class="digital-stamp__registration-content">
        <div class="digital-stamp__dga-logo">${DIGITAL_STAMP_DGA_LOGO_SVG}</div>
        <div class="digital-stamp__registration-text">
            <p class="digital-stamp__registration-label">${t.registeredAt}</p>
            <a href="#" class="digital-stamp__registration-link">${t.registrationNumber}</a>
        </div>
    </div>
</div>`
            : '';

        // Mobile bar nests the flag+text in its own inner content wrapper per
        // the existing CSS contract.
        const mobileBar = `<div class="digital-stamp__content">
    <div class="digital-stamp__content">
        <div class="digital-stamp__flag" style="background-color: #006923;">${DIGITAL_STAMP_FLAG_SVG}</div>
        <p class="digital-stamp__text">${t.promptShort}</p>
    </div>
    <button type="button" class="digital-stamp__toggle" aria-expanded="${isOpened}">
        <span>${t.howYouKnow}</span>
        <span class="digital-stamp__toggle-icon">${DIGITAL_STAMP_CHEVRON_SVG}</span>
    </button>
</div>`;

        this.preview.innerHTML = `<div class="${classes.join(' ')}"${isRTL ? ' dir="rtl"' : ''}>
${device === 'mobile' ? mobileBar : bar}
${extensionSection}
</div>`;

        // Re-bind the inner toggle so clicking the stamp's own button flips
        // the demo state too.
        const toggle = this.preview.querySelector('.digital-stamp__toggle');
        if (toggle) toggle.addEventListener('click', () => {
            const btn = document.querySelector('.live-demo__sidebar [data-toggle="opened"]');
            if (btn) btn.click();
        });
    }
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { DigitalStamp, initDigitalStamps, DigitalStampDemoManager };
}
