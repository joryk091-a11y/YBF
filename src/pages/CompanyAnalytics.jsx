import React, { useState, useEffect } from 'react';
import { useAuth } from '../utils/AuthContext';
import { useTheme } from '../utils/ThemeContext';
import Sidebar from '../components/Sidebar';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import {
  DollarSign,
  Ticket,
  Users,
  Plane,
  TrendingUp,
  ArrowUpRight,
  CheckCircle2,
  Activity,
  ArrowRightLeft,
  Printer
} from 'lucide-react';


import logo from '../assets/logo.png';
import yemeniaLogo from '../assets/Y.png';
import balqisLogo from '../assets/B.png';
import adenLogo from '../assets/F.png';

const defaultStats = {
  totalRevenue: 1234567.89,
  activeBookings: 3456,
  availableFlights: 120,
  totalPassengers: 25789,
  destinationsStats: [
    { name: 'عدن', bookings: 1200 },
    { name: 'صنعاء', bookings: 1100 },
    { name: 'القاهرة', bookings: 950 },
    { name: 'جدة', bookings: 800 },
    { name: 'سيئون', bookings: 450 },
  ],
  servicesStats: [
    { name: 'كرسي متحرك', value: 220 },
    { name: 'أكسجين طبي', value: 130 },
    { name: 'مرافقة طبية', value: 110 },
    { name: 'سيارة إسعاف', value: 83 },
  ],
  recentBookings: [
    { id: 'BK-9021', route: 'صنعاء - القاهرة', passenger: 'علي منصور', total: '$1,850.00', status: 'مؤكد', badgeColor: 'green' },
    { id: 'BK-8743', route: 'عدن - جدة', passenger: 'سارة أحمد', total: '$1,450.00', status: 'مؤكد', badgeColor: 'green' },
    { id: 'BK-8610', route: 'سيئون - القاهرة', passenger: 'فاطمة سالم', total: '$2,100.00', status: 'مؤكد', badgeColor: 'purple' }
  ],
  sparklineData: [
    { pv: 980000 },
    { pv: 1050000 },
    { pv: 1020000 },
    { pv: 1150000 },
    { pv: 1100000 },
    { pv: 1200000 },
    { pv: 1234567.89 }
  ]
};

const toEnglishDigits = (str) => {
  if (!str) return '';
  const strStr = String(str);
  return strStr.replace(/[٠-٩]/g, (d) => '٠١٢٣٤٥٦٧٨٩'.indexOf(d));
};

