import { useMemo, useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useSearch } from '../utils/SearchContext'
import { CheckCircle2, ChevronDown, Plane, ShieldCheck, SlidersHorizontal, Clock, TrendingUp, Package, MapPin, Calendar, Users, X, RotateCcw, Sparkles, BadgePercent, Zap } from 'lucide-react'
import BookingStepper from '../components/BookingStepper.jsx'
import logoY from '../assets/Y.png'
import logoB from '../assets/B.png'
import logoF from '../assets/F.png'
import flightLine from '../assets/line.jpeg'

const airlinePanelItems = [
  { id: 'yemenia', name: 'اليمنية', logo: logoY },
  { id: 'balqis', name: 'طيران بلقيس', logo: logoB },
  { id: 'aden', name: 'طيران فلاي عدن', logo: logoF },
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
  dubai: { city: 'دبي', airport: 'مطار دبي الدولي', region: 'الإمارات' },
  doha: { city: 'الدوحة', airport: 'مطار حمد الدولي', region: 'قطر' },
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
  const [selectedAirlines, setSelectedAirlines] = useState(() =>
    new Set(airlinePanelItems.map((item) => item.id)),
  )
  const [priceRange, setPriceRange] = useState(1500)
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false)

  const fromCityQuery = searchCriteria?.fromCity || ''
  const toCityQuery = searchCriteria?.toCity || ''
  const travelDateQuery = searchCriteria?.travelDate || ''

  useEffect(() => {
    const fetchFlights = async () => {
      try {
        setLoading(true)
        const response = await fetch(`http://localhost:8080/api/search-flights?from=${fromCityQuery}&to=${toCityQuery}&date=${travelDateQuery}`)
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

            const getAirportInfo = (code) => {
              const upperCode = String(code || '').toUpperCase();
              const codeToKey = {
                'ADE': 'aden',
                'CAI': 'cairo',
                'RUH': 'riyadh',
                'JED': 'jeddah',
                'DXB': 'dubai',
                'DOH': 'doha',
                'RIY': 'mukalla',
                'GXF': 'seiyun',
                'SCT': 'socotra',
                'AMM': 'amman',
                'KWI': 'kuwait',
                'JIB': 'djibouti',
                'ADD': 'addis'
              };
              const key = codeToKey[upperCode];
              return airportMap[key] || { city: upperCode, airport: 'مطار الدولي', region: upperCode };
            }

            const fromInfo = getAirportInfo(f.airportOrigin_code);
            const toInfo = getAirportInfo(f.airportDestination_code);

            return {
              id: f.id_flights,
              airlineId: flightAirlineId,
              airlineName: flightAirlineName,
              flightNumber: f.flight_number,
              logo: flightLogo,
              fromCode: f.airportOrigin_code,
              fromCity: fromInfo.city,
              fromAirport: fromInfo.airport,
              toCode: f.airportDestination_code,
              toCity: toInfo.city,
              toAirport: toInfo.airport,
              departTime: dep.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
              arriveTime: arr.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
              duration: `${hours} س ${mins} د`,
              price: f.price || 0,
              availableSeats: f.available_seats,
              raw: f
            }
          });
          setFlights(mappedFlights);
          if (mappedFlights.length > 0) {
            const maxP = Math.max(...mappedFlights.map(f => f.price));
            setPriceRange(maxP);
          }
        }
      } catch (error) {
        console.error('Error fetching flights:', error);
      } finally {
        setLoading(false)
      }
    }

    fetchFlights()
  }, [fromCityQuery, toCityQuery, travelDateQuery])

  const groupedFlights = useMemo(() => {
    if (!isShowAll) return null;

    const groups = [
      { id: 'yemenia', name: 'الخطوط الجوية اليمنية', logo: logoY, flights: [] },
      { id: 'balqis', name: 'طيران الملكة بلقيس', logo: logoB, flights: [] },
      { id: 'aden', name: 'طيران فلاي عدن', logo: logoF, flights: [] }
    ];

    flights.forEach(flight => {
      const group = groups.find(g => g.id === flight.airlineId);
      if (group) {
        group.flights.push(flight);
      }
    });

    return groups;
  }, [flights, isShowAll])

  const renderFlightCard = (flight, showBadges = true) => {
    const isCheapest = !isShowAll && flight.price === Math.min(...visibleFlights.map(f => f.price));
    const toMinutes = (val) => {
      const h = Number(val.match(/(\d+)\sس/)?.[1] || 0);
      const m = Number(val.match(/(\d+)\sد/)?.[1] || 0);
      return h * 60 + m;
    };
    const isFastest = !isShowAll && toMinutes(flight.duration) === Math.min(...visibleFlights.map(f => toMinutes(f.duration)));

    if (isShowAll) {
      return (
        <article
          key={flight.id}
          className="group relative overflow-hidden rounded-[32px] border border-white/40 bg-white/80 p-6 shadow-[0_16px_40px_rgba(0,0,0,0.02)] backdrop-blur-2xl transition-all duration-500 hover:-translate-y-2 hover:border-brand-blue/30 hover:shadow-[0_32px_64px_rgba(73,116,249,0.08)]"
        >
          {/* Premium Accent Line */}
          <div className="absolute top-0 right-0 h-1 w-full bg-gradient-to-l from-brand-blue via-indigo-400 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

          {/* Top Section: Airline Info */}
          <div className="flex items-center justify-between gap-4">
            <span className="rounded-md bg-slate-100 px-2.5 py-0.5 text-[9px] font-black text-slate-500 uppercase tracking-widest group-hover:bg-brand-blue/10 group-hover:text-brand-blue transition-colors">
              {flight.flightNumber}
            </span>
            <span className="text-[10px] font-bold text-slate-400">سياحية كلاسيكية</span>
          </div>

          {/* Flight Path Details */}
          <div className="mt-6 flex items-center justify-between gap-4 bg-slate-50/50 p-4 rounded-2xl ring-1 ring-slate-100">
            <div className="text-right">
              <p className="text-2xl font-black tracking-tighter text-slate-900 leading-none">{flight.departTime}</p>
              <p className="text-xs font-black text-slate-800 mt-1 leading-none">{flight.fromCity}</p>
            </div>

            <div className="flex flex-col items-center justify-center min-w-[70px]">
              <span className="text-[10px] font-black text-slate-500 leading-none">{flight.duration}</span>
              <div className="relative flex w-full items-center justify-center py-2">
                <div className="h-[1.5px] w-full bg-slate-200" />
                <Plane className="absolute h-3.5 w-3.5 text-brand-blue rotate-90 bg-[#f8f9fc] px-0.5" />
              </div>
            </div>

            <div className="text-left">
              <p className="text-2xl font-black tracking-tighter text-slate-900 leading-none">{flight.arriveTime}</p>
              <p className="text-xs font-black text-slate-800 mt-1 leading-none">{flight.toCity}</p>
            </div>
          </div>

          {/* Price & Book Button */}
          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between gap-4">
            <div className="text-right">
              <span className="text-[9px] font-black uppercase text-slate-400">السعر الكلي</span>
              <div className="flex items-baseline gap-0.5">
                <span className="text-2xl font-black tracking-tighter text-slate-950 leading-none">{flight.price}</span>
                <span className="text-sm font-black text-slate-400">$</span>
              </div>
            </div>
            <button
              onClick={() => handleSelectFlight(flight)}
              className="group/btn relative flex h-11 px-6 items-center justify-center overflow-hidden rounded-xl bg-brand-blue hover:bg-brand-blue-hover text-xs font-black text-white shadow-md shadow-brand-blue/10 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg active:scale-95 shrink-0"
            >
              <span className="relative z-10">حجز الرحلة</span>
            </button>
          </div>
        </article>
      );
    }

    return (
      <article
        key={flight.id}
        className="group relative overflow-hidden rounded-[30px] border border-white/40 bg-white/70 shadow-[0_20px_50px_rgba(0,0,0,0.03)] backdrop-blur-2xl transition-all duration-500 hover:-translate-y-1.5 hover:border-brand-blue/20 hover:shadow-[0_30px_60px_rgba(73,116,249,0.08)]"
      >
        {/* Premium Accent Line */}
        <div className="absolute top-0 right-0 h-1.5 w-full bg-gradient-to-l from-brand-blue via-indigo-400 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

        {/* Floating Badges - Simplified Colors */}
        {showBadges && isCheapest && (
          <div className="absolute left-6 top-6 flex gap-2 z-20">
            <div className="flex items-center gap-1.5 rounded-full bg-slate-900 px-3 py-1 text-[9px] font-black uppercase tracking-widest text-white shadow-lg shadow-slate-900/10">
              <TrendingUp className="h-2.5 w-2.5" />
              الأرخص
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-[1fr_260px]">
          {/* Ticket Content */}
          <div className="relative p-6 sm:p-10">
            {/* Top Section: Airline Info */}
            <div className="flex items-center gap-5">
              <div className="relative flex h-14 w-14 items-center justify-center rounded-xl bg-white p-2 shadow-sm ring-1 ring-slate-100/80 transition-all duration-500 group-hover:scale-105 group-hover:shadow-md group-hover:ring-brand-blue/20">
                <img
                  src={flight.logo}
                  alt={flight.airlineName}
                  className={`h-full w-full object-contain ${flight.airlineId === 'balqis' ? 'scale-[1.25]' : 'scale-[0.95]'
                    }`}
                />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-black tracking-tight text-slate-900">{flight.airlineName}</h3>
                  <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-black text-slate-500 uppercase tracking-widest group-hover:bg-brand-blue/10 group-hover:text-brand-blue transition-colors">
                    {flight.flightNumber}
                  </span>
                </div>
                <div className="mt-1 flex items-center gap-3">
                  <span className="text-xs font-bold text-slate-400">Airbus A320</span>
                </div>
              </div>
            </div>

            {/* Flight Path Visualization */}
            <div className="mt-12 grid items-center gap-8 sm:grid-cols-[1fr_auto_1fr]">
              {/* Departure Info */}
              <div className="text-right">
                <div className="flex items-center gap-2 justify-end mb-1">
                  <span className="text-xs font-black text-slate-400">({flight.fromCode})</span>
                  <span className="text-[10px] font-black uppercase tracking-[2px] text-slate-400">الإقلاع</span>
                </div>
                <p className="text-3xl font-black tracking-tighter text-slate-800 tabular-nums leading-none">{flight.departTime}</p>
                <div className="mt-2.5">
                  <p className="text-base font-extrabold text-slate-700 leading-none">{flight.fromCity}</p>
                  <p className="text-[11px] font-bold text-slate-400 mt-1 leading-none line-clamp-1 max-w-[200px]" title={flight.fromAirport}>
                    {flight.fromAirport}
                  </p>
                </div>
              </div>

              {/* Progress Line */}
              <div className="flex flex-col items-center justify-center min-w-[240px] px-4">
                <div className="mb-2.5 flex items-center gap-1.5 rounded-full bg-slate-50 border border-slate-200/50 px-3.5 py-1 transition-all duration-300 group-hover:bg-brand-blue/5 group-hover:border-brand-blue/10">
                  <Clock className="h-3 w-3 text-slate-400 group-hover:text-brand-blue" />
                  <span className="text-xs font-black text-slate-650 group-hover:text-brand-blue">{flight.duration}</span>
                </div>

                <div className="relative flex w-full items-center justify-center py-2">
                  <div className="h-[2px] w-full bg-slate-100 rounded-full" />
                  <div className="absolute right-0 h-2 w-2 rounded-full bg-brand-blue" />
                  <div className="absolute left-0 h-2 w-2 rounded-full bg-slate-300 group-hover:bg-brand-blue transition-colors duration-500" />

                  <div className="absolute flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-md border border-slate-100 transition-all duration-1000 ease-out group-hover:translate-x-[-80px]">
                    <Plane className="h-3.5 w-3.5 text-brand-blue rotate-90" />
                  </div>
                </div>
                <span className="text-[9px] font-black text-slate-400 mt-1 uppercase tracking-widest">رحلة مباشرة</span>
              </div>

              {/* Arrival Info */}
              <div className="text-left">
                <div className="flex items-center gap-2 justify-start mb-1">
                  <span className="text-[10px] font-black uppercase tracking-[2px] text-slate-400">الوصول</span>
                  <span className="text-xs font-black text-slate-400">({flight.toCode})</span>
                </div>
                <p className="text-3xl font-black tracking-tighter text-slate-800 tabular-nums leading-none">{flight.arriveTime}</p>
                <div className="mt-2.5">
                  <p className="text-base font-extrabold text-slate-700 leading-none">{flight.toCity}</p>
                  <p className="text-[11px] font-bold text-slate-400 mt-1 leading-none line-clamp-1 max-w-[200px]" title={flight.toAirport}>
                    {flight.toAirport}
                  </p>
                </div>
              </div>
            </div>

          </div>

          {/* Pricing Stub */}
          <div className="relative flex flex-col items-center justify-center bg-slate-50/30 p-8 rounded-b-[30px] lg:rounded-b-0 lg:rounded-l-[30px] border-t border-slate-100 lg:border-t-0 lg:border-r">
            <div className="relative z-10 w-full text-center">
              <span className="text-[10px] font-black uppercase tracking-[3px] text-slate-400">السعر الإجمالي</span>
              <div className="mt-2 flex items-baseline justify-center gap-1">
                <span className="text-4xl font-black tracking-tighter text-slate-900 leading-none">{flight.price}</span>
                <span className="text-lg font-black text-slate-400">$</span>
              </div>
              <p className="mt-1 text-[10px] font-bold text-slate-400">شامل الرسوم</p>

              <button
                onClick={() => handleSelectFlight(flight)}
                className="mt-6 group/btn relative flex w-full h-12 items-center justify-center overflow-hidden rounded-2xl bg-brand-blue hover:bg-brand-blue-hover text-sm font-black text-white shadow-lg shadow-brand-blue/15 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-brand-blue/25 active:scale-98"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-1000" />
                <span className="relative z-10">اختيار هذه الرحلة</span>
              </button>

              <div className="mt-5 flex items-center justify-center gap-1.5 opacity-60">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-wider">حجز مرن ومؤمن</span>
              </div>
            </div>
          </div>
        </div>
      </article>
    );
  };

  const getAirportLabel = (value) => {
    const airport = airportMap[value]
    return airport ? `${airport.region} - ${airport.airport}` : value || 'غير محدد'
  }

  const visibleFlights = useMemo(() => {
    const filtered = flights.filter((flight) => {
      return selectedAirlines.has(flight.airlineId)
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
  }, [flights, selectedAirlines, sortBy, priceRange])

  const toggleAirline = (id) => {
    setSelectedAirlines((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const resetFilters = () => {
    setSelectedAirlines(new Set(airlinePanelItems.map((item) => item.id)))
    setSortBy('الأفضل')
    if (flights.length > 0) {
      setPriceRange(Math.max(...flights.map(f => f.price)))
    } else {
      setPriceRange(1500)
    }
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
      {!isShowAll && (
        <div className="sticky top-16 z-40 w-full border-b border-slate-200/60 bg-white/80 py-4 backdrop-blur-xl sm:top-20">
          <div className="mx-auto max-w-[1380px] px-4 sm:px-6">
            <BookingStepper current="flights" />
          </div>
        </div>
      )}

      <section className="mx-auto mt-8 w-full max-w-[1380px] px-4 sm:px-6">
        {/* Sleek Search Summary Bar - Redesigned for Premium Look */}
        {isShowAll ? (
          <div className="mb-10 overflow-hidden rounded-[40px] border border-white/40 bg-gradient-to-r from-brand-blue/10 to-indigo-500/10 p-8 shadow-[0_32px_64px_rgba(0,0,0,0.04)] backdrop-blur-3xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 animate-in fade-in slide-in-from-top-5 duration-500" dir="rtl">
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
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 group-hover:bg-brand-blue group-hover:text-white transition-all duration-500">
                  <MapPin className="h-6 w-6" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase tracking-[2px] text-slate-400 group-hover:text-brand-blue transition-colors">محطة الإقلاع</span>
                  <span className="mt-0.5 text-sm font-black text-slate-900 line-clamp-1">{getAirportLabel(searchCriteria.fromCity)}</span>
                </div>
              </div>

              {/* Destination */}
              <div className="flex items-center gap-4 p-6 transition-all duration-300 hover:bg-white/50 group">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 group-hover:bg-brand-blue group-hover:text-white transition-all duration-500">
                  <Plane className="h-6 w-6 rotate-90" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase tracking-[2px] text-slate-400 group-hover:text-brand-blue transition-colors">وجهة الوصول</span>
                  <span className="mt-0.5 text-sm font-black text-slate-900 line-clamp-1">{getAirportLabel(searchCriteria.toCity)}</span>
                </div>
              </div>

              {/* Date */}
              <div className="flex items-center gap-4 p-6 transition-all duration-300 hover:bg-white/50 group">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 group-hover:bg-brand-blue group-hover:text-white transition-all duration-500">
                  <Calendar className="h-6 w-6" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase tracking-[2px] text-slate-400 group-hover:text-brand-blue transition-colors">تاريخ السفر</span>
                  <span className="mt-0.5 text-sm font-black text-slate-900">{formatSearchDate(searchCriteria.travelDate)}</span>
                </div>
              </div>

              {/* Passengers & Edit */}
              <div className="flex items-center justify-between p-6 transition-all duration-300 hover:bg-white/50 group">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 group-hover:bg-brand-blue group-hover:text-white transition-all duration-500">
                    <Users className="h-6 w-6" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase tracking-[2px] text-slate-400 group-hover:text-brand-blue transition-colors">المسافرون</span>
                    <span className="mt-0.5 text-sm font-black text-slate-900">{searchCriteria.passengerCount ?? 1} مسافر</span>
                  </div>
                </div>
                <Link to="/" className="relative flex h-10 items-center justify-center overflow-hidden rounded-xl bg-brand-blue hover:bg-brand-blue-hover px-6 text-xs font-black text-white shadow-md shadow-brand-blue/10 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg active:scale-95 group/edit">
                  <span className="relative z-10">تعديل</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover/edit:translate-x-[100%] transition-transform duration-1000" />
                </Link>
              </div>
            </div>
          </div>
        ) : null}

        <div className={isShowAll ? "w-full animate-in fade-in duration-500" : "grid items-start gap-8 lg:grid-cols-[300px_minmax(0,1fr)]"}>
          {/* Professional Filters Sidebar */}
          {!isShowAll && (
            <aside className="sticky top-40 hidden space-y-6 lg:block" dir="rtl">
              <div className="rounded-[36px] border border-slate-100 bg-white p-8 shadow-[0_20px_50px_rgba(0,0,0,0.015)] transition-all duration-300 hover:shadow-[0_30px_60px_rgba(37,99,235,0.02)]">
                <div className="mb-8 flex items-center justify-between border-b border-slate-50 pb-6">
                  <div>
                    <h2 className="text-lg font-black text-slate-800">تصفية النتائج</h2>
                    <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-wider">تحكم في تفاصيل بحثك</p>
                  </div>
                  <div className="h-10 w-10 rounded-2xl bg-brand-blue/5 flex items-center justify-center text-brand-blue">
                    <SlidersHorizontal className="h-5 w-5" />
                  </div>
                </div>

                <div className="space-y-8">
                  {/* Airlines Filter */}
                  <div className="group">
                    <h3 className="mb-5 flex items-center gap-2 text-[11px] font-black uppercase tracking-[3px] text-slate-400">
                      <Plane className="h-3.5 w-3.5 text-brand-blue" />
                      شركات الطيران
                    </h3>
                    <div className="space-y-3.5">
                      {airlinePanelItems.map((airline) => {
                        const isSelected = selectedAirlines.has(airline.id);
                        return (
                          <button
                            key={airline.id}
                            type="button"
                            onClick={() => toggleAirline(airline.id)}
                            className={`relative w-full flex items-center justify-between rounded-2.5xl border p-4 transition-all duration-300 text-right ${isSelected
                                ? 'border-brand-blue/25 bg-slate-50/50 shadow-[0_10px_25px_rgba(37,99,235,0.03)]'
                                : 'border-slate-100 bg-white hover:bg-slate-50'
                              }`}
                          >
                            <div className="flex items-center gap-3.5">
                              <div className={`flex h-5.5 w-5.5 items-center justify-center rounded-lg border transition-all duration-300 ${isSelected
                                  ? 'border-brand-blue bg-brand-blue text-white shadow-md shadow-brand-blue/20'
                                  : 'border-slate-205 bg-white'
                                }`}>
                                {isSelected && <CheckCircle2 className="h-3.5 w-3.5" />}
                              </div>
                              <span className={`text-xs font-black transition-colors ${isSelected ? 'text-slate-900' : 'text-slate-500'}`}>
                                {airline.name}
                              </span>
                            </div>
                            <img
                              src={airline.logo}
                              alt=""
                              className={`h-9 w-9 object-contain transition-all duration-300 ${airline.id === 'balqis' ? 'scale-[1.35]' : 'scale-[1.05]'
                                } ${isSelected ? 'opacity-100' : 'grayscale opacity-50'}`}
                            />
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Reset Action */}
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="group/reset relative flex w-full h-12 items-center justify-center overflow-hidden rounded-xl border border-slate-200 text-xs font-black text-slate-600 shadow-sm transition-all duration-300 hover:bg-slate-50 active:scale-98"
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      <RotateCcw className="h-3.5 w-3.5" />
                      إعادة تعيين الفلاتر
                    </span>
                  </button>
                </div>
              </div>
            </aside>
          )}

          <div dir="rtl">
            {isShowAll && <h3 className="text-2xl font-black text-slate-950 mb-8">الرحلات المجدولة حسب شركات الطيران</h3>}
            {/* Sorting Tabs & Mobile Filters */}
            {!isShowAll && (
              <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-2xl font-black text-slate-900">{visibleFlights.length} رحلة متاحة</p>
                  <p className="text-xs font-bold text-slate-500 mt-1">تطبق الأسعار على جميع المسافرين المختارين</p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="inline-flex rounded-[24px] bg-white p-1 border border-slate-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.015)]">
                    {[
                      { key: 'الأفضل', label: 'الرحلات الأحدث', icon: Calendar },
                      { key: 'الأرخص', label: 'الأرخص سعراً', icon: BadgePercent },
                      { key: 'الأسرع', label: 'الأسرع وقتاً', icon: Zap }
                    ].map((option) => {
                      const Icon = option.icon;
                      const isSelected = sortBy === option.key;
                      return (
                        <button
                          key={option.key}
                          onClick={() => setSortBy(option.key)}
                          className={`flex items-center gap-2 rounded-[18px] px-5 py-2.5 text-xs font-black transition-all duration-300 ${isSelected
                              ? 'bg-brand-blue text-white shadow-lg shadow-brand-blue/20'
                              : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                            }`}
                        >
                          <Icon className={`h-4 w-4 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
                          <span>{option.label}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Mobile Filter Button */}
                  <button
                    onClick={() => setIsMobileFilterOpen(true)}
                    className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-slate-600 shadow-sm ring-1 ring-slate-200 hover:bg-slate-50 lg:hidden"
                  >
                    <SlidersHorizontal className="h-5 w-5" />
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-6">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[32px] border border-dashed border-slate-200">
                  <div className="h-12 w-12 border-4 border-brand-blue border-t-transparent rounded-full animate-spin mb-4" />
                  <p className="text-slate-500 font-bold">جاري البحث عن أفضل الرحلات...</p>
                </div>
              ) : isShowAll ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                  {groupedFlights.map((group) => (
                    <div key={group.id} className="space-y-6 bg-white/40 p-6 rounded-[32px] border border-white/60 shadow-sm backdrop-blur-md">
                      <div className="flex items-center gap-4 border-b border-slate-200 pb-4 pt-2">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white p-2.5 shadow-sm ring-1 ring-slate-200/50">
                          <img src={group.logo} alt={group.name} className="h-full w-full object-contain" />
                        </div>
                        <div>
                          <h3 className="text-lg font-black text-slate-900 leading-tight">{group.name}</h3>
                          <p className="text-xs font-bold text-slate-500 mt-0.5">{group.flights.length} رحلة مجدولة</p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        {group.flights.length > 0 ? (
                          group.flights.map((flight) => renderFlightCard(flight, false))
                        ) : (
                          <div className="py-12 bg-white rounded-[24px] border border-dashed border-slate-200 text-center">
                            <p className="text-slate-400 font-bold text-xs">لا توجد رحلات مجدولة حالياً لهذه الشركة</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : visibleFlights.length > 0 ? (
                visibleFlights.map((flight) => renderFlightCard(flight, true))
              ) : (
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[32px] border border-dashed border-slate-200 text-center px-6">
                  <div className="h-20 w-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                    <Plane className="h-10 w-10 text-slate-300" />
                  </div>
                  <h3 className="text-xl font-black text-slate-900 mb-2">عذراً، لم نجد رحلات تطابق بحثك</h3>
                  <p className="text-slate-500 font-bold max-w-sm">جرب اختيار تواريخ أخرى أو مناطق مختلفة، أو تأكد من جلب جميع الرحلات بدون تحديد تاريخ.</p>
                  <button
                    onClick={resetFilters}
                    className="mt-8 text-brand-blue font-black text-sm hover:underline"
                  >
                    إعادة تعيين جميع الفلاتر
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Mobile Filter Drawer Overlay */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50 backdrop-blur-sm lg:hidden animate-in fade-in duration-300">
          <div className="absolute inset-0" onClick={() => setIsMobileFilterOpen(false)} />
          <div className="relative w-full max-h-[85vh] overflow-y-auto rounded-t-[36px] bg-white p-6 shadow-2xl animate-in slide-in-from-bottom duration-500" dir="rtl">
            {/* Handle bar */}
            <div className="mx-auto mb-6 h-1 w-12 rounded-full bg-slate-200" />

            <div className="mb-8 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-slate-800">تصفية النتائج</h3>
                <p className="text-[10px] font-bold text-slate-400 mt-0.5">تحكم في تفاصيل بحثك</p>
              </div>
              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-8 pb-8">
              {/* Airlines Filter */}
              <div>
                <h4 className="mb-5 flex items-center gap-2 text-[11px] font-black uppercase tracking-[3px] text-slate-400">
                  <Plane className="h-3.5 w-3.5 text-brand-blue" />
                  شركات الطيران
                </h4>
                <div className="grid grid-cols-1 gap-3.5">
                  {airlinePanelItems.map((airline) => {
                    const isSelected = selectedAirlines.has(airline.id);
                    return (
                      <button
                        key={airline.id}
                        type="button"
                        onClick={() => toggleAirline(airline.id)}
                        className={`relative w-full flex items-center justify-between rounded-2xl border p-4 transition-all duration-300 text-right ${isSelected
                            ? 'border-brand-blue/20 bg-slate-50/50 shadow-sm'
                            : 'border-slate-100 bg-white hover:bg-slate-50'
                          }`}
                      >
                        <div className="flex items-center gap-3.5">
                          <div className={`flex h-5.5 w-5.5 items-center justify-center rounded-lg border transition-all duration-300 ${isSelected
                              ? 'border-brand-blue bg-brand-blue text-white shadow-md shadow-brand-blue/20'
                              : 'border-slate-205 bg-white'
                            }`}>
                            {isSelected && <CheckCircle2 className="h-3.5 w-3.5" />}
                          </div>
                          <span className={`text-xs font-black transition-colors ${isSelected ? 'text-slate-900' : 'text-slate-500'}`}>
                            {airline.name}
                          </span>
                        </div>
                        <img
                          src={airline.logo}
                          alt=""
                          className={`h-9 w-9 object-contain transition-all duration-300 ${airline.id === 'balqis' ? 'scale-[1.35]' : 'scale-[1.05]'
                            } ${isSelected ? 'opacity-100' : 'grayscale opacity-50'}`}
                        />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Reset & Apply Buttons */}
              <div className="flex items-center gap-4 pt-4">
                <button
                  type="button"
                  onClick={resetFilters}
                  className="flex h-12 w-1/3 items-center justify-center gap-1.5 rounded-2xl border border-slate-200 text-xs font-black text-slate-655 hover:bg-slate-50 transition-colors"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  إعادة تعيين
                </button>
                <button
                  type="button"
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="flex h-12 w-2/3 items-center justify-center rounded-2xl bg-brand-blue text-xs font-black text-white hover:bg-brand-blue-hover shadow-md shadow-brand-blue/10 active:scale-98 transition-all"
                >
                  تطبيق الفلاتر
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}

export default SearchPage
