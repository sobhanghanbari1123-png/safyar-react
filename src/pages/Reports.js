import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { ToastContainer, useToast } from '../components/Toast';
import { INIT_WORKERS, REPAIR_JOB } from '../data/workers';
import { InvoiceDoc, ContractDoc, InsuranceDoc, ReportsListDoc } from '../components/ReportDocs';
import Pagination, { usePagination } from '../components/Pagination';
import { normDigits } from '../utils/normalize';
import './Reports.css';

const CATEGORIES = {
  front:    { label: 'جلو',   parts: ['سپر جلو','گلگیر جلو چپ','گلگیر جلو راست','چراغ جلو چپ','چراغ جلو راست','کاپوت','جلو پنجره','سینی جلو','شاسی جلو'] },
  rear:     { label: 'عقب',   parts: ['سپر عقب','گلگیر عقب چپ','گلگیر عقب راست','چراغ عقب چپ','چراغ عقب راست','درب صندوق','سینی عقب','شاسی عقب','گارد عقب'] },
  side:     { label: 'جانبی', parts: ['درب جلو چپ','درب جلو راست','درب عقب چپ','درب عقب راست','رکاب چپ','رکاب راست','آینه چپ','آینه راست','گلگیر جانبی','باربند'] },
  cover:    { label: 'کاور',  parts: ['کاور جلو','کاور عقب','کاور چپ','کاور راست','کاور سقف','کاور کامل'] },
  internal: { label: 'داخلی', parts: ['داخل کابین','سقف خودرو','کف صندوق','دور گلگیر','سینی پشت سپر','کشیدن جای زبانه قفل','دیاق سپر','سینی شاسی','کلاف ستون','ستون ها','لوله ها','کلاف ها','بغل دری','قالپاق','ابرویی','آفتابگیر','شاسی قفل کن درب'] },
};
const REPAIR_TYPES = ['صافکاری','نقاشی','کاور'];
const EMPTY_REPAIR = { type: 'صافکاری', worker: '', location: '', price: '', discount: '', days: '' };

function parsePlate(str) {
  const parts = (str || '').split('-');
  // format: d3-letter-d2-code
  return { d3: parts[0] || '???', letter: parts[1] || '?', d2: parts[2] || '??', code: parts[3] || '??' };
}

const REPORTS_KEY = 'safyar_reports';

function loadReports() {
  try {
    const raw = localStorage.getItem(REPORTS_KEY);
    return raw ? JSON.parse(raw) : INIT_DATA;
  } catch { return INIT_DATA; }
}
function saveReports(data) {
  localStorage.setItem(REPORTS_KEY, JSON.stringify(data));
}

const INIT_DATA = [
  {
    id: 1, plate: '۳۴۵-الف-۱۲-۶۷', mobile: '09121234567', owner: 'علی احمدی',
    km: 45000, fuel: 'نصف', safkariCost: 800000, safkariDays: 3,
    naghashiCost: 500000, naghashiDays: 2, coverCost: 300000, coverDays: 1, partsCost: 200000,
    paid: 1000000, discount: 100000, remaining: 400000, status: 'accepted',
    tracking: 'TH-1001', master: 'رضا کریمی', beforePhotos: [], afterPhotos: [], repairs: []
  },
  {
    id: 2, plate: '۴۵۶-ب-۲۳-۷۸', mobile: '09351234567', owner: 'مریم رضایی',
    km: 30000, fuel: 'سه‌چهارم', safkariCost: 600000, safkariDays: 2,
    naghashiCost: 400000, naghashiDays: 1, coverCost: 0, coverDays: 0, partsCost: 0,
    paid: 1000000, discount: 0, remaining: 0, status: 'released',
    tracking: 'TH-1002', master: 'مهدی احمدی', beforePhotos: [], afterPhotos: [], repairs: []
  },
  {
    id: 3, plate: '۵۶۷-پ-۳۴-۸۹', mobile: '09181234567', owner: 'حسن کریمی',
    km: 60000, fuel: 'پر', safkariCost: 1200000, safkariDays: 5,
    naghashiCost: 700000, naghashiDays: 3, coverCost: 400000, coverDays: 2, partsCost: 300000,
    paid: 500000, discount: 200000, remaining: 1500000, status: 'pending',
    tracking: 'TH-1003', master: 'علی رضایی', beforePhotos: [], afterPhotos: [], repairs: []
  },
];

const STATUS = {
  accepted:  { label: 'پذیرفته شده',    cls: 'badge-success' },
  released:  { label: 'تحویل داده شده', cls: 'badge-info'    },
  pending:   { label: 'در انتظار',      cls: 'badge-warning' },
  cancelled: { label: 'انصراف',         cls: 'badge-danger'  },
};
const FUELS = ['پر','سه‌چهارم','نصف','یک‌چهارم','خالی'];

