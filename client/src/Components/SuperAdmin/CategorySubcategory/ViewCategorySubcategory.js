'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import apiServiceHandler from '../../../service/apiService';
import SuperAdminShell from '../SuperAdminShell';
import s from './CategorySubcategory.module.css';

const BackArrow = () => (
  <svg viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
  </svg>
);
const EditIcon = () => (
  <svg viewBox="0 0 20 20" fill="currentColor">
    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
  </svg>
);

function fmtDate(val) {
  if (!val) return '—';
  const d = new Date(val);
  if (isNaN(d)) return '—';
  return `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}`;
}

function Row({ label, value, full }) {
  return (
    <div className={`${s.viewRow} ${full ? s.viewFull : ''}`}>
      <div className={s.viewLabel}>{label}</div>
      {value ? <div className={s.viewValue}>{value}</div> : <div className={s.viewValueMuted}>—</div>}
    </div>
  );
}

export default function ViewCategorySubcategory() {
  const router       = useRouter();
  const { id }       = useParams();
  const searchParams = useSearchParams();
  const isSub        = searchParams.get('type') === 'sub-category';

  const [item, setItem]           = useState(null);
  const [parentName, setParentName] = useState(null);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    if (!id) return;
    const editPromise = isSub
      ? apiServiceHandler('GET', `course-subcategory/edit/${id}`)
      : apiServiceHandler('GET', `course-category/edit/${id}`);

    Promise.all([
      editPromise,
      apiServiceHandler('GET', 'course-category/list-all'),
    ])
      .then(([editRes, catRes]) => {
        const row  = editRes?.data ?? editRes;
        const cats = Array.isArray(catRes?.data) ? catRes.data : (Array.isArray(catRes) ? catRes : []);
        setItem(row);

        const parentId = isSub
          ? (row?.categoryId?._id ?? row?.categoryId ?? null)
          : (row?.parentId ?? null);

        if (parentId) {
          const parent = cats.find(c => String(c._id) === String(parentId));
          setParentName(parent?.title ?? parent?.name ?? null);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id, isSub]);

  if (loading) return <SuperAdminShell activeSection="category-subcategory"><p style={{ padding: 40, color: '#6b7280' }}>Loading…</p></SuperAdminShell>;
  if (!item?._id) return <SuperAdminShell activeSection="category-subcategory"><p style={{ padding: 40, color: '#6b7280' }}>Item not found.</p></SuperAdminShell>;

  const displayName = isSub ? (item.name ?? '') : (item.title ?? item.name ?? '');
  const description = isSub ? (item.description ?? '') : (item.desc ?? item.description ?? '');
  const typeLabel   = isSub ? 'Sub-Category' : 'Category';
  const editUrl     = isSub
    ? `/superadmin/category-subcategory/${id}/edit?type=sub-category`
    : `/superadmin/category-subcategory/${id}/edit`;

  return (
    <SuperAdminShell activeSection="category-subcategory">
      <button className={s.backBtn} onClick={() => router.push('/superadmin/category-subcategory')}>
        <BackArrow /> Back to Categories
      </button>

      <div className={s.pageHeader}>
        <div>
          <h1 className={s.pageTitle}>{displayName}</h1>
          <p className={s.pageSubtitle}>{typeLabel} details</p>
        </div>
        <button className={s.btnEditView} onClick={() => router.push(editUrl)}>
          <EditIcon /> Edit
        </button>
      </div>

      <div className={s.viewCard}>
        <div className={s.viewGrid}>
          <Row label="Name"       value={displayName} />
          <Row label="Type"       value={typeLabel} />
          <Row label="Parent"     value={parentName} />
          <Row label="Status"     value={item.status ? item.status.charAt(0).toUpperCase() + item.status.slice(1) : null} />
          <Row label="Created At" value={fmtDate(item.createdAt)} />
          <Row label="Updated At" value={fmtDate(item.updatedAt)} />
          {description && <Row label="Description" value={description} full />}
        </div>
        {item.cat_subcat_image && (
          <div style={{ marginTop: 20 }}>
            <div className={s.viewLabel}>Image</div>
            <img
              src={item.cat_subcat_image}
              alt={displayName}
              style={{ marginTop: 8, maxWidth: 200, maxHeight: 120, objectFit: 'cover', borderRadius: 6, border: '1px solid #e5e7eb' }}
            />
          </div>
        )}
      </div>
    </SuperAdminShell>
  );
}
