'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import { selectUser, clearAuth } from '../../../redux/slices/authSlice';
import apiServiceHandler from '../../../service/apiService';
import s from './StoreProfile.module.css';

// ── SVG Icons (subset shared with dashboard) ────────────────────
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
  bell: <svg viewBox="0 0 20 20" fill="currentColor"><path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zm0 16a2 2 0 01-2-2h4a2 2 0 01-2 2z" /></svg>,
  help: <svg viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" /></svg>,
};

function NavItem({ icon, label, active, onClick }) {
  return (
    <button className={`${s.navItem} ${active ? s.navItemActive : ''}`} onClick={onClick}>
      <span className={s.navIcon}>{icon}</span>
      {label}
    </button>
  );
}

const EMPTY_ORG = {
  org_name: '', org_email: '', org_phone: '', org_whatsapp: '',
  org_address1: '', org_city: '', org_state: '', org_zipcode: '',
  org_desc: '', org_website: '', org_address2: '', org_country: '',
  hr_manager_email: '', hr_manager_no: '', industry: '', emp_count: '',
};

const EMPTY_PERSONAL = {
  // Basic
  name: '', email: '', phone: '', alt_phone: '', dob: '', gender: '', bio: '',
  // Address
  address1: '', address2: '', city: '', state: '', country: '', zipcode: '',
  // Social
  linkedin: '', twitter: '', facebook: '', instagram: '', youtube: '',
  // Emergency
  emergency_contact_name: '', emergency_contact_phone: '',
};

