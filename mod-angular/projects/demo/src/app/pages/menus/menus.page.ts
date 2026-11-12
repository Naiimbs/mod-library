import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import {
  ModButton,
  ModMenu,
  ModMenuAnchor,
  ModMenuGroup,
  ModMenuItem,
  ModMenuSwitch,
  ModMenuTrail,
  ModMenuTrailIcon,
  ModMenuTrigger,
  ModTag,
} from '@mod-internal/ui';
import { DEMO_KIT, DemoOption, DemoProp } from '../../shared/demo-kit';

type Trail = 'none' | 'text' | 'check' | 'icon' | 'tag' | 'switch';
type State = 'default' | 'selected' | 'disabled';

@Component({
  selector: 'demo-menus-page',
  imports: [
    ModButton,
    ModMenu,
    ModMenuAnchor,
    ModMenuGroup,
    ModMenuItem,
    ModMenuSwitch,
    ModMenuTrail,
    ModMenuTrailIcon,
    ModMenuTrigger,
    ModTag,
    ...DEMO_KIT,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './menus.page.html',
})
export class MenusPage {
  protected readonly trails: DemoOption<Trail>[] = [
    { value: 'none', label: 'None' },
    { value: 'text', label: 'Text (+99)' },
    { value: 'check', label: 'Check icon' },
    { value: 'icon', label: 'Arrow icon' },
    { value: 'tag', label: 'Tag' },
    { value: 'switch', label: 'Switch' },
  ];
  protected readonly states: DemoOption<State>[] = [
    { value: 'default', label: 'Default' },
    { value: 'selected', label: 'Selected (1st)' },
    { value: 'disabled', label: 'Disabled (3rd)' },
  ];

  protected readonly rtl = signal(false);
  protected readonly trail = signal<Trail>('none');
  protected readonly state = signal<State>('default');
  /** Selected item of the live demo group (single-select, like data-menu-select). */
  protected readonly liveValue = signal<unknown>(undefined);
  protected readonly liveItems = [0, 1, 2];

  protected readonly labels = computed(() =>
    this.rtl()
      ? { group: 'عنوان مجموعة', item: 'نص العنصر', tag: 'وسم' }
      : { group: 'Group label', item: 'Item Label', tag: 'Label' },
  );

  // Changing a control re-renders the original preview, resetting the selection.
  protected setState(state: State): void {
    this.state.set(state);
    this.liveValue.set(state === 'selected' ? 0 : undefined);
  }

  protected setTrail(trail: Trail): void {
    this.trail.set(trail);
    this.liveValue.set(this.state() === 'selected' ? 0 : undefined);
  }

  // Showcase state
  protected readonly trailSwitch = signal(true);
  protected readonly groupedValue = signal<unknown>('a');
  protected readonly notifications = signal(true);
  protected readonly darkMode = signal(false);
  protected readonly open = signal(false);
  protected readonly rtlValue = signal<unknown>('a');
  protected readonly rtlSwitch = signal(true);

  protected readonly menuProps: DemoProp[] = [
    { name: 'mod-menu · id', type: 'string', default: 'auto', description: 'Id of the menu element (used for the trigger aria-controls).' },
    { name: 'mod-menu · aria-label', type: 'string', default: "''", description: 'Accessible name of the menu.' },
    { name: 'mod-menu · rtl', type: 'boolean', default: 'false', description: 'Forces the RTL layout (menu--rtl) regardless of the page direction.' },
    { name: 'mod-menu · closeOnSelect', type: 'boolean', default: 'true', description: 'When anchored: close the menu after an item is activated.' },
    { name: 'mod-menu-anchor · open', type: 'model<boolean>', default: 'false', description: 'Whether the anchored dropdown menu is open. Outside click and Esc close it.' },
    { name: 'modMenuTrigger', type: 'directive', description: 'On a button inside mod-menu-anchor: click toggles the menu, ArrowDown opens it; keeps aria-expanded in sync.' },
    { name: 'mod-menu-group · label', type: 'string', default: "''", description: 'Uppercase group heading. Adjacent groups are separated by a divider.' },
    { name: 'mod-menu-group · selectable', type: 'boolean', default: 'false', description: 'Single-select behavior: activating an item sets value to the item value.' },
    { name: 'mod-menu-group · value', type: 'model<unknown>', default: 'undefined', description: 'Value of the selected item when selectable.' },
    { name: 'mod-menu-divider', type: 'component', description: 'Standalone 1px divider between items.' },
    { name: 'mod-menu-item · icon', type: 'string', default: "''", description: 'Leading 16px font icon name, without the dga-icon- prefix.' },
    { name: 'mod-menu-item · trailText', type: 'string', default: "''", description: 'Trailing small count / label text.' },
    { name: 'mod-menu-item · trailIcon', type: 'string', default: "''", description: 'Trailing font icon name. Replaces the selected checkmark.' },
    { name: 'mod-menu-item · selected', type: 'boolean', default: 'false', description: 'Selected state: primary-50 green tint with primary text / icon.' },
    { name: 'mod-menu-item · disabled', type: 'boolean', default: 'false', description: 'Disabled state; the item is skipped by keyboard navigation.' },
    { name: 'mod-menu-item · checkmark', type: 'boolean', default: 'true', description: 'Show a trailing check icon while selected.' },
    { name: 'mod-menu-item · value', type: 'unknown', default: 'undefined', description: 'Value used by a selectable mod-menu-group.' },
    { name: 'mod-menu-item · (activated)', type: 'output<void>', description: 'Emitted on click / Enter / Space when the item is enabled.' },
    { name: 'modMenuTrail', type: 'directive', description: 'Marks projected content (e.g. a tag) as the trailing element of an item.' },
    { name: 'modMenuTrailIcon', type: 'directive', description: 'Marks a projected inline SVG wrapper as the 20px trailing icon of an item.' },
    { name: 'mod-menu-switch · checked', type: 'model<boolean>', default: 'false', description: 'Trailing toggle state (is-on).' },
    { name: 'mod-menu-switch · disabled', type: 'boolean', default: 'false', description: 'Disables the trailing toggle.' },
    { name: 'mod-menu-switch · aria-label', type: 'string', default: "''", description: 'Accessible name of the toggle.' },
  ];
}
