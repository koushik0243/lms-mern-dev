'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import apiServiceHandler from '../../../service/apiService';
import SuperAdminShell from '../SuperAdminShell';
import s from './AddEditCertificateTemplate.module.css';

const CertIcon = (
  <svg viewBox="0 0 20 20" fill="currentColor">
    <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
    <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
  </svg>
);

const BackArrow = (
  <svg viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
  </svg>
);

export default function AddCertificateTemplate() {
  const router = useRouter();

  const [title, setTitle]           = useState('');
  const [desc, setDesc]             = useState('');
  const [errors, setErrors]         = useState({});
  const [submitting, setSubmitting] = useState(false);

  function validate() {
    const e = {};
    if (!title.trim()) e.title = 'Title is required.';
    if (!desc.trim())  e.desc  = 'Template HTML is required.';
    return e;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const e2 = validate();
    if (Object.keys(e2).length) { setErrors(e2); return; }
    setErrors({});
    setSubmitting(true);
    try {
      await apiServiceHandler('POST', 'certificate-template/create', { title: title.trim(), desc: desc.trim() });
      toast.success('Certificate template created successfully.');
      router.push('/superadmin/certificate-template');
    } catch {
      toast.error('Failed to create certificate template. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <SuperAdminShell activeSection="certificate-template">
      <div>
        <button className={s.backBtn} onClick={() => router.push('/superadmin/certificate-template')}>
          {BackArrow} Back to Certificate Templates
        </button>
      </div>
      <div>
        <h1 className={s.pageTitle}>Add Certificate Template</h1>
        <p className={s.pageSubtitle}>Create a new certificate template</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className={s.card}>
          <div className={s.cardHeader}>{CertIcon} Template Information</div>
          <div className={s.cardBody}>
            <div className={s.formGrid}>
              <div className={s.formGroup}>
                <label className={s.label}>Title <span className={s.required}>*</span></label>
                <input
                  className={s.input}
                  type="text"
                  placeholder="Enter certificate template title"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                />
                {errors.title && <span className={s.errorMsg}>{errors.title}</span>}
              </div>
              <div className={s.formGroup}>
                <label className={s.label}>Template HTML <span className={s.required}>*</span></label>
                <textarea
                  className={s.textarea}
                  placeholder="Paste or write the HTML template here..."
                  value={desc}
                  onChange={e => setDesc(e.target.value)}
                />
                {errors.desc && <span className={s.errorMsg}>{errors.desc}</span>}
                <div className={s.templateVars}>
                  <span>Name: <code>{'{{name}}'}</code></span>
                  <span>Course Name: <code>{'{{course}}'}</code></span>
                  <span>Marks: <code>{'{{marks}}'}</code></span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className={s.actions}>
          <button type="submit" className={s.btnSubmit} disabled={submitting}>
            {submitting ? 'Creating…' : 'Create Template'}
          </button>
          <button type="button" className={s.btnCancel} onClick={() => router.push('/superadmin/certificate-template')}>
            Cancel
          </button>
        </div>
      </form>
    </SuperAdminShell>
  );
}
