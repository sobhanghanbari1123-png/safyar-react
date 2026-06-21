import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import FieldError from '../components/FieldError';
import { registerNewUser, loadContent } from '../data/admin';
import SafyarLogo from '../components/SafyarLogo';
import './Auth.css';

const genCaptcha = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  let code = '';
  for (let i = 0; i < 5; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
};

export default function Register() {
  const { theme, toggle } = useTheme();
  const [form, setForm] = useState({
    name: '', national: '', mobile: '', address: '',
    shop: '', password: '', confirm: '', captcha: ''
  });
  const [errors, setErrors] = useState({});
  const [captchaCode, setCaptchaCode] = useState(genCaptcha);
  const [done, setDone] = useState(false);
  const [support, setSupport] = useState(() => loadContent().support);

  const refreshCaptcha = () => {
    setCaptchaCode(genCaptcha());
    setForm(f => ({ ...f, captcha: '' }));
    setErrors(p => ({ ...p, captcha: undefined }));
  };

  const set = k => e => {
    setForm({ ...form, [k]: e.target.value });
    if (errors[k]) setErrors(p => ({ ...p, [k]: undefined }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = {};
    if (!form.name.trim())                            errs.name = 'نام و نام خانوادگی را وارد کنید';
    if (!form.national.trim())                        errs.national = 'کد ملی را وارد کنید';
    else if (!/^\d{10}$/.test(form.national.trim()))  errs.national = 'کد ملی باید ۱۰ رقم باشد';
    if (!form.mobile.trim())                          errs.mobile = 'شماره موبایل را وارد کنید';
    else if (!/^09\d{9}$/.test(form.mobile.trim()))   errs.mobile = 'شماره موبایل باید با ۰۹ شروع شده و ۱۱ رقم باشد';
    if (!form.password)                               errs.password = 'رمز عبور را وارد کنید';
    else if (form.password.length < 6)                errs.password = 'رمز عبور باید حداقل ۶ کاراکتر باشد';
    if (!form.confirm)                                errs.confirm = 'تکرار رمز عبور را وارد کنید';
    else if (form.password !== form.confirm)          errs.confirm = 'رمز عبور و تکرار آن یکسان نیستند';
    if (!form.captcha.trim())                         errs.captcha = 'کد امنیتی را وارد کنید';
    else if (form.captcha.trim().toUpperCase() !== captchaCode) errs.captcha = 'کد امنیتی اشتباه است';
    if (Object.keys(errs).length) {
      setErrors(errs);
      if (errs.captcha) refreshCaptcha();
      return;
    }
    registerNewUser(form);
    setDone(true);
  };

  if (done) {
    return (
      <div className="auth-page">
        <button className="auth-theme-toggle" onClick={toggle}>
          {theme === 'night' ? '☀️' : '🌙'}
        </button>
        <div className="auth-card auth-card-scroll">
          <div className="register-success">
            <div className="register-success-icon">✅</div>
            <h2 className="register-success-title">ثبت‌نام با موفقیت انجام شد</h2>
            <p className="register-success-msg">
              درخواست شما ثبت شد و <strong>در انتظار تأیید ادمین</strong> می‌باشد.
              پس از تأیید می‌توانید وارد سیستم شوید.
            </p>

            <div className="register-support-box">
              <div className="register-support-title">📞 در صورت نیاز با پشتیبانی تماس بگیرید</div>
              <div className="register-support-grid">
                <div className="register-support-item">
                  <span className="rs-label">تلفن ثابت</span>
                  <a className="rs-value" href={`tel:${support.phone}`}>{support.phone}</a>
                </div>
                <div className="register-support-item">
                  <span className="rs-label">موبایل</span>
                  <a className="rs-value" href={`tel:${support.mobile}`}>{support.mobile}</a>
                </div>
                <div className="register-support-item">
                  <span className="rs-label">ایمیل</span>
                  <a className="rs-value" href={`mailto:${support.email}`}>{support.email}</a>
                </div>
                <div className="register-support-item">
                  <span className="rs-label">ساعت پاسخگویی</span>
                  <span className="rs-value rs-hours">{support.hours}</span>
                </div>
              </div>
            </div>

            <Link to="/login" className="btn-primary" style={{ display: 'block', textAlign: 'center', padding: '12px', textDecoration: 'none', marginTop: 8 }}>
              بازگشت به صفحه ورود
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <button className="auth-theme-toggle" onClick={toggle}>
        {theme === 'night' ? '☀️' : '🌙'}
      </button>

      <div className="auth-card auth-card-scroll">
        <div className="auth-logo">
          <SafyarLogo size={80} />
          <h1 className="auth-logo-text">صافیار</h1>
          <p className="auth-tagline">ثبت نام در سیستم</p>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className={`form-group ${errors.name ? 'field-invalid' : ''}`}>
            <label>نام و نام خانوادگی</label>
            <input type="text" placeholder="نام کامل" value={form.name} onChange={set('name')} />
            <FieldError msg={errors.name} />
          </div>
          <div className={`form-group ${errors.national ? 'field-invalid' : ''}`}>
            <label>کد ملی</label>
            <input type="text" placeholder="کد ملی ۱۰ رقمی" value={form.national} onChange={set('national')} maxLength={10} />
            <FieldError msg={errors.national} />
          </div>
          <div className={`form-group ${errors.mobile ? 'field-invalid' : ''}`}>
            <label>شماره موبایل</label>
            <input type="tel" placeholder="09xxxxxxxxx" value={form.mobile} onChange={set('mobile')} style={{ direction: 'ltr', textAlign: 'right' }} />
            <FieldError msg={errors.mobile} />
          </div>
          <div className="form-group">
            <label>آدرس</label>
            <textarea placeholder="آدرس کامل" value={form.address} onChange={set('address')} rows={2} />
          </div>
          <div className="form-group">
            <label>نام تعمیرگاه</label>
            <input type="text" placeholder="نام تعمیرگاه یا شعبه" value={form.shop} onChange={set('shop')} />
          </div>
          <div className={`form-group ${errors.password ? 'field-invalid' : ''}`}>
            <label>رمز عبور</label>
            <input type="password" placeholder="حداقل ۶ کاراکتر" value={form.password} onChange={set('password')} />
            <FieldError msg={errors.password} />
          </div>
          <div className={`form-group ${errors.confirm ? 'field-invalid' : ''}`}>
            <label>تکرار رمز عبور</label>
            <input type="password" placeholder="تکرار رمز عبور" value={form.confirm} onChange={set('confirm')} />
            <FieldError msg={errors.confirm} />
          </div>
          <div className={`form-group ${errors.captcha ? 'field-invalid' : ''}`}>
            <label>کد امنیتی</label>
            <div className="captcha-row">
              <div className="captcha-code" aria-label="کد امنیتی">
                {captchaCode.split('').map((ch, i) => (
                  <span key={i} className="captcha-char">{ch}</span>
                ))}
              </div>
              <button type="button" className="captcha-refresh" onClick={refreshCaptcha} title="تغییر کد">⟳</button>
            </div>
            <input
              type="text"
              placeholder="کد بالا را وارد کنید"
              value={form.captcha}
              onChange={set('captcha')}
              maxLength={5}
              autoComplete="off"
              style={{ textTransform: 'uppercase', letterSpacing: 3, textAlign: 'center', direction: 'ltr' }}
            />
            <FieldError msg={errors.captcha} />
          </div>

          <button type="submit" className="btn-primary" style={{ width: '100%', padding: '12px' }}>
            ثبت نام
          </button>
        </form>

        <p className="auth-switch">
          قبلاً ثبت نام کرده‌اید؟ <Link to="/login">ورود</Link>
        </p>
      </div>
    </div>
  );
}