export default function StoreProfilePage() {
  const user = useSelector(selectUser);
  const dispatch = useDispatch();
  const router = useRouter();

  const userName = user?.name || user?.email || 'Store Owner';
  const initials = userName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  const userId = user?._id;
  const orgId = user?.orgId;

  // ── Decode JWT from localStorage as fallback for page-refresh ──
  function getTokenUserId() {
    if (typeof window === 'undefined') return null;
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) return null;
      // Decode JWT payload (base64url → JSON) — client only needs the _id, auth is server-side
      const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
      return payload._id || null;
    } catch {
      return null;
    }
  }

  // ── State ──────────────────────────────────────────────────────
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState(null); // { type: 'success'|'error', message: string }

  const [orgForm, setOrgForm] = useState(EMPTY_ORG);
  const [personalForm, setPersonalForm] = useState(EMPTY_PERSONAL);
  // Resolved org _id — may differ from user.orgId if we find it via ownerId lookup
  const [resolvedOrgId, setResolvedOrgId] = useState(orgId ? String(orgId) : null);
  const [notifPrefs, setNotifPrefs] = useState([
    { id: 'whatsapp', key: 'whatsapp_noti',   label: 'WhatsApp Notifications',      desc: 'Learner progress, quiz failures',    enabled: true  },
    { id: 'email',    key: 'email_digest',    label: 'Email Digest',                desc: 'Weekly summary report',              enabled: true  },
    { id: 'credits',  key: 'credit_alert',   label: 'Credit Alerts',               desc: 'Notify when credits below 20%',      enabled: true  },
    { id: 'zoom',     key: 'zoom_reminder',  label: 'Zoom Session Reminders',      desc: 'Learner progress, quiz failures',    enabled: true  },
    { id: 'cert',     key: 'cert_issue_alert', label: 'Certification Issuance Alerts', desc: 'When learner earns certificate', enabled: false },
  ]);

  // ── Helpers ────────────────────────────────────────────────────
  /** Extract .data payload from apiServiceHandler response ({ status, message, data }) */
  const extract = (res) => res?.data ?? res;

  // ── Fetch org + user on mount ──────────────────────────────────
  const loadData = useCallback(async () => {
    // Resolve userId — from Redux (just logged in) or from JWT (page refresh)
    const effectiveUserId = userId || getTokenUserId();
    console.log('[StoreProfile] effectiveUserId:', effectiveUserId);
    if (!effectiveUserId) {
      console.warn('[StoreProfile] No userId found — token missing or invalid');
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // 1. Fetch personal data from the users table
      const userRes = await apiServiceHandler('GET', `user/admin/edit/${effectiveUserId}`);
      console.log('[StoreProfile] userRes (raw):', userRes);
      const userRecord = extract(userRes);
      console.log('[StoreProfile] userRecord (extracted):', userRecord);

      if (userRecord) {
        setPersonalForm({
          name:  userRecord.name  || '',
          email: userRecord.email || '',
          phone: userRecord.phone || '',
          alt_phone: userRecord.alt_phone || '',
          dob: userRecord.dob ? userRecord.dob.slice(0, 10) : '',
          gender: userRecord.gender || '',
          bio: userRecord.bio || '',
          address1: userRecord.address1 || '',
          address2: userRecord.address2 || '',
          city: userRecord.city || '',
          state: userRecord.state || '',
          country: userRecord.country || '',
          zipcode: userRecord.zipcode || '',
          linkedin: userRecord.linkedin || '',
          twitter: userRecord.twitter || '',
          facebook: userRecord.facebook || '',
          instagram: userRecord.instagram || '',
          youtube: userRecord.youtube || '',
          emergency_contact_name: userRecord.emergency_contact_name || '',
          emergency_contact_phone: userRecord.emergency_contact_phone || '',
        });
      } else {
        setPersonalForm({
          name:  user?.name  || '',
          email: user?.email || '',
          phone: user?.phone || '',
          alt_phone: '', dob: '', gender: '', bio: user?.bio || '',
          address1: '', address2: '', city: '', state: '', country: '', zipcode: '',
          linkedin: '', twitter: '', facebook: '', instagram: '', youtube: '',
          emergency_contact_name: '', emergency_contact_phone: '',
        });
      }

      // 2. Determine orgId from DB record → Redux → fallback lookup by ownerId
      const dbOrgId = userRecord?.orgId ? String(userRecord.orgId) : null;
      const reduxOrgId = orgId ? String(orgId) : null;
      let effectiveOrgId = dbOrgId || reduxOrgId;
      console.log('[StoreProfile] dbOrgId:', dbOrgId, '| reduxOrgId:', reduxOrgId, '| effectiveOrgId:', effectiveOrgId);

      // 3. Fetch org by orgId
      let orgData = null;
      if (effectiveOrgId) {
        const orgRes = await apiServiceHandler('GET', `organization/${effectiveOrgId}`);
        console.log('[StoreProfile] orgRes (raw):', orgRes);
        orgData = extract(orgRes);
        console.log('[StoreProfile] orgData (extracted):', orgData);
      }

      // 4. Fallback: look up org by ownerId
      if (!orgData) {
        console.log('[StoreProfile] orgData empty — trying fallback list?ownerId=', effectiveUserId);
        const listRes = await apiServiceHandler('GET', `organization/list?ownerId=${effectiveUserId}`);
        console.log('[StoreProfile] listRes (raw):', listRes);
        const list = extract(listRes);
        const arr = Array.isArray(list) ? list : [];
        console.log('[StoreProfile] org list fallback arr:', arr);
        if (arr.length > 0) {
          orgData = arr[0];
          effectiveOrgId = String(arr[0]._id);
        }
      }

      if (effectiveOrgId) setResolvedOrgId(effectiveOrgId);

      if (orgData) {
        setOrgForm({
          org_name:         orgData.org_name         || '',
          org_desc:         orgData.org_desc         || '',
          org_email:        orgData.org_email        || '',
          org_phone:        orgData.org_phone        || '',
          org_whatsapp:     orgData.org_whatsapp     || '',
          org_website:      orgData.org_website      || '',
          org_address1:     orgData.org_address1     || '',
          org_address2:     orgData.org_address2     || '',
          org_city:         orgData.org_city         || '',
          org_state:        orgData.org_state        || '',
          org_country:      orgData.org_country      || '',
          org_zipcode:      orgData.org_zipcode      || '',
          hr_manager_email: orgData.hr_manager_email || '',
          hr_manager_no:    orgData.hr_manager_no    || '',
          industry:         orgData.industry         || '',
          emp_count:        orgData.emp_count        || '',
        });
        // Prefill notification toggles from org record
        setNotifPrefs(prev => prev.map(p => ({
          ...p,
          enabled: orgData[p.key] ?? p.enabled,
        })));
      }
    } catch (err) {
      console.error('[StoreProfile] loadData error:', err?.response?.data || err?.message || err);
      setPersonalForm({
        name:  user?.name  || '',
        phone: user?.phone || '',
        bio:   user?.bio   || '',
      });
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);  // run once on mount — getTokenUserId reads localStorage directly

  useEffect(() => { loadData(); }, [loadData]);

  // ── Handlers ───────────────────────────────────────────────────
  function setOrg(key, val) {
    setOrgForm(prev => ({ ...prev, [key]: val }));
  }

  function setPersonal(key, val) {
    setPersonalForm(prev => ({ ...prev, [key]: val }));
  }

  async function toggleNotif(id) {
    // Optimistically update UI
    const updated = notifPrefs.map(p => p.id === id ? { ...p, enabled: !p.enabled } : p);
    setNotifPrefs(updated);
    // Persist to DB immediately
    const pref = updated.find(p => p.id === id);
    const currentOrgId = resolvedOrgId;
    if (pref && currentOrgId) {
      try {
        await apiServiceHandler('PUT', `organization/update/${currentOrgId}`, { [pref.key]: pref.enabled });
      } catch {
        // Revert on failure
        setNotifPrefs(prev => prev.map(p => p.id === id ? { ...p, enabled: !p.enabled } : p));
      }
    }
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setStatus(null);
    const effectiveUserId = userId || getTokenUserId();
    try {
      const calls = [];
      if (effectiveUserId) {
        calls.push(apiServiceHandler('PUT', `user/admin/update/${effectiveUserId}`, personalForm));
      }
      if (resolvedOrgId) {
        calls.push(apiServiceHandler('PUT', `organization/update/${resolvedOrgId}`, orgForm));
      }
      await Promise.all(calls);
      setStatus({ type: 'success', message: 'Profile saved successfully.' });
    } catch (err) {
      setStatus({ type: 'error', message: err?.message || 'Failed to save. Please try again.' });
    } finally {
      setSaving(false);
    }
  }

  function handleLogout() {
    dispatch(clearAuth());
    if (typeof window !== 'undefined') {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('BHARAT_TOKEN');
    }
    router.replace('/login');
  }

  // ── Skeleton loader ────────────────────────────────────────────
  function SkeletonField() {
    return (
      <div className={s.fieldGroup}>
        <div className={`${s.skeletonLine}`} style={{ width: '40%' }} />
        <div className={s.skeletonInput} />
      </div>
    );
  }

  return (
    <div className={s.shell}>
      {/* ── Sidebar ── */}
      <aside className={s.sidebar}>
        <div className={s.sidebarLogo}><span className={s.logoD}>sikhø</span><span className={s.logoA}>aur</span><span className={s.logoD}>badhø</span></div>

        <div className={s.sidebarSection}>
          <div className={s.sidebarLabel}>Overview</div>
          <NavItem icon={Icon.dashboard} label="Dashboard" onClick={() => router.push('/storeowner/dashboard')} />
          <NavItem icon={Icon.store} label="Store Profile" active />
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
            Store Owner / <strong>Store Profile</strong>
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
          {status && (
            <div className={`${s.statusBar} ${status.type === 'success' ? s.statusSuccess : s.statusError}`}>
              {status.message}
            </div>
          )}

          <div className={s.contentRow}>
            {/* ── Store Profile form card ── */}
            <div className={s.formCard}>
              <div className={s.cardTitle}>Store Profile</div>
              <form onSubmit={handleSave}>
                {loading ? (
                  <div className={s.grid2}>
                    <SkeletonField /><SkeletonField /><SkeletonField /><SkeletonField />
                    <SkeletonField /><SkeletonField /><SkeletonField /><SkeletonField />
                  </div>
                ) : (
                  <div className={s.grid2}>
                    <div className={s.fieldGroup}>
                      <label className={s.label}>Store Name</label>
                      <input className={s.input} value={orgForm.org_name}
                        onChange={e => setOrg('org_name', e.target.value)} placeholder="Enter Name..." />
                    </div>
                    <div className={s.fieldGroup}>
                      <label className={s.label}>Owner Name</label>
                      <input className={s.input} value={personalForm.name}
                        onChange={e => setPersonal('name', e.target.value)} placeholder="Enter Name..." />
                    </div>
                    <div className={s.fieldGroup}>
                      <label className={s.label}>Email</label>
                      <input className={s.input} type="email" value={orgForm.org_email}
                        onChange={e => setOrg('org_email', e.target.value)} placeholder="Enter Email Id..." />
                    </div>
                    <div className={s.fieldGroup}>
                      <label className={s.label}>WhatsApp Number</label>
                      <input className={s.input} value={orgForm.org_whatsapp}
                        onChange={e => setOrg('org_whatsapp', e.target.value)} placeholder="Enter WhatsApp Number..." />
                    </div>
                    <div className={s.fieldGroup}>
                      <label className={s.label}>Manager Email</label>
                      <input className={s.input} type="email" value={orgForm.hr_manager_email}
                        onChange={e => setOrg('hr_manager_email', e.target.value)} placeholder="Enter Email Id..." />
                    </div>
                    <div className={s.fieldGroup}>
                      <label className={s.label}>Manager Number</label>
                      <input className={s.input} value={orgForm.hr_manager_no}
                        onChange={e => setOrg('hr_manager_no', e.target.value)} placeholder="Enter WhatsApp Number..." />
                    </div>
                    <div className={s.fieldGroup}>
                      <label className={s.label}>Industry</label>
                      <input className={s.input} value={orgForm.industry}
                        onChange={e => setOrg('industry', e.target.value)} placeholder="Select Industry Name..." />
                    </div>
                    <div className={s.fieldGroup}>
                      <label className={s.label}>Number Of Employees</label>
                      <input className={s.input} value={orgForm.emp_count}
                        onChange={e => setOrg('emp_count', e.target.value)} placeholder="Enter Number..." />
                    </div>
                    <div className={s.fieldGroup}>
                      <label className={s.label}>Address</label>
                      <input className={s.input} value={orgForm.org_address1}
                        onChange={e => setOrg('org_address1', e.target.value)} placeholder="Enter Address..." />
                    </div>
                    <div className={s.fieldGroup}>
                      <label className={s.label}>City</label>
                      <input className={s.input} value={orgForm.org_city}
                        onChange={e => setOrg('org_city', e.target.value)} placeholder="Enter City Name..." />
                    </div>
                    <div className={s.fieldGroup}>
                      <label className={s.label}>State</label>
                      <input className={s.input} value={orgForm.org_state}
                        onChange={e => setOrg('org_state', e.target.value)} placeholder="Select State..." />
                    </div>
                    <div className={s.fieldGroup}>
                      <label className={s.label}>Pincode</label>
                      <input className={s.input} value={orgForm.org_zipcode}
                        onChange={e => setOrg('org_zipcode', e.target.value)} placeholder="Enter Pincode..." />
                    </div>
                  </div>
                )}
                <div className={s.formActions}>
                  <button type="submit" className={s.btnSave} disabled={saving || loading}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{marginRight:6}}><path d="M23 4v6h-6"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
                    {saving ? 'Saving…' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>

            {/* ── Notification Preferences ── */}
            <div className={s.notifCard}>
              <div className={s.cardTitle}>Notification Preferences</div>
              {notifPrefs.map(pref => (
                <div key={pref.id} className={s.notifItem}>
                  <div className={s.notifText}>
                    <div className={s.notifLabel}>{pref.label}</div>
                    <div className={s.notifDesc}>{pref.desc}</div>
                  </div>
                  <button
                    type="button"
                    className={`${s.toggle} ${pref.enabled ? s.toggleOn : ''}`}
                    onClick={() => toggleNotif(pref.id)}
                    aria-label={pref.enabled ? 'Disable' : 'Enable'}
                  >
                    <span className={s.toggleThumb} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

