import { useState } from 'react';
import Layout from '../components/Layout';
import { ToastContainer, useToast } from '../components/Toast';
import FieldError from '../components/FieldError';
import { exportCustomersExcel } from '../utils/exportExcel';
import Pagination, { usePagination } from '../components/Pagination';
import './Dashboard.css';

const INIT = [
  { id: 1, name: 'علی احمدی',  mobile: '09121234567', address: 'تهران، خیابان ولیعصر' },
  { id: 2, name: 'مریم رضایی', mobile: '09351234567', address: 'مشهد، خیابان احمدآباد' },
  { id: 3, name: 'حسن کریمی',  mobile: '09181234567', address: 'اصفهان، خیابان چهارباغ' },
];

const EMPTY = { name: '', mobile: '', address: '', gender: '' };

const SMS_TEMPLATES = [
  'تعمیرگاه صافیار — با تشکر از انتخاب شما. خدمات با کیفیت همواره در کنارتان هستیم.',
  'مشتری گرامی، خدمات دوره‌ای خودروی شما فرا رسیده است. جهت رزرو وقت تماس بگیرید.',
  'تعمیرگاه صافیار در تعطیلات نوروز تا تاریخ ۱۵ فروردین تعطیل می‌باشد. از صبر شما سپاسگزاریم.',
  'مشتری گرامی، به مناسبت فرا رسیدن تابستان، تعمیرگاه صافیار تخفیف ویژه اعمال می‌کند.',
];

