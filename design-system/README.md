# Navigation Design System - DGA Saudi Guidelines

A comprehensive design system for navigation components following the Digital Government Authority (DGA) Saudi Arabia guidelines and Platforms Code unified design system standards.

## 🎨 Based on Official DGA Theme

This design system imports and extends the **official DGA Theme CSS** (`DGATheme.css`), ensuring full compatibility with existing DGA platforms.

## 🚀 Quick Start

### Installation

1. Copy the `design-system` folder to your project
2. Link the stylesheets in your HTML:

```html
<link rel="stylesheet" href="design-system/tokens.css">
<link rel="stylesheet" href="design-system/base.css">
<link rel="stylesheet" href="design-system/components/navigation.css">
<link rel="stylesheet" href="design-system/utilities/accessibility.css">
```

> **Note:** `tokens.css` automatically imports `DGATheme.css` from the utilities folder.

### Basic Usage

```html
<!-- Skip Link (Required for Accessibility) -->
<a href="#main-content" class="skip-link">Skip to main content</a>

<!-- Navigation Header -->
<header class="nav-header">
  <div class="nav-header__container">
    <div class="nav-header__logo">
      <a href="/" class="nav-header__logo-link">
        <img src="logo.svg" alt="Platform Logo" class="nav-header__logo-image">
      </a>
    </div>
    
    <nav class="nav-header__nav">
      <ul class="nav-header__list">
        <li class="nav-header__item">
          <a href="#" class="nav-header__link">Link</a>
        </li>
        <li class="nav-header__item">
          <a href="#" class="nav-header__link nav-header__link--active" aria-current="page">Active</a>
        </li>
      </ul>
    </nav>
    
    <div class="nav-header__actions">
      <a href="#" class="nav-header__action">
        <svg class="nav-header__action-icon">...</svg>
        <span>Action</span>
      </a>
    </div>
  </div>
</header>

<main id="main-content">
  <!-- Page content -->
</main>
```

## 📁 File Structure

```
design-system/
├── tokens.css                      # Navigation tokens (imports DGATheme.css)
├── base.css                        # CSS reset and base styles
├── components/
│   ├── navigation.css              # Navigation component styles
│   └── navigation.html             # Navigation HTML example
├── utilities/
│   ├── DGATheme.css               # Official DGA Theme (6500+ lines)
│   └── accessibility.css           # Accessibility utilities
├── index.html                      # Interactive documentation
└── README.md                       # This file
```

## 🎨 Design Tokens

The design system uses official DGA tokens from `DGATheme.css`:

### Colors (Saudi Green - Primary)

| Token | Value | Usage |
|-------|-------|-------|
| `--sa-600` | `#1B8354` | Primary actions, active states |
| `--sa-700` | `#166A45` | Active link background |
| `--sa-800` | `#14573A` | Hover states on active |
| `--sa-50` | `#F3FCF6` | Subtle backgrounds |

### Typography

| Token | Value | Usage |
|-------|-------|-------|
| `IBMPlexSansArabic` | Regular | Body text |
| `IBMPlexSansArabicMedium` | Medium | Navigation links |
| `IBMPlexSansArabicSemiBold` | SemiBold | Active states |
| `IBMPlexSansArabicBold` | Bold | Headings |

### Spacing

DGA spacing scale: `--spacing-xs` (4px), `--spacing-md` (8px), `--spacing-xl` (16px), `--spacing-3xl` (24px), etc.

### Border Radius

DGA radius tokens: `--radius-sm` (4px), `--radius-md` (8px), `--radius-lg` (16px), `--radius-full` (9999px)

## 🧩 Components

### Navigation Header

Main navigation component with responsive behavior.

| Class | Description |
|-------|-------------|
| `.nav-header` | Container element |
| `.nav-header__container` | Inner container with max-width |
| `.nav-header__logo` | Logo section |
| `.nav-header__nav` | Navigation links wrapper |
| `.nav-header__link` | Navigation link |
| `.nav-header__link--active` | Active state (Saudi Green) |
| `.nav-header__actions` | Action buttons section |
| `.nav-header__toggle` | Mobile menu toggle |

### Breadcrumb

