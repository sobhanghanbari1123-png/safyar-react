import { useState } from 'react';
import Layout from '../components/Layout';
import FieldError from '../components/FieldError';
import { ToastContainer, useToast } from '../components/Toast';
import Pagination, { usePagination } from '../components/Pagination';
import { loadRegisteredUsers, getCurrentRole, loadShopUsers, saveShopUsers } from '../data/admin';

const ROLES = ['ادمین', 'کاربر عادی'];

const ROLE_META = {
  'مالک':       { color: '#f59e0b', bg: 'rgba(245,158,11,.13)', icon: '🔑' },
  'ادمین':      { color: '#8b5cf6', bg: 'rgba(139,92,246,.13)', icon: '👑' },
  'کاربر عادی': { color: '#3b82f6', bg: 'rgba(59,130,246,.13)', icon: '👤' },
};

const EMPTY = { name: '', national: '', mobile: '', branch: 'شعبه مرکزی', role: 'کاربر عادی', password: '' };

function getOwner() {
  const national = localStorage.getItem('current_user');
  if (!national) return null;
  const regs = loadRegisteredUsers();
  const u = regs.find(r => r.national === national && r.status === 'approved');
  if (!u) return null;
  return { id: 0, name: u.name, national: u.national, mobile: u.mobile, branch: u.branch || 'شعبه مرکزی', role: 'مالک', isOwner: true };
}

function validate(form, users, currentId) {
  const errs = {};
  if (!form.name.trim()) errs.name = 'نام کامل را وارد کنید';
  if (!form.national.trim()) errs.national = 'کد ملی را وارد کنید';
  else if (!/^\d{10}$/.test(form.national.trim())) errs.national = 'کد ملی باید ۱۰ رقم باشد';
  else if (users.some(u => u.national === form.national.trim() && u.id !== currentId))
    errs.national = 'این کد ملی قبلاً ثبت شده است';
  if (!form.mobile.trim()) errs.mobile = 'شماره موبایل را وارد کنید';
  else if (!/^09\d{9}$/.test(form.mobile.trim())) errs.mobile = 'شماره موبایل باید با ۰۹ شروع شده و ۱۱ رقم باشد';
  return errs;
}

