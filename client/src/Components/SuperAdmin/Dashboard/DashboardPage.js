'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { selectUser } from '../../../redux/slices/authSlice';
import apiServiceHandler from '../../../service/apiService';
import SuperAdminShell from '../SuperAdminShell';
import s from './Dashboard.module.css';

const Icons = {
  course: <svg viewBox="0 0 20 20" fill="currentColor"><path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4 7.962 7.962 0 009 5.189V4.804z" /></svg>,
  categ:  <svg viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 3a1 1 0 000 2h11a1 1 0 100-2H3zm0 4a1 1 0 000 2h7a1 1 0 100-2H3zm0 4a1 1 0 000 2h4a1 1 0 100-2H3zm9 1a1 1 0 10-2 0v2.586l-.293-.293a1 1 0 10-1.414 1.414l2 2a1 1 0 001.414 0l2-2a1 1 0 00-1.414-1.414L12 14.586V12z" clipRule="evenodd" /></svg>,
  subcat: <svg viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h6a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h3a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" /></svg>,
  tag:    <svg viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" /></svg>,
  cert:   <svg viewBox="0 0 20 20" fill="currentColor"><path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" /><path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" /></svg>,
  org:    <svg viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd" /></svg>,
  orgAdmin: <svg viewBox="0 0 20 20" fill="currentColor"><path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" /></svg>,
  emp:    <svg viewBox="0 0 20 20" fill="currentColor"><path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" /></svg>,
  credit: <svg viewBox="0 0 20 20" fill="currentColor"><path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" /><path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" /></svg>,
  indust: <svg viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" /><path d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z" /></svg>,
  user:   <svg viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>,
  role:   <svg viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 1.944A11.954 11.954 0 012.166 5C2.056 5.649 2 6.319 2 7c0 5.225 3.34 9.67 8 11.317C14.66 16.67 18 12.225 18 7c0-.682-.057-1.35-.166-2.001A11.954 11.954 0 0110 1.944zM11 14a1 1 0 11-2 0 1 1 0 012 0zm0-7a1 1 0 10-2 0v3a1 1 0 102 0V7z" clipRule="evenodd" /></svg>,
  perm:   <svg viewBox="0 0 20 20" fill="currentColor"><path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" /></svg>,
};

