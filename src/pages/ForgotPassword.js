import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import FieldError from '../components/FieldError';
import SafyarLogo from '../components/SafyarLogo';
import './Auth.css';

const USERS = {
  '1234567890': '09121234567',
  '0987654321': '09351234567',
};

export default function ForgotPassword() {
  const navigate = useNavigate();
  const { theme, toggle } = useTheme();
  const [step, setStep] = useState(1);
  const [national, setNational] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(60);
  const [passwords, setPasswords] = useState({ pass: '', confirm: '' });
  const [mobile, setMobile] = useState('');
  const [errors, setErrors] = useState({});
  const otpRefs = useRef([]);

  useEffect(() => {
    let interval;
    if (step === 2 && timer > 0) {
      interval = setInterval(() => setTimer(t => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  const handleStep1 = (e) => {
    e.preventDefault();
    if (!national.trim())  { setErrors({ national: 'کد ملی را وارد کنید' }); return; }
    if (!USERS[national])  { setErrors({ national: 'کد ملی یافت نشد' }); return; }
    setErrors({});
    setMobile(USERS[national]);
    setStep(2);
    setTimer(60);
  };

  const handleOtpChange = (i, val) => {
    const newOtp = [...otp];
    newOtp[i] = val.slice(-1);
    setOtp(newOtp);
    if (val && i < 5) otpRefs.current[i + 1]?.focus();
  };

  const handleStep2 = (e) => {
    e.preventDefault();
    if (otp.join('') === '123456' || otp.every(d => d)) { setErrors({}); setStep(3); }
    else setErrors({ otp: 'کد تایید اشتباه است' });
  };

  const handleStep3 = (e) => {
    e.preventDefault();
    const errs = {};
    if (!passwords.pass)                          errs.pass = 'رمز عبور جدید را وارد کنید';
    else if (passwords.pass.length < 6)           errs.pass = 'رمز عبور باید حداقل ۶ کاراکتر باشد';
    if (!passwords.confirm)                        errs.confirm = 'تکرار رمز عبور را وارد کنید';
    else if (passwords.pass !== passwords.confirm) errs.confirm = 'رمز عبور و تکرار آن یکسان نیستند';
    if (Object.keys(errs).length) { setErrors(errs); return; }
    navigate('/login');
  };

  return (
    <div className="auth-page">
      <button className="auth-theme-toggle" onClick={toggle}>
        {theme === 'night' ? '☀️' : '🌙'}
      </button>

      <div className="auth-card">
        <div className="auth-logo">
          <SafyarLogo size={72} />
          <h1 className="auth-logo-text">بازیابی رمز</h1>
          <p className="auth-tagline">فراموشی رمز عبور</p>
        </div>

        <div className="step-indicator">
          {[1, 2, 3].map(s => (
            <div key={s} className={`step-dot ${step >= s ? 'active' : ''}`} />
          ))}
        </div>

        {step === 1 && (
          <form onSubmit={handleStep1} noValidate>
            <div className={`form-group ${errors.national ? 'field-invalid' : ''}`}>
              <label>کد ملی</label>
              <input
                type="text"
                placeholder="کد ملی ۱۰ رقمی"
                value={national}
                onChange={e => { setNational(e.target.value); if (errors.national) setErrors({}); }}
                maxLength={10}
              />
              <FieldError msg={errors.national} />
            </div>
            <button type="submit" className="btn-primary" style={{ width: '100%', padding: '12px' }}>
              دریافت کد تایید
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleStep2} noValidate>
            <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--text2)', marginBottom: 16 }}>
              کد تایید به {mobile} ارسال شد
            </p>
            <div className={`otp-inputs ${errors.otp ? 'field-invalid' : ''}`}>
              {otp.map((d, i) => (
                <input
                  key={i}
                  ref={el => otpRefs.current[i] = el}
                  className="otp-input"
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={d}
                  onChange={e => { handleOtpChange(i, e.target.value); if (errors.otp) setErrors({}); }}
                />
              ))}
            </div>
            {errors.otp && <div style={{ display: 'flex', justifyContent: 'center', marginTop: 8 }}><FieldError msg={errors.otp} /></div>}
            <div className="otp-timer">
              {timer > 0 ? `ارسال مجدد تا ${timer} ثانیه دیگر` : (
                <button type="button" onClick={() => setTimer(60)}
                  style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontFamily: 'inherit' }}>
                  ارسال مجدد کد
                </button>
              )}
            </div>
            <button type="submit" className="btn-primary" style={{ width: '100%', padding: '12px' }}>
              تایید
            </button>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handleStep3} noValidate>
            <div className={`form-group ${errors.pass ? 'field-invalid' : ''}`}>
              <label>رمز عبور جدید</label>
              <input
                type="password"
                placeholder="حداقل ۶ کاراکتر"
                value={passwords.pass}
                onChange={e => { setPasswords({ ...passwords, pass: e.target.value }); if (errors.pass) setErrors(p => ({ ...p, pass: undefined })); }}
              />
              <FieldError msg={errors.pass} />
            </div>
            <div className={`form-group ${errors.confirm ? 'field-invalid' : ''}`}>
              <label>تکرار رمز عبور جدید</label>
              <input
                type="password"
                placeholder="تکرار رمز عبور"
                value={passwords.confirm}
                onChange={e => { setPasswords({ ...passwords, confirm: e.target.value }); if (errors.confirm) setErrors(p => ({ ...p, confirm: undefined })); }}
              />
              <FieldError msg={errors.confirm} />
            </div>
            <button type="submit" className="btn-primary" style={{ width: '100%', padding: '12px' }}>
              تغییر رمز عبور
            </button>
          </form>
        )}

        <p className="auth-switch">
          <Link to="/login">بازگشت به ورود</Link>
        </p>
      </div>
    </div>
  );
}
