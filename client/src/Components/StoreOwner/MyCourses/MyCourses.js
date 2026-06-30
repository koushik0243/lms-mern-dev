'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { selectUser } from '../../../redux/slices/authSlice';
import apiServiceHandler from '../../../service/apiService';
import { API_URL } from '../../../lib/constant';
import s from './MyCourses.module.css';

// ── Icons ─────────────────────────────────────────────────────────
const Icon = {
  courses:  <svg viewBox="0 0 20 20" fill="currentColor"><path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4 7.962 7.962 0 009 5.189V4.804z" /></svg>,
  clock:    <svg viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" /></svg>,
  chapters: <svg viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h6a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" /></svg>,
  tag:      <svg viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" /></svg>,
  folder:   <svg viewBox="0 0 20 20" fill="currentColor"><path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" /></svg>,
  level:    <svg viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 0l-2 2a1 1 0 101.414 1.414L8 10.414l1.293 1.293a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>,
  learners: <svg viewBox="0 0 20 20" fill="currentColor"><path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v1h8v-1zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-1a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v1h-3zM4.75 14.094A5.973 5.973 0 004 17v1H1v-1a3 3 0 013.75-2.906z" /></svg>,
  check:    <svg viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>,
  draft:    <svg viewBox="0 0 20 20" fill="currentColor"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" /></svg>,
  inactive: <svg viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524L13.477 14.89zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clipRule="evenodd" /></svg>,
};

function getTokenUserId() {
  if (typeof window === 'undefined') return null;
  try {
    const token = localStorage.getItem('adminToken');
    if (!token) return null;
    const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
    return payload._id || null;
  } catch { return null; }
}

function fmtDuration(hr, min) {
  const h = parseInt(hr, 10) || 0;
  const m = parseInt(min, 10) || 0;
  if (!h && !m) return null;
  if (h && m) return `${h}h ${m}m`;
  if (h) return `${h}h`;
  return `${m}m`;
}