/* ── All dashboard boxes ─────────────────────────────────────── */
const DATA_BOXES = [
  {
    key: 'courses',     label: 'Courses',              accent: '#0b7b7b', icon: Icons.course,
    path: '/superadmin/course-builder',
    fetch: () => apiServiceHandler('GET', 'course/list-pagination?page=1&limit=1').then(r => r?.total ?? 0),
  },
  {
    key: 'categories',  label: 'Categories',           accent: '#0284c7', icon: Icons.categ,
    path: '/superadmin/category-subcategory',
    fetch: () => apiServiceHandler('GET', 'course-category/list-pagination?page=1&limit=1').then(r => r?.total ?? 0),
  },
  {
    key: 'subcats',     label: 'Sub-Categories',       accent: '#0369a1', icon: Icons.subcat,
    path: '/superadmin/category-subcategory',
    fetch: () => apiServiceHandler('GET', 'course-subcategory/list-pagination?page=1&limit=1').then(r => r?.total ?? 0),
  },
  {
    key: 'tags',        label: 'Tags',                 accent: '#059669', icon: Icons.tag,
    path: '/superadmin/tags',
    fetch: () => apiServiceHandler('GET', 'tags/list-pagination?page=1&limit=1').then(r => r?.total ?? 0),
  },
  {
    key: 'certs',       label: 'Certificate Templates', accent: '#7c3aed', icon: Icons.cert,
    path: '/superadmin/certificate-template',
    fetch: () => apiServiceHandler('GET', 'certificate-template/list-pagination?page=1&limit=1').then(r => r?.total ?? 0),
  },
  {
    key: 'orgs',        label: 'Organizations',        accent: '#2563eb', icon: Icons.org,
    path: '/superadmin/organizations',
    fetch: () => apiServiceHandler('GET', 'organization/list-pagination?page=1&limit=1').then(r => r?.total ?? 0),
  },
  {
    key: 'orgAdmins',   label: 'Organization Admins',  accent: '#7c3aed', icon: Icons.orgAdmin,
    path: '/superadmin/organizations',
    fetch: () => apiServiceHandler('GET', 'user/admin/list-pagination?page=1&limit=1&user_type=organization&orgRole=admin').then(r => r?.total ?? 0),
  },
  {
    key: 'employees',   label: 'Employees',            accent: '#db2777', icon: Icons.emp,
    path: '/superadmin/employees',
    fetch: () => apiServiceHandler('GET', 'user/admin/list-pagination?page=1&limit=1&user_type=employee').then(r => r?.total ?? 0),
  },
  {
    key: 'credits',     label: 'Credits',              accent: '#d97706', icon: Icons.credit,
    path: '/superadmin/organization-credit-assignment',
    fetch: () => apiServiceHandler('GET', 'credit/list-pagination?page=1&limit=1').then(r => r?.total ?? 0),
  },
  {
    key: 'industry',    label: 'Industry Types',       accent: '#b45309', icon: Icons.indust,
    path: '/superadmin/industry-type',
    fetch: () => apiServiceHandler('GET', 'industry-type/list-all').then(r => (Array.isArray(r?.data) ? r.data.length : Array.isArray(r) ? r.length : 0)),
  },
  {
    key: 'users',       label: 'Admin Users',          accent: '#6d28d9', icon: Icons.user,
    path: '/superadmin/user',
    fetch: () => apiServiceHandler('GET', 'user/admin/list-pagination?page=1&limit=1&user_type=superadmin').then(r => r?.total ?? 0),
  },
  {
    key: 'roles',       label: 'Roles',                accent: '#dc2626', icon: Icons.role,
    path: '/superadmin/roles',
    fetch: () => apiServiceHandler('GET', 'role/list-pagination?page=1&limit=1').then(r => r?.total ?? 0),
  },
  {
    key: 'roleperms',   label: 'Role Permissions',     accent: '#64748b', icon: Icons.perm,
    path: '/superadmin/role-permissions',
    fetch: () => apiServiceHandler('GET', 'role-permission/list-pagination?page=1&limit=1').then(r => r?.total ?? 0),
  },
];

function fmtCount(n) {
  if (n === null || n === undefined) return '—';
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function formatDate() {
  return new Date().toLocaleDateString('en-IN', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });
}

export default function DashboardPage() {
  const router = useRouter();
  const user   = useSelector(selectUser);
  const name   = user?.name?.split(' ')[0] || 'Admin';

  const [counts, setCounts]   = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    Promise.allSettled(DATA_BOXES.map(b => b.fetch().then(v => ({ key: b.key, val: v }))))
      .then(results => {
        if (cancelled) return;
        const map = {};
        results.forEach(r => { if (r.status === 'fulfilled') map[r.value.key] = r.value.val; });
        setCounts(map);
        setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  return (
    <SuperAdminShell activeSection="dashboard">

      {/* ── Welcome banner ── */}
      <div className={s.banner}>
        <div>
          <h1 className={s.bannerTitle}>{getGreeting()}, {name} 👋</h1>
          <p className={s.bannerDate}>{formatDate()}</p>
        </div>
        <div className={s.bannerBadge}>Super Admin Panel</div>
      </div>

      {/* ── Data boxes grid ── */}
      <div className={s.dataGrid}>
        {DATA_BOXES.map(box => (
          <button
            key={box.key}
            className={s.dataBox}
            style={{ '--accent': box.accent }}
            onClick={() => router.push(box.path)}
          >
            <div className={s.dataBoxTop}>
              <span className={s.dataBoxIcon}>{box.icon}</span>
              <span className={s.dataBoxArrow}>
                <svg viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
              </span>
            </div>
            <div className={s.dataBoxCount}>
              {loading ? <span className={s.skeleton} /> : fmtCount(counts[box.key])}
            </div>
            <div className={s.dataBoxLabel}>{box.label}</div>
          </button>
        ))}
      </div>

    </SuperAdminShell>
  );
}
