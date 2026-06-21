import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import IranPlate from '../components/IranPlate';
import JalaliCalendar from '../components/JalaliCalendar';
import { loadSettings } from './Settings';
import './Wizard.css';
import './Status.css';

const PLATE = { d2: '۵۵', letter: 'ن', d3: '۱۳۴', code: '۱۲' };
const SUMMARY = [
  { label: 'صافکاری', days: 3, amount: 800000 },
  { label: 'نقاشی',   days: 2, amount: 500000 },
  { label: 'کاور',    days: 1, amount: 300000 },
];
const DISCOUNT = 150000;

const toP = s => String(s).replace(/[0-9]/g, d => '۰۱۲۳۴۵۶۷۸۹'[d]);

function generateTimeSlots(workStart, workEnd) {
  const [sh, sm] = workStart.split(':').map(Number);
  const [eh, em] = workEnd.split(':').map(Number);
  const slots = [];
  let h = sh, m = sm;
  while (h * 60 + m < eh * 60 + em) {
    slots.push(toP(`${h}:${m === 0 ? '00' : m}`));
    m += 30;
    if (m >= 60) { m -= 60; h++; }
  }
  return slots;
}

function getOffDows(offDay) {
  if (offDay === 'جمعه') return [5];
  if (offDay === 'پنجشنبه') return [4];
  if (offDay === 'جمعه و پنجشنبه') return [4, 5];
  return [];
}

const badgeClass = (label) =>
  label === 'صافکاری' ? 'badge-success'
  : label === 'کاور'  ? 'badge-warning'
  : 'badge-info';

function getBookedSlots(date, slots) {
  if (!date || !slots.length) return [];
  const seed = (date.y * 31 + date.m * 7 + date.d) % slots.length;
  return [slots[seed], slots[(seed + 4) % slots.length], slots[(seed + 8) % slots.length]];
}

