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

export interface WelcomeEmailData {
  /** Name of the new user, already in the language of the message. */
  userName: string;
  /** Link to the sign-in page. */
  signInUrl: string;
}

const DEFAULTS: Record<EmailLang, WelcomeEmailData> = {
  en: { userName: 'Fahad Al-Otaibi', signInUrl: 'https://referrals.example.mod.gov.sa/sign-in' },
  ar: { userName: 'فهد العتيبي', signInUrl: 'https://referrals.example.mod.gov.sa/sign-in' },
};

/** Welcome / account created email: greeting by name, three short next steps and a button. */
export function welcomeEmail(lang: EmailLang, data: Partial<WelcomeEmailData> = {}): string {
  const { userName, signInUrl } = { ...DEFAULTS[lang], ...data };
  const name = escapeHtml(userName);
  const start = emailStart(lang);

  const t =
    lang === 'ar'
      ? {
          title: 'تم إنشاء حسابك',
          preheader: 'تم إنشاء حسابك في نظام إدارة الإحالات الطبية وتحويل المرضى. إليك الخطوات التالية.',
          heading: `مرحبًا بك، ${name}`,
          intro: 'تم إنشاء حسابك في نظام إدارة الإحالات الطبية وتحويل المرضى بنجاح. للبدء، أكمل الخطوات التالية:',
          steps: [
            { title: 'سجّل الدخول', text: 'استخدم اسم المستخدم وكلمة المرور المؤقتة التي استلمتها.' },
            { title: 'غيّر كلمة المرور', text: 'سيُطلب منك اختيار كلمة مرور جديدة عند أول دخول.' },
            { title: 'أكمل ملفك الشخصي', text: 'راجع بياناتك وجهة عملك حتى تصلك الطلبات الصحيحة.' },
          ],
          button: 'تسجيل الدخول إلى النظام',
          help: 'إذا احتجت إلى مساعدة، تواصل مع الدعم الفني من صفحة «الدعم» داخل النظام.',
        }
      : {
          title: 'Your account has been created',
          preheader: 'Your account in the Medical Referrals and Patient Transfer System is ready. Here are your next steps.',
          heading: `Welcome, ${name}`,
          intro: 'Your account in the Medical Referrals and Patient Transfer System has been created. To get started, complete these steps:',
          steps: [
            { title: 'Sign in', text: 'Use your user name and the temporary password you received.' },
            { title: 'Change your password', text: 'You will be asked to choose a new password at your first sign-in.' },
            { title: 'Complete your profile', text: 'Review your details and your facility so the right requests reach you.' },
          ],
          button: 'Sign in to the system',
          help: 'If you need help, contact technical support from the Support page inside the system.',
        };

  // Numbered steps as table rows: number in a dark green cell, text beside it.
  const stepRows = t.steps
    .map(
      (step, index) => `                <tr>
                  <td width="32" valign="top" style="padding:0 0 16px;">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td width="32" height="32" align="center" valign="middle" bgcolor="#29504D" style="width:32px; height:32px; background-color:#29504D; border-radius:16px; font-family:${EMAIL_FONT}; font-size:15px; line-height:32px; font-weight:700; color:#FFFFFF;">${index + 1}</td>
                      </tr>
                    </table>
                  </td>
                  <td width="12" style="width:12px; font-size:0; line-height:0;">&nbsp;</td>
                  <td valign="top" style="padding:3px 0 16px; font-family:${EMAIL_FONT}; font-size:15px; line-height:24px; color:#4C5A61; text-align:${start};">
                    <strong style="color:#111B21;">${step.title}</strong><br>${step.text}
                  </td>
                </tr>`,
    )
    .join('\n');

  return emailDocument({
    lang,
    title: t.title,
    preheader: t.preheader,
    body: [
      emailHeading(lang, t.heading),
      emailParagraph(lang, t.intro),
      `              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:8px 0 8px;">
${stepRows}
              </table>`,
      emailButton(lang, t.button, signInUrl),
      emailParagraph(lang, t.help, true),
    ],
  });
}
