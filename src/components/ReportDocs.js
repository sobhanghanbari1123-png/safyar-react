/* Printable documents for the Reports page:
   InvoiceDoc (فاکتور) — ContractDoc (قرارداد) — InsuranceDoc (بیمه‌نامه) — ReportsListDoc (چاپ همه)
   Each renders an "inv-paper" sheet used both in the on-screen preview modal
   and inside the .only-print mount for printing. */

function getShopInfo() {
  try {
    const raw = localStorage.getItem('safyar_settings');
    const s = raw ? JSON.parse(raw) : {};
    return {
      name:    s.shopName  || 'تعمیرگاه صافیار',
      owner:   s.ownerName || '',
      phone:   s.phone     || '',
      address: s.address   || '',
      city:    s.city      || '',
      logo:    s.logo      || null,
    };
  } catch {
    return { name: 'تعمیرگاه صافیار', owner: '', phone: '', address: '', city: '', logo: null };
  }
}

const STATUS_LABELS = {
  accepted:  'پذیرفته شده',
  released:  'تحویل داده شده',
  pending:   'در انتظار',
  cancelled: 'انصراف',
};

const fa      = n => (n ?? 0).toLocaleString('fa-IR');
const totalOf = r => (r.safkariCost || 0) + (r.naghashiCost || 0) + (r.coverCost || 0) + (r.partsCost || 0);
const todayFa = () => new Date().toLocaleDateString('fa-IR');
const futureFa = days => new Date(Date.now() + days * 24 * 3600 * 1000).toLocaleDateString('fa-IR');

/* ── Shared pieces ── */
const Head = ({ icon, title, sub, meta, logo }) => (
  <div className="inv-head">
    <div className="inv-brand">
      <div className="inv-logo">
        {logo
          ? <img src={logo} alt="لوگو" style={{ width: 52, height: 52, objectFit: 'cover', borderRadius: 8 }} />
          : icon}
      </div>
      <div>
        <div className="inv-shop-name">{title}</div>
        <div className="inv-shop-sub">{sub}</div>
      </div>
    </div>
    <div className="inv-meta">
      {meta.map(([label, value]) => (
        <div className="inv-meta-row" key={label}><span>{label}</span><b>{value}</b></div>
      ))}
    </div>
  </div>
);

const Foot = ({ text, sub }) => (
  <div className="inv-foot">
    <div className="inv-foot-thanks">{text}</div>
    <div className="inv-foot-sub">{sub}</div>
  </div>
);

const OwnerInfo = ({ r }) => (
  <div className="inv-info">
    <div className="inv-info-item"><span>نام مالک</span><b>{r.owner}</b></div>
    <div className="inv-info-item"><span>موبایل</span><b className="doc-ltr">{r.mobile}</b></div>
    <div className="inv-info-item"><span>استاد کار</span><b>{r.master || '—'}</b></div>
    <div className="inv-info-item"><span>پلاک</span><b className="doc-ltr">{r.plate}</b></div>
    <div className="inv-info-item"><span>کیلومتر</span><b>{fa(r.km)} km</b></div>
    <div className="inv-info-item"><span>سطح سوخت</span><b>{r.fuel}</b></div>
  </div>
);

const CostTable = ({ r }) => (
  <table className="inv-cost">
    <thead><tr><th>شرح خدمات</th><th>مدت</th><th>مبلغ (تومان)</th></tr></thead>
    <tbody>
      <tr><td>صافکاری</td><td>{r.safkariDays} روز</td><td>{fa(r.safkariCost)}</td></tr>
      <tr><td>نقاشی</td><td>{r.naghashiDays} روز</td><td>{fa(r.naghashiCost)}</td></tr>
      <tr><td>کاور</td><td>{r.coverDays || 0} روز</td><td>{fa(r.coverCost)}</td></tr>
      <tr><td>قطعات</td><td>—</td><td>{fa(r.partsCost)}</td></tr>
    </tbody>
  </table>
);

