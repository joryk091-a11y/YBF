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
  Bell
} from 'lucide-react';

// استيراد الشعارات
import logo from '../assets/logo.png';
import yemeniaLogo from '../assets/Y.png';
import balqisLogo from '../assets/B.png';
import adenLogo from '../assets/F.png';

export default function Sidebar() {
  const { user, setUser, logout } = useAuth();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [logoError, setLogoError] = useState(false);
  const [logoOnlineError, setLogoOnlineError] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  // Fetch pending count for company notifications badge
  const companyId = localStorage.getItem('companyId') || user?.airline_id || '';
  useEffect(() => {
    if (user.role === 'company_admin' && companyId) {
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
      // Poll every 30 seconds to keep it fresh
      const interval = setInterval(getCount, 30000);
      return () => clearInterval(interval);
    }
  }, [user.role, companyId]);

  // روابط التقارير الفرعية (لتسهيل إضافة مسارات أخرى مستقبلاً)
  const reportLinks = [
    {
      label: 'تحليلات الشركة',
      path: '/company-analytics',
    },
    {
      label: 'الأداء المالي',
      path: '/financial-report',
    },
    {
      label: 'تحليل الوجهات',
      path: '/destination-report',
    },
    {
      label: 'الخدمات الطبية والأرضية',
      path: '/medical-services',
    },
    {
      label: 'الحالة والركاب',
      path: '/passenger-status',
    },
  ];

  // حالة فتح وإغلاق قائمة التقارير المنسدلة
  const [isReportsOpen, setIsReportsOpen] = useState(
    location.pathname === '/company-analytics' || 
    location.pathname === '/company/analytics' || 
    location.pathname === '/financial-report' ||
    location.pathname === '/destination-report' ||
    location.pathname === '/medical-services' ||
    location.pathname === '/passenger-status'
  );

  // الحصول على شعار الشركة النشط بناءً على اسم أو معرف الشركة
  const getCompanyLogo = () => {
    if (user.role === 'super_admin') {
      return logo;
    }
    
    // 1. استخدام رابط الشعار الممرر في كائن المستخدم
    let logoPath = user.logo_url;
    
    if (!logoPath) {
      const id = user.airline_id;
      const code = localStorage.getItem('airlineCode') || (id === 1 ? 'IY' : id === 2 ? 'BS' : 'FA');
      if (id === 1 || code === 'IY') logoPath = '/logos/yemenia.png';
      else if (id === 2 || code === 'BS') logoPath = '/logos/bilqis.png';
      else if (id === 3 || code === 'FA') logoPath = '/logos/flyaden.png';
      else logoPath = logo;
    }

    // 2. إذا فشل المسار المحلي، يتم محاولة جلب الصورة من روابط إنترنت مباشرة وموثوقة
    if (logoError && !logoOnlineError) {
      const id = user.airline_id;
      const code = localStorage.getItem('airlineCode') || (id === 1 ? 'IY' : id === 2 ? 'BS' : 'FA');
      if (id === 1 || code === 'IY') return 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/40/Yemenia_Airways_logo.svg/512px-Yemenia_Airways_logo.svg.png';
      if (id === 2 || code === 'BS') return 'https://upload.wikimedia.org/wikipedia/commons/c/c7/Queen_Bilqis_Airways_logo.png';
      if (id === 3 || code === 'FA') return 'https://airhex.com/images/airline-logos/flyaden.png';
    }

    return logoPath;
  };

  const handleLogout = () => {
    logout();
    navigate('/company/login');
  };

  // تعريف الروابط بناءً على دور المستخدم
  const adminLinks = [
    {
      label: 'لوحة التحكم للمنصة',
      path: '/admin/dashboard',
      icon: LayoutDashboard,
    },
    {
      label: 'إدارة المستخدمين',
      path: '/admin/users',
      icon: Users,
    },
    {
      label: 'إدارة شركات الطيران',
      path: '/admin/airlines',
      icon: Plane,
    },
    {
      label: 'إحصائيات المنصة الإجمالية',
      path: '/admin/stats',
      icon: BarChart3,
    },
    {
      label: 'سجلات النظام',
      path: '/admin/logs',
      icon: Database,
    },
  ];

  const companyLinks = [
    {
      label: 'الرئيسية للشركة',
      path: '/company/dashboard',
      icon: Home,
    },
    {
      label: 'إدارة الرحلات',
      path: '/company/flights',
      icon: Plane,
    },
    {
      label: 'قائمة ركاب الرحلات',
      path: '/company/passengers',
      icon: ClipboardList,
    },
    {
      label: 'الخدمات الطبية والأرضية',
      path: '/company/services',
      icon: HeartPulse,
    },
    {
      label: 'طلبات الحجز المعلقة',
      path: '/company/notifications',
      icon: Bell,
    },
  ];

  const currentLinks = user.role === 'super_admin' ? adminLinks : companyLinks;

  return (
    <aside
      className="fixed top-0 right-0 z-40 h-screen w-72 flex flex-col border-l border-slate-200/60 dark:border-slate-800/60 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl transition-all duration-300"
      dir="rtl"
    >
      {/* 1. الجزء العلوي: الهوية والشعار */}
      <div className="relative flex flex-col items-center gap-3 border-b border-slate-100 dark:border-slate-900 p-6">
        {/* زر تبديل الوضع الداكن/الفاتح في الأعلى */}
        <button
          onClick={toggleDarkMode}
          className="absolute left-4 top-4 h-8 w-8 flex items-center justify-center rounded-lg bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/50 dark:border-slate-850 text-slate-500 dark:text-slate-400 transition-all shadow-sm"
          title={isDarkMode ? 'الوضع الفاتح' : 'الوضع الداكن'}
        >
          {isDarkMode ? <Sun size={15} className="text-amber-500" /> : <Moon size={15} className="text-indigo-600" />}
        </button>
        <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-slate-50 dark:bg-slate-900 p-2 shadow-sm">
          {logoOnlineError ? (
            <Plane size={36} className="text-blue-600 dark:text-blue-400" />
          ) : (
            <img
              src={getCompanyLogo()}
              alt="Logo"
              className="h-full w-full object-contain"
              onError={() => {
                if (!logoError) {
                  setLogoError(true);
                } else {
                  setLogoOnlineError(true);
                }
              }}
            />
          )}
        </div>
        <div className="text-center">
          <h2 className="text-base font-black tracking-tight text-slate-800 dark:text-slate-100">
            Yemen Booking Flight
          </h2>
          <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 px-2 py-0.5 rounded-full uppercase tracking-wider mt-1 inline-block">
            {user.role === 'super_admin' ? 'إدارة النظام المركزي' : `حساب: ${user.airline_name}`}
          </span>
        </div>
      </div>

      {/* 2. الجزء الأوسط: روابط الأقسام */}
      <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-1.5 scrollbar-thin">
        {currentLinks.map((link) => {
          const Icon = link.icon;
          const isActive = location.pathname === link.path;

          return (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) =>
                `group flex items-center justify-between rounded-xl px-4 py-3.5 text-xs font-black transition-all duration-300 relative overflow-hidden ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-500/10 to-indigo-500/10 text-blue-600 dark:text-blue-400 border-r-[4px] border-blue-600'
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900/50 hover:text-slate-800 dark:hover:text-slate-200'
                }`
              }
            >
              <div className="flex items-center gap-3.5">
                <Icon
                  size={18}
                  className={`transition-transform duration-500 group-hover:scale-110 ${
                    isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300'
                  }`}
                />
                <span>{link.label}</span>
              </div>
              {link.path === '/company/notifications' && pendingCount > 0 && (
                <span className="bg-red-500 text-white text-[10px] font-black h-5 px-1.5 rounded-full flex items-center justify-center min-w-5 shadow-sm animate-pulse">
                  {pendingCount}
                </span>
              )}
            </NavLink>
          );
        })}

        {/* قائمة التقارير المنسدلة لمدراء الشركات */}
        {user.role !== 'super_admin' && (
          <div className="space-y-1">
            <button
              onClick={() => setIsReportsOpen(!isReportsOpen)}
              className={`group flex w-full items-center justify-between rounded-xl px-4 py-3.5 text-xs font-black transition-all duration-300 relative overflow-hidden outline-none ${
                isReportsOpen || reportLinks.some(link => location.pathname === link.path || (link.path === '/company-analytics' && location.pathname === '/company/analytics'))
                  ? 'bg-slate-50 dark:bg-slate-900/50 text-slate-800 dark:text-slate-200'
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900/50 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <div className="flex items-center gap-3.5">
                <PieChart
                  size={18}
                  className={`transition-transform duration-500 group-hover:scale-110 ${
                    isReportsOpen || reportLinks.some(link => location.pathname === link.path || (link.path === '/company-analytics' && location.pathname === '/company/analytics'))
                      ? 'text-slate-600 dark:text-slate-300'
                      : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300'
                  }`}
                />
                <span>التقارير</span>
              </div>
              <div className="transition-transform duration-300">
                {isReportsOpen ? (
                  <ChevronUp size={16} className={isReportsOpen || reportLinks.some(link => location.pathname === link.path || (link.path === '/company-analytics' && location.pathname === '/company/analytics')) ? 'text-slate-600 dark:text-slate-300' : 'text-slate-400'} />
                ) : (
                  <ChevronDown size={16} className={isReportsOpen || reportLinks.some(link => location.pathname === link.path || (link.path === '/company-analytics' && location.pathname === '/company/analytics')) ? 'text-slate-600 dark:text-slate-300' : 'text-slate-400'} />
                )}
              </div>
            </button>

            {/* الحاوية الفرعية للروابط */}
            <div
              className={`transition-all duration-300 ease-in-out overflow-hidden space-y-1 ${
                isReportsOpen ? 'max-h-48 opacity-100 mt-1.5' : 'max-h-0 opacity-0 pointer-events-none'
              }`}
            >
              {reportLinks.map((subLink) => {
                const isSubActive = location.pathname === subLink.path || (subLink.path === '/company-analytics' && location.pathname === '/company/analytics');
                return (
                  <Link
                    key={subLink.path}
                    to={subLink.path}
                    className={`group flex items-center gap-3.5 rounded-xl py-3 pr-10 pl-4 text-xs font-black transition-all duration-300 relative overflow-hidden ${
                      isSubActive
                        ? 'bg-gradient-to-r from-blue-500/10 to-indigo-500/10 text-blue-600 dark:text-blue-400 border-r-[4px] border-blue-600'
                        : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900/50 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    <div className={`h-1.5 w-1.5 rounded-full transition-all duration-300 ${isSubActive ? 'bg-blue-600 dark:bg-blue-400 scale-125 shadow-[0_0_8px_rgba(37,99,235,0.6)]' : 'bg-slate-300 dark:bg-slate-700'}`} />
                    <span>{subLink.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </nav>

      {/* 3. الجزء السفلي: بطاقة المستخدم النشط وزر تسجيل الخروج */}
      <div className="border-t border-slate-100 dark:border-slate-900 p-4 space-y-3">

        {/* بطاقة المستخدم */}
        <div className="flex items-center rounded-2xl bg-slate-50/80 dark:bg-slate-900/40 p-3.5 border border-slate-100 dark:border-slate-900">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/10 to-indigo-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
              {user.role === 'super_admin' ? <Shield size={16} /> : <Activity size={16} />}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-black text-slate-800 dark:text-slate-200 truncate">
                {user.role === 'super_admin' ? 'مدير النظام' : 'مدير الشركة'}
              </p>
              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 truncate mt-0.5">
                {user.role === 'super_admin' ? 'Super Admin' : user.airline_name}
              </p>
            </div>
          </div>
        </div>

        {/* زر تسجيل الخروج */}
        <button
          onClick={handleLogout}
          className="group flex w-full h-11 items-center justify-center gap-2 rounded-xl bg-red-50 dark:bg-red-500/5 px-4 text-xs font-black text-red-600 transition-all hover:bg-red-600 hover:text-white shadow-sm"
        >
          <LogOut size={16} className="transition-transform group-hover:-translate-x-1" />
          <span>تسجيل الخروج</span>
        </button>
      </div>
    </aside>
  );
}
