'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import apiServiceHandler from '../../../service/apiService';
import SuperAdminShell from '../SuperAdminShell';
import s from './Payments.module.css';

const BackArrow = () => (
  <svg viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
  </svg>
);

function fmtDate(val) {
  if (!val) return '—';
  const d = new Date(val);
  if (isNaN(d)) return '—';
  return `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}`;
}

function fmtAmount(val) {
  if (val === null || val === undefined) return '—';
  return `₹${Number(val).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function Row({ label, value }) {
  return (
    <div style={vs.row}>
      <span style={vs.label}>{label}</span>
      <span style={vs.value}>{value || '—'}</span>
    </div>
  );
}

const vs = {
  card:    { background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '24px 28px', marginBottom: 20 },
  section: { fontSize: 12, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 14 },
  grid:    { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px 32px' },
  row:     { display: 'flex', flexDirection: 'column', gap: 3 },
  label:   { fontSize: 11.5, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.04em' },
  value:   { fontSize: 13.5, color: '#111827' },
};

export default function ViewOrder() {
  const router = useRouter();
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    apiServiceHandler('GET', `order/edit/${id}`)
      .then(res => setOrder(res?.data ?? null))
      .catch(() => setOrder(null))
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <SuperAdminShell activeSection="orders">
      <button className={s.backBtn} onClick={() => router.push('/superadmin/payments/orders')}>
        <BackArrow /> Back to Orders
      </button>

      {loading ? (
        <p style={{ color: '#6b7280', fontSize: 13 }}>Loading…</p>
      ) : !order ? (
        <p style={{ color: '#dc2626', fontSize: 13 }}>Order not found.</p>
      ) : (
        <>
          <h1 className={s.pageTitle}>Order Details</h1>
          <p className={s.pageSubtitle} style={{ marginBottom: 20 }}>#{String(order._id).slice(-8).toUpperCase()}</p>

          <div style={vs.card}>
            <div style={vs.section}>Organization &amp; Credit</div>
            <div style={vs.grid}>
              <Row label="Organization"   value={order.organizer_id?.org_name} />
              <Row label="Org Email"      value={order.organizer_id?.org_email} />
              <Row label="Org Phone"      value={order.organizer_id?.org_phone} />
              <Row label="Credit Package" value={order.credit_id?.title} />
            </div>
          </div>

          <div style={vs.card}>
            <div style={vs.section}>Payment</div>
            <div style={vs.grid}>
              <Row label="Amount"          value={fmtAmount(order.credit_amount)} />
              <Row label="Payment Gateway" value={order.payment_gateway} />
              <Row label="Purchase Date"   value={fmtDate(order.purchase_date)} />
              <Row label="Status"          value={order.status} />
              <Row label="Created At"      value={fmtDate(order.createdAt)} />
              <Row label="Updated At"      value={fmtDate(order.updatedAt)} />
            </div>
          </div>
        </>
      )}
    </SuperAdminShell>
  );
}
