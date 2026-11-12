import { ChangeDetectionStrategy, Component, booleanAttribute, input, signal } from '@angular/core';
import {
  ModBreadcrumbItem,
  ModBreadcrumbs,
  ModButton,
  ModCheckbox,
  ModCheckboxGroup,
  ModDigitalStamp,
  ModDropdown,
  ModDropdownOption,
  ModFooter,
  ModFooterGroup,
  ModFooterIconAction,
  ModFooterLink,
  ModFooterLogo,
  ModFormFeedback,
  ModFormRow,
  ModFormTemplate,
  ModFormTemplateActions,
  ModFormTemplateBreadcrumb,
  ModFormTemplateSteps,
  ModNavHeader,
  ModNavHeaderAction,
  ModProgressIndicator,
  ModProgressStep,
  ModRadio,
  ModRadioGroup,
  ModServiceTabItem,
  ModServiceTabs,
  ModTextInput,
  ModTextarea,
} from '@mod-internal/ui';

interface ChoiceOption {
  value: string;
  label: string;
  helper?: string;
}

interface FormTemplateCopy {
  stamp: {
    text: string;
    toggle: string;
    domainTitle: string;
    domainDescription: string;
    httpsTitle: string;
    httpsDescription: string;
    registrationLabel: string;
  };
  logo: string;
  menuLabel: string;
  openMenu: string;
  closeMenu: string;
  actions: ModNavHeaderAction[];
  tabsLabel: string;
  tabs: ModServiceTabItem[];
  stepsLabel: string;
  stepLabel: string;
  steps: ModProgressStep[];
  breadcrumbLabel: string;
  breadcrumb: ModBreadcrumbItem[];
  title: string;
  description: string;
  requiredInfo: string;
  requiredLabel: string;
  optionalLabel: string;
  placeholder: string;
  helper: string;
  options: ModDropdownOption<string>[];
  descriptionLabel: string;
  descriptionPlaceholder: string;
  descriptionHelper: string;
  notesLabel: string;
  notesPlaceholder: string;
  requestLabel: string;
  requestOptions: ChoiceOption[];
  docsLabel: string;
  docOptions: ChoiceOption[];
  termsLabel: string;
  termsHelper: string;
  back: string;
  next: string;
  feedbackQuestion: string;
  feedbackStats: string;
  yes: string;
  no: string;
  footer: {
    groups: ModFooterGroup[];
    socialTitle: string;
    social: ModFooterIconAction[];
    accessibilityTitle: string;
    tools: ModFooterIconAction[];
    legalLinks: ModFooterLink[];
    caption: string;
    extraLinks: ModFooterLink[];
    logos: ModFooterLogo[];
  };
}

const links = (...labels: string[]): ModFooterLink[] => labels.map((label) => ({ label }));

const SOCIAL: ModFooterIconAction[] = [
  { label: 'X (Twitter)', icon: 'new-twitter' },
  { label: 'Instagram', icon: 'instagram' },
  { label: 'YouTube', icon: 'youtube' },
  { label: 'LinkedIn', icon: 'linkedin-01' },
];

