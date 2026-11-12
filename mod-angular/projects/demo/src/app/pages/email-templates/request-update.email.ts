import {
  EMAIL_FONT,
  type EmailLang,
  emailButton,
  emailDocument,
  emailHeading,
  emailParagraph,
  emailStart,
  escapeHtml,
} from './email-layout';

export interface RequestUpdateEmailData {
  /** Name of the recipient, already in the language of the message. */
  userName: string;
  requestNumber: string;
  /** Date of the update, already formatted for the language of the message. */
  date: string;
  /** Link to the request inside the system. */
  requestUrl: string;
}

const DEFAULTS: Record<EmailLang, RequestUpdateEmailData> = {
  en: {
    userName: 'Fahad Al-Otaibi',
    requestNumber: 'REF-2026-004518',
    date: '12 November 2026',
    requestUrl: 'https://referrals.example.mod.gov.sa/requests/REF-2026-004518',
  },
  ar: {
    userName: 'فهد العتيبي',
    requestNumber: 'REF-2026-004518',
    date: '12 نوفمبر 2026',
    requestUrl: 'https://referrals.example.mod.gov.sa/requests/REF-2026-004518',
  },
};

/**
 * Request update email: a status notification ("Your referral request was
 * approved") with a small details table and a button to open the request.
 */
export function requestUpdateEmail(lang: EmailLang, data: Partial<RequestUpdateEmailData> = {}): string {
  const { userName, requestNumber, date, requestUrl } = { ...DEFAULTS[lang], ...data };
  const name = escapeHtml(userName);
  const number = escapeHtml(requestNumber);
  const start = emailStart(lang);

  const t =
    lang === 'ar'
      ? {
          title: 'تحديث على طلب الإحالة',
          preheader: `تمت الموافقة على طلب الإحالة رقم ${number}.`,
          heading: 'تمت الموافقة على طلب الإحالة',
          greeting: `السلام عليكم ${name}،`,
          intro: 'نفيدكم بأنه تمت الموافقة على طلب الإحالة الذي قدّمتموه. يمكنكم الآن متابعة حجز الموعد من صفحة الطلب.',
          detailsCaption: 'تفاصيل الطلب',
          requestNumber: 'رقم الطلب',
          date: 'تاريخ التحديث',
          status: 'الحالة',
          statusValue: 'تمت الموافقة',
          button: 'عرض الطلب',
          note: 'تصلك هذه الرسالة لأنك مقدّم الطلب. يمكنك تعديل إعدادات الإشعارات من ملفك الشخصي في النظام.',
        }
      : {
          title: 'Update on your referral request',
          preheader: `Your referral request ${number} was approved.`,
          heading: 'Your referral request was approved',
          greeting: `Dear ${name},`,
          intro: 'Your referral request has been approved. You can now continue to book the appointment from the request page.',
          detailsCaption: 'Request details',
          requestNumber: 'Request number',
          date: 'Updated on',
          status: 'Status',
          statusValue: 'Approved',
          button: 'View request',
          note: 'You are receiving this message because you submitted the request. You can change your notification settings from your profile in the system.',
        };

  const labelStyle = `padding:12px 16px; border-bottom:1px solid #B2BEC4; font-family:${EMAIL_FONT}; font-size:14px; line-height:22px; font-weight:400; color:#4C5A61; text-align:${start};`;
  const valueStyle = `padding:12px 16px; border-bottom:1px solid #B2BEC4; font-family:${EMAIL_FONT}; font-size:14px; line-height:22px; font-weight:700; color:#111B21; text-align:${start};`;
  const lastLabelStyle = labelStyle.replace('border-bottom:1px solid #B2BEC4; ', '');
  const lastValueStyle = valueStyle.replace('border-bottom:1px solid #B2BEC4; ', '');

  // A real data table (not role="presentation"): row headers name each value.
  const details = `              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:8px 0 24px; border:1px solid #B2BEC4; border-collapse:separate; border-radius:8px;">
                <caption style="padding:0 0 8px; font-family:${EMAIL_FONT}; font-size:14px; line-height:22px; font-weight:700; color:#111B21; text-align:${start};">${t.detailsCaption}</caption>
                <tr>
                  <th scope="row" width="40%" style="${labelStyle}">${t.requestNumber}</th>
                  <td style="${valueStyle}"><span dir="ltr">${number}</span></td>
                </tr>
                <tr>
                  <th scope="row" width="40%" style="${labelStyle}">${t.date}</th>
                  <td style="${valueStyle}">${escapeHtml(date)}</td>
                </tr>
                <tr>
                  <th scope="row" width="40%" style="${lastLabelStyle}">${t.status}</th>
                  <td style="${lastValueStyle}"><span style="display:inline-block; padding:2px 10px; background-color:#29504D; border-radius:12px; font-size:13px; line-height:20px; font-weight:700; color:#FFFFFF;">&#10003;&nbsp;${t.statusValue}</span></td>
                </tr>
              </table>`;

  return emailDocument({
    lang,
    title: t.title,
    preheader: t.preheader,
    body: [
      emailHeading(lang, t.heading),
      emailParagraph(lang, t.greeting),
      emailParagraph(lang, t.intro),
      details,
      emailButton(lang, t.button, requestUrl),
      emailParagraph(lang, t.note, true),
    ],
  });
}
