'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import apiServiceHandler from '../../../service/apiService';
import SuperAdminShell from '../SuperAdminShell';
import { generateInvoicePDF } from '../../../lib/generateInvoicePDF';
import s from './Payments.module.css';

const BackArrow = () => (
  <svg viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
  </svg>
);

const PdfIcon = () => (
  <svg viewBox="0 0 20 20" fill="currentColor" style={{ width: 16, height: 16 }}>
    <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z" clipRule="evenodd" />
  </svg>
);

const PAYMENT_STATUS_COLORS = {
  paid:     { bg: '#dcfce7', color: '#16a34a' },
  pending:  { bg: '#fef9c3', color: '#ca8a04' },
  failed:   { bg: '#fee2e2', color: '#dc2626' },
  refunded: { bg: '#e0f2fe', color: '#0284c7' },
};

function fmtDate(val) {
  if (!val) return '—';
  const d = new Date(val);
  if (isNaN(d)) return '—';
  return `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}`;
}

function fmtAmount(val, currency = 'INR') {
  if (val === null || val === undefined) return '—';
  const symbol = currency === 'INR' ? 'Rs.' : (currency + ' ');
  return `${symbol}${Number(val).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

const vs = {
  card:    { background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '24px 28px', marginBottom: 20 },
  section: { fontSize: 12, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 14 },
  grid:    { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px 32px' },
  row:     { display: 'flex', flexDirection: 'column', gap: 3 },
  label:   { fontSize: 11.5, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.04em' },
  value:   { fontSize: 13.5, color: '#111827' },
};

function Row({ label, value }) {
  return (
    <div style={vs.row}>
      <span style={vs.label}>{label}</span>
      <span style={vs.value}>{value || '—'}</span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Legacy copy — superseded by src/lib/generateInvoicePDF.js (kept for reference)
// ─────────────────────────────────────────────────────────────────────────────

async function _generateInvoicePDFLegacy(invoice) {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });

  const PW   = 210;
  const PH   = 297;
  const ML   = 14;   // left margin
  const MR   = PW - 14; // right margin x
  const CW   = MR - ML; // content width 182mm

  // ── Colours ────────────────────────────────────────────────────────────────
  const TEAL       = [13, 148, 136];   // #0d9488
  const TEAL_DARK  = [15, 118, 110];   // #0f766e
  const TEAL_LIGHT = [204, 240, 237];  // light teal
  const GRAY_900   = [17, 24, 39];
  const GRAY_600   = [75, 85, 99];
  const GRAY_400   = [156, 163, 175];
  const GRAY_100   = [243, 244, 246];
  const GRAY_200   = [229, 231, 235];
  const WHITE      = [255, 255, 255];

  const cur = invoice.currency || 'INR';
  const sym = cur === 'INR' ? 'Rs.' : cur + ' ';

  function money(val) {
    if (val === null || val === undefined || val === '') return `${sym}0.00`;
    return `${sym}${Number(val).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  function fmt(val) {
    if (!val) return '—';
    const d = new Date(val);
    if (isNaN(d)) return '—';
    return `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}`;
  }
  function v(val) { return val || '—'; }
  function setFont(style, size, color) {
    doc.setFont('helvetica', style);
    doc.setFontSize(size);
    doc.setTextColor(...(color || GRAY_900));
  }

  let y = 0;

  // ══════════════════════════════════════════════════════════════════════════
  // HEADER  (full-width teal band)
  // ══════════════════════════════════════════════════════════════════════════
  doc.setFillColor(...TEAL);
  doc.rect(0, 0, PW, 42, 'F');

  // Brand / company name  (left)
  setFont('bold', 22, WHITE);
  doc.text('LMS PLATFORM', ML, 17);

  setFont('normal', 8.5, [185, 236, 230]);
  doc.text('Learning Management System', ML, 24);

  // "INVOICE" (right)
  setFont('bold', 28, WHITE);
  doc.text('INVOICE', MR, 16, { align: 'right' });

  setFont('normal', 9, [185, 236, 230]);
  doc.text(v(invoice.invoice_no), MR, 24, { align: 'right' });

  // Status pill (white background, coloured text)
  const status = (invoice.payment_status || 'pending').toUpperCase();
  const pillW = 26;
  const pillH = 7;
  const pillX = MR - pillW;
  const pillY = 29;
  doc.setFillColor(...WHITE);
  doc.roundedRect(pillX, pillY, pillW, pillH, 2, 2, 'F');
  const pillColors = { PAID: [22,163,74], PENDING: [202,138,4], FAILED: [220,38,38], REFUNDED: [2,132,199] };
  const pc = pillColors[status] || [107,114,128];
  setFont('bold', 7.5, pc);
  doc.text(status, pillX + pillW / 2, pillY + 4.7, { align: 'center' });

  y = 50;

  // ══════════════════════════════════════════════════════════════════════════
  // BILL-TO  &  INVOICE DETAILS  (two columns)
  // ══════════════════════════════════════════════════════════════════════════
  const colMid = ML + CW / 2 + 4;

  // Section labels
  setFont('bold', 7, TEAL);
  doc.text('BILLED TO', ML, y);
  doc.text('INVOICE DETAILS', colMid, y);
  y += 4;

  // Thin teal underlines
  doc.setDrawColor(...TEAL);
  doc.setLineWidth(0.4);
  doc.line(ML, y, ML + 50, y);
  doc.line(colMid, y, colMid + 58, y);
  y += 5;

  // Bill-to block
  const billStartY = y;

  setFont('bold', 10, GRAY_900);
  doc.text(v(invoice.bill_name || invoice.org_id?.org_name), ML, y);
  y += 5.5;

  const billLines = [
    invoice.bill_email || invoice.org_id?.org_email,
    invoice.bill_phone || invoice.org_id?.org_phone,
    invoice.bill_addr,
    [invoice.bill_city, invoice.bill_state].filter(Boolean).join(', '),
    [invoice.bill_country, invoice.bill_pincode].filter(Boolean).join(' — '),
    invoice.bill_gst_no ? `GSTIN: ${invoice.bill_gst_no}` : null,
  ].filter(Boolean);

  setFont('normal', 8.5, GRAY_600);
  billLines.forEach(line => {
    doc.text(line, ML, y);
    y += 4.8;
  });

  // Invoice details block (right column, same vertical start as bill-to)
  let yd = billStartY;
  const labelX = colMid;
  const valueX = colMid + 30;

  const detailRows = [
    ['Invoice No',     v(invoice.invoice_no)],
    ['Invoice Date',   fmt(invoice.createdAt)],
    ['Payment Date',   fmt(invoice.payment_date)],
    ['Payment Method', v(invoice.payment_method)],
    ['Currency',       v(cur)],
    ['Order Ref',      v(invoice.order_id?._id)],
  ];

  detailRows.forEach(([label, val]) => {
    setFont('bold', 7.5, GRAY_400);
    doc.text(label.toUpperCase(), labelX, yd);
    setFont('normal', 8.5, GRAY_900);
    doc.text(val, valueX, yd);
    yd += 5.5;
  });

  y = Math.max(y, yd) + 8;

  // ══════════════════════════════════════════════════════════════════════════
  // ITEMS TABLE
  // ══════════════════════════════════════════════════════════════════════════

  // Table header row
  doc.setFillColor(...GRAY_900);
  doc.rect(ML, y, CW, 8, 'F');

  setFont('bold', 7.5, WHITE);
  doc.text('#',           ML + 3,       y + 5.5);
  doc.text('DESCRIPTION', ML + 12,      y + 5.5);
  doc.text('ORG',         ML + CW - 88, y + 5.5);
  doc.text('UNIT PRICE',  ML + CW - 48, y + 5.5);
  doc.text('AMOUNT',      MR - 2,       y + 5.5, { align: 'right' });
  y += 8;

  // Item row
  const creditTitle = invoice.order_id?.credit_id?.title || 'Credit Package';
  const orgName     = invoice.org_id?.org_name || '—';
  const amount      = money(invoice.sub_total);

  doc.setFillColor(250, 254, 253);
  doc.rect(ML, y, CW, 12, 'F');

  // Left vertical accent line on item row
  doc.setFillColor(...TEAL);
  doc.rect(ML, y, 1.2, 12, 'F');

  setFont('normal', 8.5, GRAY_900);
  doc.text('1',         ML + 3,        y + 7.5);
  setFont('bold', 9, GRAY_900);
  doc.text(creditTitle, ML + 12,       y + 5.5);
  setFont('normal', 8, GRAY_600);
  doc.text('Credits package',  ML + 12, y + 10.5);
  setFont('normal', 8.5, GRAY_900);
  doc.text(orgName,     ML + CW - 88,  y + 7.5);
  doc.text(amount,      ML + CW - 48,  y + 7.5);
  setFont('bold', 9, GRAY_900);
  doc.text(amount,      MR - 2,        y + 7.5, { align: 'right' });
  y += 12;

  // Bottom border under table
  doc.setDrawColor(...GRAY_200);
  doc.setLineWidth(0.3);
  doc.line(ML, y, MR, y);
  y += 10;

  // ══════════════════════════════════════════════════════════════════════════
  // TOTALS  (right-aligned block)
  // ══════════════════════════════════════════════════════════════════════════
  const totW   = 80;
  const totX   = MR - totW;
  const labelW = 44;

  function totLine(label, val, bold = false, highlight = false) {
    if (highlight) {
      doc.setFillColor(...TEAL_DARK);
      doc.rect(totX, y - 4, totW, 9, 'F');
      setFont('bold', 10, WHITE);
      doc.text(label, totX + 4, y + 1.5);
      doc.text(val, MR - 2, y + 1.5, { align: 'right' });
      y += 12;
    } else {
      setFont(bold ? 'bold' : 'normal', 9, bold ? GRAY_900 : GRAY_600);
      doc.text(label, totX + 4, y);
      setFont(bold ? 'bold' : 'normal', 9, GRAY_900);
      doc.text(val, MR - 2, y, { align: 'right' });
      y += 6;
    }
  }

  totLine('Sub Total',  money(invoice.sub_total));
  totLine('Discount',   money(invoice.discount));
  totLine('Tax',        money(invoice.tax));

  // Light separator before total
  doc.setDrawColor(...GRAY_200);
  doc.setLineWidth(0.3);
  doc.line(totX, y - 2, MR, y - 2);
  y += 3;

  totLine('TOTAL AMOUNT', money(invoice.total_amount), true, true);

  y += 4;

  // ══════════════════════════════════════════════════════════════════════════
  // TRANSACTION / PAYMENT INFO  (light teal box)
  // ══════════════════════════════════════════════════════════════════════════
  if (invoice.transaction_id) {
    doc.setFillColor(...TEAL_LIGHT);
    doc.roundedRect(ML, y, CW, 10, 2, 2, 'F');
    setFont('bold', 7.5, TEAL_DARK);
    doc.text('TRANSACTION ID', ML + 4, y + 4);
    setFont('normal', 8.5, GRAY_900);
    doc.text(v(invoice.transaction_id), ML + 36, y + 4);
    setFont('bold', 7.5, TEAL_DARK);
    doc.text('PAID ON', MR - 52, y + 4);
    setFont('normal', 8.5, GRAY_900);
    doc.text(fmt(invoice.payment_date), MR - 36, y + 4);
    y += 16;
  }

  // ══════════════════════════════════════════════════════════════════════════
  // SHIPPING  (only if present)
  // ══════════════════════════════════════════════════════════════════════════
  const hasShip = [invoice.ship_name, invoice.ship_addr, invoice.ship_city].some(Boolean);
  if (hasShip) {
    // Section divider
    doc.setDrawColor(...GRAY_200);
    doc.setLineWidth(0.3);
    doc.line(ML, y, MR, y);
    y += 7;

    setFont('bold', 7, TEAL);
    doc.text('SHIPPING ADDRESS', ML, y);
    doc.setDrawColor(...TEAL);
    doc.setLineWidth(0.4);
    doc.line(ML, y + 2, ML + 50, y + 2);
    y += 7;

    const shipLines = [
      invoice.ship_name,
      invoice.ship_email,
      invoice.ship_phone,
      invoice.ship_addr,
      [invoice.ship_city, invoice.ship_state].filter(Boolean).join(', '),
      [invoice.ship_country, invoice.ship_pincode].filter(Boolean).join(' — '),
      invoice.ship_gst_no ? `GSTIN: ${invoice.ship_gst_no}` : null,
    ].filter(Boolean);

    setFont('normal', 8.5, GRAY_600);
    shipLines.forEach(line => { doc.text(line, ML, y); y += 4.8; });
    y += 4;
  }

  // ══════════════════════════════════════════════════════════════════════════
  // FOOTER  (pinned to bottom)
  // ══════════════════════════════════════════════════════════════════════════
  const footerY = PH - 22;

  doc.setFillColor(...TEAL);
  doc.rect(0, footerY, PW, 22, 'F');

  // Left: thank-you text
  setFont('bold', 9.5, WHITE);
  doc.text('Thank you for your business!', ML, footerY + 9);
  setFont('normal', 8, [185, 236, 230]);
  doc.text('For queries, please contact: support@lmsplatform.com', ML, footerY + 16);

  // Right: invoice number watermark
  setFont('normal', 8, [185, 236, 230]);
  doc.text(v(invoice.invoice_no), MR, footerY + 9, { align: 'right' });
  doc.text(`Generated on ${fmt(new Date().toISOString())}`, MR, footerY + 16, { align: 'right' });

  // ══════════════════════════════════════════════════════════════════════════
  // Thin outer border on entire page
  // ══════════════════════════════════════════════════════════════════════════
  doc.setDrawColor(...GRAY_200);
  doc.setLineWidth(0.5);
  doc.rect(1, 1, PW - 2, PH - 2);

  doc.save(`${invoice.invoice_no || 'invoice'}.pdf`);
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export default function ViewInvoice() {
  const router   = useRouter();
  const { id }   = useParams();
  const [invoice, setInvoice]       = useState(null);
  const [loading, setLoading]       = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (!id) return;
    apiServiceHandler('GET', `invoice/edit/${id}`)
      .then(res => setInvoice(res?.data ?? null))
      .catch(() => setInvoice(null))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleGeneratePDF() {
    if (!invoice) return;
    setGenerating(true);
    try { await generateInvoicePDF(invoice); }
    finally { setGenerating(false); }
  }

  if (loading) return (
    <SuperAdminShell activeSection="invoices">
      <p style={{ color: '#6b7280', fontSize: 13 }}>Loading…</p>
    </SuperAdminShell>
  );

  if (!invoice) return (
    <SuperAdminShell activeSection="invoices">
      <button className={s.backBtn} onClick={() => router.push('/superadmin/payments/invoices')}>
        <BackArrow /> Back to Invoices
      </button>
      <p style={{ color: '#dc2626', fontSize: 13 }}>Invoice not found.</p>
    </SuperAdminShell>
  );

  const cur = invoice.currency || 'INR';
  const ps  = PAYMENT_STATUS_COLORS[invoice.payment_status] || { bg: '#f3f4f6', color: '#374151' };

  return (
    <SuperAdminShell activeSection="invoices">
      <button className={s.backBtn} onClick={() => router.push('/superadmin/payments/invoices')}>
        <BackArrow /> Back to Invoices
      </button>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div>
            <h1 className={s.pageTitle}>{invoice.invoice_no || 'Invoice'}</h1>
            <p className={s.pageSubtitle}>Invoice Details</p>
          </div>
          <span style={{ display: 'inline-block', padding: '3px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700, background: ps.bg, color: ps.color, textTransform: 'capitalize' }}>
            {invoice.payment_status || '—'}
          </span>
        </div>
        <button
          onClick={handleGeneratePDF}
          disabled={generating}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 7,
            background: generating ? '#6b7280' : '#0d9488', color: '#fff',
            border: 'none', borderRadius: 7, padding: '9px 18px',
            fontSize: 13, fontWeight: 600, cursor: generating ? 'not-allowed' : 'pointer',
          }}
        >
          <PdfIcon />
          {generating ? 'Generating…' : 'Download Invoice PDF'}
        </button>
      </div>

      {/* Organization & Order */}
      <div style={vs.card}>
        <div style={vs.section}>Organization &amp; Order</div>
        <div style={vs.grid}>
          <Row label="Organization"   value={invoice.org_id?.org_name} />
          <Row label="Org Email"      value={invoice.org_id?.org_email} />
          <Row label="Org Phone"      value={invoice.org_id?.org_phone} />
          <Row label="Credit Package" value={invoice.order_id?.credit_id?.title} />
          <Row label="Currency"       value={cur} />
          <Row label="Status"         value={invoice.status} />
        </div>
      </div>

      {/* Amounts */}
      <div style={vs.card}>
        <div style={vs.section}>Amounts</div>
        <div style={vs.grid}>
          <Row label="Sub Total"    value={fmtAmount(invoice.sub_total, cur)} />
          <Row label="Discount"     value={fmtAmount(invoice.discount, cur)} />
          <Row label="Tax"          value={fmtAmount(invoice.tax, cur)} />
          <Row label="Total Amount" value={fmtAmount(invoice.total_amount, cur)} />
        </div>
      </div>

      {/* Payment */}
      <div style={vs.card}>
        <div style={vs.section}>Payment Info</div>
        <div style={vs.grid}>
          <Row label="Payment Method"  value={invoice.payment_method} />
          <Row label="Transaction ID"  value={invoice.transaction_id} />
          <Row label="Payment Date"    value={fmtDate(invoice.payment_date)} />
          <Row label="Created At"      value={fmtDate(invoice.createdAt)} />
        </div>
      </div>

      {/* Billing */}
      <div style={vs.card}>
        <div style={vs.section}>Billing Details</div>
        <div style={vs.grid}>
          <Row label="Name"    value={invoice.bill_name} />
          <Row label="Email"   value={invoice.bill_email} />
          <Row label="Phone"   value={invoice.bill_phone} />
          <Row label="GST No"  value={invoice.bill_gst_no} />
          <Row label="Address" value={invoice.bill_addr} />
          <Row label="City"    value={invoice.bill_city} />
          <Row label="State"   value={invoice.bill_state} />
          <Row label="Country" value={invoice.bill_country} />
          <Row label="Pincode" value={invoice.bill_pincode} />
        </div>
      </div>

      {/* Shipping */}
      <div style={vs.card}>
        <div style={vs.section}>Shipping Details</div>
        <div style={vs.grid}>
          <Row label="Name"    value={invoice.ship_name} />
          <Row label="Email"   value={invoice.ship_email} />
          <Row label="Phone"   value={invoice.ship_phone} />
          <Row label="GST No"  value={invoice.ship_gst_no} />
          <Row label="Address" value={invoice.ship_addr} />
          <Row label="City"    value={invoice.ship_city} />
          <Row label="State"   value={invoice.ship_state} />
          <Row label="Country" value={invoice.ship_country} />
          <Row label="Pincode" value={invoice.ship_pincode} />
        </div>
      </div>
    </SuperAdminShell>
  );
}