const ARABIC: FormTemplateCopy = {
  stamp: {
    text: 'موقع حكومي مسجل لدى هيئة الحكومة الرقمية.',
    toggle: 'كيف تتحقق؟',
    domainTitle: 'روابط المواقع الإلكترونية الرسمية الحكومية تنتهي بـ',
    domainDescription:
      'جميع روابط المواقع الرسمية التابعة للجهات الحكومية في المملكة العربية السعودية تنتهي بـ .gov.sa',
    httpsTitle: 'المواقع الإلكترونية الحكومية الموثوقة تستخدم بروتوكول',
    httpsDescription: 'تحقق من أن الموقع يستخدم بروتوكول HTTPS',
    registrationLabel: 'مسجل لدى هيئة الحكومة الرقمية برقم:',
  },
  logo: 'شعار المنصة',
  menuLabel: 'القائمة الرئيسية',
  openMenu: 'فتح القائمة',
  closeMenu: 'إغلاق القائمة',
  actions: [
    { id: 'search', label: 'البحث', icon: 'search-01' },
    { id: 'language', label: 'English', icon: 'language-square' },
    { id: 'login', label: 'تسجيل الدخول', icon: 'user' },
  ],
  tabsLabel: 'أقسام الخدمة',
  tabs: [
    { label: 'تبويب 1', completed: true },
    { label: 'تبويب 2' },
    { label: 'تبويب 3' },
    { label: 'تبويب 4' },
    { label: 'تبويب 5' },
    { label: 'تبويب 6' },
    { label: 'تبويب 7' },
  ],
  stepsLabel: 'التقدم',
  stepLabel: 'الخطوة',
  steps: [
    { name: 'الخطوة الأولى', description: 'وصف الخطوة' },
    { name: 'الخطوة الثانية', description: 'وصف الخطوة' },
    { name: 'الخطوة الثالثة', description: 'وصف الخطوة' },
  ],
  breadcrumbLabel: 'مسار التنقل',
  breadcrumb: [{ label: 'رابط' }, { label: 'رابط' }],
  title: 'حقول النص',
  description:
    'عند استخدام النماذج، فإن حقول النموذج القياسية المستخدمة هي حقول نص تستخدم عادة لإدخال نص قصير. حالات حقل النموذج هي الافتراضي، النشط، المركز، الخطأ، التلميحي، والمعطل',
  requiredInfo: 'المعلومات المطلوبة',
  requiredLabel: 'إدخال النص الإلزامي',
  optionalLabel: 'إدخال النص الاختياري',
  placeholder: 'نص تلميحي',
  helper: 'نص مساعد',
  options: [
    { value: 'text', label: 'نص' },
    { value: 'text-2', label: 'نص 2' },
    { value: 'text-3', label: 'نص 3' },
  ],
  descriptionLabel: 'الوصف',
  descriptionPlaceholder: 'أدخل الوصف هنا...',
  descriptionHelper: 'الحد الأقصى 500 حرف.',
  notesLabel: 'ملاحظات إضافية',
  notesPlaceholder: 'أدخل ملاحظاتك هنا...',
  requestLabel: 'نوع الطلب',
  requestOptions: [
    { value: 'new', label: 'طلب جديد', helper: 'تقديم طلب لأول مرة.' },
    { value: 'renewal', label: 'تجديد', helper: 'تجديد طلب سابق.' },
    { value: 'update', label: 'تحديث بيانات', helper: 'تعديل بيانات طلب قائم.' },
  ],
  docsLabel: 'المستندات المرفقة',
  docOptions: [
    { value: 'id', label: 'صورة الهوية الوطنية' },
    { value: 'registration', label: 'السجل التجاري' },
    { value: 'authorization', label: 'خطاب التفويض' },
  ],
  termsLabel: 'أوافق على الشروط والأحكام',
  termsHelper: 'يرجى قراءة الشروط والأحكام قبل المتابعة.',
  back: 'رجوع',
  next: 'التالي',
  feedbackQuestion: 'هل كانت هذه الصفحة مفيدة؟',
  feedbackStats: '60% من المستخدمين قالوا نعم من 2843 تعليقاً',
  yes: 'نعم',
  no: 'لا',
  footer: {
    groups: [
      {
        label: 'ملخص',
        links: links(
          'حول [اسم البوابة]',
          'الخصوصية وشروط الاستخدام',
          'كيفية استخدام [اسم البوابة]',
          'الأخبار والأحداث',
          'إحصائيات اتفاقية مستوى الخدمة',
        ),
      },
      {
        label: 'روابط مهمة',
        links: links(
          'بوابة الخدمة الوطنية',
          'البيانات الحكومية المفتوحة',
          'الاستراتيجية الوطنية للبيانات والذكاء الاصطناعي',
          'بوابة البيانات المفتوحة',
          'بوابة المشاركة الإلكترونية',
        ),
      },
      {
        label: 'الاتصال والدعم',
        links: links('مركز المساعدة', 'تواصل معنا', 'شارك معنا', 'تقديم شكوى', 'الإبلاغ عن الفساد'),
      },
    ],
    socialTitle: 'تابعنا على',
    social: SOCIAL,
    accessibilityTitle: 'أدوات الاتاحة والوصول',
    tools: [
      { label: 'تكبير الخط', icon: 'text-font' },
      { label: 'تباين عالي', icon: 'eye' },
      { label: 'قارئ الشاشة', icon: 'view' },
    ],
    legalLinks: links('خريطة الموقع', 'RSS', 'تطبيق الجوال'),
    caption: 'جميع الحقوق محفوظة لهيئة الحكومة الرقمية © 2024',
    extraLinks: links('الشروط والأحكام', 'سياسة الخصوصية'),
    logos: [{ text: 'شعار المنصة' }, { text: 'شعار المنصة' }],
  },
};

