// Transactional email templates — plain template-literal HTML, no templating
// engine dependency. Every template shares `emailLayout` for a consistent
// header/footer and responsive shell; email clients don't reliably support
// flexbox/grid, so this uses the classic table-based layout with inline
// styles (the one styling approach that survives Outlook/Gmail/Apple Mail
// alike), plus a <style> media query as a progressive enhancement for the
// clients that do honor it.
//
// Colors are hardcoded hex, not CSS variables — email HTML can't reference
// src/index.css. A white body (not the storefront's near-black) is
// deliberate: dark email bodies render inconsistently across clients
// (Outlook desktop in particular can drop a dark background while keeping
// light text, making it unreadable) — the gold accent + wordmark carries
// the brand identity instead.

const GOLD = "#d4af37";
const INK = "#1a1a1a";
const MUTED = "#6b6b6b";
const BORDER = "#e5e2da";
const SUCCESS = "#2f8a53";
const ERROR = "#b8394a";
const CREAM = "#faf9f6";

function formatCurrency(amount) {
  return `₹${Number(amount).toLocaleString("en-IN")}`;
}

function formatDate(date) {
  return new Date(date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function itemsTable(items) {
  const rows = items
    .map(
      (item) => `
        <tr>
          <td style="padding:12px 0;border-bottom:1px solid ${BORDER};font-size:14px;color:${INK};">
            ${item.productName}
            <div style="font-size:12px;color:${MUTED};margin-top:2px;">Qty ${item.quantity} × ${formatCurrency(item.unitPrice)}</div>
          </td>
          <td style="padding:12px 0;border-bottom:1px solid ${BORDER};font-size:14px;color:${INK};text-align:right;white-space:nowrap;">
            ${formatCurrency(item.lineTotal)}
          </td>
        </tr>`
    )
    .join("");

  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;">
      ${rows}
    </table>`;
}

function totalsBlock(order) {
  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;margin-top:12px;">
      <tr>
        <td style="padding:4px 0;font-size:13px;color:${MUTED};">Subtotal</td>
        <td style="padding:4px 0;font-size:13px;color:${MUTED};text-align:right;">${formatCurrency(order.subtotal)}</td>
      </tr>
      <tr>
        <td style="padding:4px 0;font-size:13px;color:${MUTED};">Shipping</td>
        <td style="padding:4px 0;font-size:13px;color:${MUTED};text-align:right;">${
          Number(order.shippingFee) === 0 ? "Free" : formatCurrency(order.shippingFee)
        }</td>
      </tr>
      <tr>
        <td style="padding:10px 0 0;font-size:15px;color:${INK};font-weight:600;border-top:1px solid ${BORDER};">Total</td>
        <td style="padding:10px 0 0;font-size:15px;color:${GOLD};font-weight:600;text-align:right;border-top:1px solid ${BORDER};">${formatCurrency(order.total)}</td>
      </tr>
    </table>`;
}

function addressBlock(address) {
  if (!address) return "";
  return `
    <p style="margin:0;font-size:14px;line-height:1.6;color:${INK};">
      ${address.fullName}<br />
      ${address.addressLine1}${address.addressLine2 ? `, ${address.addressLine2}` : ""}<br />
      ${address.city}, ${address.state} ${address.pincode}<br />
      ${address.country || "India"}
    </p>`;
}

export function emailLayout(previewText, bodyHtml) {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>XeleX Perfume</title>
    <style>
      @media (max-width: 600px) {
        .container { width: 100% !important; }
        .content-padding { padding: 24px !important; }
      }
    </style>
  </head>
  <body style="margin:0;padding:0;background:${CREAM};font-family:Georgia,'Times New Roman',serif;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${previewText}</div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${CREAM};">
      <tr>
        <td align="center" style="padding:32px 16px;">
          <table role="presentation" class="container" width="600" cellpadding="0" cellspacing="0" style="width:600px;max-width:600px;background:#ffffff;border:1px solid ${BORDER};">
            <tr>
              <td style="padding:28px 32px;border-bottom:2px solid ${GOLD};text-align:center;">
                <span style="font-size:20px;letter-spacing:3px;color:${INK};">XELEX PERFUME</span>
              </td>
            </tr>
            <tr>
              <td class="content-padding" style="padding:32px;">
                ${bodyHtml}
              </td>
            </tr>
            <tr>
              <td style="padding:20px 32px;background:${CREAM};border-top:1px solid ${BORDER};text-align:center;">
                <p style="margin:0;font-size:12px;color:${MUTED};">
                  XeleX Perfume · This is an automated message, please don't reply directly to this email.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export function orderConfirmationEmail(order, user) {
  const body = `
    <h1 style="margin:0 0 4px;font-size:22px;color:${INK};font-weight:normal;">Thank you for your order, ${user.fullName.split(" ")[0]}</h1>
    <p style="margin:0 0 24px;font-size:14px;color:${MUTED};">Order ${order.orderNumber} · Placed ${formatDate(order.createdAt)}</p>
    <p style="margin:0 0 20px;font-size:14px;line-height:1.6;color:${INK};">
      We've received your order and it's being prepared. You'll get another email once it ships.
    </p>
    ${itemsTable(order.items)}
    ${totalsBlock(order)}
    <div style="margin-top:28px;">
      <p style="margin:0 0 8px;font-size:12px;letter-spacing:1px;text-transform:uppercase;color:${MUTED};">Shipping To</p>
      ${addressBlock(order.address)}
    </div>
    <p style="margin:24px 0 0;font-size:13px;color:${MUTED};">
      Payment method: ${order.paymentMethod === "COD" ? "Cash on Delivery" : "UPI"}
    </p>`;
  return { subject: `Order Confirmed — ${order.orderNumber}`, html: emailLayout(`Your XeleX order ${order.orderNumber} is confirmed.`, body) };
}

export function paymentSuccessEmail(order, user) {
  const body = `
    <h1 style="margin:0 0 4px;font-size:22px;color:${INK};font-weight:normal;">Payment received, ${user.fullName.split(" ")[0]}</h1>
    <p style="margin:0 0 24px;font-size:14px;color:${MUTED};">Order ${order.orderNumber}</p>
    <p style="margin:0 0 20px;font-size:14px;line-height:1.6;color:${INK};">
      We've successfully received your payment of <strong>${formatCurrency(order.total)}</strong>${
        order.payment?.transactionId ? ` (ref: ${order.payment.transactionId})` : ""
      }. Your order is confirmed and being prepared for shipment.
    </p>
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:8px 0 20px;">
      <tr>
        <td style="padding:8px 16px;background:${CREAM};border-left:3px solid ${SUCCESS};">
          <span style="font-size:13px;color:${SUCCESS};font-weight:600;">Payment Successful</span>
        </td>
      </tr>
    </table>
    ${itemsTable(order.items)}
    ${totalsBlock(order)}`;
  return { subject: `Payment Received — ${order.orderNumber}`, html: emailLayout(`We've received your payment for order ${order.orderNumber}.`, body) };
}

export function orderShippedEmail(order, user) {
  const body = `
    <h1 style="margin:0 0 4px;font-size:22px;color:${INK};font-weight:normal;">Your order is on its way, ${user.fullName.split(" ")[0]}</h1>
    <p style="margin:0 0 24px;font-size:14px;color:${MUTED};">Order ${order.orderNumber}</p>
    <p style="margin:0 0 12px;font-size:14px;line-height:1.6;color:${INK};">
      Good news — your order has shipped and is on its way to you.
    </p>
    <div style="margin:0 0 24px;">
      <p style="margin:0 0 8px;font-size:12px;letter-spacing:1px;text-transform:uppercase;color:${MUTED};">Shipping To</p>
      ${addressBlock(order.address)}
    </div>
    ${itemsTable(order.items)}`;
  return { subject: `Order Shipped — ${order.orderNumber}`, html: emailLayout(`Order ${order.orderNumber} has shipped.`, body) };
}

export function orderDeliveredEmail(order, user) {
  const body = `
    <h1 style="margin:0 0 4px;font-size:22px;color:${INK};font-weight:normal;">Delivered! Enjoy, ${user.fullName.split(" ")[0]}</h1>
    <p style="margin:0 0 24px;font-size:14px;color:${MUTED};">Order ${order.orderNumber}</p>
    <p style="margin:0 0 20px;font-size:14px;line-height:1.6;color:${INK};">
      Your order has been delivered. We hope you love it — if a moment allows, we'd appreciate hearing what you
      think of your new fragrance.
    </p>
    ${itemsTable(order.items)}`;
  return { subject: `Delivered — ${order.orderNumber}`, html: emailLayout(`Order ${order.orderNumber} has been delivered.`, body) };
}

export function orderCancelledEmail(order, user) {
  const body = `
    <h1 style="margin:0 0 4px;font-size:22px;color:${INK};font-weight:normal;">Order cancelled</h1>
    <p style="margin:0 0 24px;font-size:14px;color:${MUTED};">Order ${order.orderNumber}</p>
    <p style="margin:0 0 12px;font-size:14px;line-height:1.6;color:${INK};">
      Hi ${user.fullName.split(" ")[0]}, your order has been cancelled. If you were charged, any payment already
      collected will be refunded to your original payment method.
    </p>
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:8px 0 20px;">
      <tr>
        <td style="padding:8px 16px;background:${CREAM};border-left:3px solid ${ERROR};">
          <span style="font-size:13px;color:${ERROR};font-weight:600;">Order Cancelled</span>
        </td>
      </tr>
    </table>
    ${itemsTable(order.items)}
    ${totalsBlock(order)}`;
  return { subject: `Order Cancelled — ${order.orderNumber}`, html: emailLayout(`Order ${order.orderNumber} has been cancelled.`, body) };
}
