import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Armchair, ChevronRight, Users, ShieldCheck, Plane, Info, CheckCircle2, Star, Zap } from 'lucide-react'
import BookingStepper from '../components/BookingStepper.jsx'

// Yemenia Airbus A320 Structure
const BUSINESS_ROWS = [1, 2, 3]
const ECONOMY_ROWS = Array.from({ length: 23 }, (_, i) => i + 4) // Rows 4 to 26
const EXIT_ROWS = [11, 12]

const MOCK_OCCUPIED = ['1A', '2B', '5C', '12D', '15F', '20A', '26E']

// Custom Icons for the Details Popup
const PitchIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M7 18V7c0-1.1.9-2 2-2h6" />
        <path d="M13 18v-5c0-1.1.9-2 2-2h2" />
        <path d="M3 21h18" />
    </svg>
)

const WidthIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="5" y="4" width="14" height="12" rx="2" />
        <path d="M2 12h3M19 12h3" />
        <path d="M5 20h14" />
    </svg>
)

const SeatsCountIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4z" />
        <path d="M5 20v-1a7 7 0 0 1 7-7 7 7 0 0 1 7 7v1" />
    </svg>
)

const ReclineIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 18V7c0-1.1.9-2 2-2h4c1.1 0 2 .9 2 2v4c0 1.1-.9 2-2 2H7" />
        <path d="M13 11l6 6" />
        <path d="M19 13v4h-4" />
        <path d="M3 21h18" />
    </svg>
)