const Totals = ({ r, grandLabel }) => (
  <div className="inv-totals">
    <div className="inv-total-row"><span>جمع کل</span><b>{fa(totalOf(r))} تومان</b></div>
    <div className="inv-total-row inv-discount"><span>تخفیف</span><b>({fa(r.discount)}) تومان</b></div>
    <div className="inv-total-row"><span>پرداخت شده</span><b>{fa(r.paid)} تومان</b></div>
    <div className={`inv-total-row inv-grand ${r.remaining > 0 ? 'inv-debt' : 'inv-settled'}`}>
      <span>{r.remaining > 0 ? (grandLabel || 'مانده بدهی') : 'تسویه شده'}</span>
      <b>{fa(r.remaining)} تومان</b>
    </div>
  </div>
);

const Signs = ({ right, left }) => (
  <div className="doc-signs">
    <div className="doc-sign">
      <div className="doc-sign-title">{right.title}</div>
      <div className="doc-sign-name">{right.name}</div>
    </div>
    <div className="doc-sign">
      <div className="doc-sign-title">{left.title}</div>
      <div className="doc-sign-name">{left.name}</div>
    </div>
  </div>
);

/* ══════════ 🧾 Invoice ══════════ */
export function InvoiceDoc({ r }) {
  const shop = getShopInfo();
  const shopSub = [shop.phone, shop.address, shop.city].filter(Boolean).join(' — ') || 'سیستم مدیریت تعمیرگاه';
  return (
    <div className="inv-paper">
      <Head icon="🚗" logo={shop.logo} title={shop.name} sub={shopSub}
        meta={[
          ['کد پیگیری', r.tracking],
          ['تاریخ', todayFa()],
          ['وضعیت', <span className={`inv-status inv-status-${r.status}`}>{STATUS_LABELS[r.status]}</span>],
        ]} />

      <div className="inv-sec">مشخصات خودرو و مالک</div>
      <OwnerInfo r={r} />

      <div className="inv-sec">جزئیات هزینه‌ها</div>
      <CostTable r={r} />

      <Totals r={r} />

      <Foot text="با تشکر از اعتماد شما 🌟" sub={`${shop.name} — کیفیت، تعهد، اعتماد`} />
    </div>
  );
}

