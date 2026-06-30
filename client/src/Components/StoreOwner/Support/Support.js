'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { selectUser } from '../../../redux/slices/authSlice';
import s from './Support.module.css';
import apiServiceHandler from '../../../service/apiService';

// ── Helpers ──────────────────────────────────────────────────────
function getTokenUserId() {
  if (typeof window === 'undefined') return null;
  try {
    const token = localStorage.getItem('adminToken');
    if (!token) return null;
    const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
    return payload._id || null;
  } catch { return null; }
}

function formatDate(iso) {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch { return '—'; }
}

function formatDateTime(iso) {
  if (!iso) return '—';
  try {
    const d = new Date(iso);
    const date = d.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const time = d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
    return `${date}  ${time}`;
  } catch { return '—'; }
}

function progressColor(status) {
  return { open: '#ef4444', in_progress: '#f59e0b', resolved: '#0b7b7b', close: '#0b7b7b', not_possible: '#9ca3af', deleted: '#d1d5db' }[status] ?? '#9ca3af';
}

// ── Icons ─────────────────────────────────────────────────────────
const TrashIcon = () => (
  <svg viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
  </svg>
);

const ChevronDown = () => (
  <svg viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
  </svg>
);

// ── Constants ─────────────────────────────────────────────────────
const ISSUE_TYPES = ['Technical Issue', 'Billing', 'Course Access', 'Zoom Integration', 'Other'];
const PRIORITIES  = ['Low', 'Normal', 'High', 'Urgent'];
const EMPTY_FORM  = { issueType: '', subject: '', description: '', priority: 'Normal' };
const PER_PAGE    = 50;

const STATUS_CFG = {
  open:         { label: 'Open',         cls: 'statusOpen',        progress: 12 },
  in_progress:  { label: 'In Progress',  cls: 'statusInProgress',  progress: 48 },
  resolved:     { label: 'Resolved',     cls: 'statusResolved',    progress: 100 },
  close:        { label: 'Closed',       cls: 'statusClosed',      progress: 100 },
  not_possible: { label: 'Not Possible', cls: 'statusNotPossible', progress: 60 },
  deleted:      { label: 'Deleted',      cls: 'statusDeleted',     progress: 0 },
};

// ── Toast helper component ────────────────────────────────────────
function Toast({ toast }) {
  if (!toast) return null;
  return (
    <div className={`${s.toast} ${toast.type === 'error' ? s.toastError : s.toastSuccess}`}>
      <span className={s.toastIcon}>{toast.type === 'error' ? '✕' : '✓'}</span>
      {toast.msg}
    </div>
  );
}

