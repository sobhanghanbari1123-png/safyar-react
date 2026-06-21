import { useState } from 'react';
import Layout from '../components/Layout';
import Pagination, { usePagination } from '../components/Pagination';
import FieldError from '../components/FieldError';
import { ToastContainer, useToast } from '../components/Toast';

const INIT = [
  { id: 1, name: 'شعبه مرکزی', address: 'تهران، خیابان ولیعصر', mobile: '02112345678', rank: 1, prefix: 'TH' },
  { id: 2, name: 'شعبه مشهد', address: 'مشهد، خیابان احمدآباد', mobile: '05138765432', rank: 2, prefix: 'MS' },
];

const EMPTY = { name: '', address: '', mobile: '', rank: '', prefix: '' };

export default function Branches() {
  const { toasts, removeToast, success, error } = useToast();
  const [branches, setBranches] = useState(INIT);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [formErrors, setFormErrors] = useState({});
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState(null);
  const [editErrors, setEditErrors] = useState({});

  const pg = usePagination(branches, 10);

  const set = k => e => {
    setForm({ ...form, [k]: e.target.value });
    if (formErrors[k]) setFormErrors(p => ({ ...p, [k]: undefined }));
  };
  const setEdit = k => e => {
    setEditForm({ ...editForm, [k]: e.target.value });
    if (editErrors[k]) setEditErrors(p => ({ ...p, [k]: undefined }));
  };

  const validate = (f) => {
    const errs = {};
    if (!f.name.trim())   errs.name   = 'نام شعبه را وارد کنید';
    if (!f.mobile.trim()) errs.mobile = 'شماره موبایل را وارد کنید';
    if (!f.address.trim()) errs.address = 'آدرس را وارد کنید';
    if (!String(f.prefix).trim()) errs.prefix = 'سرشماره کد پیگیری را وارد کنید';
    return errs;
  };

  const handleAdd = (e) => {
    e.preventDefault();
    const errs = validate(form);
    if (Object.keys(errs).length) {
      setFormErrors(errs);
      error('لطفاً خطاهای فرم را برطرف کنید');
      return;
    }
    setBranches([...branches, { ...form, id: Date.now() }]);
    setForm(EMPTY);
    setFormErrors({});
    setShowForm(false);
    success('شعبه با موفقیت اضافه شد ✓');
  };

  const handleEdit = (b) => { setEditId(b.id); setEditForm({ ...b }); setEditErrors({}); };
  const handleSaveEdit = (e) => {
    e.preventDefault();
    const errs = validate(editForm);
    if (Object.keys(errs).length) {
      setEditErrors(errs);
      error('لطفاً خطاهای فرم را برطرف کنید');
      return;
    }
    setBranches(branches.map(b => b.id === editId ? editForm : b));
    setEditId(null);
    success('شعبه ویرایش شد ✓');
  };
  const handleDelete = (id) => {
    if (window.confirm('آیا از حذف این شعبه مطمئن هستید؟'))
      setBranches(branches.filter(b => b.id !== id));
  };

  const stats = [
    { label: 'کل شعبه‌ها', value: branches.length, icon: '🏢', color: '#3b82f6' },
    { label: 'شعبه فعال', value: branches.length, icon: '✅', color: '#10b981' },
    { label: 'پذیرش امروز', value: 5, icon: '🚗', color: '#fbbf24' },
  ];

  return (
    <Layout title="مدیریت شعبه‌ها">
      <div className="stats-grid stats-grid-3">
        {stats.map(s => (
          <div className="stat-card" key={s.label}>
            <div className="stat-icon" style={{ background: s.color + '22', color: s.color }}>{s.icon}</div>
            <div className="stat-info"><h4>{s.label}</h4><div className="stat-value">{s.value}</div></div>
          </div>
        ))}
      </div>

      <div style={{ marginBottom: 16 }}>
        <button className="btn-primary" onClick={() => { setShowForm(!showForm); setFormErrors({}); }}>
          {showForm ? '✕ انصراف' : '➕ ایجاد شعبه جدید'}
        </button>
      </div>

      {showForm && (
        <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: 12, padding: 20, marginBottom: 20 }}>
          <h3 style={{ margin: '0 0 16px', fontSize: 16 }}>شعبه جدید</h3>
          <form onSubmit={handleAdd}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className={`form-group ${formErrors.name ? 'field-invalid' : ''}`}>
                <label>نام شعبه <span className="req">*</span></label>
                <input type="text" value={form.name} onChange={set('name')} />
                <FieldError msg={formErrors.name} />
              </div>
              <div className={`form-group ${formErrors.mobile ? 'field-invalid' : ''}`}>
                <label>موبایل <span className="req">*</span></label>
                <input type="tel" value={form.mobile} onChange={set('mobile')} />
                <FieldError msg={formErrors.mobile} />
              </div>
              <div className={`form-group ${formErrors.address ? 'field-invalid' : ''}`}>
                <label>آدرس <span className="req">*</span></label>
                <input type="text" value={form.address} onChange={set('address')} />
                <FieldError msg={formErrors.address} />
              </div>
              <div className="form-group"><label>رتبه</label><input type="number" value={form.rank} onChange={set('rank')} /></div>
              <div className={`form-group ${formErrors.prefix ? 'field-invalid' : ''}`}>
                <label>سرشماره کد پیگیری <span className="req">*</span></label>
                <input type="text" value={form.prefix} onChange={set('prefix')} />
                <FieldError msg={formErrors.prefix} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button type="submit" className="btn-primary">ذخیره</button>
              <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>انصراف</button>
            </div>
          </form>
        </div>
      )}

      <div style={{ background: 'var(--card-bg)', borderRadius: 12, border: '1px solid var(--border)', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>نام شعبه</th><th>آدرس</th><th>موبایل</th><th>رتبه</th><th>سرشماره</th><th>عملیات</th>
              </tr>
            </thead>
            <tbody>
              {pg.pageItems.map(b => (
                <tr key={b.id}>
                  <td>{b.name}</td><td>{b.address}</td><td>{b.mobile}</td>
                  <td>{b.rank}</td><td>{b.prefix}</td>
                  <td>
                    <button className="action-btn action-btn-edit" onClick={() => handleEdit(b)}>✏️</button>
                    <button className="action-btn action-btn-delete" onClick={() => handleDelete(b.id)}>🗑️</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Pagination
        page={pg.page} totalPages={pg.totalPages} onChange={pg.setPage}
        shown={pg.pageItems.length} total={pg.total} noun="شعبه" />

      {editId && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setEditId(null)}>
          <div className="modal-box">
            <div className="modal-header">
              <h3>ویرایش شعبه</h3>
              <button className="modal-close" onClick={() => setEditId(null)}>✕</button>
            </div>
            <form onSubmit={handleSaveEdit}>
              <div className={`form-group ${editErrors.name ? 'field-invalid' : ''}`}>
                <label>نام شعبه <span className="req">*</span></label>
                <input value={editForm.name} onChange={setEdit('name')} />
                <FieldError msg={editErrors.name} />
              </div>
              <div className={`form-group ${editErrors.address ? 'field-invalid' : ''}`}>
                <label>آدرس <span className="req">*</span></label>
                <input value={editForm.address} onChange={setEdit('address')} />
                <FieldError msg={editErrors.address} />
              </div>
              <div className={`form-group ${editErrors.mobile ? 'field-invalid' : ''}`}>
                <label>موبایل <span className="req">*</span></label>
                <input value={editForm.mobile} onChange={setEdit('mobile')} />
                <FieldError msg={editErrors.mobile} />
              </div>
              <div className="form-group"><label>رتبه</label><input type="number" value={editForm.rank} onChange={setEdit('rank')} /></div>
              <div className={`form-group ${editErrors.prefix ? 'field-invalid' : ''}`}>
                <label>سرشماره کد پیگیری <span className="req">*</span></label>
                <input value={editForm.prefix} onChange={setEdit('prefix')} />
                <FieldError msg={editErrors.prefix} />
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
