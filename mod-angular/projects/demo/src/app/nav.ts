// Sidebar entries, in the same order, with the same icons and badges as the
// original docs site (design-system/index.html).
export interface DemoNavItem {
  id: string;
  label: string;
  icon: string;
  badge?: string;
}

export const DEMO_NAV: DemoNavItem[] = [
  { id: 'components-overview', label: 'Overview', icon: 'dashboard-square-01' },
  { id: 'button', label: 'Buttons', icon: 'cursor-pointer-01', badge: 'New' },
  { id: 'text-input', label: 'Text Input', icon: 'type-cursor' },
  { id: 'dropdown', label: 'Dropdown', icon: 'arrow-down-01', badge: 'New' },
  { id: 'search-box', label: 'Search Box', icon: 'search-01', badge: 'New' },
  { id: 'rating', label: 'Rating', icon: 'star', badge: 'New' },
  { id: 'textarea', label: 'Textarea', icon: 'note-01', badge: 'New' },
  { id: 'radio', label: 'Radio Button', icon: 'circle', badge: 'New' },
  { id: 'checkbox', label: 'Checkbox', icon: 'checkmark-square-01', badge: 'New' },
  { id: 'file-upload', label: 'File Upload', icon: 'cloud-upload', badge: 'New' },
  { id: 'tags', label: 'Tags', icon: 'tag-01' },
  { id: 'chips', label: 'Chips', icon: 'chip', badge: 'New' },
  { id: 'avatar', label: 'Avatar', icon: 'user', badge: 'New' },
  { id: 'status-tag', label: 'Status Tag', icon: 'checkmark-badge-01' },
  { id: 'pagination', label: 'Pagination', icon: 'more-horizontal' },
  { id: 'tabs', label: 'Tabs', icon: 'browser', badge: 'New' },
  { id: 'accordion', label: 'Accordion', icon: 'arrow-down-01', badge: 'New' },
  { id: 'tables', label: 'Tables', icon: 'grid-table' },
  { id: 'screens', label: 'Screens', icon: 'computer' },
  { id: 'breadcrumbs', label: 'Breadcrumbs', icon: 'hierarchy' },
  { id: 'links', label: 'Links', icon: 'link-01' },
  { id: 'cards', label: 'Cards', icon: 'credit-card' },
  { id: 'menus', label: 'Menus', icon: 'menu-01' },
  { id: 'slideout-menu', label: 'Slideout Menu', icon: 'sidebar-right-01', badge: 'New' },
  { id: 'nav-header', label: 'Nav Header', icon: 'layout-top' },
  { id: 'second-nav-header', label: 'Second Nav Header', icon: 'layout-top', badge: 'New' },
  { id: 'nav-drawer', label: 'Nav Drawer', icon: 'sidebar-left-01' },
  { id: 'sidebar', label: 'Sidebar', icon: 'layout-left' },
  { id: 'tooltip', label: 'Tooltip', icon: 'comment-01' },
  { id: 'notification', label: 'Notification', icon: 'notification-01', badge: 'New' },
  { id: 'notification-toast', label: 'Notification Toast', icon: 'notification-01', badge: 'New' },
  { id: 'inline-alert', label: 'Inline Alert', icon: 'alert-02', badge: 'New' },
  { id: 'modal', label: 'Modal', icon: 'alert-02' },
  { id: 'digital-stamp', label: 'Digital Stamp', icon: 'stamp-01' },
  { id: 'form-template', label: 'Form Template', icon: 'check-list' },
  { id: 'filters', label: 'Filters', icon: 'filter' },
  { id: 'footer', label: 'Footer', icon: 'layout-bottom' },
  { id: 'date-picker', label: 'Date Picker', icon: 'calendar-03', badge: 'New' },
  { id: 'progress-indicator', label: 'Progress Indicator', icon: 'loading-01', badge: 'New' },
  { id: 'progress-bar', label: 'Progress Bar', icon: 'loading-03', badge: 'New' },
  { id: 'skeleton', label: 'Skeleton', icon: 'dashboard-square-01', badge: 'New' },
];
