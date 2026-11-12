import { ChangeDetectionStrategy, Component, ViewEncapsulation, computed, signal } from '@angular/core';
import {
  ModButton,
  ModModal,
  ModModalActions,
  ModModalAlign,
  ModModalClose,
  ModModalIconColor,
  ModModalIconVariant,
} from '@mod-internal/ui';
import { DEMO_KIT, DemoOption, DemoProp } from '../../shared/demo-kit';

@Component({
  selector: 'demo-modal-page',
  imports: [ModModal, ModModalActions, ModModalClose, ModButton, ...DEMO_KIT],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  styles: `
    .demo-modal-flat .modal {
      box-shadow: none;
      border: 1px solid var(--color-border-secondary);
    }
    .demo-modal-stack {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--spacing-4xl);
      width: 100%;
    }
  `,
  template: `
    <div class="content-header">
      <h1 class="content-title">Modal</h1>
      <p class="content-description">
        A focused dialog for messages, confirmations, and short tasks that need the user's attention. Composed of a
        header (featured icon + close), a body (title + description + optional swap content), and an actions row.
        Supports desktop (600px) and mobile (320px) widths, leading/center title alignment, inline or stacked actions,
        and full RTL. Modeled on Figma frames 30150:55001 (Modal), 30150:55018 (Header), 30150:55083 (Body),
        30150:55043 (Actions), 30150:55096 (Swap placeholder).
      </p>
    </div>

    <demo-live
      heading="Modal"
      description="The dialog is shown inline here for preview. Use the controls to reshape the header, body, and actions."
      [rtl]="rtl()"
    >
      <mod-modal
        inline
        [heading]="t().title"
        [description]="t().description"
        [size]="mobile() ? 'mobile' : 'default'"
        [align]="align()"
        [icon]="showIcon() ? 'information-circle' : ''"
        [iconColor]="iconColor()"
        [iconVariant]="iconVariant()"
        [closable]="showClose()"
        [closeLabel]="rtl() ? 'إغلاق' : 'Close'"
      >
        @if (custom()) {
          <div class="modal-custom">
            <h4 class="modal-custom__title">{{ t().customTitle }}</h4>
            <p class="modal-custom__body">{{ t().customBody }}</p>
          </div>
        }
        @if (buttons().length) {
          <mod-modal-actions [stack]="stacked()">
            @for (primary of buttons(); track $index) {
              <button mod-button [variant]="primary ? 'primary' : 'secondary-outline'">
                <span class="icon"
                  ><svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 16 16"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <path d="M3 8h10M9 4l4 4-4 4" /></svg></span
                >{{ t().action }}
              </button>
            }
          </mod-modal-actions>
        }
      </mod-modal>

      <demo-switch label="RTL" [(checked)]="rtl" />
      <demo-switch label="Mobile" [(checked)]="mobile" />
      <demo-select label="Title align" [options]="aligns" [(value)]="align" />
      <demo-select label="Actions" [options]="actionCounts" [(value)]="actionCount" />
      <demo-switch label="Featured icon" [(checked)]="showIcon" />
      <demo-select label="Icon color" [options]="iconColors" [(value)]="iconColor" />
      <demo-select label="Icon style" [options]="iconVariants" [(value)]="iconVariant" />
      <demo-switch label="Close button" [(checked)]="showClose" />
      <demo-switch label="Stacked actions" [(checked)]="stack" />
      <demo-switch label="Swap content" [(checked)]="custom" />
    </demo-live>

    <demo-props
      description="Inputs, models and outputs of mod-modal, plus the mod-modal-actions row and the modModalClose directive."
      [props]="props"
    />

    <demo-showcase
      heading="Anatomy"
      description="A complete modal: header (featured icon + close), body (title + description), and an actions row with a secondary and a primary button."
    >
      <mod-modal
        inline
        heading="Title goes here"
        description="When a Modal needs a further detailed explanation, it goes here."
        icon="information-circle"
      >
        <mod-modal-actions>
          <button mod-button variant="secondary-outline">
            <span class="icon"
              ><svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M3 8h10M9 4l4 4-4 4" /></svg></span
            >Button
          </button>
          <button mod-button>
            <span class="icon"
              ><svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M3 8h10M9 4l4 4-4 4" /></svg></span
            >Button
          </button>
        </mod-modal-actions>
      </mod-modal>
    </demo-showcase>

    <demo-showcase
      heading="Action Layouts"
      description="Actions sit inline and trailing-aligned on desktop (1, 2, or 3 buttons) and stack full-width on mobile. The last button is the primary action."
    >
      <div class="demo-modal-stack demo-modal-flat">
        <span class="showcase-label">One action</span>
        <mod-modal inline [closable]="false" heading="Single primary action" description="A confirmation with one call to action.">
          <mod-modal-actions>
            <button mod-button>Confirm</button>
          </mod-modal-actions>
        </mod-modal>

        <span class="showcase-label">Two actions (inline)</span>
        <mod-modal inline [closable]="false" heading="Secondary + primary" description="The most common pairing — cancel and confirm.">
          <mod-modal-actions>
            <button mod-button variant="secondary-outline">Cancel</button>
            <button mod-button>Confirm</button>
          </mod-modal-actions>
        </mod-modal>

        <span class="showcase-label">Three actions, stacked (mobile)</span>
        <mod-modal
          inline
          size="mobile"
          [closable]="false"
          heading="Stacked actions"
          description="On mobile, actions stack full-width with the primary on top."
        >
          <mod-modal-actions stack>
            <button mod-button>Primary</button>
            <button mod-button variant="secondary-outline">Secondary</button>
            <button mod-button variant="secondary-outline">Tertiary</button>
          </mod-modal-actions>
        </mod-modal>
      </div>
    </demo-showcase>

    <demo-showcase
      heading="Swap Content Body"
      description="The body can host any custom component via the .modal-custom swap slot (Figma 30150:55096) — a form, a table, an illustration, etc."
    >
      <mod-modal
        inline
        heading="Title goes here"
        description="When a Modal needs a further detailed explanation, it goes here."
        icon="information-circle"
      >
        <div class="modal-custom">
          <h4 class="modal-custom__title">Swap with content component</h4>
          <p class="modal-custom__body">Replace this slot with any component</p>
        </div>
        <mod-modal-actions>
          <button mod-button variant="secondary-outline">Cancel</button>
          <button mod-button>Confirm</button>
        </mod-modal-actions>
      </mod-modal>
    </demo-showcase>

    <demo-showcase
      heading="Open as Overlay"
      description="The real behavior: a trigger opens the modal over a dimmed backdrop. Click the backdrop, the close button, or press Esc to dismiss."
    >
      <button mod-button (click)="overlay.set(true)">Open modal</button>

      <mod-modal
        [(open)]="overlay"
        heading="Confirm your action"
        description="This modal is rendered over a real backdrop. Click outside, press Esc, or use a button to close it."
        icon="information-circle"
      >
        <mod-modal-actions>
          <button mod-button variant="secondary-outline" modModalClose>Cancel</button>
          <button mod-button modModalClose>Confirm</button>
        </mod-modal-actions>
      </mod-modal>
    </demo-showcase>

    <demo-showcase
      heading="RTL Support"
      description="Arabic and other right-to-left layouts mirror the modal: the featured icon moves to the trailing (right) edge, the close button to the left, and the title + actions align from the right."
      subtle
    >
      <div dir="rtl" lang="ar" style="display: contents">
        <mod-modal
          inline
          heading="عنوان الرسالة يُكتب هنا"
          description="يُكتب المحتوى الإضافي هنا في حال أن رسالة الإشعار أو التنبيه تحتاج إلى شرح أو تفصيل."
          icon="information-circle"
          closeLabel="إغلاق"
        >
          <mod-modal-actions>
            <button mod-button variant="secondary-outline">إجراء</button>
            <button mod-button>إجراء</button>
          </mod-modal-actions>
        </mod-modal>
      </div>
    </demo-showcase>
  `,
})
export class ModalPage {
  protected readonly aligns: DemoOption<ModModalAlign>[] = [
    { value: 'start', label: 'Leading' },
    { value: 'center', label: 'Center' },
  ];
  protected readonly actionCounts: DemoOption<number>[] = [
    { value: 1, label: '1 button' },
    { value: 2, label: '2 buttons' },
    { value: 3, label: '3 buttons' },
    { value: 0, label: 'None' },
  ];
  protected readonly iconColors: DemoOption<ModModalIconColor>[] = [
    { value: 'neutral', label: 'Neutral' },
    { value: 'brand', label: 'Brand' },
    { value: 'gray', label: 'Gray' },
    { value: 'success', label: 'Success' },
    { value: 'error', label: 'Error' },
    { value: 'warning', label: 'Warning' },
    { value: 'info', label: 'Info' },
  ];
  protected readonly iconVariants: DemoOption<ModModalIconVariant>[] = [
    { value: 'light', label: 'Light' },
    { value: 'dark', label: 'Dark' },
    { value: 'outlined', label: 'Outlined' },
  ];

