# PlatformsCode Component API Reference

> Source: `@platformscode/core@0.0.35` | `platformscode-new-react@0.1.29`
> **Reference only** — NOT imported into this project. Used as documentation to guide design system development.

## How to Read This File

- **HTML tags** use kebab-case: `<dga-button>`
- **React wrappers** use PascalCase: `DgaButton`
- **"Our Component"** maps to `design-system/components/` directories
- **Version suffixes:** V2 = improved API, **NDS = latest/recommended**
- `*Usage` components are internal demos and are excluded from this reference

---

## Component Mapping Overview

| Library Component(s) | HTML Tag | Our Component | Status |
|---|---|---|---|
| DgaButton, DgaButtonV2, NdsButton | `dga-button`, `dga-button-v2`, `nds-button` | `buttons/` | Exists |
| FloatingButton, NdsFloatingButton | `floating-button`, `nds-floating-button` | `buttons/` | Exists |
| DgaNavHeader + children | `dga-nav-header` | `nav-header/` | Exists |
| DgaHeaderVv2 + children | `dga-header-vv2` | `nav-header/` | Exists |
| DgaSecondNavHeader | `dga-second-nav-header` | — | Not built |
| DgaDrawer | `dga-drawer` | `nav-drawer/` | Exists |
| SidePanelMenu | `side-panel-menu` | `sidebar/` | Exists |
| DgaSlideoutMenu | `dga-slideout-menu` | — | Not built |
| DgaTabs | `dga-tabs` | `tabs/` | Exists |
| DgaBreadcrumbs | `dga-breadcrumbs` | `breadcrumbs/` | Exists |
| DgaPagination | `dga-pagination` | `pagination/` | Exists |
| DgaContentSwitcher | `dga-content-switcher` | — | Not built |
| DgaCard, DgaCardV2 | `dga-card`, `dga-card-v2` | `cards/` | Exists |
| DgaDataTable, DgaTable | `dga-data-table`, `dga-table` | `tables/` | Exists |
| DgaStructuredList | `dga-structured-list` | `tables/` | Exists |
| DgaList, DgaListV2 | `dga-list`, `dga-list-v2` | — | Not built |
| DgaTextInput | `dga-text-input` | `text-input/` | Exists |
| DgaTextarea | `dga-textarea` | — | Not built |
| DgaNumberInput | `dga-number-input` | — | Not built |
| DgaDropdown | `dga-dropdown` | — | Not built |
| DgaCheckbox | `dga-checkbox` | — | Not built |
| DgaSwitch | `dga-switch` | — | Not built |
| DgaRadioButton | `dga-radio-button` | — | Not built |
| DgaSearchBox | `dga-search-box` | — | Not built |
| DgaSlider | `dga-slider` | — | Not built |
| DgaRating | `dga-rating` | — | Not built |
| DgaDatepicker, DgaDateField | `dga-datepicker`, `dga-date-field` | `date-picker/` | Exists |
| DgaFileUpload | `dga-file-upload` | — | Not built |
| DgaDigitalSignature | `dga-digital-signature` | `digital-stamp/` | Exists |
| DgaModal, DgaModalV2 | `dga-modal`, `dga-modal-v2` | `modal/` | Exists |
| DgaNotification | `dga-notification` | — | Not built |
| DgaNotificationToast | `dga-notification-toast` | — | Not built |
| DgaInlineAlert | `dga-inline-alert` | — | Not built |
| DgaTooltip | `dga-tooltip` | `tooltip/` | Exists |
| DgaLoading | `dga-loading` | — | Not built |
| DgaLink, NdsLink | `dga-link`, `nds-link` | `links/` | Exists |
| DgaTag | `dga-tag` | `tags/` | Exists |
| DgaStatusTag | `dga-status-tag` | `status-tag/` | Exists |
| DgaChip, NdsChip | `dga-chip`, `nds-chip` | — | Not built |
| DgaIcon | `dga-icon` | `icons/` | Exists |
| DgaFeaturedIcon | `dga-featured-icon` | `icons/` | Exists |
| DgaAvatar, NdsAvatar | `dga-avatar`, `nds-avatar` | — | Not built |
| DgaAccordion, NdsAccordion | `dga-accordion`, `nds-accordion` | — | Not built |
| DgaMenu, DgaMenuV2 | `dga-menu`, `dga-menu-v2` | `menus/` | Exists |
| DgaFilteration | `dga-filteration` | `filters/` | Exists |
| DgaFooter | `dga-footer` | `footer/` | Exists |
| DgaFlex | `dga-flex` | — | Not built |
| DgaGridContainer/Item | `dga-grid-container` | — | Not built |
| DgaCollapse | `dga-collapse` | — | Not built |
| DgaLinearProgressBar | `dga-linear-progress-bar` | — | Not built |
| DgaCircularProgressBar | `dga-circular-progress-bar` | — | Not built |
| DgaProgressIndicator/V3 | `dga-progress-indicator` | — | Not built |
| DgaRadialStepper | `dga-radial-stepper` | — | Not built |
| DgaCarousel, DgaCarouselV2 | `dga-carousel`, `dga-carousel-v2` | — | Not built |
| DgaQuote | `dga-quote` | — | Not built |
| DgaMetric, DgaMetricV2 | `dga-metric`, `dga-metric-v2` | — | Not built |
| DgaChart, DgaApexChart | `dga-chart`, `dga-apex-chart` | — | Not built |
| DgaCodesnippet | `dga-codesnippet` | — | Not built |
| DgaDivider | `dga-divider` | — | Not built |
| DgaTableOfContent, NdsTableOfContent | `dga-table-of-content` | — | Not built |
| Skeleton components | `dga-skeleton-component` | `screens/` | Partial |

