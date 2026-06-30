'use client';

import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { selectUser } from '../../../redux/slices/authSlice';
import apiServiceHandler from '../../../service/apiService';
import { toast } from 'sonner';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import s from './AddLearner.module.css';

// ── Icons ────────────────────────────────────────────────────────
const Icon = {
  users:        <svg viewBox="0 0 20 20" fill="currentColor"><path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zm8 0a3 3 0 11-6 0 3 3 0 016 0zM6.865 14c.41-1.135 1.53-2 2.635-2h1c1.105 0 2.226.865 2.635 2H6.865zM1 14a5.002 5.002 0 019-3h.001A5 5 0 0119 14v1H1v-1z" /></svg>,
  chevronDown:  <svg viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>,
  arrowLeft:    <svg viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" /></svg>,
  arrowRight:   <svg viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" /></svg>,
  credit:       <svg viewBox="0 0 20 20" fill="currentColor"><path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" /><path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" /></svg>,
  check:        <svg viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>,
};

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
  const router = useRouter();

  const [activeStep, setActiveStep] = useState(0);
  const [form, setForm] = useState(EMPTY_FORM);
  const [courses, setCourses] = useState([]);
  const [coursesLoading, setCoursesLoading] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [saving, setSaving] = useState(false);
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

      // Step 2 — assign the selected course (single selection)
      if (selectedCourseId) {
        await apiServiceHandler('POST', 'course-assignment/create', {
          organizationId: resolvedOrgId,
          userId: newUserId,
          courseId: selectedCourseId,
        });
      }

      // Step 3 — log one credit-used record after learner + course are both saved
      await apiServiceHandler('POST', 'credit-used/create', {
        orgId:     resolvedOrgId,
        learnerId: newUserId,
        courseId:  selectedCourseId || null,
        status:    'active',
      });

      // Step 4 — save notification preferences
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
    setSelectedCourseId(prev => prev === id ? null : id);
  }

  const selectedCourses = selectedCourseId ? courses.filter(c => c.id === selectedCourseId) : [];

  function stepCircleClass(i) {
    if (i < activeStep) return `${s.stepCircle} ${s.stepCircleCheck}`;
    if (i === activeStep) return `${s.stepCircle} ${s.stepCircleActive}`;
    return s.stepCircle;
  }

  return (
    <>
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
                const isSelected = selectedCourseId === course.id;
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
            <button className={s.btnDiscard} onClick={() => { setForm(EMPTY_FORM); setSelectedCourseId(null); setActiveStep(0); }}>
              Discard
            </button>
            <button className={s.btnNext} onClick={handleSave} disabled={saving}>
              {saving ? 'Saving…' : 'Save & Add Learner'}
              {!saving && <span className={s.footerArrow}>{Icon.arrowRight}</span>}
            </button>
          </div>
        )}
      </div>
    </>
  );
}
