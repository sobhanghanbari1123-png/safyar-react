import './IranPlate.css';

/**
 * Display-only Iranian license plate (private vehicle).
 * Real plate layout (left→right):
 *   [BLUE: stars / flag / ایران / code]  [WHITE: d3 – letter – d2]
 * Props: d2 (2-digit), letter (Persian), d3 (3-digit), code (city)
 */
export default function IranPlate({ d2 = '??', letter = '?', d3 = '???', code = '??' , size = '' }) {
  return (
    <div className={`irp-outer${size ? ` irp-${size}` : ''}`}>
      <div className="irp-inner">

        {/* ── White section — LEFT ── */}
        <div className="irp-white">
          <span className="irp-num">{d3}</span>
          <span className="irp-sep">-</span>
          <span className="irp-letter">{letter}</span>
          <span className="irp-sep">-</span>
          <span className="irp-num">{d2}</span>
        </div>

        {/* ── Blue strip — RIGHT ── */}
        <div className="irp-blue">
          <span className="irp-stars">★ ★ ★</span>
          <div className="irp-emblem"><span className="irp-flag-g" /><span className="irp-flag-w" /><span className="irp-flag-r" /></div>
          <span className="irp-iran">ایران</span>
          <span className="irp-code">{code}</span>
        </div>

      </div>
    </div>
  );
}