---

## Shared Types

### Icon Interface
Used by 15+ components for icon configuration:
```
{
  name: string              // HugeIcons icon name (e.g. 'arrow-right-01')
  size?: number             // Icon size in px
  color?: string            // Icon color
  variant?: 'stroke' | 'solid' | 'duotone' | 'twotone' | 'bulk'
  type?: 'rounded' | 'sharp' | 'standard'
}
```

### SxProps (Custom Styling)
CSS-in-JS styling system (similar to MUI `sx` prop). Accepts object or string.

### IRoute (Drawer/SidePanel)
```
{
  text: string, link: string, icon?: Icon,
  badge?: number, disabled?: boolean, children?: IRoute[]
}
```

### ITab (Tabs)
```
{ label: string, link?: string, tabIcon?: string, iconProps?: object, onClick?: fn }
```

### IBreadcrumbsItem
```
{ label: string, path: string, disabled?: boolean }
```

---

## Buttons

### DgaButton (v1)
**Tag:** `<dga-button>` | **Our:** `buttons/`

| Prop | Type | Default |
|------|------|---------|
| `variant` | ButtonStyle | `'primary-neutral'` |
| `size` | `'lg' \| 'md' \| 'sm'` | `'md'` |
| `label` | string | — |
| `disabled` | boolean | `false` |
| `icon-only` | boolean | — |
| `icon-type` | string | — |
| `icon-props` | object | — |
| `lead-icon` | boolean | — |
| `lead-icon-type` | string | — |
| `lead-icon-props` | object | — |
| `trail-icon` | boolean | — |
| `trail-icon-type` | string | — |
| `trail-icon-props` | object | — |
| `type` | `'button' \| 'submit' \| 'reset'` | `'button'` |
| `on-color` | boolean | `false` |
| `btn-id` | string | — |
| `sx` | SxProps \| string | — |

**Variants:** `'primary-neutral'` | `'primary-brand'` | `'secondary'` | `'secondary-outline'` | `'subtle'` | `'transparent'` | `'des-primary'` | `'des-secondary'` | `'des-secondary-outline'` | `'des-subtle'` | `'des-transparent'`

**Event:** `onClick` → `CustomEvent<MouseEvent>`

### DgaButtonV2
**Tag:** `<dga-button-v2>` | **Our:** `buttons/`

| Prop | Type | Default |
|------|------|---------|
| `variant` | ButtonStyle1 | `'primary'` |
| `size` | `'lg' \| 'md' \| 'sm'` | `'md'` |
| `label` | string | — |
| `disabled` | boolean | — |
| `destructive` | boolean | `false` |
| `icon-only` | boolean | — |
| `lead-icon` | boolean | — |
| `lead-icon-props` | Icon | — |
| `trail-icon` | boolean | — |
| `trail-icon-props` | Icon | — |
| `type` | `'button' \| 'submit' \| 'reset'` | `'button'` |
| `on-color` | boolean | `false` |
| `btn-id` | string | — |

**Variants:** `'primary'` | `'neutral'` | `'secondary-solid'` | `'secondary-outline'` | `'subtle'` | `'transparent'`

**Event:** `onClick` → `CustomEvent<MouseEvent>`

### NdsButton (Latest)
**Tag:** `<nds-button>` | **Our:** `buttons/`

| Prop | Type | Default |
|------|------|---------|
| `variant` | ButtonStyle2 | `'primary-brand'` |
| `size` | `'lg' \| 'md' \| 'sm'` | `'md'` |
| `label` | string | `''` |
| `disabled` | boolean | — |
| `destructive` | boolean | `false` |
| `inverted` | boolean | `false` |
| `selected` | boolean | `false` |
| `icon-only` | boolean | — |
| `leading-icon` | string | — |
| `leading-icon-props` | Icon (omit name) | — |
| `trailing-icon` | string | — |
| `trailing-icon-props` | Icon (omit name) | — |
| `type` | `'button' \| 'submit' \| 'reset'` | `'button'` |

**Variants:** `'primary-brand'` | `'primary-neutral'` | `'secondary-solid'` | `'secondary-outline'` | `'subtle'` | `'transparent'`

**Event:** `onClick` → `CustomEvent<MouseEvent>`

### FloatingButton (FAB)
**Tag:** `<floating-button>` | **Our:** `buttons/`

