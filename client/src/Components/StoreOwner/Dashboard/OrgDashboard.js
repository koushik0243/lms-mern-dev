'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import { selectUser, clearAuth } from '../../../redux/slices/authSlice';
import apiServiceHandler from '../../../service/apiService';
import s from './OrgDashboard.module.css';

// ── Circular progress ring ──────────────────────────────────────
function Ring({ pct, label }) {
  const r = 28;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  return (
    <div className={s.ringItem}>
      <div className={s.ringWrap}>
        <svg width="72" height="72" viewBox="0 0 72 72">
          <circle className={s.ringBg} cx="36" cy="36" r={r} />
          <circle
            className={s.ringFill}
            cx="36" cy="36" r={r}
            strokeDasharray={circ}
            strokeDashoffset={offset}
          />
        </svg>
        <div className={s.ringPct}>{pct}%</div>
      </div>
      <div className={s.ringLabel}>{label}</div>
    </div>
  );
}

// ── Avatar initials ─────────────────────────────────────────────
function Av({ name }) {
  const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  return <div className={s.avatar}>{initials}</div>;
}

// ── Nav item ────────────────────────────────────────────────────
function NavItem({ icon, label, active, onClick }) {
  return (
    <button className={`${s.navItem} ${active ? s.navItemActive : ''}`} onClick={onClick}>
      <span className={s.navIcon}>{icon}</span>
      {label}
    </button>
  );
}

// ── Static data ─────────────────────────────────────────────────
const COURSES = [
  { label: 'Safety At Work', pct: 88 },
  { label: 'QC Basics', pct: 74 },
  { label: 'Compliance & Ethics', pct: 61 },
  { label: 'Leadership Basics', pct: 42 },
  { label: 'Fire Safety', pct: 29 },
];

const TOP = [
  { name: 'Mike Devid' },
  { name: 'Karan Malhotra' },
  { name: 'Sneha Iyer' },
  { name: 'Rahul Das' },
];

const BOTTOM = [
  { name: 'Aarav Sharma', badge: 'AT RISK', cls: 'badgeRisk' },
  { name: 'Riya Mehta', badge: 'STRUGGLING', cls: 'badgeStruggling' },
  { name: 'Arjun Verma', badge: 'STRUGGLING', cls: 'badgeStruggling' },
  { name: 'Neha Kapoor', badge: 'STRUGGLING', cls: 'badgeStruggling' },
];

const ACTIVITY = [
  { text: 'Anita Sharma completed Safety at Work', meta: '1 Hour Ago · Certificate Issued' },
  { text: '5 new learners added to QC Basics', meta: '3 Hours Ago' },
  { text: 'Priya K. failed Ethics quiz — retry 2/2', meta: 'Yesterday · Mandatory Rewatch Triggered' },
  { text: 'Credits low — 50 remaining of 500', meta: 'Yesterday · Consider Upgrading Plan' },
  { text: 'Credits low — 50 remaining of 500', meta: 'Yesterday · Consider Upgrading Plan' },
  { text: 'Credits low — 50 remaining of 500', meta: 'Yesterday · Consider Upgrading Plan' },
  { text: 'Credits low — 50 remaining of 500', meta: 'Yesterday · Consider Upgrading Plan' },
  { text: 'Credits low — 50 remaining of 500', meta: 'Yesterday · Consider Upgrading Plan' },
];