/* ══════════ 📄 Contract ══════════ */
export function ContractDoc({ r }) {
  const shop = getShopInfo();
  const totalDays = (r.safkariDays || 0) + (r.naghashiDays || 0);
  const shopContact = [shop.phone && `تلفن: ${shop.phone}`, shop.address].filter(Boolean).join(' — ');
  return (
    <div className="inv-paper">
      <div className="doc-bismillah">بسمه تعالی</div>

      <Head icon="📄" logo={shop.logo} title="قرارداد ارائه خدمات تعمیر خودرو" sub={shop.name}
        meta={[
          ['شماره قرارداد', `C-${r.tracking}`],
          ['تاریخ تنظیم', todayFa()],
        ]} />

      <p className="doc-intro">
        این قرارداد در تاریخ <b>{todayFa()}</b> با استناد به ماده ۱۰ قانون مدنی و با رعایت اصل آزادی اراده طرفین،
        فی‌مابین اشخاص ذیل منعقد گردیده و طرفین ضمن آگاهی کامل از مفاد آن، اجرای تعهدات مندرج را بر عهده می‌گیرند.
      </p>

      <div className="inv-sec">ماده ۱ — طرفین قرارداد</div>
      <p className="doc-text">
        <b>طرف اول (تعمیرگاه):</b> {shop.name}
        {shop.owner && <span>، به مدیریت <b>{shop.owner}</b></span>}
        {shopContact && <span>، {shopContact}</span>}
        ، که از این پس در این قرارداد «تعمیرگاه» نامیده می‌شود.
        <br />
        <b>طرف دوم (مالک):</b> آقای/خانم <b>{r.owner}</b> به شماره تماس <b className="doc-ltr">{r.mobile}</b>،
        مالک خودرو به شماره پلاک <b className="doc-ltr">{r.plate}</b> و کارکرد <b>{fa(r.km)} کیلومتر</b>،
        که از این پس «مالک» نامیده می‌شود.
      </p>

      <div className="inv-sec">ماده ۲ — موضوع قرارداد</div>
      <p className="doc-text">
        موضوع قرارداد عبارت است از انجام خدمات صافکاری، نقاشی و تعویض قطعات خودروی موصوف، مطابق با شرح خدمات و
        مبالغ مندرج در جدول ذیل که به امضای طرفین رسیده و جزء لاینفک این قرارداد محسوب می‌گردد:
      </p>
      <CostTable r={r} />

      <div className="inv-sec">ماده ۳ — مبلغ قرارداد و نحوه پرداخت</div>
      <p className="doc-text">
        کل مبلغ قرارداد بر اساس جدول فوق محاسبه گردیده و پرداخت آن به شرح زیر است.
        مانده‌حساب می‌بایست حداکثر در زمان تحویل خودرو به‌طور کامل تسویه گردد.
      </p>
      <Totals r={r} grandLabel="مانده قابل پرداخت در زمان تحویل" />

      <div className="inv-sec">ماده ۴ — مدت اجرا و زمان تحویل</div>
      <p className="doc-text">
        مدت زمان انجام خدمات موضوع قرارداد <b>{fa(totalDays)} روز کاری</b> از تاریخ پذیرش خودرو برآورد می‌گردد.
        در صورت بروز عوامل پیش‌بینی‌نشده، تعمیرگاه موظف است مراتب را در اسرع وقت به اطلاع مالک برساند.
      </p>

      <div className="inv-sec">ماده ۵ — تعهدات تعمیرگاه</div>
      <ul className="doc-clauses">
        <li>انجام خدمات موضوع قرارداد با رعایت اصول فنی، کیفیت استاندارد و استفاده از قطعات سالم.</li>
        <li>حفظ و نگهداری خودرو در مدت توقف در تعمیرگاه و مسئولیت در قبال خسارات وارده ناشی از قصور تعمیرگاه.</li>
        {r.master && <li>مسئولیت فنی اجرای تعمیرات بر عهده استاد کار، جناب <b>{r.master}</b>، می‌باشد.</li>}
        <li>ارائه گارانتی کتبی برای خدمات انجام‌شده مطابق گواهی ضمانت پیوست.</li>
      </ul>

      <div className="inv-sec">ماده ۶ — تعهدات مالک</div>
      <ul className="doc-clauses">
        <li>پرداخت به‌موقع مبلغ قرارداد مطابق شرایط مندرج در ماده ۳.</li>
        <li>تحویل به‌موقع خودرو پس از اعلام آماده‌بودن از سوی تعمیرگاه؛ در غیر این‌صورت مسئولیت توقف بر عهده مالک است.</li>
        <li>اعلام کتبی هرگونه درخواست خدمات اضافی که خارج از موضوع این قرارداد باشد.</li>
      </ul>

      <div className="inv-sec">ماده ۷ — تضمین کیفیت و گارانتی</div>
      <p className="doc-text">
        کلیه خدمات انجام‌شده مطابق شرایط مندرج در گواهی ضمانت و بیمه کیفیت (پیوست شماره ۱) تحت پوشش گارانتی قرار دارد.
        تعمیرگاه متعهد به رفع رایگان ایرادات ناشی از قصور در اجرای تعمیرات در مدت اعتبار گارانتی می‌باشد.
      </p>

      <div className="inv-sec">ماده ۸ — قوه قهریه و حل اختلاف</div>
      <ul className="doc-clauses">
        <li>در صورت بروز حوادث قهری و غیرقابل‌پیش‌بینی (فورس‌ماژور)، تعهدات طرفین تا رفع مانع به حالت تعلیق درمی‌آید.</li>
        <li>کلیه اختلافات احتمالی ابتدا از طریق مذاکره و در صورت عدم حصول نتیجه، از طریق مراجع قانونی ذی‌صلاح حل‌وفصل می‌گردد.</li>
        <li>این قرارداد در ۸ ماده و دو نسخه واحدالاعتبار تنظیم و پس از امضای طرفین لازم‌الاجرا می‌باشد.</li>
      </ul>

      <Signs
        right={{ title: 'امضای مالک خودرو', name: r.owner }}
        left={{ title: 'مهر و امضای تعمیرگاه', name: shop.owner || shop.name }} />

      <Foot text="این سند به‌منزله توافق رسمی طرفین است" sub={`کد پیگیری پرونده: ${r.tracking} — ${shop.name}`} />
    </div>
  );
}

