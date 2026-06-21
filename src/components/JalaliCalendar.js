import { useState } from 'react';
import './JalaliCalendar.css';

const J_MONTHS = ['فروردین','اردیبهشت','خرداد','تیر','مرداد','شهریور','مهر','آبان','آذر','دی','بهمن','اسفند'];
const P = n => String(n).replace(/[0-9]/g, d => '۰۱۲۳۴۵۶۷۸۹'[d]);

function gToJ(gy, gm, gd) {
  const gl = [31, ((gy%4===0&&gy%100!==0)||(gy%400===0)) ? 29 : 28, 31,30,31,30,31,31,30,31,30,31];
  let g = 365*(gy-1) + Math.floor((gy-1)/4) - Math.floor((gy-1)/100) + Math.floor((gy-1)/400);
  for (let i = 0; i < gm-1; i++) g += gl[i];
  g += gd - 1;
  let j = g - 79, np = Math.floor(j/12053); j %= 12053;
  let jy = 979 + 33*np + 4*Math.floor(j/1461); j %= 1461;
  if (j >= 366) { jy += Math.floor((j-1)/365); j = (j-1) % 365; }
  let i = 0;
  for (; i < 11 && j >= (i < 6 ? 31 : 30); i++) j -= (i < 6 ? 31 : 30);
  return [jy, i+1, j+1];
}

function jToG(jy, jm, jd) {
  let y = jy + 1595;
  let days = -355779 + 365*y + Math.floor(y/33)*8 + Math.floor((y%33+3)/4) + jd;
  for (let i = 1; i < jm; i++) days += (i <= 6 ? 31 : 30);
  let gy = 400 * Math.floor(days/146097); days %= 146097;
  if (days > 36524) { gy += 100*Math.floor(--days/36524); days %= 36524; if (days >= 365) days++; }
  gy += 4 * Math.floor(days/1461); days %= 1461;
  if (days > 365) { gy += Math.floor((days-1)/365); days = (days-1) % 365; }
  const lp = (gy%4===0&&gy%100!==0)||(gy%400===0);
  const gd = [31, lp?29:28, 31,30,31,30,31,31,30,31,30,31];
  let gm = 0;
  for (; gm < 12 && days >= gd[gm]; gm++) days -= gd[gm];
  return [gy, gm+1, days+1];
}

function jDays(y, m) {
  return m <= 6 ? 31 : m <= 11 ? 30
    : (((y-(y>0?474:473))%2820+474+38)%2820%474%38) ? 30 : 29;
}

function firstDow(y, m) {
  const [gy, gm, gd] = jToG(y, m, 1);
  return (new Date(gy, gm-1, gd).getDay() + 1) % 7; // 0=Sat
}

function addMonths(y, m, n) {
  m += n;
  while (m > 12) { m -= 12; y++; }
  return [y, m];
}

export default function JalaliCalendar({ selected, onChange, disabledDows = [5] }) {
  const now = new Date();
  const [TY, TM, TD] = gToJ(now.getFullYear(), now.getMonth()+1, now.getDate());
  const [maxY, maxM] = addMonths(TY, TM, 3);

  const [calY, setCalY] = useState(TY);
  const [calM, setCalM] = useState(TM);

  const prevMonth = () => {
    if (calY === TY && calM === TM) return;
    const [y, m] = calM === 1 ? [calY-1, 12] : [calY, calM-1];
    setCalY(y); setCalM(m);
  };

  const nextMonth = () => {
    const [ny, nm] = addMonths(calY, calM, 1);
    if (ny * 100 + nm > maxY * 100 + maxM) return;
    setCalY(ny); setCalM(nm);
  };

  const isPrev = calY === TY && calM === TM;
  const isNext = (() => { const [ny,nm] = addMonths(calY,calM,1); return ny*100+nm > maxY*100+maxM; })();

  const dm = jDays(calY, calM);
  const fw = firstDow(calY, calM);

  const cells = [];
  for (let i = 0; i < fw; i++) cells.push(null);
  for (let d = 1; d <= dm; d++) cells.push(d);

  const getDayState = (d) => {
    const ref = calY*10000 + calM*100 + d;
    const tod = TY*10000 + TM*100 + TD;
    const max = maxY*10000 + maxM*100 + jDays(maxY, maxM);
    if (ref < tod || ref > max) return 'off';
    const [gy, gm, gd] = jToG(calY, calM, d);
    const dow = new Date(gy, gm-1, gd).getDay();
    if (disabledDows.includes(dow)) return 'friday';
    return d % 7 === 0 ? 'limited' : 'free';
  };

  const isSel = (d) => selected && selected.y === calY && selected.m === calM && selected.d === d;
  const isToday = (d) => calY === TY && calM === TM && d === TD;

  const handlePick = (d) => {
    const st = getDayState(d);
    if (st === 'off' || st === 'friday') return;
    onChange({ y: calY, m: calM, d, label: `${P(d)} ${J_MONTHS[calM-1]} ${P(calY)}` });
  };

  return (
    <div className="jcal">
      {/* Header */}
      <div className="jcal-head">
        <button className={`jcal-nav ${isPrev ? 'disabled' : ''}`} onClick={prevMonth} disabled={isPrev}>
          ‹
        </button>
        <div className="jcal-title">
          <span className="jcal-month">{J_MONTHS[calM-1]}</span>
          <span className="jcal-year">{P(calY)}</span>
        </div>
        <button className={`jcal-nav ${isNext ? 'disabled' : ''}`} onClick={nextMonth} disabled={isNext}>
          ›
        </button>
      </div>

      {/* Weekday labels */}
      <div className="jcal-dow-row">
        {['ش','ی','د','س','چ','پ'].map(d => (
          <div key={d} className="jcal-dow">{d}</div>
        ))}
        <div className="jcal-dow jcal-dow-fri">ج</div>
      </div>

      {/* Day grid */}
      <div className="jcal-grid">
        {cells.map((d, i) => {
          if (!d) return <div key={`e${i}`} />;
          const st = getDayState(d);
          const sel = isSel(d);
          const tod = isToday(d);
          const fri = st === 'friday';
          const off = st === 'off';
          return (
            <div
              key={d}
              onClick={() => handlePick(d)}
              className={[
                'jcal-day',
                sel ? 'sel' : '',
                tod && !sel ? 'tod' : '',
                off || fri ? 'off' : '',
                fri ? 'fri' : '',
                !off && !fri && !sel && st === 'limited' ? 'lim' : '',
                !off && !fri && !sel && st === 'free' ? 'free' : '',
              ].filter(Boolean).join(' ')}
            >
              {P(d)}
              {!off && !fri && !sel && (
                <span className={`jcal-dot ${st === 'limited' ? 'dot-lim' : 'dot-free'}`} />
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="jcal-legend">
        <div className="jcal-leg-item"><span className="jcal-leg-dot free" /><span>ظرفیت دارد</span></div>
        <div className="jcal-leg-item"><span className="jcal-leg-dot lim" /><span>ظرفیت محدود</span></div>
        <div className="jcal-leg-item"><span className="jcal-leg-dot sel" /><span>انتخاب شده</span></div>
        <div className="jcal-leg-item"><span className="jcal-leg-dot off" /><span>تعطیل</span></div>
      </div>
    </div>
  );
}
