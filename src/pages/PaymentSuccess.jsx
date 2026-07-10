import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { CheckCircle2, AlertTriangle, ArrowRight, Calendar, Landmark, Plane, Download, Receipt } from 'lucide-react'

function PaymentSuccessPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const reference = searchParams.get('reference')
  const sessionId = searchParams.get('session_id')

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!reference) {
      setError('رمز الحجز مفقود.')
      setLoading(false)
      return
    }

    const confirmPayment = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/bookings/confirm-payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reference })
        })
        const data = await response.json()
        if (data.success) {
          setLoading(false)
        } else {
          setError(data.error || 'تعذر تأكيد عملية الدفع.')
          setLoading(false)
        }
      } catch (err) {
        console.error('Confirm payment error:', err)
        setError('خطأ في الاتصال بالخادم أثناء تأكيد الدفع.')
        setLoading(false)
      }
    }

    confirmPayment()
  }, [reference])

  if (loading) {
    return (
      <main className="min-h-[70vh] flex flex-col items-center justify-center bg-slate-50 px-4 py-20" dir="rtl">
        <div className="flex flex-col items-center gap-4 bg-white p-10 rounded-3xl border border-slate-200 shadow-xl max-w-md w-full text-center">
          <div className="h-14 w-14 animate-spin rounded-full border-4 border-brand-blue border-t-transparent mb-3" />
          <h2 className="text-xl font-black text-slate-800">جاري التحقق من عملية الدفع...</h2>
          <p className="text-xs font-bold text-slate-400">يرجى الانتظار لحين تأكيد الحجز وإصدار التذاكر الإلكترونية.</p>
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="min-h-[70vh] flex flex-col items-center justify-center bg-slate-50 px-4 py-20" dir="rtl">
        <div className="flex flex-col items-center gap-4 bg-white p-10 rounded-3xl border border-rose-100 shadow-xl max-w-md w-full text-center">
          <div className="h-14 w-14 rounded-full bg-rose-50 flex items-center justify-center text-rose-500 mb-3">
            <AlertTriangle className="h-8 w-8" />
          </div>
          <h2 className="text-xl font-black text-slate-800">حدث خطأ في الدفع</h2>
          <p className="text-xs font-bold text-rose-500 bg-rose-50/50 px-4 py-2 rounded-xl border border-rose-100/50">{error}</p>
          <button
            onClick={() => navigate('/payment')}
            className="mt-4 px-6 py-2.5 bg-brand-blue text-white rounded-xl text-xs font-black shadow-md shadow-brand-blue/20 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
          >
            العودة لصفحة الدفع
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-[85vh] bg-[#f8fafc] pb-20 pt-24 sm:pt-32" dir="rtl">
      <div className="mx-auto max-w-xl px-4 sm:px-6">
        <div className="overflow-hidden rounded-[2.5rem] border border-slate-100 bg-white p-10 text-center shadow-[0_24px_70px_rgba(0,0,0,0.03)] relative">
          {}
          <div className="absolute -left-20 -top-20 h-48 w-48 rounded-full bg-emerald-500/5 blur-3xl pointer-events-none" />
          <div className="absolute -right-20 -bottom-20 h-48 w-48 rounded-full bg-brand-blue/5 blur-3xl pointer-events-none" />

          {}
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500 text-white shadow-xl shadow-emerald-500/20 mb-8 transition-transform duration-300 hover:scale-105">
            <CheckCircle2 className="h-10 w-10 stroke-[2.5]" />
          </div>

          <h1 className="text-3xl font-black text-slate-900 tracking-tight">تم الدفع بنجاح!</h1>
          <p className="mt-3 text-sm font-medium text-slate-500 max-w-md mx-auto leading-relaxed">
            تهانينا، تم تأكيد حجزك وإصدار تذاكر الصعود الإلكترونية بنجاح. لقد أرسلنا تفاصيل الحجز إلى بريدك الإلكتروني.
          </p>

          {}
          <div className="mt-8 rounded-3xl bg-slate-50 border border-slate-100 p-6 text-right relative overflow-hidden">
            {}
            <div className="absolute top-1/2 -left-3 h-6 w-6 -translate-y-1/2 rounded-full bg-white border border-slate-100 pointer-events-none hidden sm:block" />
            <div className="absolute top-1/2 -right-3 h-6 w-6 -translate-y-1/2 rounded-full bg-white border border-slate-100 pointer-events-none hidden sm:block" />

            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-4 pb-2 border-b border-slate-200/50 flex items-center justify-between">
              <span>تفاصيل الدفع والتأكيد</span>
              <Receipt className="h-4.5 w-4.5 text-slate-400" />
            </h3>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400">رمز الحجز (PNR)</span>
                <span className="text-sm font-mono font-black text-slate-800 tracking-widest bg-slate-200/50 px-3 py-1 rounded-xl">{reference}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400">حالة العملية</span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-black text-emerald-700">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  مكتمل ومؤكد
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400">طريقة الدفع</span>
                <span className="text-xs font-black text-slate-700 flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-brand-blue" />
                  بطاقة ائتمانية (Mastercard)
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400">رقم المعاملة</span>
                <span className="text-xs font-mono font-bold text-slate-500">TXN-{Math.random().toString(36).substring(2, 10).toUpperCase()}</span>
              </div>
            </div>
          </div>

          {}
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={() => navigate('/my-bookings')}
              className="w-full sm:flex-1 inline-flex h-13 items-center justify-center gap-2 rounded-2xl bg-brand-blue hover:bg-brand-blue-hover text-white text-xs font-black shadow-lg shadow-brand-blue/15 hover:shadow-brand-blue/25 transition-all cursor-pointer active:scale-98"
            >
              <Download size={14} />
              <span>عرض وتحميل التذاكر</span>
            </button>
            <button
              onClick={() => navigate('/')}
              className="w-full sm:flex-1 inline-flex h-13 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-xs font-black transition-all cursor-pointer active:scale-98"
            >
              <span>العودة للرئيسية</span>
              <ArrowRight size={14} className="rotate-180" />
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}

export default PaymentSuccessPage
