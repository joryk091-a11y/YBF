import { useEffect } from 'react'
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import MainLayout from './layouts/MainLayout.jsx'
import HomePage from './pages/Home.jsx'
import LoginPage from './pages/Login.jsx'
import RegisterPage from './pages/Register.jsx'
import SearchPage from './pages/Search.jsx'
import TravelersPage from './pages/Travelers.jsx'
import PaymentPage from './pages/Payment.jsx'
import CompanyLogin from './pages/CompanyLogin.jsx'
import CompanyDashboard from './pages/CompanyDashboard.jsx'
import AdminDashboard from './pages/AdminDashboard.jsx'
import AdminUsers from './pages/AdminUsers.jsx'
import SeatsPage from './pages/Seats.jsx'
import MyBookings from './pages/MyBookings.jsx'

import { SearchProvider } from './utils/SearchContext.jsx'
import { ThemeProvider } from './utils/ThemeContext.jsx'

// مكون حماية مسار الشركات
const CompanyProtectedRoute = ({ children }) => {
    const token = localStorage.getItem('companyToken');
    if (!token) {
        return <Navigate to="/company/login" replace />;
    }
    return children;
};

// مكون حماية مسار المدير
const AdminProtectedRoute = ({ children }) => {
    const adminToken = localStorage.getItem('adminToken');
    const userRole = localStorage.getItem('userRole');
    if (!adminToken || userRole !== 'admin') {
        return <Navigate to="/company/login" replace />;
    }
    return children;
};

// مكون إعادة التمرير لأعلى الصفحة عند التنقل
const ScrollToTop = () => {
    const { pathname } = useLocation();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]);

    return null;
};

function App() {
  return (
    <ThemeProvider>
      <SearchProvider>
        <BrowserRouter>
          <ScrollToTop />
          <Routes>
            {/* ===== مسار تسجيل دخول الشركات (عام) ===== */}
            <Route path="/company/login" element={<CompanyLogin />} />

            {/* ===== مسار لوحة تحكم الشركات (محمي) ===== */}
            <Route
              path="/company/dashboard"
              element={
                <CompanyProtectedRoute>
                  <CompanyDashboard />
                </CompanyProtectedRoute>
              }
            />

            {/* ===== مسار لوحة تحكم المدير (محمي) ===== */}
            <Route
              path="/admin/dashboard"
              element={
                <AdminProtectedRoute>
                  <AdminDashboard />
                </AdminProtectedRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <AdminProtectedRoute>
                  <AdminUsers />
                </AdminProtectedRoute>
              }
            />
            <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />


            {/* ===== المسارات العامة مع MainLayout ===== */}
            <Route element={<MainLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/seats" element={<SeatsPage />} />
              <Route path="/travelers" element={<TravelersPage />} />
              <Route path="/payment" element={<PaymentPage />} />
              <Route path="/my-bookings" element={<MyBookings />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/home" element={<Navigate to="/" replace />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </SearchProvider>
    </ThemeProvider>
  )
}

export default App