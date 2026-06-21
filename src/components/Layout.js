import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useWallet } from '../context/WalletContext';
import { useTheme } from '../context/ThemeContext';
import WalletChargeModal from './WalletChargeModal';
import { isSettingsComplete } from '../pages/Settings';
import './Layout.css';

export default function Layout({ children, title }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showWallet, setShowWallet] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const { balance } = useWallet();
  const { theme, toggle } = useTheme();
  const { pathname } = useLocation();
  const showBanner = !bannerDismissed && !isSettingsComplete() && pathname !== '/settings';

  return (
    <div className="layout">
      <Sidebar mobileOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="main-content">
        <header className="main-header no-print">
          <button className="hamburger-btn" onClick={() => setSidebarOpen(true)}>☰</button>
          <h1 className="page-title">{title}</h1>
          <div className="header-actions">
            <button className="mini-wallet-btn" onClick={() => setShowWallet(true)}>
              💳 {balance.toLocaleString('fa-IR')} تومان
            </button>
            <button className="theme-btn-header" onClick={toggle}>
              {theme === 'night' ? '☀️' : '🌙'}
            </button>
          </div>
        </header>

        {showBanner && (
          <div className="settings-banner no-print">
            <span className="settings-banner-icon">⚠️</span>
            <span className="settings-banner-text">
              اطلاعات تعمیرگاه شما کامل نیست.
              <Link to="/settings" className="settings-banner-link">برای تکمیل اطلاعات به تنظیمات بروید ←</Link>
            </span>
            <button className="settings-banner-close" onClick={() => setBannerDismissed(true)}>✕</button>
          </div>
        )}

        <main className="page-body page-fade-in">
          {children}
        </main>
      </div>

      {showWallet && <WalletChargeModal onClose={() => setShowWallet(false)} />}
    </div>
  );
}