| Prop | Type | Default |
|------|------|---------|
| `variant` | `'primary-brand' \| 'primary-neutral' \| 'secondary-solid'` | `'primary-brand'` |
| `size` | `'small' \| 'large'` | `'small'` |
| `label` | string | `'Button'` |
| `icon` | string | `'plus-sign'` |
| `icon-only` | boolean | `false` |
| `disabled` | boolean | `false` |
| `on-color` | boolean | `false` |
| `RTL` | boolean | `false` |

**Event:** `buttonClick` → `CustomEvent<MouseEvent>`

### NdsFloatingButton (Latest FAB)
**Tag:** `<nds-floating-button>` — Same as FloatingButton but adds `inverted` prop and uses `'sm' | 'lg'` sizes.

---

## Navigation

### DgaNavHeader (Primary Top Bar)
**Tag:** `<dga-nav-header>` | **Our:** `nav-header/`

| Prop | Type | Default |
|------|------|---------|
| `full-width` | boolean | `true` |
| `divider` | boolean | `true` |
| `sticky` | boolean | `false` |

**Child components:**

| Component | Tag | Key Props |
|---|---|---|
| Logos | `dga-nav-header-logos` | `logo-src`, `logo-alt`, `logo-link`, `gov-src`, `gov-alt`, `gov-link` |
| Main | `dga-nav-header-main` | `collapsed` → emits `toggleCollapsed` |
| Menu | `dga-nav-header-menu` | Container |
| Link | `dga-nav-header-link` | `label`, `icon`, `icon-props`, `active`, `sub-menu-background`, `sub-menu-full-width` → emits `linkClicked` |
| Actions | `dga-nav-header-actions` | Container |
| Action Btn | `dga-header-action-btn` | `label`, `icon`, `active`, `extra-classes` |
| Sub Menu | `dga-nav-header-sub-menu` | `active`, `background` (`'brand' \| 'white'`), `sub-menu-full-width` |
| Sub Menu Column | `dga-nav-header-sub-menu-column` | `label` |
| Sub Menu Link | `dga-nav-header-sub-menu-link` | `label`, `link`, `helper-text`, `icon`, `background` |

### DgaHeaderVv2 (Alternative Header)
**Tag:** `<dga-header-vv2>` | **Our:** `nav-header/`

Props: `full-width` (true), `divider` (true), `sticky` (false)

**Child components:** `dga-logo-placeholder`, `dga-header-menu-item` (label, icon, active), `dga-header-action` (label, icon, icon-position), `dga-header-sub-menu`, `dga-header-sub-menu-column`, `dga-header-sub-menu-item`

### DgaSecondNavHeader
**Tag:** `<dga-second-nav-header>` | **Not built**

| Prop | Type | Default |
|------|------|---------|
| `variant` | `'primary' \| 'gray'` | `'primary'` |
| `hide-divider` | boolean | `false` |
| `hide-actions` | boolean | `false` |
| `hide-content` | boolean | `false` |

**Children:** `dga-second-nav-header-content`, `dga-second-nav-header-actions`, `dga-second-nav-header-item` (label)

### DgaDrawer (Side Navigation)
**Tag:** `<dga-drawer>` | **Our:** `nav-drawer/`

| Prop | Type | Default |
|------|------|---------|
| `anchor` | `'left' \| 'right'` | `'left'` |
| `background` | `'gray' \| 'brand'` | `'brand'` |
| `open` | boolean | `false` |
| `overlay` | boolean | — |
| `border` | boolean | — |
| `header-logo` | string (URL) | — |
| `routes` | IRoute[] (JS only) | — |
| `sx` | SxProps \| string | — |

### DgaSlideoutMenu
**Tag:** `<dga-slideout-menu>` | **Not built**

| Prop | Type | Default |
|------|------|---------|
| `anchor` | `'left' \| 'right'` | `'right'` |
| `background-color` | `'gray' \| 'white'` | `'gray'` |
| `open` | boolean | `false` |
| `scrollbar` | boolean | `true` |

**Children:** `dga-slideout-menu-header` (title, description), `dga-slideout-menu-items` (title, description), `dga-slideout-menu-actions`

### DgaTabs
**Tag:** `<dga-tabs>` | **Our:** `tabs/`

| Prop | Type | Default |
|------|------|---------|
| `size` | `'sm' \| 'md' \| 'lg'` | — |
| `orientation` | string | — |
| `flush` | boolean | — |
| `divider` | boolean | — |
| `tabs-list` | ITab[] (JS only) | — |
| `disabled` | boolean | — |
| `external` | boolean | — |
| `sx` | SxProps \| string | — |

### DgaBreadcrumbs
**Tag:** `<dga-breadcrumbs>` | **Our:** `breadcrumbs/`

| Prop | Type | Default |
|------|------|---------|
| `items` | IBreadcrumbsItem[] (JS only) | — |
| `max` | number | — |
| `sx` | SxProps \| string | — |

**Event:** `breadcrumbClick` → `CustomEvent<any>`

