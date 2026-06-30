'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { selectUser } from '../../../redux/slices/authSlice';
import apiServiceHandler from '../../../service/apiService';
import s from './UserManagement.module.css';

// ── Icons (content-area only) ─────────────────────────────────────
const Icon = {
  dotsV: <svg viewBox="0 0 20 20" fill="currentColor"><path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" /></svg>,
  learners: <svg viewBox="0 0 20 20" fill="currentColor"><path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v1h8v-1zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-1a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v1h-3zM4.75 14.094A5.973 5.973 0 004 17v1H1v-1a3 3 0 013.75-2.906z" /></svg>,
  active: <svg viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>,
  inactive: <svg viewBox="0 0 20 20" fill="currentColor"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z" /><path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" /></svg>,
  deactivated: <svg viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524L13.477 14.89zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clipRule="evenodd" /></svg>,
};

// Status badge config
const STATUS_CONFIG = {
  top:        { label: 'TOP',        className: s.badgeTop },
  active:     { label: 'TOP',        className: s.badgeTop },
  at_risk:    { label: 'AT RISK',    className: s.badgeAtRisk },
  struggling: { label: 'STRUGGLING', className: s.badgeStruggling },
  inactive:   { label: 'INACTIVE',   className: s.badgeInactive },
};

function getStatusConfig(status) {
  const key = (status || 'active').toLowerCase().replace(' ', '_');
  return STATUS_CONFIG[key] || STATUS_CONFIG.active;
}

const LIMIT = 10;

function StatRing({ value, pct, light }) {
  const R = 24, sw = 5;
  const size = (R + sw) * 2 + 4;
  const cx = size / 2, cy = size / 2;
  const circ = 2 * Math.PI * R;
  const arc = (Math.max(0, Math.min(pct ?? 0, 100)) / 100) * circ;
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}
           style={{ display: 'block', transform: 'rotate(-90deg)' }}>
        <circle cx={cx} cy={cy} r={R} fill="none"
                stroke={light ? 'rgba(255,255,255,0.28)' : '#d4eeee'} strokeWidth={sw} />
        <circle cx={cx} cy={cy} r={R} fill="none"
                stroke={light ? '#fff' : '#0b7b7b'} strokeWidth={sw}
                strokeDasharray={`${arc} ${circ - arc}`} strokeLinecap="round" />
      </svg>
      <div style={{
        position: 'absolute', inset: 0, display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        fontSize: 11, fontWeight: 700, lineHeight: 1,
        color: light ? '#fff' : '#1a2b2b',
      }}>{value}</div>
    </div>
  );
}

