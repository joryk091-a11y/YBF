import { useEffect, useMemo, useState, useRef } from 'react'
import { Building2, CheckCircle2, CreditCard, Landmark, Lock, ShieldCheck, Plane, MoveLeft, ChevronDown, Luggage, HeartPulse, Accessibility, Wind, Salad, BadgeCheck, Headphones, Camera, Upload, MapPin, Phone, Trash2, AlertCircle, Building, Clock, RefreshCcw, FileText, X } from 'lucide-react'
import { useLocation, Link, useSearchParams } from 'react-router-dom'
import { useSearch } from '../utils/SearchContext'
import { useAuth } from '../utils/AuthContext'
import BookingStepper from '../components/BookingStepper.jsx'

import creditCardTemplate from '../assets/credite card.png'
import masterCardLogo from '../assets/mastercard logo.png'
import visaLogo from '../assets/visa.png'

const CARD_COUNTDOWN = 10 * 60 
const CONFIRMATION_COUNTDOWN = 3 * 24 * 60 * 60

const SERVICES = [
  { id: 'wheelchair', icon: Accessibility, label: 'مساعدة بالكرسي المتحرك', desc: 'خدمة مرافقة وكرسي متحرك داخل المطار والطائرة', price: 0, color: 'blue' },
  { id: 'oxygen', icon: Wind, label: 'أكسجين طبي على المتن', desc: 'توفير أسطوانة أكسجين طبية معتمدة خلال الرحلة', price: 15, color: 'sky' },
  { id: 'medical', icon: HeartPulse, label: 'مساعدة طبية متخصصة', desc: 'طاقم طبي مدرّب لمرافقة المريض طوال الرحلة', price: 50, color: 'orange' },
  { id: 'medmeal', icon: HeartPulse, label: 'سيارة إسعاف', desc: 'تأمين سيارة إسعاف مجهزة لنقل المريض من/إلى الطائرة', price: 12.50, color: 'emerald' },
]

