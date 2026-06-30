'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { selectUser } from '../../../redux/slices/authSlice';
import apiServiceHandler from '../../../service/apiService';
import s from './Orders.module.css';

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

const STATUS_CFG = {
  success:  { label: 'Success',  cls: 'badgeSuccess' },
  pending:  { label: 'Pending',  cls: 'badgePending' },
  failed:   { label: 'Failed',   cls: 'badgeFailed' },
  canceled: { label: 'Canceled', cls: 'badgeCanceled' },
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

export default function ViewOrder() {
  const router    = useRouter();
  const { id }    = useParams();
  const [order, setOrder]     = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    apiServiceHandler('GET', `order/edit/${id}`)
      .then(res => setOrder(res?.data ?? res))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className={s.viewShell}>
      <p className={s.viewEmpty}>Loading…</p>
    </div>
  );
  if (!order?._id) return (
    <div className={s.viewShell}>
      <p className={s.viewEmpty}>Order not found.</p>
    </div>
  );

  const statusKey = (order.status || 'pending').toLowerCase();
  const sc = STATUS_CFG[statusKey] ?? { label: order.status || '—', cls: 'badgePending' };
  const credit = order.credit_id ?? {};
  const creditRange = credit.limit_from != null && credit.limit_to != null
    ? `${credit.limit_from}–${credit.limit_to}`
    : credit.limit_to != null ? String(credit.limit_to)
    : credit.limit_from != null ? `${credit.limit_from}+` : '—';

  return (
    <div className={s.viewShell}>
      <button className={s.backBtn} onClick={() => router.push('/storeowner/orders')}>
        <BackArrow /> Back to Orders
      </button>

      <div className={s.viewHeader}>
        <h1 className={s.viewTitle}>Order Details</h1>
        <span className={`${s.badge} ${s[sc.cls]}`}>{sc.label}</span>
      </div>

      <div className={s.viewCard}>
        <div className={s.viewSection}>Order Information</div>
        <div className={s.viewGrid}>
          <Row label="Purchase Date"   value={fmtDate(order.purchase_date || order.createdAt)} />
          <Row label="Payment Gateway" value={order.payment_gateway} />
          <Row label="Status"          value={<span className={`${s.badge} ${s[sc.cls]}`}>{sc.label}</span>} />
        </div>

        <div className={s.viewDivider} />
        <div className={s.viewSection}>Credit Plan</div>
        <div className={s.viewGrid}>
          <Row label="Plan Name"    value={credit.title} />
          <Row label="Credits"      value={creditRange} />
          <Row label="Amount Paid"  value={<strong>{fmtAmount(order.credit_amount)}</strong>} />
        </div>
      </div>
    </div>
  );
}