export default function Users() {
  const [users, setUsers] = useState(loadShopUsers);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState(null);
  const [editErrors, setEditErrors] = useState({});

  const { toasts, removeToast, success, error } = useToast();

  const currentRole = getCurrentRole();
  const owner = getOwner();

  /* owner row + added users combined for duplicate-check */
  const allForValidation = owner ? [owner, ...users] : users;

  const filtered = users.filter(u => {
    if (!search) return true;
    return u.name.includes(search) || u.mobile.includes(search) || u.national.includes(search) || String(u.id).includes(search);
  });

  const pg = usePagination(filtered, 10, search);

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
    const errs = validate(form, allForValidation, null);
    if (!form.password)                errs.password = 'رمز عبور را وارد کنید';
    else if (form.password.length < 6) errs.password = 'رمز عبور باید حداقل ۶ کاراکتر باشد';
    if (Object.keys(errs).length) { setErrors(errs); error('لطفاً خطاهای فرم را برطرف کنید'); return; }
    const nextId = users.length ? Math.max(...users.map(u => u.id)) + 1 : 1;
    const next = [...users, { id: nextId, name: form.name, national: form.national, mobile: form.mobile, branch: form.branch, role: form.role }];
    setUsers(next);
    saveShopUsers(next);
    setForm(EMPTY);
    setErrors({});
    setShowForm(false);
    success('کاربر با موفقیت اضافه شد ✓');
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    const errs = validate(editForm, allForValidation, editId);
    if (Object.keys(errs).length) { setEditErrors(errs); error('لطفاً خطاهای فرم را برطرف کنید'); return; }
    const next = users.map(u => u.id === editId ? { ...editForm } : u);
    setUsers(next);
    saveShopUsers(next);
    setEditId(null);
    setEditErrors({});
    success('تغییرات ذخیره شد ✓');
  };

  const handleDelete = (id) => {
    if (window.confirm('حذف این کاربر؟')) {
      const next = users.filter(u => u.id !== id);
      setUsers(next);
      saveShopUsers(next);
      success('کاربر حذف شد');
    }
  };

  const totalAll = users.length + (owner ? 1 : 0);
  const adminCount = users.filter(u => u.role === 'ادمین').length + (owner ? 1 : 0);

  const stats = [
    { label: 'کل کاربران',  value: totalAll,                    icon: '👤', color: '#3b82f6' },
    { label: 'ادمین‌ها',    value: adminCount,                  icon: '👑', color: '#8b5cf6' },
    { label: 'کاربر عادی', value: users.filter(u => u.role === 'کاربر عادی').length, icon: '🙋', color: '#10b981' },
    { label: 'شعبه‌ها',    value: 2,                            icon: '🏢', color: '#fbbf24' },
  ];

  function RoleBadge({ role }) {
    const m = ROLE_META[role] || ROLE_META['کاربر عادی'];
    return (
      <span style={{ background: m.bg, color: m.color, border: `1px solid ${m.color}44`, borderRadius: 20, padding: '3px 10px', fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap' }}>
        {m.icon} {role}
      </span>
    );
  }

  return (
    <Layout title="مدیریت کاربران">
      <div className="stats-grid">
        {stats.map(s => (
          <div className="stat-card" key={s.label}>
            <div className="stat-icon" style={{ background: s.color + '22', color: s.color }}>{s.icon}</div>
            <div className="stat-info"><h4>{s.label}</h4><div className="stat-value">{s.value}</div></div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="جستجو با نام، موبایل، کد ملی یا شناسه..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ flex: 1, minWidth: 200, maxWidth: 400, padding: '10px 14px', border: '1px solid var(--input-border)', borderRadius: 8, background: 'var(--input-bg)', color: 'var(--text)', fontFamily: 'inherit', fontSize: 14 }}
        />
        <button className="btn-primary" onClick={() => (showForm ? closeForm() : setShowForm(true))}>
          {showForm ? '✕ انصراف' : '➕ افزودن کاربر'}
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
              <div className={`form-group ${errors.national ? 'field-invalid' : ''}`}>
                <label>کد ملی</label>
                <input value={form.national} onChange={set('national')} maxLength={10} placeholder="کد ملی ۱۰ رقمی" style={{ direction: 'ltr', textAlign: 'right' }} />
                <FieldError msg={errors.national} />
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
              <div className="form-group"><label>نقش کاربری</label>
                <select value={form.role} onChange={set('role')}>
                  {ROLES.map(r => <option key={r}>{r}</option>)}
                </select>
              </div>
              <div className={`form-group ${errors.password ? 'field-invalid' : ''}`}>
                <label>رمز عبور</label>
                <input type="password" value={form.password} onChange={set('password')} placeholder="حداقل ۶ کاراکتر" />
                <FieldError msg={errors.password} />
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
              <tr><th>نام کامل</th><th>کد ملی</th><th>موبایل</th><th>شعبه</th><th>نقش</th><th>عملیات</th></tr>
            </thead>
            <tbody>
              {/* Owner row — always first, always protected */}
              {owner && (
                <tr style={{ background: 'rgba(245,158,11,.05)' }}>
                  <td>
                    {owner.name}
                    <span style={{ marginRight: 6, fontSize: 11, color: 'var(--text-muted)' }}>(شما)</span>
                  </td>
                  <td style={{ direction: 'ltr', textAlign: 'right' }}>{owner.national}</td>
                  <td style={{ direction: 'ltr', textAlign: 'right' }}>{owner.mobile}</td>
                  <td>{owner.branch}</td>
                  <td><RoleBadge role="مالک" /></td>
                  <td>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)', padding: '4px 8px' }}>🔒 محافظت‌شده</span>
                  </td>
                </tr>
              )}
              {pg.pageItems.map(u => {
                const isOwnerRow = owner && u.national === owner.national;
                const canEdit = currentRole === 'مالک' || (currentRole === 'ادمین' && u.role === 'کاربر عادی');
                return (
                  <tr key={u.id}>
                    <td>{u.name}</td>
                    <td style={{ direction: 'ltr', textAlign: 'right' }}>{u.national}</td>
                    <td style={{ direction: 'ltr', textAlign: 'right' }}>{u.mobile}</td>
                    <td>{u.branch}</td>
                    <td><RoleBadge role={u.role} /></td>
                    <td>
                      {canEdit && !isOwnerRow ? (
                        <>
                          <button className="action-btn action-btn-edit" onClick={() => { setEditId(u.id); setEditForm({ ...u, newPass: '' }); setEditErrors({}); }}>✏️</button>
                          <button className="action-btn action-btn-delete" onClick={() => handleDelete(u.id)}>🗑️</button>
                        </>
                      ) : (
                        <span style={{ fontSize: 12, color: 'var(--text-muted)', padding: '4px 8px' }}>—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <Pagination
        page={pg.page} totalPages={pg.totalPages} onChange={pg.setPage}
        shown={pg.pageItems.length} total={pg.total} noun="کاربر" />

      {editId && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setEditId(null)}>
          <div className="modal-box">
            <div className="modal-header">
              <h3>ویرایش کاربر</h3>
              <button className="modal-close" onClick={() => setEditId(null)}>✕</button>
            </div>
            <form onSubmit={handleSaveEdit} noValidate>
              <div className={`form-group ${editErrors.name ? 'field-invalid' : ''}`}>
                <label>نام کامل</label>
                <input value={editForm.name} onChange={setEdit('name')} />
                <FieldError msg={editErrors.name} />
              </div>
              <div className={`form-group ${editErrors.national ? 'field-invalid' : ''}`}>
                <label>کد ملی</label>
                <input value={editForm.national} onChange={setEdit('national')} maxLength={10} style={{ direction: 'ltr', textAlign: 'right' }} />
                <FieldError msg={editErrors.national} />
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
              {/* ادمین نمی‌تونه نقش ادمین دیگه رو تغییر بده */}
              {currentRole === 'مالک' && (
                <div className="form-group"><label>نقش کاربری</label>
                  <select value={editForm.role || 'کاربر عادی'} onChange={setEdit('role')}>
                    {ROLES.map(r => <option key={r}>{r}</option>)}
                  </select>
                </div>
              )}
              <div className="form-group"><label>رمز عبور جدید (اختیاری)</label>
                <input type="password" placeholder="برای تغییر وارد کنید" value={editForm.newPass || ''} onChange={setEdit('newPass')} />
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