const paymentMethods = [
  {
    id: 'card',
    label: 'بطاقة ائتمانية / خصم',
    description: 'Visa, Mastercard',
    logos: [visaLogo, masterCardLogo],
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
        <Camera className="h-4 w-4 text-brand-blue" />
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
              className="bg-brand-blue text-white font-black px-6 py-2.5 rounded-xl shadow-lg hover:bg-[#3b63db] active:scale-95 transition-all text-xs cursor-pointer"
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
            {}
            <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 hover:border-brand-blue hover:bg-brand-blue/5 rounded-xl p-5 cursor-pointer transition-all text-center">
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

            {}
            <button
              type="button"
              onClick={startCamera}
              className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 hover:border-brand-blue hover:bg-brand-blue/5 rounded-xl p-5 transition-all text-center cursor-pointer"
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
  const selectedFlights = location.state?.selectedFlights || (selectedFlight ? [selectedFlight] : [])
  const seatsSelectionMap = location.state?.seatsSelectionMap || (location.state?.selectedSeats ? { 0: location.state.selectedSeats } : {})
  const searchCriteria = location.state?.searchCriteria || contextSearchCriteria
  const bookingPassengersCount = Number(searchCriteria?.passengerCount) || 1

  const passengers = location.state?.passengers || []
  const extraBags = location.state?.extraBags || {}
  const selectedServices = location.state?.selectedServices || {}
  const extrasTotal = Number(location.state?.extrasTotal) || 0
  const selectedSeats = location.state?.selectedSeats || []

  const BUSINESS_ROWS = [1, 2, 3]
  const BUSINESS_SURCHARGE = 100

  
  let businessSeatsCount = 0
  Object.values(seatsSelectionMap).forEach(flightSeats => {
    flightSeats.forEach(seat => {
      const rowMatch = seat.match(/^(\d+)/)
      if (rowMatch) {
        const rowNum = parseInt(rowMatch[1], 10)
        if (BUSINESS_ROWS.includes(rowNum)) {
          businessSeatsCount++
        }
      }
    })
  })

  const businessSurchargeTotal = businessSeatsCount * BUSINESS_SURCHARGE

  
  let adultFaresTotal = 0
  let childFaresTotal = 0
  let infantFaresTotal = 0

  let businessAdults = 0, economyAdults = 0
  let businessChildren = 0, economyChildren = 0
  let businessInfants = 0, economyInfants = 0

  passengers.forEach((p, passengerIdx) => {
    let passengerFare = 0
    let passengerHasBusiness = false

    selectedFlights.forEach((flight, flightIdx) => {
      const flightPrice = Number(flight.price) || 0
      const flightSeats = seatsSelectionMap[flightIdx] || []
      const seat = flightSeats[passengerIdx] || ''
      const seatRowMatch = seat.match(/^(\d+)/)
      const isBusinessSeat = seatRowMatch ? BUSINESS_ROWS.includes(parseInt(seatRowMatch[1], 10)) : false
      if (isBusinessSeat) {
        passengerHasBusiness = true
      }

      
      let segmentFare = flightPrice
      if (p.passengerCode === 'CHD') {
        segmentFare = Math.round(flightPrice * 0.75)
      } else if (p.passengerCode === 'INF') {
        segmentFare = Math.round(flightPrice * 0.10)
      }

      
      if (isBusinessSeat) {
        segmentFare += BUSINESS_SURCHARGE
      }

      passengerFare += segmentFare
    });

    if (p.passengerCode === 'CHD') {
      if (passengerHasBusiness) businessChildren++
      else economyChildren++
      childFaresTotal += passengerFare
    } else if (p.passengerCode === 'INF') {
      economyInfants++
      infantFaresTotal += passengerFare
    } else {
      if (passengerHasBusiness) businessAdults++
      else economyAdults++
      adultFaresTotal += passengerFare
    }
  })

  
  const basePrice = selectedFlights.reduce((sum, f) => sum + (Number(f.price) || 0), 0) || 856

  const economyAdultsTotal = economyAdults * basePrice
  const businessAdultsTotal = businessAdults * (basePrice + BUSINESS_SURCHARGE)

  const economyChildrenTotal = economyChildren * Math.round(basePrice * 0.75)
  const businessChildrenTotal = businessChildren * (Math.round(basePrice * 0.75) + BUSINESS_SURCHARGE)

  const economyInfantsTotal = economyInfants * Math.round(basePrice * 0.10)
  const businessInfantsTotal = 0

  const adultBaseFare = Math.round(basePrice * 0.85)
  const adultTaxes = basePrice - adultBaseFare

  const childBaseFare = Math.round(basePrice * 0.75 * 0.85)
  const childTaxes = Math.round(basePrice * 0.75) - childBaseFare

  const infantBaseFare = Math.round(basePrice * 0.10 * 0.85)
  const infantTaxes = Math.round(basePrice * 0.10) - infantBaseFare

  const EXTRA_BAG_PRICE = 2
  const bagsTotal = Object.values(extraBags).reduce((s, n) => s + n * EXTRA_BAG_PRICE, 0)
  const servicesTotal = SERVICES.reduce((sum, srv) => sum + (selectedServices[srv.id] || 0) * srv.price, 0)

  const ticketsTotal = adultFaresTotal + childFaresTotal + infantFaresTotal
  
  let baseTicketsTotal = 0
  passengers.forEach((p) => {
    selectedFlights.forEach((flight) => {
      const flightPrice = Number(flight.price) || 0
      if (p.passengerCode === 'CHD') {
        baseTicketsTotal += Math.round(flightPrice * 0.75)
      } else if (p.passengerCode === 'INF') {
        baseTicketsTotal += Math.round(flightPrice * 0.10)
      } else {
        baseTicketsTotal += flightPrice
      }
    })
  })

  const totalPrice = ticketsTotal
  const markupRate = Number(localStorage.getItem('adminMarkupRate') || '5')
  const markupFee = Math.round(baseTicketsTotal * (markupRate / 100))
  const finalTotal = ticketsTotal + extrasTotal + markupFee

  
  const summaryFlight = selectedFlights[0] || {
    fromCode: 'ADE',
    toCode: 'CAI',
    fromCity: 'عدن',
    toCity: 'القاهرة',
    airline_name: 'اليمنية'
  }

  const [searchParams] = useSearchParams()

  const [paymentMethod, setPaymentMethod] = useState('card')
  const [secondsLeft, setSecondsLeft] = useState(CARD_COUNTDOWN)

  useEffect(() => {
    if (searchParams.get('cancel') === 'true') {
      alert('تم إلغاء عملية الدفع، يرجى المحاولة مرة أخرى.');
    }
  }, [searchParams])
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
  const [agreed, setAgreed] = useState(false)
  const [isTermsOpen, setIsTermsOpen] = useState(false)
  const [validationError, setValidationError] = useState(null)

  
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
    if (!agreed) {
      setValidationError('يجب الموافقة على الشروط والأحكام وسياسة إلغاء وتعديل تذاكر الطيران لإتمام عملية الحجز.')
      return
    }

    setIsSubmitting(true)
    const passengers = location.state?.passengers || []
    const userObj = JSON.parse(localStorage.getItem('user') || '{}')
    const refVal = `YBF-${Math.random().toString(36).toUpperCase().substring(2, 8)}`

    
    const addMockBookingLocal = (referenceToUse) => {
      const newBookingRecord = {
        id: referenceToUse,
        flightId: summaryFlight?.id_flights || summaryFlight?.id || 1,
        flight_number: selectedFlights.map(f => f.flight_number).join(' / '),
        origin: selectedFlights[0]?.airportOrigin_code || selectedFlights[0]?.fromCode || 'ADE',
        destination: selectedFlights[selectedFlights.length - 1]?.airportDestination_code || selectedFlights[selectedFlights.length - 1]?.toCode || 'CAI',
        departure_time: selectedFlights[0]?.departure_time || '2026-06-15T08:30',
        passengers: passengers.map((p, idx) => {
          const classes = selectedFlights.map((_, fIdx) => {
            const fSeats = seatsSelectionMap[fIdx] || []
            const seat = fSeats[idx] || ''
            const rowMatch = seat.match(/^(\d+)/)
            return rowMatch && BUSINESS_ROWS.includes(parseInt(rowMatch[1], 10)) ? 'Business' : 'Economy'
          })
          const isBusinessOverall = classes.includes('Business')
          return {
            name: p.fullName || p.name || 'مسافر مجهول',
            passport_number: p.passportNumber || p.passport_number || 'Y-998877',
            seat: selectedFlights.map((_, fIdx) => (seatsSelectionMap[fIdx] || [])[idx] || '').join(' / '),
            travel_class: isBusinessOverall ? 'Business' : 'Economy',
            services: selectedServices || []
          }
        }),
        totalPrice: finalTotal,
        paymentMethod,
        status: (paymentMethod === 'branch' || paymentMethod === 'transfer') ? 'temporary' : 'certain',
        created_at: new Date().toISOString()
      }
      addBooking(newBookingRecord)

      
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
          flightId: selectedFlights.map(f => f.id_flights || f.id || 1),
          passengers,
          totalPrice: finalTotal,
          basePrice: ticketsTotal + businessSurchargeTotal,
          extraBags,
          selectedServices,
          extrasTotal,
          paymentMethod: paymentMethod === 'card' ? 'card' : paymentMethod,
          userId: userObj.id,
          reference: refVal,
          selectedSeats: seatsSelectionMap[0] || [],
          seatsSelectionMap,
          paymentProof: paymentProofImage,
          selectedBranchId: selectedBranch ? selectedBranch.id : null
        })
      })

      const data = await response.json()
      if (data.success) {
        setBookingRef(data.reference)
        addMockBookingLocal(data.reference)

        if (paymentMethod === 'card') {
          const stripeResponse = await fetch('http://localhost:8080/api/create-checkout-session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              bookingId: data.bookingId,
              reference: data.reference,
              amount: finalTotal,
              flightNumber: selectedFlights.map(f => f.flight_number).join(' / '),
              origin: selectedFlights[0]?.airportOrigin_code || 'ADE',
              destination: selectedFlights[selectedFlights.length - 1]?.airportDestination_code || 'CAI'
            })
          })
          const stripeData = await stripeResponse.json()
          if (stripeData.success && stripeData.url) {
            window.location.href = stripeData.url
            return
          } else {
            alert('حدث خطأ أثناء تشغيل الدفع بواسطة Stripe: ' + stripeData.error)
          }
        } else {
          setIsPaymentModalOpen(true)
        }
      } else {
        alert('حدث خطأ أثناء تأكيد الحجز: ' + data.error)
      }
    } catch (error) {
      console.error('Error confirming booking, falling back to mock save:', error)
      
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

  return (
    <main className="min-h-[100svh] bg-[#f3f4f6] pb-16 pt-24 sm:pt-28" dir="rtl">
      {}
      <div className="sticky top-16 z-40 w-full border-b border-slate-200 bg-white/90 py-4 backdrop-blur-xl sm:top-20">
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
                <p className="font-black text-orange-600" dir="ltr">{formatTime(secondsLeft)}</p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {}
            <div className="grid gap-4 md:grid-cols-3">
              {paymentMethods.map((method) => {
                const isActive = paymentMethod === method.id
                const Icon = method.icon
                return (
                  <button
                    key={method.id}
                    type="button"
                    onClick={() => handlePaymentMethodChange(method.id)}
                    className={`flex items-center justify-between rounded-2xl border p-4 text-right transition-all duration-200 ${isActive
                        ? 'border-brand-blue bg-brand-blue/5 shadow-[0_4px_20px_rgba(73,116,249,0.06)]'
                        : 'border-slate-200/80 bg-white hover:border-slate-300 hover:bg-slate-50/30'
                      }`}
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      {}
                      <div className={`flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full border transition-all ${isActive ? 'border-brand-blue bg-brand-blue' : 'border-slate-300 bg-white'
                        }`}>
                        {isActive && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                      </div>

                      {}
                      <div className="text-right">
                        <span className="block text-xs font-black text-slate-800">{method.label}</span>
                        <span className="block text-[10px] font-bold text-slate-400 mt-0.5">{method.description}</span>
                      </div>
                    </div>

                    {}
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
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-blue/5 text-brand-blue">
                          <Icon className="h-4 w-4" />
                        </div>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>

            {}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm sm:p-8">
              {paymentMethod === 'card' && (
                <div className="flex flex-col items-center py-10 text-center">
                  <div className="flex gap-4 items-center justify-center mb-6">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-blue/5 text-brand-blue">
                      <img src={visaLogo} alt="Visa" className="h-4.5 w-auto object-contain" />
                    </div>
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-500/5 text-amber-600">
                      <img src={masterCardLogo} alt="Mastercard" className="h-6 w-auto object-contain" />
                    </div>
                  </div>
                  <h3 className="text-sm font-black text-slate-800">الدفع الآمن عبر بطاقة الائتمان (Visa / Mastercard)</h3>
                  <p className="mt-2 max-w-md text-[11px] font-bold leading-relaxed text-slate-400">
                    عند النقر على "إتمام الحجز والدفع"، سنقوم بتوجيهك بشكل آمن إلى بوابة الدفع المعتمدة لدى Stripe لإدخال بيانات بطاقتك وإتمام العملية بأقصى درجات الأمان.
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
                        <Building className="h-4 w-4 text-brand-blue" />
                        <span>الدفع نقداً في مكاتب شركة الطيران</span>
                      </h3>
                      <p className="text-[11px] font-bold text-slate-400 mb-4 text-right leading-relaxed">
                        يمكنك زيارة أحد المكاتب أو الفروع والوكالات المعتمدة لشركة الطيران الناقلة ({selectedFlight?.airline_name || 'اليمنية للطيران'}) لدفع قيمة التذكرة نقداً وتأكيد حجزك. يرجى التأكيد وإرفاق إثبات الدفع قبل انتهاء مهلة الـ 72 ساعة لضمان بقاء المقاعد.
                      </p>
                    </div>

                    {}
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
                            <span className="font-black text-slate-800">بنك الكريمي</span>
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

                    {}
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

            {}
            <div className="mb-6 flex items-start gap-3 rounded-2xl border border-slate-100 bg-slate-50/50 p-4 text-right" dir="rtl">
              <button
                type="button"
                onClick={() => setAgreed((v) => !v)}
                className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition-all cursor-pointer ${
                  agreed ? 'border-brand-blue bg-brand-blue' : 'border-slate-300 bg-white hover:border-brand-blue'
                }`}
              >
                {agreed && <CheckCircle2 className="h-3.5 w-3.5 text-white" />}
              </button>
              <p className="text-xs font-bold leading-6 text-slate-600">
                لقد قرأت وأوافق على{' '}
                <button
                  type="button"
                  onClick={() => setIsTermsOpen(true)}
                  className="font-black text-brand-blue underline-offset-2 hover:underline transition cursor-pointer"
                >
                  الشروط والأحكام
                </button>
              </p>
            </div>

            {}
            <div className="flex flex-col-reverse gap-4 sm:flex-row sm:items-center sm:justify-between">
              <Link
                to="/travelers"
                state={{ selectedFlight, selectedFlights, seatsSelectionMap, searchCriteria }}
                className="inline-flex h-14 items-center justify-center rounded-2xl border border-slate-200 bg-white px-8 text-sm font-black text-slate-600 transition-all hover:bg-slate-50"
              >
                العودة لبيانات الركاب
              </Link>
              <button
                onClick={handleConfirmBooking}
                disabled={isSubmitting}
                className={`inline-flex h-14 min-w-[200px] items-center justify-center rounded-2xl bg-brand-blue px-10 text-sm font-black text-white shadow-[0_12px_24px_rgba(37,99,235,0.25)] transition-all hover:bg-blue-700 hover:shadow-[0_16px_32px_rgba(37,99,235,0.35)] active:scale-[0.98] ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {isSubmitting ? 'جاري التأكيد...' : 'إتمام الحجز والدفع'}
              </button>
            </div>
          </div>
        </section>

        {}
        <aside className="sticky top-40 w-full" dir="rtl">
          <div className="space-y-6">
            {}
            <section className="overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-[0_20px_50px_rgba(15,23,42,0.04)]">
              <div className="bg-gradient-to-br from-brand-blue to-indigo-900 p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-black">{summaryFlight.fromCode}</h2>
                    <p className="text-[10px] font-bold text-blue-200/70">{summaryFlight.fromCity}</p>
                  </div>
                  <MoveLeft className="h-6 w-6 text-blue-300" />
                  <div className="text-left">
                    <h2 className="text-2xl font-black">{summaryFlight.toCode}</h2>
                    <p className="text-[10px] font-bold text-blue-200/70 text-left">{summaryFlight.toCity}</p>
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
                {}
                <div className="mt-5 space-y-4 border-b border-slate-100 pb-5">
                  <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2">تعرفة تذاكر الطيران</p>

                  {}
                  {economyAdults > 0 && (
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-bold text-slate-500">تذكرة بالغ (سياحية) × {economyAdults}</span>
                        <span className="font-black text-slate-900">${economyAdults * basePrice}</span>
                      </div>
                      <div className="flex justify-between text-[10px] font-medium text-slate-400 pr-4">
                        <span>الأجرة الأساسية: ${Math.round(basePrice * 0.85) * economyAdults}</span>
                        <span>الضرائب والرسوم: ${(basePrice - Math.round(basePrice * 0.85)) * economyAdults}</span>
                      </div>
                    </div>
                  )}

                  {}
                  {businessAdults > 0 && (
                    <div className="space-y-1 mt-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-bold text-slate-500">تذكرة بالغ (درجة الأعمال) × {businessAdults}</span>
                        <span className="font-black text-slate-900">${businessAdults * (basePrice + BUSINESS_SURCHARGE)}</span>
                      </div>
                      <div className="flex justify-between text-[10px] font-medium text-slate-400 pr-4">
                        <span>الأجرة الأساسية: ${Math.round((basePrice + BUSINESS_SURCHARGE) * 0.85) * businessAdults}</span>
                        <span>الضرائب والرسوم: ${((basePrice + BUSINESS_SURCHARGE) - Math.round((basePrice + BUSINESS_SURCHARGE) * 0.85)) * businessAdults}</span>
                      </div>
                    </div>
                  )}

                  {}
                  {economyChildren > 0 && (
                    <div className="space-y-1 mt-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-bold text-slate-500">تذكرة طفل (سياحية) × {economyChildren} <span className="text-[10px] font-semibold text-emerald-500 mr-1">(خصم 25%)</span></span>
                        <span className="font-black text-slate-900">${economyChildren * Math.round(basePrice * 0.75)}</span>
                      </div>
                      <div className="flex justify-between text-[10px] font-medium text-slate-400 pr-4">
                        <span>الأجرة الأساسية: ${Math.round(basePrice * 0.75 * 0.85) * economyChildren}</span>
                        <span>الضرائب والرسوم: ${(Math.round(basePrice * 0.75) - Math.round(basePrice * 0.75 * 0.85)) * economyChildren}</span>
                      </div>
                    </div>
                  )}

                  {}
                  {businessChildren > 0 && (
                    <div className="space-y-1 mt-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-bold text-slate-500">تذكرة طفل (درجة الأعمال) × {businessChildren} <span className="text-[10px] font-semibold text-emerald-500 mr-1">(خصم 25%)</span></span>
                        <span className="font-black text-slate-900">${businessChildren * (Math.round(basePrice * 0.75) + BUSINESS_SURCHARGE)}</span>
                      </div>
                      <div className="flex justify-between text-[10px] font-medium text-slate-400 pr-4">
                        <span>الأجرة الأساسية: ${Math.round((Math.round(basePrice * 0.75) + BUSINESS_SURCHARGE) * 0.85) * businessChildren}</span>
                        <span>الضرائب والرسوم: ${((Math.round(basePrice * 0.75) + BUSINESS_SURCHARGE) - Math.round((Math.round(basePrice * 0.75) + BUSINESS_SURCHARGE) * 0.85)) * businessChildren}</span>
                      </div>
                    </div>
                  )}

                  {}
                  {economyInfants > 0 && (
                    <div className="space-y-1 mt-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-bold text-slate-500">تذكرة رضيع (على الحجر) × {economyInfants} <span className="text-[10px] font-semibold text-emerald-500 mr-1">(خصم 90%)</span></span>
                        <span className="font-black text-slate-900">${economyInfants * Math.round(basePrice * 0.10)}</span>
                      </div>
                      <div className="flex justify-between text-[10px] font-medium text-slate-400 pr-4">
                        <span>الأجرة الأساسية: ${Math.round(basePrice * 0.10 * 0.85) * economyInfants}</span>
                        <span>الضرائب والرسوم: ${(Math.round(basePrice * 0.10) - Math.round(basePrice * 0.10 * 0.85)) * economyInfants}</span>
                      </div>
                    </div>
                  )}
                </div>

                {}
                {(bagsTotal > 0 || servicesTotal > 0) && (
                  <div className="mt-4 space-y-3 border-b border-slate-100 pb-4">
                    <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2">الخدمات والوزن الإضافي</p>

                    {}
                    {bagsTotal > 0 && (
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2 text-slate-600">
                          <Luggage className="h-4 w-4 text-brand-blue" />
                          <span className="font-semibold text-xs">وزن إضافي مدفوع</span>
                        </div>
                        <span className="font-black text-slate-900">+${bagsTotal}</span>
                      </div>
                    )}

                    {}
                    {SERVICES.filter(s => selectedServices[s.id] > 0).map(srv => {
                      const Icon = srv.icon
                      const qty = selectedServices[srv.id]
                      return (
                        <div key={srv.id} className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2 text-slate-600">
                            <Icon className="h-4 w-4 text-orange-500" />
                            <span className="font-semibold text-xs">{srv.label} × {qty}</span>
                          </div>
                          <span className="font-black text-slate-900">+${srv.price * qty}</span>
                        </div>
                      )
                    })}

                    {}
                    <div className="flex items-center justify-between text-sm pt-3 border-t border-slate-100">
                      <div className="flex items-center gap-2 text-slate-600">
                        <ShieldCheck className="h-4 w-4 text-brand-blue" />
                        <span className="font-semibold text-xs">رسوم الخدمة للموقع ({markupRate}%)</span>
                      </div>
                      <span className="font-black text-slate-900">+${markupFee}</span>
                    </div>
                  </div>
                )}

                {}
                <div className="flex items-center justify-between mt-4">
                  <span className="text-base font-black text-slate-900">الإجمالي النهائي</span>
                  <span className="text-3xl font-black text-[#0f172a]">${finalTotal}</span>
                </div>
              </div>
            </section>

            {}
            <section className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-sm transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)]">
              <h3 className="mb-5 text-[11px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-2 border-b border-slate-100 pb-3 justify-start" dir="rtl">
                <ShieldCheck className="h-4 w-4 text-brand-blue" />
                <span>إجراءات الدفع وتأكيد الحجز</span>
              </h3>

              <div className="space-y-4">
                {}
                <div className="group flex items-start gap-3.5 p-3 rounded-2xl border border-transparent hover:border-slate-100 hover:bg-slate-50/50 transition-all duration-300 hover:scale-[1.02] hover:-translate-y-0.5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-blue/5 text-brand-blue transition-all duration-300 group-hover:bg-brand-blue group-hover:text-white group-hover:shadow-[0_4px_12px_rgba(73,116,249,0.2)] shadow-sm">
                    <CreditCard className="h-5 w-5" />
                  </div>
                  <div className="text-right">
                    <h4 className="text-xs font-black text-slate-800 transition-colors group-hover:text-slate-900">1. اختيار وسيلة الدفع</h4>
                    <p className="mt-1 text-[10px] font-bold leading-relaxed text-slate-400 transition-colors group-hover:text-slate-500">
                      يمكنك اختيار الدفع الفوري بالبطاقة الإلكترونية، أو الدفع لاحقاً حوالة بنكية/نقداً في فروعنا.
                    </p>
                  </div>
                </div>

                {}
                <div className="group flex items-start gap-3.5 p-3 rounded-2xl border border-transparent hover:border-slate-100 hover:bg-slate-50/50 transition-all duration-300 hover:scale-[1.02] hover:-translate-y-0.5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-blue/5 text-brand-blue transition-all duration-300 group-hover:bg-brand-blue group-hover:text-white group-hover:shadow-[0_4px_12px_rgba(73,116,249,0.2)] shadow-sm">
                    <Camera className="h-5 w-5" />
                  </div>
                  <div className="text-right">
                    <h4 className="text-xs font-black text-slate-800 transition-colors group-hover:text-slate-900">2. إرفاق إثبات السداد</h4>
                    <p className="mt-1 text-[10px] font-bold leading-relaxed text-slate-400 transition-colors group-hover:text-slate-500">
                      في حال الدفع عبر الحوالات أو الفروع، يرجى تصوير ورفع إيصال السداد لتسريع عملية تفعيل حجزك.
                    </p>
                  </div>
                </div>

                {}
                <div className="group flex items-start gap-3.5 p-3 rounded-2xl border border-transparent hover:border-slate-100 hover:bg-slate-50/50 transition-all duration-300 hover:scale-[1.02] hover:-translate-y-0.5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-blue/5 text-brand-blue transition-all duration-300 group-hover:bg-brand-blue group-hover:text-white group-hover:shadow-[0_4px_12px_rgba(73,116,249,0.2)] shadow-sm">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div className="text-right">
                    <h4 className="text-xs font-black text-slate-800 transition-colors group-hover:text-slate-900">3. التحقق والمراجعة</h4>
                    <p className="mt-1 text-[10px] font-bold leading-relaxed text-slate-400 transition-colors group-hover:text-slate-500">
                      سيقوم النظام أو موظفينا بالتحقق من الحوالة وتأكيد مقاعدك مباشرة فور استلام القيمة.
                    </p>
                  </div>
                </div>

                {}
                <div className="group flex items-start gap-3.5 p-3 rounded-2xl border border-transparent hover:border-slate-100 hover:bg-slate-50/50 transition-all duration-300 hover:scale-[1.02] hover:-translate-y-0.5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-blue/5 text-brand-blue transition-all duration-300 group-hover:bg-brand-blue group-hover:text-white group-hover:shadow-[0_4px_12px_rgba(73,116,249,0.2)] shadow-sm">
                    <BadgeCheck className="h-5 w-5" />
                  </div>
                  <div className="text-right">
                    <h4 className="text-xs font-black text-slate-800 transition-colors group-hover:text-slate-900">4. إصدار التذكرة الرسمية</h4>
                    <p className="mt-1 text-[10px] font-bold leading-relaxed text-slate-400 transition-colors group-hover:text-slate-500">
                      بمجرد تأكيد الدفع، سيتم إرسال تذكرتك الإلكترونية (E-Ticket) المعتمدة على البريد الإلكتروني وواتساب.
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </aside>
      </div>

      {}
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
              <p className="text-xl font-black text-brand-blue tracking-widest">{bookingRef}</p>
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
      {}
      {isTermsOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm shadow-2xl" dir="rtl">
          <div className="relative w-full max-w-lg overflow-hidden rounded-[2.2rem] bg-white shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            {}
            <div className="flex items-center justify-between border-b border-slate-100 bg-white px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-blue/10">
                  <FileText className="h-5 w-5 text-brand-blue" />
                </div>
                <h2 className="text-lg font-black text-slate-900">شروط وأحكام الحجز</h2>
              </div>
              <button
                type="button"
                onClick={() => setIsTermsOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-50 text-slate-400 transition hover:bg-slate-100 hover:text-slate-900 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {}
            <div className="max-h-[50vh] overflow-y-auto px-6 py-6">
              <div className="space-y-5 text-right">
                {[
                  { num: '1', title: 'قبول الشروط', body: 'باستخدامك لمنصة Yemen Booking Flight، فإنك توافق على الالتزام بكافة الشروط والأحكام المذكورة هنا. يرجى قراءتها بعناية قبل إتمام أي عملية حجز.' },
                  { num: '2', title: 'سياسة الحجز', body: 'تخضع جميع الحجوزات لسياسات شركات الطيران المعنية. نحن نعمل كوسيط لتسهيل عملية الحجز، ولسنا مسؤولين عن أي تغييرات تطرأ على مواعيد الرحلات من قبل الشركات.' },
                  { num: '3', title: 'سياسة الإلغاء والاسترداد', body: 'تعتمد شروط الإلغاء والاسترداد على فئة التذكرة المشتراة وسياسة شركة الطيران. قد يتم تطبيق رسوم إدارية في حال طلب الإلغاء أو التغيير.' },
                  { num: '4', title: 'خصوصية البيانات', body: 'نحن ملتزمون بحماية بياناتك الشخصية وتشفيرها وفقاً لأعلى معايير الأمان العالمية. لن يتم مشاركة بياناتك مع أي طرف ثالث إلا لتنفيذ عملية الحجز.' },
                ].map(({ num, title, body }) => (
                  <div key={num} className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
                    <h3 className="text-sm font-black text-slate-900">{num}. {title}</h3>
                    <p className="mt-2 text-xs font-semibold leading-7 text-slate-500">{body}</p>
                  </div>
                ))}
              </div>
            </div>

            {}
            <div className="border-t border-slate-100 bg-slate-50 px-6 py-4">
              <button
                type="button"
                onClick={() => { setAgreed(true); setIsTermsOpen(false) }}
                className="flex h-12 w-full items-center justify-center rounded-2xl bg-brand-blue hover:bg-brand-blue-hover text-sm font-black text-white shadow-lg shadow-brand-blue/20 transition-all cursor-pointer active:scale-98"
              >
                <CheckCircle2 className="ml-2 h-4 w-4" />
                لقد قرأت الشروط وأوافق عليها
              </button>
            </div>
          </div>
        </div>
      )}

      {}
      {validationError !== null && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm shadow-2xl" dir="rtl">
          <div className="relative w-full max-w-sm overflow-hidden rounded-[2.2rem] bg-white p-6 shadow-2xl border border-slate-100/50 text-center animate-in fade-in zoom-in-95 duration-200">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-50 text-orange-500">
              <AlertCircle className="h-6 w-6" />
            </div>
            <h3 className="text-base font-black text-slate-900 mb-2">تنبيه: الموافقة على الشروط</h3>
            <p className="text-xs font-semibold text-slate-500 leading-relaxed mb-6 px-2">
              {validationError}
            </p>
            <button
              type="button"
              onClick={() => setValidationError(null)}
              className="w-full h-11 flex items-center justify-center rounded-xl bg-brand-blue hover:bg-brand-blue-hover text-xs font-black text-white transition-all cursor-pointer shadow-md shadow-brand-blue/10 active:scale-98"
            >
              موافق
            </button>
          </div>
        </div>
      )}
    </main>
  )
}

export default PaymentPage
