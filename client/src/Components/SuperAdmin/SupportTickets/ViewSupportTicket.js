'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import apiServiceHandler from '../../../service/apiService';
import SuperAdminShell from '../SuperAdminShell';
import s from './SupportTickets.module.css';

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

function fmtDateTime(val) {
  if (!val) return '—';
  try {
    const d = new Date(val);
    const dd  = String(d.getDate()).padStart(2, '0');
    const mm  = String(d.getMonth() + 1).padStart(2, '0');
    const yy  = d.getFullYear();
    const hr  = String(d.getHours()).padStart(2, '0');
    const min = String(d.getMinutes()).padStart(2, '0');
    return `${dd}/${mm}/${yy}  ${hr}:${min}`;
  } catch { return '—'; }
}

const STATUS_MAP = {
  open:         { label: 'Open',         cls: 'badgeOpen' },
  in_progress:  { label: 'In Progress',  cls: 'badgeInProgress' },
  resolved:     { label: 'Resolved',     cls: 'badgeResolved' },
  close:        { label: 'Closed',       cls: 'badgeClosed' },
  not_possible: { label: 'Not Possible', cls: 'badgeNotPossible' },
  deleted:      { label: 'Deleted',      cls: 'badgeDeleted' },
};
const PRIORITY_CLS = { Low: 'priLow', Normal: 'priNormal', High: 'priHigh', Urgent: 'priUrgent' };

function ResponseLogs({ logs }) {
  if (!Array.isArray(logs) || logs.length === 0) return null;
  return (
    <div className={s.logsCard}>
      <h3 className={s.logsTitle}>Response History</h3>
      <div className={s.logsList}>
        {[...logs].reverse().map((log, i) => {
          const sc = STATUS_MAP[log.status] ?? null;
          return (
            <div key={i} className={s.logEntry}>
              <div className={s.logEntryHeader}>
                <span className={s.logDate}>{fmtDateTime(log.date)}</span>
                <span className={s.logAdmin}>{log.adminName || 'Admin'}</span>
                {sc && <span className={`${s.badge} ${s[sc.cls]}`}>{sc.label}</span>}
              </div>
              {log.comment && <p className={s.logComment}>{log.comment}</p>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Row({ label, value, full, pre }) {
  return (
    <div className={`${s.viewRow} ${full ? s.viewFull : ''}`}>
      <div className={s.viewLabel}>{label}</div>
      {value
        ? pre
          ? <div className={s.viewPre}>{value}</div>
          : <div className={s.viewValue}>{value}</div>
        : <div className={s.viewValueMuted}>—</div>}
    </div>
  );
}

export default function ViewSupportTicket() {
  const router = useRouter();
  const { id } = useParams();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    apiServiceHandler('GET', `support-ticket/edit/${id}`)
      .then(res => setTicket(res?.data ?? res))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <SuperAdminShell activeSection="support-tickets">
        <p style={{ padding: 40, color: '#6b7280' }}>Loading…</p>
      </SuperAdminShell>
    );
  }
  if (!ticket?._id) {
    return (
      <SuperAdminShell activeSection="support-tickets">
        <p style={{ padding: 40, color: '#6b7280' }}>Ticket not found.</p>
      </SuperAdminShell>
    );
  }

  const sc = STATUS_MAP[ticket.status] ?? STATUS_MAP.open;
  const pc = PRIORITY_CLS[ticket.priority] ?? 'priNormal';

  return (
    <SuperAdminShell activeSection="support-tickets">
      <button className={s.backBtn} onClick={() => router.push('/superadmin/support-tickets')}>
        <BackArrow /> Back to Support Tickets
      </button>

      <div className={s.pageHeader}>
        <div>
          <h1 className={s.pageTitle}>#{ticket.ticket_id}</h1>
          <p className={s.pageSubtitle}>{ticket.issue_type} · {ticket.orgId?.org_name || 'Unknown org'}</p>
        </div>
        <button className={s.btnEditView} onClick={() => router.push(`/superadmin/support-tickets/${id}/edit`)}>
          <EditIcon /> Respond
        </button>
      </div>

      <div className={s.viewCard}>
        <div className={s.viewGrid}>
          <Row label="Ticket ID"    value={`#${ticket.ticket_id}`} />
          <Row label="Organization" value={ticket.orgId?.org_name} />
          <Row label="Issue Type"   value={ticket.issue_type} />
          <Row label="Priority"     value={<span className={s[pc]}>{ticket.priority}</span>} />
          <Row label="Status"       value={<span className={`${s.badge} ${s[sc.cls]}`}>{sc.label}</span>} />
          <Row label="Raised On"    value={fmtDate(ticket.createdAt)} />
          <Row label="Updated At"   value={fmtDate(ticket.updatedAt)} />

          <hr className={s.sectionDivider} />
          <p className={s.sectionTitle}>Ticket Details</p>

          <Row label="Subject"     value={ticket.subject} full />
          <Row label="Description" value={ticket.desc}    full pre />

          {ticket.resolve_text && (
            <>
              <hr className={s.sectionDivider} />
              <p className={s.sectionTitle}>Resolution</p>
              <Row label="Resolution Notes" value={ticket.resolve_text} full pre />
            </>
          )}
        </div>
      </div>

      <ResponseLogs logs={ticket.logs} />
    </SuperAdminShell>
  );
}