// ── SVG Icons ───────────────────────────────────────────────────
const Icon = {
  dashboard: <svg viewBox="0 0 20 20" fill="currentColor"><path d="M2 10a8 8 0 1116 0A8 8 0 012 10zm8-3a1 1 0 100 2 1 1 0 000-2zm-3 8a3 3 0 016 0H7z" /></svg>,
  store: <svg viewBox="0 0 20 20" fill="currentColor"><path d="M3 4a1 1 0 000 2h14a1 1 0 000-2H3zm-1 4a1 1 0 011-1h14a1 1 0 110 2H3a1 1 0 01-1-1zm1 4a1 1 0 000 2h8a1 1 0 000-2H3z" /></svg>,
  users: <svg viewBox="0 0 20 20" fill="currentColor"><path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zm8 0a3 3 0 11-6 0 3 3 0 016 0zM6.865 14c.41-1.135 1.53-2 2.635-2h1c1.105 0 2.226.865 2.635 2H6.865zM1 14a5.002 5.002 0 019-3h.001A5 5 0 0119 14v1H1v-1z" /></svg>,
  assign: <svg viewBox="0 0 20 20" fill="currentColor"><path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" /><path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" /></svg>,
  courses: <svg viewBox="0 0 20 20" fill="currentColor"><path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4 7.962 7.962 0 009 5.189V4.804z" /></svg>,
  track: <svg viewBox="0 0 20 20" fill="currentColor"><path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zm6-4a1 1 0 011-1h2a1 1 0 011 1v13a1 1 0 01-1 1h-2a1 1 0 01-1-1V3z" /></svg>,
  reports: <svg viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm2 10a1 1 0 10-2 0v3a1 1 0 102 0v-3zm2-3a1 1 0 011 1v5a1 1 0 11-2 0v-5a1 1 0 011-1zm4-1a1 1 0 10-2 0v7a1 1 0 102 0V8z" clipRule="evenodd" /></svg>,
  subscription: <svg viewBox="0 0 20 20" fill="currentColor"><path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" /><path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" /></svg>,
  credits: <svg viewBox="0 0 20 20" fill="currentColor"><path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" /><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" /></svg>,
  support: <svg viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-2 0c0 .993-.241 1.929-.668 2.754l-1.524-1.525a3.997 3.997 0 00.078-2.183l1.562-1.562C15.802 8.249 16 9.1 16 10zm-5.165 3.913l1.58 1.58A5.98 5.98 0 0110 16a5.976 5.976 0 01-2.516-.552l1.562-1.562a4.006 4.006 0 001.789.027zm-4.677-2.796a4.002 4.002 0 01-.041-2.08l-.08.08-1.53-1.533A5.98 5.98 0 004 10c0 .954.223 1.856.619 2.657l1.54-1.54zm1.088-6.45A5.974 5.974 0 0110 4c.954 0 1.856.223 2.657.619l-1.54 1.54a4.002 4.002 0 00-2.346.033L7.246 4.668z" clipRule="evenodd" /></svg>,
  logout: <svg viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" /></svg>,
  plus: <svg viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>,
  bell: <svg viewBox="0 0 20 20" fill="currentColor"><path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zm0 16a2 2 0 01-2-2h4a2 2 0 01-2 2z" /></svg>,
  help: <svg viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" /></svg>,
  statLearners: <svg viewBox="0 0 20 20" fill="currentColor"><path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zm8 0a3 3 0 11-6 0 3 3 0 016 0zM6.865 14c.41-1.135 1.53-2 2.635-2h1c1.105 0 2.226.865 2.635 2H6.865zM1 14a5.002 5.002 0 019-3h.001A5 5 0 0119 14v1H1v-1z" /></svg>,
  statCourses: <svg viewBox="0 0 20 20" fill="currentColor"><path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4 7.962 7.962 0 009 5.189V4.804z" /></svg>,
  statCompletion: <svg viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>,
  statCredits: <svg viewBox="0 0 20 20" fill="currentColor"><path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" /><path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" /></svg>,
};

