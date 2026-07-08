import React, { useState, useEffect } from 'react';
import { useAuth } from '../utils/AuthContext';
import { useTheme } from '../utils/ThemeContext';
import Sidebar from '../components/Sidebar';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, PieChart, Pie, Legend
} from 'recharts';
import {
  Activity,
  Heart,
  AlertTriangle,
  Clock,
  Compass,
  Truck,
  Printer
} from 'lucide-react';

// استيراد الشعارات ديناميكياً
import logo from '../assets/logo.png';
import yemeniaLogo from '../assets/Y.png';
import balqisLogo from '../assets/B.png';
import adenLogo from '../assets/F.png';

export default function MedicalServicesReport() {
  const { user } = useAuth();
  const { isDarkMode } = useTheme();
  const [stats, setStats] = useState({ servicesStats: [], criticalFlights: [] });
  const [loading, setLoading] = useState(true);

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
    const fetchMedicalStats = async () => {
      try {
        const response = await fetch(`http://localhost:8080/api/medical-services?airlineCode=${airlineCode || ''}&airline_id=${airlineId || ''}`);
        const data = await response.json();
        if (data.success && data.stats) {
          setStats(data.stats);
        } else {
          setStats({ servicesStats: [], criticalFlights: [] });
        }
      } catch (error) {
        console.error('Error fetching medical services stats:', error);
        setStats({ servicesStats: [], criticalFlights: [] });
      } finally {
        setLoading(false);
      }
    };
    fetchMedicalStats();
  }, [airlineCode, airlineId]);

  const activeStats = stats || { servicesStats: [], criticalFlights: [] };

  const servicesData = activeStats.servicesStats || [];
  const criticalFlightsData = activeStats.criticalFlights || [];

  // ألوان وتنسيقات المخططات في الوضع الفاتح والداكن
  const gridColor = isDarkMode ? 'rgba(255, 255, 255, 0.05)' : '#f1f5f9';
  const labelColor = isDarkMode ? '#94a3b8' : '#64748b';
  const tooltipBg = isDarkMode ? 'rgba(15, 23, 42, 0.95)' : '#ffffff';
  const tooltipBorder = isDarkMode ? 'rgba(255, 255, 255, 0.1)' : '#e2e8f0';

  // ألوان احترافية مريحة للمخطط الدائري
  const COLORS = ['#ef4444', '#f59e0b', '#3b82f6', '#10b981', '#6366f1'];

  // تنسيق موعد الوصول
  const formatTime = (timeStr) => {
    if (!timeStr) return '';
    try {
      const date = new Date(timeStr);
      return date.toLocaleString('ar-YE', {
        hour: '2-digit',
        minute: '2-digit',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (e) {
      return timeStr;
    }
  };

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
              الخدمات الطبية والتنسيق الأرضي
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-xs font-bold mt-1">
              متابعة وتنسيق الخدمات الطبية الخاصة وحالات التجهيز الأرضي الطارئة لشركة {user?.airline_name || 'الشركة'}.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 px-4 py-2 border border-slate-250 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-350 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-500 rounded-xl shadow-sm hover:shadow transition-all duration-200 text-xs font-bold cursor-pointer print:hidden"
            >
              <Printer size={16} />
              طباعة التقرير / PDF
            </button>
          </div>
        </div>

        {/* المخططات والتقارير */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* مخطط حجم الخدمات الطبية المطلوبة */}
          <div className="lg:col-span-1 group rounded-3xl bg-white/60 dark:bg-slate-900/40 p-6 border border-slate-150/70 dark:border-slate-800/40 shadow-sm backdrop-blur-md transition-all duration-300 hover:shadow-xl flex flex-col justify-between">
            <div>
              <h3 className="text-xs font-black tracking-widest text-slate-500 dark:text-slate-400 mb-6 uppercase flex items-center gap-2">
                <Heart size={16} className="text-rose-500" />
                توزيع الخدمات الطبية والأرضية
              </h3>

              <div className="h-[240px] w-full flex items-center justify-center">
                {servicesData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={servicesData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {servicesData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: tooltipBg,
                          borderColor: tooltipBorder,
                          borderRadius: '12px',
                          color: isDarkMode ? '#ffffff' : '#0f172a',
                          fontFamily: 'inherit',
                          direction: 'rtl'
                        }}
                        formatter={(value) => [`${value} طلب`, 'عدد الطلبات']}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-slate-400 text-xs font-bold">لا توجد خدمات مطلوبة حالياً</div>
                )}
              </div>
            </div>

            {/* تفاصيل الخدمات بالأرقام */}
            <div className="space-y-3 mt-6 border-t border-slate-100 dark:border-slate-800 pt-6">
              {servicesData.map((item, idx) => (
                <div key={item.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                    <span className="font-extrabold text-slate-700 dark:text-slate-300">{item.name}</span>
                  </div>
                  <span className="font-black text-[#0f172a] dark:text-white bg-slate-50 dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-100 dark:border-slate-700">
                    {item.value} طلب
                  </span>
                </div>
              ))}
              {servicesData.length === 0 && (
                <div className="text-center text-slate-400 text-xs py-4">
                  لم يتم رصد أي طلبات خاصة للخدمات
                </div>
              )}
            </div>
          </div>

          {/* جدول الحالات الحرجة والتجهيز الأرضي الطارئ */}
          <div className="lg:col-span-2 group rounded-3xl bg-white/60 dark:bg-slate-900/40 p-6 border border-slate-150/70 dark:border-slate-800/40 shadow-sm backdrop-blur-md transition-all duration-300 hover:shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xs font-black tracking-widest text-slate-500 dark:text-slate-400 uppercase flex items-center gap-2">
                <AlertTriangle size={16} className="text-amber-500" />
                جدول الرحلات ذات الحالات الحرجة والتنسيق الطارئ
              </h3>
              <span className="text-[10px] font-black bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 px-3 py-1 rounded-full uppercase tracking-wider border border-rose-100 dark:border-rose-500/20">
                إشعار فوري
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 dark:text-slate-550 text-xs font-black uppercase">
                    <th className="pb-4 font-black">رقم الرحلة</th>
                    <th className="pb-4 font-black">المسار</th>
                    <th className="pb-4 font-black">تاريخ ووقت الوصول المتوقع</th>
                    <th className="pb-4 font-black pr-4">التجهيز الأرضي المطلوبة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-850/50 text-xs font-bold text-slate-600 dark:text-slate-400">
                  {criticalFlightsData.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-all border-b border-slate-50 dark:border-slate-800/50 last:border-0">
                      <td className="py-4 font-extrabold text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                        <Truck size={16} className="text-rose-500 animate-pulse" />
                        {item.flightNumber}
                      </td>
                      <td className="py-4 text-[#0f172a] dark:text-white font-extrabold">{item.route}</td>
                      <td className="py-4 text-slate-400 flex items-center gap-1.5 mt-2.5">
                        <Clock size={14} className="text-slate-400" />
                        {formatTime(item.arrivalTime)}
                      </td>
                      <td className="py-4 pr-4">
                        <span className="inline-block bg-rose-50 text-rose-700 px-3 py-1 rounded-lg border border-rose-100 font-extrabold text-[11px]">
                          {item.services || item.servicesRequired}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {criticalFlightsData.length === 0 && (
                    <tr>
                      <td colSpan="4" className="py-8 text-center text-slate-400">
                        لا توجد رحلات تتطلب تجهيزات طبية أو أرضية خاصة حالياً
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
