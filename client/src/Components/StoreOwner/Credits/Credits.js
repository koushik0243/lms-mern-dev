'use client';

import s from './Credits.module.css';

// ── Static data ──────────────────────────────────────────────────
const SNAPSHOT = [
  { label: 'Plan',             value: 'Pro',            bold: true },
  { label: 'Total learners',   value: '91 / 200' },
  { label: 'Credits remaining',value: '50',              large: true },
  { label: 'Credit cost',      value: '1 Per Learner',   bold: true },
  { label: 'After adding',     value: '49 Remaining',    bold: true },
  { label: 'Credits used',     value: '451 / 500' },
];

const HISTORY = [
  { action: '5 Learners Enrolled',    balance: 91, date: '04 Apr', credits: -5 },
  { action: '10 Learners Enrolled',   balance: 91, date: '02 Apr', credits: -10 },
  { action: 'Plan Renewal — Pro',     balance: 45, date: '01 Apr', credits: +500 },
  { action: 'Course Assigned',        balance: 91, date: '29 Mar', credits: -8 },
];

// ── Bar Track ────────────────────────────────────────────────────
function CreditBar({ label, value, max, showBubble, bubbleLabel }) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div className={s.barRow}>
      <div className={s.barLabel}>{label}</div>
      <div className={s.barTrack}>
        <div className={s.barFill} style={{ width: `${pct}%` }}>
          {showBubble && (
            <div className={s.barBubble}>{bubbleLabel ?? value}</div>
          )}
        </div>
      </div>
      <div className={s.barValue}>{value}</div>
    </div>
  );
}

export default function CreditsPage() {
  return (
    <>

      {/* ── Two-column top section ── */}
      <div className={s.topGrid}>

        {/* Left: Credit Usage */}
        <div className={s.card}>
          <div className={s.cardHeaderRow}>
            <h2 className={s.cardTitle}>Credit Usage</h2>
            <div className={s.bubbleBadge}>5</div>
          </div>

          <div className={s.barsGroup}>
            <div className={s.barsGroupLabel}>Issued This Cycle</div>
            <CreditBar label="" value={500} max={500} showBubble={false} />
          </div>

          <div className={s.barsGroup}>
            <div className={s.barsGroupLabel}>Consumed</div>
            <CreditBar label="" value={450} max={500} showBubble={false} />
          </div>

          <div className={s.barsDivider} />

          <div className={s.barsGroup}>
            <div className={s.barsGroupLabel}>Issued This Cycle</div>
            <CreditBar label="" value={50} max={500} showBubble bubbleLabel="5" />
          </div>

          <div className={s.barsGroup}>
            <div className={s.barsGroupLabel}>Consumed</div>
            <CreditBar label="" value={450} max={500} showBubble={false} />
          </div>
        </div>

        {/* Right: Store Snapshot */}
        <div className={s.card}>
          <h2 className={s.cardTitle}>Store Snapshot</h2>
          <div className={s.snapshotList}>
            {SNAPSHOT.map((row) => (
              <div key={row.label} className={s.snapshotRow}>
                <span className={s.snapshotLabel}>{row.label}</span>
                <span className={`${s.snapshotValue} ${row.large ? s.snapshotValueLarge : ''} ${row.bold ? s.snapshotValueBold : ''}`}>
                  {row.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Credit Usage History ── */}
      <div className={s.card}>
        <h2 className={s.cardTitle}>Credit Usage History</h2>
        <table className={s.historyTable}>
          <thead>
            <tr>
              <th className={s.thAction}>Action</th>
              <th className={s.thBalance}>Balance</th>
              <th className={s.thDate}>Date</th>
              <th className={s.thCredits}>Credits</th>
            </tr>
          </thead>
          <tbody>
            {HISTORY.map((row, i) => (
              <tr key={i} className={s.historyRow}>
                <td className={s.tdAction}>{row.action}</td>
                <td className={s.tdBalance}>{row.balance}</td>
                <td className={s.tdDate}>{row.date}</td>
                <td className={s.tdCredits}>
                  <span className={`${s.creditsBadge} ${row.credits > 0 ? s.creditsBadgePos : s.creditsBadgeNeg}`}>
                    {row.credits > 0 ? `+${row.credits}` : row.credits}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </>
  );
}
