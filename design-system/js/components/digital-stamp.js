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

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { DigitalStamp, initDigitalStamps };
}
