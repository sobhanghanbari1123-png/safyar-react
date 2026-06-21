import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import FieldError from '../components/FieldError';
import { INIT_WORKERS, REPAIR_JOB } from '../data/workers';
import './Wizard.css';
import './EditRepairs.css';

const REPORTS_KEY = 'safyar_reports';

const CATEGORIES = {
  front:    { label: 'جلو',   parts: ['سپر جلو','گلگیر جلو چپ','گلگیر جلو راست','چراغ جلو چپ','چراغ جلو راست','کاپوت','جلو پنجره','سینی جلو','شاسی جلو'] },
  rear:     { label: 'عقب',   parts: ['سپر عقب','گلگیر عقب چپ','گلگیر عقب راست','چراغ عقب چپ','چراغ عقب راست','درب صندوق','سینی عقب','شاسی عقب','گارد عقب'] },
  side:     { label: 'جانبی', parts: ['درب جلو چپ','درب جلو راست','درب عقب چپ','درب عقب راست','رکاب چپ','رکاب راست','آینه چپ','آینه راست','گلگیر جانبی','باربند'] },
  cover:    { label: 'کاور',  parts: ['کاور جلو','کاور عقب','کاور چپ','کاور راست','کاور سقف','کاور کامل'] },
  internal: { label: 'داخلی', parts: ['داخل کابین','سقف خودرو','کف صندوق','دور گلگیر','سینی پشت سپر','کشیدن جای زبانه قفل','دیاق سپر','سینی شاسی','کلاف ستون','ستون ها','لوله ها','کلاف ها','بغل دری','قالپاق','ابرویی','آفتابگیر','شاسی قفل کن درب'] },
};

const REPAIR_TYPES = ['صافکاری', 'نقاشی', 'کاور'];
const EMPTY_FORM   = { type: 'صافکاری', worker: '', location: '', price: '', discount: '', days: '' };

const groupNum = v => (v ? Number(v).toLocaleString('en-US') : '');

