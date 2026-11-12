import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  Injector,
  ViewEncapsulation,
  afterNextRender,
  booleanAttribute,
  computed,
  forwardRef,
  inject,
  input,
  model,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { listenOnDocumentWhile } from '../internal/listen-while';

export interface ModDropdownOption<T = unknown> {
  value: T;
  label: string;
  disabled?: boolean;
  /** Options sharing the same group name are rendered under one group label. */
  group?: string;
}

export type ModDropdownSize = 'lg' | 'md';
export type ModDropdownVariant = 'default' | 'lighter' | 'darker';
export type ModDropdownFeedback = 'error' | 'success' | 'warning';

interface DropdownGroup<T> {
  key: string;
  label: string;
  options: ModDropdownOption<T>[];
}

type FocusTarget = 'selected' | 'first' | 'last';

let nextId = 0;

/**
 * DGA dropdown (select). Single select closes on choice and shows a tick;
 * multi select keeps the list open and joins the chosen labels.
 *
 *   <mod-dropdown label="Region" placeholder="Select a region" [options]="regions" [(value)]="region" />
 *   <mod-dropdown multiple [options]="services" formControlName="services" />
 *
 * `value` is the option value (single) or an array of option values (`multiple`).
 */
@Component({
  selector: 'mod-dropdown',
  imports: [NgTemplateOutlet],
  templateUrl: './dropdown.html',
  styleUrl: './dropdown.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => ModDropdown), multi: true },
  ],
  host: {
    '(focusout)': 'onFocusOut($event)',
  },
})
export class ModDropdown<T = unknown> implements ControlValueAccessor {
  /** Selected value, or array of values when `multiple`. Two-way bindable. */
  readonly value = model<T | T[] | null>(null);

  readonly options = input<ModDropdownOption<T>[]>([]);
  readonly label = input<string>('');
  readonly placeholder = input<string>('Select');
  readonly size = input<ModDropdownSize>('lg');
  readonly variant = input<ModDropdownVariant>('default');
  readonly multiple = input(false, { transform: booleanAttribute });
  /** Error outline (also implied by `feedback="error"`). */
  readonly error = input(false, { transform: booleanAttribute });
  /** Feedback icon inside the trigger. */
  readonly feedback = input<ModDropdownFeedback | null>(null);
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly readonly = input(false, { transform: booleanAttribute });
  /** Accessible name when no visible label is rendered. */
  readonly ariaLabel = input<string>('');
  /** Separator between labels in multi select. */
  readonly separator = input<string>(', ');
  /** Equality used to match `value` against option values. */
  readonly compareWith = input<(a: T, b: T) => boolean>((a, b) => Object.is(a, b));

  /** Emits whenever the list opens or closes. */
  readonly openChange = output<boolean>();

  private readonly uid = `mod-dropdown-${++nextId}`;
  protected readonly labelId = `${this.uid}-label`;
  protected readonly triggerId = `${this.uid}-trigger`;
  protected readonly listId = `${this.uid}-list`;

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly injector = inject(Injector);
  private readonly triggerRef = viewChild<ElementRef<HTMLButtonElement>>('trigger');
  private readonly listRef = viewChild<ElementRef<HTMLUListElement>>('list');

  private readonly formDisabled = signal(false);
  protected readonly isOpen = signal(false);
  protected readonly isDisabled = computed(() => this.disabled() || this.formDisabled());
  protected readonly hasError = computed(() => this.error() || this.feedback() === 'error');

  protected readonly classes = computed(() => {
    const list = ['dropdown', `dropdown--${this.size()}`];
    const variant = this.variant();
    if (variant !== 'default') list.push(`dropdown--${variant}`);
    if (this.hasError()) list.push('dropdown--error');
    if (this.isDisabled()) list.push('dropdown--disabled');
    if (this.readonly()) list.push('dropdown--readonly');
    if (this.multiple()) list.push('dropdown--multi-select');
    return list.join(' ');
  });

  /** Consecutive options with the same `group` are rendered together. */
  protected readonly groups = computed(() => {
    const result: DropdownGroup<T>[] = [];
    for (const option of this.options()) {
      const label = option.group ?? '';
      const last = result[result.length - 1];
      if (last && last.label === label) {
        last.options.push(option);
      } else {
        result.push({ key: `${result.length}:${label}`, label, options: [option] });
      }
    }
    return result;
  });

  private readonly selectedValues = computed<T[]>(() => {
    const value = this.value();
    if (value === null || value === undefined) return [];
    if (this.multiple()) return Array.isArray(value) ? value : [value];
    return [value as T];
  });

  private readonly selectedOptions = computed(() =>
    this.options().filter((option) => this.isSelected(option)),
  );

  protected readonly hasSelection = computed(() => this.selectedOptions().length > 0);
  protected readonly displayText = computed(() =>
    this.selectedOptions()
      .map((option) => option.label)
      .join(this.separator()),
  );

  private typeahead = '';
  private typeaheadTimer: ReturnType<typeof setTimeout> | undefined;

  private onChange: (value: T | T[] | null) => void = () => {};
  private onTouched: () => void = () => {};

  constructor() {
    inject(DestroyRef).onDestroy(() => clearTimeout(this.typeaheadTimer));
    listenOnDocumentWhile(() => this.isOpen(), 'click', (event) => this.onDocumentClick(event));
  }

