import React, { useState, useEffect } from 'react';
import { useAuth } from '../utils/AuthContext';
import Sidebar from '../components/Sidebar';
import {
  Bell,
  Check,
  X,
  Eye,
  FileText,
  AlertCircle,
  Clock,
  Calendar,
  CreditCard,
  User,
  RefreshCw,
  Search,
  ExternalLink
} from 'lucide-react';
import logo from '../assets/logo.png';

export default function Notifications() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  
  const airlineId = localStorage.getItem('companyId') || user?.airline_id || '';

  const getCompanyLogo = () => {
    if (!user || user.role === 'super_admin') {
      return logo;
    }
    return user.logo_url || (user.airline_id === 1 ? '/logos/yemenia.png' : user.airline_id === 2 ? '/logos/bilqis.png' : '/logos/flyaden.png');
  };

  const fetchPendingBookings = async () => {
    if (!airlineId) return;
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:8080/api/bookings/pending?airline_id=${airlineId}`);
      const data = await response.json();
      if (data.success) {
        setBookings(data.bookings || []);
      } else {
        console.error('Failed to fetch pending bookings:', data.error);
      }
    } catch (error) {
      console.error('Error fetching pending bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingBookings();
  }, [airlineId]);

  const handleUpdateStatus = async (bookingId, status, paymentStatus) => {
    setActionLoading(bookingId);
    try {
      const response = await fetch(`http://localhost:8080/api/admin/bookings/${bookingId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status,
          payment_status: paymentStatus
        })
      });
      const data = await response.json();
      if (data.success) {
        
        setBookings(prev => prev.filter(b => b.id_bookings !== bookingId));
      } else {
        alert('حدث خطأ أثناء تحديث حالة الحجز: ' + data.error);
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('فشل الاتصال بالخادم لتحديث حالة الحجز.');
    } finally {
      setActionLoading(null);
    }
  };

  
  const filteredBookings = bookings.filter(b =>
    b.booking_reference.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (b.passengers && b.passengers.toLowerCase().includes(searchQuery.toLowerCase())) ||
    b.flight_number.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#f8faff] dark:bg-[#080d19] text-slate-900 dark:text-slate-100 transition-colors duration-300 relative overflow-hidden" dir="rtl">
      <Sidebar />
      
      {}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] h-[600px] w-[600px] rounded-full bg-blue-500/5 dark:bg-blue-500/10 blur-[120px] transition-all" />
        <div className="absolute bottom-[-10%] right-[-10%] h-[600px] w-[600px] rounded-full bg-indigo-500/5 dark:bg-indigo-500/10 blur-[120px] transition-all" />
      </div>

      {}
      <main className="relative z-10 mx-auto max-w-7xl px-6 py-10 md:mr-72 animate-in fade-in slide-in-from-bottom-8 duration-1000">

        {}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-3 mb-2">
              <Bell className="text-blue-650 dark:text-blue-400" size={32} />
              طلبات الحجز والمعالجة
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-bold mt-1">
              مراجعة وتأكيد الحجوزات والتحقق من سندات دفع ركاب شركة {user?.airline_name || 'الشركة'}
            </p>
          </div>

          <div className="flex items-center gap-3 bg-white dark:bg-slate-900/40 border border-slate-150/70 dark:border-slate-800/40 px-4 py-2 rounded-2xl shadow-sm backdrop-blur-md">
            <span className="text-xs font-black tracking-widest text-slate-700 dark:text-slate-350 uppercase">
              طلبات معلقة ({bookings.length})
            </span>
          </div>
        </div>

        {}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative w-full sm:w-auto">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input 
              type="text" 
              placeholder="البحث برقم المرجع، الرحلة أو الراكب..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-50 dark:bg-slate-800/50 border border-slate-150 dark:border-slate-800 rounded-xl py-2 pr-10 pl-4 text-xs font-bold outline-none focus:border-blue-500 dark:focus:border-blue-400 dark:text-white transition-all w-full sm:w-80" 
            />
          </div>

          <button
            onClick={fetchPendingBookings}
            className="flex h-10 items-center justify-center gap-2 px-4 bg-white dark:bg-slate-900/40 border border-slate-150/70 dark:border-slate-800/40 text-slate-750 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 rounded-xl text-xs font-bold transition-all shadow-sm backdrop-blur-md"
          >
            <RefreshCw size={14} className={`${loading ? 'animate-spin' : ''}`} />
            تحديث الطلبات
          </button>
        </div>

        {}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 dark:border-blue-400"></div>
            <span className="text-slate-500 dark:text-slate-400 text-sm font-bold mt-4">جاري استرجاع طلبات الحجز المعلقة...</span>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-900/40 border border-slate-150/70 dark:border-slate-800/40 rounded-3xl p-8 text-center shadow-sm backdrop-blur-md">
            <div className="h-16 w-16 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mb-4">
              <Bell size={32} />
            </div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-1">
              {searchQuery ? 'لا توجد نتائج مطابقة لعملية البحث' : 'لا توجد طلبات حجز معلقة حالياً'}
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-xs font-bold max-w-sm">
              {searchQuery ? 'يرجى التأكد من كتابة البيانات بشكل صحيح أو استخدام كلمات بحثية أخرى' : 'سيتم عرض أي حجوزات جديدة تتطلب موافقتك هنا بمجرد إنشائها من قبل المسافرين.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {filteredBookings.map((booking) => (
              <div
                key={booking.id_bookings}
                className="group relative overflow-hidden rounded-3xl bg-white dark:bg-slate-900/40 border border-slate-150/70 dark:border-slate-800/40 p-6 shadow-sm backdrop-blur-md transition-all duration-300 hover:shadow-md"
              >
                {}
                <div className="absolute top-0 right-0 bottom-0 w-1.5 bg-yellow-500"></div>

                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pr-4">
                  {}
                  <div className="space-y-3 flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="text-lg font-black text-slate-800 dark:text-white">
                        مرجع الحجز (PNR):
                        <span className="text-blue-600 dark:text-blue-400 mr-1 select-all uppercase tracking-widest">
                          {booking.booking_reference}
                        </span>
                      </span>
                      <span className="bg-yellow-50 dark:bg-yellow-950/30 text-yellow-700 dark:text-yellow-400 text-[10px] font-black px-2.5 py-1 rounded-full flex items-center gap-1">
                        <Clock size={12} />
                        بانتظار المراجعة
                      </span>
                      <span className="text-slate-400 dark:text-slate-500 text-xs font-bold flex items-center gap-1">
                        <Calendar size={12} />
                        {new Date(booking.booking_date).toLocaleString('ar-YE', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    {}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50/50 dark:bg-slate-950/20 p-4 rounded-2xl border border-slate-150/50 dark:border-slate-850">
                      <div>
                        <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 block mb-0.5 uppercase">رقم الرحلة</span>
                        <span className="text-sm font-black text-slate-800 dark:text-slate-200 uppercase">{booking.flight_number} (طيران {booking.airline_code})</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 block mb-0.5 uppercase">المسار (من - إلى)</span>
                        <span className="text-sm font-black text-slate-800 dark:text-slate-200">{booking.airportOrigin_code} ➔ {booking.airportDestination_code}</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 block mb-0.5 uppercase">موعد الإقلاع</span>
                        <span className="text-xs font-black text-slate-800 dark:text-slate-200">
                          {new Date(booking.departure_time).toLocaleString('ar-YE', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>

                    {}
                    <div className="flex items-start gap-2 text-xs">
                      <User size={16} className="text-slate-400 dark:text-slate-500 mt-0.5" />
                      <div>
                        <span className="font-extrabold text-slate-500 dark:text-slate-400">الركاب ({booking.total_passengers}): </span>
                        <span className="font-black text-slate-800 dark:text-slate-200">{booking.passengers || 'لا يوجد ركاب'}</span>
                      </div>
                    </div>
                  </div>

                  {}
                  <div className="flex flex-col sm:flex-row lg:flex-col items-stretch sm:items-center lg:items-end justify-between lg:justify-center gap-4 lg:min-w-[240px] border-t lg:border-t-0 lg:border-r border-slate-150/50 dark:border-slate-850 pt-4 lg:pt-0 lg:pr-6">
                    <div className="space-y-1 text-right lg:text-left">
                      <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 block uppercase">طريقة الدفع والمبلغ</span>
                      <div className="flex items-center gap-2 justify-end">
                        <span className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-[10px] font-black px-2 py-0.5 rounded uppercase">
                          {booking.payment_method === 'bank_transfer' ? 'تحويل بنكي / نقدي' : booking.payment_method}
                        </span>
                        <span className="text-xl font-black text-emerald-600 dark:text-emerald-400">
                          {booking.final_price} $
                        </span>
                      </div>
                    </div>

                    {}
                    <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                      {booking.paymentProof && (
                        <button
                          onClick={() => setSelectedReceipt(booking)}
                          className="flex items-center justify-center gap-1.5 px-4 py-2 border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-950/45 rounded-xl text-xs font-black transition-all shadow-sm flex-1 sm:flex-none"
                        >
                          <Eye size={14} />
                          عرض السند
                        </button>
                      )}

                      <button
                        onClick={() => handleUpdateStatus(booking.id_bookings, 'certain', 'success')}
                        disabled={actionLoading === booking.id_bookings}
                        className="flex items-center justify-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black transition-all shadow-sm flex-1 sm:flex-none"
                      >
                        <Check size={14} />
                        موافقة
                      </button>

                      <button
                        onClick={() => handleUpdateStatus(booking.id_bookings, 'canceled', 'failed')}
                        disabled={actionLoading === booking.id_bookings}
                        className="flex items-center justify-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-black transition-all shadow-sm flex-1 sm:flex-none"
                      >
                        <X size={14} />
                        رفض
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {}
        {selectedReceipt && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {}
            <div
              onClick={() => setSelectedReceipt(null)}
              className="absolute inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm transition-opacity duration-300"
            />

            {}
            <div className="relative w-full max-w-2xl overflow-hidden rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 transition-all duration-300 animate-in fade-in zoom-in-95">

              {}
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-4">
                <h3 className="text-lg font-black text-slate-950 dark:text-white flex items-center gap-2">
                  <FileText size={20} className="text-blue-600" />
                  معاينة إثبات وسند الدفع للحجز {selectedReceipt.booking_reference}
                </h3>
                <button
                  onClick={() => setSelectedReceipt(null)}
                  className="rounded-full p-1.5 bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white transition-all"
                >
                  <X size={18} />
                </button>
              </div>

              {}
              <div className="bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden max-h-[400px] flex items-center justify-center p-2 mb-6">
                <img
                  src={selectedReceipt.paymentProof.startsWith('http') || selectedReceipt.paymentProof.startsWith('data:image/')
                    ? selectedReceipt.paymentProof
                    : `http://localhost:8080${selectedReceipt.paymentProof.startsWith('/') ? '' : '/'}${selectedReceipt.paymentProof}`
                  }
                  alt="Payment Receipt"
                  className="max-h-[380px] object-contain rounded-lg"
                  onError={(e) => {
                    e.target.src = 'https://placehold.co/600x400/1e293b/ffffff?text=خطأ+في+تحميل+صورة+السند';
                  }}
                />
              </div>

              {}
              <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-4 gap-4">
                <div className="text-right">
                  <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 block uppercase">المبلغ المطلوب</span>
                  <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">{selectedReceipt.final_price} $</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      handleUpdateStatus(selectedReceipt.id_bookings, 'certain', 'success');
                      setSelectedReceipt(null);
                    }}
                    className="flex items-center gap-1.5 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black transition-all shadow-sm"
                  >
                    <Check size={14} />
                    تأكيد السداد والقبول
                  </button>

                  <button
                    onClick={() => {
                      handleUpdateStatus(selectedReceipt.id_bookings, 'canceled', 'failed');
                      setSelectedReceipt(null);
                    }}
                    className="flex items-center gap-1.5 px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-black transition-all shadow-sm"
                  >
                    <X size={14} />
                    رفض الحجز والسند
                  </button>

                  <button
                    onClick={() => setSelectedReceipt(null)}
                    className="px-4 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-850 text-slate-700 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl text-xs font-black transition-all shadow-sm"
                  >
                    إغلاق المعاينة
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
