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
      if (newWidth >= 200 && newWidth <= 450) {
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

  // Fetch pending count for company notifications badge
  const companyId = localStorage.getItem('companyId') || user?.airline_id || '';
  useEffect(() => {
    if ((user.role === 'company_admin' || user.role === 'company') && companyId) {
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
      className={`fixed top-0 right-0 z-40 h-screen flex flex-col border-l border-slate-200/60 dark:border-slate-800/60 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl ${isResizing ? 'select-none' : 'transition-all duration-300'}`}
      style={{ width: `${sidebarWidth}px` }}
      dir="rtl"
    >
      {/* مقبض تغيير الحجم (Resizer Handle) */}
      <div
        onMouseDown={startResizing}
        className="absolute top-0 left-0 w-1.5 h-full cursor-col-resize hover:bg-blue-500/20 active:bg-blue-600/40 transition-colors z-50 group"
      >
        <div className="w-[1px] h-full bg-slate-200/60 dark:bg-slate-800/60 group-hover:bg-blue-500/40 group-active:bg-blue-600/60 mx-auto" />
      </div>

      {/* 1. الجزء العلوي: الهوية والشعار */}
      <div className="relative flex flex-col items-center gap-3 border-b border-slate-100 dark:border-slate-900 p-6">
        {/* زر تبديل الوضع الداكن/الفاتح في الأعلى */}
        {user.role !== 'company_admin' && user.role !== 'company' && (
          <button
            onClick={toggleDarkMode}
            className="absolute left-4 top-4 h-8 w-8 flex items-center justify-center rounded-lg bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/50 dark:border-slate-850 text-slate-500 dark:text-slate-400 transition-all shadow-sm"
            title={isDarkMode ? 'الوضع الفاتح' : 'الوضع الداكن'}
          >
            {isDarkMode ? <Sun size={15} className="text-amber-500" /> : <Moon size={15} className="text-indigo-600" />}
          </button>
        )}
        <div className="relative flex h-16 w-16 items-center justify-center">
          <img
            src={logo}
            alt="YBF Logo"
            className="h-full w-full object-contain brightness-0 dark:invert drop-shadow-[0_0_8px_rgba(59,130,246,0.35)] dark:drop-shadow-[0_0_12px_rgba(59,130,246,0.5)]"
          />
        </div>
        <div className="text-center -mt-2">
          <h2 className="text-base font-black tracking-tight text-slate-800 dark:text-slate-100">
            Yemen Booking Flight
          </h2>
          {user.role === 'super_admin' && (
            <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 px-2 py-0.5 rounded-full uppercase tracking-wider mt-1 inline-block">
              إدارة النظام المركزي
            </span>
          )}
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
                `group flex items-center justify-between rounded-xl px-4 py-3 text-xs font-bold transition-all duration-300 relative overflow-hidden ${isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-650/20'
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900/40 hover:text-slate-800 dark:hover:text-slate-200'
                }`
              }
            >
              <div className="flex items-center gap-3.5">
                <Icon
                  size={16}
                  className={`transition-transform duration-500 group-hover:scale-105 ${isActive ? 'text-white' : 'text-slate-450 dark:text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300'
                    }`}
                />
                <span>{link.label}</span>
              </div>
              {link.path === '/company/notifications' && pendingCount > 0 && (
                <span className={`text-[10px] font-black h-5 px-1.5 rounded-full flex items-center justify-center min-w-5 shadow-sm animate-pulse ${isActive ? 'bg-white text-blue-650' : 'bg-red-500 text-white'}`}>
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
              className={`group flex w-full items-center justify-between rounded-xl px-4 py-3 text-xs font-bold transition-all duration-300 relative overflow-hidden outline-none ${isReportsOpen || reportLinks.some(link => location.pathname === link.path || (link.path === '/company-analytics' && location.pathname === '/company/analytics'))
                ? 'bg-slate-50 dark:bg-slate-900/30 text-slate-850 dark:text-slate-150'
                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900/40 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
            >
              <div className="flex items-center gap-3.5">
                <PieChart
                  size={16}
                  className={`transition-transform duration-500 group-hover:scale-105 ${isReportsOpen || reportLinks.some(link => location.pathname === link.path || (link.path === '/company-analytics' && location.pathname === '/company/analytics'))
                    ? 'text-slate-600 dark:text-slate-300'
                    : 'text-slate-455 dark:text-slate-500 group-hover:text-slate-650 dark:group-hover:text-slate-300'
                    }`}
                />
                <span>التقارير</span>
              </div>
              <div className="transition-transform duration-300">
                {isReportsOpen ? (
                  <ChevronUp size={14} className={isReportsOpen || reportLinks.some(link => location.pathname === link.path || (link.path === '/company-analytics' && location.pathname === '/company/analytics')) ? 'text-slate-600 dark:text-slate-300' : 'text-slate-400'} />
                ) : (
                  <ChevronDown size={14} className={isReportsOpen || reportLinks.some(link => location.pathname === link.path || (link.path === '/company-analytics' && location.pathname === '/company/analytics')) ? 'text-slate-600 dark:text-slate-300' : 'text-slate-400'} />
                )}
              </div>
            </button>

            <div
              className={`transition-all duration-300 ease-in-out overflow-hidden space-y-1 ${isReportsOpen ? 'max-h-96 opacity-100 mt-1.5' : 'max-h-0 opacity-0 pointer-events-none'
                }`}
            >
              {reportLinks.map((subLink) => {
                const isSubActive = location.pathname === subLink.path || (subLink.path === '/company-analytics' && location.pathname === '/company/analytics');
                return (
                  <Link
                    key={subLink.path}
                    to={subLink.path}
                    className={`group flex items-center gap-3 rounded-xl py-2.5 pr-8 pl-4 text-xs font-bold transition-all duration-300 relative overflow-hidden ${isSubActive
                      ? 'bg-blue-600/10 text-blue-600 dark:text-blue-400'
                      : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900/40 hover:text-slate-850 dark:hover:text-slate-200'
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
      <div className="border-t border-slate-100/70 dark:border-slate-900/50 p-4 space-y-3">

        {/* بطاقة المستخدم لمدير النظام */}
        {user.role === 'super_admin' && (
          <div className="flex items-center rounded-2xl bg-gradient-to-r from-slate-50/50 to-slate-50/20 dark:from-slate-900/30 dark:to-slate-900/10 p-3 border border-slate-150/50 dark:border-slate-800/40">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 border border-blue-100/20 dark:border-blue-900/30">
                <Shield size={16} />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                  مدير النظام
                </p>
                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-550 truncate mt-0.5">
                  Super Admin
                </p>
              </div>
            </div>
          </div>
        )}

        {/* بطاقة المستخدم لمدير شركة الطيران */}
        {(user.role === 'company_admin' || user.role === 'company') && (
          <div className="flex items-center rounded-2xl bg-gradient-to-r from-slate-50/50 to-slate-50/20 dark:from-slate-900/30 dark:to-slate-900/10 p-3 border border-slate-150/50 dark:border-slate-800/40 shadow-sm">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 border border-blue-100/20 dark:border-blue-900/30">
                <User size={16} />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                  {user.airline_name || localStorage.getItem('companyName') || 'الشركة'}
                </p>
                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-550 truncate mt-0.5">
                  ممثل الشركة
                </p>
              </div>
            </div>
          </div>
        )}

        {/* زر تسجيل الخروج */}
        <button
          onClick={handleLogout}
          className="group flex w-full h-10 items-center justify-center gap-2 rounded-xl bg-slate-50 dark:bg-slate-900/30 text-slate-500 dark:text-slate-400 border border-slate-150/50 dark:border-slate-800/40 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-650 dark:hover:text-red-400 hover:border-red-200/50 dark:hover:border-red-500/20 px-4 text-xs font-bold transition-all duration-300 cursor-pointer"
        >
          <LogOut size={14} className="transition-transform group-hover:-translate-x-0.5" />
          <span>تسجيل الخروج</span>
        </button>
      </div>
    </aside>
  );
}
