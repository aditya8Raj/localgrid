import nodemailer from "nodemailer";

// Create Gmail transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SMTP_HOST || "smtp.gmail.com",
  port: Number(process.env.EMAIL_SMTP_PORT) || 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_SMTP_USER,
    pass: process.env.EMAIL_SMTP_PASS,
  },
});

// Verify transporter configuration
transporter.verify((error) => {
  if (error) {
    console.error("Email transporter verification failed:", error);
  } else {
    console.log("Email service is ready to send messages");
  }
});

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail({ to, subject, html, text }: EmailOptions) {
  try {
    const info = await transporter.sendMail({
      from: `"LocalGrid" <${process.env.EMAIL_FROM}>`,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, ""), // Strip HTML for text version
    });

    console.log("Email sent successfully:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Failed to send email:", error);
    return { success: false, error };
  }
}

// Email Templates
export const emailTemplates = {
  // Welcome email when user signs up
  welcome: (userName: string) => ({
    subject: "Welcome to LocalGrid! 🎉",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to LocalGrid!</h1>
            </div>
            <div class="content">
              <h2>Hi ${userName || "there"}! 👋</h2>
              <p>We're excited to have you join our community of skill-sharers and learners!</p>
              
              <h3>What you can do on LocalGrid:</h3>
              <ul>
                <li>📚 <strong>Share your skills</strong> - Create listings and teach others</li>
                <li>🔍 <strong>Find local experts</strong> - Discover people nearby with the skills you want to learn</li>
                <li>🤝 <strong>Connect & Collaborate</strong> - Join community projects and meet like-minded people</li>
                <li>💰 <strong>Earn credits</strong> - Get rewarded for sharing your knowledge</li>
              </ul>
              
              <p>Ready to get started?</p>
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/listings/new" class="button">Create Your First Listing</a>
              
              <p>If you have any questions, feel free to reach out. We're here to help!</p>
              
              <p>Happy skill-sharing! 🚀</p>
              <p><strong>The LocalGrid Team</strong></p>
            </div>
            <div class="footer">
              <p>© 2025 LocalGrid. All rights reserved.</p>
              <p>You received this email because you signed up for LocalGrid.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  }),

  // Booking confirmation email
  bookingConfirmation: (data: {
    userName: string;
    listingTitle: string;
    providerName: string;
    startTime: string;
    endTime: string;
    duration: number;
    price?: number;
    bookingId: string;
  }) => ({
    subject: "Booking Confirmation - Your session is pending ⏳",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
            .booking-card { background: white; border: 2px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 20px 0; }
            .info-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
            .info-row:last-child { border-bottom: none; }
            .label { font-weight: bold; color: #6b7280; }
            .value { color: #111827; }
            .status { background: #fef3c7; color: #92400e; padding: 5px 15px; border-radius: 20px; display: inline-block; font-size: 14px; }
            .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 10px 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📅 Booking Request Sent!</h1>
            </div>
            <div class="content">
              <h2>Hi ${data.userName}!</h2>
              <p>Your booking request has been successfully submitted. Here are the details:</p>
              
              <div class="booking-card">
                <div class="info-row">
                  <span class="label">Session:</span>
                  <span class="value">${data.listingTitle}</span>
                </div>
                <div class="info-row">
                  <span class="label">Provider:</span>
                  <span class="value">${data.providerName}</span>
                </div>
                <div class="info-row">
                  <span class="label">Start Time:</span>
                  <span class="value">${data.startTime}</span>
                </div>
                <div class="info-row">
                  <span class="label">End Time:</span>
                  <span class="value">${data.endTime}</span>
                </div>
                <div class="info-row">
                  <span class="label">Duration:</span>
                  <span class="value">${data.duration} minutes</span>
                </div>
                ${
                  data.price
                    ? `
                <div class="info-row">
                  <span class="label">Price:</span>
                  <span class="value">₹${data.price}</span>
                </div>
                `
                    : ""
                }
                <div class="info-row">
                  <span class="label">Status:</span>
                  <span class="value"><span class="status">⏳ Pending Confirmation</span></span>
                </div>
              </div>
              
              <p><strong>What happens next?</strong></p>
              <ol>
                <li>The provider will review your booking request</li>
                <li>You'll receive an email once they confirm or decline</li>
                <li>If confirmed, you'll get reminder emails before the session</li>
              </ol>
              
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard?tab=bookings" class="button">View My Bookings</a>
              
              <p>Need to make changes? You can cancel this booking from your dashboard.</p>
              
              <p>Best regards,<br><strong>The LocalGrid Team</strong></p>
            </div>
            <div class="footer">
              <p>© 2025 LocalGrid. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  }),

  // Booking confirmed by provider
  bookingConfirmed: (data: {
    userName: string;
    listingTitle: string;
    providerName: string;
    startTime: string;
    endTime: string;
    duration: number;
    price?: number;
  }) => ({
    subject: "🎉 Booking Confirmed - Your session is scheduled!",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
            .booking-card { background: white; border: 2px solid #10b981; border-radius: 8px; padding: 20px; margin: 20px 0; }
            .info-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
            .info-row:last-child { border-bottom: none; }
            .label { font-weight: bold; color: #6b7280; }
            .value { color: #111827; }
            .status { background: #d1fae5; color: #065f46; padding: 5px 15px; border-radius: 20px; display: inline-block; font-size: 14px; }
            .highlight { background: #fef3c7; padding: 15px; border-left: 4px solid #f59e0b; margin: 20px 0; border-radius: 4px; }
            .button { display: inline-block; background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 10px 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✅ Booking Confirmed!</h1>
            </div>
            <div class="content">
              <h2>Great news, ${data.userName}!</h2>
              <p><strong>${data.providerName}</strong> has confirmed your booking request. Your session is scheduled!</p>
              
              <div class="booking-card">
                <div class="info-row">
                  <span class="label">Session:</span>
                  <span class="value">${data.listingTitle}</span>
                </div>
                <div class="info-row">
                  <span class="label">Provider:</span>
                  <span class="value">${data.providerName}</span>
                </div>
                <div class="info-row">
                  <span class="label">Start Time:</span>
                  <span class="value">${data.startTime}</span>
                </div>
                <div class="info-row">
                  <span class="label">End Time:</span>
                  <span class="value">${data.endTime}</span>
                </div>
                <div class="info-row">
                  <span class="label">Duration:</span>
                  <span class="value">${data.duration} minutes</span>
                </div>
                ${
                  data.price
                    ? `
                <div class="info-row">
                  <span class="label">Price:</span>
                  <span class="value">₹${data.price}</span>
                </div>
                `
                    : ""
                }
                <div class="info-row">
                  <span class="label">Status:</span>
                  <span class="value"><span class="status">✅ Confirmed</span></span>
                </div>
              </div>
              
              <div class="highlight">
                <strong>📅 Add to Calendar:</strong> Don't forget to add this session to your calendar so you don't miss it!
              </div>
              
              <p><strong>What to expect:</strong></p>
              <ul>
                <li>We'll send you reminder emails 24 hours and 1 hour before the session</li>
                <li>Make sure you're prepared and on time</li>
                <li>After the session, you can leave a review for ${data.providerName}</li>
              </ul>
              
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard?tab=bookings" class="button">View Booking Details</a>
              
              <p>Have questions? Contact ${data.providerName} through the platform.</p>
              
              <p>Looking forward to your session!<br><strong>The LocalGrid Team</strong></p>
            </div>
            <div class="footer">
              <p>© 2025 LocalGrid. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  }),

  // Booking reminder (24 hours before)
  bookingReminder24h: (data: {
    userName: string;
    listingTitle: string;
    providerName: string;
    startTime: string;
    duration: number;
  }) => ({
    subject: "⏰ Reminder: Your session is tomorrow!",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
            .reminder-card { background: white; border: 2px solid #f59e0b; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center; }
            .time { font-size: 32px; font-weight: bold; color: #f59e0b; margin: 10px 0; }
            .checklist { background: white; border-radius: 8px; padding: 20px; margin: 20px 0; }
            .checklist-item { padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
            .checklist-item:last-child { border-bottom: none; }
            .button { display: inline-block; background: #f59e0b; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>⏰ Session Tomorrow!</h1>
            </div>
            <div class="content">
              <h2>Hi ${data.userName}!</h2>
              <p>This is a friendly reminder that your session is coming up soon:</p>
              
              <div class="reminder-card">
                <h3>${data.listingTitle}</h3>
                <p><strong>with ${data.providerName}</strong></p>
                <div class="time">Tomorrow</div>
                <p style="font-size: 18px; margin: 10px 0;">${data.startTime}</p>
                <p style="color: #6b7280;">(${data.duration} minutes)</p>
              </div>
              
              <div class="checklist">
                <h3>📋 Pre-Session Checklist:</h3>
                <div class="checklist-item">✓ Review the session details and objectives</div>
                <div class="checklist-item">✓ Prepare any questions you want to ask</div>
                <div class="checklist-item">✓ Ensure you have necessary materials or equipment</div>
                <div class="checklist-item">✓ Plan to arrive/log in 5 minutes early</div>
              </div>
              
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard?tab=bookings" class="button">View Booking Details</a>
              
              <p>Need to reschedule? Please contact ${data.providerName} as soon as possible.</p>
              
              <p>We'll send you another reminder 1 hour before the session starts.</p>
              
              <p>See you tomorrow!<br><strong>The LocalGrid Team</strong></p>
            </div>
            <div class="footer">
              <p>© 2025 LocalGrid. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  }),

  // Booking reminder (1 hour before)
  bookingReminder1h: (data: {
    userName: string;
    listingTitle: string;
    providerName: string;
    startTime: string;
    duration: number;
  }) => ({
    subject: "🔔 Starting Soon: Your session is in 1 hour!",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
            .urgent-card { background: white; border: 3px solid #ef4444; border-radius: 8px; padding: 30px; margin: 20px 0; text-align: center; }
            .time { font-size: 48px; font-weight: bold; color: #ef4444; margin: 20px 0; }
            .button { display: inline-block; background: #ef4444; color: white; padding: 15px 40px; text-decoration: none; border-radius: 5px; margin: 20px 0; font-size: 18px; }
            .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔔 Your Session Starts Soon!</h1>
            </div>
            <div class="content">
              <h2>Hi ${data.userName}!</h2>
              
              <div class="urgent-card">
                <h3 style="margin-top: 0;">${data.listingTitle}</h3>
                <p style="font-size: 18px;"><strong>with ${data.providerName}</strong></p>
                <div class="time">1 HOUR</div>
                <p style="font-size: 20px; margin: 10px 0;"><strong>${data.startTime}</strong></p>
                <p style="color: #6b7280;">(${data.duration} minutes)</p>
              </div>
              
              <p style="text-align: center; font-size: 18px;"><strong>⏰ Time to get ready!</strong></p>
              
              <div style="text-align: center;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard?tab=bookings" class="button">Go to Booking</a>
              </div>
              
              <p style="text-align: center; color: #6b7280; margin-top: 30px;">
                Make sure you're prepared and ready to start on time.<br>
                We hope you have a great session!
              </p>
              
              <p style="text-align: center;"><strong>The LocalGrid Team</strong></p>
            </div>
            <div class="footer">
              <p>© 2025 LocalGrid. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  }),

  // Booking cancelled
  bookingCancelled: (data: {
    userName: string;
    listingTitle: string;
    providerName: string;
    reason?: string;
  }) => ({
    subject: "❌ Booking Cancelled",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
            .cancelled-card { background: white; border: 2px solid #ef4444; border-radius: 8px; padding: 20px; margin: 20px 0; }
            .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 10px 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>❌ Booking Cancelled</h1>
            </div>
            <div class="content">
              <h2>Hi ${data.userName},</h2>
              <p>Your booking has been cancelled.</p>
              
              <div class="cancelled-card">
                <h3>${data.listingTitle}</h3>
                <p>Provider: ${data.providerName}</p>
                ${data.reason ? `<p><strong>Reason:</strong> ${data.reason}</p>` : ""}
              </div>
              
              <p>If this was unexpected, please reach out to ${data.providerName} for more information.</p>
              
              <p>Don't worry! You can browse other listings and book new sessions anytime.</p>
              
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/listings" class="button">Browse Listings</a>
              
              <p>Best regards,<br><strong>The LocalGrid Team</strong></p>
            </div>
            <div class="footer">
              <p>© 2025 LocalGrid. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  }),

  // Session completed - request review
  sessionCompleted: (data: {
    userName: string;
    listingTitle: string;
    providerName: string;
    bookingId: string;
  }) => ({
    subject: "✨ How was your session? Leave a review!",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
            .session-card { background: white; border: 2px solid #8b5cf6; border-radius: 8px; padding: 20px; margin: 20px 0; }
            .stars { font-size: 32px; margin: 20px 0; text-align: center; }
            .button { display: inline-block; background: #8b5cf6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 10px 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✨ Session Completed!</h1>
            </div>
            <div class="content">
              <h2>Hi ${data.userName}!</h2>
              <p>We hope you enjoyed your session with <strong>${data.providerName}</strong>!</p>
              
              <div class="session-card">
                <h3>${data.listingTitle}</h3>
                <p>Your feedback helps others make informed decisions and helps providers improve their services.</p>
                
                <div class="stars">⭐⭐⭐⭐⭐</div>
                
                <p style="text-align: center;"><strong>Would you like to leave a review?</strong></p>
              </div>
              
              <div style="text-align: center;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard?tab=bookings" class="button">Leave a Review</a>
              </div>
              
              <p>Thank you for being part of the LocalGrid community!</p>
              
              <p>Best regards,<br><strong>The LocalGrid Team</strong></p>
            </div>
            <div class="footer">
              <p>© 2025 LocalGrid. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  }),
};

// Helper functions to send specific emails
export async function sendWelcomeEmail(to: string, userName: string) {
  const template = emailTemplates.welcome(userName);
  return sendEmail({
    to,
    subject: template.subject,
    html: template.html,
  });
}

export async function sendBookingConfirmationEmail(
  to: string,
  data: Parameters<typeof emailTemplates.bookingConfirmation>[0]
) {
  const template = emailTemplates.bookingConfirmation(data);
  return sendEmail({
    to,
    subject: template.subject,
    html: template.html,
  });
}

export async function sendBookingConfirmedEmail(
  to: string,
  data: Parameters<typeof emailTemplates.bookingConfirmed>[0]
) {
  const template = emailTemplates.bookingConfirmed(data);
  return sendEmail({
    to,
    subject: template.subject,
    html: template.html,
  });
}

export async function sendBookingReminder24hEmail(
  to: string,
  data: Parameters<typeof emailTemplates.bookingReminder24h>[0]
) {
  const template = emailTemplates.bookingReminder24h(data);
  return sendEmail({
    to,
    subject: template.subject,
    html: template.html,
  });
}

export async function sendBookingReminder1hEmail(
  to: string,
  data: Parameters<typeof emailTemplates.bookingReminder1h>[0]
) {
  const template = emailTemplates.bookingReminder1h(data);
  return sendEmail({
    to,
    subject: template.subject,
    html: template.html,
  });
}

export async function sendBookingCancelledEmail(
  to: string,
  data: Parameters<typeof emailTemplates.bookingCancelled>[0]
) {
  const template = emailTemplates.bookingCancelled(data);
  return sendEmail({
    to,
    subject: template.subject,
    html: template.html,
  });
}

export async function sendSessionCompletedEmail(
  to: string,
  data: Parameters<typeof emailTemplates.sessionCompleted>[0]
) {
  const template = emailTemplates.sessionCompleted(data);
  return sendEmail({
    to,
    subject: template.subject,
    html: template.html,
  });
}
