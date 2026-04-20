import { Resend } from 'resend';

/**
 * Notification Utility
 * Handles simulated SMS and real Email notifications via Resend
 */

const resend = process.env.RESEND_API_KEY 
  ? new Resend(process.env.RESEND_API_KEY) 
  : null;

console.log('DEBUG: Resend Initialization - API Key present:', !!process.env.RESEND_API_KEY);

export async function sendNotification(user: any, type: 'SMS' | 'EMAIL', data: { amount: number, code: string }) {
  const { name, email, phoneNumber } = user;
  const { amount, code } = data;

  console.log(`\n--- 🔔 NOTIFICATION SYSTEM [${type}] ---`);
  console.log(`DEBUG: Input Received - Name: ${name}, Email: ${email}, Phone: ${phoneNumber}`);
  
  if (type === 'SMS') {
    // SMS remains simulated for now
    const message = `SIMULATED SMS: Hello ${name}, you've received a $${amount} scratch card! Your code is: ${code}`;
    console.log(`To: ${phoneNumber || 'No Phone Set'}`);
    console.log(`Content: ${message}`);
    
    // Future Twilio integration hook here...
  } else {
    const message = `Hello ${name}, a new $${amount} reward is waiting for you. Use code ${code} to redeem.`;
    
    // Attempt real email sending if Resend is configured
    if (resend) {
      try {
        console.log(`DEBUG: Attempting real email delivery to ${email}...`);
        const response = await resend.emails.send({
          from: 'Command Center <onboarding@resend.dev>',
          to: email,
          subject: `Your Membership Scratch Card - CONTROL CENTER`,
          html: `
            <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 16px; overflow: hidden; color: #1f2937;">
              <!-- Header -->
              <div style="background-color: #0f172a; padding: 32px; text-align: center;">
                <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.025em;">CONTROL CENTER</h1>
                <p style="color: #94a3b8; margin-top: 8px; font-size: 14px; font-weight: 500;">Official Member Rewards</p>
              </div>

              <!-- Content -->
              <div style="padding: 40px 32px;">
                <h2 style="margin: 0 0 16px; font-size: 20px; font-weight: 700;">Hello ${name},</h2>
                <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.6; color: #4b5563;">
                  A new digital scratch card has been issued to your membership account. You can use the unique authorization code below to access your reward.
                </p>

                <!-- Card Box -->
                <div style="background-color: #f8fafc; border: 2px dashed #cbd5e1; border-radius: 12px; padding: 32px; text-align: center;">
                  <p style="margin: 0 0 8px; font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.1em;">Current Valuation</p>
                  <p style="margin: 0 0 24px; font-size: 48px; font-weight: 800; color: #0f172a;">$${amount}</p>
                  
                  <div style="background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; display: inline-block;">
                    <p style="margin: 0 0 4px; font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase;">Unique Authorization Code</p>
                    <p style="margin: 0; font-size: 28px; font-weight: 800; color: #2563eb; letter-spacing: 4px; font-family: monospace;">${code}</p>
                  </div>
                </div>

                <p style="margin: 24px 0 0; font-size: 15px; line-height: 1.6; color: #4b5563;">
                  To redeem your credit, simply log in to your dashboard and enter the code in the "Redeem" section.
                </p>

                <div style="margin-top: 32px; text-align: center;">
                  <a href="#" style="background-color: #2563eb; color: #ffffff; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 15px; display: inline-block;">Visit Dashboard</a>
                </div>
              </div>

              <!-- Footer -->
              <div style="background-color: #f9fafb; padding: 32px; text-align: center; border-top: 1px solid #e5e7eb;">
                <p style="margin: 0 0 12px; font-size: 12px; color: #6b7280; line-height: 1.5;">
                  <strong>Control Center Admin Team</strong><br />
                  123 Innovation Drive, Silicon Valley, CA 94025
                </p>
                <p style="margin: 0; font-size: 11px; color: #9ca3af;">
                  You are receiving this because you are a registered member.<br />
                  <a href="#" style="color: #2563eb; text-decoration: underline;">Unsubscribe</a> from these alerts.
                </p>
              </div>
            </div>
          `
        });
        
        console.log('DEBUG: Resend API Response:', JSON.stringify(response, null, 2));

        if (response.error) {
          console.error("DEBUG: Resend API returned an error:", response.error);
        } else {
          console.log(`SUCCESS: Email successfully sent! ID: ${response.data?.id}`);
        }
      } catch (err) {
        console.error("DEBUG: Resend Delivery Exception:", err);
      }
    } else {
      // Fallback simulation if no API key is present
      console.log("RESEND_API_KEY missing. Simulation mode only.");
      console.log(`SIMULATED EMAIL To: ${email}`);
      console.log(`Content: ${message}`);
    }
  }
  
  console.log(`--- 🏁 END NOTIFICATION LOG ---\n`);
  
  return { success: true, method: type };
}
