'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import apiServiceHandler from '../../../service/apiService';
import SuperAdminShell from '../SuperAdminShell';
import ConfirmModal from '../ConfirmModal';
import s from './Payments.module.css';

const SearchIcon = () => (
  <svg viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
  </svg>
);
const EyeIcon = () => (
  <svg viewBox="0 0 20 20" fill="currentColor">
    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
  </svg>
);
const TrashIcon = () => (
  <svg viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
  </svg>
);

function fmtDate(val) {
  if (!val) return '—';
  const d = new Date(val);
  if (isNaN(d)) return '—';
  return `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}`;
}

function fmtAmount(val, currency = 'INR') {
  if (val === null || val === undefined) return '—';
  const symbol = currency === 'INR' ? '₹' : currency + ' ';
  return `${symbol}${Number(val).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

const PAYMENT_STATUS_COLORS = {
  paid:     { bg: '#dcfce7', color: '#16a34a' },
  pending:  { bg: '#fef9c3', color: '#ca8a04' },
  failed:   { bg: '#fee2e2', color: '#dc2626' },
  refunded: { bg: '#e0f2fe', color: '#0284c7' },
};

const LIMIT = 50;

export default function InvoicesList() {
  const router = useRouter();
  const [invoices, setInvoices]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState('');
  const [page, setPage]             = useState(1);
  const [total, setTotal]           = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [confirm, setConfirm]       = useState({ show: false, id: null });
  const [selected, setSelected]     = useState([]);
  const [bulkConfirm, setBulkConfirm] = useState(false);

  const fetchInvoices = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams({ page, limit: LIMIT });
    apiServiceHandler('GET', `invoice/list-pagination?${params}`)
      .then(res => {
        setInvoices(Array.isArray(res?.data) ? res.data : []);
        setTotal(res?.total ?? 0);
        setTotalPages(res?.totalPages ?? 1);
      })
      .catch(() => setInvoices([]))
      .finally(() => setLoading(false));
  }, [page]);

  useEffect(() => { fetchInvoices(); }, [fetchInvoices]);

  const filtered = search
    ? invoices.filter(inv =>
        (inv.invoice_no || '').toLowerCase().includes(search.toLowerCase()) ||
        (inv.org_id?.org_name || '').toLowerCase().includes(search.toLowerCase()) ||
        (inv.bill_name || '').toLowerCase().includes(search.toLowerCase()) ||
        (inv.payment_status || '').toLowerCase().includes(search.toLowerCase())
      )
    : invoices;

  function doDelete() {
    const { id } = confirm;
    setConfirm({ show: false, id: null });
    apiServiceHandler('GET', `invoice/delete/${id}`)
      .then(() => { toast.success('Invoice deleted.'); fetchInvoices(); })
      .catch(() => toast.error('Delete failed.'));
  }

  const allIds = filtered.map(inv => inv._id);
  const allSelected = allIds.length > 0 && allIds.every(id => selected.includes(id));
  const toggleAll = () => setSelected(allSelected ? [] : allIds);
  const toggleOne = id => setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  function doBulkDelete() {
    setBulkConfirm(false);
    const ids = [...selected];
    setSelected([]);
    Promise.all(ids.map(id => apiServiceHandler('GET', `invoice/delete/${id}`)))
      .then(() => { toast.success(`${ids.length} invoice${ids.length !== 1 ? 's' : ''} deleted.`); fetchInvoices(); })
      .catch(() => toast.error('Some deletes failed.'));
  }

  const from = total === 0 ? 0 : (page - 1) * LIMIT + 1;
  const to   = Math.min(page * LIMIT, total);

  return (
    <SuperAdminShell activeSection="invoices">
      <ConfirmModal
        show={confirm.show}
        title="Delete Invoice"
        message="Are you sure you want to delete this invoice?"
        confirmLabel="Delete"
        onConfirm={doDelete}
        onCancel={() => setConfirm({ show: false, id: null })}
      />
      <ConfirmModal
        show={bulkConfirm}
        title="Delete Selected Invoices"
        message={`Delete ${selected.length} selected invoice${selected.length !== 1 ? 's' : ''}? This action cannot be undone.`}
        confirmLabel="Delete All"
        onConfirm={doBulkDelete}
        onCancel={() => setBulkConfirm(false)}
      />

      <div className={s.pageHeader}>
        <div>
          <h1 className={s.pageTitle}>Invoices</h1>
          <p className={s.pageSubtitle}>Credit purchase invoices</p>
        </div>
        <button className={s.btnAdd} onClick={() => router.push('/superadmin/payments/invoices/add')}>
          + Add Invoice
        </button>
      </div>

      <div className={s.card}>
        <div className={s.toolbar}>
          <div className={s.searchWrap}>
            <SearchIcon />
            <input
              className={s.searchInput}
              type="text"
              placeholder="Search by invoice no, organization, or payment status…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className={s.tableWrap}>
          <table className={s.table}>
            <thead>
              <tr>
                <th className={s.checkTh}><input type="checkbox" checked={allSelected} onChange={toggleAll} /></th>
                <th>#</th>
                <th>Invoice No</th>
                <th>Organization</th>
                <th>Credit Package</th>
                <th>Sub Total</th>
                <th>Discount</th>
                <th>Tax</th>
                <th>Total</th>
                <th>Payment</th>
                <th>Method</th>
                <th>Payment Date</th>
                <th>Status</th>
                <th>Created At</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr className={s.emptyRow}><td colSpan={15}>Loading…</td></tr>
              ) : filtered.length === 0 ? (
                <tr className={s.emptyRow}><td colSpan={15}>No invoices found.</td></tr>
              ) : filtered.map((inv, idx) => {
                const ps = PAYMENT_STATUS_COLORS[inv.payment_status] || { bg: '#f3f4f6', color: '#374151' };
                return (
                  <tr key={inv._id}>
                    <td className={s.checkTd}><input type="checkbox" checked={selected.includes(inv._id)} onChange={() => toggleOne(inv._id)} /></td>
                    <td>{(page - 1) * LIMIT + idx + 1}</td>
                    <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{inv.invoice_no || '—'}</td>
                    <td>{inv.org_id?.org_name || '—'}</td>
                    <td>{inv.order_id?.credit_id?.title || '—'}</td>
                    <td>{fmtAmount(inv.sub_total, inv.currency)}</td>
                    <td>{fmtAmount(inv.discount, inv.currency)}</td>
                    <td>{fmtAmount(inv.tax, inv.currency)}</td>
                    <td><strong>{fmtAmount(inv.total_amount, inv.currency)}</strong></td>
                    <td>
                      <span style={{ display: 'inline-block', padding: '2px 9px', borderRadius: 20, fontSize: 11.5, fontWeight: 600, background: ps.bg, color: ps.color, textTransform: 'capitalize' }}>
                        {inv.payment_status || '—'}
                      </span>
                    </td>
                    <td style={{ textTransform: 'capitalize' }}>{inv.payment_method || '—'}</td>
                    <td>{fmtDate(inv.payment_date)}</td>
                    <td>
                      {inv.status === 'active'
                        ? <span className={s.badgeActive}>Active</span>
                        : <span className={s.badgeInactive}>Inactive</span>}
                    </td>
                    <td>{fmtDate(inv.createdAt)}</td>
                    <td>
                      <div className={s.actions}>
                        <button className={s.btnView} title="View" onClick={() => router.push(`/superadmin/payments/invoices/view/${inv._id}`)}>
                          <EyeIcon />
                        </button>
                        <button className={s.btnDelete} title="Delete" onClick={() => setConfirm({ show: true, id: inv._id })}>
                          <TrashIcon />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className={s.pagination}>
          <div className={s.footerLeft}>
            {selected.length > 0 && (
              <button className={s.btnBulkDelete} onClick={() => setBulkConfirm(true)}>
                Delete {selected.length} Selected
              </button>
            )}
            <span>Showing {from}–{to} of {total}</span>
          </div>
          <div className={s.paginationBtns}>
            <button className={s.pageBtn} disabled={page <= 1} onClick={() => setPage(p => p - 1)}>‹</button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button key={p} className={`${s.pageBtn} ${p === page ? s.pageBtnActive : ''}`} onClick={() => setPage(p)}>{p}</button>
            ))}
            <button className={s.pageBtn} disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>›</button>
          </div>
        </div>
      </div>
    </SuperAdminShell>
  );
}
