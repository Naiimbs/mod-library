import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  effect,
  forwardRef,
  input,
  model,
  output,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { ModButton } from '../button/button';

export type ModFileUploadRejectionReason = 'size' | 'type';

export interface ModFileUploadRejection {
  file: File;
  reason: ModFileUploadRejectionReason;
  message: string;
}

/** A file of the value that the application reports as failed (e.g. the upload was refused). */
export interface ModFileUploadFailure {
  file: File;
  message: string;
}

interface FileItem {
  id: number;
  file: File;
  error: string;
}

let nextId = 0;

/**
 * DGA file upload — dashed drop area, browse button and a removable file list.
 * Form control with `File[]` as its value (only files that pass validation).
 *
 *   <mod-file-upload multiple accept=".jpg,.png,.pdf" [maxSize]="2 * 1024 * 1024"
 *                    formats="Max 2MB — .jpg, .png, and .pdf" [(value)]="files" />
 *
 * Files that fail the `accept` / `maxSize` checks are listed with an error
 * row, reported through `rejected`, and never become part of the value.
 * The component does not upload anything itself: pass the files that are
 * still in flight through `uploadingFiles` to show the spinner on their rows.
 */
@Component({
  selector: 'mod-file-upload',
  imports: [ModButton],
  templateUrl: './file-upload.html',
  styleUrl: './file-upload.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => ModFileUpload), multi: true },
  ],
})
export class ModFileUpload implements ControlValueAccessor {
  /** Accepted files (two-way bindable). */
  readonly value = model<File[]>([]);
  /** Allow more than one file. In single mode a new file replaces the list. */
  readonly multiple = input(false, { transform: booleanAttribute });
  /** Native `accept` list (`.pdf,.png`, `image/*`, `application/pdf`). Also enforced on drop. */
  readonly accept = input('');
  /** Maximum size of one file in bytes. `0` = no limit. */
  readonly maxSize = input(0);
  readonly disabled = input(false, { transform: booleanAttribute });
  /** Files currently being uploaded by the application (spinner instead of the check). */
  readonly uploadingFiles = input<readonly File[]>([]);
  /** Files of the value whose upload failed: their rows show the error state with the message. */
  readonly failedFiles = input<readonly ModFileUploadFailure[]>([]);
  /** Forces the drag-over look of the drop area (it is otherwise set while a file hovers). */
  readonly dragActive = input(false, { transform: booleanAttribute });
  /** Hides the drop area and renders only the files list. */
  readonly hideDropArea = input(false, { transform: booleanAttribute });

  /**
   * Main instruction text. Default depends on the mode:
   * "Drag and drop your files here" (multiple) / "Drag and drop your file here" (single).
   */
  readonly instructions = input<string>();
  /** Hint under the instructions, e.g. "Max 2MB — .jpg, .png, and .pdf". */
  readonly formats = input('');
  /** Browse button label. Default: "Browse files" (multiple) / "Browse file" (single). */
  readonly browseLabel = input<string>();
  /**
   * Single mode only: browse button label once a file is selected, since the
   * next pick replaces it. Default: "Replace file".
   */
  readonly replaceLabel = input('Replace file');
  readonly removeLabel = input('Remove file');
  readonly uploadingLabel = input('Uploading');
  readonly sizeErrorMessage = input('File exceeds the size limit.');
  readonly typeErrorMessage = input('File type is not supported.');
  /** Accessible name of the file list. */
  readonly filesListLabel = input('Selected files');

  /** Files that failed validation in the last pick / drop. */
  readonly rejected = output<ModFileUploadRejection[]>();
  /** A file row was removed by the user. */
  readonly fileRemoved = output<File>();

  protected readonly inputId = `mod-file-upload-${nextId++}`;
  protected readonly items = signal<FileItem[]>([]);
  private readonly dragging = signal(false);
  protected readonly dragOver = computed(() => this.dragging() || this.dragActive());
  private readonly formDisabled = signal(false);
  protected readonly isDisabled = computed(() => this.disabled() || this.formDisabled());

  protected readonly instructionsText = computed(
    () =>
      this.instructions() ??
      (this.multiple() ? 'Drag and drop your files here' : 'Drag and drop your file here'),
  );
  protected readonly browseText = computed(() => {
    if (!this.multiple() && this.items().length > 0) return this.replaceLabel();
    return this.browseLabel() ?? (this.multiple() ? 'Browse files' : 'Browse file');
  });

  private readonly fileInput = viewChild<ElementRef<HTMLInputElement>>('fileInput');