export default function UserManagementPage() {
  const user = useSelector(selectUser);
  const router = useRouter();

  const [learners, setLearners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0, deactivated: 0 });
  const [openMenuId, setOpenMenuId] = useState(null);
  const [courseMap, setCourseMap] = useState({}); // { userId: ['Course A', 'Course B'] }
  const [page, setPage] = useState(1);

  function getTokenUserId() {
    if (typeof window === 'undefined') return null;
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) return null;
      const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
      return payload._id || null;
    } catch { return null; }
  }

  const loadLearners = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Resolve orgId — from Redux, or fetch user record from DB
      let effectiveOrgId = user?.orgId ? String(user.orgId) : null;
      if (!effectiveOrgId) {
        const effectiveUserId = user?._id || getTokenUserId();
        if (effectiveUserId) {
          const userRes = await apiServiceHandler('GET', `user/admin/edit/${effectiveUserId}`);
          const userRecord = userRes?.data ?? userRes;
          if (userRecord?.orgId) effectiveOrgId = String(userRecord.orgId);
        }
      }

      if (!effectiveOrgId) { setLearners([]); setLoading(false); return; }

      // 2. Fetch employees of this org
      const params = new URLSearchParams({ orgId: effectiveOrgId, user_type: 'employee', orgRole: 'employee' });
      const res = await apiServiceHandler('GET', `user/admin/list?${params.toString()}`);
      const data = res?.data ?? res;
      const list = Array.isArray(data) ? data : [];

      setLearners(list);
      const total = list.length;
      const active = list.filter(u => u.status === 'active' || !u.status).length;
      const inactive = list.filter(u => u.status === 'inactive').length;
      const deactivated = list.filter(u => u.status === 'deactivated' || u.status === 'suspended').length;
      setStats({ total, active, inactive, deactivated });

      // Fetch all course assignments for this org in one call
      if (list.length > 0) {
        apiServiceHandler('GET', `course-assignment/list?organizationId=${effectiveOrgId}`)
          .then(caRes => {
            const assignments = Array.isArray(caRes?.data) ? caRes.data : [];
            const map = {};
            assignments.forEach(a => {
              const uid = a.userId?._id ? String(a.userId._id) : String(a.userId);
              const title = a.courseId?.title || null;
              if (!title) return;
              if (!map[uid]) map[uid] = [];
              if (!map[uid].includes(title)) map[uid].push(title);
            });
            setCourseMap(map);
          })
          .catch(() => {});
      }
    } catch {
      setLearners([]);
    } finally {
      setLoading(false);
    }
  }, [user?._id, user?.orgId]);

  useEffect(() => { loadLearners(); }, [loadLearners]);

  // Close menu on outside click
  useEffect(() => {
    function handleClick() { setOpenMenuId(null); }
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  function formatLastActive(dateStr) {
    if (!dateStr) return 'Today';
    const d = new Date(dateStr);
    const now = new Date();
    const diff = Math.floor((now - d) / 86400000);
    if (diff === 0) return 'Today';
    if (diff === 1) return 'Yesterday';
    return `${diff}d ago`;
  }

  function getInitials(name) {
    if (!name) return '?';
    return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  }

  const totalPages    = Math.max(1, Math.ceil(learners.length / LIMIT));
  const from          = learners.length === 0 ? 0 : (page - 1) * LIMIT + 1;
  const to            = Math.min(page * LIMIT, learners.length);
  const pagedLearners = learners.slice((page - 1) * LIMIT, page * LIMIT);
  const displayStats  = stats;

  return (
    <>
      <div className={s.pageTitle}>User Management</div>

      {/* ── Stats row ── */}
      <div className={s.statsRow}>

        <div className={`${s.statCard} ${s.statCardTeal}`}>
          <div className={s.statBody}>
            <div className={s.statHeader}>
              <div className={s.statIcon}>{Icon.learners}</div>
              <div className={s.statLabel}>Total Learners</div>
            </div>
            <div className={s.statValue}>{loading ? '—' : displayStats.total}</div>
            <div className={`${s.statDelta} ${s.statDeltaUp}`}>↑ 7 This Month</div>
          </div>
          <StatRing value={loading ? 0 : displayStats.total} pct={Math.min(displayStats.total, 100)} light />
        </div>

        <div className={s.statCard}>
          <div className={s.statBody}>
            <div className={s.statHeader}>
              <div className={s.statIcon}>{Icon.active}</div>
              <div className={s.statLabel}>Active</div>
            </div>
            <div className={s.statValue}>{loading ? '—' : displayStats.active}</div>
            <div className={`${s.statDelta} ${s.statDeltaUp}`}>↑ 1 New</div>
          </div>
          <StatRing value={loading ? 0 : displayStats.active}
            pct={displayStats.total ? Math.round(displayStats.active / displayStats.total * 100) : 0} />
        </div>

        <div className={s.statCard}>
          <div className={s.statBody}>
            <div className={s.statHeader}>
              <div className={s.statIcon}>{Icon.inactive}</div>
              <div className={s.statLabel}>Inactive</div>
            </div>
            <div className={s.statValue}>{loading ? '—' : displayStats.inactive}</div>
            <div className={`${s.statDelta} ${s.statDeltaUp}`}>↑ 6% MoM</div>
          </div>
          <StatRing value={loading ? 0 : displayStats.inactive}
            pct={displayStats.total ? Math.round(displayStats.inactive / displayStats.total * 100) : 0} />
        </div>

        <div className={s.statCard}>
          <div className={s.statBody}>
            <div className={s.statHeader}>
              <div className={s.statIcon}>{Icon.deactivated}</div>
              <div className={s.statLabel}>Deactivated</div>
            </div>
            <div className={s.statValue}>{loading ? '—' : displayStats.deactivated}</div>
            <div className={s.statDelta}>Low — 500 Issued</div>
          </div>
          <StatRing value={loading ? 0 : displayStats.deactivated}
            pct={displayStats.total ? Math.round(displayStats.deactivated / displayStats.total * 100) : 0} />
        </div>

      </div>

      {/* ── Table card ── */}
      <div className={s.tableCard}>
        <div className={s.tableCardTitle}>All Learners</div>
        <table className={s.table}>
          <thead>
            <tr>
              <th className={s.th}>Name</th>
              <th className={s.th}>Email</th>
              <th className={s.th}>Assigned Courses</th>
              <th className={s.th}>Last Active</th>
              <th className={s.th}>Status</th>
              <th className={s.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <tr key={i} className={s.tr}>
                  <td className={s.td} colSpan={6}>
                    <div className={s.skeletonRow} />
                  </td>
                </tr>
              ))
            ) : pagedLearners.map(learner => {
              const cfg = getStatusConfig(learner.status);
              const isTop = !['at_risk', 'struggling', 'inactive'].includes((learner.status || '').toLowerCase().replace(' ', '_'));
              return (
                <tr key={learner._id} className={s.tr}>
                  <td className={s.td}>
                    <div className={s.nameCell}>
                      <div className={s.avatar}>{getInitials(learner.name)}</div>
                      <span className={s.learnerName}>{learner.name || learner.email}</span>
                    </div>
                  </td>
                  <td className={s.td}><span className={s.emailText}>{learner.email}</span></td>
                  <td className={s.td}><span className={s.courseCount}>{courseMap[String(learner._id)]?.length ?? '—'}</span></td>
                  <td className={s.td}><span className={s.lastActive}>{formatLastActive(learner.lastActive || learner.last_active)}</span></td>
                  <td className={s.td}>
                    <span className={`${s.badge} ${cfg.className}`}>{cfg.label}</span>
                  </td>
                  <td className={s.td}>
                    <div className={s.actionsCell}>
                      <button
                        className={isTop ? s.btnView : s.btnReactive}
                        onClick={() => router.push(`/storeowner/users/${learner._id}`)}
                      >
                        {isTop ? 'VIEW' : 'REACTIVE'}
                      </button>
                      <div className={s.menuWrap}>
                        <button
                          className={s.dotsBtn}
                          onClick={e => { e.stopPropagation(); setOpenMenuId(openMenuId === learner._id ? null : learner._id); }}
                        >
                          {Icon.dotsV}
                        </button>
                        {openMenuId === learner._id && (
                          <div className={s.dropMenu} onClick={e => e.stopPropagation()}>
                            <button className={s.dropItem} onClick={() => { setOpenMenuId(null); router.push(`/storeowner/users/${learner._id}`); }}>View Profile</button>
                            <button className={s.dropItem} onClick={() => setOpenMenuId(null)}>Assign Course</button>
                            <button className={`${s.dropItem} ${s.dropItemDanger}`} onClick={() => setOpenMenuId(null)}>Deactivate</button>
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <div className={s.pagination}>
          <div className={s.footerLeft}>
            <span>Showing {from}–{to} of {learners.length}</span>
          </div>
          <div className={s.paginationBtns}>
            <button className={s.pageBtn} disabled={page <= 1} onClick={() => setPage(p => p - 1)}>‹</button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button
                key={p}
                className={`${s.pageBtn} ${p === page ? s.pageBtnActive : ''}`}
                onClick={() => setPage(p)}
              >
                {p}
              </button>
            ))}
            <button className={s.pageBtn} disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>›</button>
          </div>
        </div>

      </div>
    </>
  );
}
