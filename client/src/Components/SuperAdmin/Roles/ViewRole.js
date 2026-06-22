'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import apiServiceHandler from '../../../service/apiService';
import SuperAdminShell from '../SuperAdminShell';
import s from './Roles.module.css';

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

function Row({ label, value }) {
  return (
    <div className={s.viewRow}>
      <div className={s.viewLabel}>{label}</div>
      {value ? <div className={s.viewValue}>{value}</div> : <div className={s.viewValueMuted}>—</div>}
    </div>
  );
}

export default function ViewRole() {
  const router = useRouter();
  const { id } = useParams();
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    apiServiceHandler('GET', `role/edit/${id}`)
      .then(res => setRole(res?.data ?? res))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <SuperAdminShell activeSection="roles"><p style={{ padding: 40, color: '#6b7280' }}>Loading…</p></SuperAdminShell>;
  if (!role?._id) return <SuperAdminShell activeSection="roles"><p style={{ padding: 40, color: '#6b7280' }}>Role not found.</p></SuperAdminShell>;

  return (
    <SuperAdminShell activeSection="roles">
      <button className={s.backBtn} onClick={() => router.push('/superadmin/roles')}>
        <BackArrow /> Back to Roles
      </button>

      <div className={s.pageHeader}>
        <div>
          <h1 className={s.pageTitle}>{role.display_name || role.name}</h1>
          <p className={s.pageSubtitle}>Role details</p>
        </div>
        <button className={s.btnEditView} onClick={() => router.push(`/superadmin/roles/${id}/edit`)}>
          <EditIcon /> Edit Role
        </button>
      </div>

      <div className={s.viewCard}>
        <div className={s.viewGrid}>
          <Row label="Name"         value={role.name} />
          <Row label="Display Name" value={role.display_name} />
          <Row label="Status"       value={role.status ? role.status.charAt(0).toUpperCase() + role.status.slice(1) : null} />
          <Row label="Created At"   value={fmtDate(role.createdAt)} />
          <Row label="Updated At"   value={fmtDate(role.updatedAt)} />
        </div>
      </div>
    </SuperAdminShell>
  );
}
