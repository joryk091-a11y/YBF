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
    <main className="min-h-[85vh] bg-[#f8f9fc] pb-16 pt-24 sm:pt-28" dir="rtl">
      <div className="mx-auto max-w-2xl px-4 sm:px-6">
        <div className="overflow-hidden rounded-[32px] border border-slate-200 bg-white p-8 text-center shadow-xl relative">
          {/* Glowing blur effects */}
          <div className="absolute -left-16 -top-16 h-40 w-40 rounded-full bg-emerald-500/10 blur-2xl pointer-events-none" />
          <div className="absolute -right-16 -bottom-16 h-40 w-40 rounded-full bg-brand-blue/10 blur-2xl pointer-events-none" />

          {/* Success Checkmark with Ring */}
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 border-4 border-emerald-100/40 text-emerald-500 shadow-inner mb-6">
            <CheckCircle2 className="h-10 w-10 animate-bounce" />
          </div>

          <h1 className="text-2xl font-black text-slate-900">تم الدفع بنجاح!</h1>
          <p className="mt-2 text-sm font-bold text-slate-400">تهانينا، تم تأكيد حجزك وإصدار تذاكر الصعود الإلكترونية بنجاح.</p>

          {/* Details Section */}
          <div className="mt-8 rounded-2xl bg-slate-50 border border-slate-100 p-5 text-right space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200/50 pb-3.5">
              <span className="text-xs font-bold text-slate-400">رمز الحجز PNR</span>
              <span className="text-sm font-mono font-black text-slate-900 tracking-wider bg-slate-200/60 px-3 py-1 rounded-xl">{reference}</span>
            </div>
            
            <div className="flex items-center justify-between border-b border-slate-200/50 pb-3.5">
              <span className="text-xs font-bold text-slate-400">حالة الدفع</span>
              <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-black text-emerald-700">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                مكتمل ومؤكد
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400">طريقة الدفع</span>
              <span className="text-xs font-black text-slate-700 flex items-center gap-1.5">
                <Receipt className="h-4 w-4 text-brand-blue" />
                بطاقة ائتمانية (Mastercard)
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={() => navigate('/my-bookings')}
              className="w-full sm:w-auto inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-brand-blue hover:bg-brand-blue-hover text-white px-8 text-xs font-black shadow-md shadow-brand-blue/20 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
            >
              <Download size={14} />
              <span>عرض وتحميل التذاكر</span>
            </button>
            <button
              onClick={() => navigate('/')}
              className="w-full sm:w-auto inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 px-8 text-xs font-black transition-all hover:scale-[1.02] active:scale-95 cursor-pointer"
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