### DgaPagination
**Tag:** `<dga-pagination>` | **Our:** `pagination/`

| Prop | Type | Default |
|------|------|---------|
| `size` | string | — |
| `total-page-count` | number | — |
| `current-page` | number | — |
| `sibling-count` | number | — |
| `on-change` | fn (JS only) | — |
| `sx` | SxProps \| string | — |

### DgaContentSwitcher
**Tag:** `<dga-content-switcher>` | **Not built**

| Prop | Type | Default |
|------|------|---------|
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` |
| `on-color` | boolean | `false` |
| `items` | `{ label, content }[]` (JS only) | — |
| `value` | number | `0` |

### DgaMenu / DgaMenuV2
**Tag:** `<dga-menu>` | **Our:** `menus/`

| Prop | Type | Default |
|------|------|---------|
| `anchor-el` | HTMLElement (JS only) | — |
| `open` | boolean | — |
| `on-close` | fn (JS only) | — |

V2 adds: `anchor-origin`, `transform-origin`

**Children:** `dga-menu-list` (container), `dga-menu-group` (group-label), `dga-menu-item` (label, disabled, has-lead-icon, has-trail-element → emits `onClick`)

---

## Data Display

### DgaCard (v1)
**Tag:** `<dga-card>` | **Our:** `cards/`

| Prop | Type | Default |
|------|------|---------|
| `type` | `'default' \| 'expanded' \| 'selectable'` | `'default'` |
| `effect` | `'with-shadow' \| 'no-shadow' \| 'stroke'` | `'with-shadow'` |
| `card-title` | string | — |
| `description` | string | — |
| `image` | string | — |
| `disabled` | boolean | `false` |
| `is-selected` | boolean | `false` |
| `show-title` | boolean | `true` |
| `show-description` | boolean | `true` |
| `show-featured-icon` | boolean | `true` |
| `show-primary-action` | boolean | `true` |
| `show-secondary-action` | boolean | `true` |
| `featured-icon` | Icon (JS only) | — |
| `sx` | SxProps \| string | — |

### DgaCardV2 (Slot-based)
**Tag:** `<dga-card-v2>` | **Our:** `cards/`

| Prop | Type | Default |
|------|------|---------|
| `type` | `'default' \| 'expanded' \| 'selectable'` | — |
| `effect` | `'with-shadow' \| 'no-shadow' \| 'stroke'` | — |
| `disabled` | boolean | — |
| `is-selected` | boolean | — |
| `width` | string | — |
| `max-width` | string | — |
| `min-width` | string | — |
| `sx` | SxProps \| string | — |

**Children:** `dga-card-content`, `dga-card-image`, `dga-card-title`, `dga-card-actions`, `dga-card-expandable-content`

### DgaDataTable
**Tag:** `<dga-data-table>` | **Our:** `tables/`

| Prop | Type | Default |
|------|------|---------|
| `columns` | IColumn[] (JS only) | — |
| `data` | any[] (JS only) | — |
| `cells` | CellConfig[] (JS only) | — |
| `row-divider` | boolean | `true` |
| `show-select-check-box` | boolean | `true` |
| `alternate` | boolean | `true` |
| `contained` | boolean | `true` |

### DgaTag
**Tag:** `<dga-tag>` | **Our:** `tags/`

| Prop | Type | Default |
|------|------|---------|
| `label` | string | — |
| `variant` | `'neutral' \| 'success' \| 'info' \| 'warning' \| 'error' \| 'brand'` | — |
| `size` | `'sm' \| 'md' \| 'lg'` | — |
| `icon-only` | boolean | — |
| `lead-icon` | Icon (JS only) | — |
| `trail-icon` | Icon (JS only) | — |
| `rounded` | boolean | — |
| `outlined` | boolean | — |
| `sx` | SxProps \| string | — |

### DgaStatusTag
**Tag:** `<dga-status-tag>` | **Our:** `status-tag/`

| Prop | Type | Default |
|------|------|---------|
| `label` | string | — |
| `color` | `'neutral' \| 'green' \| 'blue' \| 'yellow' \| 'red'` | — |
| `size` | string | — |
| `status` | `'inverted' \| 'subtle' \| 'ghost'` | — |
| `RTL` | boolean | `false` |
| `sx` | SxProps \| string | — |

### DgaAvatar / NdsAvatar
**Tag:** `<dga-avatar>`, `<nds-avatar>` | **Not built**

| Prop | Type | Default |
|------|------|---------|
| `type` | `'image' \| 'text' \| 'icon'` | — |
| `size` | number | — |
| `square` | boolean | — |
| `border` | boolean | — |
| `text` | string | — |
| `img-url` | string | — |
| `alt` | string | — |
| `icon` | Icon (JS only) | — |
| `sx` | SxProps \| string | — |

### DgaList / DgaListV2
**Tag:** `<dga-list>` | **Not built**

| Prop | Type | Default |
|------|------|---------|
| `type` | `'ordered' \| 'unordered' \| 'with-icon'` | `'unordered'` |
| `color` | `'primary' \| 'neutral' \| 'on-color'` | `'primary'` |
| `title` | string | — |
| `items` | string[] / ListItem[] (JS only) | — |

### DgaDivider
**Tag:** `<dga-divider>` | **Not built**

| Prop | Type | Default |
|------|------|---------|
| `color` | string | — |
| `orientation` | string | — |

### DgaQuote
**Tag:** `<dga-quote>` | **Not built**

| Prop | Type | Default |
|------|------|---------|
| `size` | string | — |
| `white-background` | boolean | — |
| `quote-title` | string | — |
| `quote-description` | string | — |
| `author-name` | string | — |
| `author-description` | string | — |
| `show-avatar` | boolean | — |
| `sx` | SxProps \| string | — |

---

## Forms

### DgaTextInput
**Tag:** `<dga-text-input>` | **Our:** `text-input/`

| Prop | Type | Default |
|------|------|---------|
| `label` | string | — |
| `placeholder` | string | — |
| `size` | `'md' \| 'lg'` | `'lg'` |
| `type` | `'text' \| 'number' \| 'password'` | `'text'` |
| `variant` | `'default' \| 'lighter' \| 'darker'` | `'default'` |
| `value` | string | `''` |
| `disabled` | boolean | `false` |
| `error` | boolean | `false` |
| `readonly` | boolean | `false` |
| `required` | boolean | `false` |
| `fullwidth` | boolean | `true` |
| `feedback-icon` | boolean | `false` |
| `feedback-icon-type` | `'success' \| 'error' \| 'warning'` | `'success'` |
| `feedback-icon-ring` | boolean | `false` |
| `helper-text` | string | — |
| `helper-text-icon` | Icon (JS only) | — |
| `icon` | Icon (JS only) | — |
| `name` | string | auto |
| `sx` | SxProps \| string | — |

**Callbacks (JS):** `onChange`, `onInput`, `onBlur`

### DgaTextarea
**Tag:** `<dga-textarea>` | **Not built**

Same pattern as TextInput with: `cols` (50), `rows` (4), `resize` (true), `scrollbar` (true)

### DgaNumberInput
**Tag:** `<dga-number-input>` | **Not built**

Same pattern as TextInput. Size: `'md' | 'lg'`.

### DgaDropdown
**Tag:** `<dga-dropdown>` | **Not built**

| Prop | Type | Default |
|------|------|---------|
| `options` | any[] (JS only) | — |
| `option-label` | string | `'name'` |
| `track-by` | string | — |
| `placeholder` | string | — |
| `multi-select` | boolean | `false` |
| `size` | string | — |
| `variant` | string | — |
| `disabled` | boolean | — |
| `error` | boolean | — |
| `readonly` | boolean | — |
| `value` | string | — |
| `sx` | SxProps \| string | — |

### DgaCheckbox
**Tag:** `<dga-checkbox>` | **Not built**

| Prop | Type | Default |
|------|------|---------|
| `color` | `'brand' \| 'neutral'` | `'brand'` |
| `size` | `'lg' \| 'md' \| 'sm'` | `'md'` |
| `label` | string | — |
| `checked` | boolean | `false` |
| `indeterminate` | boolean | `false` |
| `disabled` | boolean | — |
| `helper-text` | string | — |
| `name` | string | auto |
| `value` | string | — |

### DgaSwitch
**Tag:** `<dga-switch>` | **Not built**

| Prop | Type | Default |
|------|------|---------|
| `color` | string | — |
| `label` | string | — |
| `checked` | boolean | — |
| `disabled` | boolean | — |
| `has-helper-text` | boolean | — |
| `helper-text` | string | — |
| `alert-message` | boolean | — |
| `alert-text` | string | — |
| `sx` | SxProps \| string | — |

### DgaRadioButton
**Tag:** `<dga-radio-button>` | **Not built**

| Prop | Type | Default |
|------|------|---------|
| `color` | string | — |
| `label` | string | — |
| `checked` | boolean | — |
| `disabled` | boolean | — |
| `name` | string | — |
| `value` | string | — |
| `has-helper-text` | boolean | — |
| `helper-text` | string | — |
| `sx` | SxProps (JS only) | — |

### DgaSearchBox
**Tag:** `<dga-search-box>` | **Not built**

Same pattern as TextInput with: `show-trailing-icon`, `icon`, `speech-lang`

**Events:** `onChange`, `onBlur`

### DgaSlider
**Tag:** `<dga-slider>` | **Not built**

| Prop | Type | Default |
|------|------|---------|
| `min` | number | `0` |
| `max` | number | `100` |
| `step` | number | — |
| `range` | boolean | `true` |
| `label` | string | — |
| `show-label` | boolean | — |
| `show-helper-text` | boolean | — |
| `helper-text` | string | — |
| `size` | string | — |
| `initial-min` | number | — |
| `initial-max` | number | — |
| `sx` | SxProps \| string | — |

### DgaRating
**Tag:** `<dga-rating>` | **Not built**

| Prop | Type | Default |
|------|------|---------|
| `size` | string | — |
| `value` | number | — |
| `max` | number | — |
| `read-only` | boolean | — |
| `variant` | string | — |
| `direction` | string | — |

**Event:** `ratingChange`

### DgaDatepicker
**Tag:** `<dga-datepicker>` | **Our:** `date-picker/`

| Prop | Type | Default |
|------|------|---------|
| `RTL` | boolean | `false` |
| `initial-date` | Date (JS only) | — |
| `range` | boolean | — |
| `dual-month-view` | boolean | — |
| `input-field` | boolean | — |
| `submit-button` | boolean | — |
| `qick-options` | boolean | — |
| `value` | object (JS only) | — |

**Callbacks (JS):** `onSubmit`, `onCancel`

### DgaDateField
**Tag:** `<dga-date-field>` | **Our:** `date-picker/`

Same form input pattern with: `datepicker-options` (JS only)

### DgaFileUpload
**Tag:** `<dga-file-upload>` | **Not built**

| Prop | Type | Default |
|------|------|---------|
| `accept` | string | — |
| `multiple` | boolean | — |
| `title` | string | — |
| `file-types-text` | string | — |
| `action-name` | string | — |
| `maximum-files-size` | number | — |
| `disabled` | boolean | — |

### DgaDigitalSignature
**Tag:** `<dga-digital-signature>` | **Our:** `digital-stamp/`

| Prop | Type | Default |
|------|------|---------|
| `language` | `'ar' \| 'en'` | — |
| `opened` | boolean | — |
| `extension` | `'.gov.sa' \| '.edu.sa' \| '.med.sa' \| '.org.sa' \| '.sch.sa' \| '.sa'` | — |
| `link-props` | object (JS only) | — |

### DgaLabel
**Tag:** `<dga-label>` | Form companion

| Prop | Type | Default |
|------|------|---------|
| `label` | string | — |
| `variant` | `'default' \| 'semibold'` | `'default'` |
| `size` | `'md' \| 'lg'` | `'md'` |
| `disabled` | boolean | `false` |
| `required` | boolean | `false` |

### DgaHelperText
**Tag:** `<dga-helper-text>` | Form companion

| Prop | Type | Default |
|------|------|---------|
| `helper-text` | string | — |
| `error` | boolean | `false` |
| `helper-text-icon` | Icon (JS only) | — |

---

## Feedback & Overlay

### DgaModal (v1)
**Tag:** `<dga-modal>` | **Our:** `modal/`

| Prop | Type | Default |
|------|------|---------|
| `title` | string | — |
| `name` | string | — |
| `open` | boolean | `false` |
| `position` | `'start' \| 'end' \| 'center'` | `'center'` |
| `close-button` | boolean | `true` |
| `static-modal` | boolean | `false` |
| `alignment-center` | boolean | — |
| `action-fill-container` | boolean | — |
| `action-stack` | boolean | — |
| `second-btn-position` | `'left' \| 'right'` | `'left'` |
| `buttons-list` | `{ id?, label, onClick, extraClass?, title? }[]` (JS) | — |
| `featured-icon-props` | `{ size, color, variant, circle?, icon }` (JS) | — |

**FeaturedIcon colors:** `'brand' \| 'gray' \| 'error' \| 'warning' \| 'success' \| 'info'`
**FeaturedIcon variants:** `'light' \| 'dark' \| 'outlined'`

### DgaModalV2 (Slot-based)
**Tag:** `<dga-modal-v2>` | **Our:** `modal/`

Same props as v1 with `show-close-button` instead of `close-button`, and featured icon split into individual props: `featured-icon-color`, `featured-icon-style`, `featured-icon-type`, `featured-icon-circle`, `featured-icon-size`.

**Children:** `dga-modal-header`, `dga-modal-body`, `dga-modal-actions`, `dga-modal-title`

### DgaNotification
**Tag:** `<dga-notification>` | **Not built**

| Prop | Type | Default |
|------|------|---------|
| `variant` | `'critical' \| 'warning' \| 'success' \| 'info' \| 'neutral'` | — |
| `lead-text` | string | — |
| `content` | string | — |
| `icon` | boolean | `true` |
| `link` | boolean | `false` |
| `text-link` | string | — |
| `dismissable` | boolean | `false` |
| `sx` | SxProps \| string | — |

### DgaNotificationToast
**Tag:** `<dga-notification-toast>` | **Not built**

| Prop | Type | Default |
|------|------|---------|
| `type` | `'error' \| 'warning' \| 'success' \| 'info' \| 'neutral'` | `'neutral'` |
| `lead-text` | string | — |
| `helper-text` | string | — |
| `has-helper-text` | boolean | `false` |
| `open` | boolean | `true` |
| `action` | boolean | — |
| `close-button` | boolean | — |
| `v-postion` | `'top' \| 'bottom'` | `'top'` |
| `h-postion` | `'left' \| 'right'` | `'right'` |
| `buttons-list` | array (JS only) | — |

### DgaInlineAlert
**Tag:** `<dga-inline-alert>` | **Not built**

| Prop | Type | Default |
|------|------|---------|
| `type` | string | — |
| `lead-text` | string | — |
| `helper-text` | string | — |
| `colored` | boolean | — |
| `isaction-buttons` | boolean | — |
| `is-close-button` | boolean | — |
| `buttons-list` | array (JS only) | — |

### DgaTooltip
**Tag:** `<dga-tooltip>` | **Our:** `tooltip/`

| Prop | Type | Default |
|------|------|---------|
| `title` | string | — |
| `helper-text` | string | — |
| `beak-placement` | BeakPlacement | `'none'` |
| `beak-alignment` | BeakAlignment | `'center'` |
| `direction` | Direction | `'top'` |
| `theme` | Theme | `'light'` |
| `icon` | boolean | `false` |
| `feedback-icon` | FeedbackIcon (JS only) | — |
| `sx` | SxProps \| string | — |

### DgaLoading
**Tag:** `<dga-loading>` | **Not built**

| Prop | Type | Default |
|------|------|---------|
| `size` | LoadingSize | `'md'` |
| `variant` | LoadingStyle | `'neutral'` |
| `sx` | SxProps \| string | — |

---

## Icons & Decorative

### DgaIcon
**Tag:** `<dga-icon>` | **Our:** `icons/`

| Prop | Type | Default |
|------|------|---------|
| `name` | string | — |
| `src` | string | — |
| `icon` | any | — |
| `size` | number | — |
| `color` | string | — |
| `variant` | `'stroke' \| 'solid' \| 'duotone' \| 'twotone' \| 'bulk'` | — |
| `type` | `'rounded' \| 'sharp' \| 'standard'` | — |
| `flip-rtl` | boolean | — |
| `lazy` | boolean | `false` |
| `sanitize` | boolean | — |

### DgaFeaturedIcon
**Tag:** `<dga-featured-icon>` | **Our:** `icons/`

| Prop | Type | Default |
|------|------|---------|
| `size` | `'sm' \| 'md' \| 'lg' \| 'xl'` | — |
| `color` | `'brand' \| 'gray' \| 'error' \| 'warning' \| 'success' \| 'info'` | — |
| `variant` | `'light' \| 'dark' \| 'outlined'` | — |
| `circle` | boolean | — |
| `icon` | Icon (JS only) | — |

### DgaChip / NdsChip
**Tag:** `<dga-chip>`, `<nds-chip>` | **Not built**

| Prop | Type | Default |
|------|------|---------|
| `label` | string | — |
| `variant` | `'success' \| 'neutral' \| 'on-color'` | `'success'` |
| `size` | `'lg' \| 'md' \| 'sm'` | `'md'` |
| `rounded` | boolean | — |
| `disabled` | boolean | — |
| `selected` / `is-selected` | boolean | `false` |
| `leading-icon` / `lead-icon` | string / Icon | — |
| `trailing-icon` / `trail-icon` | string / Icon | — |
| `sx` | SxProps \| string | — |

### DgaLink / NdsLink
**Tag:** `<dga-link>`, `<nds-link>` | **Our:** `links/`

| Prop | Type | Default |
|------|------|---------|
| `label` | string | — |
| `variant` | `'primary' \| 'neutral' \| 'on-color'` | `'primary'` |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` |
| `url` / `href` | string | — |
| `inline` | boolean | — |
| `icon` | boolean (v1) / string (NDS) | — |
| `disabled` | boolean | — |
| `target` | `'_blank' \| '_self' \| '_parent' \| '_top'` | `'_self'` |
| `external` | boolean (v1 only) | — |

