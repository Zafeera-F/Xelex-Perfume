// Thin helpers over the Razorpay payment API — same pattern as
// src/lib/orders.js — plus a small loader for Razorpay's own checkout.js
// widget script.

import { apiRequest } from "./api";

export function initiateRazorpayCheckout({ items, shipping }) {
  return apiRequest("/api/payments/razorpay/checkout", {
    method: "POST",
    body: { items, shipping },
  });
}

export function verifyRazorpayPayment({ razorpay_order_id, razorpay_payment_id, razorpay_signature }) {
  return apiRequest("/api/payments/razorpay/verify", {
    method: "POST",
    body: { razorpay_order_id, razorpay_payment_id, razorpay_signature },
  }).then((data) => data.order);
}

const CHECKOUT_SCRIPT_URL = "https://checkout.razorpay.com/v1/checkout.js";

let loadPromise = null;

// Injects Razorpay's checkout.js once and resolves once it's ready to use
// (window.Razorpay defined). Safe to call repeatedly — later calls reuse
// the same in-flight/completed promise instead of injecting the script again.
export function loadRazorpayCheckoutScript() {
  if (window.Razorpay) return Promise.resolve();
  if (loadPromise) return loadPromise;

  loadPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = CHECKOUT_SCRIPT_URL;
    script.onload = () => resolve();
    script.onerror = () => {
      loadPromise = null; // allow retrying on a later call
      reject(new Error("Unable to load the payment gateway. Please check your connection and try again."));
    };
    document.body.appendChild(script);
  });

  return loadPromise;
}
