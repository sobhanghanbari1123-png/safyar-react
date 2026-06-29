import { useState } from 'react';
import Layout from '../components/Layout';
import { ToastContainer, useToast } from '../components/Toast';
import FieldError from '../components/FieldError';
import Pagination, { usePagination } from '../components/Pagination';
import './Dashboard.css';

const STORAGE_KEY = 'safyar_vehicles';

const PLATE_LETTERS = [
  'الف','ب','پ','ت','ث',
  'ج','چ','ح','خ','د',
  'ذ','ر','ز','س','ش',
  'ص','ط','ع','غ','ف',
  'ق','ک','گ','ل','م',
  'ن','و','ه','ی',
];

const BRANDS = ['پراید','پژو','سمند','دنا','تیبا','ال۹۰','سانتافه','توسان','کوییک','آریزو','شاهین','مزدا','تویوتا','هیوندای','کیا','ام‌وی‌ام','برلیانس','رنو','سایر'];
const COLORS = ['سفید','مشکی','نقره‌ای','خاکستری','قرمز','آبی','سبز','زرد','نارنجی','بنفش','قهوه‌ای','سرمه‌ای'];
const COLOR_DOT = {
  'سفید':'#e2e8f0','مشکی':'#1e293b','نقره‌ای':'#94a3b8','خاکستری':'#64748b',
  'قرمز':'#ef4444','آبی':'#3b82f6','سبز':'#22c55e','زرد':'#eab308',
  'نارنجی':'#f97316','بنفش':'#a855f7','قهوه‌ای':'#78350f','سرمه‌ای':'#1e3a5f',
};

const EMPTY_PLATE = { p1:'', letter:'', p2:'', province:'' };
const EMPTY = { plateP1:'', plateLetter:'', plateP2:'', plateProvince:'', brand:'', model:'', color:'سفید', ownerName:'', ownerPhone:'' };

function load() {
  try {
    const d = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    if (d.length) return d;
    return [
      { id:1, plateP1:'۱۲', plateLetter:'الف', plateP2:'۳۴۵', plateProvince:'۶۷', brand:'پژو',  model:'۲۰۶', color:'سفید',    ownerName:'علی احمدی',   ownerPhone:'09121234567' },
      { id:2, plateP1:'۴۴', plateLetter:'ن',   plateP2:'۸۸۱', plateProvince:'۳۳', brand:'سمند', model:'LX',   color:'نقره‌ای',  ownerName:'مریم رضایی', ownerPhone:'09351234567' },
      { id:3, plateP1:'۷۸', plateLetter:'س',   plateP2:'۲۲۳', plateProvince:'۱۱', brand:'دنا',  model:'Plus', color:'مشکی',    ownerName:'حسن کریمی',  ownerPhone:'09181234567' },
    ];
  } catch { return []; }
}
function save(list) { localStorage.setItem(STORAGE_KEY, JSON.stringify(list)); }

function plateText(v) {
  return `${v.plateP1} - ${v.plateLetter} - ${v.plateP2}`;
}

/* ─── Plate Badge ─── */
function PlateBadge({ p1, letter, p2, province }) {
  return (
    <div style={{ display:'inline-flex', alignItems:'stretch', border:'3px solid #e6b800', borderRadius:10, overflow:'hidden', background:'#fff', boxShadow:'0 2px 6px rgba(0,0,0,.22)', minWidth:180 }}>
      <div style={{ background:'#0e3fa3', color:'#fff', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'3px 6px', gap:1, minWidth:40, borderLeft:'2px solid #e6b800' }}>
        <div style={{ fontSize:7, color:'#ffd700', letterSpacing:1 }}>★★★</div>
        <div style={{ width:18, height:18, borderRadius:'50%', overflow:'hidden', border:'1px solid rgba(255,255,255,0.4)', flexShrink:0, display:'flex', flexDirection:'column' }}>
          <div style={{ flex:1, background:'#239f40' }}/>
          <div style={{ flex:1, background:'#fff' }}/>
          <div style={{ flex:1, background:'#da0000' }}/>
        </div>
        <span style={{ fontSize:8, fontFamily:'inherit' }}>ایران</span>
        {province && (
          <div style={{ background:'#fff', color:'#0e3fa3', borderRadius:2, padding:'0 3px', fontSize:9, fontWeight:800, lineHeight:'14px' }}>
            {province}
          </div>
        )}
      </div>
      <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', color:'#111', fontWeight:900, fontSize:15, padding:'0 8px', fontFamily:'monospace', gap:4 }}>
        <span>{p2}</span>
        <span style={{ color:'#999', fontSize:13 }}>-</span>
        <span style={{ background:'#f5f0e0', borderRadius:4, padding:'1px 6px', fontSize:14 }}>{letter}</span>
        <span style={{ color:'#999', fontSize:13 }}>-</span>
        <span>{p1}</span>
      </div>
    </div>
  );
}

