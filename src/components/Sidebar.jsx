import React from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
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
  Sun,
  Moon,
  Shield,
  Activity
} from 'lucide-react';

// استيراد الشعارات
import logo from '../assets/logo.png';
import yemeniaLogo from '../assets/Y.png';
import balqisLogo from '../assets/B.png';
import adenLogo from '../assets/F.png';

export default function Sidebar() {
  const { user, setUser } = useAuth();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  // الحصول على شعار الشركة النشط بناءً على اسم أو معرف الشركة
  const getCompanyLogo = () => {
    if (user.role === 'super_admin') {
      return logo;
    }
    // في حالة company_admin
    switch (user.airline_id) {
      case 1:
        return yemeniaLogo;
      case 2:
        return balqisLogo;
      case 3:
        return adenLogo;
      default:
        return logo;
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    // إعادة تعيين الحالة الوهمية للدور الافتراضي للتجربة
    setUser({
      role: 'super_admin',
      airline_name: 'Yemenia',
      airline_id: 1
    });
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
      label: 'الإحصائيات والتحليلات',
      path: '/company/analytics',
      icon: BarChart3,
    },
  ];

  const currentLinks = user.role === 'super_admin' ? adminLinks : companyLinks;

  return (
    <aside
      className="fixed top-0 right-0 z-40 h-screen w-72 flex flex-col border-l border-slate-200/60 dark:border-slate-800/60 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl transition-all duration-300"
      dir="rtl"
    >
      {/* 1. الجزء العلوي: الهوية والشعار */}
      <div className="flex flex-col items-center gap-3 border-b border-slate-100 dark:border-slate-900 p-6">
        <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-slate-50 dark:bg-slate-900 p-2 shadow-sm">
          <img
            src={getCompanyLogo()}
            alt="Logo"
            className="h-full w-full object-contain"
          />
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
                `group flex items-center gap-3.5 rounded-xl px-4 py-3.5 text-xs font-black transition-all duration-300 relative overflow-hidden ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-500/10 to-indigo-500/10 text-blue-600 dark:text-blue-400 border-r-[4px] border-blue-600'
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900/50 hover:text-slate-800 dark:hover:text-slate-200'
                }`
              }
            >
              <Icon
                size={18}
                className={`transition-transform duration-500 group-hover:scale-110 ${
                  isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300'
                }`}
              />
              <span>{link.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* 3. الجزء السفلي: بطاقة المستخدم النشط وزر تسجيل الخروج */}
      <div className="border-t border-slate-100 dark:border-slate-900 p-4 space-y-4">
        {/* بطاقة المستخدم */}
        <div className="flex items-center justify-between rounded-2xl bg-slate-50/80 dark:bg-slate-900/40 p-3.5 border border-slate-100 dark:border-slate-900">
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
          {/* زر المظهر لتعزيز الـ UX */}
          <button
            onClick={toggleDarkMode}
            className="h-8 w-8 flex items-center justify-center rounded-lg bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 text-slate-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors shadow-sm"
            title="تبديل المظهر ليدوي"
          >
            {isDarkMode ? <Sun size={14} /> : <Moon size={14} />}
          </button>
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