/* ══════════ 🛡️ Insurance / warranty ══════════ */
export function InsuranceDoc({ r }) {
  const shop = getShopInfo();
  return (
    <div className="inv-paper">
      <div className="doc-bismillah">بسمه تعالی</div>

      <Head icon="🛡️" logo={shop.logo} title="گواهی ضمانت و بیمه کیفیت تعمیرات" sub={shop.name}
        meta={[
          ['شماره گواهی', `INS-${r.tracking}`],
          ['تاریخ صدور', todayFa()],
          ['اعتبار تا', futureFa(183)],
        ]} />

      <p className="doc-intro">
        بدین‌وسیله گواهی می‌شود کلیه خدمات تعمیراتی انجام‌شده بر روی خودروی موصوف در پرونده شماره <b>{r.tracking}</b>،
        مطابق با شرایط و ضوابط مندرج در این گواهی، از تاریخ صدور به مدت تعیین‌شده تحت پوشش ضمانت کیفیت تعمیرگاه قرار دارد.
      </p>

      <div className="ins-badge">
        ✓ این خدمات از تاریخ {todayFa()} تا تاریخ {futureFa(183)} تحت پوشش گارانتی این گواهی است
      </div>

      <div className="inv-sec">مشخصات خودرو و مالک</div>
      <OwnerInfo r={r} />

      <div className="inv-sec">ماده ۱ — پوشش‌ها و مدت اعتبار ضمانت</div>
      <table className="inv-cost">
        <thead><tr><th>نوع خدمت</th><th>مدت پوشش</th><th>سقف پوشش (تومان)</th></tr></thead>
        <tbody>
          <tr><td>صافکاری و فرم‌دهی بدنه</td><td>۶ ماه</td><td>{fa(r.safkariCost)}</td></tr>
          <tr><td>نقاشی (رنگ‌پریدگی، تاول و کدری)</td><td>۱۲ ماه</td><td>{fa(r.naghashiCost)}</td></tr>
          <tr><td>کاور (پوشش محافظ بدنه)</td><td>۶ ماه</td><td>{fa(r.coverCost)}</td></tr>
          <tr><td>قطعات تعویضی</td><td>مطابق ضمانت سازنده</td><td>{fa(r.partsCost)}</td></tr>
        </tbody>
      </table>

      <div className="inv-sec">ماده ۲ — شرایط برخورداری از خدمات ضمانت</div>
      <ul className="doc-clauses">
        <li>ارائه اصل این گواهی به همراه کد پیگیری پرونده هنگام مراجعه الزامی است.</li>
        <li>خدمات ضمانت صرفاً در تعمیرگاه صادرکننده این گواهی قابل ارائه می‌باشد.</li>
        <li>رفع ایرادات مشمول ضمانت به‌صورت کاملاً رایگان و در اسرع وقت انجام می‌پذیرد.</li>
      </ul>

      <div className="inv-sec">ماده ۳ — موارد خارج از پوشش (استثنائات)</div>
      <ul className="doc-clauses">
        <li>آسیب‌های ناشی از تصادف مجدد، برخورد، واژگونی یا حوادث طبیعی.</li>
        <li>خسارات ناشی از سهل‌انگاری، استفاده نادرست یا عدم رعایت نکات نگهداری از خودرو.</li>
        <li>هرگونه تعمیر، دستکاری یا رنگ‌آمیزی خودرو در مراکز متفرقه که موجب ابطال این گواهی می‌گردد.</li>
        <li>فرسودگی طبیعی و تغییرات ظاهری ناشی از گذشت زمان که خارج از تعهد کیفی تعمیرگاه است.</li>
      </ul>

      <div className="inv-sec">ماده ۴ — تبصره‌ها</div>
      <ul className="doc-clauses">
        <li>این گواهی غیرقابل‌انتقال بوده و صرفاً برای خودرو و مالک مندرج در آن معتبر است.</li>
        <li>تشخیص نهایی شمول یا عدم شمول ایراد در تعهدات ضمانت، بر عهده کارشناس فنی تعمیرگاه می‌باشد.</li>
      </ul>

      <Signs
        right={{ title: 'امضای مالک خودرو', name: r.owner }}
        left={{ title: 'مهر و امضای تعمیرگاه', name: shop.owner || shop.name }} />

      <Foot text="ضمانت کیفیت، تعهد ماست 🛡️" sub={`${shop.name} — کیفیت، تعهد، اعتماد`} />
    </div>
  );
}

