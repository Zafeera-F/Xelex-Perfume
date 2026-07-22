// SMS config — the one place that knows the MSG91 credentials.
// -----------------------------------------------------------------------------
// Same graceful-degradation posture as config/mailer.js and config/razorpay.js:
// SMS is not required for the app to function, so if unconfigured, sends just
// silently no-op (see services/sms.service.js) — order placement, status
// updates, everything else keeps working normally either way.
//
// MSG91's compliant delivery routes require a pre-registered, DLT-approved
// template per message (a TRAI requirement for transactional SMS to Indian
// numbers) — free-text SMS isn't an option here, hence one template ID per
// event rather than a single generic "from"/"body" pair.

export const MSG91_AUTH_KEY = process.env.MSG91_AUTH_KEY;
export const MSG91_SENDER_ID = process.env.MSG91_SENDER_ID;

export const MSG91_TEMPLATES = {
  ORDER_PLACED: process.env.MSG91_TEMPLATE_ORDER_PLACED,
  ORDER_SHIPPED: process.env.MSG91_TEMPLATE_ORDER_SHIPPED,
  OUT_FOR_DELIVERY: process.env.MSG91_TEMPLATE_OUT_FOR_DELIVERY,
  DELIVERED: process.env.MSG91_TEMPLATE_DELIVERED,
  OTP_LOGIN: process.env.MSG91_TEMPLATE_OTP_LOGIN,
};

export const isSmsConfigured = Boolean(MSG91_AUTH_KEY && MSG91_SENDER_ID);

export const MSG91_FLOW_URL = "https://control.msg91.com/api/v5/flow/";
