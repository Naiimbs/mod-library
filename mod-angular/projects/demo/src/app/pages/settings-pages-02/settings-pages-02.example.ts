import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ViewEncapsulation,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import {
  ModButton,
  ModDescriptionItem,
  ModDescriptionList,
  ModDropdown,
  ModDropdownOption,
  ModEmptyState,
  ModEmptyStateActions,
  ModIcon,
  ModInlineAlert,
  ModMenuSwitch,
  ModModal,
  ModModalActions,
  ModPageHeader,
  ModStatusTag,
  ModTable,
  ModTableCell,
  ModTableColumn,
  ModTableSort,
  ModTag,
  ModTextInput,
} from '@mod-internal/ui';
import { AppLang, AppNavId, Bi, HOSPITALS, SPECIALTIES, appNavLabel } from '../../shared/app-example/app-example-data';
import { AppExampleShell } from '../../shared/app-example/app-example-shell';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
/** The real phone rule: 8 to 15 digits, may start with +. */
const PHONE = /^\+?\d{8,15}$/;
const WEBSITE = /^https?:\/\/[^\s]+$/;
const CODE = /^[A-Z0-9_]{2,20}$/;
/** The real amount rule of the expenses rates: greater than zero, at most two decimals. */
const AMOUNT = /^\d{1,13}(\.\d{1,2})?$/;

const TEXT = {
  en: {
    title: 'Setup',
    subtitle: 'Hospital data, specialties, expenses rates and lookup lists.',
    sectionsLabel: 'Setup sections',
    sectionLabel: 'Section',
    unsavedTag: 'Unsaved',
    secDetails: 'Hospital data',
    secSpecialties: 'Specialties',
    secRates: 'Expenses rates',
    secLists: 'Lookup lists',
    number: 'Number',
    code: 'Code',
    type: 'Type',
    nameAr: 'Arabic name',
    nameEn: 'English name',
    region: 'Region',
    city: 'City',
    beds: 'Bed capacity',
    contact: 'Contact details',
    phone: 'Phone',
    fax: 'Fax',
    email: 'Email',
    website: 'Website',
    notProvided: 'Not provided',
    select: 'Please select',
    typeReferral: 'Referral hospital',
    typePeripheral: 'Peripheral hospital',
    active: 'Active',
    inactive: 'Inactive',
    edit: 'Edit',
    save: 'Save',
    cancel: 'Cancel',
    close: 'Close',
    saved: 'Saved',
    savedName: (name: string) => `Saved: ${name}`,
    required: 'This field is required.',
    numberInvalid: 'Enter a whole number greater than zero.',
    emailInvalid: 'Enter a valid email address.',
    phoneInvalid: 'Enter a phone number of 8 to 15 digits; it may start with +.',
    formatInvalid: 'The value is not in a valid format.',
    codeInvalid: 'The value is not valid.',
    codeDuplicate: 'This code is already in use.',
    fixErrors: 'Check the highlighted fields.',
    unsaved: 'You have unsaved changes.',
    discardTitle: 'Discard unsaved changes?',
    discardText: 'Your changes on this page will be lost.',
    discard: 'Discard',
    keep: 'Keep editing',
    dangerTitle: 'Danger zone',
    deactivate: 'Deactivate',
    reactivate: 'Reactivate',
    deactivateText: 'The hospital stays on old requests and is no longer offered for new routing. No data is deleted.',
    inactiveText: 'This hospital is inactive.',
    deactivateTitle: (name: string) => `Deactivate ${name}?`,
    deactivateBody: 'It stays on old requests and is no longer offered for new routing. No data is deleted.',
    onlyReferral: (region: string, n: number) =>
      `This is the only active referral hospital of ${region}. After the deactivation the region has no referral hospital for new referrals, and its ${n} peripheral hospital(s) cannot refer within the region. Running requests continue.`,
    deactivateYes: 'Yes, deactivate',
    specialty: 'Specialty',
    subspecialties: 'Subspecialties',
    available: 'Available',
    notAvailable: 'Not available',
    makeAvailable: 'Make available',
    makeUnavailable: 'Make unavailable',
    availabilityNote: 'The availability of a specialty for referral applies at once, with no approval.',
    addSpecialty: 'Add specialty',
    createSpecialty: 'Create specialty',
    specialtiesEmpty: 'No specialties found.',
    total: (n: number) => `Total: ${n}`,
    activeCount: (n: number) => `${n} active`,
    patientRate: 'Patient daily rate',
    companionRate: 'Companion daily rate',
    rateCategory: 'Rate',
    dailyAmount: 'Daily amount',
    newRate: 'New daily rate',
    status: 'Status',
    actions: 'Actions',
    isSet: 'Set',
    notSetYet: 'Not set yet',
    notSet: 'Not set',
    sar: 'SAR',
    perDay: 'day',
    lastChanged: 'Last changed',
    amountInvalid: 'Enter an amount greater than zero, with at most two decimals.',
    amountRequired: 'Enter the rate. A rate that is set cannot be cleared.',
    ratesSaved: 'The expenses rates were saved.',
    claimNote:
      'The medical coordinator enters the days and the companions only. When the patient rate is not set, or there are companions and the companion rate is not set, the claim is refused.',
    listsSubtitle: (m: number, f: number) => `${m} lists managed by the administration · ${f} fixed lists`,
    orderNote: 'The active values are offered on the referral forms in their display order.',
    groupManaged: 'Lists managed by the administration',
    groupFixed: 'Fixed lists (read only)',
    readOnly: 'Read only',
    addValue: 'Add value',
    saveValue: 'Save value',
    otherTitle: 'This screen is not part of the example',
    otherText: 'The example shows the hospital data, the specialties, the expenses rates and the lookup lists. Choose one of them in the side bar to go back.',
    back: 'Back to the hospital data',
  },
  ar: {
    title: 'الإعداد',
    subtitle: 'بيانات المستشفى والتخصصات وقيمه النفقات والقوائم المرجعية.',
    sectionsLabel: 'أقسام الإعداد',
    sectionLabel: 'القسم',
    unsavedTag: 'غير محفوظ',
    secDetails: 'بيانات المستشفى',
    secSpecialties: 'التخصصات',
    secRates: 'قيمه النفقات',
    secLists: 'القوائم المرجعية',
    number: 'الرقم',
    code: 'الرمز',
    type: 'النوع',
    nameAr: 'الاسم بالعربية',
    nameEn: 'الاسم بالإنجليزية',
    region: 'المنطقة',
    city: 'المدينة',
    beds: 'الطاقة السريرية',
    contact: 'بيانات الاتصال',
    phone: 'الهاتف',
    fax: 'الفاكس',
    email: 'البريد الإلكتروني',
    website: 'الموقع الإلكتروني',
    notProvided: 'غير مدخل',
    select: 'الرجاء اختيار',
    typeReferral: 'مستشفى مرجعي',
    typePeripheral: 'مستشفى طرفي',
    active: 'فعّال',
    inactive: 'غير فعّال',
    edit: 'تعديل',
    save: 'حفظ',
    cancel: 'إلغاء',
    close: 'إغلاق',
    saved: 'تم الحفظ',
    savedName: (name: string) => `تم الحفظ: ${name}`,
    required: 'هذا الحقل مطلوب.',
    numberInvalid: 'أدخل عددًا صحيحًا أكبر من صفر.',
    emailInvalid: 'أدخل عنوان بريد إلكتروني صحيحاً.',
    phoneInvalid: 'أدخل رقم هاتف من 8 إلى 15 رقمًا، ويمكن أن يبدأ بعلامة +.',
    formatInvalid: 'صيغة القيمة غير صحيحة.',
    codeInvalid: 'القيمة غير صالحة.',
    codeDuplicate: 'هذا الرمز مستخدم من قبل.',
    fixErrors: 'راجع الحقول المحددة.',
    unsaved: 'لديك تغييرات غير محفوظة.',
    discardTitle: 'تجاهل التغييرات غير المحفوظة؟',
    discardText: 'ستفقد التغييرات التي أجريتها في هذه الصفحة.',
    discard: 'تجاهل',
    keep: 'متابعة التعديل',
    dangerTitle: 'منطقة الخطر',
    deactivate: 'إلغاء التفعيل',
    reactivate: 'إعادة التفعيل',
    deactivateText: 'يبقى المستشفى على الطلبات القديمة ولا يُعرض للتوجيه الجديد. لا يتم حذف أي بيانات.',
    inactiveText: 'هذا المستشفى غير فعّال.',
    deactivateTitle: (name: string) => `هل تريد إلغاء تفعيل ${name}؟`,
    deactivateBody: 'يبقى على الطلبات القديمة ولا يُعرض للتوجيه الجديد. لا يتم حذف أي بيانات.',
    onlyReferral: (region: string, n: number) =>
      `هذا هو المستشفى المرجعي النشط الوحيد في ${region}. بعد إلغاء التفعيل لا يبقى في المنطقة مستشفى مرجعي للإحالات الجديدة، ولا تستطيع مستشفياتها الطرفية (${n}) الإحالة داخل المنطقة. تستمر الطلبات الجارية.`,
    deactivateYes: 'نعم، إلغاء التفعيل',
    specialty: 'التخصص',
    subspecialties: 'التخصصات الفرعية',
    available: 'متاح',
    notAvailable: 'غير متاح',
    makeAvailable: 'جعله متاحًا',
    makeUnavailable: 'جعله غير متاح',
    availabilityNote: 'تُطبق إتاحة التخصص للإحالة فورًا، دون موافقة.',
    addSpecialty: 'إضافة تخصص',
    createSpecialty: 'إنشاء التخصص',
    specialtiesEmpty: 'لا توجد تخصصات.',
    total: (n: number) => `الإجمالي: ${n}`,
    activeCount: (n: number) => `المفعّل منها ${n}`,
    patientRate: 'السعر اليومي للمريض',
    companionRate: 'السعر اليومي للمرافق',
    rateCategory: 'السعر',
    dailyAmount: 'المبلغ اليومي',
    newRate: 'السعر اليومي الجديد',
    status: 'الحالة',
    actions: 'الإجراءات',
    isSet: 'مُحدَّد',
    notSetYet: 'لم يُحدَّد بعد',
    notSet: 'غير محدد',
    sar: 'ر.س',
    perDay: 'يوم',
    lastChanged: 'آخر تعديل',
    amountInvalid: 'أدخل مبلغًا أكبر من صفر، وبحد أقصى منزلتين عشريتين.',
    amountRequired: 'أدخل المبلغ. لا يمكن مسح مبلغ سبق تحديده.',
    ratesSaved: 'تم حفظ قيمه النفقات.',
    claimNote:
      'المنسق الطبي يُدخل عدد الأيام والمرافقين فقط. إذا لم يُحدَّد سعر المريض، أو كان هناك مرافقون ولم يُحدَّد سعر المرافق، تُرفض المطالبة.',
    listsSubtitle: (m: number, f: number) => `${m} قوائم تديرها الإدارة · ${f} قوائم ثابتة`,
    orderNote: 'تظهر القيم الفعّالة في نماذج الإحالة بحسب ترتيب العرض.',
    groupManaged: 'قوائم تديرها الإدارة',
    groupFixed: 'قوائم ثابتة (للعرض فقط)',
    readOnly: 'للعرض فقط',
    addValue: 'إضافة قيمة',
    saveValue: 'حفظ القيمة',
    otherTitle: 'هذه الشاشة ليست ضمن المثال',
    otherText: 'يعرض المثال بيانات المستشفى والتخصصات وقيمه النفقات والقوائم المرجعية. اختر أحدها من القائمة الجانبية للعودة.',
    back: 'العودة إلى بيانات المستشفى',
  },
} as const;

