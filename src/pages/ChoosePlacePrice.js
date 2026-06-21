import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import IranPlate from '../components/IranPlate';
import FieldError from '../components/FieldError';
import { INIT_WORKERS, REPAIR_JOB } from '../data/workers';
import './Wizard.css';

const PLATE = { p1: '۱۴', letter: 'ص', p2: '۱۴۴', p3: '۱۰' };

const CATEGORIES = {
  front:    { label: 'جلو',     parts: ['سپر جلو','گلگیر جلو چپ','گلگیر جلو راست','چراغ جلو چپ','چراغ جلو راست','کاپوت','جلو پنجره','سینی جلو','شاسی جلو'] },
  rear:     { label: 'عقب',     parts: ['سپر عقب','گلگیر عقب چپ','گلگیر عقب راست','چراغ عقب چپ','چراغ عقب راست','درب صندوق','سینی عقب','شاسی عقب','گارد عقب'] },
  side:     { label: 'جانبی',   parts: ['درب جلو چپ','درب جلو راست','درب عقب چپ','درب عقب راست','رکاب چپ','رکاب راست','آینه چپ','آینه راست','گلگیر جانبی','باربند'] },
  cover:    { label: 'کاور',    parts: ['کاور جلو','کاور عقب','کاور چپ','کاور راست','کاور سقف','کاور کامل'] },
  internal: { label: 'داخلی',   parts: ['داخل کابین','سقف خودرو','کف صندوق','دور گلگیر','سینی پشت سپر','کشیدن جای زبانه قفل','دیاق سپر','سینی شاسی','کلاف ستون','ستون ها','لوله ها','کلاف ها','بغل دری','قالپاق','ابرویی','آفتابگیر','شاسی قفل کن درب'] },
};

const REPAIR_TYPES = ['صافکاری','نقاشی','کاور'];

const EMPTY_REPAIR = { type: 'صافکاری', worker: '', location: '', price: '', discount: '', days: '' };

