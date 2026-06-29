import { NavLink } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useWallet } from '../context/WalletContext';
import WalletChargeModal from './WalletChargeModal';
import { useState } from 'react';
import { isAdmin, getCurrentRole } from '../data/admin';
import SafyarLogo from './SafyarLogo';
import './Sidebar.css';

const ALL_NAV = [
  { to: '/',             label: 'داشبورد',      icon: '🏠', end: true, roles: ['ادمین', 'کاربر عادی'] },
  { to: '/reports',      label: 'گزارشات',      icon: '📊',            roles: ['ادمین', 'کاربر عادی'] },
  { to: '/customers',    label: 'مشتریان',      icon: '👥',            roles: ['ادمین', 'کاربر عادی'] },
  { to: '/vehicles',     label: 'ماشین‌ها',     icon: '🚗',            roles: ['ادمین', 'کاربر عادی'] },
  { to: '/transactions', label: 'تراکنش‌ها',    icon: '💳',            roles: ['ادمین', 'کاربر عادی'] },
  { to: '/branches',     label: 'شعبه‌ها',      icon: '🏢',            roles: ['ادمین'] },
  { to: '/users',        label: 'کاربران',      icon: '👤',            roles: ['ادمین'] },
  { to: '/workers',      label: 'صافکار/نقاش',  icon: '🔧',            roles: ['ادمین'] },
  { to: '/settings',     label: 'تنظیمات',      icon: '⚙️',            roles: ['ادمین'] },
];

export default function Sidebar({ mobileOpen, onClose }) {
  const { theme, toggle } = useTheme();
  const { balance } = useWallet();
  const [showWallet, setShowWallet] = useState(false);
  const role = getCurrentRole();
  const isFullAccess = role === 'مالک' || role === 'ادمین';
  const navItems = ALL_NAV.filter(item => item.roles.includes(role) || (isFullAccess && item.roles.includes('ادمین')));
  const items = isAdmin()
    ? [...navItems, { to: '/admin', label: 'پنل ادمین', icon: '🛡️' }]
    : navItems;

  return (
    <>
      <aside className={`sidebar ${mobileOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          {(() => {
            try {
              const s = JSON.parse(localStorage.getItem('safyar_settings') || '{}');
              return s.logo
                ? <img src={s.logo} alt="لوگو" className="sidebar-logo-img" />
                : <SafyarLogo size={36} />;
            } catch { return <span className="logo-icon">🚗</span>; }
          })()}
          <span className="logo-text">
            {(() => { try { return JSON.parse(localStorage.getItem('safyar_settings') || '{}').shopName || 'صافیار'; } catch { return 'صافیار'; } })()}
          </span>
          <button className="sidebar-close-btn no-print" onClick={onClose}>✕</button>
        </div>

        <div className="sidebar-wallet">
          <div className="wallet-label">کیف پول</div>
          <div className="wallet-balance">{balance.toLocaleString('fa-IR')} تومان</div>
          <button className="wallet-charge-btn" onClick={() => setShowWallet(true)}>
            + شارژ کیف پول
          </button>
        </div>

        <nav className="sidebar-nav">
          {items.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              onClick={onClose}
            >
              <span className="nav-icon">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="theme-toggle-btn" onClick={toggle}>
            {theme === 'night' ? '☀️ حالت روز' : '🌙 حالت شب'}
          </button>
          <NavLink to="/login" className="logout-btn">🚪 خروج</NavLink>
        </div>
      </aside>

      {mobileOpen && <div className="sidebar-overlay" onClick={onClose} />}
      {showWallet && <WalletChargeModal onClose={() => setShowWallet(false)} />}
    </>
  );
}