function SeatsPage() {
    const navigate = useNavigate()
    const location = useLocation()
    const selectedFlight = location.state?.selectedFlight
    const selectedFlights = location.state?.selectedFlights || (selectedFlight ? [selectedFlight] : [])
    const searchCriteria = location.state?.searchCriteria
    const passengerCount = Number(searchCriteria?.passengerCount) || 1

    const [activeFlightIdx, setActiveFlightIdx] = useState(0)
    const [seatsSelectionMap, setSeatsSelectionMap] = useState({})
    const [selectedSeats, setSelectedSeats] = useState([])
    const [hoveredSeat, setHoveredSeat] = useState(null)

    const activeFlight = selectedFlights[activeFlightIdx] || selectedFlight || {}

    useEffect(() => {
        setSelectedSeats(seatsSelectionMap[activeFlightIdx] || [])
    }, [activeFlightIdx, seatsSelectionMap])

    const toggleSeat = (seatId) => {
        if (MOCK_OCCUPIED.includes(seatId)) return

        setSelectedSeats(prev => {
            if (prev.includes(seatId)) {
                return prev.filter(s => s !== seatId)
            }
            if (prev.length < passengerCount) {
                return [...prev, seatId]
            }
            return prev
        })
    }

    const renderSeat = (rowNum, col, isBusiness, isExit) => {
        const seatId = `${rowNum}${col}`
        const isOccupied = MOCK_OCCUPIED.includes(seatId)
        const isSelected = selectedSeats.includes(seatId)

        return (
            <div key={seatId} className="relative group">
                <button
                    onClick={() => toggleSeat(seatId)}
                    onMouseEnter={() => !isOccupied && setHoveredSeat({ id: seatId, isBusiness, isExit })}
                    onMouseLeave={() => setHoveredSeat(null)}
                    disabled={isOccupied}
                    className={`relative flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl transition-all duration-500 overflow-hidden ${isOccupied
                        ? 'bg-slate-100 text-slate-300 cursor-not-allowed opacity-60'
                        : isSelected
                            ? 'bg-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.5)] scale-110 z-20'
                            : isBusiness
                                ? 'bg-amber-50 border-2 border-amber-200 text-amber-600 hover:bg-amber-100 hover:border-amber-400 hover:-translate-y-1'
                                : isExit
                                    ? 'bg-emerald-50 border-2 border-emerald-200 text-emerald-600 hover:bg-emerald-100 hover:border-emerald-400 hover:-translate-y-1'
                                    : 'bg-white border-2 border-slate-100 text-slate-400 hover:border-blue-400 hover:text-blue-500 hover:-translate-y-1 shadow-sm'
                        }`}
                >
                    <Armchair size={18} className={`${isSelected ? 'animate-pulse' : 'transition-transform group-hover:scale-110'}`} />
                    <span className={`absolute -top-0.5 -right-0.5 text-[8px] font-black px-1.5 py-0.5 rounded-bl-lg transition-colors ${isSelected
                        ? 'bg-blue-400 text-white'
                        : isOccupied
                            ? 'bg-slate-200 text-slate-400'
                            : isBusiness
                                ? 'bg-amber-200 text-amber-800'
                                : 'bg-slate-100 text-slate-500'
                        }`}>
                        {col}
                    </span>

                    {/* Animated shine effect on hover */}
                    {!isOccupied && !isSelected && (
                        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                    )}
                </button>

                {/* Premium Seat Details Tooltip */}
                {hoveredSeat?.id === seatId && (
                    <div className="absolute bottom-full left-1/2 z-[100] mb-5 -translate-x-1/2 animate-in fade-in zoom-in slide-in-from-bottom-4 duration-300">
                        <div className="relative w-80 overflow-hidden rounded-[2.5rem] bg-white/95 p-8 shadow-[0_30px_70px_rgba(0,0,0,0.15)] border border-white/50 backdrop-blur-2xl">
                            {/* Accent Gradient */}
                            <div className={`absolute top-0 left-0 right-0 h-2 ${isBusiness ? 'bg-gradient-to-r from-amber-400 to-yellow-600' : 'bg-gradient-to-r from-blue-400 to-indigo-600'}`} />

                            {/* Tip Arrow */}
                            <div className="absolute bottom-[-10px] left-1/2 h-5 w-5 -translate-x-1/2 rotate-45 bg-white/95 border-r border-b border-white/50" />

                            {/* Header */}
                            <div className="mb-6 flex items-center justify-between" dir="rtl">
                                <div className="text-right">
                                    <h4 className="text-2xl font-black text-slate-900 leading-tight">
                                        {isBusiness ? 'درجة الأعمال' : 'الدرجة السياحية'}
                                        <span className="block text-blue-600 text-sm mt-1">مقعد {seatId}</span>
                                    </h4>
                                    <div className="mt-2 flex items-center gap-2">
                                        <span className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wider ${isExit ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-50 text-blue-700'
                                            }`}>
                                            {isExit ? <Zap size={10} /> : <Star size={10} />}
                                            {isExit ? 'مساحة أرجل إضافية' : 'مقعد قياسي'}
                                        </span>
                                    </div>
                                </div>
                                <div className={`flex h-14 w-14 items-center justify-center rounded-3xl ${isBusiness ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'} shadow-inner`}>
                                    <Armchair size={28} />
                                </div>
                            </div>

                            {/* Details Grid */}
                            <div className="grid grid-cols-3 gap-3" dir="rtl">
                                <div className="flex flex-col items-center justify-center rounded-3xl bg-slate-50/50 p-4 transition-colors hover:bg-slate-100">
                                    <div className="mb-2 text-slate-400"><PitchIcon /></div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">المسافة</p>
                                    <p className="text-sm font-black text-slate-900 mt-1">{isBusiness ? '39"' : isExit ? '36"' : '32"'}</p>
                                </div>
                                <div className="flex flex-col items-center justify-center rounded-3xl bg-slate-50/50 p-4 transition-colors hover:bg-slate-100">
                                    <div className="mb-2 text-slate-400"><WidthIcon /></div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">العرض</p>
                                    <p className="text-sm font-black text-slate-900 mt-1">{isBusiness ? '21"' : '18"'}</p>
                                </div>
                                <div className="flex flex-col items-center justify-center rounded-3xl bg-slate-50/50 p-4 transition-colors hover:bg-slate-100">
                                    <div className="mb-2 text-slate-400"><ReclineIcon /></div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">إمالة</p>
                                    <p className="text-sm font-black text-slate-900 mt-1">{isBusiness ? '5"' : '3"'}</p>
                                </div>
                            </div>

                            <div className="mt-6 flex items-center justify-center gap-2 opacity-30">
                                <div className="h-px w-8 bg-slate-300" />
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-[4px]">
                                    {selectedFlight?.airlineId === 'balqis' ? 'QUEEN BILQIS' : selectedFlight?.airlineId === 'aden' ? 'FLY ADEN' : 'YEMENIA'}
                                </span>
                                <div className="h-px w-8 bg-slate-300" />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        )
    }

    const renderRow = (rowNum) => {
        const isBusiness = BUSINESS_ROWS.includes(rowNum)
        const isExit = EXIT_ROWS.includes(rowNum)

        const leftCols = isBusiness ? ['A', 'B'] : ['A', 'B', 'C']
        const rightCols = isBusiness ? ['E', 'F'] : ['D', 'E', 'F']

        return (
            <div key={rowNum} className="flex items-center justify-center gap-3 sm:gap-6 px-4 sm:px-12 group/row">
                {/* Left Side */}
                <div className={`flex gap-2 sm:gap-3 ${isBusiness ? 'w-[110px] sm:w-[130px] justify-end pr-4' : 'w-[150px] sm:w-[170px] justify-between'}`}>
                    {leftCols.map(col => renderSeat(rowNum, col, isBusiness, isExit))}
                </div>

                {/* Aisle with Row Number */}
                <div className="flex w-12 flex-col items-center justify-center">
                    <span className="text-[11px] font-black text-slate-400 bg-white shadow-sm border border-slate-100 w-8 h-8 rounded-2xl flex items-center justify-center group-hover/row:border-blue-200 group-hover/row:text-blue-500 transition-colors">
                        {rowNum}
                    </span>
                </div>

                {/* Right Side */}
                <div className={`flex gap-2 sm:gap-3 ${isBusiness ? 'w-[110px] sm:w-[130px] justify-start pl-4' : 'w-[150px] sm:w-[170px] justify-between'}`}>
                    {rightCols.map(col => renderSeat(rowNum, col, isBusiness, isExit))}
                </div>
            </div>
        )
    }

    const handleContinue = () => {
        if (selectedSeats.length === passengerCount) {
            const nextMap = { ...seatsSelectionMap, [activeFlightIdx]: selectedSeats }
            setSeatsSelectionMap(nextMap)

            if (activeFlightIdx < selectedFlights.length - 1) {
                setActiveFlightIdx(activeFlightIdx + 1)
                window.scrollTo({ top: 0, behavior: 'smooth' })
            } else {
                navigate('/travelers', {
                    state: {
                        selectedFlight: selectedFlights[0],
                        selectedFlights,
                        seatsSelectionMap: nextMap,
                        searchCriteria,
                        selectedSeats: nextMap[0] || []
                    }
                })
            }
        }
    }

    return (
        <main className="min-h-screen bg-[#f3f4f6] pb-64 pt-24 sm:pt-28" dir="rtl">
            <div className="sticky top-16 z-40 w-full border-b border-slate-200 bg-white/90 py-4 backdrop-blur-xl sm:top-20">
                <div className="mx-auto max-w-7xl px-4 sm:px-6">
                    <BookingStepper current="seats" />
                </div>
            </div>

            <div className="mx-auto mt-12 grid w-full max-w-7xl gap-12 px-4 lg:grid-cols-[1fr_400px] sm:px-6">

                {/* Airplane Map Section */}
                <section className="relative z-10 flex flex-col items-center">
                    <div className="mb-12 w-full text-center lg:text-right">
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">اختر مقعدك المفضل</h1>
                        <p className="text-lg font-bold text-slate-550">
                            {activeFlight?.airlineName || 'طيران اليمنية'} | {activeFlight?.raw?.aircraft_type || 'Airbus A320-200'}
                        </p>
                    </div>

                    {selectedFlights.length > 1 && (
                        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-6 py-5 rounded-3xl bg-blue-500/5 border border-blue-500/10 shadow-sm max-w-[580px] w-full" dir="rtl">
                            <div className="flex items-center gap-3">
                                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white font-black text-xs animate-pulse">
                                    {activeFlightIdx + 1}
                                </span>
                                <div className="text-right">
                                    <span className="block text-[10px] font-black uppercase text-blue-500">جاري اختيار مقاعد الرحلة {activeFlightIdx + 1} من {selectedFlights.length}</span>
                                    <span className="block text-xs font-black text-slate-800 mt-0.5">{activeFlight.fromCity} ➔ {activeFlight.toCity}</span>
                                </div>
                            </div>
                            {activeFlightIdx > 0 && (
                                <button
                                    onClick={() => {
                                        setActiveFlightIdx(activeFlightIdx - 1)
                                    }}
                                    className="inline-flex h-9 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-[11px] font-black text-slate-650 shadow-sm hover:bg-slate-50 transition cursor-pointer"
                                >
                                    رجوع للرحلة السابقة
                                </button>
                            )}
                        </div>
                    )}

                    {/* Modern Horizontal Legend */}
                    <div className="flex flex-wrap items-center justify-center gap-6 px-6 py-4 rounded-3xl bg-white border border-slate-200/60 shadow-sm max-w-[580px] w-full mb-6" dir="rtl">
                        <div className="flex items-center gap-2">
                            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-amber-50 border border-amber-200 text-amber-600 shadow-sm">
                                <Armchair size={12} />
                            </span>
                            <span className="text-xs font-black text-slate-700">درجة الأعمال</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-600 shadow-sm">
                                <Armchair size={12} />
                            </span>
                            <span className="text-xs font-black text-slate-700">صف الطوارئ</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-white border border-slate-200 text-slate-400 shadow-sm">
                                <Armchair size={12} />
                            </span>
                            <span className="text-xs font-black text-slate-700">مقعد متاح</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-slate-100 border border-slate-200/40 text-slate-300 shadow-inner">
                                <Armchair size={12} />
                            </span>
                            <span className="text-xs font-black text-slate-700">مقعد محجوز</span>
                        </div>
                    </div>

                    <div className="relative w-full max-w-[580px] mt-48">
                        {/* Realistic Airplane Body */}
                        <div className="relative mx-auto w-full max-w-[480px] bg-gradient-to-b from-white via-slate-50 to-white border-x-[16px] border-slate-200/80 shadow-[0_50px_100px_rgba(0,0,0,0.1)] p-0 overflow-visible pb-32">

                            {/* Nose Section with Cockpit */}
                            <div className="absolute top-[-180px] left-[-16px] right-[-16px] h-[200px] bg-white border-x-[16px] border-t-[16px] border-slate-200/80 shadow-inner"
                                style={{ borderRadius: '50% 50% 0 0 / 100% 100% 0 0' }}>
                                <div className="absolute inset-0 flex flex-col items-center justify-end pb-10">
                                    {/* Cockpit Windows */}
                                    <div className="flex gap-1.5 mb-6">
                                        <div className="w-10 h-5 bg-slate-900 rounded-[15px_4px_4px_15px] shadow-lg opacity-90" />
                                        <div className="w-12 h-6 bg-slate-900 rounded-sm shadow-lg opacity-90" />
                                        <div className="w-12 h-6 bg-slate-900 rounded-sm shadow-lg opacity-90" />
                                        <div className="w-10 h-5 bg-slate-900 rounded-[4px_15px_15px_4px] shadow-lg opacity-90" />
                                    </div>
                                    <div className="h-1.5 w-24 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-20 rounded-full mb-2" />
                                    <span className="text-[12px] font-black text-slate-300 tracking-[8px] uppercase">
                                        {selectedFlight?.airlineId === 'balqis' ? 'QUEEN BILQIS' : selectedFlight?.airlineId === 'aden' ? 'FLY ADEN' : 'YEMENIA'}
                                    </span>
                                </div>
                            </div>

                            {/* Cabin Windows */}
                            <div className="absolute left-1 top-20 bottom-60 w-1.5 flex flex-col gap-10 items-center opacity-10">
                                {Array.from({ length: 20 }).map((_, i) => <div key={i} className="w-2 h-4 bg-slate-900 rounded-full shadow-inner" />)}
                            </div>
                            <div className="absolute right-1 top-20 bottom-60 w-1.5 flex flex-col gap-10 items-center opacity-10">
                                {Array.from({ length: 20 }).map((_, i) => <div key={i} className="w-2 h-4 bg-slate-900 rounded-full shadow-inner" />)}
                            </div>

                            {/* Main Galley Area */}
                            <div className="h-28 w-full bg-slate-50/80 border-y-2 border-slate-100 flex items-center justify-between px-12 relative overflow-hidden">
                                <div className="absolute left-[-20px] top-1/2 -translate-y-1/2 w-6 h-16 bg-brand-blue rounded-r-2xl shadow-lg shadow-brand-blue/20 flex items-center justify-center text-[9px] text-white font-black [writing-mode:vertical-lr] rotate-180 z-10 border-2 border-white/20">EXIT DOOR</div>
                                <div className="absolute right-[-20px] top-1/2 -translate-y-1/2 w-6 h-16 bg-brand-blue rounded-l-2xl shadow-lg shadow-brand-blue/20 flex items-center justify-center text-[9px] text-white font-black [writing-mode:vertical-lr] z-10 border-2 border-white/20">EXIT DOOR</div>
                                <div className="h-full w-px bg-gradient-to-b from-transparent via-slate-200 to-transparent mx-auto" />
                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.8)_0%,transparent_70%)]" />
                            </div>

                            {/* Interior Mapping Area */}
                            <div className="py-12 space-y-5 pt-20">
                                <div className="flex flex-col items-center gap-2 mb-10">
                                    <div className="h-1 w-24 bg-amber-200 rounded-full" />
                                    <span className="text-[10px] font-black text-amber-500 uppercase tracking-[4px]">درجة رجال الأعمال</span>
                                </div>

                                {BUSINESS_ROWS.map(num => renderRow(num))}

                                {/* Overwing Exit Area */}
                                <div className="py-16 flex flex-col items-center justify-center relative">
                                    <div className="absolute left-[-60px] right-[-60px] h-32 bg-emerald-500/5 backdrop-blur-[2px] border-y border-emerald-500/10" />
                                    <div className="z-10 flex flex-col items-center gap-3">
                                        <div className="bg-emerald-500 text-white text-[10px] font-black px-8 py-2.5 rounded-full shadow-xl shadow-emerald-500/20 border-4 border-white">
                                            مخارج طوارئ فوق الأجنحة
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col items-center gap-2 mb-10 pt-4">
                                    <div className="h-1 w-24 bg-blue-100 rounded-full" />
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-[4px]">الدرجة السياحية</span>
                                </div>
                                {ECONOMY_ROWS.map(num => renderRow(num))}
                            </div>

                            {/* Tail Unit Section */}
                            <div className="absolute bottom-[-140px] left-[-16px] right-[-16px] h-[160px] bg-white border-x-[16px] border-b-[16px] border-slate-200/80 shadow-2xl"
                                style={{ borderRadius: '0 0 50% 50% / 0 0 100% 100%' }}>
                                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center">
                                    <div className="relative mb-4">
                                        <Plane className="h-8 w-8 text-slate-100" />
                                        <div className="absolute inset-0 bg-blue-500/10 blur-xl rounded-full" />
                                    </div>
                                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-[6px]">TAIL SECTION</span>
                                </div>
                                {/* Rear Stabilizers Visual */}
                                <div className="absolute bottom-10 left-[-80px] w-20 h-4 bg-slate-200 rounded-full origin-right -rotate-[20deg]" />
                                <div className="absolute bottom-10 right-[-80px] w-20 h-4 bg-slate-200 rounded-full origin-left rotate-[20deg]" />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Information & Actions Sidebar */}
                <aside className="h-fit lg:sticky lg:top-48 space-y-8">

                    {/* Booking Summary Card */}
                    <div className="group relative overflow-hidden rounded-[3rem] border border-white bg-white/80 p-1 shadow-2xl shadow-blue-900/10 backdrop-blur-xl">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-transparent to-indigo-50/30 opacity-50" />
                        <div className="relative rounded-[2.8rem] bg-white p-8 shadow-inner">
                            <div className="mb-8 flex items-center justify-between" dir="rtl">
                                <h3 className="text-xl font-black text-slate-900">ملخص الاختيار</h3>
                                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                                    <Users size={20} />
                                </div>
                            </div>

                            <div className="space-y-6">
                                {selectedFlight?.availableSeats !== undefined && selectedFlight?.availableSeats !== null && (
                                    <div className="flex items-center justify-between rounded-3xl bg-slate-50 border border-slate-100/60 px-5 py-3.5 transition-all duration-300">
                                        <span className="text-xs font-black text-slate-450">المقاعد المتاحة بالرحلة</span>
                                        <span className="text-xs font-black text-slate-700">
                                            {selectedFlight.availableSeats} مقعد
                                        </span>
                                    </div>
                                )}

                                <div className="flex flex-wrap gap-4 min-h-[80px] content-start">
                                    {selectedSeats.length > 0 ? (
                                        selectedSeats.map(seat => (
                                            <div key={seat} className="group/seat relative">
                                                <div className="flex h-16 w-16 items-center justify-center rounded-[1.5rem] bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-black text-2xl shadow-xl shadow-blue-600/30 animate-in zoom-in duration-500 hover:scale-110 transition-transform">
                                                    {seat}
                                                </div>
                                                <button
                                                    onClick={() => toggleSeat(seat)}
                                                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-brand-blue text-white flex items-center justify-center text-[10px] font-bold shadow-lg opacity-0 group-hover/seat:opacity-100 transition-opacity"
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="w-full py-10 rounded-[2.5rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 gap-4 bg-slate-50/50">
                                            <div className="h-14 w-14 rounded-full bg-white flex items-center justify-center shadow-sm">
                                                <Armchair size={24} className="opacity-30" />
                                            </div>
                                            <div className="text-center">
                                                <p className="text-sm font-black text-slate-500">لم يتم اختيار مقاعد</p>
                                                <p className="text-xs font-bold text-slate-400 mt-1">يرجى تحديد {passengerCount} مقاعد</p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="pt-6 border-t border-slate-50">
                                    <button
                                        onClick={handleContinue}
                                        disabled={selectedSeats.length !== passengerCount}
                                        className={`group relative w-full overflow-hidden rounded-3xl py-6 font-black text-base flex items-center justify-center gap-3 transition-all duration-300 ${selectedSeats.length === passengerCount
                                            ? 'bg-brand-blue hover:bg-brand-blue-hover text-white shadow-[0_20px_40px_rgba(73,116,249,0.3)] hover:-translate-y-1 hover:shadow-[0_25px_50px_rgba(73,116,249,0.4)] active:scale-95'
                                            : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                            }`}
                                    >
                                        <span className="relative z-10">تأكيد المقاعد والمتابعة</span>
                                        <ChevronRight size={20} className="relative z-10 rotate-180 group-hover:-translate-x-1 transition-transform" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>



                    {/* Trust Banner */}
                    <div className="flex items-center gap-4 px-6 py-5 rounded-[2rem] bg-white border border-slate-200/50 shadow-[0_8px_30px_rgb(0,0,0,0.02)] transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-brand-blue">
                            <ShieldCheck size={22} />
                        </div>
                        <div className="text-right">
                            <p className="text-xs font-black text-brand-blue uppercase tracking-wider mb-1">آمن 100%</p>
                            <p className="text-xs font-bold text-slate-500 leading-tight">يتم حجز مقعدك فوراً عند التأكيد</p>
                        </div>
                    </div>
                </aside>
            </div>
        </main>
    )
}

export default SeatsPage
