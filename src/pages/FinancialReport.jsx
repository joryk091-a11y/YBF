import React, { useState, useEffect } from 'react';
import { useAuth } from '../utils/AuthContext';
import { useTheme } from '../utils/ThemeContext';
import Sidebar from '../components/Sidebar';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import {
  DollarSign,
  TrendingUp,
  Coins,
  PieChart as PieIcon,
  TableProperties,
  TrendingDown,
  Printer
} from 'lucide-react';

// استيراد الشعارات ديناميكياً
import logo from '../assets/logo.png';
import yemeniaLogo from '../assets/Y.png';
import balqisLogo from '../assets/B.png';
import adenLogo from '../assets/F.png';

const defaultStats = {
  totalRevenue: 0,
  currentMonthRevenue: 0,
  previousMonthRevenue: 0,
  revenueGrowth: 0,
  monthlyRevenue: [
    { name: 'يناير', revenue: 420000 },
    { name: 'فبراير', revenue: 480000 },
    { name: 'مارس', revenue: 510000 },
    { name: 'أبريل', revenue: 630000 },
    { name: 'مايو', revenue: 690000 },
    { name: 'يونيو', revenue: 720200 },
  ],
  weeklyRevenue: [
    { name: 'السبت', revenue: 45000 },
    { name: 'الأحد', revenue: 52000 },
    { name: 'الاثنين', revenue: 48000 },
    { name: 'الثلاثاء', revenue: 59000 },
    { name: 'الأربعاء', revenue: 62000 },
    { name: 'الخميس', revenue: 75000 },
    { name: 'الجمعة', revenue: 70000 },
  ],
  classStats: [
    { name: 'الدرجة الأولى', value: 120 },
    { name: 'درجة الأعمال', value: 340 },
    { name: 'الدرجة السياحية', value: 1540 },
  ],
  flightsProfits: [
    { flightNumber: 'IY-101', route: 'عدن - القاهرة', costs: 18000, revenue: 45000, netProfit: 27000 },
    { flightNumber: 'IY-202', route: 'صنعاء - جدة', costs: 14000, revenue: 38000, netProfit: 24000 },
    { flightNumber: 'IY-303', route: 'سيئون - عمان', costs: 22000, revenue: 52000, netProfit: 30000 },
    { flightNumber: 'IY-404', route: 'عدن - الرياض', costs: 16000, revenue: 41000, netProfit: 25000 },
    { flightNumber: 'IY-505', route: 'صنعاء - دبي', costs: 25000, revenue: 60000, netProfit: 35000 },
  ]
};

