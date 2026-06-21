import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import IranPlate from '../components/IranPlate';
import './Wizard.css';

const PLATE = { p1: '۵۵', letter: 'ن', p2: '۱۳۴', p3: '۱۲' };

const SUMMARY = [
  { label: 'صافکاری', days: 3, amount: 800000 },
  { label: 'نقاشی', days: 2, amount: 500000 },
  { label: 'کاور', days: 1, amount: 300000 },
];
const DISCOUNT = 150000;

const badgeClass = (label) =>
  label === 'صافکاری' ? 'badge-success'
  : label === 'کاور'  ? 'badge-warning'
  : 'badge-info';

export default function ChoosePhoto() {
  const navigate = useNavigate();
  const { theme, toggle } = useTheme();
  const [photos, setPhotos] = useState([]);
  const fileRef = useRef();

  const handleFiles = (e) => {
    const files = Array.from(e.target.files);
    if (photos.length + files.length > 4) return alert('حداکثر ۴ تصویر مجاز است');
    const newPhotos = files.map(f => ({ id: Date.now() + Math.random(), url: URL.createObjectURL(f), name: f.name }));
    setPhotos([...photos, ...newPhotos]);
  };

  const removePhoto = (id) => setPhotos(photos.filter(p => p.id !== id));

  const total = SUMMARY.reduce((a, s) => a + s.amount, 0);
  const payable = total - DISCOUNT;

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
        <div className="wizard-step"><div className="step-num">✓</div><span>انتخاب قطعات</span></div>
        <div className="wizard-step-line" />
        <div className="wizard-step active"><div className="step-num">۳</div><span>تصاویر</span></div>
        <div className="wizard-step-line" />
        <div className="wizard-step"><div className="step-num">۴</div><span>وضعیت</span></div>
      </div>

      <div className="wizard-card">
        <h2 className="wizard-card-title">ثبت نهایی درخواست</h2>

        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
          <IranPlate d2={PLATE.p1} letter={PLATE.letter} d3={PLATE.p2} code={PLATE.p3} />
        </div>

        {/* Photo upload */}
        <div
          className="photo-upload-area"
          onClick={() => photos.length < 4 && fileRef.current.click()}
        >
          <div style={{ fontSize: 32, marginBottom: 8 }}>📷</div>
          <p style={{ margin: 0 }}>برای افزودن تصویر کلیک کنید (حداکثر ۴ تصویر)</p>
          <p style={{ margin: '4px 0 0', fontSize: 12 }}>{photos.length}/4 تصویر انتخاب شده</p>
        </div>
        <input ref={fileRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={handleFiles} />

        {photos.length > 0 && (
          <div className="photo-previews" style={{ marginBottom: 20 }}>
            {photos.map(p => (
              <div key={p.id} className="photo-preview">
                <img src={p.url} alt={p.name} />
                <button className="photo-remove" onClick={() => removePhoto(p.id)}>✕</button>
              </div>
            ))}
          </div>
        )}

        {/* Summary */}
        <div style={{ background: 'var(--bg)', borderRadius: 10, padding: 16, marginBottom: 20, border: '1px solid var(--border)' }}>
          <h4 style={{ margin: '0 0 12px', fontSize: 14 }}>خلاصه هزینه‌ها</h4>
          <table className="data-table">
            <thead><tr><th>خدمت</th><th>روز</th><th>مبلغ (تومان)</th></tr></thead>
            <tbody>
              {SUMMARY.map(s => (
                <tr key={s.label}>
                  <td><span className={`badge ${badgeClass(s.label)}`}>{s.label}</span></td>
                  <td>{s.days} روز</td>
                  <td>{s.amount.toLocaleString('fa-IR')}</td>
                </tr>
              ))}
              <tr>
                <td colSpan={2} style={{ color: 'var(--text2)', borderTop: '2px solid var(--border)' }}>جمع کل</td>
                <td style={{ color: 'var(--text2)', borderTop: '2px solid var(--border)' }}>{total.toLocaleString('fa-IR')}</td>
              </tr>
              <tr>
                <td colSpan={2} style={{ color: '#dc2626', fontWeight: 600 }}>تخفیف</td>
                <td style={{ color: '#dc2626', fontWeight: 600 }}>({DISCOUNT.toLocaleString('fa-IR')})</td>
              </tr>
              <tr>
                <td colSpan={2} style={{ fontWeight: 800 }}>مبلغ قابل پرداخت</td>
                <td style={{ fontWeight: 800, color: 'var(--primary)' }}>{payable.toLocaleString('fa-IR')}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <button className="btn-secondary" onClick={() => navigate('/choose-place-price')}>← بازگشت</button>
          <button className="btn-primary" onClick={() => navigate('/status')}>تعیین وضعیت درخواست ←</button>
        </div>
      </div>
    </div>
  );
}