const ENGLISH: FormTemplateCopy = {
  stamp: {
    text: 'A government website registered with the Digital Government Authority.',
    toggle: 'How you know?',
    domainTitle: '',
    domainDescription: '',
    httpsTitle: 'Official Secure websites use',
    httpsDescription: 'Ensure the website is using the HTTPS protocol.',
    registrationLabel: 'Registered on Digital Government Authority:',
  },
  logo: 'Platform Logo',
  menuLabel: 'Main menu',
  openMenu: 'Open menu',
  closeMenu: 'Close menu',
  actions: [
    { id: 'search', label: 'Search', icon: 'search-01' },
    { id: 'language', label: 'عربي', icon: 'language-square' },
    { id: 'login', label: 'Login', icon: 'user' },
  ],
  tabsLabel: 'Service sections',
  tabs: [
    { label: 'Tab 1', completed: true },
    { label: 'Tab 2' },
    { label: 'Tab 3' },
    { label: 'Tab 4' },
    { label: 'Tab 5' },
  ],
  stepsLabel: 'Progress',
  stepLabel: 'Step',
  steps: [
    { name: 'Step One', description: 'Step description' },
    { name: 'Step Two', description: 'Step description' },
    { name: 'Step Three', description: 'Step description' },
  ],
  breadcrumbLabel: 'Breadcrumb',
  breadcrumb: [{ label: 'Link' }, { label: 'Link' }],
  title: 'Text Fields',
  description:
    'When using forms, the standard form fields used are text fields typically used to enter short text. Form field states are default, active, focused, error, hint, and disabled.',
  requiredInfo: 'Required Information',
  requiredLabel: 'Required Text Input',
  optionalLabel: 'Optional Text Input',
  placeholder: 'Placeholder text',
  helper: 'Helper text',
  options: [
    { value: 'text', label: 'Text' },
    { value: 'text-2', label: 'Text 2' },
    { value: 'text-3', label: 'Text 3' },
  ],
  descriptionLabel: 'Description',
  descriptionPlaceholder: 'Enter description here...',
  descriptionHelper: 'Maximum 500 characters.',
  notesLabel: 'Additional Notes',
  notesPlaceholder: 'Enter your notes here...',
  requestLabel: 'Request Type',
  requestOptions: [
    { value: 'new', label: 'New request', helper: 'Submit a request for the first time.' },
    { value: 'renewal', label: 'Renewal', helper: 'Renew a previous request.' },
    { value: 'update', label: 'Update information', helper: 'Modify details of an existing request.' },
  ],
  docsLabel: 'Attached Documents',
  docOptions: [
    { value: 'id', label: 'National ID copy' },
    { value: 'registration', label: 'Commercial registration' },
    { value: 'authorization', label: 'Authorization letter' },
  ],
  termsLabel: 'I agree to the terms and conditions',
  termsHelper: 'Please read the terms before proceeding.',
  back: 'Back',
  next: 'Next',
  feedbackQuestion: 'Was this page useful?',
  feedbackStats: '60% of users said Yes from 2843 Feedbacks',
  yes: 'Yes',
  no: 'No',
  footer: {
    groups: [
      {
        label: 'Summary',
        links: links(
          'About [Portal Name]',
          'Privacy & Terms of Use',
          'How to use [Portal Name]',
          'News & Events',
          'SLA Statistics',
        ),
      },
      {
        label: 'Important Links',
        links: links(
          'National Service Portal',
          'Open Government Data',
          'National Data & AI Strategy',
          'Open Data Portal',
          'E-Participation Portal',
        ),
      },
      {
        label: 'Contact & Support',
        links: links('Help Center', 'Contact Us', 'Share with Us', 'Submit Complaint', 'Report Corruption'),
      },
    ],
    socialTitle: 'Follow Us',
    social: SOCIAL,
    accessibilityTitle: 'Accessibility Tools',
    tools: [
      { label: 'Increase font size', icon: 'text-font' },
      { label: 'High contrast', icon: 'eye' },
      { label: 'Screen reader', icon: 'view' },
    ],
    legalLinks: links('Sitemap', 'RSS', 'Mobile App'),
    caption: 'All Right Reserved For Digital Government Authority © 2024',
    extraLinks: links('Terms and Conditions', 'Privacy Policy'),
    logos: [{ text: 'Platform Logo' }, { text: 'Platform Logo' }],
  },
};

