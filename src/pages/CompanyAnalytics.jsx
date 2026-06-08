import React from 'react';
import { useAuth } from '../utils/AuthContext';
import Sidebar from '../components/Sidebar';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  AreaChart, Area, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import {
  TrendingUp,
  DollarSign,
  Ticket,
  Users,
  BarChart3,
  MapPin,
  Calendar,
  Activity
} from 'lucide-react';

export default function CompanyAnalytics() {
  const { user, bookings } = useAuth();

  // تصفية الحجوزات لتتبع شركة الطيران الحالية فقط
  const airlineCode = user.airline_id === 1 ? 'IY' : user.airline_id === 2 ? 'BS' : 'QY';
  
  const companyBookings = bookings.filter(b => 
    b.flight_number.startsWith(airlineCode) && b.status !== 'cancelled'
  );

  // 1. حساب مؤشرات الأداء (KPIs) ديناميكياً
  const totalBookings = companyBookings.length;
  const totalRevenue = companyBookings.reduce((sum, b) => sum + b.totalPrice, 0);
  const totalPassengers = companyBookings.reduce((sum, b) => sum + (b.passengers ? b.passengers.length : 0), 0);
  const averageTicketPrice = totalPassengers > 0 ? Math.round(totalRevenue / totalPassengers) : 0;

  // 2. معالجة بيانات "الوجهات الأكثر طلباً" ديناميكياً
  const destCounts = {};
  companyBookings.forEach(b => {
    const dest = b.destination;
    const paxCount = b.passengers ? b.passengers.length : 0;
    destCounts[dest] = (destCounts[dest] || 0) + paxCount;
  });

  // خريطة أسماء المدن العربية
  const cityNames = {
    CAI: 'القاهرة',
    JED: 'جدة',
    RUH: 'الرياض',
    KWI: 'الكويت',
    AMM: 'عمان',
    ADE: 'عدن',
    RIY: 'المكلا',
    GXF: 'سيئون'
  };

  const destinationsData = Object.keys(destCounts).map(code => ({
    name: cityNames[code] || code,
    passengers: destCounts[code]
  })).sort((a, b) => b.passengers - a.passengers);

  // 3. معالجة الإيرادات الكلية حسب اليوم لآخر أسبوع
  const daysOfWeek = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
  const dailyRev = {};
  
  // تهيئة الأيام بقيم صفرية لكي لا يظهر المخطط فارغاً
  daysOfWeek.forEach(day => {
    dailyRev[day] = 0;
  });

  // إضافة قيم الحجوزات الفعلية
  companyBookings.forEach(b => {
    const dayName = new Date(b.created_at).toLocaleDateString('ar-EG', { weekday: 'long' });
    if (dailyRev[dayName] !== undefined) {
      dailyRev[dayName] += b.totalPrice;
    } else {
      dailyRev[dayName] = b.totalPrice;
    }
  });

  const revenueTrendData = Object.keys(dailyRev).map(day => ({
    day,
    revenue: dailyRev[day]
  }));

  // 4. توزيع درجات السفر للمسافرين
  let businessCount = 0;
  let economyCount = 0;
  companyBookings.forEach(b => {
    if (b.passengers) {
      b.passengers.forEach(p => {
        if (p.travel_class === 'Business') businessCount++;
        else economyCount++;
      });
    }
  });

  const classDistributionData = [
    { name: 'درجة الأعمال', value: businessCount || 2, color: '#f59e0b' },
    { name: 'الدرجة السياحية', value: economyCount || 5, color: '#3b82f6' }
  ];

  return (
    <div className="flex min-h-screen bg-[#f8f9fc] dark:bg-[#0b1120] text-slate-900 dark:text-white transition-colors duration-300 relative overflow-hidden" dir="rtl">
      {/* ─── Aesthetic Mesh Decor ────────────────────────────── */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] h-[800px] w-[800px] rounded-full bg-blue-500/5 blur-[150px]" />
        <div className="absolute bottom-[-20%] right-[-10%] h-[800px] w-[800px] rounded-full bg-purple-500/5 blur-[150px]" />
      </div>

      {/* القائمة الجانبية */}
      <Sidebar />

      {/* المحتوى الرئيسي */}
      <main className="flex-1 mr-72 p-10 relative z-10 min-h-screen">
        
        {/* العناوين والترحيب */}
        <div className="mb-10">
          <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 px-3 py-1 rounded-full uppercase tracking-wider mb-2 inline-block">
            التحليلات ومخططات الأداء
          </span>
          <h1 className="text-3xl font-black tracking-tight">الإحصائيات والتحليلات البيانية</h1>
          <p className="text-slate-400 dark:text-slate-500 text-xs font-bold mt-1">
            متابعة فورية للمبيعات وحجوزات المسافرين وتوزيع وجهات السفر لرحلات {user.airline_name}.
          </p>
        </div>

        {/* 1. بطاقات الأداء (KPI Cards) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {/* إجمالي الإيرادات */}
          <div className="group relative overflow-hidden rounded-[32px] bg-white dark:bg-slate-900 p-6 shadow-sm border border-slate-200/40 dark:border-slate-800/40 backdrop-blur-xl transition-all hover:shadow-xl hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <DollarSign size={22} />
              </div>
              <span className="text-[10px] font-black text-green-500 bg-green-500/10 px-2 py-0.5 rounded-full">+18.5%</span>
            </div>
            <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase mb-1">إجمالي إيرادات المبيعات</p>
            <h3 className="text-2xl font-black tracking-tight">${totalRevenue.toLocaleString()}</h3>
          </div>

          {/* إجمالي الحجوزات */}
          <div className="group relative overflow-hidden rounded-[32px] bg-white dark:bg-slate-900 p-6 shadow-sm border border-slate-200/40 dark:border-slate-800/40 backdrop-blur-xl transition-all hover:shadow-xl hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                <Ticket size={22} />
              </div>
              <span className="text-[10px] font-black text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded-full">+8.2%</span>
            </div>
            <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase mb-1">عدد الحجوزات المؤكدة</p>
            <h3 className="text-2xl font-black tracking-tight">{totalBookings} حجز</h3>
          </div>

          {/* عدد المسافرين */}
          <div className="group relative overflow-hidden rounded-[32px] bg-white dark:bg-slate-900 p-6 shadow-sm border border-slate-200/40 dark:border-slate-800/40 backdrop-blur-xl transition-all hover:shadow-xl hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
                <Users size={22} />
              </div>
              <span className="text-[10px] font-black text-purple-500 bg-purple-500/10 px-2 py-0.5 rounded-full">+14.2%</span>
            </div>
            <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase mb-1">إجمالي ركاب الرحلات</p>
            <h3 className="text-2xl font-black tracking-tight">{totalPassengers} مسافر</h3>
          </div>

          {/* متوسط سعر التذكرة */}
          <div className="group relative overflow-hidden rounded-[32px] bg-white dark:bg-slate-900 p-6 shadow-sm border border-slate-200/40 dark:border-slate-800/40 backdrop-blur-xl transition-all hover:shadow-xl hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <Activity size={22} />
              </div>
              <span className="text-[10px] font-black text-slate-400 dark:text-slate-500">معدل ثابت</span>
            </div>
            <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase mb-1">متوسط قيمة التذكرة</p>
            <h3 className="text-2xl font-black tracking-tight">${averageTicketPrice}</h3>
          </div>
        </div>

        {/* 2. المخططات البيانية (Charts Grid) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
          
          {/* مخطط الإيرادات الأسبوعية */}
          <div className="group rounded-[40px] border border-slate-200/60 dark:border-slate-800/60 bg-white/80 dark:bg-slate-900/80 p-8 shadow-sm hover:shadow-xl transition-all backdrop-blur-xl">
            <h3 className="flex items-center gap-3 text-lg font-black mb-8">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">
                <Calendar size={18} />
              </div>
              معدل إيرادات الشركة الأسبوعي
            </h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueTrendData}>
                  <defs>
                    <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" opacity={0.5} />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 900, fill: '#94a3b8' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 900, fill: '#94a3b8' }} />
                  <Tooltip />
                  <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={4} fill="url(#revenueGrad)" name="الإيرادات ($)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* مخطط الوجهات الأكثر طلباً */}
          <div className="group rounded-[40px] border border-slate-200/60 dark:border-slate-800/60 bg-white/80 dark:bg-slate-900/80 p-8 shadow-sm hover:shadow-xl transition-all backdrop-blur-xl">
            <h3 className="flex items-center gap-3 text-lg font-black mb-8">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500">
                <MapPin size={18} />
              </div>
              أكثر الوجهات طلباً (حسب عدد الركاب)
            </h3>
            <div className="h-[300px] w-full">
              {destinationsData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={destinationsData}>
                    <defs>
                      <linearGradient id="barBlue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3b82f6" stopOpacity={1} />
                        <stop offset="100%" stopColor="#1e3a8a" stopOpacity={0.8} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" opacity={0.5} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 900, fill: '#94a3b8' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 900, fill: '#94a3b8' }} />
                    <Tooltip />
                    <Bar dataKey="passengers" fill="url(#barBlue)" radius={[10, 10, 0, 0]} barSize={40} name="المسافرين" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-slate-400 font-bold">
                  لا توجد حجوزات نشطة كافية حالياً
                </div>
              )}
            </div>
          </div>

          {/* مخطط دائري لتوزيع فئات درجات السفر */}
          <div className="group rounded-[40px] border border-slate-200/60 dark:border-slate-800/60 bg-white/80 dark:bg-slate-900/80 p-8 shadow-sm hover:shadow-xl transition-all backdrop-blur-xl lg:col-span-2">
            <h3 className="flex items-center gap-3 text-lg font-black mb-8">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-500">
                <BarChart3 size={18} />
              </div>
              توزيع فئات درجات سفر الركاب
            </h3>
            <div className="flex flex-col md:flex-row items-center justify-around gap-6">
              <div className="h-[260px] w-64 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={classDistributionData}
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={95}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                    >
                      {classDistributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-[10px] font-black text-slate-400 uppercase">الركاب</span>
                  <span className="text-3xl font-black text-slate-900 dark:text-white mt-0.5">{totalPassengers}</span>
                </div>
              </div>

              <div className="space-y-4 w-60">
                {classDistributionData.map(item => (
                  <div key={item.name} className="flex items-center justify-between border-b border-slate-50 dark:border-slate-800/40 pb-2">
                    <div className="flex items-center gap-2">
                      <div className="h-3.5 w-3.5 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-xs font-black text-slate-700 dark:text-slate-300">{item.name}</span>
                    </div>
                    <span className="text-xs font-black">{item.value} مسافر</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>

      </main>
    </div>
  );
}