type NoticeKey = 'saved' | 'ratesSaved' | 'fixErrors';

interface Notice {
  variant: 'success' | 'error';
  key: NoticeKey;
  /** With `saved`: the record that was saved ("Saved: Cardiology"). */
  name?: Bi;
}

type Busy = '' | 'details' | 'rates' | 'deactivate' | 'add';

// --- Sections (each one is also a side bar item of the general admin) ---
type SectionId = 'details' | 'specialties' | 'rates' | 'lists';

const SECTIONS: readonly { id: SectionId; nav: AppNavId; icon: string; label: 'secDetails' | 'secSpecialties' | 'secRates' | 'secLists' }[] = [
  { id: 'details', nav: 'hospitals', icon: 'hospital-01', label: 'secDetails' },
  { id: 'specialties', nav: 'specialties', icon: 'stethoscope', label: 'secSpecialties' },
  { id: 'rates', nav: 'expense-rates', icon: 'coins-01', label: 'secRates' },
  { id: 'lists', nav: 'lookups', icon: 'tags', label: 'secLists' },
];

// --- Hospital data ---
const REGIONS = {
  RIYADH: { en: 'Riyadh Region', ar: 'منطقة الرياض' },
  MAKKAH: { en: 'Makkah Region', ar: 'منطقة مكة المكرمة' },
  EASTERN: { en: 'Eastern Region', ar: 'المنطقة الشرقية' },
} as const satisfies Record<string, Bi>;

type RegionCode = keyof typeof REGIONS;

const CITIES = {
  RUH: { en: 'Riyadh', ar: 'الرياض', region: 'RIYADH' },
  KHJ: { en: 'Al Kharj', ar: 'الخرج', region: 'RIYADH' },
  JED: { en: 'Jeddah', ar: 'جدة', region: 'MAKKAH' },
  TIF: { en: 'Taif', ar: 'الطائف', region: 'MAKKAH' },
  DHA: { en: 'Dhahran', ar: 'الظهران', region: 'EASTERN' },
  JUB: { en: 'Jubail', ar: 'الجبيل', region: 'EASTERN' },
} as const satisfies Record<string, Bi & { region: RegionCode }>;

type CityCode = keyof typeof CITIES;
type HospitalType = 'REFERRAL' | 'PERIPHERAL';

interface Details {
  nameAr: string;
  nameEn: string;
  type: HospitalType;
  region: RegionCode;
  city: CityCode | null;
  beds: string;
  phone: string;
  fax: string;
  email: string;
  website: string;
}

/** The hospital is one of the real system's reference data; the contact details and the capacity are invented. */
const DETAILS: Details = {
  nameAr: HOSPITALS.RCH.ar,
  nameEn: HOSPITALS.RCH.en,
  type: 'REFERRAL',
  region: 'RIYADH',
  city: 'RUH',
  beds: '1192',
  phone: '0115550100',
  fax: '',
  email: 'referrals@hospital.example',
  website: 'https://hospital.example',
};

const DETAIL_KEYS = Object.keys(DETAILS) as (keyof Details)[];

// --- Specialties ---
interface Specialty {
  code: string;
  name: Bi;
  subs: number;
  available: boolean;
}

const SUB_COUNTS: Record<string, number> = { CARD: 6, ORTHO: 5, NEURO: 4, NSURG: 3, ONC: 7, IM: 9, GS: 6, PED: 8, URO: 3, OPHTH: 4 };

const SPECIALTY_LIST: Specialty[] = Object.entries(SPECIALTIES).map(([code, name]) => ({
  code,
  name,
  subs: SUB_COUNTS[code] ?? 0,
  available: code !== 'PED' && code !== 'OPHTH',
}));

interface SpecialtyRow {
  code: string;
  name: string;
  subs: number;
  available: boolean;
}

// --- Expenses rates ---
type RateId = 'patient' | 'companion';
const RATE_IDS: readonly RateId[] = ['patient', 'companion'];

/** A stored rate: the amount ('' = not set). */
interface Rate {
  amount: string;
}

interface RateDraft {
  amount: string;
}

const RATES: Record<RateId, Rate> = {
  patient: { amount: '150.00' },
  companion: { amount: '' },
};

interface RateRow {
  id: RateId;
  label: string;
  amountText: string;
  isSet: boolean;
}

