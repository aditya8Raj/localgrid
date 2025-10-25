import nodemailer from 'nodemailer';
import { prisma } from './prisma';

// Create reusable transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SMTP_HOST,
  port: parseInt(process.env.EMAIL_SMTP_PORT || '587'),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_SMTP_USER,
    pass: process.env.EMAIL_SMTP_PASS,
  },
});

/**
 * Send booking reminder email
 * @param bookingId Booking ID
 */
export async function sendBookingReminder(bookingId: string): Promise<void> {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        user: true,
        listing: {
          include: {
            owner: true,
          },
        },
      },
    });

    if (!booking || booking.reminderSent) {
      return;
    }

    const timeUntil = booking.startAt.getTime() - Date.now();
    const hoursUntil = Math.round(timeUntil / (1000 * 60 * 60));

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #4F46E5; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background-color: #f9fafb; }
            .button { 
              display: inline-block; 
              padding: 12px 24px; 
              background-color: #4F46E5; 
              color: white; 
              text-decoration: none; 
              border-radius: 6px; 
              margin: 20px 0;
            }
            .footer { padding: 20px; text-align: center; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Booking Reminder</h1>
            </div>
            <div class="content">
              <h2>Hi ${booking.user.name || 'there'},</h2>
              <p>This is a reminder about your upcoming session:</p>
              <ul>
                <li><strong>Service:</strong> ${booking.listing.title}</li>
                <li><strong>Provider:</strong> ${booking.listing.owner.name || 'Unknown'}</li>
                <li><strong>Time:</strong> ${booking.startAt.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</li>
                <li><strong>Duration:</strong> ${booking.listing.durationMins} minutes</li>
              </ul>
              <p>Your session starts in approximately <strong>${hoursUntil} hour${hoursUntil !== 1 ? 's' : ''}</strong>.</p>
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/bookings/${booking.id}" class="button">View Booking Details</a>
            </div>
            <div class="footer">
              <p>LocalGrid - Hyperlocal Skill Exchange Platform</p>
              <p>${process.env.NEXT_PUBLIC_APP_URL}</p>
            </div>
          </div>
        </body>
      </html>
    `;

    await transporter.sendMail({
      from: `"LocalGrid" <${process.env.EMAIL_SMTP_USER}>`,
      to: booking.user.email,
      subject: `Reminder: Your session with ${booking.listing.owner.name} starts in ${hoursUntil} hour${hoursUntil !== 1 ? 's' : ''}`,
      html,
    });

    // Mark reminder as sent
    await prisma.booking.update({
      where: { id: bookingId },
      data: { reminderSent: true },
    });
  } catch (error) {
    console.error('Error sending booking reminder:', error);
    throw error;
  }
}

/**
 * Send booking confirmation email
 * @param bookingId Booking ID
 */
export async function sendBookingConfirmation(bookingId: string): Promise<void> {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        user: true,
        listing: {
          include: {
            owner: true,
          },
        },
      },
    });

    if (!booking) {
      return;
    }

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #10B981; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background-color: #f9fafb; }
            .button { 
              display: inline-block; 
              padding: 12px 24px; 
              background-color: #10B981; 
              color: white; 
              text-decoration: none; 
              border-radius: 6px; 
              margin: 20px 0;
            }
            .footer { padding: 20px; text-align: center; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✓ Booking Confirmed</h1>
            </div>
            <div class="content">
              <h2>Hi ${booking.user.name || 'there'},</h2>
              <p>Your booking has been confirmed!</p>
              <ul>
                <li><strong>Service:</strong> ${booking.listing.title}</li>
                <li><strong>Provider:</strong> ${booking.listing.owner.name || 'Unknown'}</li>
                <li><strong>Time:</strong> ${booking.startAt.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</li>
                <li><strong>Duration:</strong> ${booking.listing.durationMins} minutes</li>
                ${booking.priceCents ? `<li><strong>Price:</strong> ₹${(booking.priceCents / 100).toFixed(2)}</li>` : ''}
                ${booking.creditsUsed ? `<li><strong>Credits:</strong> ${booking.creditsUsed}</li>` : ''}
              </ul>
              <p>The provider will contact you soon with more details.</p>
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/bookings/${booking.id}" class="button">View Booking</a>
            </div>
            <div class="footer">
              <p>LocalGrid - Hyperlocal Skill Exchange Platform</p>
              <p>${process.env.NEXT_PUBLIC_APP_URL}</p>
            </div>
          </div>
        </body>
      </html>
    `;

    await transporter.sendMail({
      from: `"LocalGrid" <${process.env.EMAIL_SMTP_USER}>`,
      to: booking.user.email,
      subject: 'Booking Confirmed - ' + booking.listing.title,
      html,
    });
  } catch (error) {
    console.error('Error sending booking confirmation:', error);
    throw error;
  }
}

/**
 * Send welcome email to new user
 * @param userId User ID
 */
export async function sendWelcomeEmail(userId: string): Promise<void> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return;
    }

    const dashboardUrl = user.userType === 'SKILL_PROVIDER' 
      ? '/dashboard/provider' 
      : '/dashboard/creator';

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #4F46E5; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background-color: #f9fafb; }
            .button { 
              display: inline-block; 
              padding: 12px 24px; 
              background-color: #4F46E5; 
              color: white; 
              text-decoration: none; 
              border-radius: 6px; 
              margin: 20px 0;
            }
            .footer { padding: 20px; text-align: center; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to LocalGrid!</h1>
            </div>
            <div class="content">
              <h2>Hi ${user.name || 'there'},</h2>
              <p>Welcome to LocalGrid - India's hyperlocal skill exchange platform!</p>
              <p>You've signed up as a <strong>${user.userType === 'SKILL_PROVIDER' ? 'Skill Provider' : 'Project Creator'}</strong>.</p>
              ${user.userType === 'SKILL_PROVIDER' 
                ? '<p>You can now create listings for your skills and start accepting bookings from project creators in your area.</p>' 
                : '<p>You can now browse skill providers, book sessions, and create community projects.</p>'
              }
              <a href="${process.env.NEXT_PUBLIC_APP_URL}${dashboardUrl}" class="button">Go to Dashboard</a>
            </div>
            <div class="footer">
              <p>LocalGrid - Hyperlocal Skill Exchange Platform</p>
              <p>${process.env.NEXT_PUBLIC_APP_URL}</p>
            </div>
          </div>
        </body>
      </html>
    `;

    await transporter.sendMail({
      from: `"LocalGrid" <${process.env.EMAIL_SMTP_USER}>`,
      to: user.email,
      subject: 'Welcome to LocalGrid!',
      html,
    });
  } catch (error) {
    console.error('Error sending welcome email:', error);
    // Don't throw - welcome email is not critical
  }
}

/**
 * Generic email sender
 * @param options Email options
 */
export async function sendEmail(options: {
  to: string;
  subject: string;
  html: string;
  text?: string;
}): Promise<void> {
  try {
    await transporter.sendMail({
      from: `"LocalGrid" <${process.env.EMAIL_SMTP_USER}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    });
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}

// Verify transporter configuration
export async function verifyEmailConfig(): Promise<boolean> {
  try {
    await transporter.verify();
    console.log('Email transporter is ready');
    return true;
  } catch (error) {
    console.error('Email transporter error:', error);
    return false;
  }
}