/* ══════════ 🖨️ Full reports list ══════════ */
export function ReportsListDoc({ reports }) {
  const shop = getShopInfo();
  const sum = k => reports.reduce((a, r) => a + (r[k] || 0), 0);
  const totalAll = reports.reduce((a, r) => a + totalOf(r), 0);
  const remainingAll = sum('remaining');

  return (
    <div className="inv-paper doc-wide">
      <Head icon="🚗" logo={shop.logo} title="گزارش کامل پذیرش‌ها" sub={shop.name}
        meta={[
          ['تاریخ گزارش', todayFa()],
          ['تعداد پرونده', fa(reports.length)],
        ]} />

      <div className="inv-sec">فهرست پرونده‌ها</div>
      <table className="inv-cost doc-list-table">
        <thead>
          <tr>
            <th>#</th><th>کد پیگیری</th><th>مالک</th><th>موبایل</th><th>پلاک</th>
            <th>استاد کار</th><th>وضعیت</th><th>جمع (تومان)</th><th>مانده (تومان)</th>
          </tr>
        </thead>
        <tbody>
          {reports.map((r, i) => (
            <tr key={r.id}>
              <td>{fa(i + 1)}</td>
              <td>{r.tracking}</td>
              <td>{r.owner}</td>
              <td className="doc-ltr">{r.mobile}</td>
              <td className="doc-ltr">{r.plate}</td>
              <td>{r.master || '—'}</td>
              <td><span className={`inv-status inv-status-${r.status}`}>{STATUS_LABELS[r.status]}</span></td>
              <td>{fa(totalOf(r))}</td>
              <td>{fa(r.remaining)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="inv-totals">
        <div className="inv-total-row"><span>جمع کل هزینه‌ها</span><b>{fa(totalAll)} تومان</b></div>
        <div className="inv-total-row inv-discount"><span>جمع تخفیف‌ها</span><b>({fa(sum('discount'))}) تومان</b></div>
        <div className="inv-total-row"><span>جمع پرداخت‌شده</span><b>{fa(sum('paid'))} تومان</b></div>
        <div className={`inv-total-row inv-grand ${remainingAll > 0 ? 'inv-debt' : 'inv-settled'}`}>
          <span>جمع مانده</span><b>{fa(remainingAll)} تومان</b>
        </div>
      </div>

      <Foot text="گزارش جامع پذیرش‌های تعمیرگاه" sub={`${shop.name} — این گزارش به‌صورت خودکار توسط سیستم مدیریت صافیار تولید شده است`} />
    </div>
  );
}
