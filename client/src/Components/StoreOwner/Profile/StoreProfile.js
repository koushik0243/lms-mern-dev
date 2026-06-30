'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { selectUser } from '../../../redux/slices/authSlice';
import apiServiceHandler from '../../../service/apiService';
import s from './StoreProfile.module.css';

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

function buildTree(items) {
  const map = {};
  items.forEach(item => (map[String(item._id)] = { ...item, children: [] }));
  const roots = [];
  items.forEach(item => {
    const pid = item.parentId ? String(item.parentId) : null;
    if (pid && map[pid]) {
      map[pid].children.push(map[String(item._id)]);
    } else if (!pid) {
      roots.push(map[String(item._id)]);
    }
  });
  return roots;
}

function flattenTree(nodes, depth = 0) {
  const result = [];
  for (const node of nodes) {
    result.push({ _id: node._id, name: node.name, depth });
    if (node.children?.length) result.push(...flattenTree(node.children, depth + 1));
  }
  return result;
}

export default function StoreProfilePage() {
  const user = useSelector(selectUser);

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
  // Resolved owner user _id — from org.ownerId populated object
  const [resolvedOwnerId, setResolvedOwnerId] = useState(null);
  const [industryOptions, setIndustryOptions] = useState([]);
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
        // Owner name/email come from the populated ownerId object in the org response
        if (orgData.ownerId && typeof orgData.ownerId === 'object' && orgData.ownerId._id) {
          setResolvedOwnerId(String(orgData.ownerId._id));
          setPersonalForm(prev => ({
            ...prev,
            name:  orgData.ownerId.name  || prev.name,
            email: orgData.ownerId.email || prev.email,
          }));
        }
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

  useEffect(() => {
    apiServiceHandler('GET', 'industry-type/list-all')
      .then(res => {
        const list = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
        const items = list.map(item => ({
          _id:      String(item._id),
          name:     item.name,
          parentId: item.parentId ? String(item.parentId) : null,
        }));
        setIndustryOptions(flattenTree(buildTree(items)));
      })
      .catch(() => {});
  }, []);

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
      const ownerIdToUpdate = resolvedOwnerId || effectiveUserId;
      if (ownerIdToUpdate) {
        calls.push(apiServiceHandler('PUT', `user/admin/update/${ownerIdToUpdate}`, {
          name:  personalForm.name,
          email: personalForm.email,
        }));
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
    <>
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
                  <label className={s.label}>Owner Email</label>
                  <input className={s.input} type="email" value={personalForm.email}
                    onChange={e => setPersonal('email', e.target.value)} placeholder="Enter Email Id..." />
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
                  <select className={s.select} value={orgForm.industry}
                    onChange={e => setOrg('industry', e.target.value)}>
                    <option value="">Select Industry...</option>
                    {industryOptions.map(opt => (
                      <option key={opt._id} value={opt._id}>
                        {'  '.repeat(opt.depth)}{opt.depth > 0 ? '↳ ' : ''}{opt.name}
                      </option>
                    ))}
                  </select>
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
    </>
  );
}