function toIso(date: Date | null): string {
  if (!date) return '';
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

function fromIso(iso: string): Date | null {
  return iso ? new Date(`${iso}T00:00:00`) : null;
}

function draftOf(rate: Rate): RateDraft {
  return { amount: rate.amount };
}

function sameRate(draft: RateDraft, rate: Rate): boolean {
  return draft.amount.trim() === rate.amount;
}

// --- Lookup lists (the real lists; the counts are sample figures) ---
interface LookupList {
  code: string;
  name: Bi;
  managed: boolean;
  values: number;
  active: number;
}

const LOOKUPS: readonly LookupList[] = [
  { code: 'REFERRAL_REASON', name: { en: 'Referral reasons', ar: 'أسباب الإحالة' }, managed: true, values: 12, active: 11 },
  { code: 'REJECTION_REASON', name: { en: 'Rejection reasons', ar: 'أسباب الرفض' }, managed: true, values: 9, active: 9 },
  { code: 'NATIONALITY', name: { en: 'Nationalities', ar: 'الجنسيات' }, managed: true, values: 196, active: 196 },
  { code: 'ELIGIBILITY_CODE', name: { en: 'Eligibility codes', ar: 'رموز الأهلية' }, managed: true, values: 14, active: 13 },
  { code: 'AIRWAY', name: { en: 'Airway (air evacuation)', ar: 'مجرى الهواء (الإخلاء الجوي)' }, managed: true, values: 4, active: 4 },
  { code: 'CONSCIOUSNESS', name: { en: 'Level of consciousness (air evacuation)', ar: 'مستوى الوعي (الإخلاء الجوي)' }, managed: true, values: 4, active: 4 },
  { code: 'CASE_TYPE', name: { en: 'Case types', ar: 'أنواع الحالات' }, managed: false, values: 3, active: 3 },
  { code: 'REQUIRED_SERVICE', name: { en: 'Required services', ar: 'الخدمات المطلوبة' }, managed: false, values: 3, active: 3 },
  { code: 'PRIORITY', name: { en: 'Priorities', ar: 'الأولويات' }, managed: false, values: 3, active: 3 },
  { code: 'PATIENT_CONDITION', name: { en: 'Patient conditions', ar: 'حالات المريض' }, managed: false, values: 4, active: 4 },
  { code: 'GENDER', name: { en: 'Gender', ar: 'الجنس' }, managed: false, values: 2, active: 2 },
  { code: 'HOSPITAL_TYPE', name: { en: 'Hospital types', ar: 'أنواع المستشفيات' }, managed: false, values: 2, active: 2 },
];

interface LookupCard {
  code: string;
  name: string;
  values: number;
  active: number;
}

/** The "add" dialog serves the specialties and the values of a managed list. */
interface AddForm {
  code: string;
  nameAr: string;
  nameEn: string;
}

const EMPTY_ADD: AddForm = { code: '', nameAr: '', nameEn: '' };

function hasError(errors: Record<string, string>): boolean {
  return Object.values(errors).some((message) => message !== '');
}

/**
 * Settings pages 02: the setup of the general admin, adapted from a hospital referral
 * portal: the hospital data (hospital detail / form), the specialties
 * with their availability for referral, the expenses rates and the lookup
 * lists, behind one secondary navigation inside the page.
 *
 * Demo behaviour: the sections follow the side bar items Hospitals,
 * Specialties, Expenses rates and Lookup lists; drafts are kept while moving
 * between sections (an "Unsaved" tag marks them); saves show a short busy
 * state and then a status message; deactivating the hospital asks first.
 */
@Component({
  selector: 'demo-settings-pages-02',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  imports: [
    AppExampleShell,
    ModPageHeader,
    ModDescriptionList,
    ModDescriptionItem,
    ModTextInput,
    ModDropdown,
      ModTable,
    ModTableCell,
    ModMenuSwitch,
    ModStatusTag,
    ModTag,
    ModButton,
    ModIcon,
    ModInlineAlert,
    ModModal,
    ModModalActions,
    ModEmptyState,
    ModEmptyStateActions,
  ],
  template: `
    <demo-app-example-shell [lang]="lang()" role="admin" [(activeId)]="page" (languageToggle)="languageToggle.emit()">
      @if (section(); as current) {
        <mod-page-header [heading]="t().title" [description]="t().subtitle" />

        <div class="set02-layout">
          <nav class="set02-nav" [attr.aria-label]="t().sectionsLabel">
            <ul>
              @for (item of sections(); track item.id) {
                <li>
                  <button
                    type="button"
                    class="set02-nav__item"
                    [attr.aria-current]="current === item.id ? 'page' : null"
                    (click)="go(item.id)"
                  >
                    <mod-icon [name]="item.icon" />
                    <span class="set02-nav__label">{{ item.label }}</span>
                    @if (item.unsaved) {
                      <mod-tag size="xs" variant="warning">{{ t().unsavedTag }}</mod-tag>
                    }
                  </button>
                </li>
              }
            </ul>
          </nav>

          <div class="set02-picker">
            <mod-dropdown [label]="t().sectionLabel" [options]="sectionOptions()" [value]="current" (valueChange)="pickSection($event)" />
          </div>

          <div class="app-ex-stack set02-content">
            @if (notice(); as message) {
              <mod-inline-alert
                colored
                dismissible
                [variant]="message.variant"
                [heading]="noticeText()"
                [closeLabel]="t().close"
                (dismissed)="notice.set(null)"
              />
            }

            @switch (current) {
              @case ('details') {
                <section class="app-ex-panel" aria-labelledby="set02-details">
                  <div class="app-ex-panel__head">
                    <div class="set02-heading">
                      <h2 class="app-ex-panel__title" id="set02-details">{{ hospitalName() }}</h2>
                      <mod-status-tag size="sm" [variant]="active() ? 'success' : 'neutral'">
                        {{ active() ? t().active : t().inactive }}
                      </mod-status-tag>
                    </div>
                    @if (!editing()) {
                      <button mod-button variant="secondary-outline" size="small" type="button" (click)="startEdit()">
                        <mod-icon name="pencil-edit-02" /> {{ t().edit }}
                      </button>
                    }
                  </div>

                  @if (editing()) {
                    <div class="app-ex-panel__body set02-form">
                      <div class="set02-grid">
                        <mod-text-input
                          required
                          [label]="t().nameAr"
                          [value]="draft().nameAr"
                          [error]="!!detailErrors().nameAr"
                          [helperText]="detailErrors().nameAr"
                          (valueChange)="patchDraft('nameAr', $event)"
                        />
                        <mod-text-input
                          required
                          [label]="t().nameEn"
                          [value]="draft().nameEn"
                          [error]="!!detailErrors().nameEn"
                          [helperText]="detailErrors().nameEn"
                          (valueChange)="patchDraft('nameEn', $event)"
                        />
                        <mod-dropdown [label]="t().type" [options]="typeOptions()" [value]="draft().type" (valueChange)="setType($event)" />
                        <mod-text-input
                          required
                          inputMode="numeric"
                          [label]="t().beds"
                          [value]="draft().beds"
                          [error]="!!detailErrors().beds"
                          [helperText]="detailErrors().beds"
                          (valueChange)="patchDraft('beds', $event)"
                        />
                        <mod-dropdown [label]="t().region" [options]="regionOptions()" [value]="draft().region" (valueChange)="setRegion($event)" />
                        <div>
                          <mod-dropdown
                            [label]="t().city"
                            [placeholder]="t().select"
                            [options]="cityOptions()"
                            [value]="draft().city"
                            [error]="!!detailErrors().city"
                            (valueChange)="setCity($event)"
                          />
                          @if (detailErrors().city) {
                            <p class="set02-error" role="alert">{{ detailErrors().city }}</p>
                          }
                        </div>
                      </div>

                      <h3 class="set02-subtitle">{{ t().contact }}</h3>
                      <div class="set02-grid">
                        <mod-text-input
                          optional
                          type="tel"
                          inputMode="tel"
                          leadingIcon="call"
                          [label]="t().phone"
                          [value]="draft().phone"
                          [error]="!!detailErrors().phone"
                          [helperText]="detailErrors().phone"
                          (valueChange)="patchDraft('phone', $event)"
                        />
                        <mod-text-input
                          optional
                          type="tel"
                          inputMode="tel"
                          [label]="t().fax"
                          [value]="draft().fax"
                          [error]="!!detailErrors().fax"
                          [helperText]="detailErrors().fax"
                          (valueChange)="patchDraft('fax', $event)"
                        />
                        <mod-text-input
                          optional
                          type="email"
                          leadingIcon="mail-01"
                          [label]="t().email"
                          [value]="draft().email"
                          [error]="!!detailErrors().email"
                          [helperText]="detailErrors().email"
                          (valueChange)="patchDraft('email', $event)"
                        />
                        <mod-text-input
                          optional
                          type="url"
                          placeholder="https://"
                          [label]="t().website"
                          [value]="draft().website"
                          [error]="!!detailErrors().website"
                          [helperText]="detailErrors().website"
                          (valueChange)="patchDraft('website', $event)"
                        />
                      </div>

                      <div class="set02-actions">
                        <span class="set02-actions__state" role="status">
                          @if (detailsDirty()) {
                            <mod-icon name="alert-02" /> {{ t().unsaved }}
                          }
                        </span>
                        <button mod-button variant="secondary-outline" size="medium" type="button" [disabled]="busy() !== ''" (click)="cancelEdit()">
                          {{ t().cancel }}
                        </button>
                        <button
                          mod-button
                          size="medium"
                          type="button"
                          [loading]="busy() === 'details'"
                          [disabled]="!detailsDirty() || busy() !== ''"
                          (click)="saveDetails()"
                        >
                          {{ t().save }}
                        </button>
                      </div>
                    </div>
                  } @else {
                    <div class="app-ex-panel__body set02-form">
                      <mod-description-list columns="3" [aria-label]="t().secDetails">
                        <mod-description-item [label]="t().number" value="1" />
                        <mod-description-item [label]="t().code" value="RCH" />
                        <mod-description-item [label]="t().type" [value]="typeLabel()" />
                        <mod-description-item [label]="t().nameAr"><bdi dir="rtl">{{ details().nameAr }}</bdi></mod-description-item>
                        <mod-description-item [label]="t().nameEn"><bdi dir="ltr">{{ details().nameEn }}</bdi></mod-description-item>
                        <mod-description-item [label]="t().beds" [value]="details().beds" />
                        <mod-description-item [label]="t().region" [value]="regionLabel()" />
                        <mod-description-item [label]="t().city" [value]="cityLabel()" />
                      </mod-description-list>

                      <h3 class="set02-subtitle">{{ t().contact }}</h3>
                      <mod-description-list columns="3" [aria-label]="t().contact">
                        <mod-description-item [label]="t().phone"><bdi dir="ltr">{{ details().phone || t().notProvided }}</bdi></mod-description-item>
                        <mod-description-item [label]="t().fax"><bdi dir="ltr">{{ details().fax || t().notProvided }}</bdi></mod-description-item>
                        <mod-description-item [label]="t().email"><bdi dir="ltr">{{ details().email || t().notProvided }}</bdi></mod-description-item>
                        <mod-description-item [label]="t().website"><bdi dir="ltr">{{ details().website || t().notProvided }}</bdi></mod-description-item>
                      </mod-description-list>
                    </div>
                  }
                </section>

                <section class="app-ex-panel set02-danger" aria-labelledby="set02-danger">
                  <div class="app-ex-panel__head">
                    <h2 class="app-ex-panel__title" id="set02-danger">
                      <mod-icon name="alert-02" /> {{ t().dangerTitle }}
                    </h2>
                  </div>
                  <div class="app-ex-panel__body set02-danger__body">
                    <div>
                      <h3 class="set02-subtitle">{{ active() ? t().deactivate : t().reactivate }}</h3>
                      <p class="set02-text">{{ active() ? t().deactivateText : t().inactiveText }}</p>
                    </div>
                    @if (active()) {
                      <button mod-button destructive variant="secondary-outline" size="medium" type="button" (click)="deactivateOpen.set(true)">
                        {{ t().deactivate }}
                      </button>
                    } @else {
                      <button mod-button variant="secondary-outline" size="medium" type="button" (click)="reactivate()">
                        {{ t().reactivate }}
                      </button>
                    }
                  </div>
                </section>
              }

              @case ('specialties') {
                <section class="app-ex-panel app-ex-panel--flush" aria-labelledby="set02-specialties">
                  <div class="app-ex-panel__head">
                    <div>
                      <h2 class="app-ex-panel__title" id="set02-specialties">{{ t().secSpecialties }}</h2>
                      <p class="app-ex-panel__meta">{{ t().total(specialtyRows().length) }} · {{ t().availabilityNote }}</p>
                    </div>
                    <button mod-button size="small" type="button" (click)="openAdd('specialty')">
                      <mod-icon name="add-01" /> {{ t().addSpecialty }}
                    </button>
                  </div>
                  <div class="app-ex-panel__body">
                    <mod-table
                      density="compact"
                      [label]="t().secSpecialties"
                      [columns]="specialtyColumns()"
                      [rows]="specialtyRows()"
                      [rowKey]="specialtyKey"
                      [(sort)]="specialtySort"
                      [emptyText]="t().specialtiesEmpty"
                    >
                      <ng-template modTableCell="available" let-row>
                        <span class="set02-switch">
                          <mod-menu-switch
                            [checked]="row.available"
                            [aria-label]="(row.available ? t().makeUnavailable : t().makeAvailable) + ': ' + row.name"
                            (checkedChange)="setAvailable(row.code, $event)"
                          />
                          <span aria-hidden="true">{{ row.available ? t().available : t().notAvailable }}</span>
                        </span>
                      </ng-template>
                    </mod-table>
                  </div>
                </section>
              }

              @case ('rates') {
                <mod-inline-alert variant="info" [message]="t().claimNote" />

                @if (ratesDirty()) {
                  <mod-inline-alert variant="warning" colored [heading]="t().unsaved" />
                }

                <section class="app-ex-panel app-ex-panel--flush set02-rates" aria-labelledby="set02-rates">
                  <div class="app-ex-panel__head">
                    <div>
                      <h2 class="app-ex-panel__title" id="set02-rates">{{ t().secRates }}</h2>
                      <p class="app-ex-panel__meta">{{ t().lastChanged }}: <bdi>{{ lastChangedText() }}</bdi></p>
                    </div>
                  </div>
                  <div class="app-ex-panel__body">
                    <mod-table [label]="t().secRates" [columns]="rateColumns()" [rows]="rateRows()" [rowKey]="rateKey">
                      <ng-template modTableCell="amount" let-row>
                        @if (rateEditingOf(row.id)) {
                          <mod-text-input
                            class="set02-amount"
                            size="medium"
                            inputMode="decimal"
                            [ariaLabel]="t().newRate + ': ' + row.label"
                            [suffix]="t().sar"
                            [value]="rateDraftOf(row.id).amount"
                            [error]="!!rateErrorOf(row.id).amount"
                            [helperText]="rateErrorOf(row.id).amount"
                            (valueChange)="setRateAmount(row.id, $event)"
                          />
                        } @else {
                          <bdi>{{ row.amountText }}</bdi>
                        }
                      </ng-template>
                      <ng-template modTableCell="status" let-row>
                        <mod-status-tag size="sm" [variant]="row.isSet ? 'success' : 'neutral'">
                          {{ row.isSet ? t().isSet : t().notSetYet }}
                        </mod-status-tag>
                      </ng-template>
                      <ng-template modTableCell="actions" let-row>
                        @if (rateEditingOf(row.id)) {
                          <button
                            mod-button
                            variant="subtle"
                            size="small"
                            type="button"
                            [attr.aria-label]="t().cancel + ': ' + row.label"
                            [disabled]="busy() !== ''"
                            (click)="cancelRate(row.id)"
                          >
                            <mod-icon name="cancel-01" /> {{ t().cancel }}
                          </button>
                        } @else {
                          <button
                            mod-button
                            variant="subtle"
                            size="small"
                            type="button"
                            [attr.aria-label]="t().edit + ': ' + row.label"
                            [disabled]="busy() !== ''"
                            (click)="editRate(row.id)"
                          >
                            <mod-icon name="pencil-edit-02" /> {{ t().edit }}
                          </button>
                        }
                      </ng-template>
                    </mod-table>
                  </div>
                  <div class="set02-actions set02-actions--bar">
                    <span class="set02-actions__state"></span>
                    <button mod-button variant="secondary-outline" size="medium" type="button" [disabled]="!ratesOpen() || busy() !== ''" (click)="discardRates()">
                      {{ t().discard }}
                    </button>
                    <button
                      mod-button
                      size="medium"
                      type="button"
                      [loading]="busy() === 'rates'"
                      [disabled]="!ratesDirty() || busy() !== ''"
                      (click)="saveRates()"
                    >
                      {{ t().save }}
                    </button>
                  </div>
                </section>
              }

              @case ('lists') {
                <section class="app-ex-panel" aria-labelledby="set02-lists">
                  <div class="app-ex-panel__head">
                    <div>
                      <h2 class="app-ex-panel__title" id="set02-lists">{{ t().secLists }}</h2>
                      <p class="app-ex-panel__meta">{{ t().listsSubtitle(managedLists().length, fixedLists().length) }}</p>
                    </div>
                  </div>
                  <div class="app-ex-panel__body set02-form">
                    <p class="set02-text">{{ t().orderNote }}</p>

                    <h3 class="set02-subtitle" id="set02-managed">{{ t().groupManaged }}</h3>
                    <ul class="set02-cards" aria-labelledby="set02-managed">
                      @for (list of managedLists(); track list.code) {
                        <li class="set02-card">
                          <h4 class="set02-card__title">{{ list.name }}</h4>
                          <p class="set02-card__meta">{{ t().total(list.values) }} · {{ t().activeCount(list.active) }}</p>
                          <button
                            mod-button
                            variant="secondary-outline"
                            size="small"
                            type="button"
                            [attr.aria-label]="t().addValue + ': ' + list.name"
                            (click)="openAdd(list.code)"
                          >
                            <mod-icon name="add-01" /> {{ t().addValue }}
                          </button>
                        </li>
                      }
                    </ul>

                    <h3 class="set02-subtitle" id="set02-fixed">{{ t().groupFixed }}</h3>
                    <ul class="set02-cards" aria-labelledby="set02-fixed">
                      @for (list of fixedLists(); track list.code) {
                        <li class="set02-card">
                          <h4 class="set02-card__title">{{ list.name }}</h4>
                          <p class="set02-card__meta">{{ t().total(list.values) }}</p>
                          <mod-tag size="xs" variant="neutral" icon="square-lock-02">{{ t().readOnly }}</mod-tag>
                        </li>
                      }
                    </ul>
                  </div>
                </section>
              }
            }
          </div>
        </div>
      } @else {
        <mod-page-header [heading]="otherTitle()" />
        <mod-empty-state bordered icon="settings-01" [level]="2" [heading]="t().otherTitle" [text]="t().otherText">
          <button modEmptyStateActions mod-button size="medium" type="button" (click)="page.set('hospitals')">
            {{ t().back }}
          </button>
        </mod-empty-state>
      }
    </demo-app-example-shell>

    <!-- Add a specialty, or a value of a managed list -->
    <mod-modal [(open)]="addOpen" [heading]="addHeading()" [description]="addDescription()" [closeLabel]="t().close">
      <div class="set02-modal-form">
        <mod-text-input
          required
          [label]="t().code"
          [value]="addForm().code"
          [error]="!!addErrors().code"
          [helperText]="addErrors().code"
          (valueChange)="patchAdd('code', $event.toUpperCase())"
        />
        <mod-text-input
          required
          [label]="t().nameAr"
          [value]="addForm().nameAr"
          [error]="!!addErrors().nameAr"
          [helperText]="addErrors().nameAr"
          (valueChange)="patchAdd('nameAr', $event)"
        />
        <mod-text-input
          required
          [label]="t().nameEn"
          [value]="addForm().nameEn"
          [error]="!!addErrors().nameEn"
          [helperText]="addErrors().nameEn"
          (valueChange)="patchAdd('nameEn', $event)"
        />
      </div>
      <mod-modal-actions>
        <button mod-button variant="secondary-outline" size="medium" type="button" [disabled]="busy() !== ''" (click)="addOpen.set(false)">
          {{ t().cancel }}
        </button>
        <button mod-button size="medium" type="button" [loading]="busy() === 'add'" [disabled]="busy() !== ''" (click)="submitAdd()">
          {{ addTarget() === 'specialty' ? t().createSpecialty : t().saveValue }}
        </button>
      </mod-modal-actions>
    </mod-modal>

    <!-- Leave the edit mode with unsaved changes -->
    <mod-modal
      icon="alert-02"
      iconColor="warning"
      [(open)]="discardOpen"
      [heading]="t().discardTitle"
      [description]="t().discardText"
      [closeLabel]="t().close"
    >
      <mod-modal-actions>
        <button mod-button variant="secondary-outline" size="medium" type="button" (click)="discardOpen.set(false)">
          {{ t().keep }}
        </button>
        <button mod-button destructive size="medium" type="button" (click)="discardEdit()">{{ t().discard }}</button>
      </mod-modal-actions>
    </mod-modal>

    <!-- Danger zone: deactivate the hospital -->
    <mod-modal
      icon="alert-02"
      iconColor="error"
      [(open)]="deactivateOpen"
      [heading]="t().deactivateTitle(hospitalName())"
      [description]="t().deactivateBody"
      [closeLabel]="t().close"
    >
      @if (details().type === 'REFERRAL') {
        <mod-inline-alert variant="warning" colored [message]="t().onlyReferral(regionLabel(), 2)" />
      }
      <mod-modal-actions>
        <button mod-button variant="secondary-outline" size="medium" type="button" [disabled]="busy() !== ''" (click)="deactivateOpen.set(false)">
          {{ t().cancel }}
        </button>
        <button
          mod-button
          destructive
          size="medium"
          type="button"
          [loading]="busy() === 'deactivate'"
          [disabled]="busy() !== ''"
          (click)="deactivate()"
        >
          {{ t().deactivateYes }}
        </button>
      </mod-modal-actions>
    </mod-modal>
  `,
  styles: `
    demo-settings-pages-02 {
      display: block;
    }

    /* Secondary navigation on the start side, the section on the end side. */
    .set02-layout {
      display: grid;
      grid-template-columns: 208px minmax(0, 1fr);
      gap: var(--spacing-3xl);
      align-items: start;
    }

    .set02-nav ul {
      display: grid;
      gap: var(--spacing-xs);
      margin: 0;
      padding: 0;
      list-style: none;
    }

    .set02-nav__item {
      display: flex;
      align-items: center;
      gap: var(--spacing-md);
      width: 100%;
      min-height: 40px;
      padding: var(--spacing-md) var(--spacing-lg);
      border: 0;
      border-inline-start: 3px solid transparent;
      border-radius: var(--radius-sm);
      background: transparent;
      font: inherit;
      font-size: 14px;
      line-height: 20px;
      font-weight: var(--font-weight-medium);
      color: var(--gray-700);
      text-align: start;
      cursor: pointer;
    }

    .set02-nav__item mod-icon {
      font-size: 20px;
    }

    .set02-nav__label {
      flex: 1;
      min-width: 0;
    }

    .set02-nav__item:hover {
      background: var(--gray-100);
      color: var(--gray-900);
    }

    .set02-nav__item[aria-current='page'] {
      border-inline-start-color: var(--sa-600);
      background: var(--gray-100);
      color: var(--gray-900);
      font-weight: var(--font-weight-semibold);
    }

    .set02-nav__item:focus-visible {
      outline: 2px solid var(--border-black);
      outline-offset: 2px;
    }

    .set02-picker {
      display: none;
    }

    .set02-content {
      min-width: 0;
    }

    .set02-heading {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: var(--spacing-md) var(--spacing-lg);
      min-width: 0;
    }

    .set02-form {
      display: grid;
      grid-template-columns: minmax(0, 1fr);
      gap: var(--spacing-2xl);
    }

    .set02-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: var(--spacing-2xl);
      align-items: start;
    }

    .set02-subtitle {
      margin: 0;
      font-size: 14px;
      line-height: 20px;
      font-weight: var(--font-weight-semibold);
      color: var(--gray-900);
    }

    .set02-text {
      margin: var(--spacing-xs) 0 0;
      font-size: 14px;
      line-height: 22px;
      color: var(--gray-600);
    }

    .set02-error {
      margin: var(--spacing-sm) 0 0;
      font-size: 13px;
      line-height: 20px;
      color: var(--error-600);
    }

    .set02-actions {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: var(--spacing-md);
      padding-block-start: var(--spacing-xl);
      border-block-start: 1px solid var(--gray-200);
    }

    .set02-actions--bar {
      padding: var(--spacing-xl) var(--spacing-2xl);
    }

    .set02-actions__state {
      flex: 1;
      display: flex;
      align-items: center;
      gap: var(--spacing-md);
      min-width: 0;
      font-size: 14px;
      line-height: 20px;
      color: var(--gray-700);
    }

    .set02-actions__state mod-icon {
      font-size: 18px;
      color: var(--warning-600);
    }

    /* Danger zone */
    .set02-danger {
      border-color: var(--error-500);
    }

    .set02-danger .app-ex-panel__title {
      display: flex;
      align-items: center;
      gap: var(--spacing-md);
    }

    .set02-danger .app-ex-panel__title mod-icon {
      font-size: 20px;
      color: var(--error-600);
    }

    .set02-danger__body {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: var(--spacing-xl) var(--spacing-3xl);
    }

    .set02-danger__body > div {
      flex: 1 1 320px;
      min-width: 0;
    }

    .set02-switch {
      display: inline-flex;
      align-items: center;
      gap: var(--spacing-md);
      font-size: 13px;
      line-height: 20px;
      color: var(--gray-600);
      white-space: nowrap;
    }

    /* Expenses rates: fields inside the table cells. */
    .set02-amount {
      display: block;
      min-width: 150px;
      max-width: 200px;
    }

    /* Lookup lists */
    .set02-cards {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
      gap: var(--spacing-xl);
      margin: 0;
      padding: 0;
      list-style: none;
    }

    .set02-card {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: var(--spacing-md);
      min-width: 0;
      padding: var(--spacing-xl);
      border: 1px solid var(--gray-200);
      border-radius: var(--radius-md);
      background: var(--alpha-white);
    }

    .set02-card__title {
      margin: 0;
      font-size: 14px;
      line-height: 20px;
      font-weight: var(--font-weight-semibold);
      color: var(--gray-900);
    }

    .set02-card__meta {
      flex: 1;
      margin: 0;
      font-size: 13px;
      line-height: 20px;
      color: var(--gray-600);
    }

    .set02-modal-form {
      display: grid;
      grid-template-columns: minmax(0, 1fr);
      gap: var(--spacing-xl);
    }

    /* Narrow main area: the sections list becomes a dropdown above the content. */
    @container mod-app-content (max-width: 699px) {
      .set02-layout {
        grid-template-columns: minmax(0, 1fr);
        gap: var(--spacing-2xl);
      }

      .set02-nav {
        display: none;
      }

      .set02-picker {
        display: block;
      }
    }

    @container mod-app-content (max-width: 599px) {
      .set02-grid {
        grid-template-columns: minmax(0, 1fr);
      }
    }
  `,
})
export class SettingsPages02Example {
  private readonly destroyRef = inject(DestroyRef);
  private timer: ReturnType<typeof setTimeout> | undefined;

  readonly lang = input<AppLang>('en');
  /** The language button of the shell was pressed. */
  readonly languageToggle = output<void>();

  protected readonly t = computed(() => TEXT[this.lang()]);

  /** The side bar item; four of them are the sections of this page. */
  protected readonly page = signal<string>('hospitals');
  protected readonly section = computed<SectionId | null>(() => SECTIONS.find((item) => item.nav === this.page())?.id ?? null);
  protected readonly busy = signal<Busy>('');
  protected readonly notice = signal<Notice | null>(null);

  protected readonly noticeText = computed(() => {
    const notice = this.notice();
    if (!notice) return '';
    const t = this.t();
    return notice.key === 'saved' && notice.name ? t.savedName(notice.name[this.lang()]) : t[notice.key];
  });

  protected readonly sections = computed(() => {
    const t = this.t();
    const unsaved: Record<SectionId, boolean> = {
      details: this.editing() && this.detailsDirty(),
      specialties: false,
      rates: this.ratesDirty(),
      lists: false,
    };
    return SECTIONS.map((item) => ({ id: item.id, icon: item.icon, label: t[item.label], unsaved: unsaved[item.id] }));
  });

  protected readonly sectionOptions = computed<ModDropdownOption<SectionId>[]>(() =>
    this.sections().map((item) => ({ value: item.id, label: item.label })),
  );

  protected readonly otherTitle = computed(() => appNavLabel(this.page() as AppNavId, this.lang()));

  // --- Hospital data ---
  protected readonly details = signal<Details>(DETAILS);
  protected readonly draft = signal<Details>(DETAILS);
  protected readonly editing = signal(false);
  protected readonly active = signal(true);
  private readonly detailsTried = signal(false);
  protected readonly discardOpen = signal(false);
  protected readonly deactivateOpen = signal(false);

  protected readonly hospitalName = computed(() => (this.lang() === 'ar' ? this.details().nameAr : this.details().nameEn));
  protected readonly typeLabel = computed(() => (this.details().type === 'REFERRAL' ? this.t().typeReferral : this.t().typePeripheral));
  protected readonly regionLabel = computed(() => REGIONS[this.details().region][this.lang()]);
  protected readonly cityLabel = computed(() => {
    const city = this.details().city;
    return city ? CITIES[city][this.lang()] : this.t().notProvided;
  });

  protected readonly typeOptions = computed<ModDropdownOption<HospitalType>[]>(() => [
    { value: 'REFERRAL', label: this.t().typeReferral },
    { value: 'PERIPHERAL', label: this.t().typePeripheral },
  ]);

  protected readonly regionOptions = computed<ModDropdownOption<RegionCode>[]>(() => {
    const lang = this.lang();
    return (Object.keys(REGIONS) as RegionCode[]).map((code) => ({ value: code, label: REGIONS[code][lang] }));
  });

  /** The cities of the chosen region. */
  protected readonly cityOptions = computed<ModDropdownOption<CityCode>[]>(() => {
    const lang = this.lang();
    const region = this.draft().region;
    return (Object.keys(CITIES) as CityCode[])
      .filter((code) => CITIES[code].region === region)
      .map((code) => ({ value: code, label: CITIES[code][lang] }));
  });

  protected readonly detailsDirty = computed(() => {
    const draft = this.draft();
    const saved = this.details();
    return DETAIL_KEYS.some((key) => draft[key] !== saved[key]);
  });

  /** Messages of the hospital form; empty until the first save attempt. */
  protected readonly detailErrors = computed(() => {
    const t = this.t();
    const errors = { nameAr: '', nameEn: '', city: '', beds: '', phone: '', fax: '', email: '', website: '' };
    if (!this.detailsTried()) return errors;
    const draft = this.draft();
    if (!draft.nameAr.trim()) errors.nameAr = t.required;
    if (!draft.nameEn.trim()) errors.nameEn = t.required;
    if (!draft.city) errors.city = t.required;
    if (!draft.beds.trim()) errors.beds = t.required;
    else if (!/^\d+$/.test(draft.beds.trim()) || Number(draft.beds) <= 0) errors.beds = t.numberInvalid;
    if (draft.phone.trim() && !PHONE.test(draft.phone.trim())) errors.phone = t.phoneInvalid;
    if (draft.fax.trim() && !PHONE.test(draft.fax.trim())) errors.fax = t.phoneInvalid;
    if (draft.email.trim() && !EMAIL.test(draft.email.trim())) errors.email = t.emailInvalid;
    if (draft.website.trim() && !WEBSITE.test(draft.website.trim())) errors.website = t.formatInvalid;
    return errors;
  });

  // --- Specialties ---
  private readonly specialties = signal<Specialty[]>(SPECIALTY_LIST);
  protected readonly specialtySort = signal<ModTableSort | null>({ key: 'name', direction: 'asc' });

  protected readonly specialtyRows = computed<SpecialtyRow[]>(() => {
    const lang = this.lang();
    return this.specialties().map((item) => ({ code: item.code, name: item.name[lang], subs: item.subs, available: item.available }));
  });

  protected readonly specialtyColumns = computed<ModTableColumn<SpecialtyRow>[]>(() => {
    const t = this.t();
    return [
      { key: 'code', header: t.code, sortable: true },
      { key: 'name', header: t.specialty, sortable: true },
      { key: 'subs', header: t.subspecialties, sortable: true, compare: (a, b) => a.subs - b.subs },
      { key: 'available', header: t.available },
    ];
  });

  protected readonly specialtyKey = (row: SpecialtyRow): string => row.code;

  // --- Expenses rates ---
  private readonly rates = signal<Record<RateId, Rate>>(RATES);
  protected readonly rateDrafts = signal<Record<RateId, RateDraft>>({ patient: draftOf(RATES.patient), companion: draftOf(RATES.companion) });
  protected readonly rateEditing = signal<Record<RateId, boolean>>({ patient: false, companion: false });

  /* Typed lookups for the table cell templates, whose row is untyped. */
  protected rateEditingOf(id: RateId): boolean {
    return this.rateEditing()[id];
  }

  protected rateDraftOf(id: RateId): RateDraft {
    return this.rateDrafts()[id];
  }

  private readonly ratesTried = signal(false);
  private readonly lastChanged = signal('2026-01-01');

  protected readonly formatDate = computed(() => {
    const format = new Intl.DateTimeFormat(this.lang() === 'ar' ? 'ar-SA-u-ca-gregory-nu-latn' : 'en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
    return (date: Date): string => format.format(date);
  });

  protected readonly lastChangedText = computed(() => {
    const date = fromIso(this.lastChanged());
    return date ? this.formatDate()(date) : '';
  });

  /** The rows show what is stored; the fields of a row in edit mode read the drafts. */
  protected readonly rateRows = computed<RateRow[]>(() => {
    const t = this.t();
    const rates = this.rates();
    return RATE_IDS.map((id) => {
      const rate = rates[id];
      return {
        id,
        label: id === 'patient' ? t.patientRate : t.companionRate,
        amountText: rate.amount ? `${rate.amount} ${t.sar} / ${t.perDay}` : t.notSet,
        isSet: rate.amount !== '',
      };
    });
  });

  protected readonly rateColumns = computed<ModTableColumn<RateRow>[]>(() => {
    const t = this.t();
    return [
      { key: 'label', header: t.rateCategory },
      { key: 'amount', header: t.dailyAmount },
      { key: 'status', header: t.status },
      { key: 'actions', header: t.actions },
    ];
  });

  protected readonly rateKey = (row: RateRow): string => row.id;

  protected readonly ratesDirty = computed(() => {
    const drafts = this.rateDrafts();
    const rates = this.rates();
    return RATE_IDS.some((id) => !sameRate(drafts[id], rates[id]));
  });

  /** A row is in edit mode (changed or not). */
  protected readonly ratesOpen = computed(() => this.ratesDirty() || RATE_IDS.some((id) => this.rateEditing()[id]));

  protected readonly rateErrors = computed<Record<RateId, { amount: string }>>(() => {
    const t = this.t();
    const errors = { patient: { amount: '' }, companion: { amount: '' } };
    if (!this.ratesTried()) return errors;
    const drafts = this.rateDrafts();
    const rates = this.rates();
    for (const id of RATE_IDS) {
      const amount = drafts[id].amount.trim();
      if (!amount) {
        // A rate may stay "not set", but a rate that is set cannot be cleared.
        if (rates[id].amount) errors[id].amount = t.amountRequired;
      } else if (!AMOUNT.test(amount) || Number(amount) <= 0) {
        errors[id].amount = t.amountInvalid;
      }
    }
    return errors;
  });

  protected rateErrorOf(id: RateId): { amount: string } {
    return this.rateErrors()[id];
  }

  // --- Lookup lists ---
  private readonly listCounts = signal<Record<string, { values: number; active: number }>>(
    Object.fromEntries(LOOKUPS.map((list) => [list.code, { values: list.values, active: list.active }])),
  );

  private readonly lookupCards = computed(() => {
    const lang = this.lang();
    const counts = this.listCounts();
    return LOOKUPS.map((list) => ({
      code: list.code,
      name: list.name[lang],
      managed: list.managed,
      values: counts[list.code]?.values ?? list.values,
      active: counts[list.code]?.active ?? list.active,
    }));
  });

  protected readonly managedLists = computed<LookupCard[]>(() => this.lookupCards().filter((list) => list.managed));
  protected readonly fixedLists = computed<LookupCard[]>(() => this.lookupCards().filter((list) => !list.managed));

  // --- The "add" dialog ---
  protected readonly addOpen = signal(false);
  /** 'specialty', or the code of the managed list that gets the value. */
  protected readonly addTarget = signal('specialty');
  protected readonly addForm = signal<AddForm>(EMPTY_ADD);
  private readonly addTried = signal(false);

  protected readonly addHeading = computed(() => (this.addTarget() === 'specialty' ? this.t().addSpecialty : this.t().addValue));

  /** The list that gets the value (empty for a specialty). */
  protected readonly addDescription = computed(() => {
    const target = this.addTarget();
    return LOOKUPS.find((list) => list.code === target)?.name[this.lang()] ?? '';
  });

  protected readonly addErrors = computed(() => {
    const t = this.t();
    const errors = { code: '', nameAr: '', nameEn: '' };
    if (!this.addTried()) return errors;
    const form = this.addForm();
    const code = form.code.trim();
    if (!code) errors.code = t.required;
    else if (!CODE.test(code)) errors.code = t.codeInvalid;
    else if (this.addTarget() === 'specialty' && this.specialties().some((item) => item.code === code)) errors.code = t.codeDuplicate;
    if (!form.nameAr.trim()) errors.nameAr = t.required;
    if (!form.nameEn.trim()) errors.nameEn = t.required;
    return errors;
  });

  constructor() {
    this.destroyRef.onDestroy(() => clearTimeout(this.timer));
  }

  // --- Navigation between the sections ---
  protected go(id: SectionId): void {
    const target = SECTIONS.find((item) => item.id === id);
    if (!target || target.nav === this.page()) return;
    this.notice.set(null);
    this.page.set(target.nav);
  }

  protected pickSection(value: SectionId | SectionId[] | null): void {
    if (typeof value === 'string') this.go(value);
  }

  // --- Hospital data ---
  protected startEdit(): void {
    this.draft.set(this.details());
    this.detailsTried.set(false);
    this.notice.set(null);
    this.editing.set(true);
  }

  protected patchDraft<K extends keyof Details>(key: K, value: Details[K]): void {
    this.draft.update((draft) => ({ ...draft, [key]: value }));
  }

  protected setType(value: HospitalType | HospitalType[] | null): void {
    if (value === 'REFERRAL' || value === 'PERIPHERAL') this.patchDraft('type', value);
  }

  /** A new region clears the city: the cities list depends on it. */
  protected setRegion(value: RegionCode | RegionCode[] | null): void {
    if (typeof value !== 'string' || value === this.draft().region) return;
    this.draft.update((draft) => ({ ...draft, region: value, city: null }));
  }

  protected setCity(value: CityCode | CityCode[] | null): void {
    if (typeof value === 'string') this.patchDraft('city', value);
  }

  protected cancelEdit(): void {
    if (this.detailsDirty()) this.discardOpen.set(true);
    else this.editing.set(false);
  }

  protected discardEdit(): void {
    this.discardOpen.set(false);
    this.editing.set(false);
    this.draft.set(this.details());
    this.detailsTried.set(false);
    this.notice.set(null);
  }

  protected saveDetails(): void {
    if (this.busy()) return;
    this.detailsTried.set(true);
    if (hasError(this.detailErrors())) return this.notice.set({ variant: 'error', key: 'fixErrors' });
    this.notice.set(null);
    this.run('details', () => {
      const draft = this.draft();
      this.details.set({
        ...draft,
        nameAr: draft.nameAr.trim(),
        nameEn: draft.nameEn.trim(),
        beds: String(Number(draft.beds)),
        phone: draft.phone.trim(),
        fax: draft.fax.trim(),
        email: draft.email.trim(),
        website: draft.website.trim(),
      });
      this.draft.set(this.details());
      this.detailsTried.set(false);
      this.editing.set(false);
      this.notice.set({ variant: 'success', key: 'saved' });
    });
  }

  protected deactivate(): void {
    if (this.busy()) return;
    this.run('deactivate', () => {
      this.active.set(false);
      this.deactivateOpen.set(false);
      this.notice.set({ variant: 'success', key: 'saved' });
    });
  }

  protected reactivate(): void {
    this.active.set(true);
    this.notice.set({ variant: 'success', key: 'saved' });
  }

  // --- Specialties ---
  /** The availability applies at once (as in the real system). */
  protected setAvailable(code: string, available: boolean): void {
    const item = this.specialties().find((specialty) => specialty.code === code);
    if (!item || item.available === available) return;
    this.specialties.update((list) => list.map((specialty) => (specialty.code === code ? { ...specialty, available } : specialty)));
    this.notice.set({ variant: 'success', key: 'saved', name: item.name });
  }

  // --- Expenses rates ---
  protected editRate(id: RateId): void {
    this.rateEditing.update((editing) => ({ ...editing, [id]: true }));
  }

  protected cancelRate(id: RateId): void {
    this.rateDrafts.update((drafts) => ({ ...drafts, [id]: draftOf(this.rates()[id]) }));
    this.rateEditing.update((editing) => ({ ...editing, [id]: false }));
  }

  protected setRateAmount(id: RateId, amount: string): void {
    this.rateDrafts.update((drafts) => ({ ...drafts, [id]: { ...drafts[id], amount } }));
  }

  protected discardRates(): void {
    const rates = this.rates();
    this.rateDrafts.set({ patient: draftOf(rates.patient), companion: draftOf(rates.companion) });
    this.rateEditing.set({ patient: false, companion: false });
    this.ratesTried.set(false);
    this.notice.set(null);
  }

  protected saveRates(): void {
    if (this.busy()) return;
    this.ratesTried.set(true);
    const errors = this.rateErrors();
    if (RATE_IDS.some((id) => hasError(errors[id]))) return this.notice.set({ variant: 'error', key: 'fixErrors' });
    this.notice.set(null);
    this.run('rates', () => {
      const drafts = this.rateDrafts();
      const stored = (draft: RateDraft): Rate => {
        const amount = draft.amount.trim();
        return { amount: amount ? Number(amount).toFixed(2) : '' };
      };
      this.rates.set({ patient: stored(drafts.patient), companion: stored(drafts.companion) });
      this.lastChanged.set(toIso(new Date()));
      this.discardRates();
      this.notice.set({ variant: 'success', key: 'ratesSaved' });
    });
  }

  // --- The "add" dialog ---
  protected openAdd(target: string): void {
    this.addTarget.set(target);
    this.addForm.set(EMPTY_ADD);
    this.addTried.set(false);
    this.addOpen.set(true);
  }

  protected patchAdd(key: keyof AddForm, value: string): void {
    this.addForm.update((form) => ({ ...form, [key]: value }));
  }

  protected submitAdd(): void {
    if (this.busy()) return;
    this.addTried.set(true);
    if (hasError(this.addErrors())) return;
    this.run('add', () => {
      const form = this.addForm();
      const target = this.addTarget();
      const name: Bi = { en: form.nameEn.trim(), ar: form.nameAr.trim() };
      if (target === 'specialty') {
        this.specialties.update((list) => [...list, { code: form.code.trim(), name, subs: 0, available: true }]);
      } else {
        this.listCounts.update((counts) => {
          const current = counts[target] ?? { values: 0, active: 0 };
          return { ...counts, [target]: { values: current.values + 1, active: current.active + 1 } };
        });
      }
      this.addOpen.set(false);
      this.notice.set({ variant: 'success', key: 'saved', name });
    });
  }

  /** Stand-in for a request: a short busy state, then the result. */
  private run(kind: Busy, done: () => void): void {
    this.busy.set(kind);
    clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      this.busy.set('');
      done();
    }, 700);
  }
}

