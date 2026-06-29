import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { WalletProvider } from './context/WalletContext';
import { getCurrentRole } from './data/admin';

import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import Reports from './pages/Reports';
import Branches from './pages/Branches';
import Customers from './pages/Customers';
import Users from './pages/Users';
import Workers from './pages/Workers';
import Transactions from './pages/Transactions';
import RegisterKmFuel from './pages/RegisterKmFuel';
import ChoosePlacePrice from './pages/ChoosePlacePrice';
import ChoosePhoto from './pages/ChoosePhoto';
import Status from './pages/Status';
import Settings from './pages/Settings';
import AdminPanel from './pages/AdminPanel';
import EditRepairs from './pages/EditRepairs';
import Vehicles from './pages/Vehicles';

function AdminOnly({ element }) {
  const role = getCurrentRole();
  return (role === 'ادمین' || role === 'مالک') ? element : <Navigate to="/" replace />;
}

export default function App() {
  return (
    <ThemeProvider>
      <WalletProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/" element={<Dashboard />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/branches" element={<AdminOnly element={<Branches />} />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/users" element={<AdminOnly element={<Users />} />} />
            <Route path="/workers" element={<AdminOnly element={<Workers />} />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/register-km-fuel" element={<RegisterKmFuel />} />
            <Route path="/choose-place-price" element={<ChoosePlacePrice />} />
            <Route path="/choose-photo" element={<ChoosePhoto />} />
            <Route path="/status" element={<Status />} />
            <Route path="/settings" element={<AdminOnly element={<Settings />} />} />
            <Route path="/admin" element={<AdminPanel />} />
            <Route path="/edit-repairs/:id" element={<EditRepairs />} />
            <Route path="/vehicles" element={<Vehicles />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </WalletProvider>
    </ThemeProvider>
  );
}
