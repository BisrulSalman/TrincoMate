import nodemailer from 'nodemailer';
import templates from './emailTemplates.js';

const getMailUser = () => process.env.SMTP_USER || process.env.EMAIL_USER || process.env.GMAIL_USER;
const getMailPass = () => process.env.SMTP_PASS || process.env.EMAIL_PASS || process.env.GMAIL_APP_PASSWORD;

const isMailConfigured = () => Boolean(getMailUser() && getMailPass());

const missingMailConfig = () => {
  const missing = [];
  if (!getMailUser()) missing.push('SMTP_USER');
  if (!getMailPass()) missing.push('SMTP_PASS');
  return missing;
};

const getTransporter = () => {
  if (!isMailConfigured()) return null;

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: getMailUser(),
      pass: getMailPass(),
    },
  });
};

const formatDate = (value) => value || 'Not provided';

const escapeHtml = (value) => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#39;');

export const sendBookingApprovedEmail = async (booking) => {
  const recipient = booking.guestEmail || booking.userEmail;
  if (!recipient) {
    return { sent: false, skipped: true, reason: 'Booking has no email address.' };
  }

  const transporter = getTransporter();
  if (!transporter) {
    return {
      sent: false,
      skipped: true,
      reason: `Email sender is not configured. Missing: ${missingMailConfig().join(', ')}.`,
    };
  }

    const serviceName = booking.serviceName || 'your booking';
    const guestName = booking.guestName || 'Traveler';
    const from = process.env.MAIL_FROM || `TrincoMate <${getMailUser()}>`;
    const safeGuestName = escapeHtml(guestName);
    const safeServiceName = escapeHtml(serviceName);

    const lang = booking.language || booking.lang || booking.preferredLanguage || 'en';
    const tpl = templates[lang] || templates.en;

    const text = typeof tpl.bookingApprovedText === 'function' ? tpl.bookingApprovedText({ guestName, serviceName, checkIn: formatDate(booking.checkIn), checkOut: formatDate(booking.checkOut), guests: booking.guests || 1, total: booking.totalPrice || 0 }) : tpl.bookingApprovedText;
    const html = typeof tpl.bookingApprovedHtml === 'function' ? tpl.bookingApprovedHtml({ safeGuestName, safeServiceName, safeCheckIn: escapeHtml(formatDate(booking.checkIn)), safeCheckOut: escapeHtml(formatDate(booking.checkOut)), guests: booking.guests || 1, total: booking.totalPrice || 0 }) : tpl.bookingApprovedHtml;
    const subject = (tpl.bookingApprovedSubject || templates.en.bookingApprovedSubject).replace('{{service}}', serviceName);

    await transporter.sendMail({ from, to: recipient, subject, text, html });

    return { sent: true, skipped: false };
};