  protected isSelected(option: ModDropdownOption<T>): boolean {
    const compare = this.compareWith();
    return this.selectedValues().some((value) => compare(value, option.value));
  }

  /** Opens the list. */
  open(focus: FocusTarget = 'selected'): void {
    if (this.isOpen() || this.isDisabled() || this.readonly()) return;
    this.isOpen.set(true);
    this.openChange.emit(true);
    // The list is inert until the next render; move focus once it is interactive.
    afterNextRender(() => this.focusOption(focus), { injector: this.injector });
  }

  /** Closes the list, optionally returning focus to the trigger. */
  close(restoreFocus = false): void {
    if (!this.isOpen()) return;
    this.isOpen.set(false);
    this.typeahead = '';
    this.openChange.emit(false);
    this.onTouched();
    if (restoreFocus) this.triggerRef()?.nativeElement.focus();
  }

  protected toggle(): void {
    if (this.isOpen()) this.close();
    else this.open();
  }

  protected select(option: ModDropdownOption<T>): void {
    if (option.disabled || this.isDisabled() || this.readonly()) return;
    if (this.multiple()) {
      const compare = this.compareWith();
      const current = this.selectedValues();
      const next = this.isSelected(option)
        ? current.filter((value) => !compare(value, option.value))
        : [...current, option.value];
      this.value.set(next);
      this.onChange(next);
    } else {
      this.value.set(option.value);
      this.onChange(option.value);
      this.close(true);
    }
  }

  protected onTriggerKeydown(event: KeyboardEvent): void {
    switch (event.key) {
      case 'ArrowDown':
      case 'ArrowUp':
        event.preventDefault();
        if (this.isOpen()) this.focusOption(event.key === 'ArrowDown' ? 'first' : 'last');
        else this.open(this.hasSelection() ? 'selected' : event.key === 'ArrowDown' ? 'first' : 'last');
        break;
      case 'Escape':
        if (this.isOpen()) {
          event.preventDefault();
          // Handled here: an enclosing modal or slideout must not close as well.
          event.stopPropagation();
          this.close();
        }
        break;
    }
  }

  protected onListKeydown(event: KeyboardEvent): void {
    const items = this.enabledOptionElements();
    const index = items.indexOf(event.target as HTMLButtonElement);
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        items[Math.min(index + 1, items.length - 1)]?.focus();
        break;
      case 'ArrowUp':
        event.preventDefault();
        items[Math.max(index - 1, 0)]?.focus();
        break;
      case 'Home':
        event.preventDefault();
        items[0]?.focus();
        break;
      case 'End':
        event.preventDefault();
        items[items.length - 1]?.focus();
        break;
      case 'Escape':
        event.preventDefault();
        event.stopPropagation();
        this.close(true);
        break;
      case 'Tab':
        this.close(true);
        break;
      default:
        if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
          // Space selects unless it is part of a typeahead in progress.
          if (event.key === ' ' && !this.typeahead) return;
          event.preventDefault();
          this.runTypeahead(event.key, items, index);
        }
    }
  }

  private onDocumentClick(event: Event): void {
    if (!this.isOpen()) return;
    const target = event.target;
    if (target instanceof Node && this.host.nativeElement.contains(target)) return;
    this.close();
  }

  protected onFocusOut(event: FocusEvent): void {
    const next = event.relatedTarget;
    if (next instanceof Node && this.host.nativeElement.contains(next)) return;
    if (!this.isOpen()) {
      // Focus left the control without opening it: still counts as touched.
      this.onTouched();
      return;
    }
    // close() marks the control as touched. With no related target (a click on
    // a non-focusable area) the outside-click listener decides.
    if (next instanceof Node) this.close();
  }

  private runTypeahead(key: string, items: HTMLButtonElement[], index: number): void {
    clearTimeout(this.typeaheadTimer);
    this.typeahead += key.toLowerCase();
    this.typeaheadTimer = setTimeout(() => (this.typeahead = ''), 500);

    const query = this.typeahead;
    // A single repeated letter cycles through matches; otherwise match from the current item.
    const start = query.length === 1 ? index + 1 : Math.max(index, 0);
    const ordered = [...items.slice(start), ...items.slice(0, start)];
    ordered
      .find((item) => (item.textContent ?? '').trim().toLowerCase().startsWith(query))
      ?.focus();
  }

  private enabledOptionElements(): HTMLButtonElement[] {
    const list = this.listRef()?.nativeElement;
    if (!list) return [];
    return Array.from(list.querySelectorAll<HTMLButtonElement>('.dropdown__option:not(:disabled)'));
  }

  private focusOption(target: FocusTarget): void {
    const items = this.enabledOptionElements();
    if (!items.length) return;
    let item: HTMLButtonElement | undefined;
    if (target === 'selected') item = items.find((el) => el.classList.contains('selected'));
    if (target === 'last') item = items[items.length - 1];
    (item ?? items[0]).focus();
  }

  writeValue(value: T | T[] | null | undefined): void {
    this.value.set(value ?? null);
  }

  registerOnChange(fn: (value: T | T[] | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.formDisabled.set(isDisabled);
    if (isDisabled) this.close();
  }
}
