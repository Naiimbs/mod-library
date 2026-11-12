import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { ModSearchBox, ModSearchBoxFeedback } from '@mod-internal/ui';
import { DEMO_KIT, DemoOption, DemoProp } from '../../shared/demo-kit';

type State = 'default' | 'error' | 'success' | 'readonly' | 'disabled';

@Component({
  selector: 'demo-search-box-page',
  imports: [ModSearchBox, ...DEMO_KIT],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="content-header">
      <h1 class="content-title">Search Box</h1>
      <p class="content-description">
        A dedicated search field with a leading search icon, a clear action that appears while typing, the
        library's bottom press line on focus, and error, read-only, and disabled states. Ported from the DGA
        library's <code>mod-search-box</code> component.
      </p>
    </div>

    <demo-live
      heading="Search Box"
      description="Focus the field to see the press line grow; type to reveal the clear action."
      [rtl]="rtl()"
    >
      <mod-search-box
        style="max-width: 360px"
        [placeholder]="t().placeholder"
        [ariaLabel]="t().label"
        [(value)]="value"
        [feedback]="feedback()"
        [readonly]="state() === 'readonly'"
        [disabled]="state() === 'disabled'"
        [clearable]="clear()"
      />

      <demo-switch label="RTL" [(checked)]="rtl" />
      <demo-select label="State" [options]="states" [value]="state()" (valueChange)="setState($event)" />
      <demo-switch label="Clear button" [(checked)]="clear" />
    </demo-live>

    <demo-props
      description="Inputs, outputs and models of the mod-search-box component."
      [props]="props"
    />

    <demo-showcase
      heading="Default"
      description="Type in the field: the clear action appears with its divider, and clearing refocuses the input."
      align="flex-start"
    >
      <mod-search-box style="max-width: 360px" placeholder="Search services..." searchButton />
    </demo-showcase>

    <demo-showcase
      heading="Validation & States"
      description="Error recolors the border and press line; success shows the tinted check; read-only and disabled mute the field."
      align="flex-start"
    >
      <div class="showcase-row" style="justify-content: flex-start; align-items: flex-start; width: 100%;">
        <mod-search-box style="max-width: 260px" placeholder="Error" ariaLabel="Search with error" feedback="error" />
        <mod-search-box style="max-width: 260px" value="National services" ariaLabel="Search success" feedback="success" />
        <mod-search-box style="max-width: 260px" value="Read-only query" ariaLabel="Read-only" readonly />
        <mod-search-box style="max-width: 260px" placeholder="Disabled" ariaLabel="Disabled" disabled />
      </div>
    </demo-showcase>

    <demo-showcase
      heading="RTL Layout"
      description="The icon leads from the right and the actions trail on the left."
      align="flex-start"
    >
      <div dir="rtl" style="width: 100%">
        <mod-search-box style="max-width: 360px" placeholder="ابحث في الخدمات..." ariaLabel="بحث" clearLabel="مسح" />
      </div>
    </demo-showcase>
  `,
})
export class SearchBoxPage {
  protected readonly states: DemoOption<State>[] = [
    { value: 'default', label: 'Default' },
    { value: 'error', label: 'Error' },
    { value: 'success', label: 'Success' },
    { value: 'readonly', label: 'Read-only' },
    { value: 'disabled', label: 'Disabled' },
  ];

  protected readonly rtl = signal(false);
  protected readonly state = signal<State>('default');
  protected readonly clear = signal(true);
  protected readonly value = signal('');

  protected readonly t = computed(() =>
    this.rtl()
      ? { placeholder: 'ابحث في الخدمات...', label: 'بحث' }
      : { placeholder: 'Search services...', label: 'Search' },
  );

  protected readonly feedback = computed<ModSearchBoxFeedback | null>(() => {
    const state = this.state();
    return state === 'error' || state === 'success' ? state : null;
  });

  /** Read-only shows a sample query, as in the original demo; other states start empty. */
  protected setState(state: State): void {
    this.state.set(state);
    this.value.set(state === 'readonly' ? 'Read-only query' : '');
  }

  protected readonly props: DemoProp[] = [
    { name: 'value', type: 'string (model)', default: "''", description: 'Current query. Two-way bindable with [(value)]; also works with Angular forms.' },
    { name: 'placeholder', type: 'string', default: "'Search'", description: 'Placeholder text of the borderless input.' },
    { name: 'ariaLabel', type: 'string', default: "'Search'", description: 'Accessible name of the field.' },
    { name: 'clearable', type: 'boolean', default: 'true', description: 'Shows the clear action while the field has text; clearing refocuses the input.' },
    { name: 'clearLabel', type: 'string', default: "'Clear search'", description: 'Accessible name of the clear button.' },
    { name: 'searchButton', type: 'boolean', default: 'false', description: 'Shows a trailing search button, separated by a 1px divider, while the field has text.' },
    { name: 'searchLabel', type: 'string', default: "'Search'", description: 'Accessible name of the trailing search button.' },
    { name: 'feedback', type: "'error' | 'success' | 'warning' | null", default: 'null', description: 'Status icon with a soft tinted halo before the actions. Error also recolors the border and press line.' },
    { name: 'readonly', type: 'boolean', default: 'false', description: 'Muted field without the press line.' },
    { name: 'disabled', type: 'boolean', default: 'false', description: 'Muted field without the press line; also mutes the icons.' },
    { name: 'name', type: 'string', default: "''", description: 'Native name attribute.' },
    { name: '(search)', type: 'string', description: 'Emits the query on Enter or when the search button is pressed.' },
    { name: '(cleared)', type: 'void', description: 'Emits after the field was cleared through the clear button or Escape.' },
  ];
}
