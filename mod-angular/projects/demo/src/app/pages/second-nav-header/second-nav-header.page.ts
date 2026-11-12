import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import {
  ModSecondNavHeader,
  ModSecondNavHeaderAction,
  ModSecondNavHeaderItem,
  ModSecondNavHeaderVariant,
} from '@mod-internal/ui';
import { DEMO_KIT, DemoOption, DemoProp } from '../../shared/demo-kit';

type ItemKey = 'weather' | 'date' | 'time' | 'location';

const LABELS: Record<'en' | 'ar', Record<ItemKey, string>> = {
  en: { weather: 'Cloudy', date: '3-Sep-2024', time: '2:30 PM', location: 'Al-Riyadh' },
  ar: { weather: 'غائم', date: '3-سبتمبر-2024', time: '2:30 مساءً', location: 'الرياض' },
};

const CONTENT: { icon: string; key: ItemKey }[] = [
  { icon: 'cloud', key: 'weather' },
  { icon: 'calendar-04', key: 'date' },
  { icon: 'time-04', key: 'time' },
  { icon: 'location-01', key: 'location' },
];

const ACTIONS: ModSecondNavHeaderAction[] = [
  { id: 'mic', label: 'Microphone', icon: 'mic-01' },
  { id: 'zoom-out', label: 'Zoom out', icon: 'zoom-out-area' },
  { id: 'zoom-in', label: 'Zoom in', icon: 'zoom-in-area' },
  { id: 'view', label: 'View', icon: 'view' },
];

function itemsFor(lang: 'en' | 'ar'): ModSecondNavHeaderItem[] {
  return CONTENT.map((c) => ({ id: c.key, icon: c.icon, label: LABELS[lang][c.key] }));
}