**Event:** `onClick` → `CustomEvent<MouseEvent>`

### DgaAccordion / NdsAccordion
**Tag:** `<dga-accordion>`, `<nds-accordion>` | **Not built**

| Prop | Type | Default |
|------|------|---------|
| `title` | string | — |
| `content` | string | — |
| `size` | string | — |
| `icon-alignment` | string | — |
| `flush` | boolean | — |
| `disabled` | boolean | — |
| `default-expanded` | boolean | `false` |
| `sx` | SxProps \| string | — |

---

## Layout

### DgaFlex
**Tag:** `<dga-flex>` | **Not built**

| Prop | Type | Default |
|------|------|---------|
| `direction` | string | — |
| `spacing` | number | — |
| `align` | string | — |
| `justify` | string | — |
| `wrap` | boolean | — |
| `sx` | SxProps \| string | — |

### DgaGridContainer / DgaGridItem
**Tag:** `<dga-grid-container>`, `<dga-grid-item>` | **Not built**

Container: `fluid`, `gap`, `column-gap`, `row-gap`, `spacing`, `disable-gutters`
Item: `xs`, `sm`, `md`, `lg`, `xl`, `align-self`, `grow`, `shrink`, `order`

### DgaCollapse
**Tag:** `<dga-collapse>` | **Not built**

