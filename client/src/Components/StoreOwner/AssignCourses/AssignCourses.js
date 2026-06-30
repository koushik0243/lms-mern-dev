'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'sonner';
import { selectUser } from '../../../redux/slices/authSlice';
import apiServiceHandler from '../../../service/apiService';
import s from './AssignCourses.module.css';

// ── Icons ────────────────────────────────────────────────────────
const Icon = {
  trash:    <svg viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>,
  whatsapp: <svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.118 1.528 5.845L.057 23.428a.5.5 0 00.515.572l5.701-1.494A11.95 11.95 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.885 0-3.65-.52-5.163-1.427l-.37-.22-3.385.887.903-3.296-.241-.381A9.96 9.96 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/></svg>,
  email:    <svg viewBox="0 0 20 20" fill="currentColor"><path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" /><path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" /></svg>,
};

export default function AssignCoursesPage() {
  const user = useSelector(selectUser);

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

  return (
    <>
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
    </>
  );
}
