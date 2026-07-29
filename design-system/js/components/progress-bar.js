/* ============================================
   PROGRESS BAR DEMO MODULE
   DGA Design System - Linear + Circular progress bars
   Hydrates declarative circular examples and powers the live demo.
   ============================================ */

/* Build the circular SVG exactly like the library:
   strokeWidth = size/10, radius = (size - strokeWidth)/2,
   dashArray = 2πr, dashOffset = dashArray * (1 - pct/100), rotated -180. */
function pbCircularSVG(size, pct, variant) {
    const strokeWidth = size / 10;
    const radius = (size - strokeWidth) / 2;
    const dashArray = 2 * Math.PI * radius;
    const dashOffset = dashArray * (1 - pct / 100);
    const c = size / 2;
    return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
        <circle class="track" fill="none" r="${radius}" cx="${c}" cy="${c}" stroke-width="${strokeWidth}"></circle>
        <circle class="tail tail--${variant}" fill="none" r="${radius}" cx="${c}" cy="${c}" stroke-width="${strokeWidth}"
            stroke-linecap="round" stroke-dasharray="${dashArray.toFixed(3)}" stroke-dashoffset="${dashOffset.toFixed(3)}"
            transform="rotate(-180 ${c} ${c})"></circle>
    </svg>`;
}

/* Hydrate a .circular-progress-bar element from its data- attributes */
function pbHydrateCircular(el) {
    const size = parseInt(el.dataset.size, 10) || 120;
    const pct = Math.max(0, Math.min(100, parseFloat(el.dataset.percentage) || 0));
    const variant = el.dataset.variant || 'primary';
    const text = el.dataset.text || '';

    let label = '';
    if (variant === 'success') {
        label = `<span class="circular-progress-bar__label--icon success icon dga-icon-checkmark-circle-02" aria-hidden="true"></span>`;
    } else if (variant === 'error') {
        label = `<span class="circular-progress-bar__label--icon error icon dga-icon-cancel-circle" aria-hidden="true"></span>`;
    } else {
        label = `<h4 class="circular-progress-bar__label--percentage">${pct}%</h4>`;
    }
    if (text) label += `<h5 class="circular-progress-bar__label--text ${variant}">${text}</h5>`;

    el.setAttribute('role', 'progressbar');
    el.setAttribute('aria-valuenow', String(pct));
    el.setAttribute('aria-valuemin', '0');
    el.setAttribute('aria-valuemax', '100');
    el.innerHTML = `<div class="circular-progress-bar__label">${label}</div>` + pbCircularSVG(size, pct, variant);
}

class ProgressBarDemoManager {
    constructor() {
        // Hydrate all declarative circular examples on the page
        document.querySelectorAll('.circular-progress-bar[data-size]').forEach(pbHydrateCircular);

        this.preview = document.getElementById('progress-bar-demo-preview');
        if (!this.preview) return;

        this.kindSelect = document.getElementById('progress-bar-demo-kind');
        this.styleSelect = document.getElementById('progress-bar-demo-style');
        this.pctSelect = document.getElementById('progress-bar-demo-pct');
        this.linSizeSelect = document.getElementById('progress-bar-demo-lin-size');
        this.circSizeSelect = document.getElementById('progress-bar-demo-circ-size');

        this.toggles = { label: true, helper: true };
        this.initSwitches();
        [this.kindSelect, this.styleSelect, this.pctSelect, this.linSizeSelect, this.circSizeSelect]
            .forEach(sel => sel && sel.addEventListener('change', () => this.render()));
        this.render();
    }

    initSwitches() {
        document.querySelectorAll('.live-demo__switch[data-toggle]').forEach(btn => {
            const key = btn.dataset.toggle;
            if (!(key in this.toggles)) this.toggles[key] = btn.classList.contains('active');

            btn.addEventListener('click', () => {
                this.toggles[key] = !this.toggles[key];
                btn.classList.toggle('active', this.toggles[key]);
                btn.setAttribute('aria-checked', String(this.toggles[key]));
                this.render();
            });
        });
    }

    render() {
        const kind = this.kindSelect.value;
        const style = this.styleSelect.value;
        const pct = parseInt(this.pctSelect.value, 10);
        const isRTL = !!this.toggles['rtl'];

        // show only the size row relevant to the selected kind
        document.getElementById('progress-bar-demo-lin-size-row').style.display = kind === 'linear' ? '' : 'none';
        document.getElementById('progress-bar-demo-circ-size-row').style.display = kind === 'circular' ? '' : 'none';
        document.getElementById('progress-bar-demo-label-row').style.display = kind === 'linear' ? '' : 'none';
        document.getElementById('progress-bar-demo-helper-row').style.display = kind === 'linear' ? '' : 'none';
        document.getElementById('progress-bar-demo-text-row').style.display = kind === 'circular' ? '' : 'none';

        if (kind === 'linear') {
            const size = this.linSizeSelect.value;
            const labels = isRTL
                ? { label: 'جاري رفع الملف', helper: { neutral: 'يتم رفع الملف الآن', error: 'فشل رفع الملف', success: 'اكتمل رفع الملف' } }
                : { label: 'Uploading file', helper: { neutral: 'Your file is being uploaded', error: 'Upload failed', success: 'Upload complete' } };
            const helperTone = style === 'error' ? 'error' : style === 'success' ? 'success' : 'neutral';
            const noteIcon = helperTone === 'error' ? 'dga-icon-cancel-circle error'
                : helperTone === 'success' ? 'dga-icon-checkmark-circle-02 success'
                : 'dga-icon-help-circle';

            let html = `<div class="progress-wrapper" style="max-width: 420px;">`;
            if (this.toggles['label']) html += `<h3 class="progress-bar__label">${labels.label}</h3>`;
            html += `<div class="progress-bar-container ${size}" title="${pct}%">
                <div class="progress-bar ${style}" style="width:${pct}%;">${size === 'lg' && pct > 8 ? `<span class="progress-bar-text">${pct}%</span>` : ''}</div>
            </div>`;
            if (this.toggles['helper']) {
                html += `<div class="progress-bar__note">
                    <span class="progress-bar__note-icon ${noteIcon.split(' ')[1] || ''} icon ${noteIcon.split(' ')[0]}" aria-hidden="true"></span>
                    <p class="${helperTone === 'neutral' ? '' : helperTone}">${labels.helper[helperTone]}</p>
                </div>`;
            }
            html += `</div>`;
            this.preview.innerHTML = html;
        } else {
            const size = this.circSizeSelect.value;
            const holder = document.createElement('div');
            holder.className = 'circular-progress-bar';
            holder.dataset.size = size;
            holder.dataset.percentage = String(pct);
            holder.dataset.variant = style;
            if (this.toggles['text'] && parseInt(size, 10) >= 120) holder.dataset.text = isRTL ? 'مكتمل' : 'Completed';
            pbHydrateCircular(holder);
            holder.setAttribute('data-size', size);
            this.preview.innerHTML = '';
            this.preview.appendChild(holder);
        }
        this.preview.dir = isRTL ? 'rtl' : '';
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = ProgressBarDemoManager;
}
