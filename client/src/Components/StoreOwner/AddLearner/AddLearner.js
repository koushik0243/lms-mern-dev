'use client';

import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import { selectUser, clearAuth } from '../../../redux/slices/authSlice';
import apiServiceHandler from '../../../service/apiService';
import { toast } from 'sonner';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import s from './AddLearner.module.css';

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
  arrowLeft:    <svg viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" /></svg>,
  arrowRight:   <svg viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" /></svg>,
  credit:       <svg viewBox="0 0 20 20" fill="currentColor"><path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" /><path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" /></svg>,
  check:        <svg viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>,
  whatsapp:     <svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>,
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

const STEPS = [
  { num: '01', label: 'Learner Details' },
  { num: '02', label: 'Assign Courses' },
  { num: '03', label: 'Notification & Confirm' },
];

const DEPARTMENTS = ['Engineering', 'Marketing', 'Sales', 'HR', 'Finance', 'Operations', 'Design'];
const LANGUAGES   = ['English', 'Hindi'];

const EMPTY_FORM = {
  firstName: '', lastName: '',
  email: '', whatsapp: '',
  employeeId: '', department: '',
  designation: '', language: '', accessStartDate: '',
  tempPassword: '', accountStatus: 'active',
};



export default function AddLearnerPage() {
  const user = useSelector(selectUser);
  const dispatch = useDispatch();
  const router = useRouter();

  const userName = user?.name || user?.email || 'Store Owner';
  const initials = userName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  const [activeStep, setActiveStep] = useState(0);
  const [form, setForm] = useState(EMPTY_FORM);
  const [courses, setCourses] = useState([]);
  const [coursesLoading, setCoursesLoading] = useState(false);
  const [selectedCourseIds, setSelectedCourseIds] = useState(new Set());
  const [saving, setSaving] = useState(false);
  const [notifyVia, setNotifyVia] = useState('whatsapp');
  const [notifyPrefs, setNotifyPrefs] = useState({ whatsapp: true, email: true, alert: true, digest: false });
  const [orgCredit, setOrgCredit] = useState(null);
  const [orgEmpCount, setOrgEmpCount] = useState(null);
  const [usedCredits, setUsedCredits] = useState(0);
  const [resolvedOrgId, setResolvedOrgId] = useState(null);

  const userId = user?._id ? String(user._id) : null;

  // Decode JWT from localStorage — fallback for page-refresh when Redux is empty
  function getTokenUserId() {
    if (typeof window === 'undefined') return null;
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) return null;
      const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
      return payload._id || null;
    } catch { return null; }
  }

  useEffect(() => {
    const effectiveUserId = userId || getTokenUserId();
    if (!effectiveUserId) return;

    // orgId may already be on the user record (users.orgId = organizations._id)
    const reduxOrgId = user?.orgId ? String(user.orgId?._id ?? user.orgId) : null;

    const loadCourses = (orgId) => {
      setCoursesLoading(true);
      apiServiceHandler('GET', `organization-course/list?orgId=${orgId}&status=active`)
        .then(res => {
          const list = Array.isArray(res?.data) ? res.data : [];
          setCourses(list.map(item => ({
            id: item.courseId?._id || String(item.courseId),
            name: item.courseId?.title || 'Untitled',
            meta: '',
          })));
        })
        .catch(() => setCourses([]))
        .finally(() => setCoursesLoading(false));

      // Snapshot data in parallel
      Promise.all([
        apiServiceHandler('GET', `organization-credit-assignment/list?orgId=${orgId}`),
        apiServiceHandler('GET', `user/admin/list?orgId=${orgId}&user_type=employee&orgRole=employee`),
        apiServiceHandler('GET', `organization-course-assignment/list?orgId=${orgId}`),
      ]).then(([creditRes, learnersRes, usageRes]) => {
        const credits = Array.isArray(creditRes?.data) ? creditRes.data : [];
        if (credits.length > 0) setOrgCredit(credits[0]);
        const learners = Array.isArray(learnersRes?.data) ? learnersRes.data : [];
        setOrgEmpCount(learners.length);
        const usageList = Array.isArray(usageRes?.data) ? usageRes.data : [];
        setUsedCredits(usageList.length);
      }).catch(() => {});
    };

    if (reduxOrgId) {
      // Fast path: orgId already on user record
      setResolvedOrgId(reduxOrgId);
      loadCourses(reduxOrgId);
    } else {
      // Fallback: look up org where ownerId = user._id
      apiServiceHandler('GET', `organization/list?ownerId=${effectiveUserId}`)
        .then(orgRes => {
          const orgs = Array.isArray(orgRes?.data) ? orgRes.data : [];
          const orgId = orgs[0] ? String(orgs[0]._id) : null;
          if (!orgId) return;
          setResolvedOrgId(orgId);
          loadCourses(orgId);
        })
        .catch(() => setCoursesLoading(false));
    }
  }, [userId]);

  function handleLogout() {
    dispatch(clearAuth());
    if (typeof window !== 'undefined') {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('BHARAT_TOKEN');
    }
    router.replace('/login');
  }

  function set(field) {
    return (e) => setForm(prev => ({ ...prev, [field]: e.target.value }));
  }

  async function handleSave() {
    if (saving) return;
    setSaving(true);
    try {
      // Step 1 — create user (employee)
      const createRes = await apiServiceHandler('POST', 'user/admin/create', {
        name: `${form.firstName} ${form.lastName}`.trim() || form.firstName,
        email: form.email,
        password: form.tempPassword,
        phone: form.whatsapp,
        whatsapp_no: form.whatsapp,
        emp_id: form.employeeId,
        department: form.department,
        designation: form.designation,
        course_language: form.language,
        access_start: form.accessStartDate || null,
        status: form.accountStatus,
        user_type: 'employee',
        orgRole: 'employee',
        orgId: resolvedOrgId,
      });

      const newUserId = createRes?.data?._id || createRes?._id;
      if (!newUserId) throw new Error('User creation failed — no ID returned.');

      // Step 2 — assign each selected course
      const courseAssignments = [...selectedCourseIds].map(courseId =>
        apiServiceHandler('POST', 'course-assignment/create', {
          organizationId: resolvedOrgId,
          userId: newUserId,
          courseId,
        })
      );
      await Promise.all(courseAssignments);

      // Step 3 — save notification preferences
      await apiServiceHandler('PUT', `user/admin/update/${newUserId}`, {
        whatsapp_noti: notifyPrefs.whatsapp,
        email_welcome_noti: notifyPrefs.email,
        course_assign_noti: notifyPrefs.alert,
        weekly_progress_noti: notifyPrefs.digest,
      });

      toast.success('Learner added successfully.');
      router.push('/storeowner/users');
    } catch (err) {
      toast.error(err?.message || 'Failed to save learner. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  function toggleCourse(id) {
    setSelectedCourseIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  const selectedCourses = courses.filter(c => selectedCourseIds.has(c.id));

  function stepCircleClass(i) {
    if (i < activeStep) return `${s.stepCircle} ${s.stepCircleCheck}`;
    if (i === activeStep) return `${s.stepCircle} ${s.stepCircleActive}`;
    return s.stepCircle;
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
          <NavItem icon={Icon.users}  label="User Management" active onClick={() => router.push('/storeowner/users')} />
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
            Store Owner / <span className={s.breadcrumbLink} onClick={() => router.push('/storeowner/users')}>User Management</span> / <strong>Add New Learner</strong>
          </div>
          <div className={s.topbarActions}>
            <button type="button" className={s.btnAddLearner}>+ Add Learner</button>
            <button className={s.iconBtn} title="Help">{Icon.help}</button>
            <button className={s.iconBtn} title="Notifications">{Icon.bell}</button>
            <button className={s.avatarBtn} title={userName}>{initials}</button>
          </div>
        </header>

        {/* Content */}
        <div className={s.content}>

          {/* Page heading row */}
          <div className={s.pageHeadRow}>
            <div className={s.pageHeadLeft}>
              <h1 className={s.pageTitle}>Add New Learner</h1>
              <span className={s.planBadge}>Pro plan</span>
            </div>
            <div className={s.pageHeadMeta}>
              <span className={s.metaItem}>
                <span className={s.metaIcon}>{Icon.users}</span>
                Learners <strong>91</strong>
              </span>
              <span className={s.metaDivider} />
              <span className={s.metaItem}>
                <span className={s.metaIcon}>{Icon.credit}</span>
                Credits Remaining <strong>50</strong>
              </span>
            </div>
          </div>

          {/* Stepper */}
          <div className={s.stepper}>
            {STEPS.map((step, i) => (
              <div key={step.num} className={s.stepperItem}>
                <div className={stepCircleClass(i)}>
                  {i < activeStep
                    ? <span style={{ display: 'flex', alignItems: 'center', width: 12, height: 12 }}>{Icon.check}</span>
                    : step.num}
                </div>
                <span className={`${s.stepLabel} ${i === activeStep ? s.stepLabelActive : ''}`}>{step.label}</span>
                {i < STEPS.length - 1 && <div className={s.stepLine} />}
              </div>
            ))}
          </div>

          {/* ── Step 0: Learner Details ── */}
          {activeStep === 0 && (
            <>
              <div className={s.creditsBanner}>
                <strong>Credits Remaining</strong>
                {(() => {
                  const limitTo = orgCredit?.creditId?.limit_to ?? 0;
                  const remaining = limitTo ? limitTo - usedCredits : null;
                  return (
                    <p>
                      {remaining !== null ? `Only ${remaining} credits remaining.` : 'Credits data loading…'}{' '}
                      Each learner added consumes 1 credit. No enrollment beyond available credits.
                    </p>
                  );
                })()}
              </div>

              <div className={s.formCard}>
                <h2 className={s.sectionTitle}>Personal Information</h2>
                <div className={s.formGrid}>
                  <div className={s.fieldGroup}>
                    <label className={s.label}>Name <span className={s.req}>*</span></label>
                    <input className={s.input} placeholder="e.g. Kavita" value={form.firstName} onChange={set('firstName')} />
                  </div>
                  <div className={s.fieldGroup}>
                    <label className={s.label}>Email Address <span className={s.req}>*</span></label>
                    <input className={s.input} placeholder="Enter email address…" value={form.email} onChange={set('email')} type="email" />
                    <div className={s.fieldHint}>Used for login and email notifications</div>
                  </div>
                  <div className={s.fieldGroup}>
                    <label className={s.label}>WhatsApp Number <span className={s.req}>*</span></label>
                    <input className={s.input} placeholder="e.g. +91 98765 43210" value={form.whatsapp} onChange={set('whatsapp')} />
                    <div className={s.fieldHint}>Used for course reminders and alerts</div>
                  </div>
                  <div className={s.fieldGroup}>
                    <label className={s.label}>Employee ID</label>
                    <input className={s.input} placeholder="WK-0123456" value={form.employeeId} onChange={set('employeeId')} />
                  </div>
                  <div className={s.fieldGroup}>
                    <label className={s.label}>Department</label>
                    <div className={s.selectWrapper}>
                      <select className={s.select} value={form.department} onChange={set('department')}>
                        <option value="">Select Department</option>
                        {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                      <span className={s.selectChevron}>{Icon.chevronDown}</span>
                    </div>
                  </div>
                  <div className={s.fieldGroup}>
                    <label className={s.label}>Designation</label>
                    <input className={s.input} placeholder="e.g. Floor Supervisor" value={form.designation} onChange={set('designation')} />
                  </div>
                  <div className={s.fieldGroup}>
                    <label className={s.label}>Language Preference</label>
                    <div className={s.selectWrapper}>
                      <select className={s.select} value={form.language} onChange={set('language')}>
                        <option value="">Select Language</option>
                        {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
                      </select>
                      <span className={s.selectChevron}>{Icon.chevronDown}</span>
                    </div>
                  </div>
                  <div className={s.fieldGroup}>
                    <label className={s.label}>Access Start Date</label>
                    <DatePicker
                      selected={form.accessStartDate ? new Date(form.accessStartDate) : null}
                      onChange={(date) => setForm(prev => ({ ...prev, accessStartDate: date ? date.toISOString().slice(0, 10) : '' }))}
                      dateFormat="dd/MM/yyyy"
                      placeholderText="DD/MM/YYYY"
                      className={s.input}
                      wrapperClassName={s.datePickerWrapper}
                      autoComplete="off"
                    />
                  </div>
                  <div className={s.fieldGroup}>
                    <label className={s.label}>Temporary Password <span className={s.req}>*</span></label>
                    <input className={s.input} type="password" value={form.tempPassword} onChange={set('tempPassword')} />
                    <div className={s.fieldHint}>Learner will be prompted to reset on first login</div>
                  </div>
                  <div className={s.fieldGroup}>
                    <label className={s.label}>Account Status</label>
                    <div className={s.selectWrapper}>
                      <select className={s.select} value={form.accountStatus} onChange={set('accountStatus')}>
                        <option value="active">Active – Can log in Immediately</option>
                        <option value="inactive">Inactive – Cannot log in</option>
                      </select>
                      <span className={s.selectChevron}>{Icon.chevronDown}</span>
                    </div>
                  </div>
                </div>
                <div className={s.assignCourseRow}>
                  <button type="button" className={s.btnAssignCourse} onClick={() => setActiveStep(1)}>
                    Assign Course
                  </button>
                </div>
              </div>
            </>
          )}

          {/* ── Step 1: Assign Courses ── */}
          {activeStep === 1 && (
            <>
              <div className={s.selectCoursesCard}>
                <strong>Select Courses To Assign</strong>
                <p>Courses follow sequential access — learner must complete each video before unlocking the quiz and the next chapter.</p>
              </div>
              <div className={s.courseListCard}>
                <div className={s.courseListTitle}>Available Courses</div>
                {coursesLoading ? (
                  <div style={{ padding: '16px', color: '#888' }}>Loading courses…</div>
                ) : courses.length === 0 ? (
                  <div style={{ padding: '16px', color: '#888' }}>No courses found.</div>
                ) : courses.map(course => {
                  const isSelected = selectedCourseIds.has(course.id);
                  return (
                    <div key={course.id} className={`${s.courseItem} ${isSelected ? s.courseItemSelected : ''}`}
                      onClick={() => toggleCourse(course.id)}>
                      <div className={s.courseItemTop}>
                        <button
                          type="button"
                          className={`${s.courseCircleBtn} ${isSelected ? s.courseCircleBtnSelected : ''}`}
                          onClick={(e) => { e.stopPropagation(); toggleCourse(course.id); }}
                          aria-label={isSelected ? 'Deselect' : 'Select'}
                        >
                          {isSelected && <span className={s.courseCircleCheck} />}
                        </button>
                        <div className={s.courseInfo}>
                          <div className={s.courseName}>{course.name}</div>
                          {course.meta && <div className={s.courseMeta}>{course.meta}</div>}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* ── Step 2: Notification & Confirm ── */}
          {activeStep === 2 && (
            <>
              {/* Select Courses To Assign banner */}
              <div className={s.selectCoursesCard}>
                <strong>Select Courses To Assign</strong>
                <p>Courses follow sequential access — learner must complete each video before unlocking the quiz and the next chapter.</p>
              </div>

              {/* Notification Preferences */}
              <div className={s.formCard} style={{ marginBottom: 16 }}>
                <h2 className={s.sectionTitle}>Notification Preferences</h2>
                <p className={s.notifSubtitle}>Send welcome notification</p>
                {[
                  { key: 'whatsapp', label: 'WhatsApp Welcome Message', desc: 'Send login link and course list via WhatsApp (Interakt)' },
                  { key: 'email',    label: 'Email Welcome Message',    desc: 'Send account credentials and getting started guide' },
                  { key: 'alert',    label: 'Course Assignment Alert',  desc: 'Notify learner of assigned courses with direct links' },
                  { key: 'digest',   label: 'Weekly Progress Digest',   desc: 'Enroll in weekly WhatsApp progress summary' },
                ].map(item => (
                  <div key={item.key} className={s.notifRow}>
                    <div className={s.notifInfo}>
                      <div className={s.notifLabel}>{item.label}</div>
                      <div className={s.notifDesc}>{item.desc}</div>
                    </div>
                    <button
                      type="button"
                      className={`${s.toggleSwitch} ${notifyPrefs[item.key] ? s.toggleSwitchOn : ''}`}
                      onClick={() => setNotifyPrefs(p => ({ ...p, [item.key]: !p[item.key] }))}
                      aria-label={item.label}
                    >
                      <span className={s.toggleThumb} />
                    </button>
                  </div>
                ))}
              </div>

              {/* Two-column: learner preview + store snapshot */}
              <div className={s.confirmCols}>
                {/* Left: Learner preview card */}
                <div className={s.learnerPreviewCard}>
                  <div className={s.learnerAvatar}>
                    <div className={s.learnerAvatarCircle}>
                      {(form.firstName || form.lastName)
                        ? (form.firstName[0] || form.lastName[0]).toUpperCase()
                        : '?'}
                    </div>
                  </div>
                  <div className={s.learnerPreviewName}>
                    {(form.firstName || form.lastName)
                      ? `${form.firstName} ${form.lastName}`.trim()
                      : 'New Learner'}
                  </div>
                  <div className={s.learnerPreviewHint}>Fill in details to preview</div>

                  <div className={s.learnerPreviewFields}>
                    <div className={s.learnerPreviewRow}>
                      <span className={s.lpLabel}>Employee ID</span>
                      <span className={s.lpValue}>{form.employeeId || '–'}</span>
                    </div>
                    <div className={s.learnerPreviewRow}>
                      <span className={s.lpLabel}>Department</span>
                      <span className={s.lpValue}>{form.department || '–'}</span>
                    </div>
                    <div className={s.learnerPreviewRow}>
                      <span className={s.lpLabel}>Language</span>
                      <span className={s.lpValue}>{form.language || '–'}</span>
                    </div>
                    <div className={s.learnerPreviewRow}>
                      <span className={s.lpLabel}>Status</span>
                      <span className={`${s.lpValue} ${s.statusActive}`}>Active</span>
                    </div>
                  </div>

                  <div className={s.learnerPreviewFootnote}>Learner will receive login details after saving</div>
                </div>

                {/* Right: Store snapshot + selected courses */}
                <div className={s.snapshotCol}>
                  <div className={s.snapshotCard}>
                    <h3 className={s.snapshotTitle}>Store Snapshot</h3>
                    {(() => {
                      const limitTo = orgCredit?.creditId?.limit_to ?? 0;
                      const creditsRemaining = limitTo - usedCredits;
                      const afterAdding = creditsRemaining - 1;
                      return (
                        <>
                          <div className={s.snapshotRow}><span className={s.snapshotKey}>Plan</span><span className={s.snapshotVal}>{orgCredit?.creditId?.title || '–'}</span></div>
                          <div className={s.snapshotRow}><span className={s.snapshotKey}>Total learners</span><span className={s.snapshotVal}>{orgEmpCount != null ? orgEmpCount : '–'}</span></div>
                          <div className={s.snapshotRow}><span className={s.snapshotKey}>Credits remaining</span><span className={s.snapshotVal}>{limitTo ? creditsRemaining : '–'}</span></div>
                          <div className={s.snapshotRow}><span className={s.snapshotKey}>Credit cost</span><span className={s.snapshotVal}>1 Per Learner</span></div>
                          <div className={s.snapshotRow}><span className={s.snapshotKey}>After adding</span><span className={s.snapshotValAccent}>{limitTo ? `${afterAdding} Remaining` : '–'}</span></div>
                          <div className={s.snapshotRow}><span className={s.snapshotKey}>Credits used</span><span className={s.snapshotVal}>{usedCredits}</span></div>
                        </>
                      );
                    })()}
                  </div>

                  <div className={s.snapshotCard} style={{ marginTop: 12 }}>
                    <h3 className={s.snapshotTitle}>Selected Courses</h3>
                    {selectedCourses.length > 0
                      ? selectedCourses.map(c => (
                        <div key={c.id} className={s.selectedCourseRow}>
                          <span className={s.selectedCourseName}>{c.name}</span>
                          <span className={s.selectedBadge}>Selected</span>
                        </div>
                      ))
                      : <div className={s.noCoursesHint}>No courses selected</div>}
                    <div className={s.totalSelectedRow}>
                      <span className={s.totalSelectedLabel}>Total Selected</span>
                      <span className={s.totalSelectedVal}>{selectedCourses.length} Course{selectedCourses.length !== 1 ? 's' : ''}</span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

        </div>

        {/* Footer nav */}
        <div className={s.footer}>
          {activeStep === 0 ? (
            <button className={s.btnCancel} onClick={() => router.push('/storeowner/users')}>
              <span className={s.footerArrow}>{Icon.arrowLeft}</span>
              Cancel
            </button>
          ) : (
            <button className={s.btnCancel} onClick={() => setActiveStep(activeStep - 1)}>
              <span className={s.footerArrow}>{Icon.arrowLeft}</span>
              Back
            </button>
          )}
          {activeStep === 0 && (
            <button className={s.btnNext} onClick={() => setActiveStep(1)}>
              Next: Assign Courses
              <span className={s.footerArrow}>{Icon.arrowRight}</span>
            </button>
          )}
          {activeStep === 1 && (
            <button className={s.btnNext} onClick={() => setActiveStep(2)}>
              Next: Confirm &amp; Notify
              <span className={s.footerArrow}>{Icon.arrowRight}</span>
            </button>
          )}
          {activeStep === 2 && (
            <div className={s.footerRightGroup}>
              <button className={s.btnDiscard} onClick={() => { setForm(EMPTY_FORM); setSelectedCourseIds(new Set()); setActiveStep(0); }}>
                Discard
              </button>
              <button className={s.btnNext} onClick={handleSave} disabled={saving}>
                {saving ? 'Saving…' : 'Save & Add Learner'}
                {!saving && <span className={s.footerArrow}>{Icon.arrowRight}</span>}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