export default function OrganizationDashboard() {
  const user = useSelector(selectUser);
  const dispatch = useDispatch();
  const router = useRouter();

  const userName = user?.name || user?.email || 'Store Owner';
  const initials = userName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  const [stats, setStats] = useState({ learners: null, coursesAssigned: null });

  function getTokenUserId() {
    if (typeof window === 'undefined') return null;
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) return null;
      const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
      return payload._id || null;
    } catch { return null; }
  }

  const loadStats = useCallback(async () => {
    try {
      let effectiveOrgId = user?.orgId ? String(user.orgId) : null;
      if (!effectiveOrgId) {
        const uid = user?._id || getTokenUserId();
        if (uid) {
          const r = await apiServiceHandler('GET', `user/admin/edit/${uid}`);
          const rec = r?.data ?? r;
          if (rec?.orgId) effectiveOrgId = String(rec.orgId);
        }
      }
      if (!effectiveOrgId) return;

      const [learnersRes, assignRes] = await Promise.all([
        apiServiceHandler('GET', `user/admin/list?orgId=${effectiveOrgId}&user_type=employee&orgRole=employee`),
        apiServiceHandler('GET', `course-assignment/list?organizationId=${effectiveOrgId}`),
      ]);

      const learnerList = Array.isArray(learnersRes?.data) ? learnersRes.data : (Array.isArray(learnersRes) ? learnersRes : []);
      const assignList  = Array.isArray(assignRes?.data)   ? assignRes.data   : (Array.isArray(assignRes)  ? assignRes  : []);

      // Unique course IDs that have been assigned
      const uniqueCourseIds = new Set(assignList.map(a => String(a.courseId?._id || a.courseId)).filter(Boolean));

      setStats({ learners: learnerList.length, coursesAssigned: uniqueCourseIds.size });
    } catch { /* silent */ }
  }, [user?._id, user?.orgId]);

  useEffect(() => { loadStats(); }, [loadStats]);

  function handleLogout() {
    dispatch(clearAuth());
    if (typeof window !== 'undefined') {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('BHARAT_TOKEN');
    }
    router.replace('/login');
  }

  return (
    <div className={s.shell}>
      {/* ── Sidebar ── */}
      <aside className={s.sidebar}>
        <div className={s.sidebarLogo}><span className={s.logoD}>sikhø</span><span className={s.logoA}>aur</span><span className={s.logoD}>badhø</span></div>

        <div className={s.sidebarSection}>
          <div className={s.sidebarLabel}>Overview</div>
          <NavItem icon={Icon.dashboard} label="Dashboard" active onClick={() => router.push('/storeowner/dashboard')} />
          <NavItem icon={Icon.store} label="Store Profile" onClick={() => router.push('/storeowner/profile')} />
        </div>

        <div className={s.sidebarSection}>
          <div className={s.sidebarLabel}>Learners</div>
          <NavItem icon={Icon.users} label="User Management" onClick={() => router.push('/storeowner/users')} />
          <NavItem icon={Icon.assign} label="Assign Courses" onClick={() => router.push('/storeowner/assign-courses')} />
        </div>

        <div className={s.sidebarSection}>
          <div className={s.sidebarLabel}>Content</div>
          <NavItem icon={Icon.courses} label="My Courses" onClick={() => router.push('/storeowner/my-courses')} />
        </div>

        <div className={s.sidebarSection}>
          <div className={s.sidebarLabel}>Analytics</div>
          <NavItem icon={Icon.track} label="Track & Analysis" onClick={() => router.push('/storeowner/track-analysis')} />
          <NavItem icon={Icon.reports} label="Reports" onClick={() => router.push('/storeowner/reports')} />
        </div>

        <div className={s.sidebarSection}>
          <div className={s.sidebarLabel}>Account</div>
          <NavItem icon={Icon.subscription} label="Subscription" onClick={() => router.push('/storeowner/subscription')} />
          <NavItem icon={Icon.credits} label="Credits" onClick={() => router.push('/storeowner/credits')} />
          <NavItem icon={Icon.support} label="Support" onClick={() => router.push('/storeowner/support')} />
        </div>

        <div className={s.sidebarSpacer} />

        <div className={s.sidebarFooter}>
          <NavItem icon={Icon.logout} label="Log Out" onClick={handleLogout} />
        </div>
      </aside>

      {/* ── Main ── */}
      <div className={s.main}>
        {/* Top bar */}
        <header className={s.topbar}>
          <div className={s.breadcrumb}>
            Store Owner / <strong>Dashboard</strong>
          </div>
          <div className={s.topbarActions}>
            <button className={s.btnAddLearner} onClick={() => router.push('/storeowner/add-learner')}>
              <span style={{ fontSize: 16 }}>+</span> Add Learner
            </button>
            <button className={s.iconBtn} title="Help">{Icon.help}</button>
            <button className={s.iconBtn} title="Notifications">{Icon.bell}</button>
            <button className={s.avatarBtn} title={userName}>{initials}</button>
          </div>
        </header>

        {/* Content */}
        <div className={s.content}>
          <div className={s.pageTitle}>Overview</div>

          {/* Stat cards */}
          <div className={s.statsRow}>
            <div className={s.statCard}>
              <div className={s.statHeader}>
                <div className={s.statIcon}>{Icon.statLearners}</div>
                <div className={s.statLabel}>Total Learners</div>
              </div>
              <div className={s.statValue}>{stats.learners ?? '—'}</div>
              <div className={`${s.statDelta} ${s.statDeltaUp}`}>↑ 7 This Month</div>
            </div>
            <div className={s.statCard}>
              <div className={s.statHeader}>
                <div className={s.statIcon}>{Icon.statCourses}</div>
                <div className={s.statLabel}>Courses Assigned</div>
              </div>
              <div className={s.statValue}>{stats.coursesAssigned ?? '—'}</div>
              <div className={`${s.statDelta} ${s.statDeltaUp}`}>↑ 1 New</div>
            </div>
            <div className={s.statCard}>
              <div className={s.statHeader}>
                <div className={s.statIcon}>{Icon.statCompletion}</div>
                <div className={s.statLabel}>Completion Rate</div>
              </div>
              <div className={s.statValue}>74%</div>
              <div className={`${s.statDelta} ${s.statDeltaUp}`}>↑ 6% MoM</div>
            </div>
            <div className={s.statCard}>
              <div className={s.statHeader}>
                <div className={s.statIcon}>{Icon.statCredits}</div>
                <div className={s.statLabel}>Credits Remaining</div>
              </div>
              <div className={s.statValue}>50</div>
              <div className={`${s.statDelta} ${s.statDeltaWarn}`}>Low — 500 Issued</div>
            </div>
          </div>

          {/* Two-column */}
          <div className={s.twoCol}>
            <div>
              {/* Course completion */}
              <div className={s.card}>
                <div className={s.cardTitle}>Course completion overview</div>
                <div className={s.ringsRow}>
                  {COURSES.map(c => <Ring key={c.label} pct={c.pct} label={c.label} />)}
                </div>
              </div>

              {/* Performers */}
              <div className={s.card}>
                <div className={s.performersGrid}>
                  {/* Top */}
                  <div>
                    <div className={s.cardTitle}>Top performers</div>
                    <div className={s.performerList}>
                      {TOP.map(p => (
                        <div key={p.name} className={s.performerRow}>
                          <Av name={p.name} />
                          <div className={s.performerInfo}>
                            <div className={s.performerName}>{p.name}</div>
                            <div className={s.performerMeta}>Courses Done: 4/6 · Avg. Score: 94%</div>
                          </div>
                          <span className={`${s.badge} ${s.badgeTop}`}>TOP</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* Bottom */}
                  <div>
                    <div className={s.cardTitle}>Bottom performers</div>
                    <div className={s.performerList}>
                      {BOTTOM.map(p => (
                        <div key={p.name} className={s.performerRow}>
                          <Av name={p.name} />
                          <div className={s.performerInfo}>
                            <div className={s.performerName}>{p.name}</div>
                            <div className={s.performerMeta}>Courses Done: 4/6 · Avg. Score: 94%</div>
                          </div>
                          <span className={`${s.badge} ${s[p.cls]}`}>{p.badge}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent activity */}
            <div className={s.card} style={{ alignSelf: 'start' }}>
              <div className={s.cardTitle}>Recent activity</div>
              <div className={s.activityList}>
                {ACTIVITY.map((a, i) => (
                  <div key={i} className={s.activityItem}>
                    <div className={s.activityNum}>{String(i + 1).padStart(2, '0')}</div>
                    <div className={s.activityBody}>
                      <div className={s.activityText}>{a.text}</div>
                      <div className={s.activityMeta}>{a.meta}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
