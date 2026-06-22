'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import apiServiceHandler from '../../../service/apiService';
import SuperAdminShell from '../SuperAdminShell';
import s from './RolePermissions.module.css';

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

export default function ViewRolePermission() {
  const router = useRouter();
  const { id } = useParams();
  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    apiServiceHandler('GET', `role-permission/edit/${id}`)
      .then(res => setRecord(res?.data ?? res))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <SuperAdminShell activeSection="assign-role"><p style={{ padding: 40, color: '#6b7280' }}>Loading…</p></SuperAdminShell>;
  if (!record?._id) return <SuperAdminShell activeSection="assign-role"><p style={{ padding: 40, color: '#6b7280' }}>Assignment not found.</p></SuperAdminShell>;

  const roleName = record.role_id?.name || record.role_id || '—';
  const permName = record.permission_id?.name || record.permission_id || '—';
  const permDisplay = record.permission_id?.display_name || null;

  return (
    <SuperAdminShell activeSection="assign-role">
      <button className={s.backBtn} onClick={() => router.push('/superadmin/role-permissions')}>
        <BackArrow /> Back to Assign Role
      </button>

      <div className={s.pageHeader}>
        <div>
          <h1 className={s.pageTitle}>Role Permission Assignment</h1>
          <p className={s.pageSubtitle}>Assignment details</p>
        </div>
        <button className={s.btnEditView} onClick={() => router.push(`/superadmin/role-permissions/${id}/edit`)}>
          <EditIcon /> Edit Assignment
        </button>
      </div>

      <div className={s.viewCard}>
        <div className={s.viewGrid}>
          <Row label="Role"             value={roleName} />
          <Row label="Permission"       value={permDisplay || permName} />
          <Row label="Permission Key"   value={permName} />
          <Row label="Status"           value={record.status ? record.status.charAt(0).toUpperCase() + record.status.slice(1) : null} />
          <Row label="Created At"       value={fmtDate(record.createdAt)} />
          <Row label="Updated At"       value={fmtDate(record.updatedAt)} />
        </div>
      </div>
    </SuperAdminShell>
  );
}