| Prop | Type | Default |
|------|------|---------|
| `open` | boolean | — |
| `transition-duration` | string | `'0.3s'` |
| `transition-type` | string | `'ease-in'` |

### DgaFooter
**Tag:** `<dga-footer>` | **Our:** `footer/`

| Prop | Type | Default |
|------|------|---------|
| `background` | string | — |
| `nav-links` | boolean | — |
| `main-title` | string | — |
| `main-description` | string | — |
| `main-link` | string | — |
| `main-image` | string | — |
| `copyright` | string | — |
| `group-links` | array (JS only) | — |
| `social-media-title` | string | — |
| `social-media-links` | array (JS only) | — |
| `accessibility-title` | string | — |
| `accessibility-links` | array (JS only) | — |
| `basic-links` | array (JS only) | — |
| `extra-links` | array (JS only) | — |
| `bottom-images` | array (JS only) | — |

---

## Progress

### DgaLinearProgressBar
**Tag:** `<dga-linear-progress-bar>` | **Not built**

| Prop | Type | Default |
|------|------|---------|
| `percentage` | number | `0` |
| `size` | `'small' \| 'medium' \| 'large'` | `'small'` |
| `progress-style` | `'primary' \| 'neutral' \| 'error'` | `'neutral'` |
| `label` | string | — |
| `helper-text` | string | — |
| `show-label` | boolean | `true` |
| `show-helper-text` | boolean | `true` |
| `error` | boolean | `false` |
| `success` | boolean | `false` |
| `RTL` | boolean | `false` |

