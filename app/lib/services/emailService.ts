// app/lib/services/emailService.ts
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// Development helper: Logs email to console instead of sending
const logMockEmail = (email: string, accessKey: string) => {
  console.log('\n[Email Mock] -------------------------------');
  console.log(`To: ${email}`);
  console.log('Subject: Your Access Key for 1313 OS');
  console.log(`Key: \x1b[32m${accessKey}\x1b[0m`); // Green color
  console.log('--------------------------------------------\n');
  return true;
};

export const EmailService = {
  sendAccessKey: async (email: string, accessKey: string) => {
    // Enable Mock Mode if explicitly set or if RESEND_API_KEY is missing/placeholder
    const useMock = process.env.EMAIL_MOCK_MODE === 'true' ||
      !process.env.RESEND_API_KEY ||
      process.env.RESEND_API_KEY === 're_123456789';

    if (useMock) {
      return logMockEmail(email, accessKey);
    }

    try {
      const { data, error } = await resend.emails.send({
        from: 'onboarding@1313heart.com', 
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
        // Fallback to mock logs in development if API fails despite key being present
        if (process.env.NODE_ENV === 'development') {
          console.warn('[Resend Failed] Falling back to Mock Mode for dev convenience.');
          return logMockEmail(email, accessKey);
        }
        return false;
      }

      return true;
    } catch (e) {
      console.error('[Email Service Error]', e);
      return false;
    }
  }
};