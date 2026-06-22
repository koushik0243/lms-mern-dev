'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useRouter, useParams } from 'next/navigation';
import { selectUser, clearAuth } from '../../../redux/slices/authSlice';
import apiServiceHandler from '../../../service/apiService';
import s from './LearnerDetail.module.css';

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
  back:         <svg viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" /></svg>,
  email:        <svg viewBox="0 0 20 20" fill="currentColor"><path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" /><path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" /></svg>,
  phone:        <svg viewBox="0 0 20 20" fill="currentColor"><path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" /></svg>,
  location:     <svg viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" /></svg>,
  calendar:     <svg viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" /></svg>,
  user:         <svg viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>,
  verified:     <svg viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>,
};

function NavItem({ icon, label, active, onClick }) {
  return (
    <button className={`${s.navItem} ${active ? s.navItemActive : ''}`} onClick={onClick}>
      <span className={s.navIcon}>{icon}</span>
      {label}
    </button>
  );
}

function Field({ label, value, icon }) {
  return (
    <div className={s.field}>
      <div className={s.fieldLabelRow}>
        {icon && <span className={s.fieldIcon}>{icon}</span>}
        <div className={s.fieldLabel}>{label}</div>
      </div>
      <div className={s.fieldValue}>{value || <span className={s.fieldEmpty}>—</span>}</div>
    </div>
  );
}

