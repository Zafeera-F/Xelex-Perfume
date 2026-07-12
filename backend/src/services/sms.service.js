// SMS service — the only place that calls MSG91. Every exported sender is
// fire-and-forget by design, same contract as email.service.js: none of
// them return the underlying promise, so a caller has no promise to
// (accidentally or not) await — sending a delivery-status SMS can never
// delay or fail the request that triggered it.

// MSG91_SENDER_ID isn't sent in this request body — the Flow API's DLT
// template registration is where the sender ID is bound to a template, not
// something passed per-send. It's still required for isSmsConfigured
// (config/sms.js), as a real signal the MSG91 account is actually set up.
import { MSG91_AUTH_KEY, MSG91_TEMPLATES, MSG91_FLOW_URL, isSmsConfigured } from "../config/sms.js";

const RETRY_DELAYS_MS = [1000, 3000, 9000]; // 3 retries, short exponential backoff — same posture as email

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// MSG91 wants a bare country-code-prefixed number (e.g. "919876543210"),
// no "+" and no spaces/dashes — this dataset has a mix of "+91XXXXXXXXXX"
// and bare 10-digit formats, so normalize defensively rather than trust
// what was typed at checkout.
export function normalizePhone(phone) {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) return `91${digits}`;
  return digits;
}

// Sends one SMS via MSG91's Flow API (the DLT-compliant template route),
// retrying on failure with a short backoff. Always resolves, never
// rejects — a permanent failure after exhausting retries is only ever
// logged (same dev-visibility level errorHandler.js already uses for
// unexpected errors), never thrown back into the caller's flow.
async function sendSmsWithRetry({ to, templateId, variables }) {
  if (!isSmsConfigured || !templateId) {
    return; // SMS (or this specific template) not configured — silent no-op
  }

  const body = {
    template_id: templateId,
    short_url: "0",
    recipients: [{ mobiles: normalizePhone(to), ...variables }],
  };

  const totalAttempts = RETRY_DELAYS_MS.length + 1;
  for (let attempt = 1; attempt <= totalAttempts; attempt++) {
    try {
      const res = await fetch(MSG91_FLOW_URL, {
        method: "POST",
        headers: { authkey: MSG91_AUTH_KEY, "Content-Type": "application/json", accept: "application/json" },
        body: JSON.stringify(body),
      });
      // MSG91 signals failure (bad authkey, invalid template_id, etc.) via
      // `type` in the JSON body — it returns HTTP 200 even for a rejected
      // request, so checking res.ok alone would silently treat a failed
      // send as a success and never retry or log it.
      const responseBody = await res.json().catch(() => null);
      if (!res.ok || responseBody?.type !== "success") {
        throw new Error(`MSG91 rejected the request: ${res.status} ${JSON.stringify(responseBody)}`);
      }
      return;
    } catch (err) {
      if (attempt === totalAttempts) {
        console.error(`SMS to ${to} (template ${templateId}) failed permanently after ${attempt} attempts:`, err.message);
        return;
      }
      console.error(`SMS to ${to} (template ${templateId}) failed on attempt ${attempt}, retrying:`, err.message);
      await delay(RETRY_DELAYS_MS[attempt - 1]);
    }
  }
}

// `variables` keys (var1/var2/var3) must match whatever placeholder names
// each DLT-approved template was registered with in the MSG91 dashboard —
// update these to match your actual template wording once registered.
export const smsService = {
  sendOrderPlacedSms(order) {
    void sendSmsWithRetry({
      to: order.address.phone,
      templateId: MSG91_TEMPLATES.ORDER_PLACED,
      variables: { var1: order.orderNumber },
    });
  },

  sendOrderShippedSms(order) {
    void sendSmsWithRetry({
      to: order.address.phone,
      templateId: MSG91_TEMPLATES.ORDER_SHIPPED,
      variables: { var1: order.orderNumber },
    });
  },

  sendOutForDeliverySms(order) {
    void sendSmsWithRetry({
      to: order.address.phone,
      templateId: MSG91_TEMPLATES.OUT_FOR_DELIVERY,
      variables: { var1: order.orderNumber },
    });
  },

  sendOrderDeliveredSms(order) {
    void sendSmsWithRetry({
      to: order.address.phone,
      templateId: MSG91_TEMPLATES.DELIVERED,
      variables: { var1: order.orderNumber },
    });
  },
};
