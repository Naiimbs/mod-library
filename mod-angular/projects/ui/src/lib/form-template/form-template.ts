import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  contentChild,
  input,
  model,
  output,
} from '@angular/core';

/** Stepper slot (left column): `<div modFormTemplateSteps>…</div>`. */
@Directive({ selector: '[modFormTemplateSteps]' })
export class ModFormTemplateSteps {}

/** Breadcrumb slot above the title. Adds `.form-content__breadcrumb` to its host. */
@Directive({ selector: '[modFormTemplateBreadcrumb]', host: { class: 'form-content__breadcrumb' } })
export class ModFormTemplateBreadcrumb {}

/** Extra content appended to the header block, after the required note. */
@Directive({ selector: '[modFormTemplateHeader]' })
export class ModFormTemplateHeader {}

/** Bottom navigation buttons slot: `<ng-container modFormTemplateActions>` or any element. */
@Directive({ selector: '[modFormTemplateActions]' })
export class ModFormTemplateActions {}

/**
 * Form page layout: optional stepper column + form content (header, fields,
 * actions). The host element is the `.form-template` wrapper.
 *
 *   <mod-form-template heading="Text fields" description="…" requiredInfo="Required information">
 *     <div modFormTemplateSteps>…progress indicator…</div>
 *     <nav modFormTemplateBreadcrumb>…</nav>
 *     <mod-form-row>…two fields…</mod-form-row>
 *     <div modFormTemplateActions>…buttons…</div>
 *   </mod-form-template>
 *
 * Default content is projected into `.form-fields`.
 */
@Component({
  selector: 'mod-form-template',
  templateUrl: './form-template.html',
  styleUrl: './form-template.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'form-template' },
})
export class ModFormTemplate {
  /** Page title (`<h1 class="form-content__title">`). */
  readonly heading = input('');
  readonly description = input('');
  /** "Required information" note under the description. Empty hides it. */
  readonly requiredInfo = input('');

  protected readonly stepsSlot = contentChild(ModFormTemplateSteps);
  protected readonly actionsSlot = contentChild(ModFormTemplateActions);
  protected readonly headerSlot = contentChild(ModFormTemplateHeader);
  protected readonly breadcrumbSlot = contentChild(ModFormTemplateBreadcrumb);

  protected readonly hasHeader = computed(
    () =>
      !!this.headerSlot() ||
      !!this.breadcrumbSlot() ||
      !!this.heading() ||
      !!this.description() ||
      !!this.requiredInfo(),
  );
}

/** Two-column row of form fields (`.form-row`); `single` makes it one column. */
@Component({
  selector: 'mod-form-row',
  template: '<ng-content />',
  styleUrl: './form-template.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'form-row', '[class.form-row--single]': 'single()' },
})
export class ModFormRow {
  readonly single = input(false, { transform: booleanAttribute });
}

/**
 * "Was this page useful?" strip shown under the form. Project the answer
 * buttons as content.
 */
@Component({
  selector: 'mod-form-feedback',
  template: `
    <div class="feedback-section__content">
      @if (question()) {
        <span class="feedback-section__question">{{ question() }}</span>
      }
      <div class="feedback-section__actions"><ng-content /></div>
    </div>
    @if (stats()) {
      <span class="feedback-section__stats">{{ stats() }}</span>
    }
  `,
  styleUrl: './form-template.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'feedback-section' },
})
export class ModFormFeedback {
  readonly question = input('');
  readonly stats = input('');
}

export interface ModServiceTabItem {
  label: string;
  /** Link target. Without it the tab behaves as a button. */
  href?: string;
  /** Shows the check mark instead of the chevron. */
  completed?: boolean;
}

/** Service tabs strip shown above the form (`.service-tabs`). */
@Component({
  selector: 'mod-service-tabs',
  template: `
    <nav class="service-tabs" [attr.aria-label]="label() || null">
      @for (tab of tabs(); track $index) {
        <a
          class="service-tab"
          [class.service-tab--active]="$index === active()"
          [attr.href]="tab.href || null"
          [attr.role]="tab.href ? null : 'button'"
          [attr.tabindex]="tab.href ? null : 0"
          [attr.aria-current]="$index === active() ? 'page' : null"
          (click)="select($index)"
          (keydown.enter)="onKey($event, $index, !!tab.href)"
          (keydown.space)="onKey($event, $index, !!tab.href)"
        >
          @if (tab.completed) {
            <svg
              class="service-tab__icon service-tab__icon--check"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              aria-hidden="true"
            >
              <path d="M20 6L9 17l-5-5" />
            </svg>
          } @else {
            <svg
              class="service-tab__icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              aria-hidden="true"
            >
              <path d="M6 9l6 6 6-6" />
            </svg>
          }
          <span>{{ tab.label }}</span>
        </a>
      }
    </nav>
  `,
  styleUrl: './form-template.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModServiceTabs {
  readonly tabs = input.required<ModServiceTabItem[]>();
  /** Index of the active tab. */
  readonly active = model(0);
  /** Accessible name of the `<nav>`. */
  readonly label = input('');
  readonly tabSelect = output<ModServiceTabItem>();

  protected select(index: number): void {
    this.active.set(index);
    const tab = this.tabs()[index];
    if (tab) this.tabSelect.emit(tab);
  }

  protected onKey(event: Event, index: number, isLink: boolean): void {
    if (isLink) return;
    event.preventDefault();
    this.select(index);
  }
}
