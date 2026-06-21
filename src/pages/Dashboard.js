import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import IranPlateInput from '../components/IranPlateInput';
import { ToastContainer, useToast } from '../components/Toast';
import FieldError from '../components/FieldError';
import Pagination, { usePagination } from '../components/Pagination';
import { normDigits } from '../utils/normalize';
import './Dashboard.css';

const SAMPLE_CUSTOMERS = [
  { id: 1, name: 'علی احمدی',  gender: 'آقا',  mobile: '09121234567', plate: '۳۴۵-الف-۱۲-۶۷', address: 'تهران، خیابان ولیعصر',   carColor: 'نقره‌ای' },
  { id: 2, name: 'مریم رضایی', gender: 'خانم', mobile: '09351234567', plate: '۴۵۶-ب-۲۳-۷۸',  address: 'مشهد، خیابان احمدآباد', carColor: 'مشکی'    },
];

const emptyPlate    = { d2: '', letter: '', d3: '', code: '' };
const emptyCustomer = { name: '', gender: '', mobile: '', address: '', carColor: '', carName: '' };

export default function Dashboard() {
  const navigate = useNavigate();
  const { toasts, removeToast, success, error, info } = useToast();

  const [searchPlate, setSearchPlate]   = useState(emptyPlate);
  const [mobileSearch, setMobileSearch] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [showAddForm, setShowAddForm]   = useState(false);
  const [customers, setCustomers]       = useState(SAMPLE_CUSTOMERS);
  const [newCustomer, setNewCustomer]   = useState(emptyCustomer);
  const [newPlate, setNewPlate]         = useState(emptyPlate);
  const [tableSearch, setTableSearch]   = useState('');
  const [detailCustomer, setDetailCustomer] = useState(null);
  const [smsModal, setSmsModal]             = useState(null); // customer object
  const [smsText,  setSmsText]              = useState('');
  const [formErrors, setFormErrors]         = useState({});

  const nc = (k, v) => {
    setNewCustomer(p => ({ ...p, [k]: v }));
    if (formErrors[k]) setFormErrors(prev => ({ ...prev, [k]: undefined }));
  };

  const closeAddForm = () => { setShowAddForm(false); setFormErrors({}); };

  const handlePlateSearch = () => {
    const q = searchPlate.d3;
    if (!q) { info('لطفاً پلاک را وارد کنید'); return; }
    const qn = normDigits(q);
    const found = customers.find(c => normDigits(c.plate).includes(qn));
    setSearchResult(found || null);
    if (!found) error('مشتری با این پلاک یافت نشد');
    else info(`مشتری «${found.name}» پیدا شد`);
  };

  const handleMobileSearch = () => {
    if (!mobileSearch) { info('لطفاً شماره موبایل را وارد کنید'); return; }
    const found = customers.find(c => c.mobile === mobileSearch);
    setSearchResult(found || null);
    if (!found) error('مشتری با این شماره یافت نشد');
    else info(`مشتری «${found.name}» پیدا شد`);
  };

  const openSms = (c, e) => { e.stopPropagation(); setSmsModal(c); setSmsText(''); };
  const sendSms = () => {
    if (!smsText.trim()) { error('متن پیامک را وارد کنید'); return; }
    success(`پیامک به ${smsModal.mobile} ارسال شد ✓`);
    setSmsModal(null); setSmsText('');
  };

  const onPlateChange = (val) => {
    setNewPlate(val);
    if (formErrors.plate) setFormErrors(p => ({ ...p, plate: undefined }));
  };

  const handleAddCustomer = (e) => {
    e.preventDefault();
    const errs = {};
    if (!newCustomer.name.trim())        errs.name   = 'نام و نام خانوادگی را وارد کنید';
    if (!newCustomer.mobile.trim())      errs.mobile = 'شماره موبایل را وارد کنید';
    else if (!/^09\d{9}$/.test(newCustomer.mobile.trim()))
                                         errs.mobile = 'شماره موبایل باید با ۰۹ شروع شده و ۱۱ رقم باشد';
    if (!newCustomer.carName.trim())     errs.carName  = 'نام خودرو را وارد کنید';
    if (!newCustomer.carColor.trim())    errs.carColor = 'رنگ خودرو را وارد کنید';
    if (!(newPlate.d3 && newPlate.letter && newPlate.d2 && newPlate.code))
                                         errs.plate = 'پلاک خودرو را کامل وارد کنید';
    if (Object.keys(errs).length) {
      setFormErrors(errs);
      error('لطفاً خطاهای فرم را برطرف کنید');
      return;
    }
    const plate = `${newPlate.d3}-${newPlate.letter}-${newPlate.d2}-${newPlate.code}`;
    setCustomers(p => [...p, { id: Date.now(), ...newCustomer, plate }]);
    setNewCustomer(emptyCustomer);
    setNewPlate(emptyPlate);
    setFormErrors({});
    setShowAddForm(false);
    success('مشتری با موفقیت اضافه شد ✓');
  };

  /* Live filtered table */
  const filteredCustomers = useMemo(() => {
    const q = tableSearch.trim();
    if (!q) return customers;
    const qn = normDigits(q);
    return customers.filter(c =>
      c.name.includes(q) ||
      normDigits(c.mobile).includes(qn) ||
      normDigits(c.plate).includes(qn) ||
      (c.address || '').includes(q)
    );
  }, [customers, tableSearch]);

  /* Pagination — 10 customers per page, resets on search */
  const pg = usePagination(filteredCustomers, 10, tableSearch);

  const stats = [
    { label: 'مشتریان',        value: customers.length, icon: '👥', color: '#3b82f6', sub: 'ثبت شده' },
    { label: 'پذیرش امروز',    value: 3,                icon: '🚗', color: '#fbbf24', sub: 'خودرو' },
    { label: 'در حال تعمیر',   value: 7,                icon: '🔧', color: '#8b5cf6', sub: 'خودرو' },
    { label: 'تحویل داده شده', value: 12,               icon: '✅', color: '#10b981', sub: 'این ماه' },
  ];

  return (
    <Layout title="داشبورد">

      {/* ── Stats ── */}
      <div className="stats-grid">
        {stats.map(s => (
          <div className="stat-card" key={s.label}>
            <div className="stat-icon" style={{ background: s.color + '22', color: s.color }}>{s.icon}</div>
            <div className="stat-info">
              <h4>{s.label}</h4>
              <div className="stat-value">{s.value}</div>
              <div className="stat-sub">{s.sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Search ── */}
      <div className="dashboard-search-grid">
        <div className="search-card">
          <h3 className="search-card-title">🔍 جستجو با پلاک</h3>
          <div className="plate-input-wrap">
            <IranPlateInput value={searchPlate} onChange={setSearchPlate} />
          </div>
          <button className="btn-primary" style={{ width: '100%', marginTop: 12 }} onClick={handlePlateSearch}>
            جستجو با پلاک
          </button>
        </div>

        <div className="search-card">
          <h3 className="search-card-title">📱 جستجو با موبایل</h3>
          <div className="form-group">
            <input type="tel" placeholder="09xxxxxxxxx"
              value={mobileSearch} onChange={e => setMobileSearch(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleMobileSearch()} />
          </div>
          <button className="btn-primary" style={{ width: '100%' }} onClick={handleMobileSearch}>
            جستجو با موبایل
          </button>
        </div>
      </div>

      {searchResult && (
        <div className="search-result-card">
          <h4>نتیجه جستجو</h4>
          <div className="result-row"><span>نام:</span> {searchResult.name}</div>
          {searchResult.gender  && <div className="result-row"><span>جنسیت:</span> {searchResult.gender}</div>}
          <div className="result-row"><span>موبایل:</span> {searchResult.mobile}</div>
          <div className="result-row"><span>پلاک:</span> {searchResult.plate}</div>
          {searchResult.carName  && <div className="result-row"><span>خودرو:</span> {searchResult.carName}</div>}
          {searchResult.carColor && <div className="result-row"><span>رنگ خودرو:</span> {searchResult.carColor}</div>}
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <button className="btn-primary" onClick={() => navigate('/register-km-fuel')}>
              ➕ پذیرش خودرو
            </button>
            <button className="btn-secondary" onClick={() => { setDetailCustomer(searchResult); setSearchResult(null); }}>
              👁 جزئیات
            </button>
          </div>
        </div>
      )}

      {/* ── Add Customer ── */}
      <div className="dashboard-actions">
        <button className="btn-primary" onClick={() => { showAddForm ? closeAddForm() : setShowAddForm(true); }}>
          {showAddForm ? '✕ انصراف' : '➕ افزودن مشتری جدید'}
        </button>
      </div>

      {showAddForm && (
        <div className="add-form-card">
          <h3>افزودن مشتری جدید</h3>
          <form onSubmit={handleAddCustomer} noValidate>
            <div className="form-two-col">
              <div className={`form-group ${formErrors.name ? 'field-invalid' : ''}`}>
                <label>نام و نام خانوادگی <span className="req">*</span></label>
                <input type="text" value={newCustomer.name}
                  placeholder="مثلاً علی احمدی"
                  onChange={e => nc('name', e.target.value)} />
                <FieldError msg={formErrors.name} />
              </div>
              <div className={`form-group ${formErrors.mobile ? 'field-invalid' : ''}`}>
                <label>شماره موبایل <span className="req">*</span></label>
                <input type="tel" value={newCustomer.mobile}
                  placeholder="09xxxxxxxxx" style={{ direction: 'ltr', textAlign: 'right' }}
                  onChange={e => nc('mobile', e.target.value)} />
                <FieldError msg={formErrors.mobile} />
              </div>
            </div>

            <div className="form-group">
              <label>جنسیت</label>
              <div className="gender-radios">
                {['آقا', 'خانم'].map(g => (
                  <label key={g} className={`gender-option ${newCustomer.gender === g ? 'selected' : ''}`}>
                    <input type="radio" name="gender" value={g}
                      checked={newCustomer.gender === g}
                      onChange={() => nc('gender', g)} />
                    {g === 'آقا' ? '👨 آقا' : '👩 خانم'}
                  </label>
                ))}
              </div>
            </div>

            <div className="form-two-col">
              <div className={`form-group ${formErrors.carName ? 'field-invalid' : ''}`}>
                <label>نام خودرو <span className="req">*</span></label>
                <input type="text" placeholder="مثال: پراید، پژو ۲۰۶، سمند..."
                  value={newCustomer.carName}
                  onChange={e => nc('carName', e.target.value)} />
                <FieldError msg={formErrors.carName} />
              </div>
              <div className={`form-group ${formErrors.carColor ? 'field-invalid' : ''}`}>
                <label>رنگ خودرو <span className="req">*</span></label>
                <input type="text" placeholder="مثال: سفید، مشکی، نقره‌ای..."
                  value={newCustomer.carColor}
                  onChange={e => nc('carColor', e.target.value)} />
                <FieldError msg={formErrors.carColor} />
              </div>
            </div>

            <div className="form-group">
              <label>آدرس</label>
              <input type="text" value={newCustomer.address}
                onChange={e => nc('address', e.target.value)} />
            </div>

            <div className="form-group">
              <label>پلاک خودرو <span className="req">*</span></label>
              <div className={`plate-input-wrap ${formErrors.plate ? 'plate-invalid' : ''}`}>
                <IranPlateInput value={newPlate} onChange={onPlateChange} />
              </div>
              <FieldError msg={formErrors.plate} />
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
              <button type="submit" className="btn-primary">ذخیره مشتری</button>
              <button type="button" className="btn-secondary" onClick={closeAddForm}>انصراف</button>
            </div>
          </form>
        </div>
      )}

      {/* ── Table ── */}
      <div className="table-card">
        <div className="table-card-header">
          <span>آخرین مشتریان</span>
          <div className="table-live-search">
            <span className="tls-icon">🔍</span>
            <input
              type="text"
              placeholder="جستجو در جدول..."
              value={tableSearch}
              onChange={e => setTableSearch(e.target.value)}
            />
            {tableSearch && (
              <button className="tls-clear" onClick={() => setTableSearch('')}>✕</button>
            )}
          </div>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>نام</th>
                <th>جنسیت</th>
                <th>موبایل</th>
                <th>پلاک</th>
                <th>خودرو</th>
                <th>رنگ</th>
                <th>آدرس</th>
                <th>عملیات</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.length === 0 ? (
                <tr><td colSpan={8} className="empty-row">نتیجه‌ای یافت نشد</td></tr>
              ) : pg.pageItems.map(c => (
                <tr key={c.id} className="table-row-hover" onClick={() => setDetailCustomer(c)}>
                  <td>{c.name}</td>
                  <td>
                    <span className={`gender-badge ${c.gender === 'آقا' ? 'male' : 'female'}`}>
                      {c.gender === 'آقا' ? '👨 آقا' : c.gender === 'خانم' ? '👩 خانم' : '—'}
                    </span>
                  </td>
                  <td>{c.mobile}</td>
                  <td style={{ direction: 'ltr', textAlign: 'center', fontFamily: 'monospace', letterSpacing: 1 }}>{c.plate}</td>
                  <td>{c.carName || '—'}</td>
                  <td>{c.carColor || '—'}</td>
                  <td>{c.address}</td>
                  <td onClick={e => e.stopPropagation()}>
                    <div style={{ display:'flex', gap:4 }}>
                      <button className="action-btn action-btn-view"
                        onClick={() => navigate('/register-km-fuel')} title="پذیرش">🚗</button>
                      <button className="action-btn action-btn-sms"
                        onClick={e => openSms(c, e)} title="ارسال پیامک">💬</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {tableSearch && (
          <div className="table-result-count">
            {filteredCustomers.length} نتیجه از {customers.length} مشتری
          </div>
        )}
      </div>

      <Pagination
        page={pg.page} totalPages={pg.totalPages} onChange={pg.setPage}
        shown={pg.pageItems.length} total={pg.total} noun="مشتری" />

      {/* ── Customer Detail Modal ── */}
      {detailCustomer && (
        <div className="modal-overlay" onClick={() => setDetailCustomer(null)}>
          <div className="modal-box customer-detail-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>جزئیات مشتری</h3>
              <button className="modal-close" onClick={() => setDetailCustomer(null)}>✕</button>
            </div>
            <div className="customer-detail-body">
              <div className="cd-avatar">
                <span>{detailCustomer.gender === 'آقا' ? '👨' : detailCustomer.gender === 'خانم' ? '👩' : '👤'}</span>
              </div>
              <div className="cd-name">{detailCustomer.name}</div>
              <span className={`gender-badge ${detailCustomer.gender === 'آقا' ? 'male' : 'female'}`} style={{ margin: '0 auto 12px' }}>
                {detailCustomer.gender || '—'}
              </span>

              <div className="cd-info-grid">
                <div className="cd-info-item">
                  <span className="cd-info-label">📱 موبایل</span>
                  <span className="cd-info-value">{detailCustomer.mobile}</span>
                </div>
                <div className="cd-info-item">
                  <span className="cd-info-label">🚗 پلاک</span>
                  <span className="cd-info-value" style={{ direction: 'ltr', fontFamily: 'monospace' }}>{detailCustomer.plate}</span>
                </div>
                <div className="cd-info-item">
                  <span className="cd-info-label">🚘 نام خودرو</span>
                  <span className="cd-info-value">{detailCustomer.carName || '—'}</span>
                </div>
                <div className="cd-info-item">
                  <span className="cd-info-label">🎨 رنگ خودرو</span>
                  <span className="cd-info-value">{detailCustomer.carColor || '—'}</span>
                </div>
                <div className="cd-info-item cd-info-full">
                  <span className="cd-info-label">📍 آدرس</span>
                  <span className="cd-info-value">{detailCustomer.address || '—'}</span>
                </div>
              </div>

              <div className="cd-actions">
                <button className="btn-primary" onClick={() => { navigate('/register-km-fuel'); setDetailCustomer(null); }}>
                  ➕ پذیرش خودرو
                </button>
                <button className="btn-secondary" onClick={() => setDetailCustomer(null)}>بستن</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── SMS Modal ── */}
      {smsModal && (
        <div className="modal-overlay" onClick={() => setSmsModal(null)}>
          <div className="modal-box sms-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>💬 ارسال پیامک</h3>
              <button className="modal-close" onClick={() => setSmsModal(null)}>✕</button>
            </div>
            <div className="sms-modal-body">
              <div className="sms-recipient">
                <span className="sms-recipient-icon">{smsModal.gender === 'آقا' ? '👨' : smsModal.gender === 'خانم' ? '👩' : '👤'}</span>
                <div>
                  <div className="sms-recipient-name">{smsModal.name}</div>
                  <div className="sms-recipient-mobile">{smsModal.mobile}</div>
                </div>
              </div>

              <div className="sms-templates">
                <div className="sms-templates-label">متن‌های پیشنهادی:</div>
                <div className="sms-tpl-grid">
                  {[
                    'خودروی شما آماده تحویل است.',
                    'خودروی شما وارد مرحله نقاشی شد.',
                    'خودروی شما وارد مرحله صافکاری شد.',
                    'لطفاً برای تسویه حساب مراجعه فرمایید.',
                    'خدمات دوره‌ای خودروی شما فرا رسیده است.',
                  ].map(t => (
                    <button key={t} className="sms-tpl-btn" type="button"
                      onClick={() => setSmsText(t)}>{t}</button>
                  ))}
                </div>
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label>متن پیامک</label>
                <textarea
                  rows={4}
                  value={smsText}
                  onChange={e => setSmsText(e.target.value)}
                  placeholder="متن پیامک را اینجا بنویسید..."
                  className="sms-textarea"
                />
                <div className="sms-char-count">{smsText.length} کاراکتر</div>
              </div>

              <div className="sms-actions">
                <button className="btn-primary" onClick={sendSms}>📤 ارسال پیامک</button>
                <button className="btn-secondary" onClick={() => setSmsModal(null)}>انصراف</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </Layout>
  );
}
