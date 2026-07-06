import { useState, useEffect } from 'react'
import { Calendar, ChevronDown, Globe, IdCard, Plane, PlaneTakeoff, MoveLeft, ShieldCheck, Lock, UserRound, Luggage, CheckCircle2, Plus, Minus, Accessibility, Wind, HeartPulse, Salad, AlertCircle, Clock, BadgeCheck } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useSearch } from '../utils/SearchContext'
import BookingStepper from '../components/BookingStepper.jsx'

const EXTRA_BAG_PRICE = 2

const SERVICES = [
  { id: 'wheelchair', icon: Accessibility, label: 'مساعدة بالكرسي المتحرك', desc: 'خدمة مرافقة وكرسي متحرك داخل المطار والطائرة', price: 20, color: 'blue' },
  { id: 'oxygen', icon: Wind, label: 'أكسجين طبي على المتن', desc: 'توفير أسطوانة أكسجين طبية معتمدة خلال الرحلة', price: 55, color: 'sky' },
  { id: 'medical', icon: HeartPulse, label: 'مساعدة طبية متخصصة', desc: 'طاقم طبي مدرّب لمرافقة المريض طوال الرحلة', price: 80, color: 'orange' },
  { id: 'medmeal', icon: HeartPulse, label: 'سيارة إسعاف', desc: 'تأمين سيارة إسعاف مجهزة لنقل المريض من/إلى الطائرة', price: 18, color: 'emerald' },
]

const createPassenger = (id) => ({
  id,
  fullName: '',
  passportNumber: '',
  nationality: '',
  birthDate: '',
  passportExpiry: '',
  passengerCode: '',
  passengerTypeLabel: '',
  gender: '',
})

const nationalityOptions = ['اليمن', 'السعودية', 'الإمارات', 'مصر', 'الأردن', 'تركيا', 'الهند']


const getPassengerCode = (birthDate) => {
  if (!birthDate) return { code: '-', label: 'غير محدد' }

  const today = new Date()
  const birth = new Date(birthDate)
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age -= 1
  }

  if (age < 2) return { code: 'INF', label: 'رضيع' }
  if (age < 12) return { code: 'CHD', label: 'طفل' }
  return { code: 'ADT', label: 'بالغ' }
}

function Field({ label, children, icon: Icon, className = '', required = false }) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label className="text-right text-[10px] font-black uppercase tracking-wider text-slate-400">
        {label}
        {required && <span className="mr-1 text-red-500">*</span>}
      </label>
      <div className="relative w-full">
        {Icon && (
          <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-slate-400">
            <Icon className="h-4 w-4" />
          </div>
        )}
        {children}
      </div>
    </div>
  )
}

function TravelersPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { searchCriteria: contextSearchCriteria } = useSearch()

  const selectedFlight = location.state?.selectedFlight
  const searchCriteria = location.state?.searchCriteria || contextSearchCriteria
  const selectedSeats = location.state?.selectedSeats || []
  const initialPassengerCount = Math.min(Math.max(Number(searchCriteria?.passengerCount) || 1, 1), 9)

  const [passengers, setPassengers] = useState(() =>
    Array.from({ length: initialPassengerCount }, (_, index) => createPassenger(index + 1)),
  )

  // Sync passengers list if count changes globally
  useEffect(() => {
    const currentCount = Number(searchCriteria?.passengerCount) || 1
    if (passengers.length !== currentCount) {
      setPassengers(Array.from({ length: currentCount }, (_, index) => createPassenger(index + 1)))
    }
  }, [searchCriteria?.passengerCount])

  const [activePassengerId, setActivePassengerId] = useState(1)

  // Pre-fill first passenger from logged-in user
  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (userData && passengers.length > 0 && !passengers[0].fullName) {
      const user = JSON.parse(userData)
      setPassengers(prev => prev.map((p, idx) =>
        idx === 0 ? { ...p, fullName: user.fullName || '' } : p
      ))
    }
  }, [passengers.length])

  const activePassenger = passengers.find((passenger) => passenger.id === activePassengerId) ?? passengers[0]
  const [showFullDetails, setShowFullDetails] = useState(false)

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

  const bookingPassengersCount = passengers.length
  const basePrice = Number(summaryFlight.price) || 856
  const totalPrice = basePrice * bookingPassengersCount

  const updatePassenger = (id, key, value) => {
    setPassengers((current) =>
      current.map((passenger) => {
        if (passenger.id !== id) return passenger

        if (key === 'birthDate') {
          const passengerType = getPassengerCode(value)
          return {
            ...passenger,
            birthDate: value,
            passengerCode: passengerType.code,
            passengerTypeLabel: passengerType.label,
          }
        }

        return { ...passenger, [key]: value }
      }),
    )
  }

  const [extraBags, setExtraBags] = useState(() =>
    Object.fromEntries(Array.from({ length: initialPassengerCount }, (_, i) => [i + 1, 0]))
  )
  const [selectedServices, setSelectedServices] = useState(new Set())

  const toggleService = (id) => {
    setSelectedServices(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const changeExtraBag = (passengerId, delta) => {
    setExtraBags(prev => ({
      ...prev,
      [passengerId]: Math.min(2, Math.max(0, (prev[passengerId] || 0) + delta))
    }))
  }

  const bagsTotal = Object.values(extraBags).reduce((s, n) => s + n * EXTRA_BAG_PRICE, 0)
  const servicesTotal = SERVICES.filter(s => selectedServices.has(s.id)).reduce((s, srv) => s + srv.price, 0)
  const extrasTotal = bagsTotal + servicesTotal

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

  const adultBaseFare = Math.round(basePrice * 0.85)
  const adultTaxes = basePrice - adultBaseFare
  const adultsTotal = adults * basePrice

  const childBaseFare = Math.round(basePrice * 0.75 * 0.85)
  const childTaxes = Math.round(basePrice * 0.75) - childBaseFare
  const childrenTotal = children * Math.round(basePrice * 0.75)

  const infantBaseFare = Math.round(basePrice * 0.15 * 0.85)
  const infantTaxes = Math.round(basePrice * 0.15) - infantBaseFare
  const infantsTotal = infants * Math.round(basePrice * 0.15)

  const ticketsTotal = adultsTotal + childrenTotal + infantsTotal
  const finalTotal = ticketsTotal + businessSurchargeTotal + extrasTotal

  const handleProceedToPayment = (e) => {
    e.preventDefault()

    for (const passenger of passengers) {
      if (!passenger.fullName || !passenger.passportNumber || !passenger.gender) {
        setActivePassengerId(passenger.id)
        alert(`يرجى إكمال البيانات الأساسية للراكب رقم ${passenger.id} (الاسم، رقم الجواز، والجنس)`)
        return
      }

      if (passenger.passportExpiry) {
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const expiryDate = new Date(passenger.passportExpiry)
        if (expiryDate < today) {
          setActivePassengerId(passenger.id)
          alert(`تاريخ انتهاء الجواز للراكب رقم ${passenger.id} لا يمكن أن يكون في الماضي. يرجى اختيار تاريخ انتهاء صالح في المستقبل.`)
          return
        }
      }
    }

    navigate('/payment', { state: { selectedFlight, searchCriteria, passengers, extraBags, selectedServices: [...selectedServices], extrasTotal, selectedSeats } })
  }

  return (
    <main className="min-h-[100svh] bg-[#f3f4f6] pb-20 pt-24 sm:pt-28" dir="rtl">
      {/* Sticky Stepper Bar */}
      <div className="sticky top-16 z-40 w-full border-b border-slate-200 bg-white/90 py-4 backdrop-blur-xl sm:top-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <BookingStepper current="travelers" />
        </div>
      </div>

      <div className="mx-auto mt-10 grid w-full max-w-7xl gap-8 px-4 lg:grid-cols-[1fr_340px] sm:px-6" dir="ltr">
        <section className="w-full min-w-0" dir="rtl">
          <div className="mb-10 text-right">
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">بيانات المسافرين</h1>
            <p className="mt-2 text-xs font-medium text-slate-400">
              الرجاء إدخال تفاصيل وثيقة السفر مطابقة تماماً لجواز السفر لتجنب أي إشكالات في مطار المغادرة.
            </p>
          </div>

          <div className="space-y-4">
            {passengers.map((passenger) => {
              const isActive = passenger.id === activePassengerId
              const isComplete = passenger.fullName && passenger.passportNumber && passenger.gender

              return (
                <article
                  key={passenger.id}
                  className={`overflow-hidden rounded-[2.2rem] border transition-all duration-300 ${isActive
                      ? 'border-blue-100 bg-white shadow-[0_20px_40px_rgba(0,0,0,0.03)]'
                      : 'border-slate-200/60 bg-white/70 hover:bg-white hover:border-slate-300'
                    }`}
                >
                  <button
                    type="button"
                    onClick={() => setActivePassengerId(passenger.id)}
                    className="flex w-full items-center justify-between px-6 py-4 text-right transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-300 ${
                        isActive ? 'bg-brand-blue text-white shadow-sm shadow-brand-blue/20' : 'bg-slate-100 text-slate-400'
                      }`}>
                        <UserRound className="h-4.5 w-4.5" />
                      </div>
                      <div>
                        <span className="block text-sm font-black text-slate-800">المسافر {passenger.id}</span>
                        {passenger.fullName ? (
                          <span className="text-[11px] font-bold text-slate-400 mt-0.5 block">{passenger.fullName}</span>
                        ) : (
                          <span className="text-[11px] font-bold text-slate-300 mt-0.5 block">لم تكتمل البيانات بعد</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {isComplete ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-black text-emerald-600 border border-emerald-100">
                          <CheckCircle2 className="h-3 w-3" />
                          مكتمل
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-orange-50 px-2.5 py-1 text-[10px] font-black text-orange-600 border border-orange-100">
                          <span className="h-1.5 w-1.5 rounded-full bg-orange-500 animate-pulse" />
                          غير مكتمل
                        </span>
                      )}

                      {passenger.passengerTypeLabel && (
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-black text-slate-500">
                          {passenger.passengerTypeLabel}
                        </span>
                      )}

                      <div className={`flex h-6 w-6 items-center justify-center rounded-full border transition-all ${
                        isActive ? 'border-slate-300 bg-slate-50 text-slate-800' : 'border-slate-100 text-slate-400'
                      }`}>
                        <ChevronDown className={`h-3 w-3 transition-transform duration-300 ${isActive ? 'rotate-180' : ''}`} />
                      </div>
                    </div>
                  </button>

                  <div className={`grid transition-all duration-500 ease-in-out ${isActive ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                    <div className="overflow-hidden">
                      <div className="border-t border-slate-50 p-6 sm:p-8">
                        {/* Gender Selector */}
                        <div className="mb-6">
                          <div className="grid grid-cols-2 gap-3 w-full">
                            <button
                              type="button"
                              onClick={() => updatePassenger(passenger.id, 'gender', 'male')}
                              className={`flex items-center justify-center h-12 rounded-xl border font-black text-xs transition-all duration-200 ${
                                passenger.gender === 'male'
                                  ? 'border-brand-blue bg-brand-blue/5 text-brand-blue shadow-[0_2px_8px_rgba(73,116,249,0.06)]'
                                  : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:bg-slate-50/50'
                              }`}
                            >
                              ذكر
                            </button>
                            <button
                              type="button"
                              onClick={() => updatePassenger(passenger.id, 'gender', 'female')}
                              className={`flex items-center justify-center h-12 rounded-xl border font-black text-xs transition-all duration-200 ${
                                passenger.gender === 'female'
                                  ? 'border-pink-500 bg-pink-50/20 text-pink-600 shadow-[0_2px_8px_rgba(236,72,153,0.06)]'
                                  : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:bg-slate-50/50'
                              }`}
                            >
                              أنثى
                            </button>
                          </div>
                        </div>

                        <div className="grid gap-6 md:grid-cols-2">
                          <Field label="الاسم الكامل (كما في جواز السفر)" icon={UserRound} className="md:col-span-2" required>
                            <input
                              className="w-full h-12 pr-11 pl-4 rounded-xl border border-slate-200/80 bg-white text-slate-800 font-bold text-xs placeholder:text-slate-300 focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/5 focus:outline-none transition-all duration-150"
                              placeholder="مثال: محمد أحمد علي"
                              value={passenger.fullName}
                              onChange={(event) => updatePassenger(passenger.id, 'fullName', event.target.value)}
                            />
                          </Field>

                          <Field label="رقم جواز السفر" icon={IdCard} required>
                            <input
                              className="w-full h-12 pr-11 pl-4 rounded-xl border border-slate-200/80 bg-white text-slate-800 font-bold text-xs placeholder:text-slate-300 focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/5 focus:outline-none transition-all duration-150"
                              placeholder="مثال: 00123456"
                              value={passenger.passportNumber}
                              onChange={(event) => updatePassenger(passenger.id, 'passportNumber', event.target.value)}
                            />
                          </Field>

                          <Field label="الجنسية" icon={Globe}>
                            <select
                              className="w-full h-12 pr-11 pl-10 rounded-xl border border-slate-200/80 bg-white text-slate-800 font-bold text-xs focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/5 focus:outline-none transition-all duration-150 appearance-none"
                              value={passenger.nationality}
                              onChange={(event) => updatePassenger(passenger.id, 'nationality', event.target.value)}
                            >
                              <option value="" disabled>اختر الجنسية</option>
                              {nationalityOptions.map((item) => (
                                <option key={item} value={item}>{item}</option>
                              ))}
                            </select>
                            <ChevronDown className="pointer-events-none absolute left-4 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                          </Field>

                          <Field label="تاريخ الميلاد" icon={Calendar}>
                            <input
                              type={passenger.birthDate ? "date" : "text"}
                              placeholder="يوم / شهر / سنة"
                              dir="ltr"
                              lang="en-GB"
                              onFocus={(e) => (e.target.type = "date")}
                              onBlur={(e) => { if (!e.target.value) e.target.type = "text"; }}
                              className="w-full h-12 pr-11 pl-4 text-right rounded-xl border border-slate-200/80 bg-white text-slate-800 font-bold text-xs focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/5 focus:outline-none transition-all duration-150"
                              value={passenger.birthDate}
                              onChange={(event) => updatePassenger(passenger.id, 'birthDate', event.target.value)}
                            />
                          </Field>

                          <Field label="تاريخ انتهاء الجواز" icon={Calendar}>
                            <input
                              type={passenger.passportExpiry ? "date" : "text"}
                              placeholder="يوم / شهر / سنة"
                              dir="ltr"
                              lang="en-GB"
                              onFocus={(e) => (e.target.type = "date")}
                              onBlur={(e) => { if (!e.target.value) e.target.type = "text"; }}
                              min={new Date().toISOString().split('T')[0]}
                              className="w-full h-12 pr-11 pl-4 text-right rounded-xl border border-slate-200/80 bg-white text-slate-800 font-bold text-xs focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/5 focus:outline-none transition-all duration-150"
                              value={passenger.passportExpiry}
                              onChange={(event) => updatePassenger(passenger.id, 'passportExpiry', event.target.value)}
                            />
                          </Field>
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>

          {/* ═══════════════ جدول الأمتعة ═══════════════ */}
          <section className="mt-8 overflow-hidden rounded-[2.2rem] border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center gap-3 border-b border-slate-100 bg-white px-6 py-5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-blue/10 text-brand-blue">
                <Luggage className="h-4.5 w-4.5" />
              </div>
              <div>
                <h2 className="text-sm font-black text-slate-800">الوزن المسموح وحقائب الأمتعة</h2>
                <p className="text-[10px] font-bold text-slate-400 mt-0.5">الوزن المجاني المتاح حمله لكل مسافر على متن الطائرة مع خيارات إضافة وزن إضافي</p>
              </div>
            </div>

            <div className="p-6 divide-y divide-slate-100">
              {passengers.map(p => (
                <div key={p.id} className="py-4 first:pt-0 last:pb-0 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-400">
                      <UserRound className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs font-black text-slate-800">{p.fullName || `الراكب ${p.id}`}</p>
                      {p.passengerTypeLabel && <span className="text-[9px] font-black text-brand-blue">{p.passengerTypeLabel}</span>}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center sm:gap-4">
                    <div className="flex items-center justify-center gap-1.5 rounded-lg border border-slate-200/60 dark:border-slate-800 px-3 py-1.5 text-[11px] font-bold text-slate-600 dark:text-slate-300">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      حقيبة يد مقصورة (مجاناً): 7 كجم
                    </div>
                    <div className="flex items-center justify-center gap-1.5 rounded-lg border border-slate-200/60 dark:border-slate-800 px-3 py-1.5 text-[11px] font-bold text-slate-600 dark:text-slate-300">
                      <span className="h-1.5 w-1.5 rounded-full bg-brand-blue" />
                      حقيبة شحن رئيسية (مجاناً): 23 كجم
                    </div>
                  </div>

                  <div className="flex items-center gap-3 justify-end mt-2 sm:mt-0">
                    <div className="flex items-center gap-3 rounded-lg p-1 border border-slate-200/40 dark:border-slate-800">
                      <button onClick={() => changeExtraBag(p.id, -1)}
                        className="flex h-6 w-6 items-center justify-center rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition disabled:opacity-30"
                        disabled={!extraBags[p.id]}
                      ><Minus className="h-3 w-3" /></button>
                      <span className="w-12 text-center text-xs font-black text-slate-800 dark:text-slate-150">{(extraBags[p.id] || 0) * 2} كجم</span>
                      <button onClick={() => changeExtraBag(p.id, 1)}
                        className="flex h-6 w-6 items-center justify-center rounded-md bg-brand-blue text-white hover:bg-[#3862e0] transition disabled:opacity-30"
                        disabled={extraBags[p.id] >= 2}
                      ><Plus className="h-3 w-3" /></button>
                    </div>
                    {extraBags[p.id] > 0 && (
                      <span className="text-xs font-black text-brand-blue dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30 px-2 py-1 rounded-md">
                        +${extraBags[p.id] * EXTRA_BAG_PRICE}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ═══════════════ جدول الخدمات الصحية ═══════════════ */}
          <section className="mt-6 overflow-hidden rounded-[2.2rem] border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center gap-3 border-b border-slate-100 bg-white px-6 py-5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-500/10 text-orange-600">
                <HeartPulse className="h-4.5 w-4.5" />
              </div>
              <div>
                <h2 className="text-sm font-black text-slate-800">الرعاية والخدمات الطبية الاختيارية</h2>
                <p className="text-[10px] font-bold text-slate-400 mt-0.5">خدمات إضافية مخصصة لضمان سلامتك وراحتك طوال الرحلة</p>
              </div>
            </div>

            <div className="grid gap-3 p-6 sm:grid-cols-2">
              {SERVICES.map(srv => {
                const isSelected = selectedServices.has(srv.id)
                const Icon = srv.icon
                return (
                  <button
                    key={srv.id}
                    type="button"
                    onClick={() => toggleService(srv.id)}
                    className={`flex items-start gap-4 rounded-xl border p-4 text-right transition-all duration-200 ${
                      isSelected
                        ? 'border-brand-blue bg-brand-blue/5 shadow-sm'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                    }`}
                  >
                    <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-all ${isSelected ? 'bg-brand-blue text-white shadow-sm' : 'bg-slate-100 text-slate-400'}`}>
                      <Icon className="h-4.5 w-4.5" />
                    </div>
                    <div className="flex-1 min-w-0 pr-0.5">
                      <p className="text-xs font-black text-slate-800">{srv.label}</p>
                      <p className="text-[10px] font-bold text-slate-400 mt-0.5 leading-4">{srv.desc}</p>
                      <span className={`inline-block mt-2 text-[10px] font-black px-2 py-0.5 rounded-full ${isSelected ? 'bg-brand-blue text-white' : 'bg-slate-100 text-slate-500'}`}>
                        +${srv.price}
                      </span>
                    </div>
                    <div className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-all ${
                      isSelected ? 'border-brand-blue bg-brand-blue text-white' : 'border-slate-300 bg-white'
                    }`}>
                      {isSelected && <CheckCircle2 className="h-3 w-3 text-white" />}
                    </div>
                  </button>
                )
              })}
            </div>

            {extrasTotal > 0 && (
              <div className="mx-6 mb-6 flex items-center justify-between rounded-2xl bg-brand-blue/5 border border-brand-blue/10 px-5 py-3.5 shadow-sm">
                <span className="text-xs font-black text-slate-650">إجمالي رسوم الخدمات الإضافية</span>
                <span className="text-xs font-black text-brand-blue">+${extrasTotal}</span>
              </div>
            )}
          </section>

          {/* Navigation Buttons */}
          <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Link
              to="/search"
              className="inline-flex h-12 items-center justify-center rounded-xl border border-slate-200 bg-white px-6 text-xs font-black text-slate-500 hover:text-slate-800 transition hover:bg-slate-50"
            >
              رجوع وتغيير الرحلة
            </Link>
            <button
              onClick={handleProceedToPayment}
              className="inline-flex h-12 min-w-[200px] items-center justify-center gap-1.5 rounded-xl bg-brand-blue px-8 text-xs font-black text-white shadow-[0_12px_24px_rgba(73,116,249,0.2)] hover:bg-brand-blue-hover transition active:scale-[0.98]"
            >
              المتابعة لخطوة الدفع
              <span>←</span>
            </button>
          </div>
        </section>

        {/* Premium Sidebar Summary */}
        <aside className="sticky top-40 w-full" dir="rtl">
          <div className="space-y-6">
            {/* Flight Card (Boarding Pass style) */}
            <section className="overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-[0_20px_50px_rgba(15,23,42,0.04)]">
              <div className="bg-gradient-to-br from-brand-blue to-indigo-900 p-6 text-white">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-200">ملخص الرحلة المختارة</p>
                <div className="mt-4 flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-black">{summaryFlight.fromCode}</h2>
                    <p className="text-xs font-bold text-blue-200/70">{summaryFlight.fromCity}</p>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <MoveLeft className="h-5 w-5 text-blue-300" />
                    <div className="h-px w-12 bg-white/20" />
                  </div>
                  <div className="text-left">
                    <h2 className="text-xl font-black">{summaryFlight.toCode}</h2>
                    <p className="text-xs font-bold text-blue-200/70 text-left">{summaryFlight.toCity}</p>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-2 gap-4 border-b border-slate-100 pb-4">
                  <div>
                    <p className="text-[10px] font-black uppercase text-slate-400">وقت الإقلاع</p>
                    <p className="mt-1 text-sm font-black text-slate-900">{summaryFlight.departTime}</p>
                  </div>
                  <div className="text-left">
                    <p className="text-[10px] font-black uppercase text-slate-400">مدة الرحلة</p>
                    <p className="mt-1 text-sm font-black text-slate-900">{summaryFlight.duration}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowFullDetails(!showFullDetails)}
                  className="mt-4 flex w-full items-center justify-center gap-2 text-xs font-black text-brand-blue hover:underline"
                >
                  {showFullDetails ? 'إخفاء التفاصيل' : 'عرض كامل التفاصيل'}
                  <ChevronDown className={`h-4 w-4 transition-transform duration-300 ${showFullDetails ? 'rotate-180' : ''}`} />
                </button>

                {/* Expanded Details */}
                <div className={`grid transition-all duration-500 ease-in-out ${showFullDetails ? 'grid-rows-[1fr] mt-6 opacity-100' : 'grid-rows-[0fr] mt-0 opacity-0'}`}>
                  <div className="overflow-hidden space-y-5">
                    <div className="rounded-2xl bg-transparent p-4 border border-slate-100">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="h-8 w-8 rounded-lg bg-slate-50 flex items-center justify-center border border-slate-100">
                          <Globe className="h-4 w-4 text-brand-blue" />
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">رقم الرحلة</p>
                          <p className="text-xs font-black text-slate-900">
                            {summaryFlight.airlineName ? `${summaryFlight.airlineName} - ` : ''}
                            {summaryFlight.flightNumber || 'غير متوفر'}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-4 relative">
                        {/* Timeline Line */}
                        <div className="absolute right-[15px] top-2 bottom-2 w-0.5 bg-slate-200" />

                        <div className="relative flex items-start gap-4 pr-8">
                          <div className="absolute right-0 top-1.5 h-2 w-2 rounded-full bg-brand-blue ring-4 ring-white" />
                          <div className="flex-1">
                            <p className="text-xs font-black text-slate-900">{summaryFlight.departTime} - {summaryFlight.fromCity}</p>
                            <p className="text-[10px] font-bold text-slate-500 mt-0.5">{summaryFlight.fromAirport || 'مطار الإقلاع'}</p>
                          </div>
                        </div>

                        <div className="relative flex items-start gap-4 pr-8">
                          <div className="absolute right-0 top-1.5 h-2 w-2 rounded-full bg-slate-300 ring-4 ring-white" />
                          <div className="flex-1">
                            <p className="text-xs font-black text-slate-900">{summaryFlight.arriveTime} - {summaryFlight.toCity}</p>
                            <p className="text-[10px] font-bold text-slate-500 mt-0.5">{summaryFlight.toAirport || 'مطار الوصول'}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-2xl bg-transparent p-3 border border-slate-100">
                        <p className="text-[9px] font-black text-slate-400 uppercase mb-1">الدرجة</p>
                        <p className="text-[11px] font-black text-slate-900">
                          {businessSeatsCount > 0 ? 'درجة الأعمال' : 'الدرجة السياحية'}
                        </p>
                      </div>
                      <div className="rounded-2xl bg-transparent p-3 border border-slate-100 text-left">
                        <p className="text-[9px] font-black text-slate-400 uppercase mb-1">المقاعد المختارة</p>
                        <p className="text-[11px] font-black text-brand-blue tracking-wider">
                          {selectedSeats.length > 0 ? selectedSeats.join(' • ') : 'لم يتم الاختيار'}
                        </p>
                      </div>
                    </div>

                    {/* Extra Bags Summary */}
                    {Object.values(extraBags).some(n => n > 0) && (
                      <div className="rounded-2xl border border-brand-blue/20 bg-brand-blue/5 p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <Luggage className="h-4 w-4 text-brand-blue" />
                          <p className="text-[10px] font-black text-brand-blue uppercase tracking-wider">حقائب إضافية</p>
                        </div>
                        <div className="space-y-2">
                          {passengers.map(p => extraBags[p.id] > 0 && (
                            <div key={p.id} className="flex items-center justify-between">
                              <span className="text-[11px] font-bold text-slate-600">{p.fullName || `الراكب ${p.id}`}</span>
                              <span className="text-[11px] font-black text-slate-900">{extraBags[p.id]} حقيبة</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </section>

            {/* Price Breakdown */}
            <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-[0_20px_50px_rgba(15,23,42,0.04)]">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <h2 className="text-base font-black text-slate-900">تفاصيل السعر المفصلة</h2>
                <span className="rounded-full bg-blue-50 px-3 py-1 text-[10px] font-black text-blue-600 uppercase tracking-wider">السعر النهائي</span>
              </div>

              {/* Fares & Taxes Section */}
              <div className="mt-5 space-y-4 border-b border-slate-100 pb-5">
                <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2">تعرفة تذاكر الطيران</p>

                {/* Adults */}
                {adults > 0 && (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-black text-slate-700">تذكرة بالغ (Adult) × {adults}</span>
                      <span className="font-black text-slate-900">${adultsTotal}</span>
                    </div>
                    <div className="flex justify-between text-[11px] font-bold text-slate-400 pr-4">
                      <span>الأجرة الأساسية: ${adultBaseFare * adults}</span>
                      <span>الضرائب والرسوم: ${adultTaxes * adults}</span>
                    </div>
                  </div>
                )}

                {/* Children */}
                {children > 0 && (
                  <div className="space-y-1 mt-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-black text-slate-700">تذكرة طفل (Child) × {children} <span className="text-xs font-bold text-emerald-500 mr-1.5">(خصم 25%)</span></span>
                      <span className="font-black text-slate-900">${childrenTotal}</span>
                    </div>
                    <div className="flex justify-between text-[11px] font-bold text-slate-400 pr-4">
                      <span>الأجرة الأساسية: ${childBaseFare * children}</span>
                      <span>الضرائب والرسوم: ${childTaxes * children}</span>
                    </div>
                  </div>
                )}

                {/* Infants */}
                {infants > 0 && (
                  <div className="space-y-1 mt-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-black text-slate-700">تذكرة رضيع (Infant) × {infants} <span className="text-xs font-bold text-emerald-500 mr-1.5">(خصم 85%)</span></span>
                      <span className="font-black text-slate-900">${infantsTotal}</span>
                    </div>
                    <div className="flex justify-between text-[11px] font-bold text-slate-400 pr-4">
                      <span>الأجرة الأساسية: ${infantBaseFare * infants}</span>
                      <span>الضرائب والرسوم: ${infantTaxes * infants}</span>
                    </div>
                  </div>
                )}

                {/* Business Class Upgrade */}
                {businessSeatsCount > 0 && (
                  <div className="flex items-center justify-between text-sm bg-amber-50/50 border border-amber-100 rounded-2xl p-3 mt-4">
                    <span className="font-black text-amber-800">ترقية لدرجة الأعمال × {businessSeatsCount}</span>
                    <span className="font-black text-amber-900">+${businessSurchargeTotal}</span>
                  </div>
                )}
              </div>

              {/* Extra Bags & Services Section */}
              {(bagsTotal > 0 || servicesTotal > 0) && (
                <div className="mt-5 space-y-3 border-b border-slate-100 pb-5">
                  <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2">الخدمات والوزن الإضافي</p>

                  {/* Extra Bags */}
                  {bagsTotal > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 text-slate-600">
                        <Luggage className="h-4 w-4 text-brand-blue" />
                        <span className="font-bold">وزن إضافي مدفوع</span>
                      </div>
                      <span className="font-black text-slate-900">+${bagsTotal}</span>
                    </div>
                  )}

                  {/* Special Services */}
                  {SERVICES.filter(s => selectedServices.has(s.id)).map(srv => {
                    const Icon = srv.icon
                    return (
                      <div key={srv.id} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2 text-slate-600">
                          <Icon className="h-4 w-4 text-orange-500" />
                          <span className="font-bold">{srv.label}</span>
                        </div>
                        <span className="font-black text-slate-900">+${srv.price}</span>
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Final Sum */}
              <div className="mt-5 flex items-center justify-between">
                <div>
                  <span className="text-base font-black text-slate-900 block">الإجمالي النهائي</span>
                  <span className="text-[10px] font-bold text-slate-400 mt-0.5 block">شامل جميع الرسوم والضرائب المطبقة</span>
                </div>
                <span className="text-3xl font-black text-[#0f172a]">${finalTotal}</span>
              </div>
            </section>

            {/* Travel Guidelines */}
            <section className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-sm transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)]">
              <h3 className="mb-5 text-[11px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-2 border-b border-slate-100 pb-3 justify-start" dir="rtl">
                <AlertCircle className="h-4 w-4 text-brand-blue" />
                <span>إرشادات هامة قبل تأكيد الحجز</span>
              </h3>

              <div className="space-y-4">
                {/* Guideline 1: Name match */}
                <div className="group flex items-start gap-3.5 p-3 rounded-2xl border border-transparent hover:border-slate-100 hover:bg-slate-50/50 transition-all duration-300 hover:scale-[1.02] hover:-translate-y-0.5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-blue/5 text-brand-blue transition-all duration-300 group-hover:bg-brand-blue group-hover:text-white group-hover:shadow-[0_4px_12px_rgba(73,116,249,0.2)] shadow-sm">
                    <BadgeCheck className="h-5 w-5" />
                  </div>
                  <div className="text-right">
                    <h4 className="text-xs font-black text-slate-800 transition-colors group-hover:text-slate-900">تطابق أسماء المسافرين</h4>
                    <p className="mt-1 text-[10px] font-bold leading-relaxed text-slate-400 transition-colors group-hover:text-slate-500">
                      يجب كتابة الأسماء تماماً كما هي واردة في جواز السفر لتفادي رسوم وغرامات التعديل لاحقاً.
                    </p>
                  </div>
                </div>

                {/* Guideline 2: Passport Validity */}
                <div className="group flex items-start gap-3.5 p-3 rounded-2xl border border-transparent hover:border-slate-100 hover:bg-slate-50/50 transition-all duration-300 hover:scale-[1.02] hover:-translate-y-0.5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-blue/5 text-brand-blue transition-all duration-300 group-hover:bg-brand-blue group-hover:text-white group-hover:shadow-[0_4px_12px_rgba(73,116,249,0.2)] shadow-sm">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div className="text-right">
                    <h4 className="text-xs font-black text-slate-800 transition-colors group-hover:text-slate-900">صلاحية جواز السفر</h4>
                    <p className="mt-1 text-[10px] font-bold leading-relaxed text-slate-400 transition-colors group-hover:text-slate-500">
                      تأكد من صلاحية جواز سفرك لمدة لا تقل عن 6 أشهر للرحلات الدولية لتجنب إلغاء السفر في المطار.
                    </p>
                  </div>
                </div>

                {/* Guideline 3: Airport Arrival */}
                <div className="group flex items-start gap-3.5 p-3 rounded-2xl border border-transparent hover:border-slate-100 hover:bg-slate-50/50 transition-all duration-300 hover:scale-[1.02] hover:-translate-y-0.5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-blue/5 text-brand-blue transition-all duration-300 group-hover:bg-brand-blue group-hover:text-white group-hover:shadow-[0_4px_12px_rgba(73,116,249,0.2)] shadow-sm">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div className="text-right">
                    <h4 className="text-xs font-black text-slate-800 transition-colors group-hover:text-slate-900">مواعيد التواجد بالمطار</h4>
                    <p className="mt-1 text-[10px] font-bold leading-relaxed text-slate-400 transition-colors group-hover:text-slate-500">
                      يرجى التواجد في المطار قبل 3 ساعات من موعد الإقلاع للرحلات الدولية وقبل ساعتين للرحلات الداخلية.
                    </p>
                  </div>
                </div>

                {/* Guideline 4: Baggage Policy */}
                <div className="group flex items-start gap-3.5 p-3 rounded-2xl border border-transparent hover:border-slate-100 hover:bg-slate-50/50 transition-all duration-300 hover:scale-[1.02] hover:-translate-y-0.5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-blue/5 text-brand-blue transition-all duration-300 group-hover:bg-brand-blue group-hover:text-white group-hover:shadow-[0_4px_12px_rgba(73,116,249,0.2)] shadow-sm">
                    <Luggage className="h-5 w-5" />
                  </div>
                  <div className="text-right">
                    <h4 className="text-xs font-black text-slate-800 transition-colors group-hover:text-slate-900">الأمتعة والأوزان المسموحة</h4>
                    <p className="mt-1 text-[10px] font-bold leading-relaxed text-slate-400 transition-colors group-hover:text-slate-500">
                      يرجى مراجعة تفاصيل الوزن المسموح به في تذكرتك لتفادي دفع رسوم إضافية للوزن الزائد في المطار.
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </aside>
      </div>
    </main>
  )
}

export default TravelersPage
