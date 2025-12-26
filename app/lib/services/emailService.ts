// app/lib/email.ts
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export const EmailService = {
  sendAccessKey: async (email: string, accessKey: string) => {
    try {
      const { data, error } = await resend.emails.send({
        from: 'onboarding@resend.dev', // 請將 domain 換成您在 Resend 驗證過的 domain
        to: [email],
        subject: 'Your Access Key for 1313 OS',
        html: `
          <div style="font-family: monospace; padding: 20px; background: #f4f4f4;">
            <h2>1313 OS Login</h2>
            <p>Here is your permanent Access Key. Treat it like a password.</p>
            <div style="background: #000; color: #0f0; padding: 15px; font-size: 24px; letter-spacing: 5px; text-align: center; margin: 20px 0;">
              ${accessKey}
            </div>
            <p style="font-size: 12px; color: #666;">
              If you did not request this, please ignore this email.
            </p>
          </div>
        `,
      });

      if (error) {
        console.error('[Resend Error]', error);
        return false;
      }

      return true;
    } catch (e) {
      console.error('[Email Service Error]', e);
      return false;
    }
  }
};