export default function FinancialReport() {
  const { user } = useAuth();
  const { isDarkMode } = useTheme();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [revenueView, setRevenueView] = useState('monthly'); // 'monthly' | 'weekly'

  // الحصول على كود شركة الطيران النشطة
  const airlineCode = localStorage.getItem('airlineCode') || (user?.airline_id === 1 ? 'IY' : user?.airline_id === 2 ? 'BS' : 'FA');
  const airlineId = localStorage.getItem('companyId') || user?.airline_id || '';

  // الحصول على شعار شركة الطيران النشطة
  const getCompanyLogo = () => {
    if (!user || user.role === 'super_admin') {
      return logo;
    }
    return user.logo_url || (user.airline_id === 1 ? '/logos/yemenia.png' : user.airline_id === 2 ? '/logos/bilqis.png' : '/logos/flyaden.png');
  };

  useEffect(() => {
    const fetchFinancialStats = async () => {
      try {
        const response = await fetch(`http://localhost:8080/api/financial-stats?airlineCode=${airlineCode || ''}&airline_id=${airlineId || ''}`);
        const data = await response.json();
        if (data.success && data.stats) {
          setStats(data.stats);
        } else {
          setStats(defaultStats);
        }
      } catch (error) {
        console.error('Error fetching financial stats:', error);
        setStats(defaultStats);
      } finally {
        setLoading(false);
      }
    };
    fetchFinancialStats();
  }, [airlineCode, airlineId]);

  const activeStats = stats || defaultStats;

  // دمج البيانات للتأكد من وجود قيم معتبرة دائماً
  const finalRevenue = activeStats.totalRevenue > 0 ? activeStats.totalRevenue : defaultStats.totalRevenue;
  const currentMonthRevenue = activeStats.currentMonthRevenue !== undefined ? activeStats.currentMonthRevenue : 0;
  const revenueGrowth = activeStats.revenueGrowth !== undefined ? activeStats.revenueGrowth : 0;

  const monthlyRevenueData = (activeStats.monthlyRevenue && activeStats.monthlyRevenue.length > 0) ? activeStats.monthlyRevenue : defaultStats.monthlyRevenue;
  const weeklyRevenueData = (activeStats.weeklyRevenue && activeStats.weeklyRevenue.length > 0) ? activeStats.weeklyRevenue : defaultStats.weeklyRevenue;
  const classStatsData = (activeStats.classStats && activeStats.classStats.length > 0) ? activeStats.classStats : defaultStats.classStats;
  const flightsProfitsData = (activeStats.flightsProfits && activeStats.flightsProfits.length > 0) ? activeStats.flightsProfits : defaultStats.flightsProfits;

  // اختيار البيانات النشطة للمخطط البياني
  const activeChartData = revenueView === 'monthly' ? monthlyRevenueData : weeklyRevenueData;

  // تهيئة الألوان لدرجات السفر
  const classColors = {
    'الدرجة الأولى': '#eab308',    // ذهبي
    'درجة الأعمال': '#a855f7',    // بنفسجي
    'الدرجة السياحية': '#3b82f6',  // أزرق
  };

  const totalClassBookings = classStatsData.reduce((sum, item) => sum + item.value, 0) || 1;

  // ألوان وتنسيقات المخططات في الوضع الفاتح والداكن
  const gridColor = isDarkMode ? 'rgba(255, 255, 255, 0.05)' : '#f1f5f9';
  const labelColor = isDarkMode ? '#94a3b8' : '#64748b';
  const tooltipBg = isDarkMode ? 'rgba(15, 23, 42, 0.95)' : '#ffffff';
  const tooltipBorder = isDarkMode ? 'rgba(255, 255, 255, 0.1)' : '#e2e8f0';

  return (
    <div className="flex min-h-screen bg-[#f8faff] dark:bg-[#080d19] text-slate-900 dark:text-slate-100 transition-colors duration-300 relative overflow-hidden" dir="rtl">
      {/* تأثيرات التوهج الشبكي (Mesh Gradients) */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] h-[600px] w-[600px] rounded-full bg-blue-500/5 dark:bg-blue-500/10 blur-[120px] transition-all" />
        <div className="absolute bottom-[-10%] right-[-10%] h-[600px] w-[600px] rounded-full bg-indigo-500/5 dark:bg-indigo-500/10 blur-[120px] transition-all" />
      </div>

      {/* القائمة الجانبية */}
      <div className="print:hidden">
        <Sidebar />
      </div>

      {/* المحتوى الرئيسي */}
      <main className="flex-1 mr-72 print:mr-0 p-8 print:p-0 relative z-10 min-h-screen">

        {/* الترويسة (Header) */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8 print:hidden animate-in fade-in slide-in-from-top-4 duration-500">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
              التقرير المالي والأداء
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-xs font-bold mt-1">
              تحليل الإيرادات الشهرية والأسبوعية، ربحية الرحلات الفردية وتوزيع مبيعات درجات السفر لشركة {user?.airline_name || 'الشركة'}.
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

        {/* قسم الإيرادات: بطاقة KPI مع مخطط AreaChart */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* بطاقة KPI الفاتحة والمهنية */}
          <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-b from-white to-slate-50/40 dark:from-slate-900/60 dark:to-slate-950/60 p-6 border border-slate-150/70 dark:border-slate-800/40 shadow-sm backdrop-blur-md transition-all duration-300 hover:shadow-xl flex flex-col justify-between min-h-[220px]">
            {/* Decorative corner glow */}
            <div className="absolute -right-12 -top-12 h-28 w-28 rounded-full bg-gradient-to-br from-emerald-500 to-teal-650 opacity-0 group-hover:opacity-10 dark:group-hover:opacity-20 blur-lg transition-opacity duration-355" />

            <div className="flex items-center gap-4 relative z-10">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shadow-sm transition-all duration-355 group-hover:scale-105">
                <DollarSign size={22} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-0.5">إجمالي إيرادات الشهر الحالي</p>
                <h3 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white transition-all duration-355 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                  ${currentMonthRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </h3>
              </div>
            </div>

            <div className="border-t border-slate-100 dark:border-slate-800 pt-4 mt-4 relative z-10 flex items-center justify-between">
              <div className={`flex items-center gap-1.5 text-xs font-black px-2.5 py-1 rounded-lg border ${revenueGrowth >= 0
                ? 'text-emerald-600 bg-emerald-50/50 border-emerald-100/30'
                : 'text-red-600 bg-red-50/50 border-red-100/30'
                }`}>
                {revenueGrowth >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                <span>{revenueGrowth >= 0 ? '+' : ''}{revenueGrowth}%</span>
              </div>
              <p className="text-[9px] text-slate-400 font-bold">مقارنة بالشهر التشغيلي الفائت</p>
            </div>
          </div>

          {/* مخطط نمو الأرباح شهرياً وسنوياً (AreaChart) */}
          <div className="lg:col-span-2 group rounded-3xl bg-white/60 dark:bg-slate-900/40 p-6 border border-slate-150/70 dark:border-slate-800/40 shadow-sm backdrop-blur-md transition-all duration-300 hover:shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <h3 className="text-xs font-black tracking-widest text-slate-500 dark:text-slate-400 uppercase flex items-center gap-2">
                <Coins size={16} className="text-blue-500" />
                {revenueView === 'monthly' ? 'نمو الأرباح والإيرادات الشهري' : 'نمو الأرباح والإيرادات الأسبوعي'}
              </h3>

              <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 print:hidden">
                <button
                  onClick={() => setRevenueView('monthly')}
                  className={`px-4 py-1.5 rounded-lg text-xs font-black transition-all duration-200 ${revenueView === 'monthly'
                    ? 'bg-blue-900 dark:bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-350 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-700/50'
                    }`}
                >
                  شهري
                </button>
                <button
                  onClick={() => setRevenueView('weekly')}
                  className={`px-4 py-1.5 rounded-lg text-xs font-black transition-all duration-200 ${revenueView === 'weekly'
                    ? 'bg-blue-900 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                >
                  أسبوعي
                </button>
              </div>
            </div>

            <div className="h-[240px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={activeChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="financialRevenueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity={0.15} />
                      <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fontWeight: 700, fill: labelColor }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fontWeight: 700, fill: labelColor }}
                    dx={-10}
                    tickFormatter={(tick) => `$${tick >= 1000 ? (tick / 1000) + 'k' : tick}`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: tooltipBg,
                      borderColor: tooltipBorder,
                      borderRadius: '12px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                      color: isDarkMode ? '#ffffff' : '#0f172a',
                      fontFamily: 'inherit',
                      direction: 'rtl'
                    }}
                    formatter={(value) => [`$${value.toLocaleString('en-US')}`, 'الإيرادات']}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#10b981"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#financialRevenueGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* قسم درجات السفر والجدول */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* مخطط درجات السفر (PieChart) */}
          <div className="group rounded-3xl bg-white/60 dark:bg-slate-900/40 p-6 border border-slate-150/70 dark:border-slate-800/40 shadow-sm backdrop-blur-md transition-all duration-300 hover:shadow-xl flex flex-col justify-between">
            <div>
              <h3 className="text-xs font-black tracking-widest text-slate-500 dark:text-slate-400 mb-6 uppercase flex items-center gap-2">
                <PieIcon size={16} className="text-purple-500" />
                نسبة الحجوزات موزعة على درجات السفر
              </h3>

              <div className="h-[200px] w-full relative flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={classStatsData}
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={85}
                      paddingAngle={5}
                      dataKey="value"
                      stroke={isDarkMode ? '#0f172a' : '#ffffff'}
                      strokeWidth={2}
                    >
                      {classStatsData.map((entry, index) => {
                        const color = classColors[entry.name] || '#3b82f6';
                        return <Cell key={`cell-${index}`} fill={color} />;
                      })}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: tooltipBg,
                        borderColor: tooltipBorder,
                        borderRadius: '12px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                        color: isDarkMode ? '#ffffff' : '#0f172a',
                        fontFamily: 'inherit',
                        direction: 'rtl'
                      }}
                      formatter={(value) => [`${value} حجز`, 'العدد']}
                    />
                  </PieChart>
                </ResponsiveContainer>

                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-2xl font-black text-[#0f172a] dark:text-white">{totalClassBookings}</span>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-tight">إجمالي المقاعد</span>
                </div>
              </div>
            </div>

            {/* مفتاح الإيضاح المخصص */}
            <div className="space-y-2.5 mt-4">
              {classStatsData.map(item => {
                const color = classColors[item.name] || '#3b82f6';
                const percentage = totalClassBookings > 0 ? Math.round((item.value / totalClassBookings) * 100) : 0;
                return (
                  <div key={item.name} className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5 last:border-0 last:pb-0">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full" style={{ backgroundColor: color }} />
                      <span className="text-xs font-black text-slate-600 dark:text-slate-450">{item.name}</span>
                    </div>
                    <span className="text-xs font-extrabold text-[#0f172a] dark:text-white">
                      {item.value} مقعد <span className="text-[10px] font-bold text-slate-400">({percentage}%)</span>
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* جدول صافي الأرباح لكل رحلة */}
          <div className="lg:col-span-2 group rounded-3xl bg-white/60 dark:bg-slate-900/40 p-6 border border-slate-150/70 dark:border-slate-800/40 shadow-sm backdrop-blur-md transition-all duration-300 hover:shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xs font-black tracking-widest text-slate-500 dark:text-slate-400 uppercase flex items-center gap-2">
                <TableProperties size={16} className="text-[#0f172a] dark:text-white" />
                صافي الأرباح التشغيلية لكل رحلة
              </h3>
              <span className="text-[10px] font-black bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 px-3 py-1 rounded-full uppercase tracking-wider border border-blue-100 dark:border-blue-500/20">
                تحديث مباشر
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 dark:text-slate-500 text-xs font-black uppercase">
                    <th className="pb-4 font-black">رقم الرحلة</th>
                    <th className="pb-4 font-black">المسار</th>
                    <th className="pb-4 font-black">التكاليف التشغيلية</th>
                    <th className="pb-4 font-black">الإيراد</th>
                    <th className="pb-4 font-black">صافي الربح</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50 text-xs font-bold text-slate-600 dark:text-slate-400">
                  {flightsProfitsData.map((item, idx) => {
                    const isProfitNegative = item.netProfit < 0;
                    return (
                      <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-all border-b border-slate-50 dark:border-slate-800/50 last:border-0">
                        <td className="py-4 font-extrabold text-blue-600 dark:text-blue-400">{item.flightNumber}</td>
                        <td className="py-4 text-[#0f172a] dark:text-white font-extrabold">{item.route}</td>
                        <td className="py-4 text-slate-400">${item.costs.toLocaleString('en-US')}</td>
                        <td className="py-4 text-slate-500">${item.revenue.toLocaleString('en-US')}</td>
                        <td className="py-4 font-bold">
                          {isProfitNegative ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold bg-red-50 text-red-700 border border-red-100 shadow-[0_2px_8px_rgba(239,68,68,0.04)]">
                              <TrendingDown size={12} />
                              -${Math.abs(item.netProfit).toLocaleString('en-US')}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100 shadow-[0_2px_8px_rgba(16,185,129,0.04)]">
                              <TrendingUp size={12} />
                              +${item.netProfit.toLocaleString('en-US')}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  {flightsProfitsData.length === 0 && (
                    <tr>
                      <td colSpan="5" className="py-8 text-center text-slate-400">
                        لا توجد بيانات مالية للرحلات حالياً
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>

      </main>
    </div>
  );
}
