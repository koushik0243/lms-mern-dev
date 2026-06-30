'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { selectUser } from '../../../redux/slices/authSlice';
import apiServiceHandler from '../../../service/apiService';
import s from './OrgDashboard.module.css';

// ── StatRing ────────────────────────────────────────────────────
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

// ── CourseBar ───────────────────────────────────────────────────
function CourseBar({ pct, label }) {
  const BLOCKS = 8;
  const filled = Math.round((pct / 100) * BLOCKS);
  return (
    <div className={s.courseBarCol}>
      <div className={s.courseBarPct}>{pct}%</div>
      <div className={s.courseBarStack}>
        {Array.from({ length: BLOCKS }, (_, i) => (
          <div key={i} className={`${s.courseBlock} ${i >= BLOCKS - filled ? s.courseBlockOn : s.courseBlockOff}`} />
        ))}
      </div>
      <div className={s.courseBarLabel}>{label}</div>
    </div>
  );
}

function Av({ name }) {
  const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  return <div className={s.avatar}>{initials}</div>;
}

const COURSES = [
  { label: 'QC Basics',           pct: 88 },
  { label: 'Safety At Work',      pct: 74 },
  { label: 'Compliance & Ethics', pct: 74 },
  { label: 'Leadership Basics',   pct: 74 },
  { label: 'Fire Safety',         pct: 88 },
];

const TOP = [
  { name: 'Mike Devid' },
  { name: 'Karan Malhotra', highlight: true },
  { name: 'Sneha Iyer' },
  { name: 'Rahul Das' },
];

const BOTTOM = [
  { name: 'Aarav Sharma', badge: 'AT RISK',    cls: 'badgeRisk' },
  { name: 'Riya Mehta',   badge: 'STRUGGLING', cls: 'badgeStruggling' },
  { name: 'Arjun Verma',  badge: 'STRUGGLING', cls: 'badgeStruggling' },
  { name: 'Neha Kapoor',  badge: 'STRUGGLING', cls: 'badgeStruggling' },
];

const ACTIVITY = [
  { text: 'Anita Sharma completed Safety at Work',   meta: '1 Hour Ago · Certificate Issued' },
  { text: '5 new learners added to QC Basics',       meta: '3 Hours Ago' },
  { text: 'Priya K. failed Ethics quiz — retry 2/2', meta: 'Yesterday · Mandatory Rewatch Triggered' },
  { text: 'Credits low — 50 remaining of 500',       meta: 'Yesterday · Consider Upgrading Plan' },
  { text: 'Credits low — 50 remaining of 500',       meta: 'Yesterday · Consider Upgrading Plan' },
  { text: 'Credits low — 50 remaining of 500',       meta: 'Yesterday · Consider Upgrading Plan' },
  { text: 'Credits low — 50 remaining of 500',       meta: 'Yesterday · Consider Upgrading Plan' },
  { text: 'Credits low — 50 remaining of 500',       meta: 'Yesterday · Consider Upgrading Plan' },
];

const StatIcons = {
  learners:   <svg viewBox="0 0 20 20" fill="currentColor"><path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zm8 0a3 3 0 11-6 0 3 3 0 016 0zM6.865 14c.41-1.135 1.53-2 2.635-2h1c1.105 0 2.226.865 2.635 2H6.865zM1 14a5.002 5.002 0 019-3h.001A5 5 0 0119 14v1H1v-1z" /></svg>,
  courses:    <svg viewBox="0 0 20 20" fill="currentColor"><path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4 7.962 7.962 0 009 5.189V4.804z" /></svg>,
  completion: <svg viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>,
  credits:    <svg viewBox="0 0 20 20" fill="currentColor"><path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" /><path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" /></svg>,
};

