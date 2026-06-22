'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { selectUser, clearAuth } from '../../../redux/slices/authSlice';
import apiServiceHandler from '../../../service/apiService';
import s from './AssignCourses.module.css';

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
  trash:        <svg viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>,
  whatsapp:     <svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.118 1.528 5.845L.057 23.428a.5.5 0 00.515.572l5.701-1.494A11.95 11.95 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.885 0-3.65-.52-5.163-1.427l-.37-.22-3.385.887.903-3.296-.241-.381A9.96 9.96 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/></svg>,
  email:        <svg viewBox="0 0 20 20" fill="currentColor"><path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" /><path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" /></svg>,
};

function NavItem({ icon, label, active, onClick }) {
  return (
    <button className={`${s.navItem} ${active ? s.navItemActive : ''}`} onClick={onClick}>
      <span className={s.navIcon}>{icon}</span>
      {label}
    </button>
  );
}

export default function AssignCoursesPage() {
  const user = useSelector(selectUser);
  const dispatch = useDispatch();
  const router = useRouter();

  const userName = user?.name || user?.email || 'Store Owner';
  const initials = userName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  const [learners,        setLearners]        = useState([]);
  const [courses,         setCourses]         = useState([]);
  const [assignments,     setAssignments]     = useState([]);
  const [selectedUserId,  setSelectedUserId]  = useState('');
  const [selectedCourseId,setSelectedCourseId]= useState('');
  const [loading,         setLoading]         = useState(true);
  const [saving,          setSaving]          = useState(false);
  const [orgId,           setOrgId]           = useState(null);
  const [confirmId,       setConfirmId]       = useState(null); // assignment _id pending delete

  function getTokenUserId() {
    if (typeof window === 'undefined') return null;
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) return null;
      const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
      return payload._id || null;
    } catch { return null; }
  }

  const loadAssignments = useCallback(async (effectiveOrgId) => {
    const res = await apiServiceHandler('GET', `course-assignment/list?organizationId=${effectiveOrgId}`);
    const list = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
    setAssignments(list);
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
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
      if (!effectiveOrgId) { setLoading(false); return; }
      setOrgId(effectiveOrgId);

      const [learnersRes, coursesRes] = await Promise.all([
        apiServiceHandler('GET', `user/admin/list?orgId=${effectiveOrgId}&user_type=employee&orgRole=employee`),
        apiServiceHandler('GET', `organization-course/list?orgId=${effectiveOrgId}&status=active`),
      ]);

      const learnList = Array.isArray(learnersRes?.data) ? learnersRes.data
                      : Array.isArray(learnersRes) ? learnersRes : [];
      setLearners(learnList);

      const courseList = Array.isArray(coursesRes?.data) ? coursesRes.data
                       : Array.isArray(coursesRes) ? coursesRes : [];
      setCourses(courseList);

      await loadAssignments(effectiveOrgId);
    } catch {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [user?._id, user?.orgId, loadAssignments]);

  useEffect(() => { loadData(); }, [loadData]);

  async function handleAssign() {
    if (!selectedUserId)   { toast.error('Please select a learner'); return; }
    if (!selectedCourseId) { toast.error('Please select a course');  return; }

    // Duplicate check — same learner + same course already in assignments list
    const alreadyAssigned = assignments.some(a => {
      const uid = String(a.userId?._id || a.userId);
      const cid = String(a.courseId?._id || a.courseId);
      return uid === selectedUserId && cid === selectedCourseId;
    });
    if (alreadyAssigned) {
      const learnerName  = learners.find(l => l._id === selectedUserId)?.name || 'This learner';
      const courseTitle  = courses.find(c => String(c.courseId?._id || c.courseId) === selectedCourseId)?.courseId?.title || 'this course';
      toast.error(`${learnerName} is already assigned to "${courseTitle}"`);
      return;
    }

    setSaving(true);
    try {
      await apiServiceHandler('POST', 'course-assignment/create', {
        organizationId: orgId,
        userId:         selectedUserId,
        courseId:       selectedCourseId,
      });
      toast.success('Course assigned — email notification sent');
      setSelectedUserId('');
      setSelectedCourseId('');
      await loadAssignments(orgId);
    } catch {
      toast.error('Failed to assign course');
    } finally {
      setSaving(false);
    }
  }

  async function handleRemove(assignmentId) {
    setConfirmId(null);
    try {
      await apiServiceHandler('GET', `course-assignment/delete/${assignmentId}`);
      setAssignments(prev => prev.filter(a => a._id !== assignmentId));
      toast.success('Assignment removed');
    } catch {
      toast.error('Failed to remove assignment');
    }
  }

  function formatDate(dateStr) {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
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
          <NavItem icon={Icon.assign} label="Assign Courses"  active onClick={() => router.push('/storeowner/assign-courses')} />
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
          <NavItem icon={Icon.credits}      label="Credits" onClick={() => router.push('/storeowner/credits')} />
          <NavItem icon={Icon.support}      label="Support" onClick={() => router.push('/storeowner/support')} />
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
            Store Owner / <strong>Assign Courses</strong>
          </div>
          <div className={s.topbarActions}>
            <button type="button" className={s.btnAddLearner} onClick={() => router.push('/storeowner/add-learner')}>
              + Add Learner
            </button>
            <button className={s.iconBtn} title="Help">{Icon.help}</button>
            <button className={s.iconBtn} title="Notifications">{Icon.bell}</button>
            <button className={s.avatarBtn} title={userName}>{initials}</button>
          </div>
        </header>

        {/* Content */}
        <div className={s.content}>

          {/* ── Assign form card ── */}
          <div className={s.formCard}>
            <h2 className={s.pageTitle}>Assign Courses To Learners</h2>

            <div className={s.formRow}>
              {/* Assignee */}
              <div className={s.formGroup}>
                <label className={s.formLabel}>Assignee</label>
                <div className={s.selectWrapper}>
                  <select
                    className={s.formSelect}
                    value={selectedUserId}
                    onChange={e => setSelectedUserId(e.target.value)}
                    disabled={loading}
                  >
                    <option value="">
                      {loading ? 'Loading learners…' : learners.length === 0 ? 'No learners found' : 'Select Learner'}
                    </option>
                    {learners.map(l => (
                      <option key={l._id} value={l._id}>
                        {l.name || l.email}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Select Course */}
              <div className={s.formGroup}>
                <label className={s.formLabel}>Select Course</label>
                <div className={s.selectWrapper}>
                  <select
                    className={s.formSelect}
                    value={selectedCourseId}
                    onChange={e => setSelectedCourseId(e.target.value)}
                    disabled={loading}
                  >
                    <option value="">
                      {loading ? 'Loading courses…' : courses.length === 0 ? 'No courses available' : 'Select Course'}
                    </option>
                    {courses.map(c => (
                      <option key={c._id} value={c.courseId?._id || c.courseId}>
                        {c.courseId?.title || c.courseId}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Notify */}
              <div className={s.formGroup}>
                <label className={s.formLabel}>Notify Learners Via</label>
                <div className={s.notifyToggle}>
                  <button
                    className={s.notifyOption}
                    type="button"
                    disabled
                  >
                    <span className={s.notifyIcon}>{Icon.whatsapp}</span>
                    WhatsApp
                  </button>
                  <button
                    className={`${s.notifyOption} ${s.notifyOptionActive}`}
                    type="button"
                    disabled
                  >
                    <span className={s.notifyIcon}>{Icon.email}</span>
                    Email
                  </button>
                </div>
              </div>
            </div>

            {/* Assign button */}
            <div className={s.assignBtnWrap}>
              <button
                className={s.btnAssign}
                onClick={handleAssign}
                disabled={saving || loading}
              >
                {saving ? 'Assigning…' : 'Assign Course'}
              </button>
            </div>
          </div>

          {/* ── Current Assignments ── */}
          <div className={s.tableCard}>
            <h3 className={s.sectionTitle}>Current Assignments</h3>
            <table className={s.table}>
              <thead>
                <tr>
                  <th className={s.th}>Learner</th>
                  <th className={s.th}>Course</th>
                  <th className={s.th}>Assigned Date</th>
                  <th className={s.th}></th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <tr key={i} className={s.tr}>
                      <td className={s.td} colSpan={4}><div className={s.skeletonRow} /></td>
                    </tr>
                  ))
                ) : assignments.length === 0 ? (
                  <tr className={s.tr}>
                    <td className={s.td} colSpan={4} style={{ textAlign: 'center', color: '#9aadad', padding: '24px 0' }}>
                      No assignments yet
                    </td>
                  </tr>
                ) : assignments.map((a, i) => (
                  <tr key={a._id} className={i % 2 === 1 ? s.trAlt : s.tr}>
                    <td className={s.td}>{a.userId?.name || a.userId?.email || '—'}</td>
                    <td className={s.td}>{a.courseId?.title || '—'}</td>
                    <td className={s.td}>{formatDate(a.attemptedAt || a.createdAt)}</td>
                    <td className={s.tdAction}>
                      <button className={s.trashBtn} title="Remove assignment" onClick={() => setConfirmId(a._id)}>
                        {Icon.trash}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      </div>

      {/* ── Confirm delete dialog ── */}
      {confirmId && (() => {
        const a = assignments.find(x => x._id === confirmId);
        return (
          <div className={s.modalOverlay} onClick={() => setConfirmId(null)}>
            <div className={s.modalBox} onClick={e => e.stopPropagation()}>
              <div className={s.modalTitle}>Remove Assignment</div>
              <p className={s.modalBody}>
                Remove <strong>{a?.courseId?.title || 'this course'}</strong> from{' '}
                <strong>{a?.userId?.name || a?.userId?.email || 'this learner'}</strong>?
                <br/>This action cannot be undone.
              </p>
              <div className={s.modalActions}>
                <button className={s.modalBtnCancel} onClick={() => setConfirmId(null)}>Cancel</button>
                <button className={s.modalBtnDelete} onClick={() => handleRemove(confirmId)}>Remove</button>
              </div>
            </div>
          </div>
        );
      })()}

    </div>
  );
}
