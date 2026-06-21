import React, { useState, useEffect } from 'react';
import { useAuth } from '../utils/AuthContext';
import { useTheme } from '../utils/ThemeContext';
import Sidebar from '../components/Sidebar';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell
} from 'recharts';
import {
  Plane,
  TrendingUp,
  MapPin,
  Users,
  Compass,
  ChevronLeft,
  Printer,
  Search,
  Armchair,
  Info,
  X,
  User,
  BadgeAlert,
  Loader2
} from 'lucide-react';

// استيراد الشعارات ديناميكياً
import logo from '../assets/logo.png';
import yemeniaLogo from '../assets/Y.png';
import balqisLogo from '../assets/B.png';
import adenLogo from '../assets/F.png';

export default function DestinationReport() {
  const { user } = useAuth();
  const { isDarkMode } = useTheme();
  const [stats, setStats] = useState({ topDestinations: [], occupancyRates: [] });
  const [loading, setLoading] = useState(true);

  const [searchFlightNumber, setSearchFlightNumber] = useState('');
  const [flightDetails, setFlightDetails] = useState(null);
  const [flightDetailsLoading, setFlightDetailsLoading] = useState(false);
  const [flightDetailsError, setFlightDetailsError] = useState('');
  const [activePopoverSeat, setActivePopoverSeat] = useState(null);

  const handleSearchFlight = async (e) => {
    e.preventDefault();
    if (!searchFlightNumber.trim()) return;
    
    setFlightDetailsLoading(true);
    setFlightDetailsError('');
    setFlightDetails(null);
    setActivePopoverSeat(null);
    
    try {
      const formattedFlightNumber = searchFlightNumber.trim().toUpperCase().replace(/\s+/g, '');
      const response = await fetch(`http://localhost:8080/api/flight-details/${formattedFlightNumber}`);
      const data = await response.json();
      if (data.success) {
        setFlightDetails(data);
      } else {
        setFlightDetailsError(data.error || 'الرحلة غير موجودة');
      }
    } catch (error) {
      console.error('Error fetching flight details:', error);
      setFlightDetailsError('حدث خطأ أثناء الاتصال بالخادم');
    } finally {
      setFlightDetailsLoading(false);
    }
  };

  const BUSINESS_ROWS = [1, 2, 3];
  const ECONOMY_ROWS = Array.from({ length: 23 }, (_, i) => i + 4);
  const EXIT_ROWS = [11, 12];

  const renderSeat = (rowNum, col) => {
    const seatId = `${rowNum}${col}`;
    const isBusiness = BUSINESS_ROWS.includes(rowNum);
    
    const passenger = flightDetails?.bookedSeats?.find(b => b.seatNumber === seatId);
    const isOccupied = !!passenger;
    
    let seatColorClass = "";
    if (isOccupied) {
      if (passenger.seatClass === 'first') {
        seatColorClass = "bg-gradient-to-br from-purple-500 to-indigo-600 text-white shadow-purple-500/20";
      } else if (passenger.seatClass === 'business' || isBusiness) {
        seatColorClass = "bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-amber-500/20";
      } else {
        seatColorClass = "bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-blue-500/20";
      }
    } else {
      seatColorClass = "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border border-slate-200/50 dark:border-slate-700/50 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-600 dark:hover:text-slate-400";
    }

    return (
      <div key={seatId} className="relative group">
        <button
          type="button"
          onClick={() => isOccupied && setActivePopoverSeat(activePopoverSeat === seatId ? null : seatId)}
          className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-[10px] transition-all duration-200 ${seatColorClass} ${isOccupied ? 'cursor-pointer hover:scale-110 shadow-md' : 'cursor-default opacity-60'}`}
          title={isOccupied ? `مقعد محجوز: ${passenger.passengerName}` : `مقعد شاغر ${seatId}`}
        >
          <Armchair size={15} />
        </button>

        {/* Click Popover for Occupied Seats */}
        {activePopoverSeat === seatId && isOccupied && (
          <div className="absolute bottom-full left-1/2 z-[150] mb-3 -translate-x-1/2 animate-in fade-in zoom-in slide-in-from-bottom-2 duration-200">
            <div className="relative w-72 overflow-hidden rounded-2xl bg-white dark:bg-slate-800 p-5 shadow-[0_15px_30px_rgba(0,0,0,0.15)] border border-slate-200 dark:border-slate-700 text-right" dir="rtl">
              {/* Accent header */}
              <div className={`absolute top-0 left-0 right-0 h-1.5 ${passenger.seatClass === 'first' ? 'bg-purple-600' : isBusiness ? 'bg-amber-500' : 'bg-blue-600'}`} />
              
              {/* Close button */}
              <button 
                onClick={(e) => { e.stopPropagation(); setActivePopoverSeat(null); }}
                className="absolute top-3 left-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X size={14} />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${isBusiness ? 'bg-amber-50 text-amber-500 dark:bg-amber-950/30' : 'bg-blue-50 text-blue-500 dark:bg-blue-950/30'}`}>
                  <User size={20} />
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-400">بيانات الراكب | مقعد {seatId}</h4>
                  <p className="text-sm font-black text-slate-800 dark:text-white mt-0.5">{passenger.passengerName}</p>
                </div>
              </div>

              <div className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
                <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-900/50 p-2 rounded-lg">
                  <span className="font-bold text-slate-400">رقم جواز السفر:</span>
                  <span className="font-black text-slate-700 dark:text-slate-200" dir="ltr">{passenger.passportNumber}</span>
                </div>
                <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-900/50 p-2 rounded-lg">
                  <span className="font-bold text-slate-400">الجنسية:</span>
                  <span className="font-black text-slate-700 dark:text-slate-200">{passenger.nationality || 'غير محدد'}</span>
                </div>
                <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-900/50 p-2 rounded-lg">
                  <span className="font-bold text-slate-400">الجنس:</span>
                  <span className="font-black text-slate-700 dark:text-slate-200">
                    {passenger.gender === 'female' ? 'أنثى' : 'ذكر'}
                  </span>
                </div>
                <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-900/50 p-2 rounded-lg">
                  <span className="font-bold text-slate-400">مرجع الحجز:</span>
                  <span className="font-black text-blue-600 dark:text-blue-400 select-all">{passenger.bookingReference}</span>
                </div>

                {passenger.services && passenger.services.length > 0 && (
                  <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 p-2.5 rounded-lg mt-2">
                    <span className="font-black text-rose-700 dark:text-rose-400 block mb-1">الخدمات الأرضية المطلوبة:</span>
                    <div className="flex flex-wrap gap-1">
                      {passenger.services.map((srv, index) => (
                        <span key={index} className="inline-block bg-white dark:bg-slate-900 text-rose-800 dark:text-rose-300 text-[9px] font-black px-2 py-0.5 rounded border border-rose-100 dark:border-rose-900/50">
                          {srv}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

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
    const fetchTrafficStats = async () => {
      try {
        const response = await fetch(`http://localhost:8080/api/traffic-stats?airlineCode=${airlineCode || ''}&airline_id=${airlineId || ''}`);
        const data = await response.json();
        if (data.success && data.stats) {
          setStats(data.stats);
        } else {
          setStats({ topDestinations: [], occupancyRates: [] });
        }
      } catch (error) {
        console.error('Error fetching traffic stats:', error);
        setStats({ topDestinations: [], occupancyRates: [] });
      } finally {
        setLoading(false);
      }
    };
    fetchTrafficStats();
  }, [airlineCode, airlineId]);

  const activeStats = stats || { topDestinations: [], occupancyRates: [] };

  // التأكد من ملء البيانات الحقيقية فقط
  const topDestinationsData = activeStats.topDestinations || [];
  const occupancyRatesData = activeStats.occupancyRates || [];

  // ألوان وتنسيقات المخططات في الوضع الفاتح والداكن
  const gridColor = isDarkMode ? 'rgba(255, 255, 255, 0.05)' : '#f1f5f9';
  const labelColor = isDarkMode ? '#94a3b8' : '#64748b';
  const tooltipBg = isDarkMode ? 'rgba(15, 23, 42, 0.95)' : '#ffffff';
  const tooltipBorder = isDarkMode ? 'rgba(255, 255, 255, 0.1)' : '#e2e8f0';

  // درجات ألوان زرقاء احترافية لأعمدة المخطط البياني
  const barColors = ['#1e3a8a', '#2563eb', '#3b82f6', '#60a5fa', '#93c5fd'];

  // استرجاع لون شريط التقدم بناءً على النسبة المئوية
  const getProgressBarColor = (rate) => {
    if (rate === 0) return 'bg-slate-300';
    if (rate >= 70) return 'bg-emerald-500';
    if (rate >= 40) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  const getProgressTextColor = (rate) => {
    if (rate === 0) return 'text-slate-500 bg-slate-50 border-slate-200';
    if (rate >= 70) return 'text-emerald-700 bg-emerald-50 border-emerald-100';
    if (rate >= 40) return 'text-amber-700 bg-amber-50 border-amber-100';
    return 'text-rose-700 bg-rose-50 border-rose-100';
  };

  return (
    <div className="flex min-h-screen bg-[#f8fafc] dark:bg-[#080d19] text-[#0f172a] dark:text-slate-100 transition-colors duration-300 relative" dir="rtl">
      {/* القائمة الجانبية */}
      <div className="print:hidden">
        <Sidebar />
      </div>

      {/* المحتوى الرئيسي */}
      <main className="flex-1 mr-72 print:mr-0 p-8 print:p-0 relative z-10 min-h-screen">
        
        {/* الترويسة (Header) */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-black tracking-tight text-[#0f172a] dark:text-white">
                تحليل الوجهات وحركة الطيران
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-xs font-bold mt-1">
                إحصائيات تفصيلية حول المدن الأكثر طلباً ومعدلات إشغال المقاعد للرحلات الجوية لشركة {user?.airline_name || 'الشركة'}
              </p>
            </div>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 px-4 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-350 hover:text-blue-900 dark:hover:text-blue-400 hover:border-blue-900 rounded-xl shadow-sm hover:shadow transition-all duration-200 print:hidden text-xs font-bold"
            >
              <Printer size={16} />
              طباعة التقرير / حفظ كـ PDF
            </button>
          </div>

          <div className="flex items-center gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-4 py-2.5 rounded-2xl shadow-sm print:hidden">
            <div className="h-8 w-8 rounded-lg bg-slate-50 dark:bg-slate-800 p-1 flex items-center justify-center border border-slate-100 dark:border-slate-700">
              <img src={getCompanyLogo()} alt="Airline Logo" className="h-full w-full object-contain" />
            </div>
            <span className="text-xs font-black tracking-widest text-slate-700 dark:text-slate-350 uppercase">
              حركة الطيران
            </span>
          </div>
        </div>

        {/* المخطط البياني والجدول */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* المخطط البياني: الوجهات الأكثر طلباً */}
          <div className="lg:col-span-1 group rounded-3xl bg-white dark:bg-slate-900 p-8 border border-slate-200/60 dark:border-slate-800/80 shadow-sm transition-all hover:shadow-md flex flex-col justify-between">
            <div>
              <h3 className="text-xs font-black tracking-widest text-slate-500 dark:text-slate-400 mb-6 uppercase flex items-center gap-2">
                <MapPin size={16} className="text-blue-600 dark:text-blue-400" />
                الوجهات الأكثر طلباً (حسب الحجوزات)
              </h3>

              <div className="h-[240px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topDestinationsData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
                    <XAxis 
                      dataKey="name" 
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
                        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                        color: isDarkMode ? '#ffffff' : '#0f172a',
                        fontFamily: 'inherit',
                        direction: 'rtl'
                      }}
                      formatter={(value) => [`${value} حجز`, 'عدد الحجوزات']}
                    />
                    <Bar dataKey="bookings" radius={[6, 6, 0, 0]}>
                      {topDestinationsData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={barColors[index % barColors.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* تفصيل الحجوزات بالأرقام */}
            <div className="space-y-3 mt-6 border-t border-slate-100 dark:border-slate-800 pt-6">
              {topDestinationsData.map((item, idx) => (
                <div key={item.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="h-5 w-5 rounded-full flex items-center justify-center font-bold text-[10px] text-white" style={{ backgroundColor: barColors[idx % barColors.length] }}>
                      {idx + 1}
                    </span>
                    <span className="font-extrabold text-slate-700 dark:text-slate-300">{item.name}</span>
                  </div>
                  <span className="font-black text-[#0f172a] dark:text-white bg-slate-50 dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-100 dark:border-slate-700">
                    {item.bookings} حجز
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* جدول معدلات إشغال المقاعد */}
          <div className="lg:col-span-2 group rounded-3xl bg-white dark:bg-slate-900 p-8 border border-slate-200/60 dark:border-slate-800/80 shadow-sm transition-all hover:shadow-md">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xs font-black tracking-widest text-slate-500 dark:text-slate-400 uppercase flex items-center gap-2">
                <Users size={16} className="text-emerald-600 dark:text-emerald-400" />
                نسب إشغال المقاعد التشغيلية للرحلات
              </h3>
              <span className="text-[10px] font-black bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 px-3 py-1 rounded-full uppercase tracking-wider border border-blue-100 dark:border-blue-500/20">
                تحديث حي
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 dark:text-slate-550 text-xs font-black uppercase">
                    <th className="pb-4 font-black">رقم الرحلة</th>
                    <th className="pb-4 font-black">خط السير</th>
                    <th className="pb-4 font-black">المقاعد المحجوزة / الإجمالية</th>
                    <th className="pb-4 font-black pr-4">نسبة الإشغال</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50 text-xs font-bold text-slate-600 dark:text-slate-400">
                  {occupancyRatesData.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-all border-b border-slate-50 dark:border-slate-800/50 last:border-0">
                      <td className="py-4 font-extrabold text-blue-600 dark:text-blue-400">{item.flightNumber}</td>
                      <td className="py-4 text-[#0f172a] dark:text-white font-extrabold">{item.route}</td>
                      <td className="py-4 text-slate-400 dark:text-slate-500">
                        {item.bookedSeats} / {item.totalSeats} مقعد
                      </td>
                      <td className="py-4 pr-4">
                        <div className="flex items-center gap-3">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-black border ${getProgressTextColor(item.rate)}`}>
                            {item.rate}%
                          </span>
                          <div className="w-24 bg-slate-100 dark:bg-slate-850 rounded-full h-2 overflow-hidden border border-slate-200/40 dark:border-slate-800">
                            <div 
                              className={`h-full rounded-full transition-all duration-500 ${getProgressBarColor(item.rate)}`}
                              style={{ width: `${item.rate}%` }}
                            />
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {occupancyRatesData.length === 0 && (
                    <tr>
                      <td colSpan="4" className="py-8 text-center text-slate-400">
                        لا توجد رحلات مسجلة حالياً
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* قسم مخطط المقاعد التفاعلي */}
        <div className="mt-8 rounded-3xl bg-white dark:bg-slate-900 p-8 border border-slate-200/60 dark:border-slate-800 shadow-sm print:hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-6 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-lg font-black text-slate-800 dark:text-white flex items-center gap-2">
                <Plane className="text-blue-600 rotate-45" size={20} />
                مخطط المقاعد التفاعلي وإشغال الرحلات
              </h3>
              <p className="text-slate-400 text-xs font-bold mt-1">
                ابحث برقم الرحلة لاستعراض مخطط المقاعد وتوزيع المسافرين وتفاصيلهم الحية.
              </p>
            </div>

            {/* نموذج البحث */}
            <form onSubmit={handleSearchFlight} className="flex gap-2 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <input
                  type="text"
                  placeholder="مثال: IY101"
                  value={searchFlightNumber}
                  onChange={(e) => setSearchFlightNumber(e.target.value)}
                  className="w-full h-11 pr-4 pl-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 text-xs font-bold placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 transition-all"
                />
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              </div>
              <button
                type="submit"
                disabled={flightDetailsLoading}
                className="h-11 px-6 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black rounded-xl shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {flightDetailsLoading ? (
                  <Loader2 className="animate-spin" size={16} />
                ) : 'بحث'}
              </button>
            </form>
          </div>

          {/* حالات العرض المختلفة */}
          {flightDetailsLoading && (
            <div className="py-20 flex flex-col items-center justify-center text-slate-400">
              <Loader2 className="animate-spin text-blue-600 mb-4" size={36} />
              <p className="text-xs font-bold">جاري تحميل بيانات الرحلة ومخطط المقاعد...</p>
            </div>
          )}

          {flightDetailsError && (
            <div className="py-12 flex flex-col items-center justify-center text-rose-500 bg-rose-50/50 dark:bg-rose-950/10 border border-dashed border-rose-200 dark:border-rose-900/30 rounded-2xl">
              <BadgeAlert size={36} className="mb-3" />
              <p className="text-xs font-black">{flightDetailsError}</p>
            </div>
          )}

          {!flightDetails && !flightDetailsLoading && !flightDetailsError && (
            <div className="py-16 flex flex-col items-center justify-center text-slate-400 bg-slate-50/50 dark:bg-slate-900/30 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
              <Compass size={40} className="text-slate-300 dark:text-slate-700 mb-3 animate-pulse" />
              <p className="text-xs font-bold">الرجاء إدخال رقم الرحلة في الأعلى لعرض مخطط المقاعد الحية.</p>
            </div>
          )}

          {/* عرض تفاصيل الرحلة ومخطط المقاعد عند العثور على البيانات */}
          {flightDetails && !flightDetailsLoading && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* البيانات والإحصائيات */}
              <div className="lg:col-span-1 space-y-6">
                
                {/* بطاقة تفاصيل الرحلة */}
                <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 p-5">
                  <span className="text-[10px] font-black uppercase text-blue-600 dark:text-blue-400 tracking-wider">تفاصيل الرحلة</span>
                  <div className="mt-4 flex items-center justify-between">
                    <div>
                      <h4 className="text-xl font-black text-slate-900 dark:text-white">{flightDetails.flight.origin}</h4>
                      <p className="text-[10px] font-bold text-slate-400">مطار الإقلاع</p>
                    </div>
                    <div className="flex flex-col items-center">
                      <Plane size={16} className="text-blue-500 rotate-45 animate-bounce" />
                      <div className="h-0.5 w-16 bg-slate-200 dark:bg-slate-700 mt-2" />
                    </div>
                    <div className="text-left">
                      <h4 className="text-xl font-black text-slate-900 dark:text-white">{flightDetails.flight.destination}</h4>
                      <p className="text-[10px] font-bold text-slate-400">مطار الوصول</p>
                    </div>
                  </div>

                  <div className="mt-6 space-y-3 pt-6 border-t border-slate-200/60 dark:border-slate-800/80 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-bold">رقم الرحلة:</span>
                      <span className="font-black text-slate-800 dark:text-slate-200">{flightDetails.flight.flightNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-bold">نوع الطائرة:</span>
                      <span className="font-black text-slate-800 dark:text-slate-200">{flightDetails.flight.aircraftType || 'Airbus A320'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-bold">وقت الإقلاع:</span>
                      <span className="font-black text-slate-800 dark:text-slate-200">
                        {new Date(flightDetails.flight.departureTime).toLocaleString('ar-YE', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' })}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-bold">وقت الوصول:</span>
                      <span className="font-black text-slate-800 dark:text-slate-200">
                        {new Date(flightDetails.flight.arrivalTime).toLocaleString('ar-YE', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* بطاقات السعة والإشغال */}
                <div className="space-y-3">
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">سعة وإشغال الدرجات</span>
                  
                  {/* درجة رجال الأعمال */}
                  <div className="rounded-xl border border-slate-200/80 dark:border-slate-800 p-4 bg-white dark:bg-slate-900 flex justify-between items-center shadow-sm">
                    <div>
                      <h5 className="text-xs font-black text-amber-500">درجة الأعمال (Business)</h5>
                      <p className="text-[10px] font-bold text-slate-400 mt-1">السعة: {flightDetails.stats.business.total} مقعد</p>
                    </div>
                    <div className="text-left">
                      <span className="text-sm font-black text-slate-800 dark:text-slate-200">{flightDetails.stats.business.occupied}</span>
                      <span className="text-slate-400 text-xs font-bold"> محجوز</span>
                      <span className="block text-[9px] font-black text-emerald-500 mt-0.5">{flightDetails.stats.business.vacant} شاغر</span>
                    </div>
                  </div>

                  {/* الدرجة السياحية */}
                  <div className="rounded-xl border border-slate-200/80 dark:border-slate-800 p-4 bg-white dark:bg-slate-900 flex justify-between items-center shadow-sm">
                    <div>
                      <h5 className="text-xs font-black text-blue-500">الدرجة السياحية (Economy)</h5>
                      <p className="text-[10px] font-bold text-slate-400 mt-1">السعة: {flightDetails.stats.economy.total} مقعد</p>
                    </div>
                    <div className="text-left">
                      <span className="text-sm font-black text-slate-800 dark:text-slate-200">{flightDetails.stats.economy.occupied}</span>
                      <span className="text-slate-400 text-xs font-bold"> محجوز</span>
                      <span className="block text-[9px] font-black text-emerald-500 mt-0.5">{flightDetails.stats.economy.vacant} شاغر</span>
                    </div>
                  </div>

                  {/* الدرجة الأولى (إذا كانت موجودة) */}
                  {flightDetails.stats.first.total > 0 && (
                    <div className="rounded-xl border border-slate-200/80 dark:border-slate-800 p-4 bg-white dark:bg-slate-900 flex justify-between items-center shadow-sm">
                      <div>
                        <h5 className="text-xs font-black text-purple-500">الدرجة الأولى (First)</h5>
                        <p className="text-[10px] font-bold text-slate-400 mt-1">السعة: {flightDetails.stats.first.total} مقعد</p>
                      </div>
                      <div className="text-left">
                        <span className="text-sm font-black text-slate-800 dark:text-slate-200">{flightDetails.stats.first.occupied}</span>
                        <span className="text-slate-400 text-xs font-bold"> محجوز</span>
                        <span className="block text-[9px] font-black text-emerald-500 mt-0.5">{flightDetails.stats.first.vacant} شاغر</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* دليل الألوان */}
                <div className="rounded-xl border border-slate-200/80 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-slate-900/30 text-xs space-y-2.5">
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block mb-1">دليل خريطة المقاعد</span>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400"><Armchair size={10} /></div>
                    <span className="font-bold text-slate-500">مقعد شاغر (متاح)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-gradient-to-br from-amber-500 to-orange-600 text-white flex items-center justify-center"><Armchair size={10} /></div>
                    <span className="font-bold text-slate-500">درجة الأعمال (محجوز) - انقر للتفاصيل</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center"><Armchair size={10} /></div>
                    <span className="font-bold text-slate-500">الدرجة السياحية (محجوز) - انقر للتفاصيل</span>
                  </div>
                  {flightDetails.stats.first.total > 0 && (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded bg-gradient-to-br from-purple-500 to-indigo-600 text-white flex items-center justify-center"><Armchair size={10} /></div>
                      <span className="font-bold text-slate-500">الدرجة الأولى (محجوز) - انقر للتفاصيل</span>
                    </div>
                  )}
                </div>
              </div>

              {/* مخطط الطائرة */}
              <div className="lg:col-span-2 flex flex-col items-center">
                <div className="relative w-full max-w-[420px] bg-slate-50 dark:bg-slate-900/40 rounded-3xl p-6 border border-slate-100 dark:border-slate-800/60 shadow-inner overflow-hidden">
                  
                  {/* Cockpit Visual */}
                  <div className="w-full flex flex-col items-center mb-8 border-b border-dashed border-slate-200 dark:border-slate-800 pb-6">
                    <div className="w-24 h-12 bg-slate-200 dark:bg-slate-800 rounded-t-full flex items-center justify-center relative shadow-sm border border-slate-300/50 dark:border-slate-700/50">
                      <div className="absolute bottom-2 flex gap-1">
                        <div className="w-4 h-2 bg-slate-800 dark:bg-slate-950 rounded-tl-full" />
                        <div className="w-4 h-2 bg-slate-800 dark:bg-slate-950 rounded-tr-full" />
                      </div>
                    </div>
                    <span className="text-[9px] font-black text-slate-400 tracking-[6px] uppercase mt-3">قمرة القيادة</span>
                  </div>

                  {/* Business Class section header */}
                  <div className="flex flex-col items-center gap-1 mb-4">
                    <div className="h-0.5 w-16 bg-amber-200 dark:bg-amber-900/50 rounded-full" />
                    <span className="text-[9px] font-black text-amber-500 uppercase tracking-[3px]">درجة رجال الأعمال</span>
                  </div>

                  {/* Business seats rows */}
                  <div className="space-y-3 mb-8">
                    {BUSINESS_ROWS.map(rowNum => {
                      const leftCols = ['A', 'B'];
                      const rightCols = ['E', 'F'];
                      return (
                        <div key={rowNum} className="flex items-center justify-between px-4">
                          <div className="flex gap-2.5">
                            {leftCols.map(col => renderSeat(rowNum, col))}
                          </div>
                          
                          <div className="w-10 h-9 rounded-xl flex items-center justify-center bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-800 text-[10px] font-black text-slate-400 shadow-sm">
                            {rowNum}
                          </div>

                          <div className="flex gap-2.5">
                            {rightCols.map(col => renderSeat(rowNum, col))}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Emergency exits */}
                  <div className="py-3 flex items-center justify-center bg-rose-500/10 dark:bg-rose-500/5 border-y border-rose-500/20 dark:border-rose-950/20 rounded-xl mb-6 relative">
                    <span className="text-[9px] font-black text-rose-600 dark:text-rose-400 tracking-wider">مخرج طوارئ للطائرة</span>
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-rose-500" />
                    <div className="absolute right-0 top-0 bottom-0 w-1 bg-rose-500" />
                  </div>

                  {/* Economy class section header */}
                  <div className="flex flex-col items-center gap-1 mb-4">
                    <div className="h-0.5 w-16 bg-blue-100 dark:bg-blue-900/50 rounded-full" />
                    <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[3px]">الدرجة السياحية</span>
                  </div>

                  {/* Economy seats rows */}
                  <div className="space-y-3">
                    {ECONOMY_ROWS.map(rowNum => {
                      const leftCols = ['A', 'B', 'C'];
                      const rightCols = ['D', 'E', 'F'];
                      const isExitRow = EXIT_ROWS.includes(rowNum);
                      return (
                        <div key={rowNum} className={`flex items-center justify-between px-2 ${isExitRow ? 'bg-emerald-500/5 rounded-lg py-1 border border-dashed border-emerald-500/10' : ''}`}>
                          <div className="flex gap-1.5">
                            {leftCols.map(col => renderSeat(rowNum, col))}
                          </div>

                          <div className="w-8 h-9 rounded-xl flex items-center justify-center bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-800 text-[10px] font-black text-slate-400 shadow-sm">
                            {rowNum}
                          </div>

                          <div className="flex gap-1.5">
                            {rightCols.map(col => renderSeat(rowNum, col))}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Rear Galley / Toilet area */}
                  <div className="mt-8 border-t border-dashed border-slate-200 dark:border-slate-800 pt-6 flex justify-around text-[9px] font-black text-slate-400 uppercase tracking-widest">
                    <span>مطبخ خلفي</span>
                    <span>دورة مياه</span>
                  </div>

                </div>
              </div>

            </div>
          )}
        </div>

      </main>
    </div>
  );
}
