import { useState } from 'react';
import Layout from '../components/Layout';
import Pagination, { usePagination } from '../components/Pagination';
import { normDigits } from '../utils/normalize';

const SAMPLE = [
  { id: 1, date: '۱۴۰۳/۰۳/۱۵', time: '۱۰:۳۰', status: 'success', desc: 'شارژ کیف پول', type: 'income', amount: 500000 },
  { id: 2, date: '۱۴۰۳/۰۳/۱۴', time: '۱۴:۰۰', status: 'success', desc: 'پرداخت هزینه پذیرش', type: 'expense', amount: 200000 },
  { id: 3, date: '۱۴۰۳/۰۳/۱۳', time: '۰۹:۱۵', status: 'pending', desc: 'شارژ کیف پول', type: 'income', amount: 1000000 },
  { id: 4, date: '۱۴۰۳/۰۳/۱۲', time: '۱۶:۴۵', status: 'failed', desc: 'پرداخت ناموفق', type: 'expense', amount: 150000 },
  { id: 5, date: '۱۴۰۳/۰۳/۱۱', time: '۱۱:۰۰', status: 'success', desc: 'دریافت از مشتری', type: 'income', amount: 750000 },
];

const STATUS_LABELS = { success: 'موفق', pending: 'در انتظار', failed: 'ناموفق' };
const STATUS_BADGE = { success: 'badge-success', pending: 'badge-warning', failed: 'badge-danger' };

export default function Transactions() {
  const [filter, setFilter] = useState({ fromDate: '', toDate: '', status: '', type: '' });

  const setF = k => e => setFilter({ ...filter, [k]: e.target.value });

  const filtered = SAMPLE.filter(t => {
    if (filter.status && t.status !== filter.status) return false;
    if (filter.type && t.type !== filter.type) return false;
    const tDate = normDigits(t.date);
    if (filter.fromDate && tDate < normDigits(filter.fromDate)) return false;
    if (filter.toDate   && tDate > normDigits(filter.toDate))   return false;
    return true;
  });

  const pg = usePagination(filtered, 10, `${filter.status}|${filter.type}|${filter.fromDate}|${filter.toDate}`);

  const totalIncome = SAMPLE.filter(t => t.type === 'income' && t.status === 'success').reduce((a, t) => a + t.amount, 0);
  const totalExpense = SAMPLE.filter(t => t.type === 'expense' && t.status === 'success').reduce((a, t) => a + t.amount, 0);
  const balance = totalIncome - totalExpense;

  const stats = [
    { label: 'کل تراکنش‌ها', value: SAMPLE.length, icon: '📊', color: '#3b82f6' },
    { label: 'کل واریز', value: totalIncome.toLocaleString('fa-IR') + ' ت', icon: '💚', color: '#10b981' },
    { label: 'کل برداشت', value: totalExpense.toLocaleString('fa-IR') + ' ت', icon: '❤️', color: '#ef4444' },
    { label: 'موجودی', value: balance.toLocaleString('fa-IR') + ' ت', icon: '💳', color: '#fbbf24' },
  ];

  return (
    <Layout title="تراکنش‌های کیف پول">
      <div className="stats-grid">
        {stats.map(s => (
          <div className="stat-card" key={s.label}>
            <div className="stat-icon" style={{ background: s.color + '22', color: s.color }}>{s.icon}</div>
            <div className="stat-info"><h4>{s.label}</h4><div className="stat-value" style={{ fontSize: 16 }}>{s.value}</div></div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: 12, padding: 20, marginBottom: 20 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 16 }}>
          <div className="form-group" style={{ margin: 0 }}>
            <label>از تاریخ</label>
            <input type="text" placeholder="۱۴۰۳/۰۱/۰۱" value={filter.fromDate} onChange={setF('fromDate')} />
          </div>
          <div className="form-group" style={{ margin: 0 }}>
            <label>تا تاریخ</label>
            <input type="text" placeholder="۱۴۰۳/۱۲/۲۹" value={filter.toDate} onChange={setF('toDate')} />
          </div>
          <div className="form-group" style={{ margin: 0 }}>
            <label>وضعیت</label>
            <select value={filter.status} onChange={setF('status')}>
              <option value="">همه</option>
              <option value="success">موفق</option>
              <option value="pending">در انتظار</option>
              <option value="failed">ناموفق</option>
            </select>
          </div>
          <div className="form-group" style={{ margin: 0 }}>
            <label>نوع</label>
            <select value={filter.type} onChange={setF('type')}>
              <option value="">همه</option>
              <option value="income">واریز</option>
              <option value="expense">برداشت</option>
            </select>
          </div>
        </div>
      </div>

      <div style={{ background: 'var(--card-bg)', borderRadius: 12, border: '1px solid var(--border)', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr><th>تاریخ و زمان</th><th>وضعیت</th><th>توضیحات</th><th>نوع</th><th>مبلغ (تومان)</th></tr>
            </thead>
            <tbody>
              {pg.pageItems.map(t => (
                <tr key={t.id}>
                  <td style={{ direction: 'ltr', textAlign: 'right' }}>{t.date} {t.time}</td>
                  <td><span className={`badge ${STATUS_BADGE[t.status]}`}>{STATUS_LABELS[t.status]}</span></td>
                  <td>{t.desc}</td>
                  <td>
                    <span className="badge" style={{
                      border: `1px solid ${t.type === 'income' ? '#16a34a' : '#dc2626'}`,
                      background: 'transparent',
                      color: t.type === 'income' ? '#16a34a' : '#dc2626'
                    }}>
                      {t.type === 'income' ? 'واریز' : 'برداشت'}
                    </span>
                  </td>
                  <td style={{ fontWeight: 700, color: t.type === 'income' ? '#16a34a' : '#dc2626' }}>
                    {t.type === 'income' ? '+' : '-'}{t.amount.toLocaleString('fa-IR')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Pagination
        page={pg.page} totalPages={pg.totalPages} onChange={pg.setPage}
        shown={pg.pageItems.length} total={pg.total} noun="تراکنش" />
    </Layout>
  );
}