const DOC_TITLES = {
  invoice:   '🧾 پیش‌نمایش فاکتور',
  contract:  '📄 قرارداد تعمیر',
  insurance: '🛡️ بیمه‌نامه و گارانتی',
  list:      '🖨️ چاپ همه گزارش‌ها',
};

export default function Reports() {
  const navigate = useNavigate();
  const [reports, setReports] = useState(loadReports);

  const updateReports = (next) => { setReports(next); saveReports(next); };
  const [filter, setFilter]     = useState({ status: '', name: '', mobile: '', tracking: '', master: '' });

  /* modals */
  const [imgModal,     setImgModal]     = useState(null);
  const [editModal,    setEditModal]    = useState(null);
  const [lightbox,     setLightbox]     = useState(null);
  const [docModal,     setDocModal]     = useState(null);
  const [repairsModal, setRepairsModal] = useState(null); // { reportId, repairs: [...], selected: [...] }
  const [repairForm,   setRepairForm]   = useState(EMPTY_REPAIR);
  const [repairErrors, setRepairErrors] = useState({});
  const [editingRepair, setEditingRepair] = useState(null); // repair item being inline-edited

  const beforeRef = useRef();
  const afterRef  = useRef();

  const { toasts, removeToast, success, error } = useToast();

  /* Mark body while this page is mounted so the print stylesheet can hide the
     rest of the app and show only the printable document mount. */
  useEffect(() => {
    document.body.classList.add('has-print-doc');
    return () => document.body.classList.remove('has-print-doc');
  }, []);

  const setF  = k => e => setFilter(f => ({ ...f, [k]: e.target.value }));
  const setEF = k => e => setEditModal(m => ({ ...m, [k]: e.target.value }));
  const setEN = k => e => setEditModal(m => ({ ...m, [k]: Number(e.target.value) }));

  const filtered = reports.filter(r => {
    if (filter.status   && r.status !== filter.status)                                    return false;
    if (filter.mobile   && !normDigits(r.mobile).includes(normDigits(filter.mobile)))     return false;
    if (filter.tracking && !r.tracking.includes(filter.tracking))                         return false;
    if (filter.name     && !r.owner.includes(filter.name))                                return false;
    if (filter.master   && !(r.master || '').includes(filter.master))                     return false;
    return true;
  });

  /* ── Pagination (6 cards per page; resets when filters change) ── */
  const pg = usePagination(filtered, 6, JSON.stringify(filter));
  const goPage = p => { pg.setPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }); };

  const modalRecord = reports.find(r => r.id === imgModal);

  /* ── Documents (preview + print) ── */
  const openDoc = (type, record = null) => {
    if (type === 'list' && filtered.length === 0) { error('گزارشی برای چاپ وجود ندارد'); return; }
    setDocModal({ type, record });
  };

  const renderDoc = (doc) => {
    switch (doc.type) {
      case 'invoice':   return <InvoiceDoc r={doc.record} />;
      case 'contract':  return <ContractDoc r={doc.record} />;
      case 'insurance': return <InsuranceDoc r={doc.record} />;
      case 'list':      return <ReportsListDoc reports={filtered} />;
      default:          return null;
    }
  };

  /* ── Edit save ── */
  const saveEdit = () => {
    updateReports(reports.map(r => r.id === editModal.id ? { ...editModal } : r));
    setEditModal(null);
    success('تغییرات با موفقیت ذخیره شد ✓');
  };

  /* ── Repairs modal ── */
  const openRepairsModal = (r) => {
    setRepairsModal({ reportId: r.id, repairs: [...(r.repairs || [])], selected: (r.repairs || []).map(x => x.location).filter(Boolean) });
    setRepairForm(EMPTY_REPAIR);
    setRepairErrors({});
    setEditingRepair(null);
  };

  const togglePart = (part) => {
    setRepairsModal(m => ({
      ...m,
      selected: m.selected.includes(part) ? m.selected.filter(p => p !== part) : [...m.selected, part],
    }));
  };

  const setRF = k => e => {
    setRepairForm(f => ({ ...f, [k]: e.target.value }));
    if (repairErrors[k]) setRepairErrors(p => ({ ...p, [k]: undefined }));
  };
  const setRNum = k => e => {
    const raw = e.target.value.replace(/[^0-9]/g, '');
    setRepairForm(f => ({ ...f, [k]: raw }));
    if (repairErrors[k]) setRepairErrors(p => ({ ...p, [k]: undefined }));
  };
  const groupNum = v => (v ? Number(v).toLocaleString('en-US') : '');

  const addRepairItem = (e) => {
    e.preventDefault();
    const errs = {};
    if (!repairForm.location) errs.location = 'محل تعمیر را انتخاب کنید';
    if (!repairForm.price)    errs.price    = 'هزینه را وارد کنید';
    if (Object.keys(errs).length) { setRepairErrors(errs); return; }
    setRepairsModal(m => ({ ...m, repairs: [...m.repairs, { ...repairForm, id: Date.now() }] }));
    setRepairForm({ ...EMPTY_REPAIR, type: repairForm.type });
    setRepairErrors({});
  };

  const deleteRepairItem = (id) =>
    setRepairsModal(m => ({ ...m, repairs: m.repairs.filter(x => x.id !== id) }));

  const startEditRepair = (item) => setEditingRepair({ ...item });

  const saveEditRepair = () => {
    setRepairsModal(m => ({ ...m, repairs: m.repairs.map(x => x.id === editingRepair.id ? editingRepair : x) }));
    setEditingRepair(null);
  };

  const calcRepairTotals = (repairs) => {
    const byType = (type) => repairs.filter(x => x.type === type);
    const sum = (items, key) => items.reduce((s, x) => s + (parseInt(x[key] || 0)), 0);
    return {
      safkariCost: sum(byType('صافکاری'), 'price') - sum(byType('صافکاری'), 'discount'),
      safkariDays: sum(byType('صافکاری'), 'days'),
      naghashiCost: sum(byType('نقاشی'), 'price') - sum(byType('نقاشی'), 'discount'),
      naghashiDays: sum(byType('نقاشی'), 'days'),
      coverCost: sum(byType('کاور'), 'price') - sum(byType('کاور'), 'discount'),
      coverDays: sum(byType('کاور'), 'days'),
    };
  };

  const saveRepairsModal = () => {
    const r = repairsModal;
    const totals = calcRepairTotals(r.repairs);
    updateReports(reports.map(x => {
      if (x.id !== r.reportId) return x;
      const totalCost = totals.safkariCost + totals.naghashiCost + totals.coverCost + (x.partsCost || 0);
      const remaining = Math.max(0, totalCost - (x.discount || 0) - (x.paid || 0));
      return { ...x, repairs: r.repairs, ...totals, remaining };
    }));
    setRepairsModal(null);
    success('آیتم‌های تعمیر ذخیره شدند ✓');
  };

  /* ── Deliver ── */
  const deliver = (id) => {
    const r = reports.find(x => x.id === id);
    if (!window.confirm(`آیا از تحویل خودرو «${r?.owner}» مطمئن هستید؟`)) return;
    updateReports(reports.map(x => x.id === id ? { ...x, status: 'released' } : x));
    success('خودرو با موفقیت تحویل داده شد 🚗');
  };

  /* ── Photo upload ── */
  const handleUpload = (type, files) => {
    const arr = Array.from(files);
    Promise.all(arr.map(f => new Promise(res => {
      const fr = new FileReader();
      fr.onload = e => res(e.target.result);
      fr.readAsDataURL(f);
    }))).then(urls => {
      updateReports(reports.map(r =>
        r.id === imgModal ? { ...r, [type]: [...r[type], ...urls].slice(0, 10) } : r
      ));
    });
  };

  const removePhoto = (type, idx) =>
    updateReports(reports.map(r =>
      r.id === imgModal ? { ...r, [type]: r[type].filter((_, i) => i !== idx) } : r
    ));

  const stats = [
    { label: 'کل پذیرش‌ها',    value: reports.length,                                      icon: '📋', color: '#3b82f6' },
    { label: 'پذیرفته شده',    value: reports.filter(r => r.status === 'accepted').length, icon: '✅', color: '#10b981' },
    { label: 'تحویل داده شده', value: reports.filter(r => r.status === 'released').length, icon: '🚗', color: '#8b5cf6' },
    { label: 'در انتظار',      value: reports.filter(r => r.status === 'pending').length,  icon: '⏳', color: '#fbbf24' },
  ];

  /* ── Mini plate renderer — white LEFT, blue RIGHT (like everywhere else) ── */
  const MiniPlate = ({ plate }) => {
    const p = parsePlate(plate);
    return (
      <div className="irp-outer irp-sm" style={{ pointerEvents: 'none', flexShrink: 0 }}>
        <div className="irp-inner">
          <div className="irp-white">
            <span className="irp-num">{p.d3}</span>
            <span className="irp-sep">-</span>
            <span className="irp-letter">{p.letter}</span>
            <span className="irp-sep">-</span>
            <span className="irp-num">{p.d2}</span>
          </div>
          <div className="irp-blue">
            <span className="irp-stars">★ ★ ★</span>
            <div className="irp-emblem"><span className="irp-flag-g" /><span className="irp-flag-w" /><span className="irp-flag-r" /></div>
            <span className="irp-iran">ایران</span>
            <span className="irp-code">{p.code}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Layout title="گزارشات">
      <div className="stats-grid">
        {stats.map(s => (
          <div className="stat-card" key={s.label}>
            <div className="stat-icon" style={{ background: s.color + '22', color: s.color }}>{s.icon}</div>
            <div className="stat-info"><h4>{s.label}</h4><div className="stat-value">{s.value}</div></div>
          </div>
        ))}
      </div>

      {/* ── Filters ── */}
      <div className="filter-card no-print">
        <div className="filter-grid">
          <div className="form-group" style={{ margin: 0 }}>
            <label>وضعیت</label>
            <select value={filter.status} onChange={setF('status')}>
              <option value="">همه</option>
              <option value="accepted">پذیرفته شده</option>
              <option value="released">تحویل داده شده</option>
              <option value="pending">در انتظار</option>
              <option value="cancelled">انصراف</option>
            </select>
          </div>
          <div className="form-group" style={{ margin: 0 }}>
            <label>نام</label>
            <input placeholder="جستجو..." value={filter.name} onChange={setF('name')} />
          </div>
          <div className="form-group" style={{ margin: 0 }}>
            <label>موبایل</label>
            <input placeholder="09..." value={filter.mobile} onChange={setF('mobile')} />
          </div>
          <div className="form-group" style={{ margin: 0 }}>
            <label>کد پیگیری</label>
            <input placeholder="TH-..." value={filter.tracking} onChange={setF('tracking')} />
          </div>
          <div className="form-group" style={{ margin: 0 }}>
            <label>استاد کار</label>
            <input placeholder="نام استاد کار..." value={filter.master} onChange={setF('master')} />
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button className="btn-primary" style={{ width: '100%' }} onClick={() => openDoc('list')}>
              🖨️ چاپ همه
            </button>
          </div>
        </div>
      </div>

      {/* ── Report Cards ── */}
      {filtered.length === 0 ? (
        <div className="reports-empty no-print">🔍 نتیجه‌ای مطابق فیلترها یافت نشد</div>
      ) : (
        <div className="report-list">
          {pg.pageItems.map(r => (
            <div key={r.id} className="report-card">
              <div className="report-top">
                {/* Left */}
                <div className="report-left">
                  <div className="report-head-row">
                    <MiniPlate plate={r.plate} />
                    <span className={`badge ${STATUS[r.status].cls}`}>{STATUS[r.status].label}</span>
                  </div>
                  <div className="report-info-grid">
                    <div className="ri"><span>مالک</span>{r.owner}</div>
                    <div className="ri"><span>موبایل</span>{r.mobile}</div>
                    <div className="ri"><span>استاد کار</span>{r.master || '—'}</div>
                    <div className="ri"><span>کد پیگیری</span>{r.tracking}</div>
                    <div className="ri"><span>کیلومتر</span>{r.km.toLocaleString('fa-IR')} km</div>
                    <div className="ri"><span>سوخت</span>{r.fuel}</div>
                  </div>
                </div>
                {/* Right */}
                <div className="report-right">
                  <table className="cost-table">
                    <tbody>
                      <tr><td>صافکاری</td><td>{r.safkariCost.toLocaleString('fa-IR')} ت / {r.safkariDays} روز</td></tr>
                      <tr><td>نقاشی</td><td>{r.naghashiCost.toLocaleString('fa-IR')} ت / {r.naghashiDays} روز</td></tr>
                      <tr><td>کاور</td><td>{(r.coverCost || 0).toLocaleString('fa-IR')} ت / {r.coverDays || 0} روز</td></tr>
                      <tr><td>قطعات</td><td>{r.partsCost.toLocaleString('fa-IR')} تومان</td></tr>
                      <tr className="paid-row"><td>پرداخت</td><td>{r.paid.toLocaleString('fa-IR')} تومان</td></tr>
                      <tr><td>تخفیف</td><td>{r.discount.toLocaleString('fa-IR')} تومان</td></tr>
                      <tr className={r.remaining > 0 ? 'debt-row' : 'paid-row'}>
                        <td>مانده</td><td>{r.remaining.toLocaleString('fa-IR')} تومان</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Photo strip */}
              {(r.beforePhotos.length > 0 || r.afterPhotos.length > 0) && (
                <div className="report-photo-strip">
                  {r.beforePhotos.slice(0, 3).map((src, i) => (
                    <div key={`b${i}`} className="photo-thumb-wrap">
                      <img src={src} alt="" className="photo-thumb" onClick={() => setLightbox({ src, caption: 'قبل از تعمیر' })} />
                      <span className="photo-thumb-tag before">قبل</span>
                    </div>
                  ))}
                  {r.afterPhotos.slice(0, 3).map((src, i) => (
                    <div key={`a${i}`} className="photo-thumb-wrap">
                      <img src={src} alt="" className="photo-thumb" onClick={() => setLightbox({ src, caption: 'بعد از تعمیر' })} />
                      <span className="photo-thumb-tag after">بعد</span>
                    </div>
                  ))}
                  {(r.beforePhotos.length + r.afterPhotos.length) > 6 && (
                    <div className="photo-thumb-more" onClick={() => setImgModal(r.id)}>
                      +{r.beforePhotos.length + r.afterPhotos.length - 6}
                    </div>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="report-actions no-print">
                <button className="rpt-btn" onClick={() => openDoc('invoice', r)}>🧾 فاکتور</button>
                <button className="rpt-btn rpt-btn-contract" onClick={() => openDoc('contract', r)}>📄 قرارداد</button>
                <button className="rpt-btn rpt-btn-insurance" onClick={() => openDoc('insurance', r)}>🛡️ بیمه</button>

                {/* Edit — only for pending / accepted */}
                {(r.status === 'pending' || r.status === 'accepted') && (
                  <button className="rpt-btn rpt-btn-edit" onClick={() => setEditModal({ ...r })}>
                    ✏️ ویرایش
                  </button>
                )}

                {/* Deliver — only for pending / accepted */}
                {(r.status === 'pending' || r.status === 'accepted') && (
                  <button className="rpt-btn rpt-btn-success" onClick={() => deliver(r.id)}>
                    ✅ تحویل
                  </button>
                )}

                <button className="rpt-btn rpt-btn-photo" onClick={() => setImgModal(r.id)}>
                  🖼️ تصاویر
                  {(r.beforePhotos.length + r.afterPhotos.length) > 0 && (
                    <span className="photo-count-badge">{r.beforePhotos.length + r.afterPhotos.length}</span>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Pagination ── */}
      <Pagination
        page={pg.page} totalPages={pg.totalPages} onChange={goPage}
        shown={pg.pageItems.length} total={pg.total} noun="پرونده" />

      {/* ══════════════════════════════════
          Edit Modal
         ══════════════════════════════════ */}
      {editModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setEditModal(null)}>
          <div className="modal-box" style={{ maxWidth: 560 }}>
            <div className="modal-header">
              <h3>✏️ ویرایش پرونده — {editModal.owner}</h3>
              <button className="modal-close" onClick={() => setEditModal(null)}>✕</button>
            </div>

            <div className="edit-modal-grid">
              {/* وضعیت */}
              <div className="form-group">
                <label>وضعیت</label>
                <select value={editModal.status} onChange={setEF('status')}>
                  <option value="pending">در انتظار</option>
                  <option value="accepted">پذیرفته شده</option>
                  <option value="released">تحویل داده شده</option>
                  <option value="cancelled">انصراف</option>
                </select>
              </div>

              {/* سوخت */}
              <div className="form-group">
                <label>میزان سوخت</label>
                <select value={editModal.fuel} onChange={setEF('fuel')}>
                  {FUELS.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>

              {/* استاد کار */}
              <div className="form-group">
                <label>استاد کار</label>
                <select value={editModal.master || ''} onChange={setEF('master')}>
                  <option value="">بدون استاد کار</option>
                  {INIT_WORKERS.map(w => <option key={w.id} value={w.name}>{w.name} ({w.job})</option>)}
                </select>
              </div>

              {/* کیلومتر */}
              <div className="form-group">
                <label>کیلومتر</label>
                <input type="number" value={editModal.km} onChange={setEN('km')} min={0} />
              </div>

              {/* هزینه صافکاری */}
              <div className="form-group">
                <label>هزینه صافکاری (تومان)</label>
                <input type="number" value={editModal.safkariCost} onChange={setEN('safkariCost')} min={0} />
              </div>

              {/* روز صافکاری */}
              <div className="form-group">
                <label>روز صافکاری</label>
                <input type="number" value={editModal.safkariDays} onChange={setEN('safkariDays')} min={0} />
              </div>

              {/* هزینه نقاشی */}
              <div className="form-group">
                <label>هزینه نقاشی (تومان)</label>
                <input type="number" value={editModal.naghashiCost} onChange={setEN('naghashiCost')} min={0} />
              </div>

              {/* روز نقاشی */}
              <div className="form-group">
                <label>روز نقاشی</label>
                <input type="number" value={editModal.naghashiDays} onChange={setEN('naghashiDays')} min={0} />
              </div>

              {/* هزینه کاور */}
              <div className="form-group">
                <label>هزینه کاور (تومان)</label>
                <input type="number" value={editModal.coverCost || 0} onChange={setEN('coverCost')} min={0} />
              </div>

              {/* روز کاور */}
              <div className="form-group">
                <label>روز کاور</label>
                <input type="number" value={editModal.coverDays || 0} onChange={setEN('coverDays')} min={0} />
              </div>

              {/* هزینه قطعات */}
              <div className="form-group">
                <label>هزینه قطعات (تومان)</label>
                <input type="number" value={editModal.partsCost} onChange={setEN('partsCost')} min={0} />
              </div>

              {/* پرداخت شده */}
              <div className="form-group">
                <label>پرداخت شده (تومان)</label>
                <input type="number" value={editModal.paid} onChange={setEN('paid')} min={0} />
              </div>

              {/* تخفیف */}
              <div className="form-group">
                <label>تخفیف (تومان)</label>
                <input type="number" value={editModal.discount} onChange={setEN('discount')} min={0} />
              </div>

              {/* مانده */}
              <div className="form-group">
                <label>مانده (تومان)</label>
                <input type="number" value={editModal.remaining} onChange={setEN('remaining')} min={0} />
              </div>
            </div>

            <div className="edit-modal-footer">
              <button className="btn-primary" onClick={saveEdit}>💾 ذخیره تغییرات</button>
              <button className="btn-secondary btn-repairs" onClick={() => {
                updateReports(reports.map(r => r.id === editModal.id ? { ...editModal } : r));
                setEditModal(null);
                navigate(`/edit-repairs/${editModal.id}`);
              }}>
                🔧 ویرایش محل‌ها و هزینه‌ها
              </button>
              <button className="btn-secondary" onClick={() => setEditModal(null)}>انصراف</button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════
          Image Modal
         ══════════════════════════════════ */}
      {imgModal && modalRecord && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setImgModal(null)}>
          <div className="modal-box img-modal">
            <div className="modal-header">
              <h3>🖼️ تصاویر — {modalRecord.owner}</h3>
              <button className="modal-close" onClick={() => setImgModal(null)}>✕</button>
            </div>

            <div className="img-modal-cols">
              {/* Before */}
              <div className="img-col">
                <div className="img-col-header before-header">
                  <span>📷 قبل از تعمیر</span>
                  <span className="photo-count">{modalRecord.beforePhotos.length} تصویر</span>
                </div>
                <div className="upload-zone before-zone" onClick={() => beforeRef.current?.click()}>
                  <input ref={beforeRef} type="file" accept="image/*" multiple hidden
                    onChange={e => handleUpload('beforePhotos', e.target.files)} />
                  <span className="upload-icon">📁</span>
                  <span>افزودن تصویر قبل</span>
                  <span className="upload-hint">کلیک کنید یا فایل بکشید</span>
                </div>
                <div className="img-grid">
                  {modalRecord.beforePhotos.map((src, i) => (
                    <div key={i} className="img-thumb-wrap">
                      <img src={src} alt="" onClick={() => setLightbox({ src, caption: `قبل — ${i + 1}` })} />
                      <button className="img-remove" onClick={() => removePhoto('beforePhotos', i)}>✕</button>
                    </div>
                  ))}
                  {modalRecord.beforePhotos.length === 0 && <div className="img-empty">هنوز تصویری ثبت نشده</div>}
                </div>
              </div>

              {/* After */}
              <div className="img-col">
                <div className="img-col-header after-header">
                  <span>📷 بعد از تعمیر</span>
                  <span className="photo-count">{modalRecord.afterPhotos.length} تصویر</span>
                </div>
                <div className="upload-zone after-zone" onClick={() => afterRef.current?.click()}>
                  <input ref={afterRef} type="file" accept="image/*" multiple hidden
                    onChange={e => handleUpload('afterPhotos', e.target.files)} />
                  <span className="upload-icon">📁</span>
                  <span>افزودن تصویر بعد</span>
                  <span className="upload-hint">کلیک کنید یا فایل بکشید</span>
                </div>
                <div className="img-grid">
                  {modalRecord.afterPhotos.map((src, i) => (
                    <div key={i} className="img-thumb-wrap">
                      <img src={src} alt="" onClick={() => setLightbox({ src, caption: `بعد — ${i + 1}` })} />
                      <button className="img-remove" onClick={() => removePhoto('afterPhotos', i)}>✕</button>
                    </div>
                  ))}
                  {modalRecord.afterPhotos.length === 0 && <div className="img-empty">هنوز تصویری ثبت نشده</div>}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
              <button className="btn-primary" onClick={() => setImgModal(null)}>بستن</button>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox */}
      {lightbox && (
        <div className="lightbox-overlay" onClick={() => setLightbox(null)}>
          <div className="lightbox-box">
            <button className="lightbox-close" onClick={() => setLightbox(null)}>✕</button>
            <img src={lightbox.src} alt="" className="lightbox-img" />
            <p className="lightbox-caption">{lightbox.caption}</p>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════
          Document Preview (invoice / contract / insurance / full list)
         ══════════════════════════════════ */}
      {docModal && (
        <div className="modal-overlay inv-overlay no-print" onClick={e => e.target === e.currentTarget && setDocModal(null)}>
          <div className={`inv-modal ${docModal.type === 'list' ? 'inv-modal-wide' : ''}`}>
            <div className="inv-bar">
              <h3>{DOC_TITLES[docModal.type]}</h3>
              <div className="inv-bar-actions">
                <button className="btn-primary" onClick={() => window.print()}>🖨️ چاپ</button>
                <button className="inv-bar-close" onClick={() => setDocModal(null)}>✕</button>
              </div>
            </div>
            <div className="inv-scroll">{renderDoc(docModal)}</div>
          </div>
        </div>
      )}

      {/* Print mount — portaled to <body> so the app layout / animations / margins
          never interfere. With a document open it prints that document; otherwise
          Ctrl+P (or چاپ همه) prints the full filtered list. */}
      {createPortal(
        <div className="print-mount">
          {docModal ? renderDoc(docModal) : <ReportsListDoc reports={filtered} />}
        </div>,
        document.body
      )}

      {/* ══════════════════════════════════
          Repairs Editor Modal
         ══════════════════════════════════ */}
      {repairsModal && (() => {
        const matchingJob = REPAIR_JOB[repairForm.type];
        const suggestedWorkers = INIT_WORKERS.filter(w => w.job === matchingJob);
        const otherWorkers     = INIT_WORKERS.filter(w => w.job !== matchingJob);
        const record = reports.find(r => r.id === repairsModal.reportId);
        return (
          <div className="modal-overlay repairs-overlay" onClick={e => e.target === e.currentTarget && setRepairsModal(null)}>
            <div className="modal-box repairs-modal-box">
              <div className="modal-header">
                <h3>🔧 ویرایش محل‌ها و هزینه‌ها — {record?.owner}</h3>
                <button className="modal-close" onClick={() => setRepairsModal(null)}>✕</button>
              </div>

              {/* Parts selector */}
              <div className="repairs-parts-section">
                <div className="repairs-parts-hint">محل‌های مورد نظر را انتخاب کنید:</div>
                {Object.entries(CATEGORIES).map(([key, cat]) => (
                  <div key={key} className="repairs-cat">
                    <div className="repairs-cat-label">{cat.label}</div>
                    <div className="parts-grid">
                      {cat.parts.map(part => (
                        <button key={part} type="button"
                          className={`part-chip ${repairsModal.selected.includes(part) ? 'selected' : ''}`}
                          onClick={() => togglePart(part)}>
                          {part}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Add repair form */}
              <div className="repairs-add-form">
                <div className="repairs-add-title">➕ افزودن آیتم تعمیر</div>
                <form onSubmit={addRepairItem} noValidate>
                  <div className="repairs-form-grid">
                    <div className="form-group" style={{ margin: 0 }}>
                      <label>نوع تعمیر</label>
                      <select value={repairForm.type} onChange={setRF('type')}>
                        {REPAIR_TYPES.map(t => <option key={t}>{t}</option>)}
                      </select>
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label>استاد کار</label>
                      <select value={repairForm.worker} onChange={setRF('worker')}>
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
                    <div className={`form-group ${repairErrors.location ? 'field-invalid' : ''}`} style={{ margin: 0 }}>
                      <label>محل تعمیر</label>
                      <select value={repairForm.location} onChange={setRF('location')}>
                        <option value="">انتخاب کنید</option>
                        {repairsModal.selected.map(p => <option key={p} value={p}>{p}</option>)}
                        {repairForm.location && !repairsModal.selected.includes(repairForm.location) &&
                          <option value={repairForm.location}>{repairForm.location}</option>}
                      </select>
                      {repairErrors.location && <span className="field-error">{repairErrors.location}</span>}
                    </div>
                    <div className={`form-group ${repairErrors.price ? 'field-invalid' : ''}`} style={{ margin: 0 }}>
                      <label>هزینه (تومان)</label>
                      <input type="text" inputMode="numeric"
                        value={groupNum(repairForm.price)} onChange={setRNum('price')}
                        placeholder="مثال: 500,000" style={{ direction: 'ltr', textAlign: 'right' }} />
                      {repairErrors.price && <span className="field-error">{repairErrors.price}</span>}
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label>تخفیف (تومان)</label>
                      <input type="text" inputMode="numeric"
                        value={groupNum(repairForm.discount)} onChange={setRNum('discount')}
                        placeholder="اختیاری" style={{ direction: 'ltr', textAlign: 'right' }} />
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label>روز</label>
                      <input type="number" value={repairForm.days} onChange={setRF('days')} placeholder="مثال: 2" min={0} />
                    </div>
                  </div>
                  <button type="submit" className="btn-primary" style={{ marginTop: 10 }}>+ افزودن آیتم</button>
                </form>
              </div>

              {/* Repairs list */}
              {repairsModal.repairs.length > 0 && (
                <div className="repairs-list-section">
                  <div className="repairs-add-title">📋 آیتم‌های ثبت‌شده ({repairsModal.repairs.length})</div>
                  <div style={{ overflowX: 'auto' }}>
                    <table className="data-table">
                      <thead>
                        <tr><th>نوع</th><th>استاد کار</th><th>محل</th><th>هزینه</th><th>تخفیف</th><th>روز</th><th>عملیات</th></tr>
                      </thead>
                      <tbody>
                        {repairsModal.repairs.map(item => (
                          editingRepair?.id === item.id ? (
                            <tr key={item.id} className="repair-edit-row">
                              <td>
                                <select value={editingRepair.type} onChange={e => setEditingRepair(x => ({ ...x, type: e.target.value }))}>
                                  {REPAIR_TYPES.map(t => <option key={t}>{t}</option>)}
                                </select>
                              </td>
                              <td>
                                <select value={editingRepair.worker} onChange={e => setEditingRepair(x => ({ ...x, worker: e.target.value }))}>
                                  <option value="">—</option>
                                  {INIT_WORKERS.map(w => <option key={w.id} value={w.name}>{w.name}</option>)}
                                </select>
                              </td>
                              <td>
                                <select value={editingRepair.location} onChange={e => setEditingRepair(x => ({ ...x, location: e.target.value }))}>
                                  {repairsModal.selected.map(p => <option key={p} value={p}>{p}</option>)}
                                  {editingRepair.location && !repairsModal.selected.includes(editingRepair.location) &&
                                    <option value={editingRepair.location}>{editingRepair.location}</option>}
                                </select>
                              </td>
                              <td>
                                <input type="text" inputMode="numeric" style={{ width: 100, direction: 'ltr' }}
                                  value={groupNum(editingRepair.price)}
                                  onChange={e => setEditingRepair(x => ({ ...x, price: e.target.value.replace(/[^0-9]/g, '') }))} />
                              </td>
                              <td>
                                <input type="text" inputMode="numeric" style={{ width: 90, direction: 'ltr' }}
                                  value={groupNum(editingRepair.discount)}
                                  onChange={e => setEditingRepair(x => ({ ...x, discount: e.target.value.replace(/[^0-9]/g, '') }))} />
                              </td>
                              <td>
                                <input type="number" style={{ width: 60 }} value={editingRepair.days}
                                  onChange={e => setEditingRepair(x => ({ ...x, days: e.target.value }))} />
                              </td>
                              <td style={{ whiteSpace: 'nowrap' }}>
                                <button className="action-btn action-btn-approve" title="ذخیره" onClick={saveEditRepair}>✓</button>
                                <button className="action-btn" title="لغو" onClick={() => setEditingRepair(null)}>✕</button>
                              </td>
                            </tr>
                          ) : (
                            <tr key={item.id}>
                              <td><span className={`badge ${item.type === 'صافکاری' ? 'badge-success' : item.type === 'کاور' ? 'badge-warning' : 'badge-info'}`}>{item.type}</span></td>
                              <td>{item.worker || '—'}</td>
                              <td>{item.location}</td>
                              <td style={{ direction: 'ltr', textAlign: 'right' }}>{parseInt(item.price || 0).toLocaleString('fa-IR')} ت</td>
                              <td style={{ direction: 'ltr', textAlign: 'right' }}>{item.discount ? `${parseInt(item.discount).toLocaleString('fa-IR')} ت` : '—'}</td>
                              <td>{item.days ? `${item.days} روز` : '—'}</td>
                              <td style={{ whiteSpace: 'nowrap' }}>
                                <button className="action-btn action-btn-edit" title="ویرایش" onClick={() => startEditRepair(item)}>✏️</button>
                                <button className="action-btn action-btn-delete" title="حذف" onClick={() => deleteRepairItem(item.id)}>🗑️</button>
                              </td>
                            </tr>
                          )
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Live cost summary */}
              {repairsModal.repairs.length > 0 && (() => {
                const t = calcRepairTotals(repairsModal.repairs);
                const report = reports.find(x => x.id === repairsModal.reportId);
                const totalCost = t.safkariCost + t.naghashiCost + t.coverCost + (report?.partsCost || 0);
                const remaining = Math.max(0, totalCost - (report?.discount || 0) - (report?.paid || 0));
                return (
                  <div style={{ background: 'var(--input-bg)', border: '1px solid var(--border)', borderRadius: 10, padding: '12px 16px', marginTop: 14, display: 'flex', flexWrap: 'wrap', gap: '10px 24px', fontSize: 13 }}>
                    {t.safkariCost > 0 && <span>صافکاری: <strong>{t.safkariCost.toLocaleString('fa-IR')} ت</strong></span>}
                    {t.naghashiCost > 0 && <span>نقاشی: <strong>{t.naghashiCost.toLocaleString('fa-IR')} ت</strong></span>}
                    {t.coverCost > 0 && <span>کاور: <strong>{t.coverCost.toLocaleString('fa-IR')} ت</strong></span>}
                    <span style={{ marginRight: 'auto', color: 'var(--primary)', fontWeight: 700 }}>
                      جمع کل: {totalCost.toLocaleString('fa-IR')} ت
                    </span>
                    <span style={{ color: remaining > 0 ? '#ef4444' : '#10b981', fontWeight: 700 }}>
                      مانده: {remaining.toLocaleString('fa-IR')} ت
                    </span>
                  </div>
                );
              })()}

              <div className="edit-modal-footer" style={{ marginTop: 16 }}>
                <button className="btn-primary" onClick={saveRepairsModal}>💾 ذخیره</button>
                <button className="btn-secondary" onClick={() => setRepairsModal(null)}>انصراف</button>
              </div>
            </div>
          </div>
        );
      })()}

      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </Layout>
  );
}