export default function Status() {
  const navigate = useNavigate();
  const { theme, toggle } = useTheme();
  const [status, setStatus] = useState('');
  const [showAppt, setShowAppt]     = useState(false);
  const [showCancel, setShowCancel] = useState(false);
  const [selDate, setSelDate]       = useState(null);
  const [selTime, setSelTime]       = useState('');
  const [cancelReason, setCancelReason] = useState('');
  const [apptDone, setApptDone]     = useState(false);

  const settings = loadSettings();
  const TIME_SLOTS = generateTimeSlots(settings.workStart, settings.workEnd);
  const disabledDows = getOffDows(settings.offDay);

  const total = SUMMARY.reduce((a, s) => a + s.amount, 0);
  const payable = total - DISCOUNT;
  const booked = getBookedSlots(selDate, TIME_SLOTS);

  const handleStatusSelect = (s) => {
    setStatus(s);
    if (s === 'نوبت‌دهی') setShowAppt(true);
    if (s === 'انصراف') setShowCancel(true);
  };

  const handleSubmit = () => {
    if (!status) return alert('وضعیت را انتخاب کنید');
    if (status === 'نوبت‌دهی' && !apptDone) return alert('ابتدا نوبت خود را تأیید کنید');
    alert(`وضعیت "${status}" با موفقیت ثبت شد`);
    navigate('/');
  };

  const confirmAppt = () => {
    if (!selDate) return alert('لطفاً تاریخ را انتخاب کنید');
    if (!selTime) return alert('لطفاً ساعت را انتخاب کنید');
    setApptDone(true);
    setShowAppt(false);
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

      {/* Progress */}
      <div className="wizard-progress">
        {['ثبت کیلومتر','انتخاب قطعات','تصاویر'].map(label => (
          <><div className="wizard-step"><div className="step-num done-step">✓</div><span>{label}</span></div><div className="wizard-step-line" /></>
        ))}
        <div className="wizard-step active"><div className="step-num">۴</div><span>وضعیت</span></div>
      </div>

      <div className="wizard-card">
        <h2 className="wizard-card-title">تعیین وضعیت درخواست</h2>

        {/* Plate display */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
          <IranPlate d2={PLATE.d2} letter={PLATE.letter} d3={PLATE.d3} code={PLATE.code} />
        </div>

        {/* Cost summary */}
        <div className="status-summary-table">
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
              <tr className="subtotal-row">
                <td colSpan={2}>جمع کل</td>
                <td>{total.toLocaleString('fa-IR')}</td>
              </tr>
              <tr className="discount-row">
                <td colSpan={2}>تخفیف</td>
                <td>({DISCOUNT.toLocaleString('fa-IR')})</td>
              </tr>
              <tr className="total-row">
                <td colSpan={2}><strong>مبلغ قابل پرداخت</strong></td>
                <td><strong style={{ color: 'var(--primary)' }}>{payable.toLocaleString('fa-IR')}</strong></td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Appointment done badge */}
        {apptDone && (
          <div className="appt-done-badge">
            ✅ نوبت ثبت شد: {selDate?.label} — ساعت {selTime}
          </div>
        )}

        {/* Status chips */}
        <h4 className="status-label">وضعیت درخواست را انتخاب کنید:</h4>
        <div className="status-chips">
          {[
            { key: 'پذیرش',    icon: '✅' },
            { key: 'نوبت‌دهی', icon: '📅' },
            { key: 'انصراف',   icon: '❌' },
          ].map(({ key, icon }) => (
            <button
              key={key}
              type="button"
              className={`status-chip ${status === key ? 'selected' : ''}`}
              onClick={() => handleStatusSelect(key)}
            >
              {icon} {key}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24, gap: 12 }}>
          <button className="btn-secondary" onClick={() => navigate('/choose-photo')}>← بازگشت</button>
          <button className="btn-primary" onClick={handleSubmit}>ثبت وضعیت ✓</button>
        </div>
      </div>

      {/* ═══ Appointment Modal ═══ */}
      {showAppt && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowAppt(false)}>
          <div className="modal-box appt-modal">
            <div className="modal-header">
              <h3>📅 انتخاب نوبت</h3>
              <button className="modal-close" onClick={() => setShowAppt(false)}>✕</button>
            </div>

            {/* Jalali calendar */}
            <div style={{ marginBottom: 20 }}>
              <p className="appt-section-title">تاریخ نوبت را انتخاب کنید</p>
              <JalaliCalendar selected={selDate} onChange={d => { setSelDate(d); setSelTime(''); }} disabledDows={disabledDows} />
              {selDate && (
                <div className="appt-sel-date">📅 {selDate.label}</div>
              )}
            </div>

            {/* Time slots */}
            {selDate && (
              <div style={{ marginBottom: 20 }}>
                <p className="appt-section-title">ساعت نوبت را انتخاب کنید</p>
                <div className="time-slots-grid">
                  {TIME_SLOTS.map(slot => {
                    const isBooked = booked.includes(slot);
                    const isSel    = selTime === slot;
                    return (
                      <button
                        key={slot}
                        type="button"
                        disabled={isBooked}
                        onClick={() => !isBooked && setSelTime(slot)}
                        className={`time-slot-btn ${isSel ? 'selected' : ''} ${isBooked ? 'booked' : ''}`}
                      >
                        {slot}
                        {isBooked && <span className="booked-x">✕</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn-primary" style={{ flex: 1 }} onClick={confirmAppt}>
                تأیید نوبت ✓
              </button>
              <button className="btn-secondary" onClick={() => setShowAppt(false)}>انصراف</button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ Cancel Modal ═══ */}
      {showCancel && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowCancel(false)}>
          <div className="modal-box">
            <div className="modal-header">
              <h3>❌ دلیل انصراف</h3>
              <button className="modal-close" onClick={() => setShowCancel(false)}>✕</button>
            </div>
            <div className="form-group">
              <label>دلیل انصراف را بنویسید:</label>
              <textarea rows={4} value={cancelReason}
                onChange={e => setCancelReason(e.target.value)}
                placeholder="دلیل انصراف از پذیرش خودرو را توضیح دهید..." />
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn-primary" style={{ flex: 1 }} onClick={() => {
                if (!cancelReason.trim()) return alert('دلیل انصراف را وارد کنید');
                setShowCancel(false);
              }}>تایید</button>
              <button className="btn-secondary" onClick={() => setShowCancel(false)}>انصراف</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
