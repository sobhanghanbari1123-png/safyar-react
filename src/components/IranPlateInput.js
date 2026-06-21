import { useRef, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import './IranPlate.css';
import './IranPlateInput.css';

const LETTERS = [
  'الف','ب','پ','ت','ث','ج','چ','ح','خ','د','ذ','ر',
  'ز','س','ش','ص','ط','ع','غ','ف','ق','ک','گ','ل',
  'م','ن','و','ه','ی'
];

export default function IranPlateInput({ value = {}, onChange }) {
  const [dropOpen,      setDropOpen]      = useState(false);
  const [letterFilter,  setLetterFilter]  = useState('');
  const [dropPos,       setDropPos]       = useState({ top: 0, left: 0, width: 0 });

  const d2Ref   = useRef();
  const ltRef   = useRef();
  const d3Ref   = useRef();
  const codeRef = useRef();
  const dropRef = useRef();

  const { d2 = '', letter = '', d3 = '', code = '' } = value;
  const set = (k, v) => onChange({ ...value, [k]: v });

  /* Calculate dropdown position from letter input rect */
  const openDropdown = () => {
    const rect = ltRef.current?.getBoundingClientRect();
    if (rect) {
      setDropPos({
        top:   rect.bottom + window.scrollY + 6,
        left:  rect.left   + window.scrollX + rect.width / 2,
        width: 260,
      });
    }
    setDropOpen(true);
  };

  /* Close on outside click */
  useEffect(() => {
    const h = e => {
      if (
        dropRef.current && !dropRef.current.contains(e.target) &&
        e.target !== ltRef.current
      ) setDropOpen(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  /* Reposition on scroll / resize */
  useEffect(() => {
    if (!dropOpen) return;
    const update = () => {
      const rect = ltRef.current?.getBoundingClientRect();
      if (rect) setDropPos(p => ({ ...p, top: rect.bottom + window.scrollY + 6, left: rect.left + window.scrollX + rect.width / 2 }));
    };
    window.addEventListener('scroll', update, true);
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update, true);
      window.removeEventListener('resize', update);
    };
  }, [dropOpen]);

  const digitsOnly = v => v.replace(/[^0-9]/g, '');

  const handleCode = e => {
    const v = digitsOnly(e.target.value).slice(0, 2);
    set('code', v);
    if (v.length === 2) d3Ref.current?.focus();
  };

  const handleD3 = e => {
    const v = digitsOnly(e.target.value).slice(0, 3);
    set('d3', v);
    if (v.length === 3) ltRef.current?.focus();
  };

  const handleLetter = e => {
    const v = e.target.value;
    setLetterFilter(v);
    set('letter', v);
    if (!dropOpen) openDropdown();
  };

  const pickLetter = l => {
    set('letter', l);
    setLetterFilter('');
    setDropOpen(false);
    d2Ref.current?.focus();
  };

  const handleD2 = e => {
    const v = digitsOnly(e.target.value).slice(0, 2);
    set('d2', v);
  };

  const nav = (e, prevRef, nextRef) => {
    if (e.key === 'Backspace' && e.target.value === '' && prevRef)
      prevRef.current?.focus();
    if (e.key === 'Enter' && nextRef) nextRef.current?.focus();
  };

  const filteredLetters = letterFilter
    ? LETTERS.filter(l => l.startsWith(letterFilter))
    : LETTERS;

  /* Dropdown rendered via portal — floats above everything */
  const dropdown = dropOpen ? createPortal(
    <div
      ref={dropRef}
      className="irpi-letter-drop irpi-drop-portal"
      style={{ top: dropPos.top, left: dropPos.left }}
    >
      <div className="irpi-drop-title">
        حرف پلاک را انتخاب کنید
        {letter && <span className="irpi-drop-sel">({letter})</span>}
      </div>
      <div className="irpi-drop-grid">
        {filteredLetters.map(l => (
          <button
            key={l}
            type="button"
            className={`irpi-letter-opt ${letter === l ? 'active' : ''}`}
            onMouseDown={e => { e.preventDefault(); pickLetter(l); }}
          >{l}</button>
        ))}
        {filteredLetters.length === 0 && (
          <div className="irpi-no-match">حرفی یافت نشد</div>
        )}
      </div>
    </div>,
    document.body
  ) : null;

  return (
    <div className="irpi-root">

      {/* ── The plate ── */}
      <div className="irp-outer irpi-outer">
        <div className="irp-inner">

          {/* White section — LEFT: d3 - letter - d2 */}
          <div className="irp-white irpi-white">
            <input
              ref={d3Ref}
              className="irpi-num irpi-w3"
              type="text"
              inputMode="numeric"
              maxLength={3}
              placeholder="۳۴۵"
              value={d3}
              onChange={handleD3}
              onKeyDown={e => nav(e, codeRef, ltRef)}
            />
            <span className="irp-sep">-</span>

            <input
              ref={ltRef}
              className="irpi-letter-inp"
              type="text"
              placeholder="ب"
              value={letter}
              onChange={handleLetter}
              onFocus={openDropdown}
              onKeyDown={e => {
                nav(e, d3Ref, d2Ref);
                if (e.key === 'Escape') setDropOpen(false);
                if (e.key === 'Enter' && filteredLetters.length === 1)
                  pickLetter(filteredLetters[0]);
              }}
              autoComplete="off"
            />

            <span className="irp-sep">-</span>

            <input
              ref={d2Ref}
              className="irpi-num irpi-w2"
              type="text"
              inputMode="numeric"
              maxLength={2}
              placeholder="۱۲"
              value={d2}
              onChange={handleD2}
              onKeyDown={e => nav(e, ltRef, null)}
            />
          </div>

          {/* Blue strip — RIGHT */}
          <div className="irp-blue irpi-blue">
            <span className="irp-stars">★ ★ ★</span>
            <div className="irp-emblem"><span className="irp-flag-g" /><span className="irp-flag-w" /><span className="irp-flag-r" /></div>
            <span className="irp-iran">ایران</span>
            <input
              ref={codeRef}
              className="irpi-code-inp"
              type="text"
              inputMode="numeric"
              maxLength={2}
              placeholder="۶۷"
              value={code}
              onChange={handleCode}
              onKeyDown={e => nav(e, null, d3Ref)}
              title="کد شهر"
            />
          </div>

        </div>
      </div>

      <p className="irpi-hint">
        ترتیب ورود: &nbsp;<b>۳ رقم</b> ← <b>حرف</b> ← <b>۲ رقم</b> ← <b>کد</b>
      </p>

      {dropdown}
    </div>
  );
}