// ── Delete Confirmation Modal ─────────────────────────────────────
function DeleteModal({ count, onCancel, onConfirm, deleting }) {
  return (
    <div className={s.modalOverlay}>
      <div className={s.modalBox}>
        <h3 className={s.modalTitle}>Confirm Delete</h3>
        <p className={s.modalText}>
          Are you sure you want to delete {count === 1 ? 'this ticket' : `${count} tickets`}?
          This action cannot be undone.
        </p>
        <div className={s.modalActions}>
          <button className={s.btnCancelModal} onClick={onCancel} disabled={deleting}>Cancel</button>
          <button className={s.btnConfirmDelete} onClick={onConfirm} disabled={deleting}>
            {deleting ? 'Deleting…' : `Delete ${count > 1 ? `(${count})` : ''}`}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────
export default function SupportPage() {
  const user = useSelector(selectUser);

  const [view, setView]                     = useState('list');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [tickets, setTickets]               = useState([]);
  const [loading, setLoading]               = useState(true);
  const [orgId, setOrgId]                   = useState(null);

  const [form, setForm]                     = useState(EMPTY_FORM);
  const [submitting, setSubmitting]         = useState(false);

  const [checked, setChecked]               = useState(new Set());
  const [page, setPage]                     = useState(1);
  const [statusFilter, setStatusFilter]     = useState('');
  const [searchQuery, setSearchQuery]       = useState('');

  const [toast, setToast]                   = useState(null);
  const [deleteModal, setDeleteModal]       = useState(null); // string[]
  const [deleting, setDeleting]             = useState(false);

  // ── Toast ───────────────────────────────────────────────────────
  const showToast = useCallback((type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 4000);
  }, []);

  // ── Load data ───────────────────────────────────────────────────
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      let oid = user?.orgId ? String(user.orgId) : null;
      if (!oid) {
        const uid = user?._id || getTokenUserId();
        if (uid) {
          const r = await apiServiceHandler('GET', `user/admin/edit/${uid}`);
          const rec = r?.data ?? r;
          if (rec?.orgId) oid = String(rec.orgId);
        }
      }
      if (oid) setOrgId(oid);
      const res = await apiServiceHandler('GET', oid ? `support-ticket/list?orgId=${oid}` : 'support-ticket/list').catch(() => null);
      const data = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
      setTickets(data);
    } catch {
      setTickets([]);
    } finally {
      setLoading(false);
    }
  }, [user?._id, user?.orgId]);

  useEffect(() => { loadData(); }, [loadData]);

  // ── Form ────────────────────────────────────────────────────────
  function setField(key) {
    return e => setForm(f => ({ ...f, [key]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await apiServiceHandler('POST', 'support-ticket/create', {
        orgId,
        issue_type: form.issueType,
        subject:    form.subject,
        desc:       form.description,
        priority:   form.priority,
      });
      showToast('success', 'Ticket raised successfully! Our team will respond shortly.');
      setForm(EMPTY_FORM);
      setView('list');
      loadData();
    } catch (err) {
      showToast('error', err?.message || 'Failed to raise ticket. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  // ── Delete ──────────────────────────────────────────────────────
  async function confirmDelete() {
    if (!deleteModal) return;
    setDeleting(true);
    try {
      for (const id of deleteModal) {
        await apiServiceHandler('GET', `support-ticket/delete/${id}`);
      }
      showToast('success', `${deleteModal.length} ticket${deleteModal.length > 1 ? 's' : ''} deleted.`);
      setChecked(new Set());
      setDeleteModal(null);
      if (view === 'view') setView('list');
      setPage(1);
      await loadData();
    } catch (err) {
      showToast('error', err?.message || 'Failed to delete ticket(s).');
    } finally {
      setDeleting(false);
    }
  }

  // ── Filtering ────────────────────────────────────────────────────
  const filteredTickets = tickets.filter(t => {
    if (statusFilter && t.status !== statusFilter) return false;
    if (searchQuery) {
      const q = searchQuery.replace(/^#/, '').toLowerCase();
      if (!(t.ticket_id || '').toLowerCase().includes(q)) return false;
    }
    return true;
  });

  // Reset page when filters change
  useEffect(() => { setPage(1); }, [statusFilter, searchQuery]);

  // ── Pagination & selection ───────────────────────────────────────
  const totalPages    = Math.max(1, Math.ceil(filteredTickets.length / PER_PAGE));
  const pagedTickets  = filteredTickets.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const pageIds       = pagedTickets.map(t => t._id);
  const allPageChecked = pageIds.length > 0 && pageIds.every(id => checked.has(id));

  function toggleCheck(id) {
    setChecked(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function toggleAll() {
    setChecked(prev => {
      const next = new Set(prev);
      const allOn = pageIds.every(id => next.has(id));
      allOn ? pageIds.forEach(id => next.delete(id)) : pageIds.forEach(id => next.add(id));
      return next;
    });
  }

  // ════════════════════════════════════════════════════════════════
  // ADD VIEW
  // ════════════════════════════════════════════════════════════════
  if (view === 'add') {
    return (
      <>
        <Toast toast={toast} />
        <div className={s.subPageHeader}>
          <button className={s.btnBack} onClick={() => setView('list')}>← Back</button>
          <h2 className={s.subPageTitle}>Raise A Ticket</h2>
        </div>

        <div className={s.formCard}>
          <form onSubmit={handleSubmit}>
            <div className={s.formGrid}>
              <div className={s.fieldGroup}>
                <label className={s.label}>Issue Type</label>
                <div className={s.selectWrap}>
                  <select className={s.select} value={form.issueType} onChange={setField('issueType')} required>
                    <option value="" disabled>Select Issue Type…</option>
                    {ISSUE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                  <span className={s.chevron}><ChevronDown /></span>
                </div>
              </div>
              <div className={s.fieldGroup}>
                <label className={s.label}>Priority</label>
                <div className={s.selectWrap}>
                  <select className={s.select} value={form.priority} onChange={setField('priority')}>
                    {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                  <span className={s.chevron}><ChevronDown /></span>
                </div>
              </div>
            </div>

            <div className={s.fieldGroup}>
              <label className={s.label}>Subject</label>
              <input className={s.input} placeholder="Brief description of the issue…" value={form.subject} onChange={setField('subject')} required />
            </div>

            <div className={s.fieldGroup}>
              <label className={s.label}>Description</label>
              <textarea className={s.textarea} placeholder="Describe your issue in detail…" value={form.description} onChange={setField('description')} rows={5} required />
            </div>

            <div className={s.formFooter}>
              <button type="button" className={s.btnCancel} onClick={() => setView('list')}>Cancel</button>
              <button type="submit" className={s.btnSubmit} disabled={submitting}>
                {submitting ? 'Submitting…' : 'Raise a Ticket'}
              </button>
            </div>
          </form>
        </div>
      </>
    );
  }

  // ════════════════════════════════════════════════════════════════
  // VIEW DETAIL
  // ════════════════════════════════════════════════════════════════
  if (view === 'view' && selectedTicket) {
    const t  = selectedTicket;
    const sc = STATUS_CFG[t.status] ?? { label: t.status, cls: 'statusOpen', progress: 10 };
    return (
      <>
        <Toast toast={toast} />
        <div className={s.subPageHeader}>
          <button className={s.btnBack} onClick={() => setView('list')}>← Back</button>
          <h2 className={s.subPageTitle}>Ticket Details</h2>
          <button className={s.btnDeleteOutline} onClick={() => setDeleteModal([t._id])}>Delete</button>
        </div>

        <div className={s.viewCard}>
          <div className={s.viewCardHeader}>
            <div className={s.ticketIdGroup}>
              <span className={s.ticketId}>#{t.ticket_id}</span>
              <span className={s.ticketDot}>·</span>
              <span className={s.ticketCategory}>{t.issue_type}</span>
            </div>
            <span className={`${s.statusBadge} ${s[sc.cls]}`}>{sc.label}</span>
          </div>

          <div className={s.viewSubject}>{t.subject}</div>

          <div className={s.viewMeta}>
            <div className={s.viewMetaItem}><span className={s.viewMetaLabel}>Priority</span><span className={s.viewMetaVal}>{t.priority}</span></div>
            <div className={s.viewMetaItem}><span className={s.viewMetaLabel}>Raised On</span><span className={s.viewMetaVal}>{formatDate(t.createdAt)}</span></div>
            <div className={s.viewMetaItem}><span className={s.viewMetaLabel}>Ticket ID</span><span className={s.viewMetaVal}>#{t.ticket_id}</span></div>
            <div className={s.viewMetaItem}><span className={s.viewMetaLabel}>Status</span><span className={`${s.statusBadge} ${s[sc.cls]}`}>{sc.label}</span></div>
          </div>

          <div className={s.viewSection}>
            <span className={s.viewSectionLabel}>Description</span>
            <p className={s.viewSectionText}>{t.desc}</p>
          </div>

          {t.resolve_text && (
            <div className={s.viewSection}>
              <span className={s.viewSectionLabel}>Resolution Notes</span>
              <p className={s.viewSectionText}>{t.resolve_text}</p>
            </div>
          )}
        </div>

        {/* Response history */}
        {Array.isArray(t.logs) && t.logs.length > 0 && (
          <div className={s.logsCard}>
            <h3 className={s.logsTitle}>Response History</h3>
            <div className={s.logsList}>
              {[...t.logs].reverse().map((log, i) => {
                const logSc = STATUS_CFG[log.status] ?? null;
                return (
                  <div key={i} className={s.logEntry}>
                    <div className={s.logEntryHeader}>
                      <span className={s.logDate}>{formatDateTime(log.date)}</span>
                      <span className={s.logAdmin}>{log.adminName || 'Admin'}</span>
                      {logSc && (
                        <span className={`${s.statusBadge} ${s[logSc.cls]}`}>{logSc.label}</span>
                      )}
                    </div>
                    {log.comment && (
                      <p className={s.logComment}>{log.comment}</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {deleteModal && (
          <DeleteModal count={deleteModal.length} onCancel={() => setDeleteModal(null)} onConfirm={confirmDelete} deleting={deleting} />
        )}
      </>
    );
  }

  // ════════════════════════════════════════════════════════════════
  // LIST VIEW
  // ════════════════════════════════════════════════════════════════
  return (
    <>
      <Toast toast={toast} />

      {/* Header */}
      <div className={s.listHeader}>
        <h2 className={s.listTitle}>Support Tickets
          {!loading && (
            <span className={s.countChip}>
              {filteredTickets.length !== tickets.length
                ? `${filteredTickets.length} / ${tickets.length}`
                : tickets.length}
            </span>
          )}
        </h2>
        <div className={s.listHeaderRight}>
          <button className={s.btnNewTicket} onClick={() => setView('add')}>+ New Ticket</button>
        </div>
      </div>

      {/* Filter bar */}
      <div className={s.filterBar}>
        <div className={s.filterSearch}>
          <span className={s.filterSearchIcon}>
            <svg viewBox="0 0 20 20" fill="currentColor" width="14" height="14">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
          </span>
          <input
            className={s.filterInput}
            type="text"
            placeholder="#TKT-001"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
        <div className={s.filterSelectWrap}>
          <select
            className={s.filterSelect}
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            {Object.entries(STATUS_CFG).filter(([k]) => k !== 'deleted').map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>
          <span className={s.filterChevron}><ChevronDown /></span>
        </div>
      </div>

      {/* List Card */}
      <div className={s.listCard}>
        {loading ? (
          <div className={s.emptyState}>Loading tickets…</div>
        ) : tickets.length === 0 ? (
          <div className={s.emptyState}>
            No tickets yet.{' '}
            <button className={s.emptyLink} onClick={() => setView('add')}>Raise your first ticket →</button>
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className={s.emptyState}>No tickets match your filters.</div>
        ) : (
          <>
            {/* Select-all row */}
            <div className={s.selectAllRow}>
              <label className={s.checkboxLabel}>
                <input type="checkbox" className={s.checkbox} checked={allPageChecked} onChange={toggleAll} />
                Select all on this page
              </label>
            </div>

            <div className={s.ticketList}>
              {pagedTickets.map(ticket => {
                const sc      = STATUS_CFG[ticket.status] ?? STATUS_CFG.open;
                const isChkd  = checked.has(ticket._id);
                return (
                  <div key={ticket._id} className={`${s.ticketRow} ${isChkd ? s.ticketRowChecked : ''}`}>
                    {/* Checkbox */}
                    <div className={s.ticketChkCell}>
                      <input
                        type="checkbox"
                        className={s.checkbox}
                        checked={isChkd}
                        onChange={() => toggleCheck(ticket._id)}
                        onClick={e => e.stopPropagation()}
                      />
                    </div>

                    {/* Body — clickable */}
                    <div className={s.ticketRowBody} onClick={() => { setSelectedTicket(ticket); setView('view'); }}>
                      <div className={s.ticketTopRow}>
                        <div className={s.ticketIdGroup}>
                          <span className={s.ticketId}>#{ticket.ticket_id}</span>
                          <span className={s.ticketDot}>·</span>
                          <span className={s.ticketCategory}>{ticket.issue_type}</span>
                        </div>
                        <span className={`${s.statusBadge} ${s[sc.cls]}`}>{sc.label}</span>
                      </div>
                      <div className={s.ticketTitle}>{ticket.subject}</div>
                      <div className={s.ticketProgressRow}>
                        <div className={s.ticketTrack}>
                          <div className={s.ticketFill} style={{ width: `${sc.progress}%`, background: progressColor(ticket.status) }} />
                        </div>
                      </div>
                      <div className={s.ticketMeta}>
                        Raised {formatDate(ticket.createdAt)} · {ticket.priority} · {ticket.issue_type}
                      </div>
                    </div>

                    {/* Delete icon */}
                    <button
                      className={s.btnRowDelete}
                      onClick={e => { e.stopPropagation(); setDeleteModal([ticket._id]); }}
                      title="Delete ticket"
                    >
                      <TrashIcon />
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Table footer — superadmin style */}
            <div className={s.tableFooter}>
              <div className={s.footerLeft}>
                {checked.size > 0 && (
                  <button className={s.btnBulkDelete} onClick={() => setDeleteModal([...checked])}>
                    Delete Selected ({checked.size})
                  </button>
                )}
                <span>
                  {`Showing ${(page - 1) * PER_PAGE + 1} to ${Math.min(page * PER_PAGE, filteredTickets.length)} of ${filteredTickets.length} ticket${filteredTickets.length !== 1 ? 's' : ''}`}
                </span>
              </div>
              <div className={s.pagination}>
                <button className={s.pageBtn} disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
                  Previous
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                  <button
                    key={n}
                    className={`${s.pageBtn} ${n === page ? s.pageBtnActive : ''}`}
                    onClick={() => setPage(n)}
                  >
                    {n}
                  </button>
                ))}
                <button className={s.pageBtn} disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Delete modal */}
      {deleteModal && (
        <DeleteModal count={deleteModal.length} onCancel={() => setDeleteModal(null)} onConfirm={confirmDelete} deleting={deleting} />
      )}
    </>
  );
}