### DgaCircularProgressBar
**Tag:** `<dga-circular-progress-bar>` | **Not built**

| Prop | Type | Default |
|------|------|---------|
| `percentage` | number | `0` |
| `size` | `'200px' \| '160px' \| '120px' \| '80px' \| '64px'` | `'64px'` |
| `variant` | `'primary' \| 'neutral' \| 'success' \| 'error'` | `'primary'` |
| `text` | string | — |
| `RTL` | boolean | `false` |

### DgaProgressIndicator / V3
**Tag:** `<dga-progress-indicator>` | **Not built**

| Prop | Type | Default |
|------|------|---------|
| `active-step` | number | — |
| `alignment` | string | — |

**Children:** `dga-progress-indicator-step` (title, description, current-step, next-step, show-step-name, show-step-description, label-style)

**Event:** `stepChange`

### DgaRadialStepper
**Tag:** `<dga-radial-stepper>` | **Not built**

| Prop | Type | Default |
|------|------|---------|
| `steps` | Step[] (JS only) | — |
| `active-step` | number | — |
| `size` | string | — |
| `variant` | string | — |
| `show-text` | boolean | — |
| `show-step-name` | boolean | — |
| `show-step-description` | boolean | — |
| `RTL` | boolean | `false` |

---

## Charts