/** Source shown in the Code tab. Keep in step with the component above. */
export const SETTINGS_PAGES_02_CODE = `import { Component, computed, signal } from '@angular/core';
import {
  ModAppShell, ModAppShellActions, ModAppShellGroup, ModAppShellLogo, ModAppShellTitle, ModAvatar, ModButton,
  ModDescriptionItem, ModDescriptionList, ModDropdown, ModDropdownOption, ModIcon, ModInlineAlert,
  ModMenuSwitch, ModModal, ModModalActions, ModPageHeader, ModStatusTag, ModTable, ModTableCell, ModTableColumn,
  ModTag, ModTextInput,
} from '@mod-internal/ui';

type Section = 'hospitals' | 'specialties' | 'expense-rates' | 'lookups';

interface Hospital { nameAr: string; nameEn: string; type: string; region: string; city: string; beds: string; phone: string; email: string; }
interface Specialty { code: string; name: string; subs: number; available: boolean; }
interface Rate { id: string; label: string; amount: string; editing: boolean; error: string; }
interface LookupList { name: string; values: number; managed: boolean; }

const AMOUNT = /^\\d{1,13}(\\.\\d{1,2})?$/;

@Component({
  selector: 'app-setup',
  imports: [
    ModAppShell, ModAppShellLogo, ModAppShellTitle, ModAppShellActions, ModPageHeader, ModDescriptionList,
    ModDescriptionItem, ModTextInput, ModDropdown, ModTable, ModTableCell, ModMenuSwitch,
    ModStatusTag, ModTag, ModButton, ModIcon, ModInlineAlert, ModModal, ModModalActions, ModAvatar,
  ],
  template: \`
    <mod-app-shell [groups]="menu" [(activeId)]="section">
      <img modAppShellLogo src="assets/img/emblem-placeholder.svg" width="40" height="41" alt="Organization logo" />
      <span modAppShellTitle>Medical Referral and Patient Transfer Management System</span>
      <mod-avatar modAppShellActions size="32" initials="SM" label="Saad Al-Mutairi" />

      <mod-page-header heading="Setup" description="Hospital data, specialties, expenses rates and lookup lists." />

      <div class="layout">
        <!-- Secondary navigation: a list on wide containers, a dropdown on narrow ones -->
        <nav class="sections" aria-label="Setup sections">
          <ul>
            @for (item of sections; track item.value) {
              <li>
                <button type="button" [attr.aria-current]="section() === item.value ? 'page' : null" (click)="section.set(item.value)">
                  {{ item.label }}
                </button>
              </li>
            }
          </ul>
        </nav>
        <mod-dropdown class="picker" label="Section" [options]="sections" [value]="current()" (valueChange)="pick($event)" />

        <div class="stack">
          @if (message(); as text) {
            <mod-inline-alert variant="success" colored dismissible [heading]="text" (dismissed)="message.set('')" />
          }

          @switch (section()) {
            @case ('hospitals') {
              <section class="panel" aria-labelledby="details-title">
                <div class="panel__head">
                  <h2 id="details-title">{{ hospital().nameEn }}</h2>
                  <mod-status-tag size="sm" [variant]="active() ? 'success' : 'neutral'">{{ active() ? 'Active' : 'Inactive' }}</mod-status-tag>
                  @if (!editing()) {
                    <button mod-button variant="secondary-outline" size="small" type="button" (click)="startEdit()">
                      <mod-icon name="pencil-edit-02" /> Edit
                    </button>
                  }
                </div>

                @if (editing()) {
                  <div class="grid">
                    <mod-text-input
                      required label="Arabic name" [value]="draft().nameAr" (valueChange)="patch('nameAr', $event)"
                      [error]="!!errors().nameAr" [helperText]="errors().nameAr"
                    />
                    <mod-text-input
                      required label="English name" [value]="draft().nameEn" (valueChange)="patch('nameEn', $event)"
                      [error]="!!errors().nameEn" [helperText]="errors().nameEn"
                    />
                    <mod-dropdown label="Type" [options]="types" [value]="draft().type" (valueChange)="patch('type', '' + $event)" />
                    <mod-text-input
                      required label="Bed capacity" inputMode="numeric" [value]="draft().beds" (valueChange)="patch('beds', $event)"
                      [error]="!!errors().beds" [helperText]="errors().beds"
                    />
                    <mod-dropdown label="Region" [options]="regions" [value]="draft().region" (valueChange)="patch('region', '' + $event)" />
                    <mod-text-input required label="City" [value]="draft().city" (valueChange)="patch('city', $event)" />
                    <mod-text-input optional type="tel" label="Phone" [value]="draft().phone" (valueChange)="patch('phone', $event)" />
                    <mod-text-input optional type="email" label="Email" [value]="draft().email" (valueChange)="patch('email', $event)" />
                  </div>
                  <div class="actions">
                    <button mod-button variant="secondary-outline" size="medium" type="button" (click)="editing.set(false)">Cancel</button>
                    <button mod-button size="medium" type="button" [loading]="busy()" (click)="saveHospital()">Save</button>
                  </div>
                } @else {
                  <mod-description-list columns="3" aria-label="Hospital data">
                    <mod-description-item label="Code" value="RCH" />
                    <mod-description-item label="Type" [value]="hospital().type" />
                    <mod-description-item label="Arabic name" [value]="hospital().nameAr" />
                    <mod-description-item label="English name" [value]="hospital().nameEn" />
                    <mod-description-item label="Region" [value]="hospital().region" />
                    <mod-description-item label="City" [value]="hospital().city" />
                    <mod-description-item label="Bed capacity" [value]="hospital().beds" />
                    <mod-description-item label="Phone" [value]="hospital().phone || 'Not provided'" />
                    <mod-description-item label="Email" [value]="hospital().email || 'Not provided'" />
                  </mod-description-list>
                }
              </section>

              <section class="panel panel--danger" aria-labelledby="danger-title">
                <h2 id="danger-title"><mod-icon name="alert-02" /> Danger zone</h2>
                <p>The hospital stays on old requests and is no longer offered for new routing. No data is deleted.</p>
                @if (active()) {
                  <button mod-button destructive variant="secondary-outline" size="medium" type="button" (click)="confirmOpen.set(true)">Deactivate</button>
                } @else {
                  <button mod-button variant="secondary-outline" size="medium" type="button" (click)="active.set(true)">Reactivate</button>
                }
              </section>
            }

            @case ('specialties') {
              <section class="panel panel--flush" aria-labelledby="specialties-title">
                <div class="panel__head">
                  <h2 id="specialties-title">Specialties</h2>
                  <button mod-button size="small" type="button" (click)="openAdd()"><mod-icon name="add-01" /> Add specialty</button>
                </div>
                <mod-table density="compact" label="Specialties" [columns]="specialtyColumns" [rows]="specialties()">
                  <ng-template modTableCell="available" let-row>
                    <mod-menu-switch
                      [checked]="row.available"
                      [aria-label]="(row.available ? 'Make unavailable: ' : 'Make available: ') + row.name"
                      (checkedChange)="setAvailable(row.code, $event)"
                    />
                    {{ row.available ? 'Available' : 'Not available' }}
                  </ng-template>
                </mod-table>
              </section>
            }

            @case ('expense-rates') {
              @if (ratesDirty()) {
                <mod-inline-alert variant="warning" colored heading="You have unsaved changes." />
              }
              <section class="panel panel--flush rates" aria-labelledby="rates-title">
                <div class="panel__head"><h2 id="rates-title">Expenses rates</h2></div>
                <mod-table label="Expenses rates" [columns]="rateColumns" [rows]="rates()" [rowKey]="rateKey">
                  <ng-template modTableCell="amount" let-row>
                    @if (row.editing) {
                      <mod-text-input
                        size="medium" inputMode="decimal" suffix="SAR" [ariaLabel]="'New daily rate: ' + row.label"
                        [value]="row.amount" [error]="!!row.error" [helperText]="row.error" (valueChange)="patchRate(row.id, { amount: $event })"
                      />
                    } @else {
                      {{ row.amount ? row.amount + ' SAR / day' : 'Not set' }}
                    }
                  </ng-template>
                  <ng-template modTableCell="actions" let-row>
                    @if (!row.editing) {
                      <button mod-button variant="subtle" size="small" type="button" (click)="patchRate(row.id, { editing: true })">
                        <mod-icon name="pencil-edit-02" /> Edit
                      </button>
                    }
                  </ng-template>
                </mod-table>
                <div class="actions">
                  <button mod-button variant="secondary-outline" size="medium" type="button" [disabled]="!ratesDirty()" (click)="rates.set(storedRates())">Discard</button>
                  <button mod-button size="medium" type="button" [loading]="busy()" [disabled]="!ratesDirty()" (click)="saveRates()">Save</button>
                </div>
              </section>
            }

            @case ('lookups') {
              <section class="panel" aria-labelledby="lists-title">
                <h2 id="lists-title">Lookup lists</h2>
                <ul class="cards">
                  @for (list of lists; track list.name) {
                    <li>
                      <h3>{{ list.name }}</h3>
                      <p>Total: {{ list.values }}</p>
                      @if (!list.managed) {
                        <mod-tag size="xs" icon="square-lock-02">Read only</mod-tag>
                      }
                    </li>
                  }
                </ul>
              </section>
            }
          }
        </div>
      </div>
    </mod-app-shell>

    <mod-modal [(open)]="addOpen" heading="Add specialty">
      <div class="modal-form">
        <mod-text-input required label="Code" [(value)]="newCode" />
        <mod-text-input required label="English name" [(value)]="newName" />
      </div>
      <mod-modal-actions>
        <button mod-button variant="secondary-outline" size="medium" type="button" (click)="addOpen.set(false)">Cancel</button>
        <button mod-button size="medium" type="button" [disabled]="!newCode().trim() || !newName().trim()" (click)="addSpecialty()">Create specialty</button>
      </mod-modal-actions>
    </mod-modal>

    <mod-modal
      [(open)]="confirmOpen" icon="alert-02" iconColor="error"
      [heading]="'Deactivate ' + hospital().nameEn + '?'"
      description="It stays on old requests and is no longer offered for new routing. No data is deleted."
    >
      <mod-modal-actions>
        <button mod-button variant="secondary-outline" size="medium" type="button" (click)="confirmOpen.set(false)">Cancel</button>
        <button mod-button destructive size="medium" type="button" (click)="deactivate()">Yes, deactivate</button>
      </mod-modal-actions>
    </mod-modal>
  \`,
  styles: \`
    /* The widths are those of the shell's main area (container "mod-app-content"), not of the window. */
    .layout { display: grid; grid-template-columns: 208px minmax(0, 1fr); gap: var(--spacing-3xl); align-items: start; }
    .sections ul { display: grid; gap: var(--spacing-xs); margin: 0; padding: 0; list-style: none; }
    .sections button {
      width: 100%; min-height: 40px; padding: var(--spacing-md) var(--spacing-lg); border: 0;
      border-inline-start: 3px solid transparent; border-radius: var(--radius-sm); background: transparent;
      font: inherit; font-size: 14px; color: var(--gray-700); text-align: start; cursor: pointer;
    }
    .sections button:hover, .sections button[aria-current='page'] { background: var(--gray-100); color: var(--gray-900); }
    .sections button[aria-current='page'] { border-inline-start-color: var(--sa-600); font-weight: var(--font-weight-semibold); }
    .sections button:focus-visible { outline: 2px solid var(--border-black); outline-offset: 2px; }
    .picker { display: none; }
    .stack { display: grid; grid-template-columns: minmax(0, 1fr); gap: var(--spacing-3xl); }
    .panel {
      display: grid; gap: var(--spacing-2xl); min-width: 0; padding: var(--spacing-2xl);
      border: 1px solid var(--gray-200); border-radius: var(--radius-md); background: var(--alpha-white); color: var(--gray-900);
    }
    .panel h2 { flex: 1; display: flex; align-items: center; gap: var(--spacing-md); margin: 0; font-size: 16px; line-height: 24px; font-weight: var(--font-weight-semibold); }
    .panel p { margin: 0; font-size: 14px; color: var(--gray-600); }
    .panel--flush { padding: 0; gap: 0; }
    .panel--flush .panel__head, .panel--flush .actions { padding: var(--spacing-xl) var(--spacing-2xl); }
    .panel--danger { border-color: var(--error-500); justify-items: start; }
    .panel__head { display: flex; flex-wrap: wrap; align-items: center; gap: var(--spacing-md); }
    .grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: var(--spacing-2xl); align-items: start; }
    .actions { display: flex; justify-content: flex-end; gap: var(--spacing-md); }
    /* The table scrolls sideways, so it makes room for the open calendar instead of clipping it. */
    .rates ::ng-deep .table-wrapper:has(.date-picker.is-open) { padding-block-end: 400px; }
    .cards { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: var(--spacing-xl); margin: 0; padding: 0; list-style: none; }
    .cards li { display: grid; gap: var(--spacing-md); justify-items: start; padding: var(--spacing-xl); border: 1px solid var(--gray-200); border-radius: var(--radius-md); }
    .cards h3 { margin: 0; font-size: 14px; font-weight: var(--font-weight-semibold); }
    .modal-form { display: grid; gap: var(--spacing-xl); }
    @container mod-app-content (max-width: 699px) {
      .layout { grid-template-columns: minmax(0, 1fr); }
      .sections { display: none; }
      .picker { display: block; }
    }
    @container mod-app-content (max-width: 599px) {
      .grid { grid-template-columns: minmax(0, 1fr); }
    }
  \`,
})
export class Setup {
  protected readonly section = signal<string>('hospitals');
  protected readonly busy = signal(false);
  protected readonly message = signal('');

  protected readonly sections: ModDropdownOption<Section>[] = [
    { value: 'hospitals', label: 'Hospital data' },
    { value: 'specialties', label: 'Specialties' },
    { value: 'expense-rates', label: 'Expenses rates' },
    { value: 'lookups', label: 'Lookup lists' },
  ];
  /** The section as the dropdown value. */
  protected readonly current = computed(() => this.sections.find((item) => item.value === this.section())?.value ?? null);

  /** The sections are also side bar items, so both navigations stay in step. */
  protected readonly menu: ModAppShellGroup[] = [
    {
      label: 'Setup',
      items: [
        { id: 'hospitals', label: 'Hospitals', icon: 'hospital-01' },
        { id: 'specialties', label: 'Specialties', icon: 'stethoscope' },
        { id: 'lookups', label: 'Lookup lists', icon: 'tags' },
        { id: 'expense-rates', label: 'Expenses rates', icon: 'coins-01' },
      ],
    },
  ];

  // Hospital data: the stored record and the draft of the edit mode.
  protected readonly hospital = signal<Hospital>({
    nameAr: 'مستشفى الرياض المركزي', nameEn: 'Riyadh Central Hospital',
    type: 'Referral hospital', region: 'Riyadh Region', city: 'Riyadh', beds: '1192', phone: '0115550100', email: 'referrals@hospital.example',
  });
  protected readonly draft = signal<Hospital>(this.hospital());
  protected readonly editing = signal(false);
  protected readonly active = signal(true);
  protected readonly confirmOpen = signal(false);
  private readonly tried = signal(false);

  /** Field messages; empty until the first save attempt. */
  protected readonly errors = computed(() => {
    const errors = { nameAr: '', nameEn: '', beds: '' };
    if (!this.tried()) return errors;
    const draft = this.draft();
    if (!draft.nameAr.trim()) errors.nameAr = 'This field is required.';
    if (!draft.nameEn.trim()) errors.nameEn = 'This field is required.';
    if (!/^\\d+$/.test(draft.beds.trim()) || Number(draft.beds) <= 0) errors.beds = 'Enter a whole number greater than zero.';
    return errors;
  });

  protected readonly types: ModDropdownOption<string>[] = [
    { value: 'Referral hospital', label: 'Referral hospital' },
    { value: 'Peripheral hospital', label: 'Peripheral hospital' },
  ];
  protected readonly regions: ModDropdownOption<string>[] = [
    { value: 'Riyadh Region', label: 'Riyadh Region' },
    { value: 'Makkah Region', label: 'Makkah Region' },
    { value: 'Eastern Region', label: 'Eastern Region' },
  ];

  // Specialties: the availability for referral applies at once.
  protected readonly specialties = signal<Specialty[]>([
    { code: 'CARD', name: 'Cardiology', subs: 6, available: true },
    { code: 'ORTHO', name: 'Orthopedic Surgery', subs: 5, available: true },
    { code: 'ONC', name: 'Oncology', subs: 7, available: true },
    { code: 'PED', name: 'Pediatrics', subs: 8, available: false },
  ]);
  protected readonly specialtyColumns: ModTableColumn<Specialty>[] = [
    { key: 'code', header: 'Code', sortable: true },
    { key: 'name', header: 'Specialty', sortable: true },
    { key: 'subs', header: 'Subspecialties' },
    { key: 'available', header: 'Available' },
  ];
  protected readonly addOpen = signal(false);
  protected readonly newCode = signal('');
  protected readonly newName = signal('');

  // Expenses rates: edited in the table, saved together.
  protected readonly storedRates = signal<Rate[]>([
    { id: 'patient', label: 'Patient daily rate', amount: '150.00', editing: false, error: '' },
    { id: 'companion', label: 'Companion daily rate', amount: '', editing: false, error: '' },
  ]);
  protected readonly rates = signal<Rate[]>(this.storedRates());
  protected readonly rateColumns: ModTableColumn<Rate>[] = [
    { key: 'label', header: 'Rate' },
    { key: 'amount', header: 'Daily amount' },
    { key: 'actions', header: 'Actions' },
  ];
  /** Keeps the row (and the focused field) while its values change. */
  protected readonly rateKey = (rate: Rate): string => rate.id;
  protected readonly ratesDirty = computed(() => this.rates() !== this.storedRates());

  protected readonly lists: LookupList[] = [
    { name: 'Referral reasons', values: 12, managed: true },
    { name: 'Rejection reasons', values: 9, managed: true },
    { name: 'Priorities', values: 3, managed: false },
    { name: 'Required services', values: 3, managed: false },
  ];

  protected pick(value: Section | Section[] | null): void {
    if (typeof value === 'string') this.section.set(value);
  }

  protected startEdit(): void {
    this.draft.set(this.hospital());
    this.tried.set(false);
    this.editing.set(true);
  }

  protected patch(key: keyof Hospital, value: string): void {
    this.draft.update((draft) => ({ ...draft, [key]: value }));
  }

  protected saveHospital(): void {
    this.tried.set(true);
    if (Object.values(this.errors()).some(Boolean)) return;
    this.request(() => {
      this.hospital.set(this.draft());
      this.editing.set(false);
      this.message.set('Saved');
    });
  }

  protected deactivate(): void {
    this.active.set(false);
    this.confirmOpen.set(false);
  }

  protected setAvailable(code: string, available: boolean): void {
    this.specialties.update((list) => list.map((item) => (item.code === code ? { ...item, available } : item)));
  }

  protected openAdd(): void {
    this.newCode.set('');
    this.newName.set('');
    this.addOpen.set(true);
  }

  protected addSpecialty(): void {
    const name = this.newName().trim();
    this.specialties.update((list) => [...list, { code: this.newCode().trim().toUpperCase(), name, subs: 0, available: true }]);
    this.addOpen.set(false);
    this.message.set('Saved: ' + name);
  }

  protected patchRate(id: string, change: Partial<Rate>): void {
    this.rates.update((rates) => rates.map((rate) => (rate.id === id ? { ...rate, ...change } : rate)));
  }

  protected saveRates(): void {
    // A rate may stay "not set"; an amount needs two decimals at most.
    const checked = this.rates().map((rate) => {
      const amount = rate.amount.trim();
      const valid = amount === '' || AMOUNT.test(amount) && Number(amount) > 0;
      return { ...rate, error: valid ? '' : 'Enter an amount greater than zero, with at most two decimals.' };
    });
    if (checked.some((rate) => rate.error)) return this.rates.set(checked);
    this.request(() => {
      this.storedRates.set(checked.map((rate) => ({ ...rate, editing: false })));
      this.rates.set(this.storedRates());
      this.message.set('The expenses rates were saved.');
    });
  }

  /** Replace with the real request. */
  private request(done: () => void): void {
    this.busy.set(true);
    setTimeout(() => {
      this.busy.set(false);
      done();
    }, 700);
  }
}
`;
