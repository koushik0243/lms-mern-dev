'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import apiServiceHandler from '../../../service/apiService';
import SuperAdminShell from '../SuperAdminShell';
import s from './OrgUserAssignment.module.css';

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

export default function ViewOrgUserAssignment() {
  const router = useRouter();
  const { id } = useParams();
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    apiServiceHandler('GET', `user/admin/edit/${id}`)
      .then(res => setUser(res?.data ?? res))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <SuperAdminShell activeSection="assign-user"><p style={{ padding: 40, color: '#6b7280' }}>Loading…</p></SuperAdminShell>;
  if (!user?._id) return <SuperAdminShell activeSection="assign-user"><p style={{ padding: 40, color: '#6b7280' }}>Assignment not found.</p></SuperAdminShell>;

  const orgName = user.orgId
    ? (typeof user.orgId === 'object' ? (user.orgId.org_name || user.orgId.name) : user.orgId)
    : null;

  return (
    <SuperAdminShell activeSection="assign-user">
      <button className={s.backBtn} onClick={() => router.push('/superadmin/organization-user-assignment')}>
        <BackArrow /> Back to User Assignments
      </button>

      <div className={s.pageHeader}>
        <div>
          <h1 className={s.pageTitle}>{user.name || user.email}</h1>
          <p className={s.pageSubtitle}>User assignment details</p>
        </div>
        <button className={s.btnEditView} onClick={() => router.push(`/superadmin/organization-user-assignment/edit/${id}`)}>
          <EditIcon /> Edit Assignment
        </button>
      </div>

      <div className={s.viewCard}>
        <div className={s.viewGrid}>
          <Row label="User Name"     value={user.name} />
          <Row label="Email"         value={user.email} />
          <Row label="Organization"  value={orgName} />
          <Row label="Role"          value={user.orgRole} />
          <Row label="Status"        value={user.status ? user.status.charAt(0).toUpperCase() + user.status.slice(1) : null} />
          <Row label="Assigned On"   value={fmtDate(user.updatedAt || user.createdAt)} />
        </div>
      </div>
    </SuperAdminShell>
  );
}
