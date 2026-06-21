import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import FieldError from '../components/FieldError';
import { getUserStatus } from '../data/admin';
import SafyarLogo from '../components/SafyarLogo';
import './Auth.css';

export default function Login() {
  const navigate = useNavigate();
  const { theme, toggle } = useTheme();
  const [form, setForm] = useState({ national: '', password: '' });
  const [errors, setErrors] = useState({});
  const [blockMsg, setBlockMsg] = useState('');

  const set = k => e => {
    setForm({ ...form, [k]: e.target.value });
    if (errors[k]) setErrors(p => ({ ...p, [k]: undefined }));
    if (blockMsg) setBlockMsg('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = {};
    if (!form.national.trim()) errs.national = 'کد ملی را وارد کنید';
    if (!form.password)        errs.password = 'رمز عبور را وارد کنید';
    if (Object.keys(errs).length) { setErrors(errs); return; }

    const national = form.national.trim();
    const status = getUserStatus(national);

    if (status === 'pending') {
      setBlockMsg('pending');
      return;
    }
    if (status === 'rejected') {
      setBlockMsg('rejected');
      return;
    }

    localStorage.setItem('current_user', national);
    navigate('/');
  };

  return (
    <div className="auth-page">
      <button className="auth-theme-toggle" onClick={toggle}>
        {theme === 'night' ? '☀️' : '🌙'}
      </button>

      <div className="auth-card">
        <div className="auth-logo">
          <SafyarLogo size={80} />
          <h1 className="auth-logo-text">صافیار</h1>
          <p className="auth-tagline">سیستم مدیریت تعمیرگاه</p>
        </div>

        {blockMsg === 'pending' && (
          <div className="auth-block-msg auth-block-pending">
            <span>⏳</span>
            <div>
              <strong>حساب شما در انتظار تأیید است</strong>
              <p>ادمین سیستم باید حساب شما را تأیید کند. لطفاً صبر کنید یا با پشتیبانی تماس بگیرید.</p>
              <a href="http://localhost:3001" target="_blank" rel="noreferrer" className="auth-block-help-link">📞 مشاهده اطلاعات پشتیبانی ←</a>
            </div>
          </div>
        )}

        {blockMsg === 'rejected' && (
          <div className="auth-block-msg auth-block-rejected">
            <span>❌</span>
            <div>
              <strong>حساب شما رد شده است</strong>
              <p>برای اطلاعات بیشتر با پشتیبانی سیستم تماس بگیرید.</p>
              <a href="http://localhost:3001" target="_blank" rel="noreferrer" className="auth-block-help-link">📞 مشاهده اطلاعات پشتیبانی ←</a>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className={`form-group ${errors.national ? 'field-invalid' : ''}`}>
            <label>کد ملی</label>
            <input
              type="text"
              placeholder="کد ملی خود را وارد کنید"
              value={form.national}
              onChange={set('national')}
              maxLength={10}
            />
            <FieldError msg={errors.national} />
          </div>

          <div className={`form-group ${errors.password ? 'field-invalid' : ''}`}>
            <label>رمز عبور</label>
            <input
              type="password"
              placeholder="رمز عبور خود را وارد کنید"
              value={form.password}
              onChange={set('password')}
            />
            <FieldError msg={errors.password} />
          </div>

          <Link to="/forgot-password" className="auth-forgot">فراموشی رمز عبور؟</Link>

          <button type="submit" className="btn-primary" style={{ width: '100%', padding: '12px' }}>
            ورود به سیستم
          </button>
        </form>

        <p className="auth-switch">
          حساب کاربری ندارید؟ <Link to="/register">ثبت نام</Link>
        </p>
      </div>
    </div>
  );
}
