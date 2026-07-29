/* ============================================
   FILE UPLOAD MODULE
   DGA Design System - File Upload behavior + live demo
   Generates the dga-file-upload anatomy: dashed drop area with a
   hidden native input, browse button, and flat file rows with a
   status slot (spinner → check), name, and remove action.
   ============================================ */

class FileUploadManager {
    constructor() {
        this.preview = document.getElementById('file-upload-demo-preview');
        this.content = document.getElementById('component-content');

        // Static showcase rows: make their remove buttons work
        this.content?.addEventListener('click', (e) => {
            const btn = e.target.closest('.file-upload__file-item .btn, .file-upload__file-item--error .btn');
            if (btn && !btn.closest('#file-upload-demo-preview')) {
                (btn.closest('.file-upload__file-item--error') || btn.closest('.file-upload__file-item'))?.remove();
            }
        });

        if (!this.preview) return;

        this.modeSelect = document.getElementById('file-upload-demo-mode');
        this.toggles = {};
        this.files = [];
        this.counter = 0;

        this.initSwitches();
        this.modeSelect.addEventListener('change', () => { this.files = []; this.render(); });
        this.render();

        // Remove buttons inside the live demo (delegated once)
        this.preview.addEventListener('click', (e) => {
            const rm = e.target.closest('[data-remove]');
            if (!rm) return;
            this.files = this.files.filter(f => String(f.id) !== rm.dataset.remove);
            this.renderList();
        });
    }

    initSwitches() {
        document.querySelectorAll('.live-demo__switch[data-toggle]').forEach(btn => {
            const key = btn.dataset.toggle;
            this.toggles[key] = btn.classList.contains('active');

            btn.addEventListener('click', () => {
                this.toggles[key] = !this.toggles[key];
                btn.classList.toggle('active', this.toggles[key]);
                btn.setAttribute('aria-checked', String(this.toggles[key]));
                this.render();
            });
        });
    }

    t() {
        return this.toggles['rtl']
            ? {
                instructions: 'اسحب الملفات وأفلتها هنا',
                formats: 'بحد أقصى 2 ميجابايت — ‎.jpg و .png و .pdf',
                browse: 'استعراض الملفات',
                remove: 'إزالة الملف',
                error: 'يتجاوز الملف الحد الأقصى 2 ميجابايت.',
            }
            : {
                instructions: 'Drag and drop your files here',
                formats: 'Max 2MB — .jpg, .png, and .pdf',
                browse: 'Browse files',
                remove: 'Remove file',
                error: 'File exceeds the 2MB size limit.',
            };
    }

    fileRowHTML(file) {
        const t = this.t();
        const close = `<button type="button" class="btn btn-transparent btn-icon-only btn-small"
            data-remove="${file.id}" aria-label="${t.remove}">
            <span class="icon dga-icon-multiplication-sign"></span></button>`;

        if (file.status === 'error') {
            return `<div class="file-upload__file-item--error">
                <div class="file-upload__file-item">
                    <span class="file-upload__file-status file-upload__file-status--error"><span
                        class="icon dga-icon-checkmark-circle-04 solid rounded"></span></span>
                    <span class="file-upload__file-name">${file.name}</span>
                    ${close}
                </div>
                <div class="file-upload__file-item-msg">${t.error}</div>
            </div>`;
        }
        const status = file.status === 'uploading'
            ? `<span class="file-upload__spinner" aria-label="Uploading"></span>`
            : `<span class="icon dga-icon-checkmark-circle-02 solid rounded"></span>`;
        return `<div class="file-upload__file-item">
            <span class="file-upload__file-status${file.status === 'complete' ? ' file-upload__file-status--complete' : ''}">${status}</span>
            <span class="file-upload__file-name">${file.name}</span>
            ${close}
        </div>`;
    }

    render() {
        const t = this.t();
        const disabled = !!this.toggles['disabled'];
        const mods = ['file-upload'];
        if (disabled) mods.push('file-upload--disabled');

        this.preview.innerHTML = `
            <div class="${mods.join(' ')}" data-fu-root>
                <input type="file" class="file-upload__input" id="fu-demo-input"
                    ${this.modeSelect.value === 'multiple' ? 'multiple' : ''} ${disabled ? 'disabled' : ''}
                    accept=".jpg,.jpeg,.png,.pdf,.csv">
                <label class="file-upload__drop-area" for="fu-demo-input">
                    <span class="file-upload__icon"><span class="icon dga-icon-file-upload"></span></span>
                    <div class="file-upload__content">
                        <p class="file-upload__instructions">${t.instructions}</p>
                        <p class="file-upload__formats">${t.formats}</p>
                    </div>
                    <button type="button" class="btn btn-secondary-solid btn-medium" data-browse
                        ${disabled ? 'disabled' : ''}>${t.browse}</button>
                </label>
                <div class="file-upload__files-list">${this.files.map(f => this.fileRowHTML(f)).join('')}</div>
            </div>`;
        this.preview.dir = this.toggles['rtl'] ? 'rtl' : '';
        this.bindDemo();
    }

    renderList() {
        const list = this.preview.querySelector('.file-upload__files-list');
        if (list) {
            list.innerHTML = this.files.map(f => this.fileRowHTML(f)).join('');
        }
    }

    bindDemo() {
        const root = this.preview.querySelector('[data-fu-root]');
        const input = root.querySelector('.file-upload__input');
        const dropArea = root.querySelector('.file-upload__drop-area');

        root.querySelector('[data-browse]')?.addEventListener('click', (e) => {
            // the button sits inside the <label>: stop the label's native
            // forwarding so the picker opens exactly once
            e.preventDefault();
            e.stopPropagation();
            input.click();
        });

        input.addEventListener('change', () => {
            [...input.files].forEach(f => this.addFile(f.name, f.size));
            input.value = '';
        });

        ['dragenter', 'dragover'].forEach(ev => dropArea.addEventListener(ev, (e) => {
            e.preventDefault();
            if (!this.toggles['disabled']) root.classList.add('file-upload--drag-over');
        }));
        ['dragleave', 'drop'].forEach(ev => dropArea.addEventListener(ev, (e) => {
            e.preventDefault();
            root.classList.remove('file-upload--drag-over');
        }));
        dropArea.addEventListener('drop', (e) => {
            if (this.toggles['disabled']) return;
            [...(e.dataTransfer?.files || [])].forEach(f => this.addFile(f.name, f.size));
        });
    }

    addFile(name, size) {
        const file = {
            id: ++this.counter,
            name,
            status: size > 2 * 1024 * 1024 ? 'error' : 'uploading',
        };
        if (this.modeSelect.value === 'single') this.files = [];
        this.files.push(file);
        this.renderList();

        if (file.status === 'uploading') {
            setTimeout(() => {
                file.status = 'complete';
                this.renderList();
            }, 1400);
        }
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { FileUploadManager };
}
