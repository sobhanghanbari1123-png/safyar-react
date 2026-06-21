import { useState } from 'react';
import Layout from '../components/Layout';
import FieldError from '../components/FieldError';
import { ToastContainer, useToast } from '../components/Toast';
import Pagination, { usePagination } from '../components/Pagination';
import { JOBS, INIT_WORKERS, jobBadgeClass } from '../data/workers';

const EMPTY = { name: '', mobile: '', branch: 'شعبه مرکزی', job: 'صافکار' };

/* Shared validation for both add & edit */
function validate(form) {
  const errs = {};
  if (!form.name.trim()) errs.name = 'نام همکار را وارد کنید';
  if (!form.mobile.trim()) errs.mobile = 'شماره تماس را وارد کنید';
  else if (!/^09\d{9}$/.test(form.mobile.trim()))
    errs.mobile = 'شماره موبایل باید با ۰۹ شروع شده و ۱۱ رقم باشد';
  return errs;
}

export default function Workers() {
  const [workers, setWorkers] = useState(INIT_WORKERS);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState(null);
  const [editErrors, setEditErrors] = useState({});

  const { toasts, removeToast, success, error } = useToast();

  const set = k => e => {
    setForm({ ...form, [k]: e.target.value });
    if (errors[k]) setErrors(p => ({ ...p, [k]: undefined }));
  };
  const setEdit = k => e => {
    setEditForm({ ...editForm, [k]: e.target.value });
    if (editErrors[k]) setEditErrors(p => ({ ...p, [k]: undefined }));
  };

  const closeForm = () => { setShowForm(false); setErrors({}); };

  const handleAdd = (e) => {
    e.preventDefault();
    const errs = validate(form);
    if (Object.keys(errs).length) { setErrors(errs); error('لطفاً خطاهای فرم را برطرف کنید'); return; }
    setWorkers([...workers, { ...form, id: Date.now() }]);
    setForm(EMPTY);
    setErrors({});
    setShowForm(false);
    success('همکار با موفقیت اضافه شد ✓');
  };

  const handleDelete = (id) => {
    if (window.confirm('حذف این همکار؟')) { setWorkers(workers.filter(w => w.id !== id)); success('همکار حذف شد'); }
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    const errs = validate(editForm);
    if (Object.keys(errs).length) { setEditErrors(errs); error('لطفاً خطاهای فرم را برطرف کنید'); return; }
    setWorkers(workers.map(w => w.id === editId ? editForm : w));
    setEditId(null);
    setEditErrors({});
    success('تغییرات ذخیره شد ✓');
  };

  const pg = usePagination(workers, 10);

  const countJob = j => workers.filter(w => w.job === j).length;

  const stats = [
    { label: 'کل همکاران', value: workers.length,        icon: '🔧', color: '#3b82f6' },
    { label: 'صافکار',     value: countJob('صافکار'),    icon: '🔨', color: '#10b981' },
    { label: 'نقاش',       value: countJob('نقاش'),      icon: '🎨', color: '#8b5cf6' },
    { label: 'کاورکار',    value: countJob('کاورکار'),   icon: '🛡️', color: '#fbbf24' },
  ];

  const jobBadge = (job) => <span className={`badge ${jobBadgeClass(job)}`}>{job}</span>;

  return (
    <Layout title="مدیریت همکاران">
      <div className="stats-grid">
        {stats.map(s => (
          <div className="stat-card" key={s.label}>
            <div className="stat-icon" style={{ background: s.color + '22', color: s.color }}>{s.icon}</div>
            <div className="stat-info"><h4>{s.label}</h4><div className="stat-value">{s.value}</div></div>
          </div>
        ))}
      </div>

      <div style={{ marginBottom: 16 }}>
        <button className="btn-primary" onClick={() => (showForm ? closeForm() : setShowForm(true))}>
          {showForm ? '✕ انصراف' : '➕ ایجاد همکار جدید'}
        </button>
      </div>

      {showForm && (
        <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: 12, padding: 20, marginBottom: 20 }}>
          <form onSubmit={handleAdd} noValidate>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className={`form-group ${errors.name ? 'field-invalid' : ''}`}>
                <label>نام کامل</label>
                <input value={form.name} onChange={set('name')} placeholder="نام و نام خانوادگی" />
                <FieldError msg={errors.name} />
              </div>
              <div className={`form-group ${errors.mobile ? 'field-invalid' : ''}`}>
                <label>موبایل</label>
                <input type="tel" value={form.mobile} onChange={set('mobile')} placeholder="09xxxxxxxxx" style={{ direction: 'ltr', textAlign: 'right' }} />
                <FieldError msg={errors.mobile} />
              </div>
              <div className="form-group"><label>شعبه</label>
                <select value={form.branch} onChange={set('branch')}>
                  <option>شعبه مرکزی</option>
                  <option>شعبه مشهد</option>
                </select>
              </div>
              <div className="form-group"><label>نوع شغل</label>
                <select value={form.job} onChange={set('job')}>
                  {JOBS.map(j => <option key={j}>{j}</option>)}
                </select>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button type="submit" className="btn-primary">ذخیره</button>
              <button type="button" className="btn-secondary" onClick={closeForm}>انصراف</button>
            </div>
          </form>
        </div>
      )}

      <div style={{ background: 'var(--card-bg)', borderRadius: 12, border: '1px solid var(--border)', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr><th>نام</th><th>موبایل</th><th>شعبه</th><th>شغل</th><th>عملیات</th></tr>
            </thead>
            <tbody>
              {pg.pageItems.map(w => (
                <tr key={w.id}>
                  <td>{w.name}</td>
                  <td style={{ direction: 'ltr', textAlign: 'right' }}>{w.mobile}</td>
                  <td>{w.branch}</td>
                  <td>{jobBadge(w.job)}</td>
                  <td>
                    <button className="action-btn action-btn-edit" onClick={() => { setEditId(w.id); setEditForm({ ...w }); setEditErrors({}); }}>✏️</button>
                    <button className="action-btn action-btn-delete" onClick={() => handleDelete(w.id)}>🗑️</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Pagination
        page={pg.page} totalPages={pg.totalPages} onChange={pg.setPage}
        shown={pg.pageItems.length} total={pg.total} noun="همکار" />

      {editId && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setEditId(null)}>
          <div className="modal-box">
            <div className="modal-header">
              <h3>ویرایش همکار</h3>
              <button className="modal-close" onClick={() => setEditId(null)}>✕</button>
            </div>
            <form onSubmit={handleSaveEdit} noValidate>
              <div className={`form-group ${editErrors.name ? 'field-invalid' : ''}`}>
                <label>نام کامل</label>
                <input value={editForm.name} onChange={setEdit('name')} />
                <FieldError msg={editErrors.name} />
              </div>
              <div className={`form-group ${editErrors.mobile ? 'field-invalid' : ''}`}>
                <label>موبایل</label>
                <input value={editForm.mobile} onChange={setEdit('mobile')} style={{ direction: 'ltr', textAlign: 'right' }} />
                <FieldError msg={editErrors.mobile} />
              </div>
              <div className="form-group"><label>شعبه</label>
                <select value={editForm.branch} onChange={setEdit('branch')}>
                  <option>شعبه مرکزی</option>
                  <option>شعبه مشهد</option>
                </select>
              </div>
              <div className="form-group"><label>شغل</label>
                <select value={editForm.job} onChange={setEdit('job')}>
                  {JOBS.map(j => <option key={j}>{j}</option>)}
                </select>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="submit" className="btn-primary">ذخیره</button>
                <button type="button" className="btn-secondary" onClick={() => setEditId(null)}>انصراف</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </Layout>
  );
}
