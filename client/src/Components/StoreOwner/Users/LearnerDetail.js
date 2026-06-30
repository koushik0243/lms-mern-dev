'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import apiServiceHandler from '../../../service/apiService';
import { API_URL } from '../../../lib/constant';
import s from './LearnerDetail.module.css';

// ── Icons ────────────────────────────────────────────────────────
const Icon = {
  back:         <svg viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" /></svg>,
  email:        <svg viewBox="0 0 20 20" fill="currentColor"><path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" /><path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" /></svg>,
  phone:        <svg viewBox="0 0 20 20" fill="currentColor"><path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" /></svg>,
  calendar:     <svg viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" /></svg>,
  user:         <svg viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>,
  verified:     <svg viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>,
  courses:      <svg viewBox="0 0 20 20" fill="currentColor"><path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4 7.962 7.962 0 009 5.189V4.804z" /></svg>,
};

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
  const router = useRouter();

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

  function getInitials(name) {
    if (!name) return '?';
    return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  }

  function formatDate(dateStr) {
    if (!dateStr) return null;
    return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  function fmtDuration(hr, min) {
    const h = parseInt(hr, 10) || 0;
    const m = parseInt(min, 10) || 0;
    if (!h && !m) return null;
    if (h && m) return `${h}h ${m}m`;
    if (h) return `${h}h`;
    return `${m}m`;
  }

  const statusColor = {
    active: s.statusActive,
    inactive: s.statusInactive,
    suspended: s.statusSuspended,
    deactivated: s.statusSuspended,
  };

  return (
    <>
      {/* ── Breadcrumb / page header ── */}
      <div className={s.breadcrumb}>
        <button className={s.backBtn} onClick={() => router.push('/storeowner/users')}>
          {Icon.back}
        </button>
        Store Owner / <span onClick={() => router.push('/storeowner/users')} className={s.breadcrumbLink}>User Management</span> / <strong>{loading ? '…' : (learner?.name || 'Learner')}</strong>
        <div className={s.topbarActions}>
          <button type="button" className={s.btnAddLearner} onClick={() => router.push('/storeowner/add-learner')}>+ Add Learner</button>
        </div>
      </div>

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
              <div className={s.cardTitle}>
                Assigned Courses
                {assignedCourses.length > 0 && (
                  <span className={s.coursesCount}>{assignedCourses.length}</span>
                )}
              </div>
              {assignedCourses.length === 0 ? (
                <div className={s.fieldEmpty}>No courses assigned yet</div>
              ) : (
                <div className={s.courseDetailGrid}>
                  {assignedCourses.map(a => {
                    const c = a.courseId || {};
                    const thumb = c.course_image ? `${API_URL}${c.course_image}` : null;
                    const duration = fmtDuration(c.duration_hr, c.duration_min);
                    return (
                      <div key={a._id} className={s.courseDetailCard}>
                        <div className={s.courseThumb}>
                          {thumb
                            ? <img src={thumb} alt={c.title} className={s.courseThumbImg} />
                            : <div className={s.courseThumbPlaceholder}>{Icon.courses}</div>
                          }
                        </div>
                        <div className={s.courseDetailBody}>
                          <div className={s.courseDetailTitle}>{c.title || '—'}</div>
                          {c.desc && (
                            <div className={s.courseDetailDesc}>{c.desc}</div>
                          )}
                          <div className={s.courseDetailMeta}>
                            <span className={`${s.courseStatusBadge} ${a.status === 'inactive' ? s.courseStatusInactive : s.courseStatusActive}`}>
                              {a.status || 'active'}
                            </span>
                            {duration && (
                              <span className={s.courseDurationBadge}>{duration}</span>
                            )}
                            <span className={s.courseDetailDate}>
                              Assigned {formatDate(a.createdAt) || '—'}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
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
    </>
  );
}