export default function LearnerDetailPage() {
  const { id } = useParams();
  const user = useSelector(selectUser);
  const dispatch = useDispatch();
  const router = useRouter();

  const userName = user?.name || user?.email || 'Store Owner';
  const initials = userName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  const [learner, setLearner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [assignedCourses, setAssignedCourses] = useState([]);

  const loadLearner = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [res, caRes] = await Promise.all([
        apiServiceHandler('GET', `user/admin/edit/${id}`),
        apiServiceHandler('GET', `course-assignment/list?userId=${id}`),
      ]);
      const data = res?.data ?? res;
      if (!data || !data._id) { setNotFound(true); }
      else { setLearner(data); }
      const caList = Array.isArray(caRes?.data) ? caRes.data : (Array.isArray(caRes) ? caRes : []);
      setAssignedCourses(caList);
    } catch {
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { loadLearner(); }, [loadLearner]);

  function handleLogout() {
    dispatch(clearAuth());
    if (typeof window !== 'undefined') {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('BHARAT_TOKEN');
    }
    router.replace('/login');
  }

  function getInitials(name) {
    if (!name) return '?';
    return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  }

  function formatDate(dateStr) {
    if (!dateStr) return null;
    return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  const statusColor = {
    active: s.statusActive,
    inactive: s.statusInactive,
    suspended: s.statusSuspended,
    deactivated: s.statusSuspended,
  };

  return (
    <div className={s.shell}>
      {/* ── Sidebar ── */}
      <aside className={s.sidebar}>
        <div className={s.sidebarLogo}><span className={s.logoD}>sikhø</span><span className={s.logoA}>aur</span><span className={s.logoD}>badhø</span></div>

        <div className={s.sidebarSection}>
          <div className={s.sidebarLabel}>Overview</div>
          <NavItem icon={Icon.dashboard} label="Dashboard" onClick={() => router.push('/storeowner/dashboard')} />
          <NavItem icon={Icon.store} label="Store Profile" onClick={() => router.push('/storeowner/profile')} />
        </div>

        <div className={s.sidebarSection}>
          <div className={s.sidebarLabel}>Learners</div>
          <NavItem icon={Icon.users} label="User Management" active onClick={() => router.push('/storeowner/users')} />
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
            <button className={s.backBtn} onClick={() => router.push('/storeowner/users')}>
              {Icon.back}
            </button>
            Store Owner / <span onClick={() => router.push('/storeowner/users')} className={s.breadcrumbLink}>User Management</span> / <strong>{loading ? '…' : (learner?.name || 'Learner')}</strong>
          </div>
          <div className={s.topbarActions}>
            <button type="button" className={s.btnAddLearner} onClick={() => router.push('/storeowner/add-learner')}>+ Add Learner</button>
            <button className={s.iconBtn} title="Help">{Icon.help}</button>
            <button className={s.iconBtn} title="Notifications">{Icon.bell}</button>
            <button className={s.avatarBtn} title={userName}>{initials}</button>
          </div>
        </header>

        {/* Content */}
        <div className={s.content}>
          {loading ? (
            <div className={s.skeletonWrap}>
              <div className={s.skeletonAvatar} />
              <div className={s.skeletonLines}>
                <div className={s.skeletonLine} style={{ width: '30%' }} />
                <div className={s.skeletonLine} style={{ width: '20%' }} />
              </div>
              <div className={s.skeletonGrid}>
                {Array.from({ length: 8 }).map((_, i) => <div key={i} className={s.skeletonCard} />)}
              </div>
            </div>
          ) : notFound ? (
            <div className={s.notFound}>
              <div className={s.notFoundTitle}>Learner not found</div>
              <button className={s.btnBack} onClick={() => router.push('/storeowner/users')}>← Back to User Management</button>
            </div>
          ) : (
            <>
              {/* ── Profile header ── */}
              <div className={s.profileHeader}>
                <div className={s.profileAvatarLg}>{getInitials(learner.name)}</div>
                <div className={s.profileHeaderInfo}>
                  <div className={s.profileName}>{learner.name || '—'}</div>
                  <div className={s.profileMeta}>
                    <span className={`${s.statusBadge} ${statusColor[learner.status] || s.statusActive}`}>
                      {learner.status || 'active'}
                    </span>
                    {learner.isVerified && (
                      <span className={s.verifiedBadge}>{Icon.verified} Verified</span>
                    )}
                  </div>
                  <div className={s.profileContactRow}>
                    {learner.email && <span className={s.contactItem}>{Icon.email}{learner.email}</span>}
                    {learner.phone && <span className={s.contactItem}>{Icon.phone}{learner.phone}</span>}
                  </div>
                </div>
              </div>

              {/* ── Detail cards grid ── */}
              <div className={s.cardsGrid}>

                {/* Personal Information */}
                <div className={s.card}>
                  <div className={s.cardTitle}>Personal Information</div>
                  <div className={s.fieldGrid}>
                    <Field label="Full Name"     value={learner.name}   icon={Icon.user} />
                    <Field label="Email"         value={learner.email}  icon={Icon.email} />
                    <Field label="Phone"         value={learner.phone}  icon={Icon.phone} />
                    <Field label="Alt Phone"     value={learner.alt_phone} icon={Icon.phone} />
                    <Field label="Date of Birth" value={formatDate(learner.dob)} icon={Icon.calendar} />
                    <Field label="Gender"        value={learner.gender} icon={Icon.user} />
                  </div>
                  {learner.bio && (
                    <div className={s.bioWrap}>
                      <div className={s.fieldLabel}>Bio</div>
                      <div className={s.bioText}>{learner.bio}</div>
                    </div>
                  )}
                </div>

                {/* Employment Details */}
                <div className={s.card}>
                  <div className={s.cardTitle}>Employment Details</div>
                  <div className={s.fieldGrid}>
                    <Field label="Employee ID"     value={learner.emp_id}          icon={Icon.user} />
                    <Field label="Department"      value={learner.department}      icon={Icon.user} />
                    <Field label="Designation"     value={learner.designation}     icon={Icon.user} />
                    <Field label="WhatsApp No."    value={learner.whatsapp_no}     icon={Icon.phone} />
                    <Field label="Course Language" value={learner.course_language} icon={Icon.courses} />
                    <Field label="Access Start"    value={formatDate(learner.access_start)} icon={Icon.calendar} />
                    <Field label="Account Status"  value={learner.status}          icon={Icon.verified} />
                  </div>
                </div>

                {/* Assigned Courses */}
                <div className={`${s.card} ${s.cardFull}`}>
                  <div className={s.cardTitle}>Assigned Courses</div>
                  {assignedCourses.length === 0 ? (
                    <div className={s.fieldEmpty}>No courses assigned yet</div>
                  ) : (
                    <div className={s.courseList}>
                      {assignedCourses.map(a => (
                        <span key={a._id} className={s.courseTag}>
                          {a.courseId?.title || '—'}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Notification Preferences */}
                <div className={s.card}>
                  <div className={s.cardTitle}>Notification Preferences</div>
                  <div className={s.notiList}>
                    <div className={s.notiRow}>
                      <span className={s.notiLabel}>WhatsApp Notifications</span>
                      <span className={learner.whatsapp_noti ? s.notiBadgeOn : s.notiBadgeOff}>
                        {learner.whatsapp_noti ? 'On' : 'Off'}
                      </span>
                    </div>
                    <div className={s.notiRow}>
                      <span className={s.notiLabel}>Welcome Email</span>
                      <span className={learner.email_welcome_noti ? s.notiBadgeOn : s.notiBadgeOff}>
                        {learner.email_welcome_noti ? 'On' : 'Off'}
                      </span>
                    </div>
                    <div className={s.notiRow}>
                      <span className={s.notiLabel}>Course Assignment Alerts</span>
                      <span className={learner.course_assign_noti ? s.notiBadgeOn : s.notiBadgeOff}>
                        {learner.course_assign_noti ? 'On' : 'Off'}
                      </span>
                    </div>
                    <div className={s.notiRow}>
                      <span className={s.notiLabel}>Weekly Progress Digest</span>
                      <span className={learner.weekly_progress_noti ? s.notiBadgeOn : s.notiBadgeOff}>
                        {learner.weekly_progress_noti ? 'On' : 'Off'}
                      </span>
                    </div>
                  </div>
                </div>

              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