export default function ChoosePlacePrice() {
  const navigate = useNavigate();
  const { theme, toggle } = useTheme();
  const [selected, setSelected] = useState([]);
  const [repairs, setRepairs] = useState([]);
  const [form, setForm] = useState(EMPTY_REPAIR);
  const [errors, setErrors] = useState({});

  /* Workers split into "suggested" (matching the chosen repair type) and "others" */
  const matchingJob = REPAIR_JOB[form.type];
  const suggestedWorkers = INIT_WORKERS.filter(w => w.job === matchingJob);
  const otherWorkers     = INIT_WORKERS.filter(w => w.job !== matchingJob);

  const togglePart = (part) => {
    setSelected(prev => prev.includes(part) ? prev.filter(p => p !== part) : [...prev, part]);
  };

  const addRepair = (e) => {
    e.preventDefault();
    const errs = {};
    if (!form.location) errs.location = 'محل تعمیر را انتخاب کنید';
    if (!form.price)    errs.price    = 'هزینه را وارد کنید';
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setRepairs([...repairs, { ...form, id: Date.now() }]);
    setForm({ ...EMPTY_REPAIR, type: form.type });
    setErrors({});
  };

  const setF = k => e => {
    setForm({ ...form, [k]: e.target.value });
    if (errors[k]) setErrors(p => ({ ...p, [k]: undefined }));
  };

  /* Numeric fields: keep raw digits in state, show 3-digit grouped value */
  const setNum = k => e => {
    const raw = e.target.value.replace(/[^0-9]/g, '');
    setForm({ ...form, [k]: raw });
    if (errors[k]) setErrors(p => ({ ...p, [k]: undefined }));
  };
  const groupNum = v => (v ? Number(v).toLocaleString('en-US') : '');

  return (
    <div className="wizard-page">
      <div className="wizard-header">
        <h1 className="wizard-title">🚗 صافیار</h1>
        <div className="wizard-header-actions">
          <button className="wizard-exit-btn" onClick={() => navigate('/')} title="بازگشت به صفحه اصلی">🏠 بازگشت به صفحه اصلی</button>
          <button className="wizard-theme-btn" onClick={toggle}>{theme === 'night' ? '☀️' : '🌙'}</button>
        </div>
      </div>

      <div className="wizard-progress">
        <div className="wizard-step"><div className="step-num">✓</div><span>ثبت کیلومتر</span></div>
        <div className="wizard-step-line" />
        <div className="wizard-step active"><div className="step-num">۲</div><span>انتخاب قطعات</span></div>
        <div className="wizard-step-line" />
        <div className="wizard-step"><div className="step-num">۳</div><span>تصاویر</span></div>
        <div className="wizard-step-line" />
        <div className="wizard-step"><div className="step-num">۴</div><span>وضعیت</span></div>
      </div>

      <div className="wizard-card">
        <h2 className="wizard-card-title">هزینه صافکاری و نقاشی</h2>

        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
          <IranPlate d2={PLATE.p1} letter={PLATE.letter} d3={PLATE.p2} code={PLATE.p3} />
        </div>

        {/* Parts selection */}
        {Object.entries(CATEGORIES).map(([key, cat]) => (
          <div className="parts-category" key={key}>
            <h4>{cat.label}</h4>
            <div className="parts-grid">
              {cat.parts.map(part => (
                <button
                  key={part}
                  type="button"
                  className={`part-chip ${selected.includes(part) ? 'selected' : ''}`}
                  onClick={() => togglePart(part)}
                >
                  {part}
                </button>
              ))}
            </div>
          </div>
        ))}

        {/* Add repair form */}
        <div style={{ background: 'var(--bg)', borderRadius: 10, padding: 16, marginBottom: 16, border: '1px solid var(--border)' }}>
          <h4 style={{ margin: '0 0 12px', fontSize: 14 }}>افزودن آیتم تعمیر</h4>
          <form onSubmit={addRepair} noValidate>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label>نوع تعمیر</label>
                <select value={form.type} onChange={setF('type')}>
                  {REPAIR_TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label>استاد کار</label>
                <select value={form.worker} onChange={setF('worker')}>
                  <option value="">بدون استاد کار</option>
                  {suggestedWorkers.length > 0 && (
                    <optgroup label={`پیشنهادی (${matchingJob})`}>
                      {suggestedWorkers.map(w => <option key={w.id} value={w.name}>{w.name}</option>)}
                    </optgroup>
                  )}
                  {otherWorkers.length > 0 && (
                    <optgroup label="سایر همکاران">
                      {otherWorkers.map(w => <option key={w.id} value={w.name}>{w.name} ({w.job})</option>)}
                    </optgroup>
                  )}
                </select>
              </div>
              <div className={`form-group ${errors.location ? 'field-invalid' : ''}`} style={{ margin: 0 }}>
                <label>محل تعمیر</label>
                <select value={form.location} onChange={setF('location')}>
                  <option value="">انتخاب</option>
                  {selected.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
                <FieldError msg={errors.location} />
              </div>
              <div className={`form-group ${errors.price ? 'field-invalid' : ''}`} style={{ margin: 0 }}>
                <label>هزینه (تومان)</label>
                <input type="text" inputMode="numeric" value={groupNum(form.price)} onChange={setNum('price')}
                  placeholder="مثال: 500,000" style={{ direction: 'ltr', textAlign: 'right' }} />
                <FieldError msg={errors.price} />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label>تخفیف (تومان) <span style={{ color: 'var(--text2)', fontWeight: 400 }}>— اختیاری</span></label>
                <input type="text" inputMode="numeric" value={groupNum(form.discount)} onChange={setNum('discount')}
                  placeholder="می‌توانید خالی بگذارید" style={{ direction: 'ltr', textAlign: 'right' }} />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label>روز</label>
                <input type="number" value={form.days} onChange={setF('days')} placeholder="مثال: 3" />
              </div>
            </div>
            <button type="submit" className="btn-primary" style={{ marginTop: 10 }}>+ افزودن</button>
          </form>
        </div>

        {/* Repairs table */}
        {repairs.length > 0 && (
          <div style={{ overflowX: 'auto', marginBottom: 16 }}>
            <table className="data-table">
              <thead>
                <tr><th>نوع</th><th>استاد کار</th><th>محل</th><th>هزینه</th><th>تخفیف</th><th>روز</th><th>حذف</th></tr>
              </thead>
              <tbody>
                {repairs.map(r => (
                  <tr key={r.id}>
                    <td><span className={`badge ${r.type === 'صافکاری' ? 'badge-success' : r.type === 'کاور' ? 'badge-warning' : 'badge-info'}`}>{r.type}</span></td>
                    <td>{r.worker || '—'}</td>
                    <td>{r.location}</td>
                    <td>{parseInt(r.price).toLocaleString('fa-IR')} تومان</td>
                    <td>{r.discount ? `${parseInt(r.discount).toLocaleString('fa-IR')} تومان` : '—'}</td>
                    <td>{r.days ? `${r.days} روز` : '—'}</td>
                    <td><button className="action-btn action-btn-delete" onClick={() => setRepairs(repairs.filter(x => x.id !== r.id))}>🗑️</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <button className="btn-secondary" onClick={() => navigate('/register-km-fuel')}>← بازگشت</button>
          <button className="btn-primary" onClick={() => navigate('/choose-photo')}>مرحله بعد ←</button>
        </div>
      </div>
    </div>
  );
}
