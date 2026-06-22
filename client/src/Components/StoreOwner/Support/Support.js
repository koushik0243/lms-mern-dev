'use client';

import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import { selectUser, clearAuth } from '../../../redux/slices/authSlice';
import s from './Support.module.css';

// ── Icons ────────────────────────────────────────────────────────
const Icon = {
  dashboard:    <svg viewBox="0 0 20 20" fill="currentColor"><path d="M2 10a8 8 0 1116 0A8 8 0 012 10zm8-3a1 1 0 100 2 1 1 0 000-2zm-3 8a3 3 0 016 0H7z" /></svg>,
  store:        <svg viewBox="0 0 20 20" fill="currentColor"><path d="M3 4a1 1 0 000 2h14a1 1 0 000-2H3zm-1 4a1 1 0 011-1h14a1 1 0 110 2H3a1 1 0 01-1-1zm1 4a1 1 0 000 2h8a1 1 0 000-2H3z" /></svg>,
  users:        <svg viewBox="0 0 20 20" fill="currentColor"><path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zm8 0a3 3 0 11-6 0 3 3 0 016 0zM6.865 14c.41-1.135 1.53-2 2.635-2h1c1.105 0 2.226.865 2.635 2H6.865zM1 14a5.002 5.002 0 019-3h.001A5 5 0 0119 14v1H1v-1z" /></svg>,
  assign:       <svg viewBox="0 0 20 20" fill="currentColor"><path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" /><path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" /></svg>,
  courses:      <svg viewBox="0 0 20 20" fill="currentColor"><path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4 7.962 7.962 0 009 5.189V4.804z" /></svg>,
  track:        <svg viewBox="0 0 20 20" fill="currentColor"><path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zm6-4a1 1 0 011-1h2a1 1 0 011 1v13a1 1 0 01-1 1h-2a1 1 0 01-1-1V3z" /></svg>,
  reports:      <svg viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm2 10a1 1 0 10-2 0v3a1 1 0 102 0v-3zm2-3a1 1 0 011 1v5a1 1 0 11-2 0v-5a1 1 0 011-1zm4-1a1 1 0 10-2 0v7a1 1 0 102 0V8z" clipRule="evenodd" /></svg>,
  subscription: <svg viewBox="0 0 20 20" fill="currentColor"><path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" /><path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" /></svg>,
  credits:      <svg viewBox="0 0 20 20" fill="currentColor"><path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" /><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" /></svg>,
  support:      <svg viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-2 0c0 .993-.241 1.929-.668 2.754l-1.524-1.525a3.997 3.997 0 00.078-2.183l1.562-1.562C15.802 8.249 16 9.1 16 10zm-5.165 3.913l1.58 1.58A5.98 5.98 0 0110 16a5.976 5.976 0 01-2.516-.552l1.562-1.562a4.006 4.006 0 001.789.027zm-4.677-2.796a4.002 4.002 0 01-.041-2.08l-.08.08-1.53-1.533A5.98 5.98 0 004 10c0 .954.223 1.856.619 2.657l1.54-1.54zm1.088-6.45A5.974 5.974 0 0110 4c.954 0 1.856.223 2.657.619l-1.54 1.54a4.002 4.002 0 00-2.346.033L7.246 4.668z" clipRule="evenodd" /></svg>,
  logout:       <svg viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" /></svg>,
  bell:         <svg viewBox="0 0 20 20" fill="currentColor"><path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zm0 16a2 2 0 01-2-2h4a2 2 0 01-2 2z" /></svg>,
  help:         <svg viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" /></svg>,
  chevronDown:  <svg viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>,
};

function NavItem({ icon, label, active, onClick }) {
  return (
    <button className={`${s.navItem} ${active ? s.navItemActive : ''}`} onClick={onClick}>
      <span className={s.navIcon}>{icon}</span>
      {label}
    </button>
  );
}

const ISSUE_TYPES = ['Technical Issue', 'Billing', 'Course Access', 'Zoom Integration', 'Other'];
const PRIORITIES  = ['Low', 'Normal', 'High', 'Urgent'];

const TICKETS = [
  {
    id: '#TKT-042',
    category: 'Video',
    title: 'Not Loading In Ch.2',
    status: 'In progress',
    statusClass: 'statusInProgress',
    progress: 40,
    progressColor: '#f59e0b',
    score: '03/06',
    meta: 'Raised 2 Apr · Technical Issue · Response in 24hrs',
  },
  {
    id: '#TKT-039',
    category: 'Credit',
    title: 'Not Reflecting After Payment',
    status: 'Resolved',
    statusClass: 'statusResolved',
    progress: 100,
    progressColor: '#0b7b7b',
    score: '06/06',
    meta: 'Raised 25 Mar · Billing · Closed 29 Mar',
  },
  {
    id: '#TKT-048',
    category: 'Zoom Link',
    title: 'Not Sent To Learners',
    status: 'open',
    statusClass: 'statusOpen',
    progress: 20,
    progressColor: '#ef4444',
    score: '03/06',
    meta: 'Raised Today · Zoom Integration · Awaiting response',
  },
];

