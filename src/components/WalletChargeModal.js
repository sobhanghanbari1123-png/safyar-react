import { useState } from 'react';
import { useWallet } from '../context/WalletContext';

const PRESETS = [50000, 100000, 200000, 500000];

export default function WalletChargeModal({ onClose }) {
  const { charge } = useWallet();
  const [selected, setSelected] = useState(null);
  const [custom, setCustom] = useState('');

  const handleCharge = () => {
    const amount = selected || parseInt(custom);
    if (!amount || amount <= 0) return alert('مبلغ را وارد کنید');
    charge(amount);
    alert(`مبلغ ${amount.toLocaleString('fa-IR')} تومان به کیف پول اضافه شد`);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <div className="modal-header">
          <h3>💳 شارژ کیف پول</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <p style={{ color: 'var(--text2)', fontSize: 14, margin: '0 0 16px' }}>
          مبلغ مورد نظر را انتخاب یا وارد کنید:
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
          {PRESETS.map(p => (
            <button
              key={p}
              onClick={() => { setSelected(p); setCustom(''); }}
              style={{
                padding: '12px',
                borderRadius: 10,
                border: `2px solid ${selected === p ? '#fbbf24' : 'var(--border)'}`,
                background: selected === p ? 'rgba(251,191,36,0.1)' : 'var(--input-bg)',
                color: selected === p ? '#fbbf24' : 'var(--text)',
                fontFamily: 'inherit',
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {p.toLocaleString('fa-IR')} تومان
            </button>
          ))}
        </div>

        <div className="form-group">
          <label>مبلغ دلخواه (تومان)</label>
          <input
            type="text"
            inputMode="numeric"
            placeholder="مثال: 300,000"
            value={custom ? Number(custom).toLocaleString('en-US') : ''}
            onChange={e => { setCustom(e.target.value.replace(/[^0-9]/g, '')); setSelected(null); }}
            style={{ direction: 'ltr', textAlign: 'right' }}
          />
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn-primary" style={{ flex: 1 }} onClick={handleCharge}>
            شارژ کیف پول
          </button>
          <button className="btn-secondary" onClick={onClose}>انصراف</button>
        </div>
      </div>
    </div>
  );
}