export default function OrganizationDashboard() {
  const user = useSelector(selectUser);
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

      const [learnersRes, orgCoursesRes] = await Promise.all([
        apiServiceHandler('GET', `user/admin/list?orgId=${effectiveOrgId}&user_type=employee&orgRole=employee`),
        apiServiceHandler('GET', `organization-course/list?orgId=${effectiveOrgId}`),
      ]);

      const learnerList   = Array.isArray(learnersRes?.data)    ? learnersRes.data    : (Array.isArray(learnersRes)    ? learnersRes    : []);
      const orgCourseList = Array.isArray(orgCoursesRes?.data)  ? orgCoursesRes.data  : (Array.isArray(orgCoursesRes)  ? orgCoursesRes  : []);

      setStats({ learners: learnerList.length, coursesAssigned: orgCourseList.length });
    } catch { /* silent */ }
  }, [user?._id, user?.orgId]);

  useEffect(() => { loadStats(); }, [loadStats]);

  const learnerCnt = stats.learners ?? 0;
  const courseCnt  = stats.coursesAssigned ?? 0;

  return (
    <>
      <div className={s.pageTitle}>Overview</div>

      {/* Stat cards */}
      <div className={s.statsRow}>

        <div className={s.statCard}>
          <div className={s.statBody}>
            <div className={s.statHeader}>
              <div className={s.statIcon}>{StatIcons.learners}</div>
              <div className={s.statLabel}>Total Learners</div>
            </div>
            <div className={s.statValue}>{stats.learners ?? '—'}</div>
            <div className={`${s.statDelta} ${s.statDeltaUp}`}>↑ 7 This Month</div>
          </div>
          <StatRing value={learnerCnt} pct={Math.min(learnerCnt, 100)} />
        </div>

        <div className={s.statCard}>
          <div className={s.statBody}>
            <div className={s.statHeader}>
              <div className={s.statIcon}>{StatIcons.courses}</div>
              <div className={s.statLabel}>Courses Assigned</div>
            </div>
            <div className={s.statValue}>{stats.coursesAssigned ?? '—'}</div>
            <div className={`${s.statDelta} ${s.statDeltaUp}`}>↑ 1 New</div>
          </div>
          <StatRing value={courseCnt} pct={Math.min(courseCnt / 20 * 100, 100)} />
        </div>

        <div className={s.statCard}>
          <div className={s.statBody}>
            <div className={s.statHeader}>
              <div className={s.statIcon}>{StatIcons.completion}</div>
              <div className={s.statLabel}>Completion Rate</div>
            </div>
            <div className={s.statValue}>74%</div>
            <div className={`${s.statDelta} ${s.statDeltaUp}`}>↑ 6% MoM</div>
          </div>
          <StatRing value="74" pct={74} />
        </div>

        <div className={s.statCard}>
          <div className={s.statBody}>
            <div className={s.statHeader}>
              <div className={s.statIcon}>{StatIcons.credits}</div>
              <div className={s.statLabel}>Credits Remaining</div>
            </div>
            <div className={s.statValue}>50</div>
            <div className={`${s.statDelta} ${s.statDeltaWarn}`}>Low — 500 Issued</div>
          </div>
          <StatRing value="50" pct={10} />
        </div>

      </div>

      {/* Two-column layout */}
      <div className={s.twoCol}>
        <div className={s.leftCol}>

          <div className={s.card}>
            <div className={s.cardTitle}>Course completion overview</div>
            <div className={s.courseBarRow}>
              {COURSES.map(c => <CourseBar key={c.label} pct={c.pct} label={c.label} />)}
            </div>
          </div>

          <div className={s.card}>
            <div className={s.performersGrid}>
              <div>
                <div className={s.cardTitle}>Top performers</div>
                <div className={s.performerList}>
                  {TOP.map(p => (
                    <div key={p.name}
                         className={`${s.performerRow} ${p.highlight ? s.performerRowHighlight : ''}`}>
                      <Av name={p.name} />
                      <div className={s.performerInfo}>
                        <div className={s.performerName}>{p.name}</div>
                        <div className={s.performerMeta}>Courses Done: 4/6</div>
                        <div className={s.performerMeta}>Avg. Score: 94%</div>
                      </div>
                      <span className={`${s.badge} ${s.badgeTop}`}>TOP</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <div className={s.cardTitle}>Bottom performers</div>
                <div className={s.performerList}>
                  {BOTTOM.map(p => (
                    <div key={p.name} className={s.performerRow}>
                      <Av name={p.name} />
                      <div className={s.performerInfo}>
                        <div className={s.performerName}>{p.name}</div>
                        <div className={s.performerMeta}>Courses Done: 4/6</div>
                        <div className={s.performerMeta}>Avg. Score: 94%</div>
                      </div>
                      <span className={`${s.badge} ${s[p.cls]}`}>{p.badge}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

        </div>

        <div className={`${s.card} ${s.activityCard}`}>
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
    </>
  );
}
