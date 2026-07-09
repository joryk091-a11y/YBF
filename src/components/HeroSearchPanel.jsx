import { useMemo } from 'react'
import { useSearch } from '../utils/SearchContext'
import { useNavigate } from 'react-router-dom'
import { ArrowLeftRight, CalendarDays, ChevronDown, Minus, Plus, Repeat2, Route, TrendingUp, Users, X } from 'lucide-react'

const tabs = [
  { id: 'one-way', label: 'مسار واحد', icon: TrendingUp },
  { id: 'round-trip', label: 'مسارين', icon: Repeat2 },
  { id: 'multi-city', label: 'مدن متعددة', icon: Route },
]

const localAirports = [
  { value: 'aden', city: 'عدن', airport: 'مطار عدن الدولي', region: 'عدن' },
  { value: 'mukalla', city: 'المكلا', airport: 'مطار الريان', region: 'حضرموت' },
  { value: 'seiyun', city: 'سيئون', airport: 'مطار غراف', region: 'حضرموت' },
  { value: 'alghaydah', city: 'الغيضة', airport: 'مطار الغيضة', region: 'المهرة' },
  { value: 'socotra', city: 'سقطرى', airport: 'مطار سقطرى', region: 'سقطرى' },
  { value: 'ataq', city: 'عتق', airport: 'مطار عتق', region: 'شبوة' },
  { value: 'jeddah', city: 'جدة', airport: 'مطار الملك عبدالعزيز', region: 'السعودية' },
  { value: 'riyadh', city: 'الرياض', airport: 'مطار الملك خالد', region: 'السعودية' },
  { value: 'dammam', city: 'الدمام', airport: 'مطار الملك فهد الدولي', region: 'السعودية' },
  { value: 'dubai', city: 'دبي', airport: 'مطار دبي الدولي', region: 'الإمارات' },
  { value: 'doha', city: 'الدوحة', airport: 'مطار حمد الدولي', region: 'قطر' },
  { value: 'kuwait', city: 'الكويت', airport: 'مطار الكويت الدولي', region: 'الكويت' },
  { value: 'amman', city: 'عمّان', airport: 'مطار الملكة علياء', region: 'الأردن' },
  { value: 'cairo', city: 'القاهرة', airport: 'مطار القاهرة الدولي', region: 'مصر' },
  { value: 'djibouti', city: 'جيبوتي', airport: 'مطار جيبوتي الدولي', region: 'جيبوتي' },
  { value: 'addis', city: 'أديس أبابا', airport: 'مطار بولي الدولي', region: 'إثيوبيا' },
]

const getAirport = (value) => localAirports.find((a) => a.value === value) ?? localAirports[0]

const formatDate = (value) => {
  if (!value) return 'اختر التاريخ'
  return String(value).replaceAll('-', '/')
}

function AirportField({ label, value, onChange, ariaLabel, extraPaddingLeft = false, blockedValue = '' }) {
  const airport = useMemo(() => getAirport(value), [value])

  return (
    <label className="grid gap-0.5 px-3 py-3 sm:px-6 sm:py-5 text-right transition-colors hover:bg-slate-50/50 cursor-pointer">
      <span className="text-[10px] sm:text-[12px] font-black uppercase tracking-wider text-slate-400">{label}</span>
      <div className="relative mt-0.5 sm:mt-1">
        <div className={`grid gap-0.5 pr-0 ${extraPaddingLeft ? 'pl-8 sm:pl-10' : 'pl-5 sm:pl-6'}`}>
          <div className="text-base sm:text-xl font-black text-slate-900 leading-tight">{airport.region}</div>
          <div className="text-[10px] sm:text-[11px] font-bold text-slate-400 mt-0 sm:mt-0.5 truncate">
            {airport.airport} - {airport.city}
          </div>
        </div>
        <ChevronDown className="pointer-events-none absolute left-0 top-1/2 h-3.5 sm:h-4 w-3.5 sm:w-4 -translate-y-1/2 text-slate-500" />
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          aria-label={ariaLabel}
          className="absolute inset-0 h-full w-full cursor-pointer appearance-none bg-transparent opacity-0"
        >
          {localAirports.map((item) => (
            <option key={item.value} value={item.value} disabled={item.value === blockedValue}>
              {item.region} - {item.airport} - {item.city}
            </option>
          ))}
        </select>
      </div>
    </label>
  )
}