@Component({
  selector: 'demo-second-nav-header-page',
  imports: [ModSecondNavHeader, ...DEMO_KIT],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="content-header">
      <h1 class="content-title">Second Nav Header</h1>
      <p class="content-description">
        The Second Nav Header is a secondary navigation bar that appears above the primary navigation, offering
        additional controls or context-based information such as weather, date, time, and location, along with
        action buttons for quick access to features like zoom and microphone.
      </p>
    </div>

    <demo-live
      heading="Second Nav Header"
      description="Configure the secondary navigation header appearance."
      align="stretch"
      [rtl]="rtl()"
    >
      <div style="width: 100%;">
        <mod-second-nav-header
          [variant]="variant()"
          [items]="liveItems()"
          [actions]="liveActions()"
          [divider]="divider()"
        />
      </div>

      <demo-switch label="RTL" [(checked)]="rtl" />
      <demo-select label="Style" [options]="variants" [(value)]="variant" />
      <demo-switch label="Divider" [(checked)]="divider" />
      <demo-switch label="Content" [(checked)]="content" />
      <demo-switch label="Item 2 (Date)" [(checked)]="item2" />
      <demo-switch label="Item 3 (Time)" [(checked)]="item3" />
      <demo-switch label="Item 4 (Location)" [(checked)]="item4" />
      <demo-switch label="Actions" [(checked)]="actions" />
      <demo-switch label="Action 2 (Zoom In)" [(checked)]="action2" />
      <demo-switch label="Action 3 (Zoom Out)" [(checked)]="action3" />
      <demo-switch label="Action 4 (Mic)" [(checked)]="action4" />
    </demo-live>

    <demo-props heading="Props" [props]="props" />

    <demo-showcase heading="Gray Style" align="stretch">
      <div style="width: 100%;">
        <mod-second-nav-header variant="gray" [items]="en" [actions]="allActions" />
      </div>
    </demo-showcase>

    <demo-showcase heading="Primary Style" align="stretch">
      <div style="width: 100%;">
        <mod-second-nav-header variant="primary" [items]="en" [actions]="allActions" />
      </div>
    </demo-showcase>

    <demo-showcase heading="RTL Layout" align="stretch">
      <div style="width: 100%; display: flex; flex-direction: column; gap: var(--spacing-xl);" dir="rtl" lang="ar">
        <mod-second-nav-header variant="gray" [items]="ar" [actions]="allActions" />
        <mod-second-nav-header variant="primary" [items]="ar" [actions]="allActions" />
      </div>
    </demo-showcase>

    <demo-showcase heading="Without Actions" description="showActions: false" align="stretch">
      <div style="width: 100%;">
        <mod-second-nav-header variant="gray" [items]="en" />
      </div>
    </demo-showcase>

    <demo-showcase
      heading="Without Content"
      description="showContent: false, showItem2: false, showItem3: false, showItem4: false"
      align="stretch"
    >
      <div style="width: 100%;">
        <mod-second-nav-header variant="gray" [actions]="allActions" />
      </div>
    </demo-showcase>

    <demo-showcase
      heading="Partial Content Items"
      description="showItem3: false, showItem4: false — Only weather and date visible"
      align="stretch"
    >
      <div style="width: 100%;">
        <mod-second-nav-header variant="gray" [items]="partialItems" [actions]="allActions" />
      </div>
    </demo-showcase>

    <demo-showcase
      heading="Partial Action Buttons"
      description="showAction3: false, showAction4: false — Only zoom-in and view visible"
      align="stretch"
    >
      <div style="width: 100%;">
        <mod-second-nav-header variant="gray" [items]="en" [actions]="partialActions" />
      </div>
    </demo-showcase>

    <demo-showcase heading="Without Divider" description="showDivider: false" align="stretch">
      <div style="width: 100%; display: flex; flex-direction: column; gap: var(--spacing-xl);">
        <mod-second-nav-header variant="gray" [divider]="false" [items]="en" [actions]="allActions" />
        <mod-second-nav-header variant="primary" [divider]="false" [items]="en" [actions]="allActions" />
      </div>
    </demo-showcase>
  `,
})
export class SecondNavHeaderPage {
  protected readonly variants: DemoOption<ModSecondNavHeaderVariant>[] = [
    { value: 'primary', label: 'Primary' },
    { value: 'gray', label: 'Gray' },
  ];

  protected readonly rtl = signal(false);
  protected readonly variant = signal<ModSecondNavHeaderVariant>('primary');
  protected readonly divider = signal(true);
  protected readonly content = signal(true);
  protected readonly item2 = signal(true);
  protected readonly item3 = signal(true);
  protected readonly item4 = signal(true);
  protected readonly actions = signal(true);
  protected readonly action2 = signal(true);
  protected readonly action3 = signal(true);
  protected readonly action4 = signal(true);

  // Item visibility: 0 = Content, 1 = Item 2, 2 = Item 3, 3 = Item 4 (as in the original demo).
  protected readonly liveItems = computed(() => {
    const visible = [this.content(), this.item2(), this.item3(), this.item4()];
    return itemsFor(this.rtl() ? 'ar' : 'en').filter((_, i) => visible[i]);
  });

  // Action visibility: mic = Action 4, zoom-out = Action 3, zoom-in = Action 2, view = Actions.
  protected readonly liveActions = computed(() => {
    if (!this.actions()) return [];
    const visible = [this.action4(), this.action3(), this.action2(), true];
    return ACTIONS.filter((_, i) => visible[i]);
  });

  protected readonly en = itemsFor('en');
  protected readonly ar = itemsFor('ar');
  protected readonly allActions = ACTIONS;
  protected readonly partialItems = this.en.slice(0, 2);
  protected readonly partialActions = ACTIONS.slice(2);

  protected readonly props: DemoProp[] = [
    { name: 'variant', type: "'gray' | 'primary'", default: "'gray'", description: 'Background style of the bar. Primary switches the action buttons to their on-color style.' },
    { name: 'items', type: 'ModSecondNavHeaderItem[]', default: '[]', description: 'Contextual info items on the leading side: { id?, label, icon? }.' },
    { name: 'actions', type: 'ModSecondNavHeaderAction[]', default: '[]', description: 'Icon-only action buttons on the trailing side: { id?, label, icon, disabled?, selected? }. label is the accessible name.' },
    { name: 'divider', type: 'boolean', default: 'true', description: '1px line along the bottom edge.' },
    { name: '(actionSelect)', type: 'ModSecondNavHeaderAction', description: 'An action button was clicked.' },
    { name: 'default content', type: 'content slot', description: 'Extra content after the info items.' },
    { name: '[modSecondNavHeaderAction]', type: 'content slot', description: 'Extra content after the action buttons.' },
  ];
}