export default function MyCoursesPage() {
  const user = useSelector(selectUser);

  const [courses, setCourses]       = useState([]);
  const [tagMap, setTagMap]         = useState({});   // _id → title
  const [learnerMap, setLearnerMap] = useState({});   // courseId → learner count
  const [loading, setLoading]       = useState(true);

  const loadCourses = useCallback(async () => {
    setLoading(true);
    try {
      // Resolve orgId
      let effectiveOrgId = user?.orgId ? String(user.orgId) : null;
      if (!effectiveOrgId) {
        const uid = user?._id || getTokenUserId();
        if (uid) {
          const r = await apiServiceHandler('GET', `user/admin/edit/${uid}`);
          const rec = r?.data ?? r;
          if (rec?.orgId) effectiveOrgId = String(rec.orgId);
        }
      }
      if (!effectiveOrgId) { setCourses([]); setLoading(false); return; }

      // Four parallel requests:
      // 1. org-course/list  → which courses are assigned + assignment status
      // 2. course/list      → full course details (desc, catId, tagIds, level, chapters, image…)
      // 3. tags/list        → tag names (tagIds in courses are raw IDs, not populated)
      // 4. course-assignment/list → learner counts per course for this org
      const [ocRes, courseRes, tagsRes, caRes] = await Promise.all([
        apiServiceHandler('GET', `organization-course/list?orgId=${effectiveOrgId}`),
        apiServiceHandler('GET', 'course/list'),
        apiServiceHandler('GET', 'tags/list').catch(() => null),
        apiServiceHandler('GET', `course-assignment/list?organizationId=${effectiveOrgId}`).catch(() => null),
      ]);

      const orgCourses = Array.isArray(ocRes?.data)    ? ocRes.data    : (Array.isArray(ocRes)    ? ocRes    : []);
      const allCourses = Array.isArray(courseRes?.data) ? courseRes.data : (Array.isArray(courseRes) ? courseRes : []);
      const allTags    = Array.isArray(tagsRes?.data)   ? tagsRes.data  : (Array.isArray(tagsRes)   ? tagsRes  : []);
      const allCA      = Array.isArray(caRes?.data)     ? caRes.data    : (Array.isArray(caRes)     ? caRes    : []);

      // tag _id → title
      const tMap = {};
      allTags.forEach(t => { if (t._id) tMap[String(t._id)] = t.title || t.name || ''; });
      setTagMap(tMap);

      // courseId → unique learner count
      const lMap = {};
      allCA.forEach(a => {
        const cId = a.courseId?._id ? String(a.courseId._id) : (a.courseId ? String(a.courseId) : null);
        if (!cId) return;
        if (!lMap[cId]) lMap[cId] = new Set();
        const uId = a.userId?._id ? String(a.userId._id) : (a.userId ? String(a.userId) : null);
        if (uId) lMap[cId].add(uId);
      });
      const learnerCountMap = {};
      Object.keys(lMap).forEach(cId => { learnerCountMap[cId] = lMap[cId].size; });
      setLearnerMap(learnerCountMap);

      // Build full course lookup: courseId → full course object
      const courseMap = {};
      allCourses.forEach(c => { if (c._id) courseMap[String(c._id)] = c; });

      // Merge full course data into each org-course record
      const enriched = orgCourses.map(item => {
        const cId = item.courseId?._id
          ? String(item.courseId._id)
          : (item.courseId ? String(item.courseId) : null);
        const full = cId ? courseMap[cId] : null;
        return full
          ? { ...item, courseId: { ...(typeof item.courseId === 'object' ? item.courseId : {}), ...full } }
          : item;
      });

      setCourses(enriched);
    } catch {
      setCourses([]);
    } finally {
      setLoading(false);
    }
  }, [user?._id, user?.orgId]);

  useEffect(() => { loadCourses(); }, [loadCourses]);

  const total     = courses.length;
  const published = courses.filter(c => (c.courseId?.status || '').toLowerCase() === 'published').length;
  const draft     = courses.filter(c => (c.courseId?.status || '').toLowerCase() === 'draft').length;
  const inactive  = courses.filter(c => (c.status || '').toLowerCase() === 'inactive').length;

  const STATS = [
    { icon: 'courses',  label: 'Total Courses',  value: total },
    { icon: 'check',    label: 'Published',       value: published },
    { icon: 'draft',    label: 'Draft',           value: draft },
    { icon: 'inactive', label: 'Inactive',        value: inactive },
  ];

  return (
    <>
      {/* ── Stats ── */}
      <div className={s.card}>
        <h2 className={s.cardTitle}>Overview</h2>
        <div className={s.statsGrid}>
          {STATS.map(st => (
            <div key={st.label} className={s.statCard}>
              <div className={s.statIcon}>{Icon[st.icon]}</div>
              <div className={s.statLabel}>{st.label}</div>
              <div className={s.statValue}>{loading ? '—' : st.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Course grid ── */}
      <div className={s.card}>
        <h2 className={s.cardTitle}>
          Courses
          {!loading && total > 0 && <span className={s.countPill}>{total}</span>}
        </h2>

        {loading ? (
          <div className={s.courseGrid}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className={s.skeletonCard} />
            ))}
          </div>
        ) : courses.length === 0 ? (
          <div className={s.empty}>No courses assigned to this organisation yet.</div>
        ) : (
          <div className={s.courseGrid}>
            {courses.map(item => {
              const c = item.courseId || {};
              const thumb = c.course_image ? `${API_URL}${c.course_image}` : null;
              const duration = fmtDuration(c.duration_hr, c.duration_min);
              const orgStatus = (item.status || 'active').toLowerCase();
              const courseStatus = (c.status || 'published').toLowerCase();
              const tags = Array.isArray(c.tagIds)
                ? c.tagIds.map(t => {
                    const id = t?._id ? String(t._id) : String(t);
                    const name = t?.title || tagMap[id] || null;
                    return name ? { id, name } : null;
                  }).filter(Boolean)
                : [];
              const chapters = parseInt(c.totalChapters, 10) || 0;
              const cId = item.courseId?._id
                ? String(item.courseId._id)
                : (item.courseId ? String(item.courseId) : null);
              const learnerCount = cId != null ? (learnerMap[cId] ?? 0) : 0;
              return (
                <div key={item._id} className={s.courseCard}>
                  {/* Thumbnail */}
                  <div className={s.courseThumb}>
                    {thumb
                      ? <img src={thumb} alt={c.title} className={s.courseThumbImg} />
                      : <div className={s.courseThumbPlaceholder}>{Icon.courses}</div>
                    }
                  </div>

                  {/* Body */}
                  <div className={s.courseCardBody}>
                    <div className={s.courseCardTitle}>{c.title || '—'}</div>

                    {/* Description */}
                    {c.desc && (
                      <div className={s.courseCardDesc}>{c.desc}</div>
                    )}

                    {/* Category */}
                    {c.catId?.title && (
                      <div className={s.courseCardRow}>
                        <span className={s.rowIcon}>{Icon.folder}</span>
                        <span className={s.catLabel}>{c.catId.title}</span>
                      </div>
                    )}

                    {/* Tags */}
                    {tags.length > 0 && (
                      <div className={s.courseCardRow}>
                        <span className={s.rowIcon}>{Icon.tag}</span>
                        <div className={s.tagList}>
                          {tags.map(t => (
                            <span key={t.id} className={s.tagPill}>{t.name}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Level */}
                    {c.level && (
                      <div className={s.courseCardRow}>
                        <span className={s.rowIcon}>{Icon.level}</span>
                        <span className={`${s.badge} ${s.badgeLevel}`}>{c.level}</span>
                      </div>
                    )}

                    {/* Chapters + Duration */}
                    <div className={s.courseCardStats}>
                      {chapters > 0 && (
                        <span className={s.statChip}>
                          {Icon.chapters}
                          {chapters} Chapter{chapters !== 1 ? 's' : ''}
                        </span>
                      )}
                      {duration && (
                        <span className={s.statChip}>
                          {Icon.clock}
                          {duration}
                        </span>
                      )}
                    </div>

                    {/* Learner count */}
                    <div className={s.learnerRow}>
                      {Icon.learners}
                      <span>{learnerCount} Learner{learnerCount !== 1 ? 's' : ''}</span>
                    </div>

                    {/* Status badges */}
                    <div className={s.courseCardMeta}>
                      <span className={`${s.badge} ${courseStatus === 'published' ? s.badgePublished : courseStatus === 'draft' ? s.badgeDraft : s.badgeInactive}`}>
                        {courseStatus}
                      </span>
                      {orgStatus === 'inactive' && (
                        <span className={`${s.badge} ${s.badgeInactive}`}>org inactive</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