let nextPreviewId = 0;

/** One full form page (stamp, header, tabs, stepper + form, feedback, footer) in one language. */
@Component({
  selector: 'demo-form-template-preview',
  imports: [
    ModDigitalStamp,
    ModNavHeader,
    ModServiceTabs,
    ModFormTemplate,
    ModFormTemplateSteps,
    ModFormTemplateBreadcrumb,
    ModFormTemplateActions,
    ModFormRow,
    ModFormFeedback,
    ModProgressIndicator,
    ModBreadcrumbs,
    ModTextInput,
    ModTextarea,
    ModDropdown,
    ModRadioGroup,
    ModRadio,
    ModCheckboxGroup,
    ModCheckbox,
    ModButton,
    ModFooter,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: block' },
  templateUrl: './form-template.page.html',
})
export class FormTemplatePreview {
  /** Copy of the page (labels, options, footer data). */
  readonly c = input.required<FormTemplateCopy>();
  /** Shows the longer field list of the original Arabic preview. */
  readonly full = input(false, { transform: booleanAttribute });

  protected readonly uid = `form-template-${nextPreviewId++}`;

  protected readonly activeTab = signal(0);
  protected readonly step = signal(2);
  protected readonly dropdownA = signal<string | string[] | null>('text');
  protected readonly dropdownB = signal<string | string[] | null>('text');
  protected readonly request = signal<string | null>('new');
  protected readonly docs = signal<string[]>(['id', 'authorization']);
  protected readonly terms = signal(false);

  protected back(): void {
    this.step.update((step) => Math.max(1, step - 1));
  }

  protected next(): void {
    this.step.update((step) => Math.min(this.c().steps.length, step + 1));
  }
}

@Component({
  selector: 'demo-form-template-page',
  imports: [FormTemplatePreview],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="content-header">
      <h1 class="content-title">Form Template</h1>
      <p class="content-description">
        Complete form page template with stepper navigation, input fields, feedback section, and footer. Based on
        Figma Node: 2-17874
      </p>
    </div>

    <!-- RTL Form Template Preview -->
    <div class="component-preview">
      <div class="component-preview-title">Form Template - RTL (Arabic)</div>
      <div [style]="previewStyle" dir="rtl" lang="ar">
        <demo-form-template-preview [c]="arabic" full />
      </div>
    </div>

    <!-- LTR Form Template Preview -->
    <div class="component-preview">
      <div class="component-preview-title">Form Template - LTR (English)</div>
      <div [style]="previewStyle" dir="ltr">
        <demo-form-template-preview [c]="english" />
      </div>
    </div>
  `,
})
export class FormTemplatePage {
  protected readonly arabic = ARABIC;
  protected readonly english = ENGLISH;

  /** The original .template-preview frame (a docs-page class, not part of the library CSS). */
  protected readonly previewStyle =
    'border: 1px solid var(--gray-200); border-radius: var(--radius-lg); overflow: hidden; background-color: var(--gray-50);';
}
