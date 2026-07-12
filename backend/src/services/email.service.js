// Email service — the only place that calls the mail transporter. Every
// exported sender is fire-and-forget by design: none of them return the
// underlying promise, so a caller has no promise to (accidentally or not)
// await — sending an order/payment/status email can never delay or fail
// the request that triggered it.

import { transporter, isMailerConfigured, SMTP_FROM } from "../config/mailer.js";
import {
  orderConfirmationEmail,
  paymentSuccessEmail,
  orderShippedEmail,
  orderDeliveredEmail,
  orderCancelledEmail,
} from "../emails/orderEmailTemplates.js";

const RETRY_DELAYS_MS = [1000, 3000, 9000]; // 3 retries, short exponential backoff

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Sends one email, retrying on failure with a short backoff. Always
// resolves, never rejects — a permanent failure after exhausting retries is
// only ever logged (same dev-visibility level errorHandler.js already uses
// for unexpected errors), never thrown back into the caller's flow.
async function sendMailWithRetry({ to, subject, html }) {
  if (!isMailerConfigured) {
    return; // email not configured — silent no-op, same posture as Razorpay when unconfigured
  }

  const totalAttempts = RETRY_DELAYS_MS.length + 1;
  for (let attempt = 1; attempt <= totalAttempts; attempt++) {
    try {
      await transporter.sendMail({ from: SMTP_FROM, to, subject, html });
      return;
    } catch (err) {
      if (attempt === totalAttempts) {
        console.error(`Email to ${to} ("${subject}") failed permanently after ${attempt} attempts:`, err.message);
        return;
      }
      console.error(`Email to ${to} ("${subject}") failed on attempt ${attempt}, retrying:`, err.message);
      await delay(RETRY_DELAYS_MS[attempt - 1]);
    }
  }
}

export const emailService = {
  sendOrderConfirmationEmail(order, user) {
    const { subject, html } = orderConfirmationEmail(order, user);
    void sendMailWithRetry({ to: user.email, subject, html });
  },

  sendPaymentSuccessEmail(order, user) {
    const { subject, html } = paymentSuccessEmail(order, user);
    void sendMailWithRetry({ to: user.email, subject, html });
  },

  sendOrderShippedEmail(order, user) {
    const { subject, html } = orderShippedEmail(order, user);
    void sendMailWithRetry({ to: user.email, subject, html });
  },

  sendOrderDeliveredEmail(order, user) {
    const { subject, html } = orderDeliveredEmail(order, user);
    void sendMailWithRetry({ to: user.email, subject, html });
  },

  sendOrderCancelledEmail(order, user) {
    const { subject, html } = orderCancelledEmail(order, user);
    void sendMailWithRetry({ to: user.email, subject, html });
  },
};
