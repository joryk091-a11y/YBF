import { useEffect } from 'react'
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import MainLayout from './layouts/MainLayout.jsx'
import HomePage from './pages/Home.jsx'
import LoginPage from './pages/Login.jsx'
import RegisterPage from './pages/Register.jsx'
import SearchPage from './pages/Search.jsx'
import TravelersPage from './pages/Travelers.jsx'
import PaymentPage from './pages/Payment.jsx'
import PaymentSuccessPage from './pages/PaymentSuccess.jsx'
import CompanyLogin from './pages/CompanyLogin.jsx'
import CompanyDashboard from './pages/CompanyDashboard.jsx'
import CompanyFlights from './pages/CompanyFlights.jsx'
import CompanyPassengers from './pages/CompanyPassengers.jsx'
import CompanyAnalytics from './pages/CompanyAnalytics.jsx'
import Notifications from './pages/Notifications.jsx'
import FinancialReport from './pages/FinancialReport.jsx'
import DestinationReport from './pages/DestinationReport.jsx'
import MedicalServicesReport from './pages/MedicalServicesReport.jsx'
import PassengerStatusReport from './pages/PassengerStatusReport.jsx'
import AdminDashboard from './pages/AdminDashboard.jsx'
import AdminUsers from './pages/AdminUsers.jsx'
import SeatsPage from './pages/Seats.jsx'
import MyBookings from './pages/MyBookings.jsx'
import PlaceholderPage from './pages/PlaceholderPage.jsx'
import TermsPage from './pages/Terms.jsx'
import { Plane, BarChart3, Database, ClipboardList, HeartPulse } from 'lucide-react'
import AdminLogin from './pages/AdminLogin.jsx'

import { SearchProvider } from './utils/SearchContext.jsx'
import { ThemeProvider } from './utils/ThemeContext.jsx'
import { AuthProvider } from './utils/AuthContext.jsx'


const CompanyProtectedRoute = ({ children }) => {
    const token = localStorage.getItem('companyToken');
    if (!token) {
        return <Navigate to="/company/login" replace />;
    }
    return children;
};


const AdminProtectedRoute = ({ children }) => {
    const adminToken = localStorage.getItem('adminToken');
    const userRole = localStorage.getItem('userRole');
    if (!adminToken || userRole !== 'admin') {
        return <Navigate to="/admin/login" replace />;
    }
    return children;
};


const ScrollToTop = () => {
    const { pathname } = useLocation();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]);

    return null;
};

function App() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('debug') === 'true') {
      localStorage.setItem('ybf_debug', 'true');
      const newUrl = window.location.pathname + window.location.hash;
      window.location.replace(newUrl); 
    } else if (params.get('debug') === 'false') {
      localStorage.removeItem('ybf_debug');
      
      localStorage.removeItem('ybf_mock_user');
      const newUrl = window.location.pathname + window.location.hash;
      window.location.replace(newUrl);
    }
  }, []);

  const showMockAuth = localStorage.getItem('ybf_debug') === 'true';

  return (
    <ThemeProvider>
      <AuthProvider>
        <SearchProvider>
          <BrowserRouter>
            <ScrollToTop />

            <Routes>
              {}
              <Route path="/admin/login" element={<AdminLogin />} />
            {}
            <Route path="/company/login" element={<CompanyLogin />} />

            {}
            <Route
              path="/company/dashboard"
              element={
                <CompanyProtectedRoute>
                  <CompanyDashboard />
                </CompanyProtectedRoute>
              }
            />
            <Route
              path="/company/flights"
              element={
                <CompanyProtectedRoute>
                  <CompanyFlights />
                </CompanyProtectedRoute>
              }
            />
            <Route
              path="/company/passengers"
              element={
                <CompanyProtectedRoute>
                  <CompanyPassengers />
                </CompanyProtectedRoute>
              }
            />
            <Route
              path="/company/analytics"
              element={
                <CompanyProtectedRoute>
                  <CompanyAnalytics />
                </CompanyProtectedRoute>
              }
            />
            <Route
              path="/company-analytics"
              element={
                <CompanyProtectedRoute>
                  <CompanyAnalytics />
                </CompanyProtectedRoute>
              }
            />
            <Route
              path="/financial-report"
              element={
                <CompanyProtectedRoute>
                  <FinancialReport />
                </CompanyProtectedRoute>
              }
            />
            <Route
              path="/destination-report"
              element={
                <CompanyProtectedRoute>
                  <DestinationReport />
                </CompanyProtectedRoute>
              }
            />
            <Route
              path="/medical-services"
              element={
                <CompanyProtectedRoute>
                  <MedicalServicesReport />
                </CompanyProtectedRoute>
              }
            />
            <Route
              path="/passenger-status"
              element={
                <CompanyProtectedRoute>
                  <PassengerStatusReport />
                </CompanyProtectedRoute>
              }
            />
            <Route
              path="/company/services"
              element={
                <CompanyProtectedRoute>
                  <MedicalServicesReport />
                </CompanyProtectedRoute>
              }
            />
            <Route
              path="/company/notifications"
              element={
                <CompanyProtectedRoute>
                  <Notifications />
                </CompanyProtectedRoute>
              }
            />

            {}
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
              element={<Navigate to="/admin/dashboard" state={{ activeTab: 'users' }} replace />}
            />
            <Route
              path="/admin/airlines"
              element={
                <AdminProtectedRoute>
                  <PlaceholderPage
                    title="إدارة شركات الطيران"
                    description="هنا يمكنك التحكم بشركاء الطيران وتعديل بياناتهم ونسب التحصيل الحالية."
                    icon={Plane}
                  />
                </AdminProtectedRoute>
              }
            />
            <Route
              path="/admin/stats"
              element={
                <AdminProtectedRoute>
                  <PlaceholderPage
                    title="إحصائيات المنصة الإجمالية"
                    description="تقارير تحليلية شاملة لحركة المبيعات والتذاكر وحركة الركاب اليومية والشهرية."
                    icon={BarChart3}
                  />
                </AdminProtectedRoute>
              }
            />
            <Route
              path="/admin/logs"
              element={
                <AdminProtectedRoute>
                  <PlaceholderPage
                    title="سجلات النظام"
                    description="مراقبة نشاطات النظام وسجلات تشغيل المخدم (Server Logs) وقاعدة البيانات."
                    icon={Database}
                  />
                </AdminProtectedRoute>
              }
            />
            <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />


            {}
            <Route element={<MainLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/seats" element={<SeatsPage />} />
              <Route path="/travelers" element={<TravelersPage />} />
              <Route path="/payment" element={<PaymentPage />} />
              <Route path="/payment-success" element={<PaymentSuccessPage />} />
              <Route path="/my-bookings" element={<MyBookings />} />
              <Route path="/terms" element={<TermsPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/home" element={<Navigate to="/" replace />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </SearchProvider>
    </AuthProvider>
  </ThemeProvider>
  )
}

export default App