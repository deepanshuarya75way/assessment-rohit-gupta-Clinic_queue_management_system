import axios from 'axios';
import nodemailer from 'nodemailer';
import { env } from '../config/env';

let mailTransporter: nodemailer.Transporter | null = null;

function getMailTransporter(): nodemailer.Transporter | null {
  if (mailTransporter) return mailTransporter;
  if (!env.SMTP_HOST || !env.SMTP_USER) return null;

  mailTransporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_PORT === 465,
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS,
    },
  });
  return mailTransporter;
}

export async function sendWhatsApp(phoneNumber: string, message: string): Promise<boolean> {
  if (!env.WHATSAPP_TOKEN || !env.WHATSAPP_PHONE_ID) {
    console.log(`[WhatsApp] Skipped (not configured). To ${phoneNumber}: ${message}`);
    return false;
  }
  try {
    await axios.post(
      `https://graph.facebook.com/v18.0/${env.WHATSAPP_PHONE_ID}/messages`,
      {
        messaging_product: 'whatsapp',
        to: phoneNumber,
        type: 'text',
        text: { body: message },
      },
      {
        headers: {
          Authorization: `Bearer ${env.WHATSAPP_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return true;
  } catch (err) {
    console.error('[WhatsApp] Send failed:', err);
    return false;
  }
}

export async function sendEmail(to: string, subject: string, body: string): Promise<boolean> {
  const transporter = getMailTransporter();
  if (!transporter) {
    console.log(`[Email] Skipped (not configured). To ${to}: ${subject}`);
    return false;
  }
  try {
    await transporter.sendMail({
      from: env.EMAIL_FROM,
      to,
      subject,
      html: body,
    });
    return true;
  } catch (err) {
    console.error('[Email] Send failed:', err);
    return false;
  }
}

export async function sendTokenConfirmation(phone: string, tokenNumber: string, clinicName: string): Promise<void> {
  const msg = `${clinicName}\nYour token number is ${tokenNumber}. Please wait for your turn. Track live queue status at the clinic.`;
  await sendWhatsApp(phone, msg);
}

export async function sendYourTurnAlert(phone: string, tokenNumber: string): Promise<void> {
  const msg = `Your token ${tokenNumber} is being called now. Please proceed to the doctor's room.`;
  await sendWhatsApp(phone, msg);
}

export async function sendAppointmentReminder(phone: string, doctorName: string, date: string, time: string): Promise<boolean> {
  const msg = `Reminder: You have an appointment with Dr. ${doctorName} on ${date} at ${time}. Please arrive 10 minutes early.`;

   return await sendWhatsApp(phone, msg);
}


