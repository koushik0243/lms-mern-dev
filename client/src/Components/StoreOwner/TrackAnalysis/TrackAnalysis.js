'use client';

import s from './TrackAnalysis.module.css';

// ── Static data ───────────────────────────────────────────────────
const FAILURE_CHAPTERS = [
  { label: 'Safety · Ch.3',    pct: 62 },
  { label: 'Ethics · Ch.2',    pct: 49 },
  { label: 'Leadership · Ch.1',pct: 38 },
  { label: 'QC · Ch.2',        pct: 22 },
  { label: 'Safety · Ch.1',    pct: 11 },
];

// Avatar background colours for the learner list
const AVATAR_COLORS = ['#d4897a', '#e5a97b', '#c8956a', '#b8856a', '#d4897a', '#e5a97b', '#c8956a', '#a07866'];

const LEARNERS = Array.from({ length: 8 }, (_, i) => ({
  id: i,
  name: 'Anita S.',
  sub: 'Safety · Ch.3',
  courses: '4/6',
  duration: 'Avg. Watch Time: 6m',
  color: AVATAR_COLORS[i % AVATAR_COLORS.length],
  isMale: i === 7,
}));

const VIDEO_ITEMS = [
  { title: 'Safety · Ch.3 · PPE Usage',    sub: 'Watched (time-based)', progress: 79, score: '72/91', watch: '6m', days: '22s / 8m' },
  { title: 'Ethics · Ch.2 · Case Studies', sub: 'Watched (time-based)', progress: 91, score: '41/45', watch: '11m', days: '04s / 12m' },
  { title: 'QC · Ch.3 · Reporting',        sub: 'Watched (time-based)', progress: 34, score: '31/91', watch: '3m',  days: '11s / 8m' },
  { title: 'Safety · Ch.3 · PPE Usage',    sub: 'Watched (time-based)', progress: 79, score: '72/91', watch: '5m',  days: '22s / 8m' },
];

const chevronDownIcon = <svg viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>;

// ── Circular progress ring ─────────────────────────────────────
function Ring({ pct }) {
  const r = 28;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <svg className={s.ring} viewBox="0 0 70 70">
      <circle cx="35" cy="35" r={r} fill="none" stroke="#e8edf0" strokeWidth="5" />
      <circle
        cx="35" cy="35" r={r} fill="none"
        stroke="#0b7b7b" strokeWidth="5"
        strokeDasharray={`${dash} ${circ}`}
        strokeLinecap="round"
        transform="rotate(-90 35 35)"
      />
      <text x="35" y="40" textAnchor="middle" fontSize="13" fontWeight="700" fill="#1a2b2b">{pct}%</text>
    </svg>
  );
}

// ── Avatar placeholder ─────────────────────────────────────────
function Avatar({ color, isMale }) {
  return (
    <svg className={s.avatar} viewBox="0 0 40 40">
      <circle cx="20" cy="20" r="20" fill={color} />
      {isMale ? (
        <>
          <circle cx="20" cy="15" r="6" fill="rgba(255,255,255,0.7)" />
          <ellipse cx="20" cy="32" rx="9" ry="6" fill="rgba(255,255,255,0.7)" />
        </>
      ) : (
        <>
          <circle cx="20" cy="15" r="6" fill="rgba(255,255,255,0.7)" />
          <ellipse cx="20" cy="32" rx="9" ry="6" fill="rgba(255,255,255,0.7)" />
          <path d="M14 15 Q20 8 26 15" fill="rgba(255,255,255,0.4)" />
        </>
      )}
    </svg>
  );
}

export default function TrackAnalysisPage() {
  return (
    <>

      {/* ── Chapter-wise failure analysis ── */}
      <div className={s.card}>
        <h2 className={s.cardTitle}>Chapter-wise failure analysis</h2>
        <div className={s.ringRow}>
          {FAILURE_CHAPTERS.map(ch => (
            <div key={ch.label} className={s.ringItem}>
              <div className={s.ringLabel}>{ch.label}</div>
              <Ring pct={ch.pct} />
            </div>
          ))}
        </div>
      </div>

      {/* ── Bottom two-column grid ── */}
      <div className={s.bottomGrid}>

        {/* Left: Learner progress detail */}
        <div className={s.card}>
          <h3 className={s.cardTitle}>Learner progress detail</h3>
          <div className={s.learnerList}>
            {LEARNERS.map(l => (
              <div key={l.id} className={s.learnerRow}>
                <Avatar color={l.color} isMale={l.isMale} />
                <div className={s.learnerInfo}>
                  <div className={s.learnerName}>{l.name}</div>
                  <div className={s.learnerSub}>{l.sub}</div>
                </div>
                <div className={s.learnerStats}>
                  <div className={s.statLabel}>COURSES</div>
                  <div className={s.statVal}>{l.courses}</div>
                </div>
                <div className={s.learnerStats}>
                  <div className={s.statLabel}>DURATION</div>
                  <div className={s.statVal}>{l.duration}</div>
                </div>
                <button className={s.btnView}>View Details</button>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Video completion tracking */}
        <div className={`${s.card} ${s.videoCard}`}>
          <h3 className={s.cardTitle}>Video completion tracking</h3>

          <div className={s.selectWrap}>
            <select className={s.select} defaultValue="">
              <option value="" disabled>Select Course</option>
            </select>
            <span className={s.chevron}>{chevronDownIcon}</span>
          </div>

          <div className={s.videoList}>
            {VIDEO_ITEMS.map((v, i) => (
              <div key={i} className={s.videoItem}>
                <div className={s.videoTitle}>{v.title}</div>
                <div className={s.videoSub}>{v.sub}</div>
                <div className={s.videoProgressRow}>
                  <div className={s.videoTrack}>
                    <div className={s.videoFill} style={{ width: `${v.progress}%` }} />
                  </div>
                  <span className={s.videoScore}>{v.score}</span>
                </div>
                <div className={s.videoMeta}>
                  Avg. watch time: {v.watch}&nbsp;&nbsp;{v.days}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </>
  );
}
