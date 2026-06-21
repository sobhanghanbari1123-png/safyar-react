import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import IranPlate from '../components/IranPlate';
import FieldError from '../components/FieldError';
import './Wizard.css';

const PLATE = { p1: '۲۴', letter: 'د', p2: '۲۴۲', p3: '۱۱' };

export default function RegisterKmFuel() {
  const navigate = useNavigate();
  const { theme, toggle } = useTheme();
  const [form, setForm] = useState({ km: '', fuel: '' });
  const [errors, setErrors] = useState({});

  const set = k => v => {
    setForm({ ...form, [k]: v });
    if (errors[k]) setErrors(p => ({ ...p, [k]: undefined }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = {};
    if (!form.km)   errs.km   = 'کیلومتر خودرو را وارد کنید';
    if (!form.fuel) errs.fuel = 'میزان سوخت را انتخاب کنید';
    if (Object.keys(errs).length) { setErrors(errs); return; }
    navigate('/choose-place-price');
  };

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
        <div className="wizard-step active"><div className="step-num">۱</div><span>ثبت کیلومتر</span></div>
        <div className="wizard-step-line" />
        <div className="wizard-step"><div className="step-num">۲</div><span>انتخاب قطعات</span></div>
        <div className="wizard-step-line" />
        <div className="wizard-step"><div className="step-num">۳</div><span>تصاویر</span></div>
        <div className="wizard-step-line" />
        <div className="wizard-step"><div className="step-num">۴</div><span>وضعیت</span></div>
      </div>

      <div className="wizard-card">
        <h2 className="wizard-card-title">ثبت کیلومتر و میزان سوخت</h2>

        <div style={{ display: 'flex', justifyContent: 'center', margin: '20px 0' }}>
          <IranPlate d2={PLATE.p1} letter={PLATE.letter} d3={PLATE.p2} code={PLATE.p3} />
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className={`form-group ${errors.km ? 'field-invalid' : ''}`}>
            <label>کیلومتر خودرو</label>
            <input
              type="number"
              placeholder="مثال: 45000"
              value={form.km}
              onChange={e => set('km')(e.target.value)}
            />
            <FieldError msg={errors.km} />
          </div>

          <div className={`form-group ${errors.fuel ? 'field-invalid' : ''}`}>
            <label>میزان سوخت</label>
            <select value={form.fuel} onChange={e => set('fuel')(e.target.value)}>
              <option value="">انتخاب کنید</option>
              <option value="پر">پر</option>
              <option value="سه‌چهارم">سه‌چهارم</option>
              <option value="نصف">نصف</option>
              <option value="یک‌چهارم">یک‌چهارم</option>
              <option value="خالی">خالی</option>
            </select>
            <FieldError msg={errors.fuel} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24 }}>
            <button type="button" className="btn-secondary" onClick={() => navigate('/')}>بازگشت</button>
            <button type="submit" className="btn-primary">مرحله بعد ←</button>
          </div>
        </form>
      </div>
    </div>
  );
}