export default function Customers() {
  const [customers, setCustomers] = useState(INIT);
  const [search,    setSearch]    = useState('');
  const [showForm,  setShowForm]  = useState(false);
  const [form,      setForm]      = useState(EMPTY);
  const [editId,    setEditId]    = useState(null);
  const [editForm,  setEditForm]  = useState(null);
  const [smsModal,      setSmsModal]      = useState(null); // single customer
  const [bulkSmsOpen,   setBulkSmsOpen]   = useState(false);
  const [smsText,       setSmsText]       = useState('');
  const [bulkSmsText,   setBulkSmsText]   = useState('');
  const [errors,        setErrors]        = useState({});

  const { toasts, removeToast, success, error } = useToast();

  const filtered = customers.filter(c =>
    !search ||
    c.name.includes(search) ||
    c.mobile.includes(search)
  );

  const pg = usePagination(filtered, 10, search);

  const set = k => e => {
    setForm({ ...form, [k]: e.target.value });
    if (errors[k]) setErrors(prev => ({ ...prev, [k]: undefined }));
  };
  const setEdit = k => e => setEditForm({ ...editForm, [k]: e.target.value });

  /* ── Validation ── */
  const validateForm = () => {
    const errs = {};
    if (!form.name.trim())            errs.name   = 'نام و نام خانوادگی را وارد کنید';
    if (!form.mobile.trim())          errs.mobile = 'شماره موبایل را وارد کنید';
    else if (!/^09\d{9}$/.test(form.mobile.trim()))
                                      errs.mobile = 'شماره موبایل باید با ۰۹ شروع شده و ۱۱ رقم باشد';
    else if (customers.some(c => c.mobile === form.mobile.trim()))
                                      errs.mobile = 'این شماره موبایل قبلاً ثبت شده است';
    return errs;
  };

  const handleAdd = (e) => {
    e.preventDefault();
    const errs = validateForm();
    if (Object.keys(errs).length) {
      setErrors(errs);
      error('لطفاً خطاهای فرم را برطرف کنید');
      return;
    }
    setCustomers([...customers, { ...form, id: Date.now() }]);
    setForm(EMPTY);
    setErrors({});
    setShowForm(false);
    success('مشتری با موفقیت اضافه شد ✓');
  };

  const handleExport = () => {
    if (customers.length === 0) { error('مشتری‌ای برای دانلود وجود ندارد'); return; }
    exportCustomersExcel(customers);
    success(`فایل اکسل ${customers.length} مشتری دانلود شد ✓`);
  };

  const handleDelete = (id) => {
    if (window.confirm('حذف این مشتری؟')) {
      setCustomers(customers.filter(c => c.id !== id));
      success('مشتری حذف شد');
    }
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    setCustomers(customers.map(c => c.id === editId ? editForm : c));
    setEditId(null);
    success('تغییرات ذخیره شد ✓');
  };

  const openSms = (c) => { setSmsModal(c); setSmsText(''); };
  const sendSms = () => {
    if (!smsText.trim()) { error('متن پیامک را وارد کنید'); return; }
    success(`پیامک به ${smsModal.mobile} ارسال شد ✓`);
    setSmsModal(null); setSmsText('');
  };

  const sendBulkSms = () => {
    if (!bulkSmsText.trim()) { error('متن پیامک را وارد کنید'); return; }
    success(`پیامک به ${customers.length} مشتری ارسال شد ✓`);
    setBulkSmsOpen(false); setBulkSmsText('');
  };

  const stats = [
    { label: 'کل مشتریان', value: customers.length, icon: '👥', color: '#3b82f6' },
    { label: 'مشتری فعال', value: customers.length, icon: '✅', color: '#10b981' },
    { label: 'پذیرش امروز', value: 2,              icon: '🚗', color: '#fbbf24' },
  ];

  return (
    <Layout title="مدیریت مشتریان">

      {/* Stats */}
      <div className="stats-grid stats-grid-3">
        {stats.map(s => (
          <div className="stat-card" key={s.label}>
            <div className="stat-icon" style={{ background: s.color + '22', color: s.color }}>{s.icon}</div>
            <div className="stat-info"><h4>{s.label}</h4><div className="stat-value">{s.value}</div></div>
          </div>
        ))}
      </div>

      {/* Search + Add */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 180, position: 'relative' }}>
          <input
            type="text"
            placeholder="جستجو با نام یا موبایل..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--input-border)', borderRadius: 8, background: 'var(--input-bg)', color: 'var(--text)', fontFamily: 'inherit', fontSize: 14 }}
          />
        </div>
        <button className="btn-primary" onClick={() => { setShowForm(!showForm); setErrors({}); }}>
          {showForm ? '✕ انصراف' : '➕ افزودن مشتری'}
        </button>
        <button className="btn-bulk-sms" onClick={() => { setBulkSmsOpen(true); setBulkSmsText(''); }}>
          📢 پیامک همگانی
        </button>
        <button className="btn-export-excel" onClick={handleExport} title="دانلود نام و شماره همه مشتریان">
          📥 دانلود اکسل
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: 12, padding: 20, marginBottom: 20 }}>
          <form onSubmit={handleAdd} noValidate>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className={`form-group ${errors.name ? 'field-invalid' : ''}`}>
                <label>نام و نام خانوادگی</label>
                <input value={form.name} onChange={set('name')} placeholder="مثلاً علی احمدی" />
                <FieldError msg={errors.name} />
              </div>
              <div className={`form-group ${errors.mobile ? 'field-invalid' : ''}`}>
                <label>موبایل</label>
                <input type="tel" value={form.mobile} onChange={set('mobile')} placeholder="09xxxxxxxxx" style={{ direction: 'ltr', textAlign: 'right' }} />
                <FieldError msg={errors.mobile} />
              </div>
              <div className="form-group">
                <label>جنسیت</label>
                <div className="gender-radios">
                  {['آقا','خانم'].map(g => (
                    <label key={g} className={`gender-option ${form.gender === g ? 'selected' : ''}`}>
                      <input type="radio" name="c-gender" value={g} checked={form.gender === g} onChange={() => setForm({...form, gender: g})} hidden />
                      {g === 'آقا' ? '👨 آقا' : '👩 خانم'}
                    </label>
                  ))}
                </div>
              </div>
              <div className="form-group"><label>آدرس</label><input value={form.address} onChange={set('address')} /></div>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button type="submit" className="btn-primary">ذخیره</button>
              <button type="button" className="btn-secondary" onClick={() => { setShowForm(false); setErrors({}); }}>انصراف</button>
            </div>
          </form>
        </div>
      )}

      {/* Table */}
      <div style={{ background: 'var(--card-bg)', borderRadius: 12, border: '1px solid var(--border)', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr><th>نام</th><th>جنسیت</th><th>موبایل</th><th>آدرس</th><th>عملیات</th></tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={5} style={{ textAlign:'center', padding: 24, color:'var(--text2)' }}>نتیجه‌ای یافت نشد</td></tr>
              ) : pg.pageItems.map(c => (
                <tr key={c.id}>
                  <td>{c.name}</td>
                  <td>
                    {c.gender
                      ? <span className={`gender-badge ${c.gender === 'آقا' ? 'male' : 'female'}`}>{c.gender === 'آقا' ? '👨 آقا' : '👩 خانم'}</span>
                      : '—'}
                  </td>
                  <td style={{ direction: 'ltr', textAlign: 'right' }}>{c.mobile}</td>
                  <td>{c.address}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button className="action-btn action-btn-sms"    onClick={() => openSms(c)}                           title="ارسال پیامک">💬</button>
                      <button className="action-btn action-btn-edit"   onClick={() => { setEditId(c.id); setEditForm({...c}); }} title="ویرایش">✏️</button>
                      <button className="action-btn action-btn-delete" onClick={() => handleDelete(c.id)}                    title="حذف">🗑️</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Pagination
        page={pg.page} totalPages={pg.totalPages} onChange={pg.setPage}
        shown={pg.pageItems.length} total={pg.total} noun="مشتری" />

      {/* Edit modal */}
      {editId && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setEditId(null)}>
          <div className="modal-box">
            <div className="modal-header">
              <h3>ویرایش مشتری</h3>
              <button className="modal-close" onClick={() => setEditId(null)}>✕</button>
            </div>
            <form onSubmit={handleSaveEdit}>
              <div className="form-group"><label>نام</label><input value={editForm.name} onChange={setEdit('name')} required /></div>
              <div className="form-group"><label>موبایل</label><input value={editForm.mobile} onChange={setEdit('mobile')} /></div>
              <div className="form-group"><label>آدرس</label><input value={editForm.address} onChange={setEdit('address')} /></div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="submit" className="btn-primary">ذخیره</button>
                <button type="button" className="btn-secondary" onClick={() => setEditId(null)}>انصراف</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SMS modal */}
      {smsModal && (
        <div className="modal-overlay" onClick={() => setSmsModal(null)}>
          <div className="modal-box" style={{ maxWidth: 460 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>💬 ارسال پیامک</h3>
              <button className="modal-close" onClick={() => setSmsModal(null)}>✕</button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: 'var(--bg2)', borderRadius: 10, marginBottom: 14, border: '1px solid var(--border)' }}>
              <span style={{ fontSize: 28 }}>👤</span>
              <div>
                <div style={{ fontWeight: 800, fontSize: 15, color: 'var(--text)' }}>{smsModal.name}</div>
                <div style={{ fontSize: 13, color: 'var(--text2)', direction: 'ltr', marginTop: 2 }}>{smsModal.mobile}</div>
              </div>
            </div>

            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 12, color: 'var(--text2)', fontWeight: 600, marginBottom: 8 }}>متن‌های پیشنهادی:</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {SMS_TEMPLATES.map(t => (
                  <button key={t} type="button" onClick={() => setSmsText(t)}
                    style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 12px', textAlign: 'right', fontSize: 12, fontFamily: 'inherit', color: 'var(--text)', cursor: 'pointer' }}>
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label>متن پیامک</label>
              <textarea rows={4} value={smsText} onChange={e => setSmsText(e.target.value)}
                placeholder="متن پیامک را اینجا بنویسید..." style={{ resize: 'vertical' }} />
              <div style={{ fontSize: 11, color: 'var(--text2)', textAlign: 'left', marginTop: 3 }}>{smsText.length} کاراکتر</div>
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
              <button className="btn-primary" style={{ flex: 1 }} onClick={sendSms}>📤 ارسال پیامک</button>
              <button className="btn-secondary" style={{ flex: 1 }} onClick={() => setSmsModal(null)}>انصراف</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Bulk SMS Modal ── */}
      {bulkSmsOpen && (
        <div className="modal-overlay" onClick={() => setBulkSmsOpen(false)}>
          <div className="modal-box" style={{ maxWidth: 500 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>📢 ارسال پیامک همگانی</h3>
              <button className="modal-close" onClick={() => setBulkSmsOpen(false)}>✕</button>
            </div>

            {/* Recipients banner */}
            <div style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 14px', background:'rgba(251,191,36,0.1)', border:'1px solid rgba(251,191,36,0.3)', borderRadius:10, marginBottom:16 }}>
              <span style={{ fontSize:26 }}>👥</span>
              <div>
                <div style={{ fontWeight:800, fontSize:14, color:'var(--text)' }}>ارسال به {customers.length} مشتری</div>
                <div style={{ fontSize:12, color:'var(--text2)', marginTop:2 }}>
                  {customers.map(c => c.name).join(' — ')}
                </div>
              </div>
            </div>

            {/* Templates */}
            <div style={{ marginBottom:14 }}>
              <div style={{ fontSize:12, color:'var(--text2)', fontWeight:700, marginBottom:8 }}>📋 متن‌های آماده:</div>
              <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                {SMS_TEMPLATES.map(t => (
                  <button key={t} type="button" onClick={() => setBulkSmsText(t)}
                    style={{
                      background: bulkSmsText === t ? 'rgba(251,191,36,0.15)' : 'var(--bg2)',
                      border: bulkSmsText === t ? '1.5px solid var(--primary)' : '1px solid var(--border)',
                      borderRadius:8, padding:'9px 12px', textAlign:'right',
                      fontSize:13, fontFamily:'inherit', color:'var(--text)',
                      cursor:'pointer', transition:'all 0.15s', fontWeight: bulkSmsText === t ? 700 : 400
                    }}>
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group" style={{ margin:0 }}>
              <label>یا متن دلخواه بنویسید:</label>
              <textarea rows={4} value={bulkSmsText} onChange={e => setBulkSmsText(e.target.value)}
                placeholder="متن پیامک همگانی..." style={{ resize:'vertical' }} />
              <div style={{ fontSize:11, color:'var(--text2)', textAlign:'left', marginTop:3 }}>
                {bulkSmsText.length} کاراکتر
              </div>
            </div>

            <div style={{ display:'flex', gap:10, marginTop:16 }}>
              <button className="btn-primary" style={{ flex:1 }} onClick={sendBulkSms}>
                📤 ارسال به {customers.length} مشتری
              </button>
              <button className="btn-secondary" style={{ flex:1 }} onClick={() => setBulkSmsOpen(false)}>انصراف</button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </Layout>
  );
}
