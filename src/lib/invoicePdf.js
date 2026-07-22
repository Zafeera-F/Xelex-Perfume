// Generates a printable A4 invoice PDF for an admin order-detail view.
// jsPDF's API is pure/imperative and has no dependency on React's version at
// all, unlike @react-pdf/renderer (whose own React-reconciler compatibility
// tends to lag behind React's releases) — see the sprint plan for the full
// rationale. jspdf-autotable handles the item table's column layout.

import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

const GOLD = [180, 140, 60];
const INK = [40, 35, 30];
const MUTED = [120, 115, 108];

function formatCurrency(amount) {
  return `Rs. ${Number(amount).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatDate(value) {
  return new Date(value).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" });
}

/**
 * generateInvoicePdf — takes the same `order` shape AdminOrderDetail.jsx
 * already fetches (adminOrder.service.js's toAdminDetail) and returns a
 * jsPDF document. Caller decides what to do with it — `.save(filename)` to
 * download, or `.output("bloburl")` to preview.
 */
export function generateInvoicePdf(order) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const marginX = 40;

  // Header — company identity + invoice label.
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(...GOLD);
  doc.text("XeleX Perfume", marginX, 50);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...MUTED);
  doc.text("UDYAM-TN-38-0037122 · Tamil Nadu, India", marginX, 65);
  doc.text("xelexventure@gmail.com · +91 9843172143", marginX, 77);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(...INK);
  doc.text("TAX INVOICE", pageWidth - marginX, 50, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`Order #: ${order.orderNumber}`, pageWidth - marginX, 68, { align: "right" });
  doc.text(`Date: ${formatDate(order.createdAt)}`, pageWidth - marginX, 82, { align: "right" });
  doc.text(`Status: ${order.status}`, pageWidth - marginX, 96, { align: "right" });

  doc.setDrawColor(...GOLD);
  doc.line(marginX, 108, pageWidth - marginX, 108);

  // Billed To / Ship To — two columns.
  const colWidth = (pageWidth - marginX * 2) / 2;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...INK);
  doc.text("Billed To", marginX, 130);
  doc.text("Ship To", marginX + colWidth, 130);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...MUTED);
  const billedLines = [order.customer.fullName, order.customer.email, order.customer.phone].filter(Boolean);
  billedLines.forEach((line, i) => doc.text(line, marginX, 146 + i * 13));

  const shipLines = [
    order.address.fullName,
    order.address.addressLine1,
    order.address.addressLine2,
    `${order.address.city}, ${order.address.state} ${order.address.pincode}`,
    order.address.country,
  ].filter(Boolean);
  shipLines.forEach((line, i) => doc.text(line, marginX + colWidth, 146 + i * 13));

  // Items table.
  const tableStartY = 146 + Math.max(billedLines.length, shipLines.length) * 13 + 20;
  autoTable(doc, {
    startY: tableStartY,
    head: [["Product", "Qty", "Unit Price", "Line Total"]],
    body: order.items.map((item) => [
      item.productName,
      String(item.quantity),
      formatCurrency(item.unitPrice),
      formatCurrency(item.lineTotal),
    ]),
    theme: "grid",
    headStyles: { fillColor: INK, textColor: 255 },
    styles: { fontSize: 9, cellPadding: 6 },
    margin: { left: marginX, right: marginX },
  });

  // Totals block, right-aligned below the table.
  let y = doc.lastAutoTable.finalY + 24;
  const totalsX = pageWidth - marginX;

  function totalsRow(label, value, { bold = false, color = INK } = {}) {
    doc.setFont("helvetica", bold ? "bold" : "normal");
    doc.setFontSize(bold ? 11 : 10);
    doc.setTextColor(...color);
    doc.text(label, totalsX - 140, y);
    doc.text(value, totalsX, y, { align: "right" });
    y += bold ? 20 : 16;
  }

  totalsRow("Subtotal", formatCurrency(order.subtotal));
  totalsRow("Shipping", order.shippingFee === 0 ? "Free" : formatCurrency(order.shippingFee));
  if (order.coupon) {
    totalsRow(`Discount (${order.coupon.code})`, `- ${formatCurrency(order.coupon.discountAmount)}`, { color: GOLD });
  }
  doc.setDrawColor(...MUTED);
  doc.line(totalsX - 140, y - 8, totalsX, y - 8);
  totalsRow("Total", formatCurrency(order.total), { bold: true, color: GOLD });

  // Payment details.
  y += 16;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...INK);
  doc.text("Payment Method: ", marginX, y);
  doc.setFont("helvetica", "normal");
  doc.text(order.paymentMethod, marginX + 100, y);

  if (order.payment) {
    y += 16;
    doc.setFont("helvetica", "bold");
    doc.text("Payment Status: ", marginX, y);
    doc.setFont("helvetica", "normal");
    doc.text(order.payment.status, marginX + 100, y);

    if (order.payment.transactionId) {
      y += 16;
      doc.setFont("helvetica", "bold");
      doc.text("Transaction ID: ", marginX, y);
      doc.setFont("helvetica", "normal");
      doc.text(order.payment.transactionId, marginX + 100, y);
    }
  }

  return doc;
}