function DateField({ label, value, onChange, ariaLabel, helper }) {
  const display = formatDate(value)

  return (
    <label className="grid gap-0.5 px-3 py-3 sm:px-6 sm:py-5 text-right transition-colors hover:bg-slate-50/50 cursor-pointer">
      <span className="text-[10px] sm:text-[12px] font-black uppercase tracking-wider text-slate-400">{label}</span>
      <div className="relative mt-0.5 sm:mt-1">
        <div className="grid gap-0.5 pr-0 pl-8 sm:pl-10">
          <div className={`text-base sm:text-xl font-black leading-tight ${value ? 'text-slate-900' : 'text-slate-300'}`}>{display}</div>
          <div className="text-[10px] sm:text-[11px] font-bold text-slate-400 mt-0 sm:mt-0.5">{helper}</div>
        </div>
        <CalendarDays className="pointer-events-none absolute left-0 top-1/2 h-3.5 sm:h-4 w-3.5 sm:w-4 -translate-y-1/2 text-slate-500" />
        <input
          type="date"
          dir="ltr"
          lang="en-CA"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          aria-label={ariaLabel}
          className="absolute inset-0 h-full w-full cursor-pointer appearance-none bg-transparent opacity-0"
        />
      </div>
    </label>
  )
}


function HeroSearchPanel() {
  const navigate = useNavigate()
  const { searchCriteria, updateSearchCriteria, setPassengerCount } = useSearch()

  const {
    activeTab,
    fromCity,
    toCity,
    travelDate,
    returnDate,
    passengerCount,
    segments = [
      { from: localAirports[0].value, to: localAirports[1].value, date: '' },
      { from: localAirports[1].value, to: localAirports[2].value, date: '' },
    ]
  } = searchCriteria

  const setActiveTab = (tabId) => updateSearchCriteria({ activeTab: tabId })
  const setFromCity = (city) => updateSearchCriteria({ fromCity: city })
  const setToCity = (city) => updateSearchCriteria({ toCity: city })
  const setTravelDate = (date) => updateSearchCriteria({ travelDate: date })
  const setReturnDate = (date) => updateSearchCriteria({ returnDate: date })
  const setSegments = (newSegments) => updateSearchCriteria({ segments: typeof newSegments === 'function' ? newSegments(segments) : newSegments })


  const swapFromTo = () => {
    setFromCity(toCity)
    setToCity(fromCity)
  }

  const goToSearch = () => navigate('/search', { state: { searchCriteria } })

  const updateSegment = (index, key, value) => {
    setSegments((current) => current.map((seg, i) => (i === index ? { ...seg, [key]: value } : seg)))
  }

  const addSegment = () => {
    setSegments((current) => {
      const last = current[current.length - 1] ?? { from: localAirports[0].value, to: localAirports[1].value }
      return [...current, { from: last.to, to: localAirports[0].value, date: '' }]
    })
  }

  const swapSegment = (index) => {
    setSegments((current) => current.map((seg, i) => (i === index ? { ...seg, from: seg.to, to: seg.from } : seg)))
  }

  const deleteSegment = (index) => {
    setSegments((current) => current.filter((_, i) => i !== index))
  }

  return (
      <div className="mx-auto w-full max-w-7xl px-3 sm:px-6" dir="rtl">
      <div className="relative rounded-[20px] sm:rounded-[32px] border border-slate-200/60 bg-white/95 backdrop-blur-md px-3 pb-4 pt-4 shadow-[0_20px_60px_rgba(0,0,0,0.1)] sm:px-8 sm:pb-6 sm:pt-8">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          
          {/* Path switcher container */}
          <div className="inline-flex items-center gap-1 p-1 rounded-2xl bg-slate-50 border border-slate-200/60 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] overflow-x-auto max-w-full flex-shrink-0">
            {tabs.map((tab) => {
              const Icon = tab.icon
              const isActive = tab.id === activeTab
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setActiveTab(tab.id)
                    if (tab.id !== 'round-trip') setReturnDate('')
                    if (tab.id !== 'multi-city') return
                    setSegments((current) =>
                      current.length ? current : [{ from: localAirports[0].value, to: localAirports[1].value, date: '' }],
                    )
                  }}
                  className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-[11px] font-black transition-all duration-300 hover:scale-102 active:scale-98 cursor-pointer focus:outline-none whitespace-nowrap ${isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25'
                      : 'text-slate-650 hover:text-blue-600 hover:bg-white/70'
                    }`}
                >
                  <Icon className={`h-3.5 w-3.5 transition-transform duration-300 ${isActive ? 'rotate-3 scale-110' : ''}`} />
                  {tab.label}
                </button>
              )
            })}
          </div>

          <div className="inline-flex items-center gap-2 rounded-2xl border border-slate-200/80 bg-white p-1 px-3 shadow-sm transition-all duration-200 hover:border-blue-500/30 hover:shadow-md flex-shrink-0">
            <div className="flex items-center gap-1.5 border-l border-slate-100 pl-2 py-1">
              <Users className="h-3.5 w-3.5 text-blue-600" />
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 hidden sm:inline">المسافرين</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setPassengerCount(Math.max(1, passengerCount - 1))}
                aria-label="تقليل عدد المسافرين"
                className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-50 text-slate-400 transition-all hover:bg-blue-50 hover:text-blue-600 active:scale-90"
              >
                <Minus className="h-3.5 w-3.5" />
              </button>

              <span className="min-w-[1ch] text-center text-sm font-black text-slate-900">{passengerCount}</span>

              <button
                type="button"
                onClick={() => setPassengerCount(Math.min(9, passengerCount + 1))}
                aria-label="زيادة عدد المسافرين"
                className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-50 text-slate-400 transition-all hover:bg-blue-50 hover:text-blue-600 active:scale-90"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>

        {activeTab === 'multi-city' ? (
          <div className="rounded-xl border border-slate-200 bg-white">
            <div className="border-b border-slate-200 px-4 py-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="text-sm font-black text-slate-900">الرحلات</div>
                <div className="text-xs text-slate-500">أضف أكثر من رحلة وحدد (من/إلى/التاريخ) لكل رحلة</div>
              </div>
            </div>

            <div className="space-y-3 px-4 py-4">
              {segments.map((seg, index) => (
                <div key={`${seg.from}-${seg.to}-${index}`}>
                  <div className="relative">
                    {index >= 2 ? (
                      <button
                        type="button"
                        onClick={() => deleteSegment(index)}
                        aria-label={`حذف الرحلة رقم ${index + 1}`}
                        className="absolute left-3 top-3 z-20 inline-flex items-center justify-center text-slate-400 transition hover:text-blue-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    ) : null}

                    <div className="grid gap-0 rounded-xl border border-slate-200 bg-white sm:grid-cols-[2fr_1fr]">
                      <div className="relative sm:grid sm:grid-cols-2">
                        <div className="border-b border-slate-200 sm:border-b-0 sm:border-l sm:pl-14">
                          <AirportField
                            label="من"
                            value={seg.from}
                            onChange={(val) => updateSegment(index, 'from', val)}
                            ariaLabel={`اختر مطار المغادرة للرحلة ${index + 1}`}
                            extraPaddingLeft
                            blockedValue={seg.to}
                          />
                        </div>

                        <button
                          type="button"
                          onClick={() => swapSegment(index)}
                          aria-label={`تبديل من وإلى للرحلة ${index + 1}`}
                          className="absolute left-1/2 top-1/2 z-10 hidden h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-slate-250 bg-white text-blue-600 shadow-md transition-all duration-300 hover:rotate-180 hover:bg-blue-50 active:translate-y-[-46%] sm:inline-flex"
                        >
                          <ArrowLeftRight className="h-4 w-4" />
                        </button>

                        <div className="sm:pr-14">
                          <AirportField
                            label="إلى"
                            value={seg.to}
                            onChange={(val) => updateSegment(index, 'to', val)}
                            ariaLabel={`اختر مطار الوصول للرحلة ${index + 1}`}
                            blockedValue={seg.from}
                          />
                        </div>
                      </div>

                      <div className="border-t border-slate-200 sm:border-t-0 sm:border-r">
                        <DateField
                          label="التاريخ"
                          value={seg.date}
                          onChange={(val) => updateSegment(index, 'date', val)}
                          ariaLabel={`اختر تاريخ الرحلة ${index + 1}`}
                          helper="حدد تاريخ الرحلة"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-slate-200 px-4 py-4">
              <button
                type="button"
                onClick={addSegment}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-3 text-sm font-black text-slate-700 transition hover:bg-slate-50 cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                إضافة رحلة أخرى
              </button>
            </div>
          </div>
        ) : (
          <>
            {activeTab === 'round-trip' ? (
              <div className="mb-2 px-1 text-right text-xs text-slate-500 hidden sm:block">
                حدد رحلة الذهاب والعودة عبر اختيار (من/إلى/تاريخ الذهاب/تاريخ العودة)
              </div>
            ) : null}
            <div
              className={`rounded-xl sm:rounded-2xl border border-slate-200 bg-white overflow-hidden grid ${
                activeTab === 'round-trip'
                  ? 'grid-cols-2 sm:grid-cols-none sm:grid-flow-col lg:grid-cols-4'
                  : 'grid-cols-2 sm:grid-cols-none lg:grid-cols-3'
              }`}
            >
              <div className="relative col-span-2 sm:col-span-1 sm:col-auto grid grid-cols-2 sm:grid-cols-none sm:flex">
                <div className="border-b sm:border-b-0 border-l border-slate-200 sm:border-l-0 sm:border-r">
                  <AirportField
                    label="من"
                    value={fromCity}
                    onChange={setFromCity}
                    ariaLabel="اختر مطار المغادرة"
                    extraPaddingLeft
                    blockedValue={toCity}
                  />
                </div>

                <button
                  type="button"
                  onClick={swapFromTo}
                  aria-label="تبديل من وإلى"
                  className="absolute left-1/2 top-1/2 z-10 hidden h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white text-blue-600 shadow-md transition-all duration-300 hover:rotate-180 hover:bg-blue-50 active:translate-y-[-46%] sm:inline-flex"
                >
                  <ArrowLeftRight className="h-3.5 w-3.5" />
                </button>

                <div className="border-b border-slate-200 sm:border-b-0 sm:flex-1">
                  <AirportField
                    label="إلى"
                    value={toCity}
                    onChange={setToCity}
                    ariaLabel="اختر مطار الوصول"
                    blockedValue={fromCity}
                  />
                </div>
              </div>

              <div className={`col-span-2 sm:col-span-1 grid ${activeTab === 'round-trip' ? 'grid-cols-2' : 'grid-cols-1 sm:grid-cols-none'}`}>
                <div
                  className={`border-t sm:border-t-0 border-slate-200 ${activeTab === 'round-trip' ? 'border-l sm:border-l-0' : ''}`}
                >
                  <DateField
                    label="تاريخ السفر"
                    value={travelDate}
                    onChange={setTravelDate}
                    ariaLabel="اختر تاريخ السفر"
                    helper="اليوم الذي ستسافر فيه"
                  />
                </div>

                {activeTab === 'round-trip' ? (
                  <div className="border-t sm:border-t-0 border-slate-200">
                    <DateField
                      label="تاريخ العودة"
                      value={returnDate}
                      onChange={setReturnDate}
                      ariaLabel="اختر تاريخ العودة"
                      helper="تاريخ الرجوع"
                    />
                  </div>
                ) : null}
              </div>

            </div>
          </>
        )}

        <button
          type="button"
          onClick={goToSearch}
          className="mt-5 h-13 w-full rounded-2xl bg-blue-600 text-sm font-black text-white shadow-xl shadow-blue-600/30 transition-all duration-300 hover:-translate-y-0.5 hover:bg-blue-500 hover:shadow-2xl hover:shadow-blue-600/40 active:translate-y-[1px] cursor-pointer sm:h-14 sm:text-base"
        >
          ابحث عن أفضل الرحلات الآن
        </button>
      </div>
    </div>
  )
}

export default HeroSearchPanel
