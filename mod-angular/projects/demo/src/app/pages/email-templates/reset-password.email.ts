import {
  EMAIL_FONT,
  type EmailLang,
  emailButton,
  emailDivider,
  emailDocument,
  emailHeading,
  emailParagraph,
  emailStart,
  escapeHtml,
} from './email-layout';

export interface ResetPasswordEmailData {
  /** Single-use link to the "set a new password" page. */
  resetUrl: string;
  /** Minutes until the link expires. */
  expiresInMinutes: number;
}

const DEFAULTS: ResetPasswordEmailData = {
  resetUrl: 'https://referrals.example.mod.gov.sa/reset-password?token=EXAMPLE-TOKEN',
  expiresInMinutes: 30,
};

/** Reset password email: button, fallback URL and the "if you did not request this" note. */
export function resetPasswordEmail(lang: EmailLang, data: Partial<ResetPasswordEmailData> = {}): string {
  const { resetUrl, expiresInMinutes } = { ...DEFAULTS, ...data };
  const safeUrl = escapeHtml(resetUrl);
  const start = emailStart(lang);

  const t =
    lang === 'ar'
      ? {
          title: 'إعادة تعيين كلمة المرور',
          preheader: `استخدم الرابط لإعادة تعيين كلمة المرور. الرابط صالح لمدة ${expiresInMinutes} دقيقة.`,
          heading: 'إعادة تعيين كلمة المرور',
          intro: 'تلقّينا طلبًا لإعادة تعيين كلمة المرور الخاصة بحسابك في نظام إدارة الإحالات الطبية وتحويل المرضى. اضغط الزر التالي لاختيار كلمة مرور جديدة.',
          button: 'إعادة تعيين كلمة المرور',
          expiry: `هذا الرابط صالح لمدة <strong>${expiresInMinutes} دقيقة</strong> ويُستخدم مرة واحدة فقط.`,
          fallback: 'إذا لم يعمل الزر، انسخ الرابط التالي والصقه في المتصفح:',
          notYou: 'إذا لم تطلب إعادة تعيين كلمة المرور، يمكنك تجاهل هذه الرسالة، وستبقى كلمة المرور الحالية كما هي. وإذا تكرر وصول هذه الرسالة فتواصل مع الدعم الفني.',
        }
      : {
          title: 'Reset your password',
          preheader: `Use the link to reset your password. The link is valid for ${expiresInMinutes} minutes.`,
          heading: 'Reset your password',
          intro: 'We received a request to reset the password of your account in the Medical Referrals and Patient Transfer System. Select the button below to choose a new password.',
          button: 'Reset password',
          expiry: `This link is valid for <strong>${expiresInMinutes} minutes</strong> and can be used only once.`,
          fallback: 'If the button does not work, copy this link and paste it into your browser:',
          notYou: 'If you did not request a password reset, you can ignore this message and your current password will stay the same. If you keep receiving this message, contact technical support.',
        };

  return emailDocument({
    lang,
    title: t.title,
    preheader: t.preheader,
    body: [
      emailHeading(lang, t.heading),
      emailParagraph(lang, t.intro),
      emailButton(lang, t.button, resetUrl),
      emailParagraph(lang, t.expiry),
      emailParagraph(lang, t.fallback, true),
      // The URL always reads left to right and may break at any character.
      `              <p dir="ltr" style="margin:0 0 24px; font-family:${EMAIL_FONT}; font-size:14px; line-height:22px; text-align:${start}; word-break:break-all;"><a href="${safeUrl}" target="_blank" style="color:#29504D; text-decoration:underline;">${safeUrl}</a></p>`,
      emailDivider(),
      emailParagraph(lang, t.notYou, true),
    ],
  });
}
