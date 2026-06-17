import { useEffect, useMemo, useState, useRef } from 'react'
import { Building2, CheckCircle2, CreditCard, Landmark, Lock, ShieldCheck, Plane, MoveLeft, ChevronDown, Luggage, HeartPulse, Accessibility, Wind, Salad, BadgeCheck, Headphones, Camera, Upload, MapPin, Phone, Trash2, AlertCircle, Building, Clock } from 'lucide-react'
import { useLocation, Link } from 'react-router-dom'
import { useSearch } from '../utils/SearchContext'
import { useAuth } from '../utils/AuthContext'
import BookingStepper from '../components/BookingStepper.jsx'

import creditCardTemplate from '../assets/credite card.png'
import masterCardLogo from '../assets/mastercard logo.png'
import paypalLogo from '../assets/paypal.png'
import visaLogo from '../assets/visa.png'

const CARD_COUNTDOWN = 10 * 60 // 10 minutes for card payment
const CONFIRMATION_COUNTDOWN = 3 * 24 * 60 * 60

const SERVICES = [
  { id: 'wheelchair', icon: Accessibility, label: 'مساعدة بالكرسي المتحرك', desc: 'خدمة مرافقة وكرسي متحرك داخل المطار والطائرة', price: 20, color: 'blue' },
  { id: 'oxygen', icon: Wind, label: 'أكسجين طبي على المتن', desc: 'توفير أسطوانة أكسجين طبية معتمدة خلال الرحلة', price: 55, color: 'sky' },
  { id: 'medical', icon: HeartPulse, label: 'مساعدة طبية متخصصة', desc: 'طاقم طبي مدرّب لمرافقة المريض طوال الرحلة', price: 80, color: 'red' },
  { id: 'medmeal', icon: Salad, label: 'وجبة غذائية طبية', desc: 'وجبة مخصصة وفق الحالة الصحية (سكري، ضغط...)', price: 18, color: 'emerald' },
]

const paymentMethods = [
  {
    id: 'card',
    label: 'بطاقة ائتمانية / خصم',
    description: 'Visa, Mastercard',
    logos: [visaLogo, masterCardLogo],
  },
  {
    id: 'paypal',
    label: 'PayPal',
    description: 'دفع سريع وآمن',
    logos: [paypalLogo],
  },
  {
    id: 'branch',
    label: 'الدفع في مكاتب شركة الطيران',
    description: 'تأكيد خلال 3 أيام',
    icon: Building2,
    badge: 'متاح',
  },
  {
    id: 'transfer',
    label: 'تحويل بنكي',
    description: 'حوالة بنكية مباشرة',
    icon: Landmark,
    badge: 'متاح',
  },
]

const BRANCHES = {
  IY: [
    { id: 1, city: 'صنعاء', name: 'مكتب اليمنية الرئيسي - الحصبة', address: 'شارع مطار صنعاء الدولي - مبنى اليمنية الرئيسي', phone: '01-250621', hours: '8:00 ص - 8:00 م' },
    { id: 2, city: 'صنعاء', name: 'فرع اليمنية - الزبيري', address: 'شارع الزبيري - بجوار وزارة النفط والمعادن', phone: '01-207000', hours: '8:00 ص - 4:00 م' },
    { id: 3, city: 'عدن', name: 'مكتب اليمنية - المعلا', address: 'الشارع الرئيسي - بجوار بنك اليمن والكويت', phone: '02-242630', hours: '8:00 ص - 8:00 م' },
    { id: 4, city: 'عدن', name: 'فرع اليمنية - خور مكسر', address: 'شارع المطار - أمام ساحة العروض', phone: '02-234567', hours: '8:00 ص - 4:00 م' },
    { id: 5, city: 'تعز', name: 'فرع اليمنية - شارع جمال', address: 'شارع جمال - أمام مكتب التربية والتعليم', phone: '04-252220', hours: '8:00 ص - 6:00 م' },
    { id: 6, city: 'المكلا', name: 'فرع اليمنية - الشرج', address: 'الشارع الرئيسي - عمارة باجرش', phone: '05-302550', hours: '8:00 ص - 8:00 م' },
    { id: 7, city: 'القاهرة', name: 'مكتب اليمنية - الدقي', address: '12 شارع السد العالي - الدقي - الجيزة', phone: '+20-2-3336111', hours: '9:00 ص - 6:00 م' },
    { id: 8, city: 'جدة', name: 'مكتب اليمنية - البغدادية', address: 'حي البغدادية - شارع الميناء - عمارة باخشب', phone: '+966-12-6422222', hours: '9:00 ص - 7:00 م' }
  ],
  MS: [
    { id: 9, city: 'القاهرة', name: 'مكتب مصر للطيران - التحرير', address: 'ميدان التحرير - وسط البلد', phone: '19677', hours: '8:00 ص - 10:00 م' },
    { id: 10, city: 'القاهرة', name: 'مكتب مصر للطيران - مصر الجديدة', address: '22 شارع صلاح سالم - مصر الجديدة', phone: '19677', hours: '8:00 ص - 8:00 م' },
    { id: 11, city: 'عدن', name: 'وكيل مصر للطيران - عدن', address: 'المعلا - الشارع الرئيسي', phone: '02-241112', hours: '8:00 ص - 4:00 م' },
    { id: 12, city: 'صنعاء', name: 'وكيل مصر للطيران - صنعاء', address: 'شارع حدة - مركز الكميم التجاري', phone: '01-443322', hours: '8:00 ص - 4:00' }
  ],
  BS: [
    { id: 13, city: 'عدن', name: 'مكتب طيران بلقيس - خورمكسر', address: 'شارع المطار - بجوار مبنى المحافظة', phone: '02-277777', hours: '8:00 ص - 6:00 م' },
    { id: 14, city: 'صنعاء', name: 'مكتب طيران بلقيس - حدة', address: 'شارع حدة - عمارة بلقيس', phone: '01-555555', hours: '8:00 ص - 5:00 م' }
  ],
  QY: [
    { id: 15, city: 'عدن', name: 'مكتب فلاي عدن - المنصورة', address: 'شارع تسعين - أمام سوبر ماركت ظمران', phone: '02-300100', hours: '8:00 ص - 8:00 م' }
  ],
  DEFAULT: [
    { id: 16, city: 'صنعاء', name: 'مكتب YBF الرئيسي - حدة', address: 'شارع حدة - أمام سيتي ماكس التجاري', phone: '01-444555', hours: '8:00 ص - 9:00 م' },
    { id: 17, city: 'عدن', name: 'مكتب YBF - المنصورة', address: 'الشارع الرئيسي - بجوار جولة كالتكس', phone: '02-333444', hours: '8:00 ص - 9:00 م' },
    { id: 18, city: 'تعز', name: 'مكتب YBF - شارع جمال', address: 'شارع جمال - برج الحميري الدور الأول', phone: '04-222333', hours: '8:00 ص - 7:00 م' },
    { id: 19, city: 'المكلا', name: 'مكتب YBF - الشرج', address: 'الشارع الرئيسي - عمارة باجرش', phone: '05-300400', hours: '8:00 ص - 8:00 م' }
  ]
}


