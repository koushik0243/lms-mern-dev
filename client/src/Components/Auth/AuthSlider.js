'use client';

import { useState, useEffect } from 'react';
import styles from './Auth.module.css';

const SLIDES = [
  {
    title: 'Get more with less',
    subtitle: 'Answers judged by meaning, not exact wording. Partial marks awarded for near-correct responses.',
  },
  {
    title: 'Learn at your own pace',
    subtitle: 'Access courses anytime, anywhere. Track your progress and pick up right where you left off.',
  },
  {
    title: 'Earn recognised certificates',
    subtitle: 'Complete courses and quizzes to earn certificates that validate your skills and knowledge.',
  },
  {
    title: 'Practice with live sessions',
    subtitle: 'Join instructor-led live sessions, ask questions and interact with peers in real time.',
  },
];

function DashboardMockup() {
  return (
    <div className={styles.laptopWrap}>
      {/* Floating overview card */}
      <div className={styles.floatingCard}>
        <div className={styles.fcTitle}>Overview</div>
        <div className={styles.fcStats}>
          {[
            { lbl: 'Progress', val: '60%', sub: 'Course Completion' },
            { lbl: 'Time', val: '2 Hrs', sub: 'Hours Learned' },
            { lbl: 'Pass', val: '70%', sub: 'Quiz Attempts' },
            { lbl: 'Score', val: '100%', sub: 'Overall Score' },
          ].map((s) => (
            <div key={s.lbl} className={styles.fcStat}>
              <div className={styles.fcLabel}>{s.lbl}</div>
              <div className={styles.fcValue}>{s.val}</div>
              <div className={styles.fcSub}>{s.sub}</div>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.laptopScreen}>
        <div className={styles.dashInner}>

          {/* Sidebar */}
          <div className={styles.dashSidebar}>
            <div className={styles.dashSidebarLogo}>sithoaurbadho</div>
            <div className={`${styles.dashSidebarItem} ${styles.active}`}>
              <div className={styles.dashSidebarDot} />
              Dashboard
            </div>
            <div className={styles.dashSidebarItem}>
              <div className={styles.dashSidebarDot} />
              Courses
            </div>
            <div style={{ padding: '3px 8px', fontSize: 5, color: '#9ca3af', marginTop: 2 }}>Results</div>
            <div className={styles.dashSidebarItem}>
              <div className={styles.dashSidebarDot} />
              Quiz Result
            </div>
            <div style={{ padding: '3px 8px', fontSize: 5, color: '#9ca3af', marginTop: 2 }}>Engage</div>
            <div className={styles.dashSidebarItem}>
              <div className={styles.dashSidebarDot} />
              Certificate
            </div>
            <div className={styles.dashSidebarItem}>
              <div className={styles.dashSidebarDot} />
              My Profile
            </div>
          </div>

          {/* Main */}
          <div className={styles.dashMain}>
            {/* Top bar */}
            <div className={styles.dashTopBar}>
              <div className={styles.dashBreadcrumb}>
                Learn Hub / <span>Dashboard</span>
              </div>
              <div className={styles.dashSearch} />
              <div className={styles.dashTopRight}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', border: '1px solid #d1d5db' }} />
                <div className={styles.dashAvatar} />
              </div>
            </div>

            {/* Body */}
            <div className={styles.dashBody}>
              <div className={styles.dashOverviewTitle}>Overview</div>

              {/* Stats */}
              <div className={styles.dashStatsRow}>
                {[
                  { label: 'Progress', value: '60%', sub: 'Course Completion', color: '#0b7b7b' },
                  { label: 'Time', value: '2 Hrs', sub: 'Hours Learned', color: '#f59e0b' },
                  { label: 'Pass', value: '70%', sub: 'Quiz Attempts', color: '#3b82f6' },
                  { label: 'Score', value: '100%', sub: 'Overall Score', color: '#6b7280' },
                ].map((s) => (
                  <div className={styles.dashStat} key={s.label}>
                    <div className={styles.dashStatLabel} style={{ color: s.color }}>{s.label}</div>
                    <div className={styles.dashStatValue}>{s.value}</div>
                    <div className={styles.dashStatSub}>{s.sub}</div>
                  </div>
                ))}
              </div>

              {/* Two-col layout */}
              <div className={styles.dashTwoCol}>
                {/* My Courses */}
                <div className={styles.dashCoursesSection}>
                  <div className={styles.dashSectionHeader}>
                    <div className={styles.dashSectionTitle}>My Courses</div>
                    <div className={styles.dashViewAll}>View all &gt;</div>
                  </div>
                  <div className={styles.dashCourseCards}>
                    {[
                      { emoji: '💡', cat: 'Sales Marketing', name: 'Courses Name' },
                      { emoji: '📚', cat: 'Sales Marketing', name: 'Courses Name' },
                    ].map((c, i) => (
                      <div className={styles.dashCourseCard} key={i}>
                        <div className={styles.dashCourseImg}>{c.emoji}</div>
                        <div className={styles.dashCourseInfo}>
                          <div className={styles.dashCourseSub}>{c.cat}</div>
                          <div className={styles.dashCourseName}>{c.name}</div>
                          <div className={styles.dashCourseActions}>
                            <div className={styles.dashCourseBtn}>Explore</div>
                            <div className={styles.dashCourseBtn} style={{ background: 'transparent', color: '#0b7b7b', border: '1px solid #0b7b7b' }}>Resume</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Live Sessions */}
                <div className={styles.dashLiveSessions}>
                  <div className={styles.dashSessionTitle}>Upcoming Live Sessions</div>
                  {[
                    { name: 'Workplace Safety Essentials', meta: 'Session with Instructor Name\nApr 10, 2024 · 11:00 AM' },
                    { name: 'Introduction to Quality Control', meta: 'Session with Instructor Name\nApr 10, 2024 · 11:00 AM' },
                    { name: 'Managing a Production Team', meta: 'Session with Instructor Name\nApr 10, 2024 · 11:00 AM' },
                  ].map((s, i) => (
                    <div className={styles.dashSession} key={i}>
                      <div className={styles.dashSessionThumb} />
                      <div className={styles.dashSessionInfo}>
                        <div className={styles.dashSessionName}>{s.name}</div>
                        <div className={styles.dashSessionMeta}>{s.meta}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className={styles.laptopBase} />
    </div>
  );
}

export default function AuthSlider() {
  const [active, setActive] = useState(0);
  const [animKey, setAnimKey] = useState(0);

  function goTo(i) {
    if (i === active) return;
    setActive(i);
    setAnimKey((k) => k + 1);
  }

  useEffect(() => {
    const interval = setInterval(() => {
      setActive((prev) => {
        const next = (prev + 1) % SLIDES.length;
        setAnimKey((k) => k + 1);
        return next;
      });
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={styles.sliderPanel}>
      <div className={styles.sliderBg} />
      <div className={styles.sliderBgImage} />

      {/* slideUnit key changes on every transition — mockup + caption animate together */}
      <div key={animKey} className={styles.slideUnit}>
        <DashboardMockup />
        <div className={styles.sliderCaption}>
          <h2>{SLIDES[active].title}</h2>
          <p>{SLIDES[active].subtitle}</p>
        </div>
      </div>

      {/* Dots stay outside the animated unit */}
      <div className={styles.sliderDots}>
        {SLIDES.map((_, i) => (
          <button
            key={i}
            className={`${styles.dot} ${i === active ? styles.dotActive : ''}`}
            onClick={() => goTo(i)}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
