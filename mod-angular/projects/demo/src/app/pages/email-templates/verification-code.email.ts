import {
  EMAIL_FONT,
  type EmailLang,
  emailDocument,
  emailHeading,
  emailParagraph,
  emailStart,
  escapeHtml,
} from './email-layout';

export interface VerificationCodeEmailData {
  /** The one-time code, digits only. */
  code: string;
  /** Minutes until the code expires. */
  expiresInMinutes: number;
}

const DEFAULTS: VerificationCodeEmailData = { code: '482913', expiresInMinutes: 10 };

/** Verification code email: the 6-digit code, large and letter-spaced, with its expiry. */
export function verificationCodeEmail(lang: EmailLang, data: Partial<VerificationCodeEmailData> = {}): string {
  const { code, expiresInMinutes } = { ...DEFAULTS, ...data };
  const safeCode = escapeHtml(code);
  const start = emailStart(lang);

  const t =
    lang === 'ar'
      ? {
          title: 'رمز التحقق',
          preheader: `رمز التحقق الخاص بك هو ${safeCode}. صالح لمدة ${expiresInMinutes} دقائق.`,
          heading: 'رمز التحقق',
          intro: 'استخدم الرمز التالي لإكمال تسجيل الدخول إلى نظام إدارة الإحالات الطبية وتحويل المرضى:',
          codeLabel: 'رمز التحقق',
          expiry: `هذا الرمز صالح لمدة <strong>${expiresInMinutes} دقائق</strong> ويُستخدم مرة واحدة فقط.`,
          warning: 'لا تشارك هذا الرمز مع أي شخص. لن يطلب منك موظفو الوزارة هذا الرمز أبدًا.',
          ignore: 'إذا لم تطلب هذا الرمز، يمكنك تجاهل هذه الرسالة.',
        }
      : {
          title: 'Verification code',
          preheader: `Your verification code is ${safeCode}. It is valid for ${expiresInMinutes} minutes.`,
          heading: 'Your verification code',
          intro: 'Use the following code to complete your sign-in to the Medical Referrals and Patient Transfer System:',
          codeLabel: 'Verification code',
          expiry: `This code is valid for <strong>${expiresInMinutes} minutes</strong> and can be used only once.`,
          warning: 'Do not share this code with anyone. Ministry staff will never ask you for it.',
          ignore: 'If you did not request this code, you can ignore this message.',
        };

  // The digits always read left to right, also inside the Arabic message.
  const codeBlock = `              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:8px 0 24px;">
                <tr>
                  <td align="center" bgcolor="#F1F4F5" style="padding:20px 16px; background-color:#F1F4F5; border:1px solid #B2BEC4; border-radius:8px;">
                    <div style="margin:0 0 8px; font-family:${EMAIL_FONT}; font-size:13px; line-height:20px; color:#4C5A61;">${t.codeLabel}</div>
                    <div dir="ltr" style="font-family:'Courier New', Courier, monospace; font-size:36px; line-height:44px; font-weight:700; letter-spacing:10px; color:#29504D; text-align:center;">${safeCode}</div>
                  </td>
                </tr>
              </table>`;

  return emailDocument({
    lang,
    title: t.title,
    preheader: t.preheader,
    body: [
      emailHeading(lang, t.heading),
      emailParagraph(lang, t.intro),
      codeBlock,
      emailParagraph(lang, t.expiry),
      `              <p style="margin:0 0 16px; padding:12px 16px; background-color:#F1F4F5; border-${start}:4px solid #00A05A; font-family:${EMAIL_FONT}; font-size:14px; line-height:22px; color:#111B21; text-align:${start};">${t.warning}</p>`,
      emailParagraph(lang, t.ignore, true),
    ],
  });
}
