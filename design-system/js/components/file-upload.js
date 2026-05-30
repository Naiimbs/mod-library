/* ============================================
   FILE UPLOAD COMPONENT MODULE
   DGA Design System - File Upload
   - FileUploadManager: real drag/drop + browse + simulated progress
   - FileUploadDemoManager: live demo controls
   ============================================ */

const FU_UPLOAD_ICON = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 16V4M8 8l4-4 4 4"/><path d="M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"/></svg>';
const FU_CHECK_ICON  = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M8.5 12.5l2.5 2.5 4.5-5"/></svg>';
const FU_REMOVE_ICON = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 6l12 12M18 6L6 18"/></svg>';
const FU_FILE_ICON   = '<span class="dga-icon-file-02" aria-hidden="true"></span>';
const FU_IMG_ICON    = '<span class="dga-icon-image-02" aria-hidden="true"></span>';

function fuFormatSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

function fuIsImage(name) { return /\.(png|jpe?g|gif|webp|svg)$/i.test(name); }

/**
 * FileUploadManager — turns any [data-file-upload] container into a working
 * uploader: click/drag the drop zone to add files, watch a simulated upload
 * progress, then see success; remove files via the trailing X.
 */
class FileUploadManager {
    constructor(scope) {
        this.scope = scope || document.getElementById('component-content') || document;
        this.scope.querySelectorAll('[data-file-upload]').forEach(root => this.bind(root));
    }

    bind(root) {
        if (root.dataset.fuBound) return;
        root.dataset.fuBound = 'true';

        const dz = root.querySelector('.file-upload__dropzone');
        const input = root.querySelector('.file-upload__input');
        const list = root.querySelector('.file-upload__list');
        const multiple = root.hasAttribute('data-multiple');
        if (!dz || !input || !list) return;

        const addFiles = (files) => {
            if (dz.classList.contains('is-disabled')) return;
            const arr = [...files];
            const toAdd = multiple ? arr : arr.slice(0, 1);
            if (!multiple) list.innerHTML = '';
            toAdd.forEach(f => this.addFile(list, f));
        };

        dz.addEventListener('click', () => { if (!dz.classList.contains('is-disabled')) input.click(); });
        dz.addEventListener('keydown', (e) => { if ((e.key === 'Enter' || e.key === ' ') && !dz.classList.contains('is-disabled')) { e.preventDefault(); input.click(); } });
        input.addEventListener('change', () => { addFiles(input.files); input.value = ''; });

        ['dragenter', 'dragover'].forEach(ev => dz.addEventListener(ev, (e) => { e.preventDefault(); dz.classList.add('is-dragover'); }));
        ['dragleave', 'drop'].forEach(ev => dz.addEventListener(ev, (e) => { e.preventDefault(); dz.classList.remove('is-dragover'); }));
        dz.addEventListener('drop', (e) => { if (e.dataTransfer?.files) addFiles(e.dataTransfer.files); });
    }

    addFile(list, file) {
        const item = document.createElement('div');
        item.className = 'file-upload__file';
        item.innerHTML = `
            <span class="file-upload__file-icon">${fuIsImage(file.name) ? FU_IMG_ICON : FU_FILE_ICON}</span>
            <div class="file-upload__file-body">
                <span class="file-upload__file-name">${file.name}</span>
                <span class="file-upload__file-meta">${fuFormatSize(file.size)}</span>
                <div class="file-upload__progress">
                    <span class="file-upload__progress-track"><span class="file-upload__progress-fill"></span></span>
                    <span class="file-upload__progress-value">0%</span>
                </div>
            </div>
            <button type="button" class="file-upload__file-action" aria-label="Remove">${FU_REMOVE_ICON}</button>`;
        list.appendChild(item);

        const fill = item.querySelector('.file-upload__progress-fill');
        const val = item.querySelector('.file-upload__progress-value');
        const removeBtn = item.querySelector('.file-upload__file-action');
        removeBtn.addEventListener('click', () => item.remove());

        // Simulate upload progress
        let pct = 0;
        const tick = () => {
            pct = Math.min(100, pct + Math.random() * 18 + 6);
            fill.style.width = pct + '%';
            val.textContent = Math.round(pct) + '%';
            if (pct < 100) {
                this._t = setTimeout(tick, 180);
            } else {
                this.markComplete(item, file);
            }
        };
        this._t = setTimeout(tick, 200);
    }