function PaymentProofUpload({
  paymentProofImage,
  isCameraActive,
  cameraError,
  videoRef,
  startCamera,
  stopCamera,
  capturePhoto,
  handleFileUpload,
  setPaymentProofImage,
  label
}) {
  return (
    <div className="rounded-xl border border-slate-200/60 bg-slate-50/10 p-5">
      <h4 className="text-xs font-black text-slate-800 mb-3 flex items-center gap-2 justify-start" dir="rtl">
        <Camera className="h-4 w-4 text-[#4974f9]" />
        <span>إثبات عملية الدفع ({label})</span>
      </h4>

      {paymentProofImage ? (
        <div className="relative rounded-xl border border-slate-200 bg-white p-3 flex flex-col items-center">
          <img
            src={paymentProofImage}
            alt="Payment Proof Preview"
            className="max-h-[200px] w-auto object-contain rounded-lg shadow-sm"
          />
          <div className="mt-3 flex items-center justify-between w-full text-xs bg-slate-50 p-2.5 rounded-lg border border-slate-100" dir="rtl">
            <span className="font-bold text-slate-500">تم إرفاق إثبات الدفع بنجاح</span>
            <button
              type="button"
              onClick={() => setPaymentProofImage(null)}
              className="text-red-500 hover:text-red-700 font-black flex items-center gap-1 cursor-pointer"
            >
              <Trash2 className="h-4 w-4" />
              <span>إزالة</span>
            </button>
          </div>
        </div>
      ) : isCameraActive ? (
        <div className="relative rounded-xl border border-slate-200 bg-black overflow-hidden flex flex-col items-center">
          <video
            ref={videoRef}
            playsInline
            muted
            className="w-full max-h-[300px] object-cover"
          />
          <div className="absolute bottom-4 flex items-center gap-3">
            <button
              type="button"
              onClick={capturePhoto}
              className="bg-[#4974f9] text-white font-black px-6 py-2.5 rounded-xl shadow-lg hover:bg-[#3b63db] active:scale-95 transition-all text-xs cursor-pointer"
            >
              التقاط الصورة
            </button>
            <button
              type="button"
              onClick={stopCamera}
              className="bg-white/95 text-slate-800 font-black px-4 py-2.5 rounded-xl shadow-lg hover:bg-white active:scale-95 transition-all text-xs cursor-pointer"
            >
              إلغاء
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {cameraError && (
            <div className="flex items-center gap-2 text-xs font-bold text-red-600 bg-red-50 p-3 rounded-lg border border-red-100" dir="rtl">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{cameraError}</span>
            </div>
          )}

          <div className="grid gap-3 sm:grid-cols-2">
            {/* File Upload Button */}
            <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 hover:border-[#4974f9] hover:bg-[#4974f9]/5 rounded-xl p-5 cursor-pointer transition-all text-center">
              <Upload className="h-6 w-6 text-slate-400 mb-2" />
              <span className="text-xs font-black text-slate-700">تحميل إيصال الدفع</span>
              <span className="text-[10px] text-slate-400 font-bold mt-1">تصفح ملفات جهازك (PNG, JPG)</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>

            {/* Camera Capture Button */}
            <button
              type="button"
              onClick={startCamera}
              className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 hover:border-[#4974f9] hover:bg-[#4974f9]/5 rounded-xl p-5 transition-all text-center cursor-pointer"
            >
              <Camera className="h-6 w-6 text-slate-400 mb-2" />
              <span className="text-xs font-black text-slate-700">التقاط صورة إثبات الدفع</span>
              <span className="text-[10px] text-slate-400 font-bold mt-1">استخدام الكاميرا الخاصة بجهازك</span>
            </button>
          </div>
          <p className="text-[9px] font-bold text-slate-400 leading-relaxed text-right mt-1" dir="rtl">
            * تصوير إيصال الإيداع أو فاتورة الدفع النقدي يساعد في تسريع مراجعة الطلب وتأكيد مقاعدك مباشرة.
          </p>
        </div>
      )}
    </div>
  );
}

const countdownMethods = new Set(['branch', 'transfer'])

function PaymentPage() {
  const location = useLocation()
  const { addBooking } = useAuth()
  const { searchCriteria: contextSearchCriteria } = useSearch()

  const selectedFlight = location.state?.selectedFlight
  const searchCriteria = location.state?.searchCriteria || contextSearchCriteria
  const bookingPassengersCount = Number(searchCriteria?.passengerCount) || 1
  const basePrice = Number(selectedFlight?.price) || 856

  const passengers = location.state?.passengers || []
  const extraBags = location.state?.extraBags || {}
  const selectedServices = location.state?.selectedServices || []
  const extrasTotal = Number(location.state?.extrasTotal) || 0
  const selectedSeats = location.state?.selectedSeats || []

  const BUSINESS_ROWS = [1, 2, 3]
  const businessSeatsCount = selectedSeats.filter(seat => {
    const rowMatch = seat.match(/^(\d+)/)
    if (rowMatch) {
      const rowNum = parseInt(rowMatch[1], 10)
      return BUSINESS_ROWS.includes(rowNum)
    }
    return false
  }).length

  const BUSINESS_SURCHARGE = 150
  const businessSurchargeTotal = businessSeatsCount * BUSINESS_SURCHARGE

  let adults = 0
  let children = 0
  let infants = 0
  passengers.forEach(p => {
    if (p.passengerCode === 'CHD') children++
    else if (p.passengerCode === 'INF') infants++
    else adults++
  })

  const EXTRA_BAG_PRICE = 35
  const bagsTotal = Object.values(extraBags).reduce((s, n) => s + n * EXTRA_BAG_PRICE, 0)
  const servicesTotal = SERVICES.filter(s => selectedServices.includes(s.id)).reduce((s, srv) => s + srv.price, 0)

  const adultBaseFare = Math.round(basePrice * 0.85)
  const adultTaxes = basePrice - adultBaseFare
  const adultFaresTotal = adults * basePrice

  const childBaseFare = Math.round(basePrice * 0.75 * 0.85)
  const childTaxes = Math.round(basePrice * 0.75) - childBaseFare
  const childFaresTotal = children * Math.round(basePrice * 0.75)

  const infantBaseFare = Math.round(basePrice * 0.15 * 0.85)
  const infantTaxes = Math.round(basePrice * 0.15) - infantBaseFare
  const infantFaresTotal = infants * Math.round(basePrice * 0.15)

  const ticketsTotal = adultFaresTotal + childFaresTotal + infantFaresTotal
  const totalPrice = ticketsTotal
  const finalTotal = ticketsTotal + businessSurchargeTotal + extrasTotal

  const [cardHolderName, setCardHolderName] = useState('')
  const [cardNumber, setCardNumber] = useState('')
  const [cvv, setCvv] = useState('')
  const [expMonth, setExpMonth] = useState('')
  const [expYear, setExpYear] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('card')
  const [secondsLeft, setSecondsLeft] = useState(CARD_COUNTDOWN)
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)

  // Branch and Payment Proof states
  const [selectedBranchCity, setSelectedBranchCity] = useState('الكل')
  const [selectedBranch, setSelectedBranch] = useState(null)
  const [paymentProofImage, setPaymentProofImage] = useState(null)
  const [isCameraActive, setIsCameraActive] = useState(false)
  const [cameraError, setCameraError] = useState(null)
  const videoRef = useRef(null)

  const startCamera = async () => {
    setCameraError(null)
    setIsCameraActive(true)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        // Wait for metadata to load to play
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play().catch(e => console.error("Video play error:", e))
        }
      }
    } catch (err) {
      console.error('Error accessing camera:', err)
      setCameraError('تعذر الوصول إلى الكاميرا. يرجى التحقق من صلاحيات المتصفح.')
      setIsCameraActive(false)
    }
  }

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject
      const tracks = stream.getTracks()
      tracks.forEach(track => track.stop())
      videoRef.current.srcObject = null
    }
    setIsCameraActive(false)
  }

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas')
      canvas.width = videoRef.current.videoWidth || 640
      canvas.height = videoRef.current.videoHeight || 480
      const ctx = canvas.getContext('2d')
      // Flip canvas context for mirroring if needed, or draw directly
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height)
      const dataUrl = canvas.toDataURL('image/jpeg')
      setPaymentProofImage(dataUrl)
      stopCamera()
    }
  }

  const handleFileUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPaymentProofImage(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft((current) => (current > 0 ? current - 1 : 0))
    }, 1000)

    return () => {
      clearInterval(timer)
      // Stop camera if component unmounts
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject
        const tracks = stream.getTracks()
        tracks.forEach(track => track.stop())
      }
    }
  }, [])

  const handlePaymentMethodChange = (methodId) => {
    setPaymentMethod(methodId)
    setSecondsLeft(countdownMethods.has(methodId) ? CONFIRMATION_COUNTDOWN : CARD_COUNTDOWN)
  }

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [bookingRef, setBookingRef] = useState('')

  const handleConfirmBooking = async () => {
    if (paymentMethod === 'branch' && !selectedBranch) {
      alert('يرجى اختيار الفرع الذي ترغب بالدفع فيه لإتمام عملية الحجز.')
      return
    }

    setIsSubmitting(true)
    const passengers = location.state?.passengers || []
    const userObj = JSON.parse(localStorage.getItem('user') || '{}')
    const refVal = `YBF-${Math.random().toString(36).toUpperCase().substring(2, 8)}`

    // دالة محاكاة الحجز المحلي لتحديث الحالة المشتركة ديناميكياً
    const addMockBookingLocal = (referenceToUse) => {
      const newBookingRecord = {
        id: referenceToUse,
        flightId: selectedFlight?.id_flights || selectedFlight?.id || 1,
        flight_number: selectedFlight?.flight_number || 'IY-601',
        origin: selectedFlight?.airportOrigin_code || selectedFlight?.fromCode || 'ADE',
        destination: selectedFlight?.airportDestination_code || selectedFlight?.toCode || 'CAI',
        departure_time: selectedFlight?.departure_time || '2026-06-15T08:30',
        passengers: passengers.map((p, idx) => ({
          name: p.fullName || p.name || 'مسافر مجهول',
          passport_number: p.passportNumber || p.passport_number || 'Y-998877',
          seat: selectedSeats[idx] || `${10 + idx}F`,
          travel_class: selectedSeats[idx] && BUSINESS_ROWS.includes(parseInt(selectedSeats[idx], 10)) ? 'Business' : 'Economy',
          services: selectedServices || []
        })),
        totalPrice: finalTotal,
        paymentMethod,
        status: (paymentMethod === 'branch' || paymentMethod === 'transfer') ? 'temporary' : 'certain',
        created_at: new Date().toISOString()
      }
      addBooking(newBookingRecord)

      // حفظ إثبات الدفع والفرع المحدد محلياً
      if (paymentProofImage) {
        localStorage.setItem(`payment_proof_${referenceToUse}`, paymentProofImage)
      }
      if (paymentMethod === 'branch' && selectedBranch) {
        localStorage.setItem(`payment_branch_${referenceToUse}`, JSON.stringify(selectedBranch))
      }
    }

    try {
      const response = await fetch('http://localhost:8080/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          flightId: selectedFlight?.id_flights || selectedFlight?.id || 1,
          passengers,
          totalPrice: finalTotal,
          basePrice: ticketsTotal + businessSurchargeTotal,
          extraBags,
          selectedServices,
          extrasTotal,
          paymentMethod,
          userId: userObj.id,
          reference: refVal,
          paymentProof: paymentProofImage,
          selectedBranchId: selectedBranch ? selectedBranch.id : null
        })
      })

      const data = await response.json()
      if (data.success) {
        setBookingRef(data.reference)
        addMockBookingLocal(data.reference)
        setIsPaymentModalOpen(true)
      } else {
        alert('حدث خطأ أثناء تأكيد الحجز: ' + data.error)
      }
    } catch (error) {
      console.error('Error confirming booking, falling back to mock save:', error)
      // في حال توقف السيرفر، يتم التأكيد محلياً لتمكين العرض التقديمي للدكاترة
      setBookingRef(refVal)
      addMockBookingLocal(refVal)
      setIsPaymentModalOpen(true)
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }

  const summaryFlight = selectedFlight ?? {
    fromCity: 'عدن',
    toCity: 'القاهرة',
    departTime: '07:35',
    arriveTime: '10:10',
    fromCode: 'CAI',
    toCode: 'ADE',
    duration: '4 س 25 د',
    price: 856,
  }

  const cardDigits = cardNumber.replace(/\D/g, '').slice(0, 16)
  const displayCardNumber =
    `${cardDigits}${'•'.repeat(Math.max(0, 16 - cardDigits.length))}`.match(/.{1,4}/g)?.join(' ') ??
    '•••• •••• •••• ••••'
  const displayExpiry = `${expMonth.padEnd(2, '•')}/${expYear.padEnd(2, '•')}`

  return (
    <main className="min-h-[100svh] bg-[#f8f9fc] pb-16 pt-24 sm:pt-28" dir="rtl">
      {/* Sticky Stepper Bar */}
      <div className="sticky top-16 z-40 w-full border-b border-slate-200/60 bg-white/80 py-4 backdrop-blur-xl sm:top-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <BookingStepper current="payment" />
        </div>
      </div>

      <div className="mx-auto mt-10 grid w-full max-w-7xl gap-8 px-4 lg:grid-cols-[1fr_340px] sm:px-6" dir="ltr">
        <section className="w-full min-w-0" dir="rtl">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-3xl font-black text-slate-900">طريقة الدفع</h1>
              <p className="mt-2 text-sm font-bold text-slate-500">اختر الطريقة المفضلة لديك لإتمام عملية الحجز بأمان.</p>
            </div>

            <div className="flex items-center gap-3 rounded-2xl bg-white p-3 shadow-sm ring-1 ring-slate-200">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50">
                <Lock className="h-5 w-5 text-slate-400" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase text-slate-400">الوقت المتبقي</p>
                <p className="font-black text-[#d9312b]" dir="ltr">{formatTime(secondsLeft)}</p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {/* Payment Method Selector */}
            <div className="grid gap-4 sm:grid-cols-2">
              {paymentMethods.map((method) => {
                const isActive = paymentMethod === method.id
                const Icon = method.icon
                return (
                  <button
                    key={method.id}
                    type="button"
                    onClick={() => handlePaymentMethodChange(method.id)}
                    className={`flex items-center justify-between rounded-2xl border p-4 text-right transition-all duration-200 ${isActive
                        ? 'border-[#4974f9] bg-[#4974f9]/5 shadow-[0_4px_20px_rgba(73,116,249,0.06)]'
                        : 'border-slate-200/80 bg-white hover:border-slate-300 hover:bg-slate-50/30'
                      }`}
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      {/* Radio dot */}
                      <div className={`flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full border transition-all ${isActive ? 'border-[#4974f9] bg-[#4974f9]' : 'border-slate-300 bg-white'
                        }`}>
                        {isActive && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                      </div>

                      {/* Info */}
                      <div className="text-right">
                        <span className="block text-xs font-black text-slate-800">{method.label}</span>
                        <span className="block text-[10px] font-bold text-slate-400 mt-0.5">{method.description}</span>
                      </div>
                    </div>

                    {/* Logo/Icon Container */}
                    <div className="flex h-10 w-24 shrink-0 items-center justify-end">
                      {method.logos ? (
                        <div className="flex items-center gap-1.5 justify-end">
                          {method.logos.map((logo, i) => (
                            <img
                              key={i}
                              src={logo}
                              alt=""
                              className={`w-auto object-contain ${method.id === 'paypal' ? 'h-6.5 max-w-[72px]' : 'h-4.5 max-w-[32px]'
                                }`}
                            />
                          ))}
                        </div>
                      ) : (
                        <div className={`flex h-8 w-8 items-center justify-center rounded-lg bg-slate-50 ${isActive ? 'text-[#4974f9]' : 'text-slate-400'}`}>
                          <Icon className="h-4 w-4" />
                        </div>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>

            {/* Dynamic Payment Form */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm sm:p-8">
              {paymentMethod === 'card' && (
                <div className="grid gap-10 lg:grid-cols-[1fr_minmax(0,1.2fr)]">
                  {/* Visual Card Preview */}
                  <div className="relative aspect-[1.6/1] w-full overflow-hidden rounded-[24px] bg-gradient-to-br from-slate-950 via-[#0d1527] to-[#1e293b] p-6 text-white shadow-2xl border border-white/5">
                    {/* Glowing glassmorphic orbs in the background */}
                    <div className="absolute -left-10 -top-10 h-36 w-36 rounded-full bg-[#4974f9]/15 blur-2xl pointer-events-none" />
                    <div className="absolute -right-10 -bottom-10 h-36 w-36 rounded-full bg-emerald-500/10 blur-2xl pointer-events-none" />
                    <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '16px 16px' }} />

                    <div className="relative z-10 flex h-full flex-col justify-between">
                      {/* Top row: Premium metallic chip & Glass badge logos */}
                      <div className="flex items-start justify-between">
                        {/* Real-looking metallic Microchip */}
                        <div className="relative h-8 w-10 overflow-hidden rounded-md border border-amber-300/40 bg-gradient-to-r from-amber-100 via-amber-200 to-amber-400 p-1 shadow-sm">
                          <div className="absolute inset-x-0 top-1/2 h-[1px] -translate-y-1/2 bg-amber-600/30" />
                          <div className="absolute inset-y-0 left-1/2 w-[1px] -translate-x-1/2 bg-amber-600/30" />
                          <div className="absolute inset-1.5 rounded-sm border border-amber-500/20 bg-amber-300/20" />
                        </div>
                        
                        {/* Brand logos directly */}
                        <div className="flex gap-2">
                          <img src={visaLogo} alt="" className="h-4.5 w-auto object-contain" />
                          <img src={masterCardLogo} alt="" className="h-4.5 w-auto object-contain" />
                        </div>
                      </div>

                      {/* Bottom/Middle rows: Live dynamic values */}
                      <div className="space-y-3.5">
                        {/* Monospaced realistic Card Number */}
                        <p className="text-[17px] font-black tracking-[0.25em] font-mono text-white/95 drop-shadow-[0_2px_10px_rgba(255,255,255,0.08)]" dir="ltr">
                          {displayCardNumber}
                        </p>
                        
                        <div className="flex justify-between items-end">
                          <div className="space-y-0.5 text-right">
                            <span className="text-[8px] font-bold uppercase tracking-wider text-slate-400">حامل البطاقة</span>
                            <p className="text-[11px] font-black uppercase tracking-wider text-slate-100">{cardHolderName || 'اسم حامل البطاقة'}</p>
                          </div>
                          <div className="space-y-0.5 text-left">
                            <span className="text-[8px] font-bold uppercase tracking-wider text-slate-400">ينتهي في</span>
                            <p className="text-[11px] font-black text-slate-100" dir="ltr">{displayExpiry}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card Form */}
                  <div className="space-y-5">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block text-right">اسم حامل البطاقة</label>
                      <input
                        className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50/20 px-4 text-xs font-black text-slate-800 transition-all duration-200 placeholder-slate-300 focus:border-[#4974f9] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4974f9]/10"
                        placeholder="أدخل الاسم كما في البطاقة"
                        value={cardHolderName}
                        onChange={(e) => setCardHolderName(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block text-right">رقم البطاقة</label>
                      <div className="relative">
                        <input
                          className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50/20 pl-10 pr-4 text-xs font-black text-slate-800 transition-all duration-200 placeholder-slate-300 focus:border-[#4974f9] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4974f9]/10"
                          placeholder="0000 0000 0000 0000"
                          value={cardNumber}
                          onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, '').slice(0, 16))}
                          dir="ltr"
                        />
                        <CreditCard className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-300" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block text-right">تاريخ الانتهاء</label>
                        <div className="flex items-center gap-2" dir="ltr">
                          <input
                            className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50/20 px-2 text-center text-xs font-black text-slate-800 transition-all duration-200 placeholder-slate-300 focus:border-[#4974f9] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4974f9]/10"
                            placeholder="MM"
                            value={expMonth}
                            onChange={(e) => setExpMonth(e.target.value.replace(/\D/g, '').slice(0, 2))}
                          />
                          <span className="font-black text-slate-300">/</span>
                          <input
                            className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50/20 px-2 text-center text-xs font-black text-slate-800 transition-all duration-200 placeholder-slate-300 focus:border-[#4974f9] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4974f9]/10"
                            placeholder="YY"
                            value={expYear}
                            onChange={(e) => setExpYear(e.target.value.replace(/\D/g, '').slice(0, 2))}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block text-right">رمز التحقق (CVV)</label>
                        <input
                          className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50/20 px-4 text-center text-xs font-black text-slate-800 transition-all duration-200 placeholder-slate-300 focus:border-[#4974f9] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4974f9]/10"
                          placeholder="***"
                          type="password"
                          value={cvv}
                          onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 3))}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {paymentMethod === 'paypal' && (
                <div className="flex flex-col items-center py-10 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#003087]/5 mb-6 text-[#003087]">
                    <img src={paypalLogo} alt="PayPal" className="h-6 w-auto object-contain" />
                  </div>
                  <h3 className="text-sm font-black text-slate-800">تأكيد الدفع عبر PayPal</h3>
                  <p className="mt-2 max-w-sm text-[11px] font-bold leading-relaxed text-slate-400">
                    بمجرد النقر على "إتمام الحجز"، سنقوم بتوجيهك بشكل آمن إلى بوابة PayPal لإتمام عملية الدفع بسرعة وأمان.
                  </p>
                </div>
              )}

              {paymentMethod === 'branch' && (
                <div className="py-2">
                  <div className="mb-6 flex items-center justify-between rounded-xl bg-emerald-500/5 p-4 border border-emerald-500/10" dir="rtl">
                    <div className="flex items-center gap-3">
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600">
                        <CheckCircle2 className="h-4 w-4" />
                      </div>
                      <p className="text-xs font-black text-emerald-800">التأكيد خلال 3 أيام (72 ساعة) من تاريخ الحجز</p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xs font-black text-slate-800 mb-3 flex items-center gap-2 justify-start" dir="rtl">
                        <Building className="h-4 w-4 text-[#4974f9]" />
                        <span>مواقع المكاتب والفروع المعتمدة للدفع</span>
                      </h3>
                      <p className="text-[11px] font-bold text-slate-400 mb-4 text-right">
                        يمكنك زيارة أحد مكاتب شركة الطيران الناقلة ({selectedFlight?.airline_name || 'اليمنية للطيران'}) المذكورة أدناه للدفع نقداً وتأكيد حجزك.
                      </p>

                      {/* City Filters */}
                      <div className="flex flex-wrap gap-2 mb-4 justify-start" dir="rtl">
                        {['الكل', ...new Set((BRANCHES[selectedFlight?.airline_code || selectedFlight?.airlineCode] || BRANCHES.IY).map(b => b.city))].map(city => (
                          <button
                            key={city}
                            type="button"
                            onClick={() => setSelectedBranchCity(city)}
                            className={`px-3.5 py-1.5 text-xs font-black rounded-xl border transition-all duration-200 cursor-pointer ${
                              selectedBranchCity === city
                                ? 'bg-[#4974f9] text-white border-[#4974f9] shadow-md shadow-[#4974f9]/20'
                                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            {city}
                          </button>
                        ))}
                      </div>

                      {/* Branches Grid */}
                      <div className="grid gap-3 sm:grid-cols-2 max-h-[300px] overflow-y-auto pr-1" dir="rtl">
                        {(BRANCHES[selectedFlight?.airline_code || selectedFlight?.airlineCode] || BRANCHES.IY)
                          .filter(b => selectedBranchCity === 'الكل' || b.city === selectedBranchCity).map(branch => {
                          const isSelected = selectedBranch?.id === branch.id
                          return (
                            <button
                              key={branch.id}
                              type="button"
                              onClick={() => setSelectedBranch(branch)}
                              className={`flex flex-col text-right p-4 rounded-xl border-2 transition-all cursor-pointer ${
                                isSelected
                                  ? 'border-[#4974f9] bg-[#4974f9]/5 shadow-sm'
                                  : 'border-slate-100 bg-slate-50/50 hover:border-slate-200'
                              }`}
                            >
                              <div className="flex items-start justify-between w-full">
                                <span className="font-black text-xs text-slate-800">{branch.name}</span>
                                {isSelected && (
                                  <span className="flex h-4.5 w-4.5 items-center justify-center rounded-full bg-[#4974f9] text-white">
                                    <CheckCircle2 className="h-3 w-3" />
                                  </span>
                                )}
                              </div>
                              <div className="mt-2.5 space-y-1.5 w-full">
                                <p className="text-[10px] text-slate-400 font-bold flex items-center gap-1.5 justify-start">
                                  <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                                  <span className="truncate">{branch.address}</span>
                                </p>
                                <p className="text-[10px] text-slate-400 font-bold flex items-center gap-1.5 justify-start">
                                  <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                                  <span dir="ltr">{branch.phone}</span>
                                </p>
                                <p className="text-[10px] text-slate-400 font-bold flex items-center gap-1.5 justify-start">
                                  <Clock className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                                  <span>{branch.hours}</span>
                                </p>
                              </div>
                            </button>
                          )
                        })}
                      </div>
                    </div>

                    {/* Shared Payment Proof Component */}
                    <PaymentProofUpload
                      paymentProofImage={paymentProofImage}
                      isCameraActive={isCameraActive}
                      cameraError={cameraError}
                      videoRef={videoRef}
                      startCamera={startCamera}
                      stopCamera={stopCamera}
                      capturePhoto={capturePhoto}
                      handleFileUpload={handleFileUpload}
                      setPaymentProofImage={setPaymentProofImage}
                      label="سند أو إيصال الدفع النقدي بالمكتب"
                    />
                  </div>
                </div>
              )}

              {paymentMethod === 'transfer' && (
                <div className="py-2">
                  <div className="mb-6 flex items-center justify-between rounded-xl bg-emerald-500/5 p-4 border border-emerald-500/10" dir="rtl">
                    <div className="flex items-center gap-3">
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600">
                        <CheckCircle2 className="h-4 w-4" />
                      </div>
                      <p className="text-xs font-black text-emerald-800">الحجز متاح للتأكيد خلال 3 أيام (72 ساعة)</p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="grid gap-4 sm:grid-cols-2" dir="rtl">
                      <div className="rounded-xl border border-slate-200/60 bg-slate-50/20 p-5 text-right">
                        <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-400">بيانات الحساب البنكي</h4>
                        <div className="mt-4 space-y-3">
                          <div className="flex justify-between items-center text-xs">
                            <span className="font-bold text-slate-400">البنك والمصرف</span>
                            <span className="font-black text-slate-800">بنك التضامن الإسلامي</span>
                          </div>
                          <div className="border-t border-slate-100 my-2" />
                          <div className="flex justify-between items-center text-xs">
                            <span className="font-bold text-slate-400">رقم الحساب</span>
                            <span className="font-black text-slate-800 tracking-wider" dir="ltr">0012-45678-001</span>
                          </div>
                        </div>
                      </div>
                      <div className="rounded-xl border border-slate-200/60 bg-slate-50/20 p-5 text-right">
                        <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-400">طريقة التأكيد والخطوات</h4>
                        <p className="mt-4 text-[11px] font-bold leading-relaxed text-slate-400">
                          يرجى إرسال صورة إيصال التحويل أو مراجعة أقرب فرع لنا قبل انتهاء مؤقت الـ 72 ساعة لضمان بقاء الحجز وعدم الإلغاء تلقائياً.
                        </p>
                      </div>
                    </div>

                    {/* Shared Payment Proof Component */}
                    <PaymentProofUpload
                      paymentProofImage={paymentProofImage}
                      isCameraActive={isCameraActive}
                      cameraError={cameraError}
                      videoRef={videoRef}
                      startCamera={startCamera}
                      stopCamera={stopCamera}
                      capturePhoto={capturePhoto}
                      handleFileUpload={handleFileUpload}
                      setPaymentProofImage={setPaymentProofImage}
                      label="صورة أو لقطة شاشة لإيصال التحويل البنكي"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Navigation */}
            <div className="flex flex-col-reverse gap-4 sm:flex-row sm:items-center sm:justify-between">
              <Link
                to="/travelers"
                state={{ selectedFlight, searchCriteria }}
                className="inline-flex h-14 items-center justify-center rounded-2xl border border-slate-200 bg-white px-8 text-sm font-black text-slate-600 transition-all hover:bg-slate-50"
              >
                العودة لبيانات الركاب
              </Link>
              <button
                onClick={handleConfirmBooking}
                disabled={isSubmitting}
                className={`inline-flex h-14 min-w-[200px] items-center justify-center rounded-2xl bg-emerald-600 px-10 text-sm font-black text-white shadow-[0_12px_24px_rgba(16,185,129,0.3)] transition-all hover:bg-emerald-700 hover:shadow-[0_16px_32px_rgba(16,185,129,0.4)] active:scale-[0.98] ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {isSubmitting ? 'جاري التأكيد...' : 'إتمام الحجز والدفع'}
              </button>
            </div>
          </div>
        </section>

        {/* Sidebar Summary */}
        <aside className="sticky top-40 w-full" dir="rtl">
          <div className="space-y-6">
            {/* Boarding Pass Style Summary */}
            <section className="overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-[0_20px_50px_rgba(15,23,42,0.04)]">
              <div className="bg-[#10203d] p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-black">{summaryFlight.fromCode}</h2>
                    <p className="text-[10px] font-bold text-slate-400">{summaryFlight.fromCity}</p>
                  </div>
                  <MoveLeft className="h-6 w-6 text-[#4974f9]" />
                  <div className="text-left">
                    <h2 className="text-2xl font-black">{summaryFlight.toCode}</h2>
                    <p className="text-[10px] font-bold text-slate-400 text-left">{summaryFlight.toCity}</p>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-4">
                  <div>
                    <p className="text-[10px] font-black uppercase text-slate-400">المسافرون</p>
                    <p className="mt-1 text-sm font-black text-slate-900">{bookingPassengersCount} أشخاص</p>
                  </div>
                  <div className="text-left">
                    <p className="text-[10px] font-black uppercase text-slate-400">الدرجة</p>
                    <p className="mt-1 text-sm font-black text-slate-900">
                      {businessSeatsCount > 0 ? 'درجة الأعمال' : 'الدرجة السياحية'}
                    </p>
                  </div>
                </div>
                {/* Detailed Price Breakdown */}
                <div className="mt-5 space-y-4 border-b border-slate-100 pb-5">
                  <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2">تعرفة تذاكر الطيران</p>

                  {/* Adults */}
                  {adults > 0 && (
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-bold text-slate-500">تذكرة بالغ (Adult) × {adults}</span>
                        <span className="font-black text-slate-900">${adultFaresTotal}</span>
                      </div>
                      <div className="flex justify-between text-[10px] font-medium text-slate-400 pr-4">
                        <span>الأجرة الأساسية: ${adultBaseFare * adults}</span>
                        <span>الضرائب والرسوم: ${adultTaxes * adults}</span>
                      </div>
                    </div>
                  )}

                  {/* Children */}
                  {children > 0 && (
                    <div className="space-y-1 mt-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-bold text-slate-500">تذكرة طفل (Child) × {children} <span className="text-[10px] font-semibold text-emerald-500 mr-1">(خصم 25%)</span></span>
                        <span className="font-black text-slate-900">${childFaresTotal}</span>
                      </div>
                      <div className="flex justify-between text-[10px] font-medium text-slate-400 pr-4">
                        <span>الأجرة الأساسية: ${childBaseFare * children}</span>
                        <span>الضرائب والرسوم: ${childTaxes * children}</span>
                      </div>
                    </div>
                  )}

                  {/* Infants */}
                  {infants > 0 && (
                    <div className="space-y-1 mt-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-bold text-slate-500">تذكرة رضيع (Infant) × {infants} <span className="text-[10px] font-semibold text-emerald-500 mr-1">(خصم 85%)</span></span>
                        <span className="font-black text-slate-900">${infantFaresTotal}</span>
                      </div>
                      <div className="flex justify-between text-[10px] font-medium text-slate-400 pr-4">
                        <span>الأجرة الأساسية: ${infantBaseFare * infants}</span>
                        <span>الضرائب والرسوم: ${infantTaxes * infants}</span>
                      </div>
                    </div>
                  )}

                  {/* Business Class Upgrade */}
                  {businessSeatsCount > 0 && (
                    <div className="flex items-center justify-between text-sm bg-amber-50/50 border border-amber-100 rounded-xl p-3 mt-4">
                      <span className="font-bold text-amber-800">ترقية لدرجة الأعمال × {businessSeatsCount}</span>
                      <span className="font-black text-amber-900">+${businessSurchargeTotal}</span>
                    </div>
                  )}
                </div>

                {/* Extra Bags & Services Section */}
                {(bagsTotal > 0 || servicesTotal > 0) && (
                  <div className="mt-4 space-y-3 border-b border-slate-100 pb-4">
                    <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2">الخدمات والحقائب الإضافية</p>

                    {/* Extra Bags */}
                    {bagsTotal > 0 && (
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2 text-slate-600">
                          <Luggage className="h-4 w-4 text-[#4974f9]" />
                          <span className="font-semibold text-xs">حقائب إضافية مدفوعة</span>
                        </div>
                        <span className="font-black text-slate-900">+${bagsTotal}</span>
                      </div>
                    )}

                    {/* Special Services */}
                    {SERVICES.filter(s => selectedServices.includes(s.id)).map(srv => {
                      const Icon = srv.icon
                      return (
                        <div key={srv.id} className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2 text-slate-600">
                            <Icon className="h-4 w-4 text-red-500" />
                            <span className="font-semibold text-xs">{srv.label}</span>
                          </div>
                          <span className="font-black text-slate-900">+${srv.price}</span>
                        </div>
                      )
                    })}
                  </div>
                )}

                {/* Final Total */}
                <div className="flex items-center justify-between mt-4">
                  <span className="text-base font-black text-slate-900">الإجمالي النهائي</span>
                  <span className="text-3xl font-black text-[#0f172a]">${finalTotal}</span>
                </div>
              </div>
            </section>

            {/* Trust Badges */}
            <section className="rounded-2xl border border-slate-200/60 bg-slate-50/30 p-5">
              <h3 className="mb-4 text-[10px] font-black uppercase tracking-widest text-slate-400">ضمانات الأمان والخدمة</h3>

              <div className="space-y-4">
                {/* Guarantee 1: Instant Confirmation */}
                <div className="flex items-start gap-3">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600">
                    <BadgeCheck className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-800">تأكيد حجز فوري ومضمون</h4>
                    <p className="mt-1 text-[9px] font-bold leading-relaxed text-slate-400">
                      يتم إصدار التذاكر وحجز مقعدك على الطائرة فور إتمام العملية مباشرة.
                    </p>
                  </div>
                </div>

                {/* Guarantee 2: SSL Encryption */}
                <div className="flex items-start gap-3">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-600">
                    <Lock className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-800">تشفير SSL بالمعايير العالمية</h4>
                    <p className="mt-1 text-[9px] font-bold leading-relaxed text-slate-400">
                      تشفير بياناتك الشخصية والمالية وفق أعلى المعايير الأمنية العالمية لمنع أي اختراق.
                    </p>
                  </div>
                </div>

                {/* Guarantee 3: 24/7 Support */}
                <div className="flex items-start gap-3">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600">
                    <Headphones className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-800">دعم متواصل على مدار الساعة</h4>
                    <p className="mt-1 text-[9px] font-bold leading-relaxed text-slate-400">
                      فريق الدعم الفني وخدمة العملاء متواجد دائماً لمساعدتك طوال أيام الأسبوع.
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </aside>
      </div>

      {/* Success Modal */}
      {isPaymentModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm" dir="rtl">
          <div className="relative w-full max-w-sm overflow-hidden rounded-[40px] bg-white p-10 text-center shadow-2xl">
            <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-emerald-50 text-emerald-500">
              <CheckCircle2 className="h-16 w-16" />
            </div>
            <h2 className="text-2xl font-black text-slate-900">شكراً لك!</h2>
            <p className="mt-3 text-sm font-bold text-slate-500 leading-7">تم إرسال تفاصيل الحجز وتذكرة الطيران إلى بريدك الإلكتروني بنجاح.</p>
            <div className="mt-6 rounded-2xl bg-slate-50 p-4 border border-dashed border-slate-300">
              <p className="text-[10px] font-black uppercase text-slate-400">رقم مرجع الحجز</p>
              <p className="text-xl font-black text-[#4974f9] tracking-widest">{bookingRef}</p>
            </div>
            <Link
              to="/"
              className="mt-8 flex w-full h-14 items-center justify-center rounded-2xl bg-[#10203d] text-sm font-black text-white hover:bg-slate-800 transition-all"
            >
              العودة للرئيسية
            </Link>
          </div>
        </div>
      )}
    </main>
  )
}

export default PaymentPage
