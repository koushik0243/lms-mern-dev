'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import apiServiceHandler from '../../../service/apiService';
import { generateInvoicePDF } from '../../../lib/generateInvoicePDF';
import s from './Invoices.module.css';

function BackArrow() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" style={{ width: 14, height: 14 }}>
      <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
    </svg>
  );
}

function fmtDate(val) {
  if (!val) return '—';
  try {
    return new Date(val).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch { return '—'; }
}

function fmtAmount(val) {
  const n = val != null ? parseFloat(val) : null;
  return n != null && !isNaN(n) ? `₹${n.toLocaleString('en-IN')}` : '—';
}

const PAYMENT_STATUS_CFG = {
  paid:     { label: 'Paid',     cls: 'badgePaid' },
  pending:  { label: 'Pending',  cls: 'badgePending' },
  failed:   { label: 'Failed',   cls: 'badgeFailed' },
  refunded: { label: 'Refunded', cls: 'badgeRefunded' },
};

function Row({ label, value, mono }) {
  return (
    <div className={s.viewRow}>
      <div className={s.viewLabel}>{label}</div>
      <div className={mono ? s.viewValueMono : s.viewValue}>{value ?? '—'}</div>
    </div>
  );
}

export default function ViewInvoice() {
  const router      = useRouter();
  const { id }      = useParams();
  const [inv, setInv]             = useState(null);
  const [loading, setLoading]     = useState(true);
  const [generating, setGenerating] = useState(false);

  async function handleDownloadPDF() {
    if (!inv) return;
    setGenerating(true);
    try { await generateInvoicePDF(inv); }
    finally { setGenerating(false); }
  }

  useEffect(() => {
    if (!id) return;
    apiServiceHandler('GET', `invoice/edit/${id}`)
      .then(res => setInv(res?.data ?? res))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className={s.viewShell}>
      <p className={s.viewEmpty}>Loading…</p>
    </div>
  );
  if (!inv?._id) return (
    <div className={s.viewShell}>
      <p className={s.viewEmpty}>Invoice not found.</p>
    </div>
  );

  const psKey = (inv.payment_status || 'pending').toLowerCase();
  const sc = PAYMENT_STATUS_CFG[psKey] ?? { label: inv.payment_status || '—', cls: 'badgePending' };
  const credit = inv.order_id?.credit_id ?? {};

  return (
    <div className={s.viewShell}>
      <button className={s.backBtn} onClick={() => router.push('/storeowner/invoices')}>
        <BackArrow /> Back to Invoices
      </button>

      <div className={s.viewHeader}>
        <h1 className={s.viewTitle}>
          <span className={s.invoiceNo}>{inv.invoice_no || 'Invoice'}</span>
        </h1>
        <span className={`${s.badge} ${s[sc.cls]}`}>{sc.label}</span>
        <button className={s.btnDownloadPdf} onClick={handleDownloadPDF} disabled={generating}>
          <svg viewBox="0 0 20 20" fill="currentColor" style={{ width: 15, height: 15 }}>
            <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
          {generating ? 'Generating…' : 'Download PDF'}
        </button>
      </div>

      <div className={s.viewCard}>
        <div className={s.viewSection}>Invoice Details</div>
        <div className={s.viewGrid}>
          <Row label="Invoice No"      value={<span className={s.invoiceNo}>{inv.invoice_no}</span>} />
          <Row label="Payment Date"    value={fmtDate(inv.payment_date || inv.createdAt)} />
          <Row label="Payment Method"  value={inv.payment_method} />
          <Row label="Payment Status"  value={<span className={`${s.badge} ${s[sc.cls]}`}>{sc.label}</span>} />
          {inv.transaction_id && <Row label="Transaction ID" value={inv.transaction_id} mono />}
        </div>

        {credit.title && (
          <>
            <div className={s.viewDivider} />
            <div className={s.viewSection}>Credit Plan</div>
            <div className={s.viewGrid}>
              <Row label="Plan" value={credit.title} />
            </div>
          </>
        )}

        <div className={s.viewDivider} />
        <div className={s.viewSection}>Amount Breakdown</div>
        <div className={s.viewGrid}>
          <Row label="Sub Total" value={fmtAmount(inv.sub_total)} />
          <Row label="Discount"  value={fmtAmount(inv.discount)} />
          <Row label="Tax"       value={fmtAmount(inv.tax)} />
          <Row label="Total"     value={<strong style={{ fontSize: 15 }}>{fmtAmount(inv.total_amount)}</strong>} />
        </div>

        {(inv.name || inv.email || inv.addr) && (
          <>
            <div className={s.viewDivider} />
            <div className={s.viewSection}>Billing Info</div>
            <div className={s.viewGrid}>
              {inv.name  && <Row label="Name"    value={inv.name} />}
              {inv.email && <Row label="Email"   value={inv.email} />}
              {inv.phone && <Row label="Phone"   value={inv.phone} />}
              {inv.addr  && <Row label="Address" value={[inv.addr, inv.city, inv.state, inv.country, inv.pincode].filter(Boolean).join(', ')} />}
              {inv.gst_no && <Row label="GST No" value={inv.gst_no} mono />}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
