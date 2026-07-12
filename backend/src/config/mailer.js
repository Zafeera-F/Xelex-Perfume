// Mail transporter — the one place that knows the SMTP credentials.
// -----------------------------------------------------------------------------
// Deliberately does NOT fail loudly at import time the way jwt.js does for
// JWT_SECRET — email is not required for the app to function (same posture
// as config/razorpay.js for payments). If SMTP isn't configured, transactional
// emails just silently no-op (see services/email.service.js); order placement,
// payments, auth, and everything else keep working normally either way.

import nodemailer from "nodemailer";

const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = process.env.SMTP_PORT;
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;

export const SMTP_FROM = process.env.SMTP_FROM || "XeleX Perfumes <no-reply@xelexperfumes.com>";

export const isMailerConfigured = Boolean(SMTP_HOST && SMTP_PORT && SMTP_USER && SMTP_PASS);

export const transporter = isMailerConfigured
  ? nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT),
      secure: Number(SMTP_PORT) === 465, // 465 is implicit TLS; 587/25 use STARTTLS, which nodemailer negotiates automatically when secure is false
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    })
  : null;
