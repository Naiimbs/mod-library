import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { ModFileUpload, ModFileUploadFailure } from '@mod-internal/ui';
import { DEMO_KIT, DemoOption, DemoProp } from '../../shared/demo-kit';

type Mode = 'multiple' | 'single';

const MAX_SIZE = 2 * 1024 * 1024;

function sample(name: string): File {
  return new File([''], name);
}

@Component({
  selector: 'demo-file-upload-page',
  imports: [ModFileUpload, ...DEMO_KIT],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="content-header">
      <h1 class="content-title">File Upload</h1>
      <p class="content-description">
        Lets users select and upload files from their device. A dashed drop area with an upload icon, instruction
        text, supported-formats hint, and a browse button; selected files appear below as flat rows with a status
        icon, the file name, and a remove action. Errors wrap the row in red and attach a message strip. Rebuilt to
        match the DGA library's <code>mod-file-upload</code> anatomy exactly.
      </p>
    </div>

    <demo-live
      heading="File Upload"
      description="This demo really works — drop a file or click the browse button to add one, watch the simulated upload, then remove it."
      [rtl]="rtl()"
    >
      <mod-file-upload
        accept=".jpg,.jpeg,.png,.pdf,.csv"
        [maxSize]="maxSize"
        [multiple]="mode() === 'multiple'"
        [disabled]="disabled()"
        [instructions]="t().instructions"
        [formats]="t().formats"
        [browseLabel]="t().browse"
        [replaceLabel]="t().replace"
        [removeLabel]="t().remove"
        [uploadingLabel]="t().uploading"
        [sizeErrorMessage]="t().error"
        [typeErrorMessage]="t().typeError"
        [filesListLabel]="t().list"
        [uploadingFiles]="uploading()"
        [value]="files()"
        (valueChange)="onFiles($event)"
      />

      <demo-switch label="RTL" [(checked)]="rtl" />
      <demo-select label="Mode" [options]="modes" [value]="mode()" (valueChange)="setMode($event)" />
      <demo-switch label="Disabled" [(checked)]="disabled" />
      <p demoControl class="live-demo__sidebar-desc" style="padding: var(--spacing-md) 0 0;">
        Single mode keeps only the most recent file; multiple mode appends each new selection. The disabled state
        blocks all interaction.
      </p>
    </demo-live>

    <demo-props
      description="Inputs, models and outputs of the mod-file-upload component. It is a form control (ControlValueAccessor) whose value is the list of accepted files."
      [props]="props"
    />

    <demo-showcase
      heading="Drop Area"
      description="Default, drag-over, and disabled. The dashed border is an SVG stroke (12 / 6.5 dashes), swapping from gray to Saudi green while a file hovers."
    >
      <div class="showcase-row" style="align-items: flex-start; gap: var(--spacing-3xl); width: 100%; justify-content: center;">
        <mod-file-upload multiple formats="Max 2MB — .jpg, .png, and .pdf" [maxSize]="maxSize" />
        <mod-file-upload
          multiple
          dragActive
          instructions="Drop it to upload"
          formats="Max 2MB — .jpg, .png, and .pdf"
          [maxSize]="maxSize"
        />
        <mod-file-upload multiple disabled formats="Max 2MB — .jpg, .png, and .pdf" [maxSize]="maxSize" />
      </div>
    </demo-showcase>

    <demo-showcase
      heading="Single vs Multiple"
      description="Single mode asks for one file: the wording is singular, a new pick replaces the current file, and the button reads “Replace file” once a file is selected. Multiple mode appends every pick to the list."
    >
      <div class="showcase-row" style="align-items: flex-start; gap: var(--spacing-3xl); width: 100%; justify-content: center;">
        <div style="width: 334px; max-width: 100%;">
          <span class="showcase-label">Single</span>
          <mod-file-upload formats="Max 2MB — .jpg, .png, and .pdf" [maxSize]="maxSize" [(value)]="singleFile" />
        </div>
        <div style="width: 334px; max-width: 100%;">
          <span class="showcase-label">Multiple</span>
          <mod-file-upload multiple formats="Max 2MB — .jpg, .png, and .pdf" [maxSize]="maxSize" [(value)]="multiFiles" />
        </div>
      </div>
    </demo-showcase>

    <demo-showcase
      heading="File Items"
      description="Uploading shows a tiny spinner; complete shows the green check; an error wraps the row with a red border and attaches the message strip below."
    >
      <mod-file-upload
        multiple
        hideDropArea
        [uploadingFiles]="itemsUploading"
        [failedFiles]="itemsFailed"
        [(value)]="items"
      />
    </demo-showcase>

    <demo-showcase
      heading="Complete Component"
      description="The drop area with its files list, exactly as the library composes them (8px column gap, 334px max width)."
    >
      <mod-file-upload
        multiple
        accept=".jpg,.jpeg,.png,.pdf"
        formats="Max 2MB — .jpg, .png, and .pdf"
        sizeErrorMessage="File exceeds the 2MB size limit."
        [maxSize]="maxSize"
        [(value)]="complete"
      />
    </demo-showcase>

    <demo-showcase
      heading="RTL Layout"
      description="The rows mirror; Latin file names stay readable via bidi-isolated text."
    >
      <div dir="rtl" style="display: flex; justify-content: center; width: 100%;">
        <mod-file-upload
          multiple
          instructions="اسحب الملفات وأفلتها هنا"
          formats="بحد أقصى 2 ميجابايت — ‎.jpg و .png و .pdf"
          browseLabel="استعراض الملفات"
          removeLabel="إزالة الملف"
          uploadingLabel="جارٍ الرفع"
          sizeErrorMessage="يتجاوز الملف الحد الأقصى 2 ميجابايت."
          typeErrorMessage="نوع الملف غير مدعوم."
          filesListLabel="الملفات المحددة"
          [maxSize]="maxSize"
          [(value)]="rtlFiles"
        />
      </div>
    </demo-showcase>
  `,
})
export class FileUploadPage {
  private readonly destroyRef = inject(DestroyRef);
  private readonly timers = new Set<ReturnType<typeof setTimeout>>();

  protected readonly maxSize = MAX_SIZE;
  protected readonly modes: DemoOption<Mode>[] = [
    { value: 'multiple', label: 'Multiple' },
    { value: 'single', label: 'Single' },
  ];

  protected readonly rtl = signal(false);
  protected readonly mode = signal<Mode>('multiple');
  protected readonly disabled = signal(false);

  /** Live demo: accepted files and the ones whose simulated upload is still running. */
  protected readonly files = signal<File[]>([]);
  protected readonly uploading = signal<File[]>([]);

  protected readonly t = computed(() => {
    const single = this.mode() === 'single';
    return this.rtl()
      ? {
          instructions: single ? 'اسحب الملف وأفلته هنا' : 'اسحب الملفات وأفلتها هنا',
          formats: 'بحد أقصى 2 ميجابايت — ‎.jpg و .png و .pdf',
          browse: single ? 'استعراض الملف' : 'استعراض الملفات',
          replace: 'استبدال الملف',
          remove: 'إزالة الملف',
          uploading: 'جارٍ الرفع',
          error: 'يتجاوز الملف الحد الأقصى 2 ميجابايت.',
          typeError: 'نوع الملف غير مدعوم.',
          list: 'الملفات المحددة',
        }
      : {
          instructions: single ? 'Drag and drop your file here' : 'Drag and drop your files here',
          formats: 'Max 2MB — .jpg, .png, and .pdf',
          browse: single ? 'Browse file' : 'Browse files',
          replace: 'Replace file',
          remove: 'Remove file',
          uploading: 'Uploading',
          error: 'File exceeds the 2MB size limit.',
          typeError: 'File type is not supported.',
          list: single ? 'Selected file' : 'Selected files',
        };
  });

  // "File Items" showcase: one uploading, one complete, one failed row.
  private readonly uploadingSample = sample('File-name.csv');
  private readonly completeSample = sample('File-name.csv');
  private readonly failedSample = sample('File-name.csv');
  protected readonly items = signal<File[]>([this.uploadingSample, this.completeSample, this.failedSample]);
  protected readonly itemsUploading: File[] = [this.uploadingSample];
  protected readonly itemsFailed: ModFileUploadFailure[] = [
    { file: this.failedSample, message: 'File exceeds the 2MB size limit.' },
  ];

  protected readonly complete = signal<File[]>([sample('National-ID.pdf'), sample('Profile-photo.png')]);
  protected readonly rtlFiles = signal<File[]>([sample('File-name.csv')]);
  protected readonly singleFile = signal<File[]>([sample('National-ID.pdf')]);
  protected readonly multiFiles = signal<File[]>([sample('National-ID.pdf'), sample('Profile-photo.png')]);

  constructor() {
    this.destroyRef.onDestroy(() => {
      for (const timer of this.timers) clearTimeout(timer);
    });
  }

  /** Simulated upload, as in the original demo: spinner for 1.4s, then the green check. */
  protected onFiles(next: File[]): void {
    const previous = this.files();
    const added = next.filter((file) => !previous.includes(file));
    this.files.set(next);
    this.uploading.update((list) => [...list.filter((file) => next.includes(file)), ...added]);
    if (!added.length) return;
    const timer = setTimeout(() => {
      this.timers.delete(timer);
      this.uploading.update((list) => list.filter((file) => !added.includes(file)));
    }, 1400);
    this.timers.add(timer);
  }

  /** Changing the mode empties the list, as in the original demo. */
  protected setMode(mode: Mode): void {
    this.mode.set(mode);
    this.files.set([]);
    this.uploading.set([]);
  }

  protected readonly props: DemoProp[] = [
    { name: '[(value)]', type: 'File[]', default: '[]', description: 'Accepted files (only those that pass validation). Also available through ngModel / formControl.' },
    { name: 'multiple', type: 'boolean', default: 'false', description: 'Allow more than one file. In single mode a new file replaces the list.' },
    { name: 'accept', type: 'string', default: "''", description: 'Native accept list (.pdf,.png, image/*, application/pdf). Also enforced on drop.' },
    { name: 'maxSize', type: 'number', default: '0', description: 'Maximum size of one file in bytes. 0 = no limit.' },
    { name: 'disabled', type: 'boolean', default: 'false', description: 'Disabled state — gray dashes, gray icon, blocks all interaction.' },
    { name: 'uploadingFiles', type: 'File[]', default: '[]', description: 'Files currently being uploaded by the application: their rows show the spinner instead of the check.' },
    { name: 'failedFiles', type: '{ file: File; message: string }[]', default: '[]', description: 'Files of the value whose upload failed: their rows show the red error state with the message strip.' },
    { name: 'dragActive', type: 'boolean', default: 'false', description: 'Forces the drag-over look (green dashes). It is otherwise applied while a file hovers the drop area.' },
    { name: 'hideDropArea', type: 'boolean', default: 'false', description: 'Hides the drop area and renders only the files list.' },
    { name: 'instructions', type: 'string', default: "'Drag and drop your files here' / '…your file here' (single)", description: 'Main instruction text of the drop area. The default follows the mode.' },
    { name: 'replaceLabel', type: 'string', default: "'Replace file'", description: 'Single mode: browse button label once a file is selected, because the next pick replaces it.' },
    { name: 'formats', type: 'string', default: "''", description: 'Supported-formats hint under the instructions.' },
    { name: 'browseLabel', type: 'string', default: "'Browse files'", description: 'Label of the browse button.' },
    { name: 'removeLabel', type: 'string', default: "'Remove file'", description: 'Accessible prefix of the remove button of a file row.' },
    { name: 'uploadingLabel', type: 'string', default: "'Uploading'", description: 'Accessible name of the spinner.' },
    { name: 'sizeErrorMessage', type: 'string', default: "'File exceeds the size limit.'", description: 'Message of a row rejected because of maxSize.' },
    { name: 'typeErrorMessage', type: 'string', default: "'File type is not supported.'", description: 'Message of a row rejected because of accept.' },
    { name: 'filesListLabel', type: 'string', default: "'Selected files'", description: 'Accessible name of the files list.' },
    { name: '(rejected)', type: 'ModFileUploadRejection[]', description: 'Files that failed validation in the last pick / drop, with the reason and message.' },
    { name: '(fileRemoved)', type: 'File', description: 'A file row was removed by the user.' },
  ];
}
