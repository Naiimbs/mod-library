import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { ModTab, ModTabs, ModTabsSize } from '@mod-internal/ui';
import { DEMO_KIT, DemoOption, DemoProp } from '../../shared/demo-kit';

const LABELS = {
  en: ['First Tab', 'Second Tab', 'Third Tab', 'Fourth Tab', 'Fifth Tab'],
  ar: ['تبويب أول', 'تبويب ثاني', 'تبويب ثالث', 'تبويب رابع', 'تبويب خامس'],
};

@Component({
  selector: 'demo-tabs-page',
  imports: [ModTabs, ModTab, ...DEMO_KIT],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="content-header">
      <h1 class="content-title">Tabs</h1>
      <p class="content-description">
        A tablist is a group of headers that lets people navigate between different views of related information
        without going to different pages. Available in 3 sizes with icon, divider, flush, and RTL support.
      </p>
    </div>

    <demo-live
      heading="Tabs"
      description="Tabs organize content into separate views where only one view is visible at a time. Selecting a tab reveals its associated content."
      [rtl]="rtl()"
      align="stretch"
      justify="flex-start"
    >
      <mod-tabs [(selectedIndex)]="active" [size]="size()" [divider]="divider()" aria-label="Tabs">
        @for (label of liveTabs(); track $index; let last = $last) {
          <mod-tab [label]="label" [icon]="icons() ? 'home-01' : ''" [disabled]="disabledTab() && last" />
        }
      </mod-tabs>

      <demo-switch label="RTL" [(checked)]="rtl" />
      <demo-select label="Size" [options]="sizes" [(value)]="size" />
      <demo-select label="Tab Count" [options]="counts" [value]="count()" (valueChange)="setCount($event)" />
      <demo-switch label="Icons" [(checked)]="icons" />
      <demo-switch label="Divider" [(checked)]="divider" />
      <demo-switch label="Disabled Tab" [(checked)]="disabledTab" />
    </demo-live>

    <demo-props
      description="Inputs, outputs and models of mod-tabs and its mod-tab children. The content projected into a mod-tab is its panel."
      [props]="props"
    />

    <demo-showcase
      heading="Tab Sizes"
      description="Three size options for different content density. Medium is the default, Small for compact layouts, and Large for prominent navigation."
    >
      <span class="showcase-label">Medium (Default)</span>
      <mod-tabs aria-label="Medium tabs">
        <mod-tab label="First Tab" icon="home-01" />
        <mod-tab label="Second Tab" icon="home-01" />
        <mod-tab label="Third Tab" icon="home-01" />
      </mod-tabs>

      <span class="showcase-label">Small</span>
      <mod-tabs size="sm" aria-label="Small tabs">
        <mod-tab label="First Tab" />
        <mod-tab label="Second Tab" />
        <mod-tab label="Third Tab" />
      </mod-tabs>

      <span class="showcase-label">Large</span>
      <mod-tabs size="lg" aria-label="Large tabs">
        <mod-tab label="First Tab" icon="home-01" />
        <mod-tab label="Second Tab" icon="home-01" />
        <mod-tab label="Third Tab" icon="home-01" />
      </mod-tabs>
    </demo-showcase>

    <demo-showcase
      heading="Without Icons"
      description="Tabs can be used without icons for a simpler, text-only appearance. Works with all sizes."
    >
      <mod-tabs aria-label="Tabs without icons">
        <mod-tab label="First Tab" />
        <mod-tab label="Second Tab" />
        <mod-tab label="Third Tab" />
        <mod-tab label="Fourth Tab" />
      </mod-tabs>
    </demo-showcase>

    <demo-showcase
      heading="Tab States"
      description="Interactive states provide visual feedback. The active tab shows a green indicator bar and bold text. Disabled tabs are grayed out and non-interactive. Hover and pressed states are handled by CSS."
    >
      <mod-tabs aria-label="Tab states">
        <mod-tab label="Selected" icon="home-01" />
        <mod-tab label="Default" icon="home-01" />
        <mod-tab label="Disabled" icon="home-01" disabled />
      </mod-tabs>
    </demo-showcase>

    <demo-showcase
      heading="RTL Support"
      description="Tabs in right-to-left layout for Arabic and other RTL languages. Tab order and icon positions are mirrored automatically."
      subtle
    >
      <div dir="rtl" style="width: 100%; display: flex; flex-direction: column; align-items: center;">
        <mod-tabs aria-label="تبويبات">
          <mod-tab label="تبويب أول" icon="home-01" />
          <mod-tab label="تبويب ثاني" icon="home-01" />
          <mod-tab label="تبويب ثالث" icon="home-01" />
        </mod-tabs>
      </div>
    </demo-showcase>
  `,
})
export class TabsPage {
  protected readonly sizes: DemoOption<ModTabsSize>[] = [
    { value: 'md', label: 'Medium' },
    { value: 'sm', label: 'Small' },
    { value: 'lg', label: 'Large' },
  ];
  protected readonly counts: DemoOption<number>[] = [
    { value: 3, label: '3 Tabs' },
    { value: 4, label: '4 Tabs' },
    { value: 5, label: '5 Tabs' },
  ];

  protected readonly rtl = signal(false);
  protected readonly size = signal<ModTabsSize>('md');
  protected readonly count = signal(5);
  protected readonly icons = signal(true);
  protected readonly divider = signal(true);
  protected readonly disabledTab = signal(false);
  protected readonly active = signal(0);

  protected readonly liveTabs = computed(() => (this.rtl() ? LABELS.ar : LABELS.en).slice(0, this.count()));

  // Keep the active tab within bounds, as the original demo does.
  protected setCount(count: number): void {
    this.count.set(count);
    if (this.active() >= count) this.active.set(0);
  }

  protected readonly props: DemoProp[] = [
    { name: 'mod-tabs · selectedIndex', type: 'model<number>', default: '0', description: 'Index of the selected tab. Shows the green indicator bar and bold text.' },
    { name: 'mod-tabs · size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'Tab size: small (8px/12px padding), medium, or large (16px padding all sides).' },
    { name: 'mod-tabs · divider', type: 'boolean', default: 'true', description: 'Full-width bottom line behind the tabs. Provides a visual baseline.' },
    { name: 'mod-tabs · flush', type: 'boolean', default: 'false', description: 'Flush variant. Removes container padding so tabs sit edge-to-edge.' },
    { name: 'mod-tabs · aria-label', type: 'string', default: "''", description: 'Accessible name of the tablist.' },
    { name: 'mod-tabs · (selectionChange)', type: 'output<ModTabChangeEvent>', description: 'Emitted with { index, value } when the user selects another tab (click or keyboard).' },
    { name: 'mod-tab · label', type: 'string', default: 'required', description: 'Tab title.' },
    { name: 'mod-tab · icon', type: 'string', default: "''", description: 'Leading 24px font icon name, without the dga-icon- prefix.' },
    { name: 'mod-tab · disabled', type: 'boolean', default: 'false', description: 'Disables the tab. Grays out text and icon, prevents interaction.' },
    { name: 'mod-tab · value', type: 'string | undefined', default: 'undefined', description: 'Optional identifier reported in selectionChange and usable with selectByValue().' },
  ];
}
