import React, { useState } from 'react';
import { useAuth } from '../utils/AuthContext';
import Sidebar from '../components/Sidebar';
import {
  Users,
  Search,
  Accessibility,
  Wind,
  HeartPulse,
  Salad,
  Plane,
  ShieldCheck,
  ClipboardList
} from 'lucide-react';

const serviceConfig = {
  wheelchair: { label: 'كرسي متحرك', icon: Accessibility, bg: 'bg-blue-500/10 text-blue-600 border border-blue-500/20' },
  oxygen: { label: 'أكسجين طبي', icon: Wind, bg: 'bg-sky-500/10 text-sky-600 border border-sky-500/20' },
  medical: { label: 'مرافق طبي', icon: HeartPulse, bg: 'bg-red-500/10 text-red-600 border border-red-500/20' },
  medmeal: { label: 'وجبة طبية', icon: Salad, bg: 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' },
};

export default function CompanyPassengers() {
  const { user, bookings } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');

  // 1. تصفية الحجوزات بحيث تتبع شركة الطيران الحالية فقط (مثل رحلات IY- لشركة Yemenia)
  const airlineCode = localStorage.getItem('airlineCode') || (user.airline_id === 1 ? 'IY' : user.airline_id === 2 ? 'BS' : 'FA');
  
  const companyBookings = bookings.filter(b => 
    b.flight_number.startsWith(airlineCode) && b.status !== 'cancelled'
  );

  // 2. تجميع قائمة الركاب وتنسيقها للعرض
  const passengersList = [];
  companyBookings.forEach(booking => {
    if (booking.passengers && Array.isArray(booking.passengers)) {
      booking.passengers.forEach(p => {
        passengersList.push({
          id: `${booking.id}-${p.passport_number}`,
          name: p.name,
          passport_number: p.passport_number,
          seat: p.seat || '14A',
          travel_class: p.travel_class || 'Economy',
          flight_number: booking.flight_number,
          services: p.services || [],
          booking_ref: booking.id
        });
      });
    }
  });

  // 3. تصفية قائمة الركاب بناءً على كلمة البحث (الاسم أو رقم الجواز أو رقم الرحلة)
  const filteredPassengers = passengersList.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.passport_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.flight_number.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
            إدارة بيانات المسافرين
          </span>
          <h1 className="text-3xl font-black tracking-tight">قائمة ركاب الرحلات</h1>
          <p className="text-slate-400 dark:text-slate-500 text-xs font-bold mt-1">
            عرض وتتبع جميع المسافرين الحاجزين على رحلات {user.airline_name} ومتابعة احتياجات الرعاية الطبية الخاصة بهم.
          </p>
        </div>

        {/* شريط أدوات البحث والإحصائيات */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="البحث بالاسم، رقم الجواز أو رقم الرحلة..."
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl py-3.5 pr-12 pl-4 text-xs font-bold outline-none focus:border-blue-500 transition-all shadow-sm"
            />
          </div>

          <div className="flex items-center gap-3 bg-white dark:bg-slate-900 px-5 py-3 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 shadow-sm">
            <ClipboardList className="text-blue-500" size={18} />
            <span className="text-xs font-black">إجمالي ركاب الشركة: {passengersList.length}</span>
          </div>
        </div>

        {/* الجدول المتجاوب للركاب */}
        <div className="rounded-[40px] border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 p-8 shadow-sm backdrop-blur-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800">
                  <th className="pb-6 text-xs font-black text-slate-400 uppercase tracking-widest px-4">اسم المسافر</th>
                  <th className="pb-6 text-xs font-black text-slate-400 uppercase tracking-widest px-4">رقم الجواز</th>
                  <th className="pb-6 text-xs font-black text-slate-400 uppercase tracking-widest px-4">رقم الرحلة</th>
                  <th className="pb-6 text-xs font-black text-slate-400 uppercase tracking-widest px-4">المقعد</th>
                  <th className="pb-6 text-xs font-black text-slate-400 uppercase tracking-widest px-4">الدرجة</th>
                  <th className="pb-6 text-xs font-black text-slate-400 uppercase tracking-widest px-4">الرعاية والخدمات الخاصة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                {filteredPassengers.map((p) => (
                  <tr key={p.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="py-6 px-4">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-blue-500/10 to-indigo-500/10 dark:from-blue-900/20 dark:to-indigo-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400 font-black text-xs">
                          {p.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-black text-slate-900 dark:text-white text-xs">{p.name}</p>
                          <p className="text-[10px] font-bold text-slate-400">مرجع الحجز: {p.booking_ref}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-6 px-4 font-bold text-xs text-slate-600 dark:text-slate-400">{p.passport_number}</td>
                    <td className="py-6 px-4 font-black text-xs text-blue-600">{p.flight_number}</td>
                    <td className="py-6 px-4 font-black text-xs tracking-wider">{p.seat}</td>
                    <td className="py-6 px-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-black ${
                        p.travel_class === 'Business'
                          ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                      }`}>
                        {p.travel_class === 'Business' ? 'درجة الأعمال' : 'السياحية'}
                      </span>
                    </td>
                    <td className="py-6 px-4">
                      <div className="flex flex-wrap gap-1.5">
                        {p.services && p.services.length > 0 ? (
                          p.services.map(srvId => {
                            const srv = serviceConfig[srvId];
                            if (!srv) return null;
                            const Icon = srv.icon;
                            return (
                              <span
                                key={srvId}
                                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-black ${srv.bg}`}
                                title={srv.label}
                              >
                                <Icon size={12} />
                                {srv.label}
                              </span>
                            );
                          })
                        ) : (
                          <span className="text-[10px] text-slate-400 dark:text-slate-600 font-bold italic">لا توجد خدمات خاصة</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredPassengers.length === 0 && (
                  <tr>
                    <td colSpan="6" className="py-20 text-center text-slate-400 font-bold">
                      لا يوجد ركاب مطابقين للبحث حالياً
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
