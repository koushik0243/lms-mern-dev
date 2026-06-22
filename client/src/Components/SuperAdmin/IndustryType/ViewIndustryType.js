'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import apiServiceHandler from '../../../service/apiService';
import SuperAdminShell from '../SuperAdminShell';
import s from './IndustryType.module.css';

const BackArrow = () => (
  <svg viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
  </svg>
);
const EditIcon = () => (
  <svg viewBox="0 0 20 20" fill="currentColor">
    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
  </svg>
);

function fmtDate(val) {
  if (!val) return '—';
  const d = new Date(val);
  if (isNaN(d)) return '—';
  return `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}`;
}

function Row({ label, value, full }) {
  return (
    <div className={`${s.viewRow} ${full ? s.viewFull : ''}`}>
      <div className={s.viewLabel}>{label}</div>
      {value ? <div className={s.viewValue}>{value}</div> : <div className={s.viewValueMuted}>—</div>}
    </div>
  );
}

export default function ViewIndustryType() {
  const router = useRouter();
  const { id } = useParams();
  const [item, setItem]       = useState(null);
  const [parentName, setParentName] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      apiServiceHandler('GET', `industry-type/edit/${id}`),
      apiServiceHandler('GET', 'industry-type/list-all'),
    ])
      .then(([editRes, listRes]) => {
        const row  = editRes?.data ?? editRes;
        const list = Array.isArray(listRes?.data) ? listRes.data : (Array.isArray(listRes) ? listRes : []);
        setItem(row);
        if (row?.parentId) {
          const parent = list.find(it => String(it._id) === String(row.parentId));
          setParentName(parent?.name ?? null);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <SuperAdminShell activeSection="industry-type"><p style={{ padding: 40, color: '#6b7280' }}>Loading…</p></SuperAdminShell>;
  if (!item?._id) return <SuperAdminShell activeSection="industry-type"><p style={{ padding: 40, color: '#6b7280' }}>Industry type not found.</p></SuperAdminShell>;

  return (
    <SuperAdminShell activeSection="industry-type">
      <button className={s.backBtn} onClick={() => router.push('/superadmin/industry-type')}>
        <BackArrow /> Back to Industry Types
      </button>

      <div className={s.pageHeader}>
        <div>
          <h1 className={s.pageTitle}>{item.name}</h1>
          <p className={s.pageSubtitle}>Industry type details</p>
        </div>
        <button className={s.btnEditView} onClick={() => router.push(`/superadmin/industry-type/${id}/edit`)}>
          <EditIcon /> Edit
        </button>
      </div>

      <div className={s.viewCard}>
        <div className={s.viewGrid}>
          <Row label="Name"        value={item.name} />
          <Row label="Parent Type" value={parentName} />
          <Row label="Description" value={item.description} full />
          <Row label="Status"      value={item.status ? item.status.charAt(0).toUpperCase() + item.status.slice(1) : null} />
          <Row label="Created At"  value={fmtDate(item.createdAt)} />
          <Row label="Updated At"  value={fmtDate(item.updatedAt)} />
        </div>
      </div>
    </SuperAdminShell>
  );
}
