import React, { useState, useEffect } from 'react';
import { useAuth } from '../utils/AuthContext';
import Sidebar from '../components/Sidebar';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  LineChart, Line, XAxis, YAxis, CartesianGrid
} from 'recharts';
import {
  Users,
  TrendingUp,
  Clock,
  Compass,
  CalendarDays,
  Printer,
  ArrowRight
} from 'lucide-react';

// استيراد الشعارات ديناميكياً
import logo from '../assets/logo.png';
import yemeniaLogo from '../assets/Y.png';
import balqisLogo from '../assets/B.png';
import adenLogo from '../assets/F.png';

export default function PassengerStatusReport() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ statusDistribution: [], peakTimes: [] });
  const [loading, setLoading] = useState(true);

  // التحكم بالوضع الداكن للمخططات البيانية بشكل لحظي
  const [isDark, setIsDark] = useState(false);
  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'));
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  // الحالات الخاصة بالتدرج التحليلي (Drill-down)
  const [selectedDay, setSelectedDay] = useState(null);
  const [flights, setFlights] = useState([]);
  const [flightsLoading, setFlightsLoading] = useState(false);

  const [selectedFlight, setSelectedFlight] = useState(null);
  const [passengers, setPassengers] = useState([]);
  const [passengersLoading, setPassengersLoading] = useState(false);

  const [selectedPassenger, setSelectedPassenger] = useState(null);

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
    const fetchPassengerStats = async () => {
      try {
        const response = await fetch(`http://localhost:8080/api/passenger-stats?airlineCode=${airlineCode || ''}&airline_id=${airlineId || ''}`);
        const data = await response.json();
        if (data.success && data.stats) {
          setStats(data.stats);
        } else {
          setStats({ statusDistribution: [], peakTimes: [] });
        }
      } catch (error) {
        console.error('Error fetching passenger stats:', error);
        setStats({ statusDistribution: [], peakTimes: [] });
      } finally {
        setLoading(false);
      }
    };
    fetchPassengerStats();
  }, [airlineCode, airlineId]);

  const activeStats = stats || { statusDistribution: [], peakTimes: [] };
  const statusData = activeStats.statusDistribution || [];
  const peakData = activeStats.peakTimes || [];

  // ألوان الحالات للمخطط الدائري المجوف (Donut)
  const getStatusColor = (name) => {
    if (name === 'مؤكد') return '#10b981'; // أخضر
    if (name === 'انتظار') return '#f59e0b'; // أصفر
    if (name === 'ملغى') return '#ef4444'; // أحمر
    return '#64748b';
  };

  // معالجة النقر على المخطط الأسبوعي (المستوى الأول)
  const handleChartClick = async (state) => {
    if (state && state.activeLabel) {
      const dayName = state.activeLabel;
      setSelectedDay(dayName);
      setSelectedFlight(null);
      setPassengers([]);
      setSelectedPassenger(null);
      setFlightsLoading(true);

      try {
        const response = await fetch(`http://localhost:8080/api/flights-by-day/${dayName}?airlineCode=${airlineCode || ''}&airline_id=${airlineId || ''}`);
        const data = await response.json();
        if (data.success) {
          setFlights(data.flights);
        } else {
          setFlights([]);
        }
      } catch (error) {
        console.error('Error fetching flights by day:', error);
        setFlights([]);
      } finally {
        setFlightsLoading(false);
      }
    }
  };

  // معالجة النقر على رحلة (المستوى الثاني)
  const handleFlightClick = async (flight) => {
    setSelectedFlight(flight);
    setSelectedPassenger(null);
    setPassengersLoading(true);

    try {
      const response = await fetch(`http://localhost:8080/api/flight-passengers/${flight.flightNumber}`);
      const data = await response.json();
      if (data.success) {
        setPassengers(data.passengers);
      } else {
        setPassengers([]);
      }
    } catch (error) {
      console.error('Error fetching passengers:', error);
      setPassengers([]);
    } finally {
      setPassengersLoading(false);
    }
  };

  // ألوان وتنسيقات المخططات المتوافقة ديناميكياً مع الثيم
  const gridColor = isDark ? '#334155' : '#f1f5f9';
  const labelColor = isDark ? '#94a3b8' : '#64748b';
  const tooltipBg = isDark ? '#1e293b' : '#ffffff';
  const tooltipBorder = isDark ? '#334155' : '#e2e8f0';
  const tooltipTextColor = isDark ? '#ffffff' : '#0f172a';

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
              حالة الركاب وحركة الحجوزات
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-xs font-bold mt-1">
              تحليل تفصيلي لحالات الحجز (مؤكد/انتظار/ملغى)، أوقات الذروة وتفاصيل المسافرين الحية لشركة {user?.airline_name || 'الشركة'}.
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

        {/* المخططات والرسوم البيانية */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* مخطط حالات الحجز (Donut Chart) */}
          <div className="lg:col-span-1 group rounded-3xl bg-white/60 dark:bg-slate-900/40 p-6 border border-slate-150/70 dark:border-slate-800/40 shadow-sm backdrop-blur-md transition-all duration-300 hover:shadow-xl flex flex-col justify-between">
            <div>
              <h3 className="text-xs font-black tracking-widest text-slate-500 dark:text-slate-400 mb-6 uppercase flex items-center gap-2">
                <Users size={16} className="text-blue-600 dark:text-blue-400" />
                توزيع حالات الحجز (جاهزية الركاب)
              </h3>

              <div className="h-[240px] w-full flex items-center justify-center">
                {statusData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {statusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={getStatusColor(entry.name)} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: tooltipBg,
                          borderColor: tooltipBorder,
                          borderRadius: '12px',
                          color: tooltipTextColor,
                          fontFamily: 'inherit',
                          direction: 'rtl'
                        }}
                        formatter={(value) => [`${value} حجز`, 'عدد الحجوزات']}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-slate-400 dark:text-slate-500 text-xs font-bold">لا توجد بيانات متاحة حالياً</div>
                )}
              </div>
            </div>

            {/* تفاصيل الحالات بالأرقام */}
            <div className="space-y-3 mt-6 border-t border-slate-100 dark:border-slate-850 pt-6">
              {statusData.map((item) => (
                <div key={item.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full" style={{ backgroundColor: getStatusColor(item.name) }} />
                    <span className="font-extrabold text-slate-700 dark:text-slate-350">{item.name}</span>
                  </div>
                  <span className="font-black text-[#0f172a] dark:text-white bg-slate-50 dark:bg-slate-800/60 px-2.5 py-1 rounded-lg border border-slate-100 dark:border-slate-800">
                    {item.value} حجز
                  </span>
                </div>
              ))}
              {statusData.length === 0 && (
                <div className="text-center text-slate-400 dark:text-slate-500 text-xs py-4">
                  لم يتم تسجيل أي حجز حتى الآن
                </div>
              )}
            </div>
          </div>

          {/* مخطط أوقات الذروة (Line Chart) */}
          <div className="lg:col-span-2 group rounded-3xl bg-white/60 dark:bg-slate-900/40 p-6 border border-slate-150/70 dark:border-slate-800/40 shadow-sm backdrop-blur-md transition-all duration-300 hover:shadow-xl flex flex-col justify-between">
            <div>
              <h3 className="text-xs font-black tracking-widest text-slate-500 dark:text-slate-400 mb-6 uppercase flex items-center gap-2">
                <CalendarDays size={16} className="text-indigo-600 dark:text-indigo-400" />
                تحليل أوقات الذروة الأسبوعية للحجوزات
              </h3>

              <div className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={peakData}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    onClick={handleChartClick}
                    style={{ cursor: 'pointer' }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
                    <XAxis
                      dataKey="day"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11, fontWeight: 700, fill: labelColor }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11, fontWeight: 700, fill: labelColor }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: tooltipBg,
                        borderColor: tooltipBorder,
                        borderRadius: '12px',
                        color: tooltipTextColor,
                        fontFamily: 'inherit',
                        direction: 'rtl'
                      }}
                      formatter={(value) => [`${value} حجز`, 'عدد الحجوزات']}
                    />
                    <Line
                      type="monotone"
                      dataKey="bookings"
                      stroke="#2563eb"
                      strokeWidth={3}
                      dot={{ r: 4, strokeWidth: 2, fill: isDark ? '#1e293b' : '#ffffff' }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* أزرار الأيام المساعدة للتنقل التفاعلي السلس */}
              <div className="flex flex-wrap gap-2 mt-4 justify-center print:hidden">
                {['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'].map(d => {
                  const hasBookings = peakData.find(p => p.day === d)?.bookings > 0;
                  const isSelected = selectedDay === d;
                  return (
                    <button
                      key={d}
                      onClick={() => handleChartClick({ activeLabel: d })}
                      className={`px-3 py-1.5 rounded-xl text-[10px] font-black transition-all ${isSelected
                        ? 'bg-blue-600 text-white shadow'
                        : hasBookings
                          ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40'
                          : 'bg-slate-50 dark:bg-slate-800/40 text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                    >
                      {d}
                    </button>
                  );
                })}
              </div>
            </div>

            <p className="text-[10px] text-slate-450 dark:text-slate-500 font-extrabold mt-4 text-center">
              * اضغط على أي نقطة في المخطط الأسبوعي أو الأيام لعرض تفاصيل الرحلات المسجلة لذلك اليوم.
            </p>
          </div>
        </div>

        {/* المستوى الثاني والثالث: تفاصيل تحليل الركاب والرحلات (Drill-down) */}
        {(selectedDay || selectedFlight) && (
          <div className="mt-8 rounded-3xl bg-white/60 dark:bg-slate-900/40 p-6 border border-slate-150/70 dark:border-slate-800/40 shadow-sm backdrop-blur-md transition-all duration-300 hover:shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-300">

            {/* الترويسة الفرعية للتحليل */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-6 gap-4">
              <div>
                <h3 className="text-lg font-black tracking-tight text-[#0f172a] dark:text-white flex items-center gap-2">
                  <TrendingUp className="text-blue-600 dark:text-blue-400" size={20} />
                  {selectedFlight
                    ? `تفاصيل ركاب الرحلة ${selectedFlight.flightNumber}`
                    : `الرحلات المجدولة يوم ${selectedDay}`}
                </h3>
                <p className="text-slate-400 dark:text-slate-500 text-xs font-bold mt-1">
                  {selectedFlight
                    ? `مسار الرحلة: ${selectedFlight.route} | إجمالي الركاب الفعليين: ${selectedFlight.totalPassengers}`
                    : `عرض وتتبع الرحلات المجدولة وتحليل حركة الركاب`}
                </p>
              </div>

              {/* أزرار العودة والإغلاق */}
              <div className="flex items-center gap-2 print:hidden">
                {selectedFlight && (
                  <button
                    onClick={() => {
                      setSelectedFlight(null);
                      setPassengers([]);
                    }}
                    className="flex items-center gap-1.5 px-3.5 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-850 text-slate-700 dark:text-slate-300 hover:text-blue-900 dark:hover:text-blue-400 rounded-xl text-xs font-bold transition-all shadow-sm"
                  >
                    <ArrowRight size={14} />
                    رجوع لقائمة الرحلات
                  </button>
                )}
                <button
                  onClick={() => {
                    setSelectedDay(null);
                    setSelectedFlight(null);
                    setPassengers([]);
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-2 border border-red-200 dark:border-red-950/20 bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 hover:bg-red-105 dark:hover:bg-red-950/40 rounded-xl text-xs font-bold transition-all shadow-sm"
                >
                  إغلاق نافذة التحليل
                </button>
              </div>
            </div>

            {/* المستوى الثاني: قائمة رحلات اليوم المختار */}
            {selectedDay && !selectedFlight && (
              <div>
                {flightsLoading ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400"></div>
                    <span className="text-slate-500 dark:text-slate-400 text-xs font-bold mt-3">جاري استرجاع الرحلات المجدولة...</span>
                  </div>
                ) : flights.length === 0 ? (
                  <div className="text-center py-12 text-slate-400 dark:text-slate-500 text-sm font-bold">
                    لا توجد رحلات طيران مجدولة في هذا اليوم
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {flights.map((flight) => (
                      <div
                        key={flight.id}
                        onClick={() => handleFlightClick(flight)}
                        className="group relative cursor-pointer overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850/20 p-5 transition-all hover:border-blue-500/50 dark:hover:border-blue-400/50 hover:shadow-md hover:bg-white dark:hover:bg-slate-800"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-xs font-extrabold text-slate-400 dark:text-slate-500">طيران {airlineCode}</span>
                          <span className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-[10px] font-black px-2.5 py-1 rounded-full uppercase">
                            {flight.flightNumber}
                          </span>
                        </div>
                        <h4 className="text-lg font-black text-[#0f172a] dark:text-white mb-2">
                          {flight.route}
                        </h4>
                        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                          <span className="flex items-center gap-1 font-bold">
                            <Clock size={14} />
                            {new Date(flight.departureTime).toLocaleTimeString('ar-YE', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          <span className="font-extrabold text-[#0f172a] dark:text-white bg-white dark:bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-100 dark:border-slate-800">
                            {flight.totalPassengers} ركاب
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* المستوى الثالث: قائمة الركاب المسجلين في الرحلة المختارة */}
            {selectedFlight && (
              <div>
                {passengersLoading ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400"></div>
                    <span className="text-slate-500 dark:text-slate-400 text-xs font-bold mt-3">جاري استرجاع قائمة المسافرين...</span>
                  </div>
                ) : passengers.length === 0 ? (
                  <div className="text-center py-12 text-slate-400 dark:text-slate-500 text-sm font-bold">
                    لا توجد حجوزات نشطة مسجلة على هذه الرحلة حالياً.
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-2xl border border-slate-100 dark:border-slate-800">
                    <table className="w-full text-right border-collapse">
                      <thead>
                        <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850/40 text-slate-400 dark:text-slate-400 text-[11px] font-black uppercase">
                          <th className="py-3.5 pr-4">اسم الراكب</th>
                          <th className="py-3.5">رقم الجواز</th>
                          <th className="py-3.5">الجنسية</th>
                          <th className="py-3.5">الجنس</th>
                          <th className="py-3.5">المقعد</th>
                          <th className="py-3.5 pl-4 text-left">التفاصيل</th>
                        </tr>
                      </thead>
                      <tbody>
                        {passengers.map((passenger) => (
                          <tr
                            key={passenger.id}
                            className="border-b border-slate-50 dark:border-slate-800/40 hover:bg-slate-50/40 dark:hover:bg-slate-800/40 transition-colors"
                          >
                            <td className="py-3.5 pr-4 font-extrabold text-slate-700 dark:text-slate-200">
                              {passenger.passengerName}
                            </td>
                            <td className="py-3.5 text-xs font-black text-slate-500 dark:text-slate-400">
                              {passenger.passportNumber}
                            </td>
                            <td className="py-3.5 text-xs text-slate-500 dark:text-slate-400">
                              {passenger.nationality}
                            </td>
                            <td className="py-3.5 text-xs text-slate-500 dark:text-slate-400">
                              {passenger.gender}
                            </td>
                            <td className="py-3.5 text-xs">
                              <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-350 font-extrabold px-2.5 py-1 rounded">
                                {passenger.seatNumber}
                              </span>
                            </td>
                            <td className="py-3.5 pl-4 text-left">
                              <button
                                onClick={() => setSelectedPassenger(passenger)}
                                className="px-3.5 py-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-[10px] font-black rounded-xl transition-all"
                              >
                                عرض التفاصيل
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* المستوى الرابع: نافذة تفاصيل الراكب المنبثقة (Modal) */}
        {selectedPassenger && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* خلفية معتمة ناعمة (Backdrop blur) */}
            <div
              onClick={() => setSelectedPassenger(null)}
              className="absolute inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm transition-opacity duration-300"
            />

            {/* بطاقة النافذة المنبثقة */}
            <div className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 transition-all duration-300 animate-in fade-in zoom-in-95">

              {/* الترويسة */}
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-4">
                <h3 className="text-base font-black text-slate-950 dark:text-white flex items-center gap-2">
                  <Users size={18} className="text-blue-600" />
                  ملف تفاصيل المسافر
                </h3>
                <button
                  onClick={() => setSelectedPassenger(null)}
                  className="rounded-full p-1.5 bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-850 dark:hover:text-white transition-all"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* بيانات الراكب والخدمات المربوطة */}
              <div className="space-y-4">

                {/* الاسم */}
                <div className="bg-slate-50 dark:bg-slate-850/30 p-4 rounded-2xl border border-slate-100 dark:border-slate-800/80">
                  <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 block mb-1 uppercase">الاسم الكامل للمسافر</span>
                  <span className="text-lg font-black text-slate-900 dark:text-white">{selectedPassenger.passengerName}</span>
                </div>

                {/* الجواز والجنسية */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 dark:bg-slate-850/30 p-4 rounded-2xl border border-slate-100 dark:border-slate-800/80">
                    <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 block mb-1">رقم جواز السفر</span>
                    <span className="text-sm font-black text-slate-800 dark:text-slate-200">{selectedPassenger.passportNumber}</span>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-850/30 p-4 rounded-2xl border border-slate-100 dark:border-slate-800/80">
                    <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 block mb-1">الجنسية والجنس</span>
                    <span className="text-sm font-black text-slate-800 dark:text-slate-200">{selectedPassenger.nationality} ({selectedPassenger.gender})</span>
                  </div>
                </div>

                {/* مرجع الحجز والمقعد */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 dark:bg-slate-850/30 p-4 rounded-2xl border border-slate-100 dark:border-slate-800/80">
                    <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 block mb-1">مرجع الحجز (PNR)</span>
                    <span className="text-sm font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest">{selectedPassenger.bookingReference}</span>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-850/30 p-4 rounded-2xl border border-slate-100 dark:border-slate-800/80">
                    <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 block mb-1">المقعد المخصص</span>
                    <span className="text-sm font-black text-slate-850 dark:text-slate-200">{selectedPassenger.seatNumber}</span>
                  </div>
                </div>

                {/* تفاصيل الوزن الزائد */}
                <div className="bg-slate-50 dark:bg-slate-850/30 p-4 rounded-2xl border border-slate-100 dark:border-slate-800/80">
                  <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 block mb-1">تفاصيل الوزن الزائد</span>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-black text-slate-800 dark:text-slate-200">
                      {selectedPassenger.extraWeight > 0 ? `${selectedPassenger.extraWeight} كجم` : 'لا يوجد وزن زائد مسجل'}
                    </span>
                    {selectedPassenger.extraBaggagePrice > 0 && (
                      <span className="text-xs font-black text-red-650 dark:text-red-400 bg-red-50 dark:bg-red-950/20 px-2 py-0.5 rounded">
                        +{selectedPassenger.extraBaggagePrice} $
                      </span>
                    )}
                  </div>
                </div>

                {/* الخدمات الأرضية والطبية */}
                <div className="bg-slate-50 dark:bg-slate-850/30 p-4 rounded-2xl border border-slate-100 dark:border-slate-800/80">
                  <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 block mb-1">الخدمات الخاصة المطلوبة</span>
                  {selectedPassenger.services && selectedPassenger.services.length > 0 ? (
                    <div className="flex flex-wrap gap-2 mt-1">
                      {selectedPassenger.services.map((srv, idx) => (
                        <span
                          key={idx}
                          className="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-805/30 text-[10px] font-black px-2.5 py-1 rounded-xl"
                        >
                          {srv}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-xs text-slate-450 dark:text-slate-500 font-bold">لم يتم حجز أي خدمات أرضية أو طبية خاصة.</span>
                  )}
                </div>

                {/* التكلفة الإجمالية للحجز */}
                <div className="bg-blue-50/50 dark:bg-blue-900/10 p-4 rounded-2xl border border-blue-100 dark:border-blue-900/20 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-black text-blue-700/80 dark:text-blue-400/80 block uppercase">إجمالي السعر المدفوع</span>
                    <span className="text-xs text-slate-400 dark:text-slate-500 font-bold">شامل التذكرة والخدمات والأمتعة</span>
                  </div>
                  <span className="text-xl font-black text-blue-700 dark:text-blue-400">
                    {selectedPassenger.finalPrice} $
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