/* ─── Plate Editor ─── */
function PlateEditor({ value, onChange, errors }) {
  const [showPicker, setShowPicker] = useState(false);
  const { p1, letter, p2, province } = value;
  const set = k => val => onChange({ ...value, [k]: val });

  return (
    <div>
      {/* Preview */}
      <div style={{ display:'flex', justifyContent:'center', marginBottom:14 }}>
        <PlateBadge p1={p1||'__'} letter={letter||'__'} p2={p2||'___'} province={province||'__'} />
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr 1fr', gap:8, marginBottom:8 }}>
        {/* P1 */}
        <div className={`form-group ${errors.p1?'field-invalid':''}`} style={{ margin:0 }}>
          <label style={{ fontSize:11 }}>۲ رقم اول</label>
          <input
            maxLength={2}
            value={p1}
            onChange={e => set('p1')(e.target.value)}
            placeholder="۱۲"
            style={{ textAlign:'center', fontWeight:700, fontSize:15, letterSpacing:3 }}
          />
          <FieldError msg={errors.p1}/>
        </div>

        {/* Letter picker */}
        <div className={`form-group ${errors.letter?'field-invalid':''}`} style={{ margin:0, position:'relative' }}>
          <label style={{ fontSize:11 }}>حرف</label>
          <div style={{ display:'flex', gap:4 }}>
            <input
              value={letter}
              onChange={e => set('letter')(e.target.value)}
              maxLength={3}
              placeholder="الف"
              style={{ flex:1, textAlign:'center', fontWeight:700, fontSize:15 }}
            />
            <button
              type="button"
              onClick={() => setShowPicker(v => !v)}
              title="انتخاب از لیست"
              style={{ padding:'0 8px', border:'1px solid var(--input-border)', borderRadius:8, background:'var(--input-bg)', color:'var(--text)', cursor:'pointer', fontSize:14 }}
            >▼</button>
          </div>
          <FieldError msg={errors.letter}/>

          {showPicker && (
            <div style={{ position:'absolute', top:'calc(100% + 4px)', left:'50%', transform:'translateX(-50%)', zIndex:99, background:'var(--card-bg)', border:'1px solid var(--border)', borderRadius:12, padding:12, boxShadow:'0 8px 24px rgba(0,0,0,.3)', width:260 }}>
              <div style={{ textAlign:'center', fontSize:12, color:'var(--text2)', marginBottom:8 }}>حرف پلاک را انتخاب کنید</div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:6 }}>
                {PLATE_LETTERS.map(l => (
                  <button
                    key={l}
                    type="button"
                    onClick={() => { set('letter')(l); setShowPicker(false); }}
                    style={{
                      padding:'7px 4px', borderRadius:8, border:'1px solid var(--border)',
                      background: letter===l ? 'var(--accent)' : 'var(--bg2)',
                      color: letter===l ? '#fff' : 'var(--text)',
                      fontWeight:600, fontSize:14, cursor:'pointer',
                    }}
                  >{l}</button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* P2 */}
        <div className={`form-group ${errors.p2?'field-invalid':''}`} style={{ margin:0 }}>
          <label style={{ fontSize:11 }}>۳ رقم آخر</label>
          <input
            maxLength={3}
            value={p2}
            onChange={e => set('p2')(e.target.value)}
            placeholder="۳۴۵"
            style={{ textAlign:'center', fontWeight:700, fontSize:15, letterSpacing:3 }}
          />
          <FieldError msg={errors.p2}/>
        </div>

        {/* Province */}
        <div className="form-group" style={{ margin:0 }}>
          <label style={{ fontSize:11 }}>کد استان</label>
          <input
            maxLength={2}
            value={province}
            onChange={e => set('province')(e.target.value)}
            placeholder="۶۷"
            style={{ textAlign:'center', fontWeight:700, fontSize:15, letterSpacing:3 }}
          />
        </div>
      </div>
    </div>
  );
}

/* ─── Main Page ─── */
export default function Vehicles() {
  const [vehicles, setVehicles] = useState(load);
  const [search, setSearch]     = useState('');
  const [editId, setEditId]     = useState(null);
  const [editForm, setEditForm] = useState(null);
  const [errors, setErrors]     = useState({});
  const { toasts, removeToast, success } = useToast();

  const filtered = vehicles.filter(v => {
    if (!search) return true;
    const pt = plateText(v).replace(/\s/g,'');
    const q  = search.replace(/\s/g,'');
    return pt.includes(q) || v.plateLetter.includes(search) || v.brand.includes(search) ||
      v.model.includes(search) || v.color.includes(search) ||
      v.ownerName.includes(search) || v.ownerPhone.includes(search);
  });

  const pg = usePagination(filtered, 10, search);

  const openEdit = v => {
    setEditId(v.id);
    setEditForm({
      plateP1:v.plateP1, plateLetter:v.plateLetter, plateP2:v.plateP2, plateProvince:v.plateProvince,
      brand:v.brand, model:v.model, color:v.color, ownerName:v.ownerName, ownerPhone:v.ownerPhone,
    });
    setErrors({});
  };

  const validate = f => {
    const e = {};
    if (!f.plateP1.trim())     e.p1       = '۲ رقم اول الزامی است';
    else if (f.plateP1.trim().length > 2) e.p1 = 'حداکثر ۲ رقم';
    if (!f.plateLetter.trim()) e.letter   = 'حرف الزامی است';
    if (!f.plateP2.trim())     e.p2       = '۳ رقم آخر الزامی است';
    else if (f.plateP2.trim().length > 3) e.p2 = 'حداکثر ۳ رقم';
    if (!f.ownerName.trim())   e.ownerName  = 'نام مالک الزامی است';
    if (!f.ownerPhone.trim())  e.ownerPhone = 'شماره تماس الزامی است';
    else if (!/^09\d{9}$/.test(f.ownerPhone.trim())) e.ownerPhone = 'شماره باید ۱۱ رقم و با ۰۹ شروع شود';
    return e;
  };

  const handleSave = e => {
    e.preventDefault();
    const errs = validate(editForm);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    const updated = vehicles.map(v => v.id===editId ? {...v,...editForm} : v);
    setVehicles(updated); save(updated); setEditId(null);
    success('تغییرات ذخیره شد ✓');
  };

  const handleDelete = id => {
    if (!window.confirm('حذف این خودرو؟')) return;
    const updated = vehicles.filter(v => v.id!==id);
    setVehicles(updated); save(updated);
    success('خودرو حذف شد');
  };

  return (
    <Layout title="ماشین‌ها">
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      {/* Stats */}
      <div className="stats-grid stats-grid-3">
        {[
          { label:'کل خودروها', value:vehicles.length, icon:'🚗', color:'#3b82f6' },
          { label:'جستجو شده',  value:filtered.length, icon:'🔍', color:'#10b981' },
        ].map(s => (
          <div className="stat-card" key={s.label}>
            <div className="stat-icon" style={{ background:s.color+'22', color:s.color }}>{s.icon}</div>
            <div className="stat-info"><h4>{s.label}</h4><div className="stat-value">{s.value}</div></div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div style={{ marginBottom:16 }}>
        <input
          type="text"
          placeholder="جستجو با پلاک، برند، نام مالک، شماره تماس..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ width:'100%', padding:'10px 14px', border:'1px solid var(--input-border)', borderRadius:8, background:'var(--input-bg)', color:'var(--text)', fontFamily:'inherit', fontSize:14 }}
        />
      </div>

      {/* Table */}
      <div style={{ background:'var(--card-bg)', borderRadius:12, border:'1px solid var(--border)', overflow:'hidden' }}>
        <div style={{ overflowX:'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>پلاک</th>
                <th>برند / مدل</th>
                <th>رنگ</th>
                <th>نام مالک</th>
                <th>شماره تماس</th>
                <th>عملیات</th>
              </tr>
            </thead>
            <tbody>
              {pg.pageItems.length===0 ? (
                <tr><td colSpan={6} style={{ textAlign:'center', padding:24, color:'var(--text2)' }}>نتیجه‌ای یافت نشد</td></tr>
              ) : pg.pageItems.map(v => (
                <tr key={v.id}>
                  <td>
                    <PlateBadge p1={v.plateP1} letter={v.plateLetter} p2={v.plateP2} province={v.plateProvince} />
                  </td>
                  <td style={{ fontWeight:600 }}>{v.brand}{v.model ? ` ${v.model}` : ''}</td>
                  <td>
                    <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                      <div style={{ width:13, height:13, borderRadius:'50%', background:COLOR_DOT[v.color]||'#94a3b8', border:'1.5px solid var(--border)', flexShrink:0 }}/>
                      {v.color}
                    </div>
                  </td>
                  <td>{v.ownerName}</td>
                  <td>
                    <a href={`tel:${v.ownerPhone}`} style={{ color:'var(--accent)', textDecoration:'none', fontWeight:600, direction:'ltr', display:'inline-block' }}>
                      {v.ownerPhone}
                    </a>
                  </td>
                  <td>
                    <div style={{ display:'flex', gap:4 }}>
                      <button className="action-btn action-btn-edit"   onClick={() => openEdit(v)} title="ویرایش">✏️</button>
                      <button className="action-btn action-btn-delete" onClick={() => handleDelete(v.id)} title="حذف">🗑️</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Pagination page={pg.page} totalPages={pg.totalPages} onChange={pg.setPage}
        shown={pg.pageItems.length} total={pg.total} noun="خودرو" />

      {/* Edit Modal */}
      {editId && (
        <div className="modal-overlay" onClick={e => e.target===e.currentTarget && setEditId(null)}>
          <div className="modal-box" style={{ maxWidth:520 }}>
            <div className="modal-header">
              <h3>ویرایش خودرو</h3>
              <button className="modal-close" onClick={() => setEditId(null)}>✕</button>
            </div>
            <form onSubmit={handleSave} noValidate>
              <PlateEditor
                value={{ p1:editForm.plateP1, letter:editForm.plateLetter, p2:editForm.plateP2, province:editForm.plateProvince }}
                onChange={({ p1, letter, p2, province }) => setEditForm(f => ({ ...f, plateP1:p1, plateLetter:letter, plateP2:p2, plateProvince:province }))}
                errors={errors}
              />
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                <div className={`form-group ${errors.brand?'field-invalid':''}`}>
                  <label>برند</label>
                  <input value={editForm.brand} onChange={e => setEditForm(f=>({...f,brand:e.target.value}))} placeholder="مثال: پژو، سمند، دنا"/>
                </div>
                <div className="form-group">
                  <label>مدل</label>
                  <input value={editForm.model} onChange={e => setEditForm(f=>({...f,model:e.target.value}))} placeholder="مثال: ۲۰۶"/>
                </div>
                <div className="form-group">
                  <label>رنگ</label>
                  <input value={editForm.color} onChange={e => setEditForm(f=>({...f,color:e.target.value}))} placeholder="مثال: سفید، مشکی، نقره‌ای"/>
                </div>
                <div className={`form-group ${errors.ownerName?'field-invalid':''}`}>
                  <label>نام مالک</label>
                  <input value={editForm.ownerName} onChange={e => setEditForm(f=>({...f,ownerName:e.target.value}))} placeholder="نام و نام خانوادگی"/>
                  <FieldError msg={errors.ownerName}/>
                </div>
              </div>
              <div className={`form-group ${errors.ownerPhone?'field-invalid':''}`}>
                <label>شماره تماس</label>
                <input value={editForm.ownerPhone} onChange={e => setEditForm(f=>({...f,ownerPhone:e.target.value}))} placeholder="09121234567" type="tel"/>
                <FieldError msg={errors.ownerPhone}/>
              </div>
              <div style={{ display:'flex', gap:10, marginTop:4 }}>
                <button type="submit" className="btn-primary">ذخیره</button>
                <button type="button" className="btn-secondary" onClick={() => setEditId(null)}>انصراف</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}
