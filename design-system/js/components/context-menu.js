/* ============================================
   CONTEXT MENU MANAGER
   DGA Design System - Right-click inspector
   Floating panel that mirrors live demo sidebar
   controls for quick component configuration.
   Also inspects reusable .btn elements anywhere.
   ============================================ */

/* --- Button class-to-prop mapping --- */
const BUTTON_CLASS_MAP = {
    variant: {
        'btn-neutral': 'Neutral',
        'btn-primary': 'Primary',
        'btn-secondary-solid': 'Secondary Solid',
        'btn-secondary-outline': 'Secondary Outline',
        'btn-subtle': 'Subtle',
        'btn-transparent': 'Transparent'
    },
    size: {
        'btn-large': 'Large',
        'btn-medium': 'Medium',
        'btn-small': 'Small'
    },
    modifier: {
        'destructive': 'Destructive',
        'selected': 'Selected',
        'pressed': 'Pressed',
        'btn-loading': 'Loading',
        'btn-icon-only': 'Icon Only',
        'btn-on-color': 'On Color',
        'btn-full-width': 'Full Width'
    }
};

class ContextMenuManager {
    constructor() {
        this.panel = document.createElement('div');
        this.panel.className = 'context-menu-panel';
        document.body.appendChild(this.panel);

        this.isOpen = false;
        this.sidebar = null;
        this._interactiveCanvas = null;

        // Close on click outside
        document.addEventListener('click', (e) => {
            if (this.isOpen && !this.panel.contains(e.target)) {
                this.close();
            }
        });

        // Close on Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.close();
            }
        });
    }

    /* ========================================
       MODE 1: Interactive (live demo sidebar)
       ======================================== */

    /**
     * Attach interactive context menu to a live demo canvas
     * @param {string} canvasSelector - CSS selector for the preview canvas
     * @param {string} sidebarSelector - CSS selector for the controls sidebar
     */
    attachTo(canvasSelector, sidebarSelector) {
        const canvas = document.querySelector(canvasSelector);
        this.sidebar = document.querySelector(sidebarSelector);
        if (!canvas || !this.sidebar) return;

        this._interactiveCanvas = canvas;

        canvas.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            this.openInteractive(e.clientX, e.clientY);
        });
    }

    openInteractive(x, y) {
        if (!this.sidebar) return;

        this.renderControls();
        this.position(x, y);
    }

    renderControls() {
        const rows = this.sidebar.querySelectorAll('.live-demo__sidebar-row');
        let html = '<div class="context-menu-panel__header">Button Props</div>';

        rows.forEach(row => {
            const label = row.querySelector('.live-demo__sidebar-label');
            if (!label) return;

            const labelText = label.textContent.trim();
            const select = row.querySelector('.live-demo__sidebar-select');
            const toggle = row.querySelector('.live-demo__switch');

            if (select) {
                const options = Array.from(select.options).map(opt =>
                    `<option value="${opt.value}"${opt.value === select.value ? ' selected' : ''}>${opt.textContent}</option>`
                ).join('');

                html += `<div class="live-demo__sidebar-row">
                    <label class="live-demo__sidebar-label">${labelText}</label>
                    <select class="live-demo__sidebar-select" data-sync-id="${select.id}">${options}</select>
                </div>`;
            } else if (toggle) {
                const isActive = toggle.classList.contains('active');
                const toggleKey = toggle.dataset.toggle;

                html += `<div class="live-demo__sidebar-row">
                    <label class="live-demo__sidebar-label">${labelText}</label>
                    <button class="live-demo__switch${isActive ? ' active' : ''}" data-sync-toggle="${toggleKey}" type="button" role="switch" aria-checked="${isActive}">
                        <span class="live-demo__switch-thumb"></span>
                    </button>
                </div>`;
            }
        });

        this.panel.innerHTML = html;
        this.bindPanelControls();
    }

    bindPanelControls() {
        // Sync selects
        this.panel.querySelectorAll('select[data-sync-id]').forEach(panelSelect => {
            panelSelect.addEventListener('change', () => {
                const sidebarSelect = document.getElementById(panelSelect.dataset.syncId);
                if (sidebarSelect) {
                    sidebarSelect.value = panelSelect.value;
                    sidebarSelect.dispatchEvent(new Event('change'));
                }
            });
        });

        // Sync toggles
        this.panel.querySelectorAll('button[data-sync-toggle]').forEach(panelSwitch => {
            panelSwitch.addEventListener('click', () => {
                const key = panelSwitch.dataset.syncToggle;
                const sidebarSwitch = this.sidebar.querySelector(`.live-demo__switch[data-toggle="${key}"]`);
                if (sidebarSwitch) {
                    sidebarSwitch.click();
                    this.syncToggleStates();
                }
            });
        });
    }

    syncToggleStates() {
        this.panel.querySelectorAll('button[data-sync-toggle]').forEach(panelSwitch => {
            const key = panelSwitch.dataset.syncToggle;
            const sidebarSwitch = this.sidebar.querySelector(`.live-demo__switch[data-toggle="${key}"]`);
            if (sidebarSwitch) {
                const isActive = sidebarSwitch.classList.contains('active');
                panelSwitch.classList.toggle('active', isActive);
                panelSwitch.setAttribute('aria-checked', String(isActive));
            }
        });
    }

    /* ========================================
       MODE 2: Inspector (read-only props)
       ======================================== */

    /**
     * Attach global inspector for .btn elements within a container.
     * Skips elements inside the interactive canvas (handled by Mode 1).
     * @param {string} containerSelector - CSS selector for the content area
     */
    attachGlobal(containerSelector) {
        const container = document.querySelector(containerSelector);
        if (!container) return;

        container.addEventListener('contextmenu', (e) => {
            const btn = e.target.closest('.btn');
            if (!btn) return;

            // Skip if inside the interactive canvas (Mode 1 handles it)
            if (this._interactiveCanvas && this._interactiveCanvas.contains(btn)) return;

            e.preventDefault();
            this.openInspector(e.clientX, e.clientY, btn);
        });
    }

    /**
     * Open interactive inspector for a .btn element.
     * Controls directly modify the element's classList.
     */
    openInspector(x, y, element) {
        this._inspectTarget = element;
        this.renderInspector();
        this.position(x, y);
    }

    renderInspector() {
        const el = this._inspectTarget;
        if (!el) return;

        const classes = Array.from(el.classList);
        const props = this.parseButtonClasses(classes);

        let html = '<div class="context-menu-panel__header">Button Props</div>';

        // Variant select
        const variantOptions = Object.entries(BUTTON_CLASS_MAP.variant).map(([cls, label]) =>
            `<option value="${cls}"${props.variantClass === cls ? ' selected' : ''}>${label}</option>`
        ).join('');
        html += `<div class="live-demo__sidebar-row">
            <label class="live-demo__sidebar-label">Variant</label>
            <select class="live-demo__sidebar-select" data-prop="variant">${variantOptions}</select>
        </div>`;

        // Size select
        const sizeOptions = Object.entries(BUTTON_CLASS_MAP.size).map(([cls, label]) =>
            `<option value="${cls}"${props.sizeClass === cls ? ' selected' : ''}>${label}</option>`
        ).join('');
        html += `<div class="live-demo__sidebar-row">
            <label class="live-demo__sidebar-label">Size</label>
            <select class="live-demo__sidebar-select" data-prop="size">${sizeOptions}</select>
        </div>`;

        // Modifier toggles
        Object.entries(BUTTON_CLASS_MAP.modifier).forEach(([cls, label]) => {
            const isActive = classes.includes(cls);
            html += `<div class="live-demo__sidebar-row">
                <label class="live-demo__sidebar-label">${label}</label>
                <button class="live-demo__switch${isActive ? ' active' : ''}" data-prop-toggle="${cls}" type="button" role="switch" aria-checked="${isActive}">
                    <span class="live-demo__switch-thumb"></span>
                </button>
            </div>`;
        });

        // Class string footer with copy
        const classStr = classes.join(' ');
        html += `<div class="context-menu-panel__footer">
            <code class="context-menu-panel__code">${classStr}</code>
            <button class="context-menu-panel__copy" type="button" data-copy="${classStr}">Copy</button>
        </div>`;

        this.panel.innerHTML = html;
        this.bindInspectorControls();
    }

    bindInspectorControls() {
        const el = this._inspectTarget;
        if (!el) return;

        // Variant select → swap variant class on the element
        const variantSelect = this.panel.querySelector('select[data-prop="variant"]');
        if (variantSelect) {
            variantSelect.addEventListener('change', () => {
                // Remove all variant classes
                Object.keys(BUTTON_CLASS_MAP.variant).forEach(cls => el.classList.remove(cls));
                // Add selected variant
                el.classList.add(variantSelect.value);
                this.updateInspectorFooter();
            });
        }

        // Size select → swap size class on the element
        const sizeSelect = this.panel.querySelector('select[data-prop="size"]');
        if (sizeSelect) {
            sizeSelect.addEventListener('change', () => {
                // Remove all size classes
                Object.keys(BUTTON_CLASS_MAP.size).forEach(cls => el.classList.remove(cls));
                // Add selected size (btn-large is the default/no-class state, but add it anyway for clarity)
                el.classList.add(sizeSelect.value);
                this.updateInspectorFooter();
            });
        }

        // Modifier toggles → add/remove modifier class on the element
        this.panel.querySelectorAll('button[data-prop-toggle]').forEach(toggle => {
            toggle.addEventListener('click', () => {
                const cls = toggle.dataset.propToggle;
                el.classList.toggle(cls);
                const isActive = el.classList.contains(cls);
                toggle.classList.toggle('active', isActive);
                toggle.setAttribute('aria-checked', String(isActive));
                this.updateInspectorFooter();
            });
        });

        // Copy button
        const copyBtn = this.panel.querySelector('.context-menu-panel__copy');
        if (copyBtn) {
            copyBtn.addEventListener('click', () => {
                const classStr = Array.from(el.classList).join(' ');
                navigator.clipboard.writeText(classStr).then(() => {
                    copyBtn.textContent = 'Copied!';
                    setTimeout(() => { copyBtn.textContent = 'Copy'; }, 1500);
                });
            });
        }
    }

    /**
     * Update the footer class string to reflect current element state
     */
    updateInspectorFooter() {
        const el = this._inspectTarget;
        if (!el) return;
        const code = this.panel.querySelector('.context-menu-panel__code');
        const copyBtn = this.panel.querySelector('.context-menu-panel__copy');
        if (code) {
            const classStr = Array.from(el.classList).join(' ');
            code.textContent = classStr;
            if (copyBtn) copyBtn.dataset.copy = classStr;
        }
    }

    /**
     * Parse button CSS classes into structured props with class references
     */
    parseButtonClasses(classes) {
        let variantClass = 'btn-neutral';
        let sizeClass = 'btn-large';

        for (const cls of classes) {
            if (BUTTON_CLASS_MAP.variant[cls]) {
                variantClass = cls;
            }
            if (BUTTON_CLASS_MAP.size[cls]) {
                sizeClass = cls;
            }
        }

        return { variantClass, sizeClass };
    }

    /* ========================================
       SHARED: Positioning & close
       ======================================== */

    position(x, y) {
        this.panel.style.left = x + 'px';
        this.panel.style.top = y + 'px';
        this.panel.classList.add('context-menu-panel--open');
        this.isOpen = true;

        // Viewport boundary check
        const rect = this.panel.getBoundingClientRect();
        if (rect.right > window.innerWidth) {
            this.panel.style.left = (x - rect.width) + 'px';
        }
        if (rect.bottom > window.innerHeight) {
            this.panel.style.top = (y - rect.height) + 'px';
        }
    }

    close() {
        this.panel.classList.remove('context-menu-panel--open');
        this.isOpen = false;
    }
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ContextMenuManager };
}
