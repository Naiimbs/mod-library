import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import {
  ModButton,
  ModSlideoutFooter,
  ModSlideoutMenu,
  ModSlideoutMenuGroup,
  ModSlideoutMenuItem,
} from '@mod-internal/ui';
import { DEMO_KIT, DemoOption, DemoProp } from '../../shared/demo-kit';

type BodyKind = 'menu' | 'custom';

const LABELS = {
  en: {
    title: 'Title',
    desc: 'Description goes here.',
    group: 'Group label',
    item: 'Item Label',
    cancel: 'Action',
    confirm: 'Action',
    customTitle: 'Swap with content component',
    customBody: 'Replace this slot with any component',
    close: 'Close',
  },
  ar: {
    title: 'عنوان',
    desc: 'هنا يوضع الوصف.',
    group: 'عنوان المجموعة',
    item: 'نص العنصر',
    cancel: 'إجراء',
    confirm: 'إجراء',
    customTitle: 'استبدل هذا العنصر بأي عنصر آخر',
    customBody: 'يمكن استبدال هذه المنطقة بأي مكون',
    close: 'إغلاق',
  },
};

function fileItems(prefix: string, label: string, count: number, selected: string | null = null): ModSlideoutMenuItem[] {
  return Array.from({ length: count }, (_, i) => {
    const id = `${prefix}-${i}`;
    return { id, label, icon: 'file-01', selected: id === selected };
  });
}

@Component({
  selector: 'demo-slideout-menu-page',
  imports: [ModSlideoutMenu, ModSlideoutFooter, ModButton, ...DEMO_KIT],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './slideout-menu.page.html',
})
export class SlideoutMenuPage {
  protected readonly bodies: DemoOption<BodyKind>[] = [
    { value: 'menu', label: 'Menu list' },
    { value: 'custom', label: 'Custom content' },
  ];

  protected readonly rtl = signal(false);
  protected readonly body = signal<BodyKind>('menu');
  protected readonly gray = signal(false);
  protected readonly right = signal(false);

  protected readonly t = computed(() => (this.rtl() ? LABELS.ar : LABELS.en));

  protected readonly liveGroups = computed<ModSlideoutMenuGroup[]>(() =>
    this.body() === 'menu' ? [{ label: this.t().group, items: fileItems('live', this.t().item, 3) }] : [],
  );

  // Anatomy: the second group is a single-select group (data-menu-select in the original).
  protected readonly anatomySelected = signal('anatomy-b-0');
  protected readonly anatomyGroups = computed<ModSlideoutMenuGroup[]>(() => [
    { label: 'Group label', items: fileItems('anatomy-a', 'Item Label', 3) },
    { label: 'Group label', items: fileItems('anatomy-b', 'Item Label', 2, this.anatomySelected()) },
  ]);

  protected onAnatomySelect(item: ModSlideoutMenuItem): void {
    if (item.id?.startsWith('anatomy-b')) this.anatomySelected.set(item.id);
  }

  protected readonly rtlSelected = signal('rtl-0');
  protected readonly rtlGroups = computed<ModSlideoutMenuGroup[]>(() => [
    { label: 'عنوان المجموعة', items: fileItems('rtl', 'نص العنصر', 3, this.rtlSelected()) },
  ]);

  protected onRtlSelect(item: ModSlideoutMenuItem): void {
    if (item.id) this.rtlSelected.set(item.id);
  }

  protected readonly leftOpen = signal(false);
  protected readonly rightOpen = signal(false);

  protected readonly navGroups: ModSlideoutMenuGroup[] = [
    {
      label: 'Main',
      items: [
        { id: 'home', label: 'Home', icon: 'home-01' },
        { id: 'services', label: 'Services', icon: 'folder-01' },
        { id: 'settings', label: 'Settings', icon: 'settings-01' },
      ],
    },
  ];

  protected readonly props: DemoProp[] = [
    { name: '[(open)]', type: 'boolean', default: 'false', description: 'Open state of the overlay panel. Ignored when inline. Escape, the close button and a backdrop click set it to false.' },
    { name: 'side', type: "'left' | 'right'", default: "'left'", description: 'Edge the panel is anchored to (mirrored automatically under dir="rtl").' },
    { name: 'gray', type: 'boolean', default: 'false', description: 'Use the gray background (#F8FAFB) instead of white.' },
    { name: 'inline', type: 'boolean', default: 'false', description: 'Render the panel in normal flow (no backdrop, no fixed positioning).' },
    { name: 'heading', type: 'string', default: "''", description: 'Header title.' },
    { name: 'description', type: 'string', default: "''", description: 'Header description under the title.' },
    { name: 'icon', type: 'string', default: "''", description: 'Featured icon name without the dga-icon- prefix.' },
    { name: 'showClose', type: 'boolean', default: 'true', description: 'Show the close button in the header.' },
    { name: 'closeLabel', type: 'string', default: "'Close'", description: 'Accessible name of the close button.' },
    { name: 'ariaLabel', type: 'string', default: "''", description: 'Accessible name of the panel when there is no heading.' },
    { name: 'closeOnBackdrop', type: 'boolean', default: 'true', description: 'Close when the backdrop is clicked.' },
    { name: 'closeOnEscape', type: 'boolean', default: 'true', description: 'Close when Escape is pressed.' },
    { name: 'groups', type: 'ModSlideoutMenuGroup[]', default: '[]', description: 'Optional menu rendered at the top of the body: { label?, items: { id?, label, icon?, selected?, disabled? }[] }.' },
    { name: '(itemSelect)', type: 'ModSlideoutMenuItem', description: 'A row from groups was activated.' },
    { name: 'default content', type: 'content slot', description: 'Scrollable body content (after the optional menu).' },
    { name: '[modSlideoutFooter]', type: 'content slot', description: 'Action buttons row (equal-width).' },
  ];
}