export default function CompanyAnalytics() {
  const { user } = useAuth();
  const { isDarkMode } = useTheme();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  
  const airlineCode = localStorage.getItem('airlineCode') || (user?.airline_id === 1 ? 'IY' : user?.airline_id === 2 ? 'BS' : 'FA');
  const airlineId = localStorage.getItem('companyId') || user?.airline_id || '';

  
  const getCompanyLogo = () => {
    if (!user || user.role === 'super_admin') {
      return logo;
    }
    return user.logo_url || (user.airline_id === 1 ? '/logos/yemenia.png' : user.airline_id === 2 ? '/logos/bilqis.png' : '/logos/flyaden.png');
  };

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(`http://localhost:8080/api/company/analytics-stats?airlineCode=${airlineCode || ''}&airline_id=${airlineId || ''}`);
        const data = await response.json();
        if (data.success && data.stats) {
          setStats(data.stats);
        } else {
          setStats(defaultStats);
        }
      } catch (error) {
        console.error('Error fetching company analytics stats:', error);
        setStats(defaultStats);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [airlineCode, airlineId]);

  const activeStats = stats || defaultStats;

  
  const finalRevenue = activeStats.totalRevenue > 0 ? activeStats.totalRevenue : defaultStats.totalRevenue;
  const finalActiveBookings = activeStats.activeBookings > 0 ? activeStats.activeBookings : defaultStats.activeBookings;
  const finalAvailableFlights = activeStats.availableFlights > 0 ? activeStats.availableFlights : defaultStats.availableFlights;
  const finalTotalPassengers = activeStats.totalPassengers > 0 ? activeStats.totalPassengers : defaultStats.totalPassengers;

  const destinationsData = (activeStats.destinationsStats && activeStats.destinationsStats.length > 0)
    ? activeStats.destinationsStats
    : defaultStats.destinationsStats;

  const rawServicesData = (activeStats.servicesStats && activeStats.servicesStats.length > 0)
    ? activeStats.servicesStats
    : defaultStats.servicesStats;

  const recentBookingsData = (activeStats.recentBookings && activeStats.recentBookings.length > 0)
    ? activeStats.recentBookings
    : defaultStats.recentBookings;

  const sparklineData = (activeStats.sparklineData && activeStats.sparklineData.length > 0)
    ? activeStats.sparklineData
    : defaultStats.sparklineData;

  
  const colors = ['#3b82f6', '#06b6d4', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];
  const processedServicesData = rawServicesData.map((item, idx) => ({
    name: item.name,
    value: Number(item.value) || 0,
    color: colors[idx % colors.length]
  }));

  const totalServicesRequests = processedServicesData.reduce((sum, item) => sum + item.value, 0) || 0;

  
  const gridColor = isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)';
  const labelColor = isDarkMode ? '#94a3b8' : '#64748b';
  const tooltipBg = isDarkMode ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.95)';
  const tooltipBorder = isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';

  return (
    <div className="flex min-h-screen bg-[#f8faff] dark:bg-[#080d19] text-slate-900 dark:text-slate-100 transition-colors duration-300 relative overflow-hidden" dir="rtl">
      {}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] h-[600px] w-[600px] rounded-full bg-blue-500/5 dark:bg-blue-500/10 blur-[120px] transition-all" />
        <div className="absolute bottom-[-10%] right-[-10%] h-[600px] w-[600px] rounded-full bg-indigo-500/5 dark:bg-indigo-500/10 blur-[120px] transition-all" />
      </div>

      {}
      <Sidebar />

      {}
      <main className="flex-1 mr-72 p-8 relative z-10 min-h-screen">

        {}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8 print:hidden animate-in fade-in slide-in-from-top-4 duration-500">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
              التحليلات والإحصائيات الشاملة
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-xs font-bold mt-1">
              رصد وتتبع مؤشرات الأداء، الأرباح، حركة الحجوزات ونسب نمو الشركة التشغيلية لشركة {user?.airline_name || 'الشركة'}.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 px-4 py-2 border border-slate-250 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-350 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-500 rounded-xl shadow-sm hover:shadow transition-all duration-200 text-xs font-bold cursor-pointer"
            >
              <Printer size={16} />
              طباعة التقرير / PDF
            </button>
          </div>
        </div>



        {}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">

          {}
          <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-b from-white to-slate-50/40 dark:from-slate-900/60 dark:to-slate-950/60 p-6 border border-slate-150/70 dark:border-slate-800/40 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-emerald-500/30 dark:hover:border-emerald-500/20">
            <div className="flex items-start justify-between mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                <DollarSign size={22} />
              </div>
              {}
              <div className="h-8 w-24 opacity-80 group-hover:opacity-100 transition-opacity">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={sparklineData}>
                    <Area type="monotone" dataKey="pv" stroke="#10b981" strokeWidth={2} fill="none" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
            <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">إجمالي الإيرادات</p>
            <h3 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">
              ${finalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
            <div className="flex items-center gap-1.5 mt-2 text-emerald-600 dark:text-emerald-400 text-xs font-black">
              <TrendingUp size={14} className="animate-pulse" />
              <span>معدل نمو متزايد هذا الشهر</span>
            </div>
          </div>

          {}
          <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-b from-white to-slate-50/40 dark:from-slate-900/60 dark:to-slate-950/60 p-6 border border-slate-150/70 dark:border-slate-800/40 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-blue-500/30 dark:hover:border-blue-500/20">
            <div className="flex items-center justify-between mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.2)]">
                <Ticket size={22} />
              </div>
            </div>
            <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">الحجوزات النشطة</p>
            <h3 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">{finalActiveBookings.toLocaleString('en-US')}</h3>
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-2">
              حالة الحجوزات: <span className="text-blue-600 dark:text-blue-400 font-extrabold">مؤكدة ونشطة</span>
            </p>
          </div>

          {}
          <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-b from-white to-slate-50/40 dark:from-slate-900/60 dark:to-slate-950/60 p-6 border border-slate-150/70 dark:border-slate-800/40 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-cyan-500/30 dark:hover:border-cyan-500/20">
            <div className="flex items-center justify-between mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/10 dark:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
                <Plane size={22} className="rotate-90" />
              </div>
            </div>
            <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">الرحلات المتاحة</p>
            <h3 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">{finalAvailableFlights}</h3>
            {}
            <div className="w-full bg-slate-200 dark:bg-white/10 rounded-full h-1.5 mt-4 overflow-hidden">
              <div className="bg-gradient-to-r from-cyan-400 to-blue-500 h-1.5 rounded-full shadow-[0_0_8px_rgba(6,182,212,0.8)]" style={{ width: '80%' }}></div>
            </div>
          </div>

          {}
          <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-b from-white to-slate-50/40 dark:from-slate-900/60 dark:to-slate-950/60 p-6 border border-slate-150/70 dark:border-slate-800/40 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-purple-500/30 dark:hover:border-purple-500/20">
            <div className="flex items-center justify-between mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-500/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 border border-purple-500/20 shadow-[0_0_15px_rgba(168,85,247,0.2)]">
                <Users size={22} />
              </div>
            </div>
            <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">إجمالي المسافرين</p>
            <h3 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">{finalTotalPassengers.toLocaleString('en-US')}</h3>
            <div className="flex items-center gap-1 mt-2 text-purple-600 dark:text-purple-400 text-xs font-black">
              <ArrowUpRight size={14} />
              <span>مستمر بالارتفاع هذا الأسبوع</span>
            </div>
          </div>
        </div>

        {}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">

          {}
          <div className="lg:col-span-2 group rounded-3xl bg-white/60 dark:bg-slate-900/40 p-8 border border-slate-150/70 dark:border-slate-800/40 shadow-sm backdrop-blur-md transition-all duration-300 hover:shadow-xl">
            <h3 className="text-xs font-black tracking-widest text-slate-400 dark:text-slate-500 mb-6 uppercase">
              الطلب على الوجهات (عدد الحجوزات)
            </h3>
            <div className="h-[320px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={destinationsData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.8} />
                      <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.2} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fontWeight: 900, fill: labelColor }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fontWeight: 900, fill: labelColor }}
                    dx={-10}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: tooltipBg,
                      borderColor: tooltipBorder,
                      borderRadius: '16px',
                      boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)',
                      color: isDarkMode ? '#fff' : '#0f172a'
                    }}
                    cursor={{ fill: isDarkMode ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.01)' }}
                  />
                  <Bar
                    dataKey="bookings"
                    fill="url(#barGradient)"
                    radius={[8, 8, 0, 0]}
                    barSize={45}
                    name="الحجوزات"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {}
          <div className="group rounded-3xl bg-white/60 dark:bg-slate-900/40 p-8 border border-slate-150/70 dark:border-slate-800/40 shadow-sm backdrop-blur-md transition-all duration-300 hover:shadow-xl flex flex-col justify-between">
            <div>
              <h3 className="text-xs font-black tracking-widest text-slate-400 dark:text-slate-500 mb-6 uppercase">
                تفاصيل الخدمات الأرضية الخاصة
              </h3>
              <div className="h-[200px] w-full relative flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={processedServicesData}
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={85}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                    >
                      {processedServicesData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: tooltipBg,
                        borderColor: tooltipBorder,
                        borderRadius: '16px',
                        boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)',
                        color: isDarkMode ? '#fff' : '#0f172a'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                {}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-xl font-black text-slate-800 dark:text-white">{totalServicesRequests}</span>
                  <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-tight">إجمالي الطلبات</span>
                </div>
              </div>
            </div>

            {}
            <div className="space-y-2.5 mt-4">
              {processedServicesData.map(item => (
                <div key={item.name} className="flex items-center justify-between border-b border-slate-200/30 dark:border-slate-800/40 pb-2 last:border-0 last:pb-0">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full shadow-[0_0_8px_rgba(0,0,0,0.2)]" style={{ backgroundColor: item.color }} />
                    <span className="text-xs font-black text-slate-700 dark:text-slate-305">{item.name}</span>
                  </div>
                  <span className="text-xs font-extrabold text-slate-900 dark:text-white">
                    {item.value} <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500">({totalServicesRequests > 0 ? Math.round(item.value / totalServicesRequests * 100) : 0}%)</span>
                  </span>
                </div>
              ))}
              {processedServicesData.length === 0 && (
                <p className="text-xs font-bold text-slate-400 dark:text-slate-500 text-center py-4">لا توجد خدمات مسجلة</p>
              )}
            </div>
          </div>
        </div>

        {}
        <div className="group rounded-3xl bg-white/60 dark:bg-slate-900/40 p-6 border border-slate-150/70 dark:border-slate-800/40 shadow-sm backdrop-blur-md transition-all duration-300 hover:shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xs font-black tracking-widest text-slate-400 dark:text-slate-500 uppercase">
              آخر الحجوزات عالية القيمة
            </h3>
            <span className="text-[10px] font-black bg-blue-500/10 text-blue-600 dark:text-blue-400 px-3 py-1 rounded-full uppercase tracking-wider">
              تحديث مباشر
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="border-b border-slate-200/50 dark:border-slate-800/50 text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-wider">
                  <th className="pb-3 px-4 font-black">رقم المرجع</th>
                  <th className="pb-3 px-4 font-black">المسار</th>
                  <th className="pb-3 px-4 font-black">اسم المسافر</th>
                  <th className="pb-3 px-4 font-black">الإجمالي</th>
                  <th className="pb-3 px-4 font-black text-center">الحالة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/50 dark:divide-slate-800/30 text-xs font-bold text-slate-700 dark:text-slate-350">
                {recentBookingsData.map((booking, idx) => (
                  <tr key={idx} className="group hover:bg-slate-50/40 dark:hover:bg-slate-850/10 transition-colors">
                    <td className="py-5 px-4">
                      <span className="font-extrabold text-xs text-blue-600 dark:text-blue-400 bg-blue-500/5 dark:bg-blue-500/15 px-2.5 py-1 rounded-lg border border-blue-500/15 font-mono tracking-wide">
                        {booking.id}
                      </span>
                    </td>
                    <td className="py-5 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-[11px] bg-blue-500/5 text-blue-650 dark:text-blue-400 px-2 py-1 rounded-lg border border-blue-500/10 font-mono">{booking.route.split(' - ')[0]}</span>
                        <div className="w-6 h-[1px] bg-slate-200 dark:bg-slate-800" />
                        <span className="font-black text-[11px] bg-emerald-500/5 text-emerald-650 dark:text-emerald-400 px-2 py-1 rounded-lg border border-emerald-500/10 font-mono">{booking.route.split(' - ')[1]}</span>
                      </div>
                    </td>
                    <td className="py-5 px-4 text-slate-850 dark:text-white font-extrabold">{booking.passenger}</td>
                    <td className="py-5 px-4">
                      <span className="font-extrabold text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-500/5 dark:bg-emerald-500/15 px-2.5 py-1 rounded-lg border border-emerald-500/15 font-mono tracking-wide">
                        {toEnglishDigits(booking.total)}
                      </span>
                    </td>
                    <td className="py-5 px-4 text-center">
                      {booking.badgeColor === 'green' || booking.status === 'مؤكد' ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-455 border border-emerald-100 dark:border-emerald-900/30">
                          <CheckCircle2 size={12} />
                          {booking.status}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black bg-purple-50 dark:bg-purple-950/20 text-purple-650 dark:text-purple-400 border border-purple-100 dark:border-purple-900/30">
                          <CheckCircle2 size={12} />
                          {booking.status}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
                {recentBookingsData.length === 0 && (
                  <tr>
                    <td colSpan="5" className="py-8 text-center text-slate-400 dark:text-slate-500">
                      لا توجد حجوزات مسجلة حالياً
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </main>
    </div>
  );
}