export default function SupportPage() {
  const user     = useSelector(selectUser);
  const dispatch = useDispatch();
  const router   = useRouter();

  const userName = user?.name || user?.email || 'Store Owner';
  const initials = userName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  const [form, setForm] = useState({
    issueType: '',
    subject: '',
    description: '',
    priority: 'Normal',
  });
  const [submitted, setSubmitted] = useState(false);

  function set(key) {
    return e => setForm(f => ({ ...f, [key]: e.target.value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
    setForm({ issueType: '', subject: '', description: '', priority: 'Normal' });
  }

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
          <NavItem icon={Icon.dashboard} label="Dashboard"    onClick={() => router.push('/storeowner/dashboard')} />
          <NavItem icon={Icon.store}     label="Store Profile" onClick={() => router.push('/storeowner/profile')} />
        </div>

        <div className={s.sidebarSection}>
          <div className={s.sidebarLabel}>Learners</div>
          <NavItem icon={Icon.users}  label="User Management" onClick={() => router.push('/storeowner/users')} />
          <NavItem icon={Icon.assign} label="Assign Courses"  onClick={() => router.push('/storeowner/assign-courses')} />
        </div>

        <div className={s.sidebarSection}>
          <div className={s.sidebarLabel}>Content</div>
          <NavItem icon={Icon.courses} label="My Courses" onClick={() => router.push('/storeowner/my-courses')} />
        </div>

        <div className={s.sidebarSection}>
          <div className={s.sidebarLabel}>Analytics</div>
          <NavItem icon={Icon.track}   label="Track & Analysis" onClick={() => router.push('/storeowner/track-analysis')} />
          <NavItem icon={Icon.reports} label="Reports" onClick={() => router.push('/storeowner/reports')} />
        </div>

        <div className={s.sidebarSection}>
          <div className={s.sidebarLabel}>Account</div>
          <NavItem icon={Icon.subscription} label="Subscription" onClick={() => router.push('/storeowner/subscription')} />
          <NavItem icon={Icon.credits}      label="Credits"      onClick={() => router.push('/storeowner/credits')} />
          <NavItem icon={Icon.support}      label="Support" active onClick={() => router.push('/storeowner/support')} />
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
            Store Owner / <strong>Support</strong>
          </div>
          <div className={s.topbarActions}>
            <button className={s.btnAddLearner} onClick={() => router.push('/storeowner/add-learner')}>
              + Add Learner
            </button>
            <button className={s.iconBtn} title="Help">{Icon.help}</button>
            <button className={s.iconBtn} title="Notifications">{Icon.bell}</button>
            <button className={s.avatarBtn} title={userName}>{initials}</button>
          </div>
        </header>

        {/* Content */}
        <div className={s.content}>
          <div className={s.twoCol}>

            {/* ── Left: Raise a Ticket ── */}
            <div className={s.card}>
              <h2 className={s.cardTitle}>Raise A Ticket</h2>

              {submitted && (
                <div className={s.successBanner}>✓ Ticket submitted successfully!</div>
              )}

              <form onSubmit={handleSubmit}>
                {/* Issue Type */}
                <div className={s.fieldGroup}>
                  <label className={s.label}>Issue Type</label>
                  <div className={s.selectWrap}>
                    <select className={s.select} value={form.issueType} onChange={set('issueType')} required>
                      <option value="" disabled>Select Industry Name…</option>
                      {ISSUE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                    <span className={s.chevron}>{Icon.chevronDown}</span>
                  </div>
                </div>

                {/* Subject */}
                <div className={s.fieldGroup}>
                  <label className={s.label}>Subject</label>
                  <input
                    className={s.input}
                    placeholder="Brief description of the…"
                    value={form.subject}
                    onChange={set('subject')}
                    required
                  />
                </div>

                {/* Description */}
                <div className={s.fieldGroup}>
                  <label className={s.label}>Description</label>
                  <textarea
                    className={s.textarea}
                    placeholder="Describe your issue in details…"
                    value={form.description}
                    onChange={set('description')}
                    rows={4}
                    required
                  />
                </div>

                {/* Priority */}
                <div className={s.fieldGroup}>
                  <label className={s.label}>Priority</label>
                  <div className={s.selectWrap}>
                    <select className={s.select} value={form.priority} onChange={set('priority')}>
                      {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                    <span className={s.chevron}>{Icon.chevronDown}</span>
                  </div>
                </div>

                <button type="submit" className={s.btnSubmit}>Assign Course</button>
              </form>
            </div>

            {/* ── Right: Ticket list ── */}
            <div className={s.card}>
              <h2 className={s.cardTitle}>Video completion tracking</h2>

              {/* Course selector */}
              <div className={s.selectWrap} style={{ marginBottom: 20 }}>
                <select className={s.select} defaultValue="">
                  <option value="" disabled>Select Course</option>
                </select>
                <span className={s.chevron}>{Icon.chevronDown}</span>
              </div>

              {/* Ticket cards */}
              <div className={s.ticketList}>
                {TICKETS.map(ticket => (
                  <div key={ticket.id} className={s.ticketCard}>
                    <div className={s.ticketTopRow}>
                      <div className={s.ticketIdGroup}>
                        <span className={s.ticketId}>{ticket.id}</span>
                        <span className={s.ticketDot}>·</span>
                        <span className={s.ticketCategory}>{ticket.category}</span>
                      </div>
                      <span className={`${s.statusBadge} ${s[ticket.statusClass]}`}>{ticket.status}</span>
                    </div>
                    <div className={s.ticketTitle}>{ticket.title}</div>
                    <div className={s.ticketProgressRow}>
                      <div className={s.ticketTrack}>
                        <div
                          className={s.ticketFill}
                          style={{ width: `${ticket.progress}%`, background: ticket.progressColor }}
                        />
                      </div>
                      <span className={s.ticketScore}>{ticket.score}</span>
                    </div>
                    <div className={s.ticketMeta}>{ticket.meta}</div>
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
