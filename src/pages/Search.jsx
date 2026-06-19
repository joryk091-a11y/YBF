import { useMemo, useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useSearch } from '../utils/SearchContext'
import { CheckCircle2, ChevronDown, Plane, ShieldCheck, SlidersHorizontal, Clock, TrendingUp, Package, DollarSign, MapPin, Calendar, Users } from 'lucide-react'
import BookingStepper from '../components/BookingStepper.jsx'
import logoY from '../assets/Y.png'
import logoB from '../assets/B.png'
import logoF from '../assets/F.png'
import flightLine from '../assets/line.jpeg'

const initialFilters = {
  priceMin: 0,
  priceMax: 2000,
}

const airlinePanelItems = [
  { id: 'yemenia', name: 'اليمنية', logo: logoY },
  { id: 'balqis', name: 'طيران بلقيس', logo: logoB },
  { id: 'aden', name: 'طيران عدن', logo: logoF },
]

const searchModeLabels = {
  'one-way': 'مسار واحد',
  'round-trip': 'مسارين',
  'multi-city': 'مدن متعددة',
}

const airportMap = {
  aden: { city: 'عدن', airport: 'مطار عدن الدولي', region: 'عدن' },
  mukalla: { city: 'المكلا', airport: 'مطار الريان', region: 'حضرموت' },
  seiyun: { city: 'سيئون', airport: 'مطار غراف', region: 'حضرموت' },
  alghaydah: { city: 'الغيضة', airport: 'مطار الغيضة', region: 'المهرة' },
  socotra: { city: 'سقطرى', airport: 'مطار سقطرى', region: 'سقطرى' },
  ataq: { city: 'عتق', airport: 'مطار عتق', region: 'شبوة' },
  jeddah: { city: 'جدة', airport: 'مطار الملك عبدالعزيز', region: 'السعودية' },
  riyadh: { city: 'الرياض', airport: 'مطار الملك خالد', region: 'السعودية' },
  kuwait: { city: 'الكويت', airport: 'مطار الكويت الدولي', region: 'الكويت' },
  amman: { city: 'عمّان', airport: 'مطار الملكة علياء', region: 'الأردن' },
  cairo: { city: 'القاهرة', airport: 'مطار القاهرة الدولي', region: 'مصر' },
  djibouti: { city: 'جيبوتي', airport: 'مطار جيبوتي الدولي', region: 'جيبوتي' },
  addis: { city: 'أديس أبابا', airport: 'مطار بولي الدولي', region: 'إثيوبيا' },
}

const formatSearchDate = (value) => (value ? String(value).replaceAll('-', '/') : 'غير محدد')

// Mock data removed for DB integration

function SearchPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { searchCriteria: contextSearchCriteria } = useSearch()
  const isShowAll = location.state?.showAll
  const searchCriteria = isShowAll
    ? { fromCity: '', toCity: '', travelDate: '', passengerCount: 1 }
    : { ...contextSearchCriteria, ...location.state?.searchCriteria }

  const [flights, setFlights] = useState([])
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState('الأفضل')
  const [priceMin, setPriceMin] = useState(initialFilters.priceMin)
  const [priceMax, setPriceMax] = useState(initialFilters.priceMax)
  const [selectedAirlines, setSelectedAirlines] = useState(() =>
    new Set(airlinePanelItems.map((item) => item.id)),
  )

  useEffect(() => {
    const fetchFlights = async () => {
      try {
        const from = searchCriteria?.fromCity || ''
        const to = searchCriteria?.toCity || ''
        const date = searchCriteria?.travelDate || ''

        const response = await fetch(`http://localhost:8080/api/search-flights?from=${from}&to=${to}&date=${date}`)
        const data = await response.json()

        if (data.success) {
          // Map DB fields to UI fields
          const mappedFlights = data.flights.map(f => {
            const airlineCode = String(f.airline_code || '').toUpperCase();
            const airlineInfo = airlinePanelItems.find(a =>
              (airlineCode === 'IY' || airlineCode === 'YEMENIA') && a.id === 'yemenia' ||
              (airlineCode === 'BS' || airlineCode === 'BALQIS' || airlineCode === 'SB') && a.id === 'balqis' ||
              (airlineCode === 'QY' || airlineCode === 'ADEN' || airlineCode === 'DH' || airlineCode === 'QTB') && a.id === 'aden'
            ) || { name: 'طيران', logo: logoY, id: 'other' };

            // Ensure airlineInfo.id is in selectedAirlines or fallback to yemenia for test
            const flightAirlineId = airlineInfo.id === 'other' ? 'yemenia' : airlineInfo.id;
            const flightAirlineName = f.airline_name || (airlineInfo.id === 'other' ? 'طيران' : airlineInfo.name);
            const flightLogo = airlineInfo.id === 'other' ? logoY : airlineInfo.logo;

            const dep = new Date(f.departure_time);
            const arr = new Date(f.arrival_time);
            const durMin = Math.floor((arr - dep) / (1000 * 60));
            const hours = Math.floor(durMin / 60);
            const mins = durMin % 60;

            return {
              id: f.id_flights,
              airlineId: flightAirlineId,
              airlineName: flightAirlineName,
              flightNumber: f.flight_number,
              logo: flightLogo,
              fromCode: f.airportOrigin_code,
              fromCity: airportMap[from]?.city || f.airportOrigin_code,
              fromAirport: airportMap[from]?.airport || '',
              toCode: f.airportDestination_code,
              toCity: airportMap[to]?.city || f.airportDestination_code,
              toAirport: airportMap[to]?.airport || '',
              departTime: dep.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
              arriveTime: arr.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
              duration: `${hours} س ${mins} د`,
              price: f.price || 0,
              raw: f
            }
          });
          setFlights(mappedFlights);
        }
      } catch (error) {
        console.error('Error fetching flights:', error);
      } finally {
        setLoading(false)
      }
    }

    fetchFlights()
  }, [searchCriteria])

  const getAirportLabel = (value) => {
    const airport = airportMap[value]
    return airport ? `${airport.region} - ${airport.airport}` : value || 'غير محدد'
  }

  const visibleFlights = useMemo(() => {
    const filtered = flights.filter((flight) => {
      if (!selectedAirlines.has(flight.airlineId)) return false
      return flight.price >= priceMin && flight.price <= priceMax
    })

    if (sortBy === 'الأرخص') {
      return [...filtered].sort((a, b) => a.price - b.price)
    }

    if (sortBy === 'الأسرع') {
      return [...filtered].sort((a, b) => {
        const toMinutes = (value) => {
          const h = Number(value.match(/(\d+)\sس/)?.[1] || 0)
          const m = Number(value.match(/(\d+)\sد/)?.[1] || 0)
          return h * 60 + m
        }
        return toMinutes(a.duration) - toMinutes(b.duration)
      })
    }

    return filtered
  }, [flights, priceMin, priceMax, selectedAirlines, sortBy])

  const toggleAirline = (id) => {
    setSelectedAirlines((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const resetFilters = () => {
    setPriceMin(initialFilters.priceMin)
    setPriceMax(initialFilters.priceMax)
    setSelectedAirlines(new Set(airlinePanelItems.map((item) => item.id)))
    setSortBy('الأفضل')
  }

  const handleSelectFlight = (flight) => {
    const user = localStorage.getItem('user')
    if (user) {
      navigate('/seats', { state: { selectedFlight: flight, searchCriteria } })
    } else {
      // Pass the current state to login so we can return here or proceed to seats
      navigate('/login', {
        state: {
          from: '/seats',
          selectedFlight: flight,
          searchCriteria
        }
      })
    }
  }

  return (
    <main className="min-h-[100svh] bg-[#f8f9fc] pb-16 pt-24 sm:pt-28" dir="rtl">
      {/* Premium Sub-Header / Stepper */}
      <div className="sticky top-16 z-40 w-full border-b border-slate-200/60 bg-white/80 py-4 backdrop-blur-xl sm:top-20">
        <div className="mx-auto max-w-[1380px] px-4 sm:px-6">
          <BookingStepper current="flights" />
        </div>
      </div>

      <section className="mx-auto mt-8 w-full max-w-[1380px] px-4 sm:px-6">
        {/* Sleek Search Summary Bar - Redesigned for Premium Look */}
        {isShowAll ? (
          <div className="mb-10 overflow-hidden rounded-[40px] border border-white/40 bg-gradient-to-r from-[#4974f9]/10 to-indigo-500/10 p-8 shadow-[0_32px_64px_rgba(0,0,0,0.04)] backdrop-blur-3xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 animate-in fade-in slide-in-from-top-5 duration-500" dir="rtl">
            <div>
              <h2 className="text-2xl font-black text-slate-900">جميع الوجهات والرحلات المتاحة</h2>
              <p className="text-xs font-semibold text-slate-500 mt-2">تصفح وقارن بين جميع الخطوط الجوية والرحلات المجدولة حالياً</p>
            </div>
            <Link to="/" className="relative flex h-11 items-center justify-center overflow-hidden rounded-2xl bg-slate-900 px-8 text-xs font-black text-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:bg-slate-800 active:scale-95 group/search shrink-0">
              <span className="relative z-10">بحث مخصص</span>
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover/search:translate-x-[100%] transition-transform duration-1000" />
            </Link>
          </div>
        ) : searchCriteria ? (
          <div className="mb-10 overflow-hidden rounded-[40px] border border-white/40 bg-white/70 shadow-[0_32px_64px_rgba(0,0,0,0.06)] backdrop-blur-3xl" dir="rtl">
            <div className="grid divide-y divide-slate-200/40 sm:grid-cols-4 sm:divide-x sm:divide-y-0 sm:divide-x-reverse">
              {/* Departure */}
              <div className="flex items-center gap-4 p-6 transition-all duration-300 hover:bg-white/50 group">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 group-hover:bg-[#4974f9] group-hover:text-white transition-all duration-500">
                  <MapPin className="h-6 w-6" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase tracking-[2px] text-slate-400 group-hover:text-[#4974f9] transition-colors">محطة الإقلاع</span>
                  <span className="mt-0.5 text-sm font-black text-slate-900 line-clamp-1">{getAirportLabel(searchCriteria.fromCity)}</span>
                </div>
              </div>

              {/* Destination */}
              <div className="flex items-center gap-4 p-6 transition-all duration-300 hover:bg-white/50 group">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 group-hover:bg-[#4974f9] group-hover:text-white transition-all duration-500">
                  <Plane className="h-6 w-6 rotate-90" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase tracking-[2px] text-slate-400 group-hover:text-[#4974f9] transition-colors">وجهة الوصول</span>
                  <span className="mt-0.5 text-sm font-black text-slate-900 line-clamp-1">{getAirportLabel(searchCriteria.toCity)}</span>
                </div>
              </div>

              {/* Date */}
              <div className="flex items-center gap-4 p-6 transition-all duration-300 hover:bg-white/50 group">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 group-hover:bg-[#4974f9] group-hover:text-white transition-all duration-500">
                  <Calendar className="h-6 w-6" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase tracking-[2px] text-slate-400 group-hover:text-[#4974f9] transition-colors">تاريخ السفر</span>
                  <span className="mt-0.5 text-sm font-black text-slate-900">{formatSearchDate(searchCriteria.travelDate)}</span>
                </div>
              </div>

              {/* Passengers & Edit */}
              <div className="flex items-center justify-between p-6 transition-all duration-300 hover:bg-white/50 group">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 group-hover:bg-[#4974f9] group-hover:text-white transition-all duration-500">
                    <Users className="h-6 w-6" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase tracking-[2px] text-slate-400 group-hover:text-[#4974f9] transition-colors">المسافرون</span>
                    <span className="mt-0.5 text-sm font-black text-slate-900">{searchCriteria.passengerCount ?? 1} مسافر</span>
                  </div>
                </div>
                <Link to="/" className="relative flex h-10 items-center justify-center overflow-hidden rounded-xl bg-slate-900 px-6 text-xs font-black text-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:bg-slate-800 active:scale-95 group/edit">
                  <span className="relative z-10">تعديل</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover/edit:translate-x-[100%] transition-transform duration-1000" />
                </Link>
              </div>
            </div>
          </div>
        ) : null}

        <div className="grid items-start gap-8 lg:grid-cols-[300px_minmax(0,1fr)]">
          {/* Professional Filters Sidebar */}
          <aside className="sticky top-40 hidden space-y-6 lg:block" dir="rtl">
            <div className="rounded-[40px] border border-white/40 bg-white/70 p-8 shadow-[0_30px_60px_rgba(0,0,0,0.04)] backdrop-blur-3xl">
              <div className="mb-10 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-black text-slate-900">تصفية الرحلات</h2>
                  <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">تحكم في تفاصيل بحثك</p>
                </div>
                <div className="h-12 w-12 rounded-2xl bg-[#4974f9]/10 flex items-center justify-center text-[#4974f9]">
                  <SlidersHorizontal className="h-6 w-6" />
                </div>
              </div>

              <div className="space-y-10">
                {/* Price Filter */}
                <div className="group">
                  <h3 className="mb-6 flex items-center gap-2 text-[11px] font-black uppercase tracking-[3px] text-slate-400">
                    <DollarSign className="h-3.5 w-3.5 text-[#4974f9]" />
                    نطاق السعر
                  </h3>
                  <div className="px-1">
                    <div className="mb-6 flex items-center justify-between gap-3">
                      <div className="flex-1 rounded-2xl bg-white/50 border border-white p-3 shadow-inner ring-1 ring-slate-100/50">
                        <span className="block text-[9px] font-black text-slate-400 uppercase mb-1">من</span>
                        <span className="text-base font-black text-[#4974f9] tabular-nums">${priceMin}</span>
                      </div>
                      <div className="h-px w-3 bg-slate-300" />
                      <div className="flex-1 rounded-2xl bg-white/50 border border-white p-3 shadow-inner ring-1 ring-slate-100/50">
                        <span className="block text-[9px] font-black text-slate-400 uppercase mb-1">إلى</span>
                        <span className="text-base font-black text-[#4974f9] tabular-nums">${priceMax}</span>
                      </div>
                    </div>

                    <div className="relative h-6 flex items-center px-1">
                      {/* Custom Range Track */}
                      <div className="absolute h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="absolute h-full bg-gradient-to-r from-[#4974f9] to-indigo-400"
                          style={{
                            right: `${(priceMin / 2000) * 100}%`,
                            left: `${100 - (priceMax / 2000) * 100}%`
                          }}
                        />
                      </div>

                      <input
                        type="range"
                        min="0"
                        max="2000"
                        value={priceMin}
                        onChange={(event) => setPriceMin(Math.min(Number(event.target.value), priceMax - 50))}
                        className="absolute h-1.5 w-full cursor-pointer appearance-none bg-transparent accent-[#4974f9]"
                        style={{ pointerEvents: 'auto' }}
                      />
                      <input
                        type="range"
                        min="0"
                        max="2000"
                        value={priceMax}
                        onChange={(event) => setPriceMax(Math.max(Number(event.target.value), priceMin + 50))}
                        className="absolute h-1.5 w-full cursor-pointer appearance-none bg-transparent accent-[#4974f9]"
                        style={{ pointerEvents: 'auto' }}
                      />
                    </div>
                    <div className="mt-3 flex justify-between px-1">
                      <span className="text-[10px] font-bold text-slate-400">$0</span>
                      <span className="text-[10px] font-bold text-slate-400">$2000</span>
                    </div>
                  </div>
                </div>

                {/* Airlines Filter */}
                <div className="group">
                  <h3 className="mb-6 flex items-center gap-2 text-[11px] font-black uppercase tracking-[3px] text-slate-400">
                    <Plane className="h-3.5 w-3.5 text-[#4974f9]" />
                    شركات الطيران
                  </h3>
                  <div className="space-y-3">
                    {airlinePanelItems.map((airline) => (
                      <label
                        key={airline.id}
                        className={`group/airline relative flex cursor-pointer items-center justify-between overflow-hidden rounded-[24px] border px-4 py-4 transition-all duration-300 ${selectedAirlines.has(airline.id)
                            ? 'border-[#4974f9]/20 bg-white shadow-lg shadow-[#4974f9]/5'
                            : 'border-transparent hover:bg-white/40'
                          }`}
                      >
                        <div className="relative z-10 flex items-center gap-4">
                          <div className={`flex h-6 w-6 items-center justify-center rounded-lg border-2 transition-all duration-300 ${selectedAirlines.has(airline.id)
                              ? 'border-[#4974f9] bg-[#4974f9] shadow-md shadow-[#4974f9]/20'
                              : 'border-slate-200 group-hover/airline:border-[#4974f9]/50'
                            }`}>
                            {selectedAirlines.has(airline.id) && <CheckCircle2 className="h-4 w-4 text-white" />}
                            <input
                              type="checkbox"
                              checked={selectedAirlines.has(airline.id)}
                              onChange={() => toggleAirline(airline.id)}
                              className="sr-only"
                            />
                          </div>
                          <span className={`text-[13px] font-black transition-colors ${selectedAirlines.has(airline.id) ? 'text-slate-900' : 'text-slate-500'
                            }`}>
                            {airline.name}
                          </span>
                        </div>
                        <img
                          src={airline.logo}
                          alt=""
                          className={`relative z-10 h-8 w-8 object-contain transition-all duration-500 ${selectedAirlines.has(airline.id) ? 'scale-110 opacity-100' : 'grayscale opacity-40 group-hover/airline:grayscale-0 group-hover/airline:opacity-70'
                            }`}
                        />
                        {selectedAirlines.has(airline.id) && (
                          <div className="absolute inset-0 bg-gradient-to-r from-[#4974f9]/5 to-transparent animate-in fade-in duration-500" />
                        )}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Reset Action */}
                <button
                  type="button"
                  onClick={resetFilters}
                  className="group/reset relative flex w-full h-14 items-center justify-center overflow-hidden rounded-2xl bg-slate-900 text-xs font-black text-white shadow-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:bg-slate-800"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/5 to-white/0 translate-x-[-100%] group-hover/reset:translate-x-[100%] transition-transform duration-1000" />
                  <span className="relative z-10 flex items-center gap-2">
                    إعادة تعيين جميع الفلاتر
                  </span>
                </button>
              </div>
            </div>

          </aside>

          <div dir="rtl">
            {/* Sorting Tabs & Mobile Filters */}
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-2xl font-black text-slate-900">{visibleFlights.length} رحلة متاحة</p>
                <p className="text-xs font-bold text-slate-500 mt-1">تطبق الأسعار على جميع المسافرين المختارين</p>
              </div>

              <div className="flex items-center gap-3">
                <div className="inline-flex rounded-[20px] bg-slate-100 p-1.5 ring-1 ring-slate-200/50">
                  {['الأفضل', 'الأرخص', 'الأسرع'].map((option) => (
                    <button
                      key={option}
                      onClick={() => setSortBy(option)}
                      className={`rounded-[14px] px-6 py-2.5 text-xs font-black transition-all duration-300 ${sortBy === option
                        ? 'bg-slate-900 text-white shadow-lg shadow-slate-200'
                        : 'text-slate-500 hover:text-slate-900 hover:bg-white'
                        }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>

                {/* Mobile Filter Button */}
                <button className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-slate-600 shadow-sm ring-1 ring-slate-200 hover:bg-slate-50 lg:hidden">
                  <SlidersHorizontal className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[32px] border border-dashed border-slate-200">
                  <div className="h-12 w-12 border-4 border-[#4974f9] border-t-transparent rounded-full animate-spin mb-4" />
                  <p className="text-slate-500 font-bold">جاري البحث عن أفضل الرحلات...</p>
                </div>
              ) : visibleFlights.length > 0 ? (
                visibleFlights.map((flight, idx) => {
                  const isCheapest = flight.price === Math.min(...visibleFlights.map(f => f.price));
                  const toMinutes = (val) => {
                    const h = Number(val.match(/(\d+)\sس/)?.[1] || 0);
                    const m = Number(val.match(/(\d+)\sد/)?.[1] || 0);
                    return h * 60 + m;
                  };
                  const isFastest = toMinutes(flight.duration) === Math.min(...visibleFlights.map(f => toMinutes(f.duration)));

                  return (
                    <article
                      key={flight.id}
                      className="group relative overflow-hidden rounded-[40px] border border-white/40 bg-white/70 shadow-[0_20px_50px_rgba(0,0,0,0.03)] backdrop-blur-2xl transition-all duration-500 hover:-translate-y-2 hover:border-[#4974f9]/30 hover:shadow-[0_40px_80px_rgba(73,116,249,0.12)]"
                    >
                      {/* Premium Accent Line */}
                      <div className="absolute top-0 right-0 h-1.5 w-full bg-gradient-to-l from-[#4974f9] via-indigo-400 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

                      {/* Floating Badges - Simplified Colors */}
                      <div className="absolute left-6 top-6 flex gap-2 z-20">
                        {isCheapest && (
                          <div className="flex items-center gap-1.5 rounded-full bg-slate-900 px-3 py-1 text-[9px] font-black uppercase tracking-widest text-white shadow-lg shadow-slate-900/10">
                            <TrendingUp className="h-2.5 w-2.5" />
                            الأرخص
                          </div>
                        )}
                        {isFastest && (
                          <div className="flex items-center gap-1.5 rounded-full bg-white border border-slate-200 px-3 py-1 text-[9px] font-black uppercase tracking-widest text-slate-900 shadow-sm">
                            <Clock className="h-2.5 w-2.5" />
                            الأسرع
                          </div>
                        )}
                      </div>

                      <div className="grid lg:grid-cols-[1fr_260px]">
                        {/* Ticket Content */}
                        <div className="relative p-6 sm:p-10">
                          {/* Top Section: Airline Info */}
                          <div className="flex items-center gap-5">
                            <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-white p-3 shadow-sm ring-1 ring-slate-100 transition-all duration-500 group-hover:scale-110 group-hover:shadow-xl group-hover:ring-[#4974f9]/20">
                              <img src={flight.logo} alt={flight.airlineName} className="h-full w-full object-contain" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="text-xl font-black tracking-tight text-slate-900">{flight.airlineName}</h3>
                                <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-black text-slate-500 uppercase tracking-widest group-hover:bg-[#4974f9]/10 group-hover:text-[#4974f9] transition-colors">
                                  {flight.flightNumber}
                                </span>
                              </div>
                              <div className="mt-1 flex items-center gap-3">
                                <span className="text-xs font-bold text-slate-400">سياحية كلاسيكية</span>
                                <span className="h-1 w-1 rounded-full bg-slate-200" />
                                <span className="text-xs font-bold text-slate-400">Airbus A320</span>
                              </div>
                            </div>
                          </div>

                          {/* Flight Path Visualization */}
                          <div className="mt-12 grid items-center gap-8 sm:grid-cols-[1fr_auto_1fr]">
                            <div className="text-right">
                              <p className="text-[10px] font-black uppercase tracking-[3px] text-slate-400 mb-2">الإقلاع</p>
                              <p className="text-4xl font-black tracking-tighter text-slate-900 tabular-nums leading-none">{flight.departTime}</p>
                              <div className="mt-3">
                                <p className="text-lg font-black text-slate-800 leading-none">{flight.fromCity}</p>
                                <p className="text-[11px] font-bold text-slate-400 mt-1.5 opacity-80">
                                  {flight.fromAirport}
                                </p>
                              </div>
                            </div>

                            <div className="flex flex-col items-center justify-center min-w-[180px] px-2">
                              <div className="mb-3 flex items-center gap-2 rounded-full bg-slate-50 px-3 py-1 ring-1 ring-slate-100 transition-all group-hover:bg-[#4974f9]/5 group-hover:ring-[#4974f9]/10">
                                <Clock className="h-3 w-3 text-slate-400 group-hover:text-[#4974f9]" />
                                <span className="text-xs font-black text-slate-600 group-hover:text-[#4974f9]">{flight.duration}</span>
                              </div>

                              <div className="relative flex w-full items-center justify-center py-4">
                                {/* The animated path */}
                                <div className="h-[2px] w-full bg-slate-100 overflow-hidden rounded-full">
                                  <div className="h-full w-full bg-gradient-to-r from-transparent via-[#4974f9]/40 to-transparent translate-x-[-100%] group-hover:animate-shimmer" />
                                </div>

                                <div className="absolute right-0 h-2.5 w-2.5 rounded-full border-[3px] border-[#4974f9] bg-white shadow-sm shadow-[#4974f9]/20" />
                                <div className="absolute left-0 h-2.5 w-2.5 rounded-full border-[3px] border-slate-200 bg-white group-hover:border-[#4974f9] transition-all duration-500" />

                                <div className="absolute flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-lg ring-1 ring-slate-50 transition-all duration-1000 ease-out group-hover:translate-x-[-140px]">
                                  <Plane className="h-4 w-4 text-[#4974f9] rotate-90" />
                                </div>
                              </div>

                              {/* Removed 'Non-stop' label */}
                            </div>

                            <div className="text-left">
                              <p className="text-[10px] font-black uppercase tracking-[3px] text-slate-400 mb-2">الوصول</p>
                              <p className="text-4xl font-black tracking-tighter text-slate-900 tabular-nums leading-none">{flight.arriveTime}</p>
                              <div className="mt-3">
                                <p className="text-lg font-black text-slate-800 leading-none">{flight.toCity}</p>
                                <p className="text-[11px] font-bold text-slate-400 mt-1.5 opacity-80">
                                  {flight.toAirport}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Footer Details */}
                          <div className="mt-10 flex flex-wrap items-center justify-between border-t border-slate-50 pt-6">
                            <div className="flex items-center gap-6">
                              <div className="flex items-center gap-2.5 group/icon">
                                <div className="h-8 w-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover/icon:bg-blue-50 group-hover/icon:text-[#4974f9] transition-colors">
                                  <Package className="h-4 w-4" />
                                </div>
                                <span className="text-[11px] font-black text-slate-600">23 كجم (قطعتين)</span>
                              </div>
                              <div className="flex items-center gap-2.5 group/icon">
                                <div className="h-8 w-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover/icon:bg-blue-50 group-hover/icon:text-[#4974f9] transition-colors">
                                  <TrendingUp className="h-4 w-4" />
                                </div>
                                <span className="text-[11px] font-black text-slate-600">وجبات خفيفة ومشروبات</span>
                              </div>
                            </div>

                            <button className="flex items-center gap-1.5 text-[11px] font-black text-[#4974f9] transition hover:opacity-70">
                              عرض تفاصيل الرحلة والقوانين <ChevronDown className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Pricing Stub */}
                        <div className="relative flex flex-col items-center justify-center border-t border-slate-100 bg-slate-50/50 p-8 lg:border-r lg:border-t-0">
                          {/* Perforation Effect Removed */}

                          <div className="relative z-10 w-full text-center">
                            <span className="text-[10px] font-black uppercase tracking-[4px] text-slate-400">السعر الكلي</span>
                            <div className="mt-2 flex items-baseline justify-center gap-1">
                              <span className="text-[40px] font-black tracking-tighter text-slate-900 leading-none">{flight.price}</span>
                              <span className="text-xl font-black text-slate-400">$</span>
                            </div>
                            <p className="mt-1 text-[10px] font-bold text-slate-400">شامل الضرائب والرسوم</p>

                            <button
                              onClick={() => handleSelectFlight(flight)}
                              className="mt-8 group/btn relative flex w-full h-14 items-center justify-center overflow-hidden rounded-2xl bg-[#d9312b] text-sm font-black text-white shadow-xl shadow-[#d9312b]/20 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-[#d9312b]/30 active:scale-95"
                            >
                              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-1000" />
                              <span className="relative z-10">اختيار هذه الرحلة</span>
                            </button>

                            <div className="mt-6 flex flex-col items-center gap-3">
                              <div className="flex items-center gap-1.5 opacity-60">
                                <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">حجز مؤمن بالكامل</span>
                              </div>
                              <div className="h-px w-12 bg-slate-200" />
                              <p className="text-[9px] font-bold text-slate-400">تبقى 5 مقاعد بهذا السعر</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </article>
                  )
                })
              ) : (
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[32px] border border-dashed border-slate-200 text-center px-6">
                  <div className="h-20 w-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                    <Plane className="h-10 w-10 text-slate-300" />
                  </div>
                  <h3 className="text-xl font-black text-slate-900 mb-2">عذراً، لم نجد رحلات تطابق بحثك</h3>
                  <p className="text-slate-500 font-bold max-w-sm">جرب اختيار تواريخ أخرى أو مناطق مختلفة، أو تأكد من جلب جميع الرحلات بدون تحديد تاريخ.</p>
                  <button
                    onClick={resetFilters}
                    className="mt-8 text-[#4974f9] font-black text-sm hover:underline"
                  >
                    إعادة تعيين جميع الفلاتر
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

export default SearchPage