export default function EditRepairs() {
  const { id }     = useParams();
  const navigate   = useNavigate();
  const { theme, toggle } = useTheme();

  /* load report from localStorage */
  const [report, setReport] = useState(() => {
    try {
      const all = JSON.parse(localStorage.getItem(REPORTS_KEY) || '[]');
      return all.find(r => String(r.id) === String(id)) || null;
    } catch { return null; }
  });

  const [repairs, setRepairs]   = useState(() => report?.repairs || []);
  const [selected, setSelected] = useState(() => {
    const locs = (report?.repairs || []).map(r => r.location).filter(Boolean);
    return [...new Set(locs)];
  });

  const [form, setForm]         = useState(EMPTY_FORM);
  const [errors, setErrors]     = useState({});
  const [editingId, setEditingId] = useState(null);
  const [editRow, setEditRow]   = useState({});

  if (!report) {
    return (
      <div className="wizard-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 48 }}>🔍</div>
          <p style={{ marginTop: 12, color: 'var(--text2)' }}>پرونده یافت نشد</p>
          <button className="btn-primary" style={{ marginTop: 16 }} onClick={() => navigate('/reports')}>
            بازگشت به گزارشات
          </button>
        </div>
      </div>
    );
  }

  /* ── parts toggle ── */
  const togglePart = (part) =>
    setSelected(prev => prev.includes(part) ? prev.filter(p => p !== part) : [...prev, part]);

  /* ── add form ── */
  const setF   = k => e => { setForm(f => ({ ...f, [k]: e.target.value })); if (errors[k]) setErrors(p => ({ ...p, [k]: undefined })); };
  const setNum = k => e => { const raw = e.target.value.replace(/[^0-9]/g, ''); setForm(f => ({ ...f, [k]: raw })); if (errors[k]) setErrors(p => ({ ...p, [k]: undefined })); };

  const matchingJob      = REPAIR_JOB[form.type];
  const suggestedWorkers = INIT_WORKERS.filter(w => w.job === matchingJob);
  const otherWorkers     = INIT_WORKERS.filter(w => w.job !== matchingJob);

  const addRepair = (e) => {
    e.preventDefault();
    const errs = {};
    if (!form.location) errs.location = 'محل تعمیر را انتخاب کنید';
    if (!form.price)    errs.price    = 'هزینه را وارد کنید';
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setRepairs(prev => [...prev, { ...form, id: Date.now() }]);
    setForm({ ...EMPTY_FORM, type: form.type });
    setErrors({});
  };

  const deleteRepair = (rid) => setRepairs(prev => prev.filter(r => r.id !== rid));

  const startEdit = (item) => { setEditingId(item.id); setEditRow({ ...item }); };
  const cancelEdit = () => { setEditingId(null); setEditRow({}); };
  const saveRowEdit = () => {
    setRepairs(prev => prev.map(r => r.id === editingId ? { ...editRow } : r));
    setEditingId(null); setEditRow({});
  };

  /* ── recalculate report costs from repairs array ── */
  const calcTotals = (reps) => {
    const byType = (type) => reps.filter(x => x.type === type);
    const sumKey = (items, key) => items.reduce((s, x) => s + parseInt(x[key] || 0), 0);
    return {
      safkariCost: sumKey(byType('صافکاری'), 'price') - sumKey(byType('صافکاری'), 'discount'),
      safkariDays: sumKey(byType('صافکاری'), 'days'),
      naghashiCost: sumKey(byType('نقاشی'), 'price') - sumKey(byType('نقاشی'), 'discount'),
      naghashiDays: sumKey(byType('نقاشی'), 'days'),
      coverCost: sumKey(byType('کاور'), 'price') - sumKey(byType('کاور'), 'discount'),
      coverDays: sumKey(byType('کاور'), 'days'),
    };
  };

  /* ── save & go back ── */
  const handleSave = () => {
    try {
      const all = JSON.parse(localStorage.getItem(REPORTS_KEY) || '[]');
      const updated = all.map(r => {
        if (String(r.id) !== String(id)) return r;
        const totals = calcTotals(repairs);
        const totalCostVal = totals.safkariCost + totals.naghashiCost + totals.coverCost + (r.partsCost || 0);
        const remaining = Math.max(0, totalCostVal - (r.discount || 0) - (r.paid || 0));
        return { ...r, repairs, ...totals, remaining };
      });
      localStorage.setItem(REPORTS_KEY, JSON.stringify(updated));
    } catch {}
    navigate('/reports');
  };

  const liveTotals = calcTotals(repairs);
  const totalCost = liveTotals.safkariCost + liveTotals.naghashiCost + liveTotals.coverCost;

  return (
    <div className="wizard-page">
      {/* header */}
      <div className="wizard-header">
        <h1 className="wizard-title">🔧 ویرایش محل‌ها و هزینه‌ها</h1>
        <div className="wizard-header-actions">
          <button className="wizard-exit-btn" onClick={() => navigate('/reports')}>← بازگشت</button>
          <button className="wizard-theme-btn" onClick={toggle}>{theme === 'night' ? '☀️' : '🌙'}</button>
        </div>
      </div>

      {/* report info strip */}
      <div className="er-info-strip">
        <span>👤 {report.owner}</span>
        <span>📋 {report.tracking}</span>
        <span>🚗 {report.plate}</span>
        <span className="er-total">مجموع هزینه: <strong>{totalCost.toLocaleString('fa-IR')} تومان</strong></span>
      </div>

      <div className="wizard-card">

        {/* ── Parts selector ── */}
        <div className="er-section">
          <h3 className="er-section-title">📍 انتخاب محل‌های تعمیر</h3>
          <p className="er-hint">محل‌هایی که انتخاب کنید در لیست «محل تعمیر» فرم پایین ظاهر می‌شوند.</p>
          {Object.entries(CATEGORIES).map(([key, cat]) => (
            <div key={key} className="er-cat">
              <div className="er-cat-label">{cat.label}</div>
              <div className="parts-grid">
                {cat.parts.map(part => (
                  <button key={part} type="button"
                    className={`part-chip ${selected.includes(part) ? 'selected' : ''}`}
                    onClick={() => togglePart(part)}>
                    {part}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* ── Add repair form ── */}
        <div className="er-section er-add-box">
          <h3 className="er-section-title">➕ افزودن آیتم تعمیر</h3>
          <form onSubmit={addRepair} noValidate>
            <div className="er-form-grid">
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
                  <option value="">انتخاب کنید</option>
                  {selected.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
                <FieldError msg={errors.location} />
              </div>

              <div className={`form-group ${errors.price ? 'field-invalid' : ''}`} style={{ margin: 0 }}>
                <label>هزینه (تومان)</label>
                <input type="text" inputMode="numeric"
                  value={groupNum(form.price)} onChange={setNum('price')}
                  placeholder="500,000" style={{ direction: 'ltr', textAlign: 'right' }} />
                <FieldError msg={errors.price} />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label>تخفیف (تومان) <span className="er-opt">اختیاری</span></label>
                <input type="text" inputMode="numeric"
                  value={groupNum(form.discount)} onChange={setNum('discount')}
                  placeholder="—" style={{ direction: 'ltr', textAlign: 'right' }} />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label>تعداد روز</label>
                <input type="number" value={form.days} onChange={setF('days')} placeholder="مثال: ۳" min={0} />
              </div>
            </div>
            <button type="submit" className="btn-primary" style={{ marginTop: 12 }}>+ افزودن</button>
          </form>
        </div>

        {/* ── Repairs table ── */}
        <div className="er-section">
          <h3 className="er-section-title">
            📋 آیتم‌های ثبت‌شده
            <span className="er-count">{repairs.length} مورد</span>
          </h3>

          {repairs.length === 0 ? (
            <div className="er-empty">هنوز هیچ آیتمی ثبت نشده است</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>نوع</th><th>استاد کار</th><th>محل</th>
                    <th>هزینه (ت)</th><th>تخفیف (ت)</th><th>روز</th><th>عملیات</th>
                  </tr>
                </thead>
                <tbody>
                  {repairs.map(item => (
                    editingId === item.id ? (
                      /* ── inline edit row ── */
                      <tr key={item.id} className="er-editing-row">
                        <td>
                          <select value={editRow.type} onChange={e => setEditRow(x => ({ ...x, type: e.target.value }))}>
                            {REPAIR_TYPES.map(t => <option key={t}>{t}</option>)}
                          </select>
                        </td>
                        <td>
                          <select value={editRow.worker} onChange={e => setEditRow(x => ({ ...x, worker: e.target.value }))}>
                            <option value="">—</option>
                            {INIT_WORKERS.map(w => <option key={w.id} value={w.name}>{w.name}</option>)}
                          </select>
                        </td>
                        <td>
                          <select value={editRow.location} onChange={e => setEditRow(x => ({ ...x, location: e.target.value }))}>
                            {selected.map(p => <option key={p} value={p}>{p}</option>)}
                            {editRow.location && !selected.includes(editRow.location) &&
                              <option value={editRow.location}>{editRow.location}</option>}
                          </select>
                        </td>
                        <td>
                          <input className="er-inline-input" type="text" inputMode="numeric"
                            value={groupNum(editRow.price)}
                            onChange={e => setEditRow(x => ({ ...x, price: e.target.value.replace(/[^0-9]/g, '') }))}
                            style={{ direction: 'ltr' }} />
                        </td>
                        <td>
                          <input className="er-inline-input" type="text" inputMode="numeric"
                            value={groupNum(editRow.discount)}
                            onChange={e => setEditRow(x => ({ ...x, discount: e.target.value.replace(/[^0-9]/g, '') }))}
                            style={{ direction: 'ltr' }} />
                        </td>
                        <td>
                          <input className="er-inline-input er-inline-days" type="number"
                            value={editRow.days}
                            onChange={e => setEditRow(x => ({ ...x, days: e.target.value }))} min={0} />
                        </td>
                        <td style={{ whiteSpace: 'nowrap' }}>
                          <button className="action-btn er-btn-save" onClick={saveRowEdit} title="ذخیره">✓</button>
                          <button className="action-btn" onClick={cancelEdit} title="لغو">✕</button>
                        </td>
                      </tr>
                    ) : (
                      /* ── normal row ── */
                      <tr key={item.id}>
                        <td>
                          <span className={`badge ${item.type === 'صافکاری' ? 'badge-success' : item.type === 'کاور' ? 'badge-warning' : 'badge-info'}`}>
                            {item.type}
                          </span>
                        </td>
                        <td>{item.worker || '—'}</td>
                        <td>{item.location}</td>
                        <td style={{ direction: 'ltr', textAlign: 'right', fontWeight: 600 }}>
                          {parseInt(item.price || 0).toLocaleString('fa-IR')}
                        </td>
                        <td style={{ direction: 'ltr', textAlign: 'right', color: 'var(--text-muted)' }}>
                          {item.discount ? parseInt(item.discount).toLocaleString('fa-IR') : '—'}
                        </td>
                        <td>{item.days ? `${item.days} روز` : '—'}</td>
                        <td style={{ whiteSpace: 'nowrap' }}>
                          <button className="action-btn action-btn-edit" onClick={() => startEdit(item)} title="ویرایش">✏️</button>
                          <button className="action-btn action-btn-delete" onClick={() => deleteRepair(item.id)} title="حذف">🗑️</button>
                        </td>
                      </tr>
                    )
                  ))}
                </tbody>
                <tfoot>
                  <tr className="er-total-row">
                    <td colSpan={3} style={{ fontWeight: 700 }}>جمع کل</td>
                    <td style={{ direction: 'ltr', textAlign: 'right', fontWeight: 700, color: 'var(--primary)' }}>
                      {repairs.reduce((s, r) => s + parseInt(r.price || 0), 0).toLocaleString('fa-IR')}
                    </td>
                    <td style={{ direction: 'ltr', textAlign: 'right', color: 'var(--text-muted)' }}>
                      {repairs.reduce((s, r) => s + parseInt(r.discount || 0), 0).toLocaleString('fa-IR')}
                    </td>
                    <td colSpan={2}></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>

        {/* ── footer actions ── */}
        <div className="er-footer">
          <button className="btn-primary" onClick={handleSave}>💾 ذخیره و بازگشت</button>
          <button className="btn-secondary" onClick={() => navigate('/reports')}>انصراف</button>
        </div>
      </div>
    </div>
  );
}