    markComplete(item, file) {
        item.classList.add('file-upload__file--success');
        const body = item.querySelector('.file-upload__file-body');
        body.querySelector('.file-upload__progress').remove();
        const meta = body.querySelector('.file-upload__file-meta');
        meta.textContent = `${fuFormatSize(file.size)} • Uploaded`;
        // Replace remove with a success check + keep remove available
        const action = item.querySelector('.file-upload__file-action');
        const status = document.createElement('span');
        status.className = 'file-upload__status';
        status.style.color = 'var(--color-success-700, #067647)';
        status.innerHTML = FU_CHECK_ICON;
        item.insertBefore(status, action);
    }
}

/* ============================================
   FILE UPLOAD DEMO MANAGER
   ============================================ */

class FileUploadDemoManager {
    constructor() {
        this.preview = document.getElementById('file-upload-demo-preview');
        this.modeSelect = document.getElementById('file-upload-demo-mode');
        if (!this.preview) return;

        // Helper text + action label mirror the Figma _Drop Zone component
        // (Show Helper Text + Button / action-name).
        this.labels = {
            en: {
                title: 'Drag and drop your files here',
                browse: 'Browse files',
                hint: 'Maximum file size allowed is 2MB, supported file formats include .jpg, .png, and .pdf.',
            },
            ar: {
                title: 'اسحب وأفلت ملفاتك هنا',
                browse: 'تصفّح الملفات',
                hint: 'الحد الأقصى لحجم الملف 2 ميجابايت، الصيغ المدعومة: ‎.jpg‎ و‎.png‎ و‎.pdf‎.',
            },
        };

        this.toggles = {};
        this.initSwitches();
        if (this.modeSelect) this.modeSelect.addEventListener('change', () => this.render());
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

    render() {
        const mode = this.modeSelect ? this.modeSelect.value : 'multiple';
        const isRTL = !!this.toggles['rtl'];
        const disabled = !!this.toggles['disabled'];
        const t = isRTL ? this.labels.ar : this.labels.en;

        const classes = ['file-upload'];
        if (mode === 'single') classes.push('file-upload--single');
        if (isRTL) classes.push('file-upload--rtl');

        this.preview.innerHTML = `<div class="${classes.join(' ')}"${isRTL ? ' dir="rtl"' : ''} data-file-upload${mode === 'multiple' ? ' data-multiple' : ''}>
    <div class="file-upload__dropzone${disabled ? ' is-disabled' : ''}" tabindex="${disabled ? -1 : 0}" role="button">
        <span class="file-upload__dz-icon">${FU_UPLOAD_ICON}</span>
        <p class="file-upload__dz-title">${t.title}</p>
        <button type="button" class="btn btn-secondary-outline file-upload__browse-btn"${disabled ? ' disabled' : ''}>${t.browse}</button>
        <p class="file-upload__dz-hint">${t.hint}</p>
        <input type="file" class="file-upload__input" ${mode === 'multiple' ? 'multiple' : ''} accept=".png,.jpg,.jpeg,.pdf" aria-label="Upload files">
    </div>
    <div class="file-upload__list"></div>
</div>`;

        // Re-bind interactivity on the fresh markup
        if (window.DGA && window.DGA.get && window.DGA.get('fileUpload')) {
            window.DGA.get('fileUpload').bind(this.preview.querySelector('[data-file-upload]'));
        } else if (typeof FileUploadManager !== 'undefined') {
            new FileUploadManager(this.preview);
        }
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { fuFormatSize, FileUploadManager, FileUploadDemoManager };
}