  protected readonly rtl = signal(false);
  protected readonly mobile = signal(false);
  protected readonly align = signal<ModModalAlign>('start');
  protected readonly actionCount = signal(2);
  protected readonly showIcon = signal(true);
  protected readonly iconColor = signal<ModModalIconColor>('neutral');
  protected readonly iconVariant = signal<ModModalIconVariant>('light');
  protected readonly showClose = signal(true);
  protected readonly stack = signal(false);
  protected readonly custom = signal(false);
  protected readonly overlay = signal(false);

  // Mobile always stacks the actions, as in the original demo.
  protected readonly stacked = computed(() => this.mobile() || this.stack());

  /** One entry per button; `true` marks the primary. Inline: primary last. Stacked: primary first. */
  protected readonly buttons = computed(() => {
    const n = this.actionCount();
    const list = Array.from({ length: n }, (_, i) => i === n - 1);
    return this.stacked() ? list.reverse() : list;
  });

  protected readonly t = computed(() =>
    this.rtl()
      ? {
          title: 'عنوان الرسالة يُكتب هنا',
          description: 'يُكتب المحتوى الإضافي هنا في حال أن رسالة الإشعار أو التنبيه تحتاج إلى شرح أو تفصيل.',
          action: 'إجراء',
          customTitle: 'استبدل هذا العنصر بأي عنصر آخر',
          customBody: 'يمكن استبدال هذه المنطقة بأي مكون',
        }
      : {
          title: 'Title goes here',
          description: 'When a Modal needs a further detailed explanation, it goes here.',
          action: 'Button',
          customTitle: 'Swap with content component',
          customBody: 'Replace this slot with any component',
        },
  );

