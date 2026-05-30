/* ============================================
   MODAL COMPONENT MODULE
   DGA Design System - Modal Dialog
   - ModalManager: open/close behavior for real overlay modals
   - ModalDemoManager: powers the interactive live demo
   ============================================ */

const MODAL_INFO_ICON   = '<span class="dga-icon-information-circle" aria-hidden="true"></span>';
const MODAL_CLOSE_ICON   = '<span class="dga-icon-cancel-01" aria-hidden="true"></span>';
const MODAL_ARROW_ICON   = '<span class="icon"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 8h10M9 4l4 4-4 4"/></svg></span>';

/**
 * ModalManager — wires [data-modal-open="ID"] triggers to the modal
 * backdrop with id ID. Handles backdrop click, ESC, close buttons, and
 * body scroll-lock.
 */
class ModalManager {
    constructor() {
        this.lastFocused = null;
        this.bind();
    }

    bind() {
        // Open triggers
        document.querySelectorAll('[data-modal-open]').forEach(trigger => {
            if (trigger.dataset.modalBound) return;
            trigger.dataset.modalBound = 'true';
            trigger.addEventListener('click', () => {
                const id = trigger.getAttribute('data-modal-open');
                this.open(document.getElementById(id));
            });
        });

        // Close triggers + backdrop click (delegated)
        document.querySelectorAll('.modal-backdrop').forEach(backdrop => {
            if (backdrop.dataset.modalBound) return;
            backdrop.dataset.modalBound = 'true';
            backdrop.addEventListener('click', (e) => {
                if (e.target === backdrop) this.close(backdrop);
            });
            backdrop.querySelectorAll('[data-modal-close]').forEach(btn => {
                btn.addEventListener('click', () => this.close(backdrop));
            });
        });

        // ESC closes the topmost open modal
        if (!ModalManager._escBound) {
            ModalManager._escBound = true;
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    const open = document.querySelector('.modal-backdrop.is-open');
                    if (open) this.close(open);
                }
            });
        }
    }

    open(backdrop) {
        if (!backdrop) return;
        this.lastFocused = document.activeElement;
        backdrop.classList.add('is-open');
        document.body.style.overflow = 'hidden';
        // Focus the first focusable element inside the modal
        const focusable = backdrop.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        if (focusable) focusable.focus();
        backdrop.dispatchEvent(new CustomEvent('modal:open', { bubbles: true }));
    }

    close(backdrop) {
        if (!backdrop) return;
        backdrop.classList.remove('is-open');
        document.body.style.overflow = '';
        if (this.lastFocused && this.lastFocused.focus) this.lastFocused.focus();
        backdrop.dispatchEvent(new CustomEvent('modal:close', { bubbles: true }));
    }
}

/* ============================================
   MODAL DEMO MANAGER
   Renders a live modal inline in the preview canvas (no backdrop) and
   re-renders it as the sidebar controls change.
   ============================================ */

class ModalDemoManager {
    constructor() {
        this.preview = document.getElementById('modal-demo-preview');
        this.alignSelect = document.getElementById('modal-demo-align');
        this.actionsSelect = document.getElementById('modal-demo-actions');
        this.iconColorSelect = document.getElementById('modal-demo-icon-color');
        this.iconVariantSelect = document.getElementById('modal-demo-icon-variant');

        if (!this.preview) return;

        this.labels = {
            en: {
                title: 'Title goes here',
                description: 'When a Modal needs a further detailed explanation, it goes here.',
                action: 'Button',
                customTitle: 'Swap with content component',
                customBody: 'Replace this slot with any component',
            },
            ar: {
                title: 'عنوان الرسالة يُكتب هنا',
                description: 'يُكتب المحتوى الإضافي هنا في حال أن رسالة الإشعار أو التنبيه تحتاج إلى شرح أو تفصيل.',
                action: 'إجراء',
                customTitle: 'استبدل هذا العنصر بأي عنصر آخر',
                customBody: 'يمكن استبدال هذه المنطقة بأي مكون',
            },
        };

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
        [this.alignSelect, this.actionsSelect, this.iconColorSelect, this.iconVariantSelect].forEach(sel => {
            if (sel) sel.addEventListener('change', () => this.render());
        });
    }

    render() {
        const align     = this.alignSelect ? this.alignSelect.value : 'leading';
        const actionN   = this.actionsSelect ? parseInt(this.actionsSelect.value, 10) : 2;
        const isRTL     = !!this.toggles['rtl'];
        const isMobile  = !!this.toggles['mobile'];
        const showIcon  = this.toggles['icon'] !== false;
        const showClose = this.toggles['close'] !== false;
        const showCustom = !!this.toggles['custom'];
        const stack     = isMobile || !!this.toggles['stack'];
        const t         = isRTL ? this.labels.ar : this.labels.en;

        const classes = ['modal'];
        if (isMobile) classes.push('modal--mobile');
        if (align === 'center') classes.push('modal--center');
        if (isRTL) classes.push('modal--rtl');

        const iconColor   = this.iconColorSelect ? this.iconColorSelect.value : 'neutral';
        const iconVariant = this.iconVariantSelect ? this.iconVariantSelect.value : 'light';
        const iconClasses = ['modal-icon'];
        if (iconColor !== 'neutral') {
            iconClasses.push(`modal-icon--${iconColor}`);
            if (iconVariant !== 'light') iconClasses.push(`modal-icon--${iconVariant}`);
        }
        const iconEl  = showIcon ? `<span class="${iconClasses.join(' ')}">${MODAL_INFO_ICON}</span>` : '';
        const closeEl = showClose ? `<button type="button" class="modal-close" aria-label="Close">${MODAL_CLOSE_ICON}</button>` : '';
        const headerTop = (showIcon || showClose)
            ? `<div class="modal-header__top">${iconEl}${closeEl}</div>`
            : '';

        const customEl = showCustom
            ? `<div class="modal-custom">
    <h4 class="modal-custom__title">${t.customTitle}</h4>
    <p class="modal-custom__body">${t.customBody}</p>
</div>`
            : '';

        // Build N action buttons. Inline (desktop): secondary…primary so the
        // primary lands on the trailing edge. Stacked (mobile): primary on
        // TOP, secondaries below — matching the Figma actions row.
        const actionClasses = ['modal-actions'];
        if (stack) actionClasses.push('modal-actions--stack');
        const btns = [];
        for (let i = 0; i < actionN; i++) {
            const isPrimary = i === actionN - 1;
            const cls = isPrimary ? 'btn btn-primary' : 'btn btn-secondary-outline';
            btns.push(`<button class="${cls}">${MODAL_ARROW_ICON}${t.action}</button>`);
        }
        // Primary is built last; for the stacked layout we want it first (top).
        if (stack) btns.reverse();
        const actionsEl = actionN > 0 ? `<div class="${actionClasses.join(' ')}">${btns.join('')}</div>` : '';

        this.preview.innerHTML = `<div class="${classes.join(' ')}"${isRTL ? ' dir="rtl"' : ''}>
    <div class="modal-header">
        ${headerTop}
        <h3 class="modal-title">${t.title}</h3>
    </div>
    <div class="modal-body">
        <p class="modal-description">${t.description}</p>
        ${customEl}
    </div>
    ${actionsEl}
</div>`;
    }
}

// Auto-init the ModalManager once (covers the static showcase overlay
// examples). Re-runs safely on each component:loaded via main.js.
function initModals() {
    return new ModalManager();
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ModalManager, ModalDemoManager, initModals };
}
