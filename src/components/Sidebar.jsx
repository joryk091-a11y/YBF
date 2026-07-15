import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';
import { useTheme } from '../utils/ThemeContext';
import {
  LayoutDashboard,
  Plane,
  BarChart3,
  Database,
  Users,
  Home,
  ClipboardList,
  HeartPulse,
  LogOut,
  Shield,
  Activity,
  PieChart,
  ChevronDown,
  ChevronUp,
  Sun,
  Moon,
  Bell,
  User
} from 'lucide-react';

import logo from '../assets/logo.png';
import yemeniaLogo from '../assets/Y.png';
import balqisLogo from '../assets/B.png';
import adenLogo from '../assets/F.png';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [logoError, setLogoError] = useState(false);
  const [logoOnlineError, setLogoOnlineError] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  // Resize state
  const [sidebarWidth, setSidebarWidth] = useState(() => {
    const saved = localStorage.getItem('sidebarWidth');
    return saved ? parseInt(saved, 10) : 288;
  });
  const [isResizing, setIsResizing] = useState(false);

  const startResizing = (e) => {
    e.preventDefault();
    setIsResizing(true);
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isResizing) return;
      const newWidth = window.innerWidth - e.clientX;
      if (newWidth >= 220 && newWidth <= 400) {
        setSidebarWidth(newWidth);
        localStorage.setItem('sidebarWidth', newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  useEffect(() => {
    document.documentElement.style.setProperty('--sidebar-width', `${sidebarWidth}px`);
  }, [sidebarWidth]);

  // Real-time pending count sync
  const companyId = localStorage.getItem('companyId') || user?.airline_id || '';
  useEffect(() => {
    if ((user?.role === 'company_admin' || user?.role === 'company') && companyId) {
      const getCount = () => {
        fetch(`http://localhost:8080/api/bookings/pending?airline_id=${companyId}`)
          .then(res => res.json())
          .then(data => {
            if (data.success) {
              setPendingCount(data.bookings ? data.bookings.length : 0);
            }
          })
          .catch(err => console.error('Error fetching pending count:', err));
      };

      getCount();
      const interval = setInterval(getCount, 20000);
      return () => clearInterval(interval);
    }
  }, [user?.role, companyId]);

  const reportLinks = [
    { label: 'تقرير تحليلات الشركة', path: '/company-analytics' },
    { label: 'تقرير الأداء المالي', path: '/financial-report' },
    { label: 'تقرير تحليل الوجهات', path: '/destination-report' },
    { label: 'تقرير الخدمات الطبية والأرضية', path: '/medical-services' },
    { label: 'تقرير حالة الركاب', path: '/passenger-status' },
  ];

  const [isReportsOpen, setIsReportsOpen] = useState(
    reportLinks.some(link => location.pathname === link.path || (link.path === '/company-analytics' && location.pathname === '/company/analytics'))
  );

  const getCompanyLogo = () => {
    if (!user) return logo;
    if (user.role === 'super_admin') return logo;

    let logoPath = user.logo_url;
    if (!logoPath) {
      const id = user.airline_id;
      const code = localStorage.getItem('airlineCode') || (id === 1 ? 'IY' : id === 2 ? 'BS' : 'FA');
      if (id === 1 || code === 'IY') logoPath = '/logos/yemenia.png';
      else if (id === 2 || code === 'BS') logoPath = '/logos/bilqis.png';
      else if (id === 3 || code === 'FA') logoPath = '/logos/flyaden.png';
      else logoPath = logo;
    }

    if (logoError && !logoOnlineError) {
      const id = user.airline_id;
      const code = localStorage.getItem('airlineCode') || (id === 1 ? 'IY' : id === 2 ? 'BS' : 'FA');
      if (id === 1 || code === 'IY') return yemeniaLogo;
      if (id === 2 || code === 'BS') return balqisLogo;
      if (id === 3 || code === 'FA') return adenLogo;
      return logo;
    }

    return logoPath;
  };

  const handleLogout = () => {
    logout();
    navigate('/company/login');
  };

  const adminLinks = [
    { label: 'لوحة التحكم للمنصة', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'إدارة المستخدمين', path: '/admin/users', icon: Users },
    { label: 'إدارة شركات الطيران', path: '/admin/airlines', icon: Plane },
    { label: 'إحصائيات المنصة الإجمالية', path: '/admin/stats', icon: BarChart3 },
    { label: 'سجلات النظام', path: '/admin/logs', icon: Database },
  ];

  const companyLinks = [
    { label: 'الرئيسية للشركة', path: '/company/dashboard', icon: Home },
    { label: 'إدارة الرحلات', path: '/company/flights', icon: Plane },
    { label: 'قائمة ركاب الرحلات', path: '/company/passengers', icon: ClipboardList },
    { label: 'الخدمات الطبية والأرضية', path: '/company/services', icon: HeartPulse },
    { label: 'طلبات الحجز المعلقة', path: '/company/notifications', icon: Bell },
  ];

  const currentLinks = user?.role === 'super_admin' ? adminLinks : companyLinks;

  return (
    <aside
      className={`fixed top-0 right-0 z-40 h-screen flex flex-col border-l border-slate-200/40 dark:border-slate-800/40 bg-white/70 dark:bg-slate-950/75 backdrop-blur-xl transition-all ${isResizing ? 'select-none' : 'duration-300'}`}
      style={{ width: `${sidebarWidth}px` }}
      dir="rtl"
    >
      {/* Resizer Handle */}
      <div
        onMouseDown={startResizing}
        className="absolute top-0 left-0 w-1.5 h-full cursor-col-resize hover:bg-blue-500/20 active:bg-blue-600/40 transition-colors z-50 group"
      >
        <div className="w-[1px] h-full bg-slate-200/40 dark:bg-slate-800/40 group-hover:bg-blue-500/40 group-active:bg-blue-600/60 mx-auto" />
      </div>

      {/* Header Profile / Logo */}
      <div className="relative flex flex-col items-center gap-3 border-b border-slate-100/50 dark:border-slate-900/50 p-6 shrink-0">
        <div className="relative flex h-16 w-16 items-center justify-center p-2.5 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-900 dark:to-slate-950/50 border border-slate-150/70 dark:border-slate-800/80 shadow-inner">
          <img
            src={getCompanyLogo()}
            alt="YBF Logo"
            className="h-full w-full object-contain filter drop-shadow-[0_2px_8px_rgba(59,130,246,0.15)]"
            onError={() => {
              if (!logoError) {
                setLogoError(true);
              } else if (!logoOnlineError) {
                setLogoOnlineError(true);
              }
            }}
          />
        </div>
        <div className="text-center">
          <h2 className="text-sm font-black text-slate-800 dark:text-slate-100 tracking-tight">
            Yemen Booking Flight
          </h2>
          <span className="text-[9px] font-black text-blue-600 dark:text-blue-400 bg-blue-500/5 dark:bg-blue-500/10 px-2.5 py-0.5 rounded-full uppercase tracking-wider mt-1.5 inline-block border border-blue-500/10">
            {user?.role === 'super_admin' ? 'إدارة النظام المركزي' : user?.airline_name || 'ممثل الشركة'}
          </span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-1.5 scrollbar-thin">
        {currentLinks.map((link) => {
          const Icon = link.icon;
          const isActive = location.pathname === link.path;

          return (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) =>
                `group flex items-center justify-between rounded-xl px-4 py-3 text-[11px] font-extrabold transition-all duration-300 relative overflow-hidden ${isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900/30 hover:text-slate-800 dark:hover:text-slate-200'
                }`
              }
            >
              <div className="flex items-center gap-3">
                <Icon
                  size={16}
                  className={`transition-all duration-300 group-hover:scale-110 ${isActive ? 'text-white' : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300'}`}
                />
                <span>{link.label}</span>
              </div>
              {link.path === '/company/notifications' && pendingCount > 0 && (
                <span className={`text-[9px] font-black h-5 px-1.5 rounded-full flex items-center justify-center min-w-5 shadow-sm animate-pulse ${isActive ? 'bg-white text-blue-600' : 'bg-red-500 text-white'}`}>
                  {pendingCount}
                </span>
              )}
            </NavLink>
          );
        })}

        {/* Dropdown Reports Menu */}
        {user?.role !== 'super_admin' && (
          <div className="space-y-1">
            <button
              onClick={() => setIsReportsOpen(!isReportsOpen)}
              className={`group flex w-full items-center justify-between rounded-xl px-4 py-3 text-[11px] font-extrabold transition-all duration-300 outline-none ${isReportsOpen
                ? 'bg-slate-50 dark:bg-slate-900/30 text-slate-850 dark:text-slate-150'
                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900/30 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
            >
              <div className="flex items-center gap-3">
                <PieChart
                  size={16}
                  className={`transition-all duration-300 group-hover:scale-110 ${isReportsOpen ? 'text-slate-650 dark:text-slate-300' : 'text-slate-450'}`}
                />
                <span>التقارير والإحصائيات</span>
              </div>
              <ChevronDown
                size={14}
                className={`transition-transform duration-300 ${isReportsOpen ? 'rotate-180 text-slate-650 dark:text-slate-300' : 'text-slate-450'}`}
              />
            </button>

            <div
              className={`transition-all duration-300 ease-in-out overflow-hidden space-y-1 ${isReportsOpen ? 'max-h-64 opacity-100 mt-1.5' : 'max-h-0 opacity-0 pointer-events-none'}`}
            >
              {reportLinks.map((subLink) => {
                const isSubActive = location.pathname === subLink.path || (subLink.path === '/company-analytics' && location.pathname === '/company/analytics');
                return (
                  <Link
                    key={subLink.path}
                    to={subLink.path}
                    className={`group flex items-center gap-3 rounded-xl py-2.5 pr-8 pl-4 text-[10px] font-extrabold transition-all duration-300 relative overflow-hidden ${isSubActive
                      ? 'bg-blue-600/10 text-blue-600 dark:text-blue-400'
                      : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900/30 hover:text-slate-800 dark:hover:text-slate-200'
                      }`}
                  >
                    <div className={`h-1.5 w-1.5 rounded-full transition-all duration-355 ${isSubActive ? 'bg-blue-600 dark:bg-blue-400 scale-125 shadow-[0_0_8px_rgba(37,99,235,0.6)]' : 'bg-slate-300 dark:bg-slate-700'}`} />
                    <span>{subLink.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </nav>

      {/* Footer Settings & Logout */}
      <div className="border-t border-slate-100/50 dark:border-slate-900/50 p-4 space-y-3 shrink-0">
        {/* User Card */}
        {user && (
          <div className="flex items-center justify-between rounded-2xl bg-gradient-to-r from-slate-50/50 to-slate-50/20 dark:from-slate-900/30 dark:to-slate-900/10 p-3 border border-slate-150/50 dark:border-slate-800/40 shadow-sm">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-500/5 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/10">
                {user.role === 'super_admin' ? <Shield size={16} /> : <User size={16} />}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-black text-slate-800 dark:text-slate-200 truncate">
                  {user.role === 'super_admin' ? 'مدير النظام' : user.airline_name || 'ممثل الشركة'}
                </p>
                <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 truncate mt-0.5">
                  {user.role === 'super_admin' ? 'Super Admin' : 'Airline Representative'}
                </p>
              </div>
            </div>

            {/* Theme Toggle Button */}
            <button
              onClick={toggleDarkMode}
              className="h-8 w-8 flex items-center justify-center rounded-xl bg-white dark:bg-slate-900 border border-slate-150/50 dark:border-slate-800 text-slate-400 hover:text-blue-500 hover:border-blue-500/20 dark:hover:text-blue-400 dark:hover:border-blue-400/20 transition-all shadow-sm"
              title="تبديل المظهر"
            >
              {isDarkMode ? <Sun size={14} /> : <Moon size={14} />}
            </button>
          </div>
        )}

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="group flex w-full h-11 items-center justify-center gap-2 rounded-xl bg-red-500/5 hover:bg-red-600 text-red-650 hover:text-white border border-red-500/15 hover:border-transparent px-4 text-xs font-black transition-all duration-300"
        >
          <LogOut size={14} className="transition-transform group-hover:-translate-x-1" />
          <span>تسجيل الخروج</span>
        </button>
      </div>
    </aside>
  );
}
