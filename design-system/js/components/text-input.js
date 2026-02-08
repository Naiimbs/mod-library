/* ============================================
   TEXT INPUT COMPONENT
   DGA Design System - Text Input Interactions
   Handles character counting and password toggle
   ============================================ */

class TextInputManager {
    constructor(config = {}) {
        this.counterSelector = config.counterSelector || '[data-text-input-counter]';
        this.togglePasswordSelector = config.togglePasswordSelector || '[data-toggle-password]';

        this.init();
    }

    init() {
        this.initCharacterCounters();
        this.initPasswordToggles();
    }

    /**
     * Initialize character counter inputs
     */
    initCharacterCounters() {
        document.querySelectorAll(this.counterSelector).forEach(input => {
            const wrapper = input.closest('.text-input');
            if (!wrapper) return;

            const counter = wrapper.querySelector('.text-input__char-count');
            if (!counter) return;

            const maxLength = parseInt(input.getAttribute('maxlength'), 10);

            const updateCount = () => {
                const current = input.value.length;
                counter.textContent = `${current}/${maxLength}`;

                if (current > maxLength) {
                    counter.classList.add('text-input__char-count--error');
                } else {
                    counter.classList.remove('text-input__char-count--error');
                }
            };

            updateCount();
            input.addEventListener('input', updateCount);
        });
    }

    /**
     * Initialize password visibility toggles
     */
    initPasswordToggles() {
        document.querySelectorAll(this.togglePasswordSelector).forEach(toggle => {
            toggle.addEventListener('click', () => {
                const wrapper = toggle.closest('.text-input__field-wrapper');
                if (!wrapper) return;

                const input = wrapper.querySelector('.text-input__field');
                if (!input) return;

                const isPassword = input.type === 'password';
                input.type = isPassword ? 'text' : 'password';

                toggle.setAttribute('aria-label', isPassword ? 'Hide password' : 'Show password');
            });
        });
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = TextInputManager;
}