  protected readonly props: DemoProp[] = [
    { name: 'open', type: 'model<boolean>', default: 'false', description: 'Whether the modal is open. Two-way bindable with [(open)].' },
    { name: 'inline', type: 'boolean', default: 'false', description: 'Renders the dialog in the page flow without backdrop, focus trap or scroll lock (previews).' },
    { name: 'heading', type: 'string', default: "''", description: 'Title text; also labels the dialog.' },
    { name: 'description', type: 'string', default: "''", description: 'Description paragraph at the top of the body.' },
    { name: 'size', type: "'default' | 'mobile'", default: "'default'", description: 'default is 600px wide; mobile narrows the dialog to 320px.' },
    { name: 'align', type: "'start' | 'center'", default: "'start'", description: 'center centers the featured icon and title.' },
    { name: 'position', type: "'start' | 'center' | 'end'", default: "'center'", description: 'Vertical position of the dialog in the viewport.' },
    { name: 'icon', type: 'string', default: "''", description: 'Featured icon name without the dga-icon- prefix. Empty hides it.' },
    { name: 'iconColor', type: "'neutral' | 'brand' | 'gray' | 'success' | 'error' | 'warning' | 'info'", default: "'neutral'", description: 'Color of the featured icon.' },
    { name: 'iconVariant', type: "'light' | 'dark' | 'outlined'", default: "'light'", description: 'Featured icon style. Applies only when iconColor is not neutral.' },
    { name: 'closable', type: 'boolean', default: 'true', description: 'Shows the close (X) button.' },
    { name: 'closeOnEscape', type: 'boolean', default: 'true', description: 'Esc closes the topmost open modal.' },
    { name: 'closeOnBackdrop', type: 'boolean', default: 'true', description: 'Clicking the backdrop closes the modal.' },
    { name: 'closeLabel', type: 'string', default: "'Close'", description: 'Accessible label of the close button.' },
    { name: 'ariaLabel', type: 'string', default: "''", description: 'Accessible name when there is no heading.' },
    { name: 'ariaLabelledby', type: 'string', default: "''", description: 'Id of an external element that labels the dialog (overrides heading).' },
    { name: '(opened)', type: 'void', description: 'Emits after the modal opens.' },
    { name: '(closed)', type: "'escape' | 'backdrop' | 'close-button' | 'action' | 'api'", description: 'Emits after the modal closes, with what caused it.' },
    { name: 'mod-modal-actions [stack]', type: 'boolean', default: 'false', description: 'Stacks the buttons vertically, full-width (put the primary first).' },
    { name: 'mod-modal-actions [fill]', type: 'boolean', default: 'false', description: 'Each button stretches to fill the row equally.' },
    { name: 'mod-modal-actions [center]', type: 'boolean', default: 'false', description: 'Groups the buttons in the center.' },
    { name: 'mod-modal-actions [keepInline]', type: 'boolean', default: 'false', description: 'Keeps the inline layout below 480px instead of stacking.' },
    { name: 'modModalClose', type: 'directive', description: 'On any element inside the modal — closes it on click.' },
  ];
}
