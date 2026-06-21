import { useState } from 'react';
import Layout from '../components/Layout';
import { ToastContainer, useToast } from '../components/Toast';
import Pagination, { usePagination } from '../components/Pagination';
import { normDigits } from '../utils/normalize';
import {
  INIT_SHOPS, INIT_USERS, ALL_TRANSACTIONS, loadContent, saveContent,
  loadRegisteredUsers, updateUserStatus,
} from '../data/admin';
import './AdminPanel.css';

const STATUS_LABELS = { success: 'موفق', pending: 'در انتظار', failed: 'ناموفق' };
const STATUS_BADGE  = { success: 'badge-success', pending: 'badge-warning', failed: 'badge-danger' };
const groupNum = v => Number(v || 0).toLocaleString('en-US');

const TABS = [
  { key: 'shops',     label: 'صافکاری‌ها', icon: '🏪' },
  { key: 'users',     label: 'کاربران',    icon: '👤' },
  { key: 'tx',        label: 'تراکنش‌ها',  icon: '💳' },
  { key: 'content',   label: 'راهنما و تغییرات', icon: '📝' },
];

export default function AdminPanel() {
  const { toasts, removeToast, success, error } = useToast();
  const [tab, setTab] = useState('shops');

  /* ── صافکاری‌ها ── */
  const [shops, setShops]       = useState(INIT_SHOPS);
  const [shopSearch, setShopSearch] = useState('');
  const [chargeShop, setChargeShop] = useState(null);   // shop being charged
  const [chargeAmt,  setChargeAmt]  = useState('');
  const [shopEdit,  setShopEdit]    = useState(null);   // shop being edited
  const setSE = k => e => setShopEdit(m => ({ ...m, [k]: e.target.value }));
  const saveShopEdit = () => {
    if (!shopEdit.name.trim() || !shopEdit.owner.trim()) { error('نام و مالک الزامی است'); return; }
    setShops(prev => prev.map(s => s.id === shopEdit.id ? shopEdit : s));
    setShopEdit(null);
    success('اطلاعات صافکاری ویرایش شد ✓');
  };
  const deleteShop = (s) => {
    if (!window.confirm(`حذف صافکاری «${s.name}»؟`)) return;
    setShops(prev => prev.filter(x => x.id !== s.id));
    success('صافکاری حذف شد');
  };

  const shopsFiltered = shops.filter(s => {
    const q = normDigits(shopSearch.trim());
    if (!q) return true;
    return s.name.includes(shopSearch) || s.owner.includes(shopSearch) ||
           normDigits(s.mobile).includes(q) || s.address.includes(shopSearch);
  });
  const shopsPg = usePagination(shopsFiltered, 8, shopSearch);

  const doCharge = () => {
    const amt = Number(normDigits(chargeAmt).replace(/[^\d]/g, ''));
    if (!amt || amt <= 0) { error('مبلغ معتبر وارد کنید'); return; }
    setShops(prev => prev.map(s => s.id === chargeShop.id
      ? { ...s, wallet: s.wallet + amt, status: 'active' } : s));
    success(`کیف پول «${chargeShop.name}» به مبلغ ${groupNum(amt)} تومان شارژ شد ✓`);
    setChargeShop(null); setChargeAmt('');
  };

  /* ── تراکنش‌ها ── */
  const [txSearch, setTxSearch] = useState('');
  const [txStatus, setTxStatus] = useState('');
  const txFiltered = ALL_TRANSACTIONS.filter(t => {
    if (txStatus && t.status !== txStatus) return false;
    const q = normDigits(txSearch.trim());
    if (!q) return true;
    return t.shop.includes(txSearch) || t.desc.includes(txSearch) ||
           normDigits(String(t.amount)).includes(q) || normDigits(t.date).includes(q);
  });
  const txPg = usePagination(txFiltered, 10, `${txSearch}|${txStatus}`);

  /* ── کاربران ── */
  const loadAllUsers = () => [
    ...INIT_USERS,
    ...loadRegisteredUsers(),
  ];
  const [users, setUsers] = useState(loadAllUsers);
  const [userSearch, setUserSearch] = useState('');
  const [userStatusFilter, setUserStatusFilter] = useState('');
  const [userEdit, setUserEdit] = useState(null);
  const setUE = k => e => setUserEdit(m => ({ ...m, [k]: e.target.value }));
  const saveUserEdit = () => {
    if (!userEdit.name.trim()) { error('نام الزامی است'); return; }
    if (!/^\d{10}$/.test(normDigits(userEdit.national).trim())) { error('کد ملی باید ۱۰ رقم باشد'); return; }
    if (!/^09\d{9}$/.test(normDigits(userEdit.mobile).trim())) { error('شماره موبایل باید با ۰۹ شروع و ۱۱ رقم باشد'); return; }
    setUsers(prev => prev.map(u => u.id === userEdit.id ? userEdit : u));
    setUserEdit(null);
    success('اطلاعات کاربر ویرایش شد ✓');
  };
  const deleteUser = (u) => {
    if (!window.confirm(`حذف کاربر «${u.name}»؟`)) return;
    setUsers(prev => prev.filter(x => x.id !== u.id));
    success('کاربر حذف شد');
  };
  const approveUser = (u) => {
    updateUserStatus(u.national, 'approved');
    setUsers(prev => prev.map(x => x.national === u.national ? { ...x, status: 'approved' } : x));
    success(`حساب «${u.name}» تأیید شد ✓`);
  };
  const rejectUser = (u) => {
    updateUserStatus(u.national, 'rejected');
    setUsers(prev => prev.map(x => x.national === u.national ? { ...x, status: 'rejected' } : x));
    success(`حساب «${u.name}» رد شد`);
  };
  const usersFiltered = users.filter(u => {
    if (userStatusFilter && u.status !== userStatusFilter) return false;
    const q = normDigits(userSearch.trim());
    if (!q) return true;
    return u.name.includes(userSearch) || normDigits(u.mobile).includes(q) ||
           normDigits(u.national).includes(q) || (u.branch || '').includes(userSearch);
  });
  const usersPg = usePagination(usersFiltered, 10, `${userSearch}|${userStatusFilter}`);

  /* ── محتوای راهنما/تغییرات ── */
  const [content, setContent] = useState(loadContent);
  const persist = (next) => { setContent(next); saveContent(next); };

  const setSupport = (k) => (e) =>
    persist({ ...content, support: { ...content.support, [k]: e.target.value } });

  const setGuide = (id, k) => (e) =>
    persist({ ...content, guides: content.guides.map(g => g.id === id ? { ...g, [k]: e.target.value } : g) });
  const addGuide = () =>
    persist({ ...content, guides: [...content.guides, { id: Date.now(), title: 'عنوان جدید', body: '' }] });
  const delGuide = (id) =>
    persist({ ...content, guides: content.guides.filter(g => g.id !== id) });

  const setLog = (id, k) => (e) => {
    const v = k === 'items' ? e.target.value.split('\n') : e.target.value;
    persist({ ...content, changelog: content.changelog.map(c => c.id === id ? { ...c, [k]: v } : c) });
  };
  const addLog = () =>
    persist({ ...content, changelog: [{ id: Date.now(), date: '', version: '', items: [''] }, ...content.changelog] });
  const delLog = (id) =>
    persist({ ...content, changelog: content.changelog.filter(c => c.id !== id) });

  /* ── stats ── */
  const pendingCount = users.filter(u => u.status === 'pending').length;
  const stats = [
    { label: 'کل صافکاری‌ها', value: shops.length, icon: '🏪', color: '#3b82f6' },
    { label: 'صافکاری فعال', value: shops.filter(s => s.status === 'active').length, icon: '✅', color: '#10b981' },
    { label: 'کل کاربران', value: users.length, icon: '👤', color: '#8b5cf6' },
    { label: 'در انتظار تأیید', value: pendingCount, icon: '⏳', color: pendingCount > 0 ? '#f59e0b' : '#64748b' },
  ];

  return (
    <Layout title="پنل ادمین">
      <div className="stats-grid">
        {stats.map(s => (
          <div className="stat-card" key={s.label}>
            <div className="stat-icon" style={{ background: s.color + '22', color: s.color }}>{s.icon}</div>
            <div className="stat-info"><h4>{s.label}</h4><div className="stat-value" style={{ fontSize: 16 }}>{s.value}</div></div>
          </div>
        ))}
      </div>

      <div className="admin-tabs">
        {TABS.map(t => (
          <button key={t.key}
            className={`admin-tab ${tab === t.key ? 'active' : ''}`}
            onClick={() => setTab(t.key)}>
            <span>{t.icon}</span> {t.label}
          </button>
        ))}
      </div>

      {/* ───────── صافکاری‌ها ───────── */}
      {tab === 'shops' && (
        <>
          <div className="admin-toolbar">
            <input className="admin-search" placeholder="جستجو نام، مالک، موبایل یا آدرس..."
              value={shopSearch} onChange={e => setShopSearch(e.target.value)} />
          </div>
          <div className="admin-card">
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr><th>صافکاری</th><th>مالک</th><th>موبایل</th><th>آدرس</th><th>کیف پول</th><th>وضعیت</th><th>عملیات</th></tr>
                </thead>
                <tbody>
                  {shopsPg.pageItems.map(s => (
                    <tr key={s.id}>
                      <td>{s.name}</td>
                      <td>{s.owner}</td>
                      <td style={{ direction: 'ltr', textAlign: 'right' }}>{s.mobile}</td>
                      <td>{s.address}</td>
                      <td style={{ fontWeight: 700 }}>{groupNum(s.wallet)} ت</td>
                      <td>
                        <span className={`badge ${s.status === 'active' ? 'badge-success' : 'badge-danger'}`}>
                          {s.status === 'active' ? 'فعال' : 'منقضی'}
                        </span>
                      </td>
                      <td style={{ whiteSpace: 'nowrap' }}>
                        <button className="btn-charge" onClick={() => { setChargeShop(s); setChargeAmt(''); }}>
                          + شارژ
                        </button>
                        <button className="action-btn action-btn-edit" onClick={() => setShopEdit({ ...s })}>✏️</button>
                        <button className="action-btn action-btn-delete" onClick={() => deleteShop(s)}>🗑️</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <Pagination page={shopsPg.page} totalPages={shopsPg.totalPages} onChange={shopsPg.setPage}
            shown={shopsPg.pageItems.length} total={shopsPg.total} noun="صافکاری" />
        </>
      )}

      {/* ───────── کاربران ───────── */}
      {tab === 'users' && (
        <>
          <div className="admin-toolbar">
            <input className="admin-search" placeholder="جستجو نام، کد ملی، موبایل یا شعبه..."
              value={userSearch} onChange={e => setUserSearch(e.target.value)} />
            <select className="admin-select" value={userStatusFilter} onChange={e => setUserStatusFilter(e.target.value)}>
              <option value="">همه وضعیت‌ها</option>
              <option value="pending">در انتظار تأیید</option>
              <option value="approved">تأیید شده</option>
              <option value="rejected">رد شده</option>
            </select>
          </div>
          <div className="admin-card">
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>نام</th><th>کد ملی</th><th>موبایل</th><th>شعبه</th>
                    <th>تاریخ ثبت</th><th>وضعیت</th><th>عملیات</th>
                  </tr>
                </thead>
                <tbody>
                  {usersPg.pageItems.map(u => (
                    <tr key={u.id}>
                      <td>{u.name}</td>
                      <td style={{ direction: 'ltr', textAlign: 'right' }}>{u.national}</td>
                      <td style={{ direction: 'ltr', textAlign: 'right' }}>{u.mobile}</td>
                      <td>{u.branch || '—'}</td>
                      <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>{u.registeredAt || '—'}</td>
                      <td>
                        {u.status === 'approved' && <span className="badge badge-success">تأیید شده</span>}
                        {u.status === 'pending'  && <span className="badge badge-warning">در انتظار</span>}
                        {u.status === 'rejected' && <span className="badge badge-danger">رد شده</span>}
                        {!u.status               && <span className="badge badge-success">تأیید شده</span>}
                      </td>
                      <td style={{ whiteSpace: 'nowrap' }}>
                        {u.status === 'pending' && <>
                          <button className="action-btn action-btn-approve" title="تأیید" onClick={() => approveUser(u)}>✅</button>
                          <button className="action-btn action-btn-reject"  title="رد"    onClick={() => rejectUser(u)}>❌</button>
                        </>}
                        {u.status === 'rejected' && (
                          <button className="action-btn action-btn-approve" title="تأیید مجدد" onClick={() => approveUser(u)}>✅</button>
                        )}
                        {(u.status === 'approved' || !u.status) && (
                          <button className="action-btn action-btn-reject" title="رد کردن" onClick={() => rejectUser(u)}>❌</button>
                        )}
                        <button className="action-btn action-btn-edit"   title="ویرایش" onClick={() => setUserEdit({ ...u })}>✏️</button>
                        <button className="action-btn action-btn-delete" title="حذف"    onClick={() => deleteUser(u)}>🗑️</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <Pagination page={usersPg.page} totalPages={usersPg.totalPages} onChange={usersPg.setPage}
            shown={usersPg.pageItems.length} total={usersPg.total} noun="کاربر" />
        </>
      )}

      {/* ───────── همه‌ی تراکنش‌ها ───────── */}
      {tab === 'tx' && (
        <>
          <div className="admin-toolbar">
            <input className="admin-search" placeholder="جستجو صافکاری، شرح، مبلغ یا تاریخ..."
              value={txSearch} onChange={e => setTxSearch(e.target.value)} />
            <select className="admin-select" value={txStatus} onChange={e => setTxStatus(e.target.value)}>
              <option value="">همه وضعیت‌ها</option>
              <option value="success">موفق</option>
              <option value="pending">در انتظار</option>
              <option value="failed">ناموفق</option>
            </select>
          </div>
          <div className="admin-card">
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead><tr><th>صافکاری</th><th>تاریخ و زمان</th><th>شرح</th><th>نوع</th><th>وضعیت</th><th>مبلغ (تومان)</th></tr></thead>
                <tbody>
                  {txPg.pageItems.map(t => (
                    <tr key={t.id}>
                      <td>{t.shop}</td>
                      <td style={{ direction: 'ltr', textAlign: 'right' }}>{t.date} {t.time}</td>
                      <td>{t.desc}</td>
                      <td>
                        <span className="badge" style={{
                          border: `1px solid ${t.type === 'income' ? '#16a34a' : '#dc2626'}`,
                          background: 'transparent', color: t.type === 'income' ? '#16a34a' : '#dc2626' }}>
                          {t.type === 'income' ? 'واریز' : 'برداشت'}
                        </span>
                      </td>
                      <td><span className={`badge ${STATUS_BADGE[t.status]}`}>{STATUS_LABELS[t.status]}</span></td>
                      <td style={{ fontWeight: 700, color: t.type === 'income' ? '#16a34a' : '#dc2626' }}>
                        {t.type === 'income' ? '+' : '-'}{groupNum(t.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <Pagination page={txPg.page} totalPages={txPg.totalPages} onChange={txPg.setPage}
            shown={txPg.pageItems.length} total={txPg.total} noun="تراکنش" />
        </>
      )}

      {/* ───────── محتوای راهنما و تغییرات ───────── */}
      {tab === 'content' && (
        <div className="admin-content-grid">
          {/* پشتیبانی */}
          <section className="admin-card admin-section">
            <h3>📞 اطلاعات پشتیبانی</h3>
            <div className="form-group"><label>تلفن ثابت</label>
              <input value={content.support.phone} onChange={setSupport('phone')} style={{ direction: 'ltr', textAlign: 'right' }} /></div>
            <div className="form-group"><label>موبایل</label>
              <input value={content.support.mobile} onChange={setSupport('mobile')} style={{ direction: 'ltr', textAlign: 'right' }} /></div>
            <div className="form-group"><label>ایمیل</label>
              <input value={content.support.email} onChange={setSupport('email')} style={{ direction: 'ltr', textAlign: 'right' }} /></div>
            <div className="form-group"><label>ساعت پاسخگویی</label>
              <input value={content.support.hours} onChange={setSupport('hours')} /></div>
          </section>

          {/* راهنماها */}
          <section className="admin-card admin-section">
            <div className="admin-section-head">
              <h3>📚 روش‌های استفاده</h3>
              <button className="btn-primary btn-sm" onClick={addGuide}>➕ افزودن</button>
            </div>
            {content.guides.map(g => (
              <div key={g.id} className="admin-item-box">
                <input className="admin-item-title" value={g.title} onChange={setGuide(g.id, 'title')} placeholder="عنوان" />
                <textarea value={g.body} onChange={setGuide(g.id, 'body')} placeholder="توضیحات..." rows={3} />
                <button className="admin-del" onClick={() => delGuide(g.id)}>🗑️ حذف</button>
              </div>
            ))}
          </section>

          {/* تغییرات */}
          <section className="admin-card admin-section admin-section-wide">
            <div className="admin-section-head">
              <h3>🆕 تغییرات نسخه‌ها (Changelog)</h3>
              <button className="btn-primary btn-sm" onClick={addLog}>➕ نسخه جدید</button>
            </div>
            {content.changelog.map(c => (
              <div key={c.id} className="admin-item-box">
                <div className="admin-log-row">
                  <input value={c.version} onChange={setLog(c.id, 'version')} placeholder="نسخه مثلاً ۱.۴.۰" />
                  <input value={c.date} onChange={setLog(c.id, 'date')} placeholder="تاریخ مثلاً ۱۴۰۳/۰۳/۱۵" />
                </div>
                <textarea value={c.items.join('\n')} onChange={setLog(c.id, 'items')}
                  placeholder="هر تغییر در یک خط..." rows={4} />
                <button className="admin-del" onClick={() => delLog(c.id)}>🗑️ حذف نسخه</button>
              </div>
            ))}
            <p className="admin-hint">💡 این محتوا در صفحه‌ی عمومی راهنما (نسخه‌ی Next) نمایش داده می‌شود.</p>
          </section>
        </div>
      )}

      {/* مودال شارژ کیف پول */}
      {chargeShop && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setChargeShop(null)}>
          <div className="modal-box">
            <div className="modal-header">
              <h3>شارژ کیف پول</h3>
              <button className="modal-close" onClick={() => setChargeShop(null)}>✕</button>
            </div>
            <div style={{ marginBottom: 12, color: 'var(--text-muted)' }}>
              صافکاری: <b style={{ color: 'var(--text)' }}>{chargeShop.name}</b><br />
              موجودی فعلی: <b style={{ color: 'var(--text)' }}>{groupNum(chargeShop.wallet)} تومان</b>
            </div>
            <div className="form-group">
              <label>مبلغ شارژ (تومان)</label>
              <input autoFocus value={chargeAmt ? groupNum(normDigits(chargeAmt).replace(/[^\d]/g, '')) : ''}
                onChange={e => setChargeAmt(e.target.value)}
                placeholder="مثلاً ۵۰۰٬۰۰۰" style={{ direction: 'ltr', textAlign: 'right' }} />
            </div>
            <div className="admin-quick-amts">
              {[100000, 500000, 1000000].map(a => (
                <button key={a} type="button" onClick={() => setChargeAmt(String(a))}>{groupNum(a)}</button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
              <button className="btn-primary" onClick={doCharge}>تأیید و شارژ</button>
              <button className="btn-secondary" onClick={() => setChargeShop(null)}>انصراف</button>
            </div>
          </div>
        </div>
      )}

      {/* مودال ویرایش صافکاری */}
      {shopEdit && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShopEdit(null)}>
          <div className="modal-box">
            <div className="modal-header">
              <h3>ویرایش صافکاری</h3>
              <button className="modal-close" onClick={() => setShopEdit(null)}>✕</button>
            </div>
            <div className="form-group"><label>نام صافکاری</label>
              <input value={shopEdit.name} onChange={setSE('name')} /></div>
            <div className="form-group"><label>مالک</label>
              <input value={shopEdit.owner} onChange={setSE('owner')} /></div>
            <div className="form-group"><label>موبایل</label>
              <input value={shopEdit.mobile} onChange={setSE('mobile')} style={{ direction: 'ltr', textAlign: 'right' }} /></div>
            <div className="form-group"><label>آدرس</label>
              <input value={shopEdit.address} onChange={setSE('address')} /></div>
            <div className="form-group"><label>وضعیت</label>
              <select value={shopEdit.status} onChange={setSE('status')}>
                <option value="active">فعال</option>
                <option value="expired">منقضی</option>
              </select>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn-primary" onClick={saveShopEdit}>ذخیره</button>
              <button className="btn-secondary" onClick={() => setShopEdit(null)}>انصراف</button>
            </div>
          </div>
        </div>
      )}

      {/* مودال ویرایش کاربر */}
      {userEdit && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setUserEdit(null)}>
          <div className="modal-box">
            <div className="modal-header">
              <h3>ویرایش کاربر</h3>
              <button className="modal-close" onClick={() => setUserEdit(null)}>✕</button>
            </div>
            <div className="form-group"><label>نام</label>
              <input value={userEdit.name} onChange={setUE('name')} /></div>
            <div className="form-group"><label>کد ملی</label>
              <input value={userEdit.national} onChange={setUE('national')} maxLength={10} style={{ direction: 'ltr', textAlign: 'right' }} /></div>
            <div className="form-group"><label>موبایل</label>
              <input value={userEdit.mobile} onChange={setUE('mobile')} style={{ direction: 'ltr', textAlign: 'right' }} /></div>
            <div className="form-group"><label>شعبه</label>
              <select value={userEdit.branch} onChange={setUE('branch')}>
                <option>شعبه مرکزی</option>
                <option>شعبه مشهد</option>
              </select>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn-primary" onClick={saveUserEdit}>ذخیره</button>
              <button className="btn-secondary" onClick={() => setUserEdit(null)}>انصراف</button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </Layout>
  );
}
