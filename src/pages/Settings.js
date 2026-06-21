import { useState } from 'react';
import Layout from '../components/Layout';
import { ToastContainer, useToast } from '../components/Toast';
import './Settings.css';

const SETTINGS_KEY = 'safyar_settings';

const DEFAULT = {
  shopName:      'تعمیرگاه صافیار',
  ownerName:     '',
  phone:         '',
  phone2:        '',
  address:       '',
  city:          '',
  logo:          null,
  workStart:     '08:00',
  workEnd:       '18:00',
  offDay:        'جمعه',
  trackingPrefix: 'TH',
  trackingNext:   1001,
};

function getRegisteredUserInfo() {
  try {
    const national = localStorage.getItem('current_user');
    if (!national) return {};
    const users = JSON.parse(localStorage.getItem('safyar_registered_users') || '[]');
    const u = users.find(x => x.national === national);
    return u ? { ownerName: u.name, phone: u.mobile } : {};
  } catch { return {}; }
}

export function loadSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    const saved = raw ? JSON.parse(raw) : {};
    const userInfo = getRegisteredUserInfo();
    return {
      ...DEFAULT,
      ...userInfo,
      ...saved,
      ownerName: saved.ownerName || userInfo.ownerName || DEFAULT.ownerName,
      phone:     saved.phone     || userInfo.phone     || DEFAULT.phone,
    };
  } catch { return DEFAULT; }
}

export function isSettingsComplete() {
  const s = loadSettings();
  return !!(s.ownerName?.trim() && s.phone?.trim() && s.address?.trim());
}

const OFF_DAYS = ['جمعه','پنجشنبه','جمعه و پنجشنبه','بدون روز تعطیل'];