  private itemId = 0;
  private lastValue: File[] | null = null;
  private onChange: (value: File[]) => void = () => {};
  private onTouched: () => void = () => {};

  constructor() {
    // Value set from outside (two-way binding): rebuild the rows from it.
    effect(() => {
      const value = this.value();
      if (value === this.lastValue) return;
      untracked(() => this.resetItems(value));
    });
  }

  writeValue(value: File[] | null): void {
    const files = Array.isArray(value) ? value : [];
    this.resetItems(files);
    this.value.set(files);
  }

  registerOnChange(fn: (value: File[]) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.formDisabled.set(isDisabled);
  }

  /** Validation error of the row, or the failure reported by the application. */
  protected errorOf(item: FileItem): string {
    if (item.error) return item.error;
    return this.failedFiles().find((failure) => failure.file === item.file)?.message ?? '';
  }

  protected isUploading(file: File): boolean {
    return this.uploadingFiles().includes(file);
  }

  protected browse(event: Event): void {
    // The button sits inside the <label>: stop the label's native forwarding
    // so the picker opens exactly once.
    event.preventDefault();
    event.stopPropagation();
    if (!this.isDisabled()) this.fileInput()?.nativeElement.click();
  }

  protected onInputChange(): void {
    const input = this.fileInput()?.nativeElement;
    if (!input) return;
    this.addFiles(Array.from(input.files ?? []));
    input.value = '';
  }

  protected onDragOver(event: DragEvent): void {
    event.preventDefault();
    if (!this.isDisabled()) this.dragging.set(true);
  }

  protected onDragLeave(event: DragEvent): void {
    event.preventDefault();
    const area = event.currentTarget;
    const related = event.relatedTarget;
    // Ignore moves between the drop area's own children.
    if (area instanceof Node && related instanceof Node && area.contains(related)) return;
    this.dragging.set(false);
  }

  protected onDrop(event: DragEvent): void {
    event.preventDefault();
    this.dragging.set(false);
    if (this.isDisabled()) return;
    this.addFiles(Array.from(event.dataTransfer?.files ?? []));
  }

  protected remove(item: FileItem): void {
    this.items.update((items) => items.filter((entry) => entry !== item));
    this.fileRemoved.emit(item.file);
    if (!item.error) this.commit();
    this.onTouched();
  }

  private addFiles(files: File[]): void {
    if (!files.length) return;
    const picked = this.multiple() ? files : files.slice(0, 1);
    const added = picked.map((file) => this.toItem(file));
    this.items.update((items) => {
      if (this.multiple()) return [...items, ...added];
      // Single mode: a valid pick replaces the current file. A rejected pick
      // must not discard it, so the accepted file stays next to the error row.
      return added.some((item) => item.error)
        ? [...items.filter((item) => !item.error), ...added]
        : added;
    });

    const rejections = added
      .filter((item) => item.error)
      .map((item) => ({
        file: item.file,
        reason: this.rejectionReason(item.file) ?? 'type',
        message: item.error,
      }));
    if (rejections.length) this.rejected.emit(rejections);

    this.commit();
    this.onTouched();
  }

  private commit(): void {
    const next = this.items()
      .filter((item) => !item.error)
      .map((item) => item.file);
    const current = this.value();
    const unchanged =
      next.length === current.length && next.every((file, index) => file === current[index]);
    if (unchanged) return;
    this.lastValue = next;
    this.value.set(next);
    this.onChange(next);
  }

  private resetItems(files: File[]): void {
    this.lastValue = files;
    this.items.set(files.map((file) => ({ id: this.itemId++, file, error: '' })));
  }

  private toItem(file: File): FileItem {
    const reason = this.rejectionReason(file);
    const error =
      reason === 'size' ? this.sizeErrorMessage() : reason === 'type' ? this.typeErrorMessage() : '';
    return { id: this.itemId++, file, error };
  }

  private rejectionReason(file: File): ModFileUploadRejectionReason | null {
    if (!this.matchesAccept(file)) return 'type';
    const maxSize = this.maxSize();
    if (maxSize > 0 && file.size > maxSize) return 'size';
    return null;
  }

  private matchesAccept(file: File): boolean {
    const tokens = this.accept()
      .split(',')
      .map((token) => token.trim().toLowerCase())
      .filter(Boolean);
    if (!tokens.length) return true;
    const name = file.name.toLowerCase();
    const type = file.type.toLowerCase();
    return tokens.some((token) => {
      if (token.startsWith('.')) return name.endsWith(token);
      if (token.endsWith('/*')) return type.startsWith(token.slice(0, -1));
      return type === token;
    });
  }
}
