/* ============================================
   PROGRESS INDICATOR DEMO MODULE
   DGA Design System - Progress Indicator Live Demo
   Single Responsibility: Demo interaction logic
   ============================================ */

class ProgressIndicatorDemoManager {
    constructor() {
        this.preview = document.getElementById('pi-demo-preview');
        this.alignmentSelect = document.getElementById('pi-demo-alignment');
        this.styleSelect = document.getElementById('pi-demo-style');
        this.stepsSelect = document.getElementById('pi-demo-steps');
        this.currentSelect = document.getElementById('pi-demo-current');

        if (!this.preview) return;

        this.labels = {
            en: {
                names: ['Account Setup', 'Personal Info', 'Verification', 'Confirmation', 'Complete'],
                descs: ['Create your account', 'Fill in your details', 'Verify your identity', 'Review and confirm', 'Finish the process']
            },
            ar: {
                names: ['إنشاء الحساب', 'المعلومات الشخصية', 'التحقق', 'التأكيد', 'الإكمال'],
                descs: ['أنشئ حسابك', 'أدخل بياناتك', 'تحقق من هويتك', 'راجع وأكد', 'أنهِ العملية']
            }
        };

        this.checkSVG = '<svg class="progress-step__check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 13l4 4L19 7"/></svg>';

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
        this.alignmentSelect.addEventListener('change', () => this.render());
        this.styleSelect.addEventListener('change', () => this.render());
        this.stepsSelect.addEventListener('change', () => {
            this.updateCurrentStepOptions();
            this.render();
        });
        this.currentSelect.addEventListener('change', () => this.render());
    }

    updateCurrentStepOptions() {
        const stepCount = parseInt(this.stepsSelect.value);
        const currentVal = parseInt(this.currentSelect.value);
        this.currentSelect.innerHTML = '';
        for (let i = 1; i <= stepCount; i++) {
            const opt = document.createElement('option');
            opt.value = i;
            opt.textContent = i;
            if (i === currentVal) opt.selected = true;
            this.currentSelect.appendChild(opt);
        }
        // Ensure current step is within bounds
        if (currentVal > stepCount) {
            this.currentSelect.value = stepCount;
        }
    }

    render() {
        const alignment = this.alignmentSelect.value;
        const style = this.styleSelect.value;
        const stepCount = parseInt(this.stepsSelect.value);
        const currentStep = parseInt(this.currentSelect.value);
        const isRTL = this.toggles['rtl'] || false;
        const isFocused = this.toggles['focused'] || false;
        const showName = this.toggles['step-name'] !== false;
        const showDesc = this.toggles['description'] !== false;
        const lang = isRTL ? 'ar' : 'en';
        const names = this.labels[lang].names;
        const descs = this.labels[lang].descs;

        let stepsHTML = '';

        for (let i = 1; i <= stepCount; i++) {
            let status;
            if (i < currentStep) {
                status = 'completed';
            } else if (i === currentStep) {
                status = 'current';
            } else {
                status = 'upcoming';
            }

            const isLast = i === stepCount;

            // Circle content
            let circleContent;
            if (status === 'completed') {
                circleContent = this.checkSVG;
            } else {
                circleContent = `<span class="progress-step__number">${i}</span>`;
            }

            // Connector
            const connectorHTML = !isLast
                ? '<div class="progress-step__connector"></div>'
                : '';

            // Text
            let textHTML = '';
            if (showName || showDesc) {
                textHTML = '<div class="progress-step__text">';
                if (showName) {
                    textHTML += `<span class="progress-step__name">${names[i - 1]}</span>`;
                }
                if (showDesc) {
                    textHTML += `<span class="progress-step__desc">${descs[i - 1]}</span>`;
                }
                textHTML += '</div>';
            }

            const focusedClass = isFocused ? ' progress-step--focused' : '';

            stepsHTML += `
                <div class="progress-step progress-step--${status}${focusedClass}">
                    <div class="progress-step__track">
                        <div class="progress-step__circle" tabindex="0">
                            ${circleContent}
                        </div>
                        ${connectorHTML}
                    </div>
                    ${textHTML}
                </div>
            `;
        }

        const dotClass = style === 'dot' ? ' progress-indicator--dot' : '';

        const html = `
            <div class="progress-indicator progress-indicator--${alignment}${dotClass}">
                ${stepsHTML}
            </div>
        `;

        this.preview.innerHTML = html;
        this.preview.dir = isRTL ? 'rtl' : '';

        // Add click handlers to step circles for interactive demo
        this.preview.querySelectorAll('.progress-step__circle').forEach((circle, idx) => {
            circle.addEventListener('click', () => {
                this.currentSelect.value = idx + 1;
                this.render();
            });
        });
    }
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ProgressIndicatorDemoManager };
}