### DgaChart / DgaApexChart
**Tag:** `<dga-chart>` | **Not built**

Wrapper around [ApexCharts](https://apexcharts.com/). Props: `type`, `width`, `height`, `options`, `series`, `labels`, `xaxis`, `yaxis`, `colors`.

---

## Skeletons

### DgaSkeletonComponent
**Tag:** `<dga-skeleton-component>` | **Our:** `screens/` (partial)

| Type values |
|---|
| `'chart and content'` |
| `'image content and button'` |
| `'image profile content'` |
| `'image button and text'` |
| `'icon and list'` |

### Individual Skeletons
- `<dga-line-skeleton>` — size: `'lg' \| 'sm'`, type: `'1' \| '2'`
- `<dga-circle-skeleton>` — width: `'24px' \| '48px' \| '64px' \| '80px' \| '120px' \| '170px' \| '240px'`
- `<dga-square-skeleton>` — same width options
- `<dga-rectangle-skeleton>` — size + width

---

## Misc

### DgaCodesnippet
**Tag:** `<dga-codesnippet>` | **Not built**

| Prop | Type | Default |
|------|------|---------|
| `snippets` | `{ [key: string]: string }` (JS only) | — |
| `type` | `'multi-line' \| 'single'` | `'multi-line'` |
| `show-button` | boolean | `false` |
| `show-sidebar` | boolean | `false` |
| `show-tab-list` | boolean | `false` |

### DgaFilteration
**Tag:** `<dga-filteration>` | **Our:** `filters/`

| Prop | Type | Default |
|------|------|---------|
| `button-label` | string | — |
| `filter-blocks` | FilterBlock[] (JS only) | — |
| `initvalue` | object (JS only) | — |
| `max-block-height` | number | — |

**Event:** `onFilterChange` → `CustomEvent<{ blockId, items }[]>`

### DgaCarousel / DgaCarouselV2
**Tag:** `<dga-carousel>` | **Not built**

| Prop | Type | Default |
|------|------|---------|
| `variant` | `'arrows' \| 'dots' \| 'dots-only'` | — |
| `show-dots` | boolean | — |
| `steps` | number | — |
| `transition-duration` | number | — |
| `dir` | string | — |
| `size` | string | — |
| `arrows-variant` | string | — |
| `arrows` | object (JS only) | — |
