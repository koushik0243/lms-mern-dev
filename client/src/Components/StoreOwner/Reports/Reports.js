'use client';

import s from './Reports.module.css';

const REPORTS = [
  {
    num: '01',
    title: 'Course Completion Report',
    sub: 'All Learners · Completion % Per Course',
  },
  {
    num: '02',
    title: 'Top / Bottom Performers',
    sub: 'Ranked By Quiz Score',
  },
  {
    num: '03',
    title: 'Chapter Failure Analysis',
    sub: 'Retry Rates · Mandatory Rewatches',
  },
  {
    num: '04',
    title: 'Zoom Attendance Log',
    sub: 'Session-Wise Attendance Records',
  },
  {
    num: '05',
    title: 'Certificate Issuance Log',
    sub: 'Who Earned What · When',
  },
];

export default function ReportsPage() {
  return (
    <>
      <div className={s.card}>
        <h2 className={s.cardTitle}>Export Reports</h2>

        <div className={s.reportList}>
          {REPORTS.map((r, i) => (
            <div key={r.num} className={`${s.reportRow} ${i < REPORTS.length - 1 ? s.reportRowBorder : ''}`}>
              <div className={s.reportLeft}>
                <span className={s.reportNum}>{r.num}</span>
                <div>
                  <div className={s.reportTitle}>{r.title}</div>
                  <div className={s.reportSub}>{r.sub}</div>
                </div>
              </div>
              <div className={s.reportActions}>
                <button className={s.btnCsv}>CSV</button>
                <button className={s.btnPdf}>PDF</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