```html
<nav class="breadcrumb" aria-label="Breadcrumb">
  <div class="breadcrumb__item">
    <a href="#" class="breadcrumb__link">الرئيسية</a>
    <span class="breadcrumb__separator">›</span>
  </div>
  <div class="breadcrumb__item">
    <span class="breadcrumb__current" aria-current="page">الصفحة الحالية</span>
  </div>
</nav>
```

### Pagination

```html
<nav class="pagination" aria-label="Pagination">
  <a href="#" class="pagination__item">1</a>
  <a href="#" class="pagination__item pagination__item--active">2</a>
  <a href="#" class="pagination__item">3</a>
</nav>
```

### Sidebar Navigation

```html
<nav class="nav-sidebar">
  <div class="nav-sidebar__section">
    <h3 class="nav-sidebar__title">Section Title</h3>
    <ul class="nav-sidebar__list">
      <li>
        <a href="#" class="nav-sidebar__link nav-sidebar__link--active">
          <svg class="nav-sidebar__icon">...</svg>
          Active Link
        </a>
      </li>
    </ul>
  </div>
</nav>
```

### Tabs Navigation

```html
<nav class="nav-tabs" role="tablist">
  <a href="#" class="nav-tabs__item nav-tabs__item--active" role="tab">Tab 1</a>
  <a href="#" class="nav-tabs__item" role="tab">Tab 2</a>
  <a href="#" class="nav-tabs__item" role="tab">Tab 3</a>
</nav>
```

## ♿ Accessibility

### DGA Compliance Checklist

- [x] **Keyboard Navigation**: All interactive elements are keyboard accessible
- [x] **Skip Links**: Skip to main content link provided
- [x] **Color Contrast**: WCAG AA compliant (4.5:1 minimum)
- [x] **Focus Indicators**: Visible 2px outline with offset
- [x] **ARIA Labels**: Proper labels for all interactive elements
- [x] **Screen Reader**: Semantic HTML and ARIA landmarks
- [x] **RTL Support**: Bidirectional layout support
- [x] **Reduced Motion**: Respects `prefers-reduced-motion`

### Required Attributes

```html
<!-- Navigation -->
<nav role="navigation" aria-label="Main navigation">

<!-- Current Page -->
<a href="#" aria-current="page">Current</a>

<!-- Mobile Toggle -->
<button aria-expanded="false" aria-controls="mobile-menu">

<!-- Skip Link -->
<a href="#main-content" class="skip-link">Skip to main content</a>
```

## 🌍 RTL Support

Add `dir="rtl"` to the `<html>` element for Arabic layouts:

```html
<html lang="ar" dir="rtl">
```

Also add the `is-rtl` class to body for JavaScript-based toggling:

```html
<body class="is-rtl">
```

The design system automatically adjusts:
- Text alignment
- Navigation order
- Sidebar borders
- Icon directions
- Spacing (using logical properties)

## 📱 Responsive Breakpoints

Using DGA width tokens:

| Breakpoint | Token | Description |
|------------|-------|-------------|
| Mobile | < 768px | Mobile menu, stacked layout |
| Tablet | 768px - 1023px | Navigation visible |
| Desktop | ≥ 1024px | Full navigation with actions |

## 🔧 Customization

Override navigation-specific tokens to customize:

```css
:root {
  /* Override navigation tokens */
  --nav-color-primary: var(--sa-500);
  --nav-header-height: 80px;
  --nav-link-bg-active: var(--sa-800);
}
```

## 📋 DGA Theme Classes

The official DGA Theme provides utility classes you can use:

### Typography Classes
- `.text-sm-regular`, `.text-sm-medium`, `.text-sm-semibold`, `.text-sm-bold`
- `.text-md-regular`, `.text-md-medium`, `.text-md-semibold`, `.text-md-bold`
- `.display-xs-bold`, `.display-sm-semibold`, etc.

### Color Classes
- `.text-sa-600`, `.text-gray-700`, etc.
- `.bg-sa-50`, `.bg-gray-100`, etc.

### Shadow Classes
- `.shadow-xs`, `.shadow-sm`, `.shadow-md`, `.shadow-lg`

## 📄 License

This design system follows DGA Saudi Arabia guidelines and is intended for use in Saudi government digital platforms.

---

Built with ❤️ following [DGA Saudi Guidelines](https://dga.gov.sa) using the official DGA Theme CSS.
