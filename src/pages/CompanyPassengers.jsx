import React, { useState } from 'react';
import { useAuth } from '../utils/AuthContext';
import Sidebar from '../components/Sidebar';
import {
  Users,
  Search,
  Accessibility,
  Wind,
  HeartPulse,
  Plane,
  ShieldCheck,
  ClipboardList
} from 'lucide-react';

const serviceConfig = {
  wheelchair: { label: 'كرسي متحرك', icon: Accessibility, bg: 'bg-blue-500/10 text-blue-600 border border-blue-500/20' },
  oxygen: { label: 'أكسجين طبي', icon: Wind, bg: 'bg-sky-500/10 text-sky-600 border border-sky-500/20' },
  medical: { label: 'مرافق طبي', icon: HeartPulse, bg: 'bg-red-500/10 text-red-600 border border-red-500/20' },
  medmeal: { label: 'سيارة إسعاف', icon: HeartPulse, bg: 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' },
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
    <div className="min-h-screen bg-[#f8faff] dark:bg-[#080d19] text-slate-900 dark:text-slate-100 transition-colors duration-300 relative overflow-hidden" dir="rtl">
      <Sidebar />
      
      {/* ─── Aesthetic Mesh Decor ────────────────────────────── */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] h-[600px] w-[600px] rounded-full bg-blue-500/5 dark:bg-blue-500/10 blur-[120px] transition-all" />
        <div className="absolute bottom-[-10%] right-[-10%] h-[600px] w-[600px] rounded-full bg-indigo-500/5 dark:bg-indigo-500/10 blur-[120px] transition-all" />
      </div>

      {/* المحتوى الرئيسي */}
      <main className="relative z-10 mx-auto max-w-7xl px-6 py-10 md:mr-72 animate-in fade-in slide-in-from-bottom-8 duration-1000">

        {/* العناوين والترحيب */}
        <div className="mb-10">
          <h1 className="text-3xl font-black tracking-tight mb-2">قائمة ركاب الرحلات</h1>
          <p className="text-slate-500 dark:text-slate-400 font-bold text-sm">
            عرض وتتبع جميع المسافرين الحاجزين على رحلات {user.airline_name || 'الشركة'} ومتابعة احتياجات الرعاية الطبية الخاصة بهم.
          </p>
        </div>

        {/* الجدول المتجاوب للركاب */}
        <div className="rounded-3xl bg-white dark:bg-slate-900/40 border border-slate-150/70 dark:border-slate-800/40 shadow-sm backdrop-blur-md overflow-hidden p-6">
          {/* رأس الجدول والبحث المدمج */}
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/10">
                <Users size={18} />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">ركاب الرحلات</h3>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full sm:w-auto">
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/30 px-3 py-2 rounded-xl border border-slate-150/50 dark:border-slate-850 text-xs font-bold">
                <ClipboardList className="text-blue-550" size={14} />
                <span>إجمالي ركاب الشركة: {passengersList.length}</span>
              </div>
              
              <div className="relative w-full sm:w-auto">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                <input 
                  type="text" 
                  placeholder="البحث بالاسم، الجواز أو رقم الرحلة..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-slate-50 dark:bg-slate-800/50 border border-slate-150 dark:border-slate-800 rounded-xl py-2 pr-10 pl-4 text-xs font-bold outline-none focus:border-blue-500 dark:focus:border-blue-400 dark:text-white transition-all w-full sm:w-64" 
                />
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="border-b border-slate-200/50 dark:border-slate-800/50 text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-wider">
                  <th className="pb-3 px-4 font-black">اسم المسافر</th>
                  <th className="pb-3 px-4 font-black">رقم الجواز</th>
                  <th className="pb-3 px-4 font-black">رقم الرحلة</th>
                  <th className="pb-3 px-4 font-black">المقعد</th>
                  <th className="pb-3 px-4 font-black">الدرجة</th>
                  <th className="pb-3 px-4 font-black">الرعاية والخدمات الخاصة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/50 dark:divide-slate-800/30 text-xs font-bold text-slate-700 dark:text-slate-300">
                {filteredPassengers.map((p) => (
                  <tr key={p.id} className="group hover:bg-slate-50/40 dark:hover:bg-slate-850/10 transition-colors">
                    <td className="py-5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-blue-500/10 to-indigo-500/10 dark:from-blue-900/20 dark:to-indigo-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400 font-black text-sm">
                          {p.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-black text-slate-900 dark:text-white text-xs">{p.name}</p>
                          <p className="text-[10px] font-bold text-slate-450 dark:text-slate-500">مرجع الحجز: {p.booking_ref}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-5 px-4 font-bold text-xs text-slate-655 dark:text-slate-455 font-mono">{p.passport_number}</td>
                    <td className="py-5 px-4">
                      <span className="font-extrabold text-xs text-blue-600 dark:text-blue-400 bg-blue-500/5 dark:bg-blue-500/15 px-2.5 py-1 rounded-lg border border-blue-500/15 font-mono tracking-wide">{p.flight_number}</span>
                    </td>
                    <td className="py-5 px-4 font-black text-xs tracking-wider font-mono uppercase">{p.seat}</td>
                    <td className="py-5 px-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-black ${p.travel_class === 'Business'
                          ? 'bg-amber-500/5 text-amber-600 border border-amber-500/10'
                          : 'bg-slate-100 dark:bg-slate-800/60 text-slate-650 dark:text-slate-350'
                        }`}>
                        {p.travel_class === 'Business' ? 'درجة الأعمال' : 'السياحية'}
                      </span>
                    </td>
                    <td className="py-5 px-4">
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
                          <span className="text-[10px] text-slate-450 dark:text-slate-550 font-bold italic">لا توجد خدمات خاصة</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredPassengers.length === 0 && (
                  <tr>
                    <td colSpan="6" className="py-20 text-center text-slate-400 font-bold text-xs">
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