export default function Settings() {
  const [form, setForm] = useState(loadSettings);
  const [tab,  setTab]  = useState('shop');
  const { toasts, removeToast, success } = useToast();

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleLogo = e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => set('logo', ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleSave = e => {
    e.preventDefault();
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(form));
    success('تنظیمات با موفقیت ذخیره شد ✓');
  };

  const tabs = [
    { id: 'shop',    label: '🏪 اطلاعات تعمیرگاه' },
    { id: 'hours',   label: '🕐 ساعت کاری' },
    { id: 'invoice', label: '🧾 تنظیمات فاکتور' },
  ];

  const previewCode = `${form.trackingPrefix}-${String(form.trackingNext).padStart(4,'0')}`;

  return (
    <Layout title="تنظیمات">
      <div className="settings-wrap">

        {/* Tab bar — centered */}
        <div className="settings-tabs">
          {tabs.map(t => (
            <button key={t.id}
              className={`stab ${tab === t.id ? 'active' : ''}`}
              onClick={() => setTab(t.id)}
            >{t.label}</button>
          ))}
        </div>

        <form onSubmit={handleSave} className="settings-form">

          {/* ── Shop info ── */}
          {tab === 'shop' && (
            <div className="settings-section">

              {/* Logo */}
              <div className="logo-upload-row">
                <div className="logo-preview">
                  {form.logo
                    ? <img src={form.logo} alt="لوگو" className="logo-img" />
                    : <span className="logo-placeholder">🚗</span>}
                </div>
                <div className="logo-upload-info">
                  <p className="logo-title">لوگوی تعمیرگاه</p>
                  <p className="logo-hint">فرمت‌های PNG, JPG — حداکثر ۲ مگابایت</p>
                  <label className="btn-secondary logo-btn">
                    📷 انتخاب لوگو
                    <input type="file" accept="image/*" hidden onChange={handleLogo} />
                  </label>
                  {form.logo && (
                    <button type="button" className="btn-danger-sm" onClick={() => set('logo', null)}>
                      حذف لوگو
                    </button>
                  )}
                </div>
              </div>

              <div className="form-two-col">
                <div className="form-group">
                  <label>نام تعمیرگاه <span className="req">*</span></label>
                  <input type="text" value={form.shopName}
                    onChange={e => set('shopName', e.target.value)} required />
                </div>
                <div className="form-group">
                  <label>نام مالک</label>
                  <input type="text" value={form.ownerName}
                    onChange={e => set('ownerName', e.target.value)} />
                </div>
              </div>

              <div className="form-two-col">
                <div className="form-group">
                  <label>تلفن اول</label>
                  <input type="tel" value={form.phone}
                    onChange={e => set('phone', e.target.value)} placeholder="021-..." />
                </div>
                <div className="form-group">
                  <label>تلفن دوم</label>
                  <input type="tel" value={form.phone2}
                    onChange={e => set('phone2', e.target.value)} placeholder="09..." />
                </div>
              </div>

              <div className="form-two-col">
                <div className="form-group">
                  <label>شهر</label>
                  <input type="text" value={form.city}
                    onChange={e => set('city', e.target.value)} />
                </div>
                <div className="form-group">
                  <label>آدرس کامل</label>
                  <input type="text" value={form.address}
                    onChange={e => set('address', e.target.value)} />
                </div>
              </div>
            </div>
          )}

          {/* ── Work hours ── */}
          {tab === 'hours' && (
            <div className="settings-section">
              <div className="hours-preview-card">
                <span className="hours-icon">🕐</span>
                <div>
                  <div className="hours-main">{form.workStart} الی {form.workEnd}</div>
                  <div className="hours-sub">تعطیل: {form.offDay}</div>
                </div>
              </div>

              <div className="form-two-col">
                <div className="form-group">
                  <label>ساعت شروع کار</label>
                  <input type="time" value={form.workStart}
                    onChange={e => set('workStart', e.target.value)} />
                </div>
                <div className="form-group">
                  <label>ساعت پایان کار</label>
                  <input type="time" value={form.workEnd}
                    onChange={e => set('workEnd', e.target.value)} />
                </div>
              </div>

              <div className="form-group">
                <label>روز تعطیل</label>
                <div className="off-day-grid">
                  {OFF_DAYS.map(d => (
                    <label key={d} className={`off-day-option ${form.offDay === d ? 'selected' : ''}`}>
                      <input type="radio" name="offDay" value={d}
                        checked={form.offDay === d} onChange={() => set('offDay', d)} hidden />
                      {d}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── Invoice settings ── */}
          {tab === 'invoice' && (
            <div className="settings-section">

              {/* Tracking code settings */}
              <div className="tracking-settings-card">
                <div className="tracking-header">
                  <span className="tracking-icon">🏷️</span>
                  <div>
                    <div className="tracking-title">تنظیمات کد پیگیری</div>
                    <div className="tracking-sub">کد بعدی: <b className="tracking-preview">{previewCode}</b></div>
                  </div>
                </div>

                <div className="form-two-col" style={{ marginTop: 14 }}>
                  <div className="form-group">
                    <label>اولین کد پیگیری</label>
                    <input
                      type="text"
                      value={form.trackingPrefix}
                      onChange={e => set('trackingPrefix', e.target.value.toUpperCase().replace(/[^A-Z0-9]/g,'').slice(0,5))}
                      placeholder="1000"
                      maxLength={5}
                    />
                    <span className="field-hint">کدی که اولین پذیرش در برنامه می‌گیرد</span>
                  </div>
                  <div className="form-group">
                    <label>کد پیگیری بعدی</label>
                    <input
                      type="number"
                      value={form.trackingNext}
                      onChange={e => set('trackingNext', Math.max(1, parseInt(e.target.value) || 1))}
                      min={1}
                      placeholder="مثال: 1001"
                    />
                    <span className="field-hint">شماره‌ای که پذیرش بعدی می‌گیرد</span>
                  </div>
                </div>
              </div>

              {/* Preview */}
              <div className="invoice-preview">
                <div className="inv-header">
                  {form.logo
                    ? <img src={form.logo} alt="لوگو" className="inv-logo" />
                    : <span className="inv-logo-ph">🚗</span>}
                  <div className="inv-info">
                    <div className="inv-name">{form.shopName || 'نام تعمیرگاه'}</div>
                    {form.phone   && <div className="inv-detail">📞 {form.phone}</div>}
                    {form.address && <div className="inv-detail">📍 {form.address}</div>}
                  </div>
                </div>
                <div className="inv-body">
                  <div className="inv-row"><span>کد پیگیری:</span><span style={{direction:'ltr',fontFamily:'monospace'}}>{previewCode}</span></div>
                  <div className="inv-row"><span>مالک:</span><span>نام مشتری</span></div>
                </div>
              </div>

              <p className="settings-note">ℹ️ پیش‌نمایش فاکتور بر اساس اطلاعات «اطلاعات تعمیرگاه» نمایش داده می‌شود.</p>
            </div>
          )}

          <div className="settings-actions">
            <button type="submit" className="btn-primary">💾 ذخیره تنظیمات</button>
          </div>
        </form>
      </div>

      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </Layout>
  );
}
