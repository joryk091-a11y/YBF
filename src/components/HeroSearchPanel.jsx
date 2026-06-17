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
    <label className="grid gap-1 px-6 py-5 text-right transition-colors hover:bg-slate-50/50">
      <span className="text-[12px] font-black uppercase tracking-wider text-slate-400">{label}</span>
      <div className="relative mt-1">
        <div className={`grid gap-0.5 pr-0 ${extraPaddingLeft ? 'pl-10' : 'pl-6'}`}>
          <div className="text-xl font-black text-slate-900 leading-tight">{airport.region}</div>
          <div className="text-[11px] font-bold text-slate-400 mt-0.5">
            {airport.airport} - {airport.city}
          </div>
        </div>
        <ChevronDown className="pointer-events-none absolute left-0 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
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
    <label className="grid gap-1 px-6 py-5 text-right transition-colors hover:bg-slate-50/50">
      <span className="text-[12px] font-black uppercase tracking-wider text-slate-400">{label}</span>
      <div className="relative mt-1">
        <div className="grid gap-0.5 pr-0 pl-10">
          <div className={`text-xl font-black leading-tight ${value ? 'text-slate-900' : 'text-slate-300'}`}>{display}</div>
          <div className="text-[11px] font-bold text-slate-400 mt-0.5">{helper}</div>
        </div>
        <CalendarDays className="pointer-events-none absolute left-0 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
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
    <div className="mx-auto w-full max-w-7xl px-4 sm:px-6" dir="rtl">
      <div className="relative rounded-[32px] border border-slate-200 bg-white px-6 pb-6 pt-8 shadow-[0_20px_50px_rgba(15,23,42,0.12)] sm:px-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="inline-flex items-center gap-1 rounded-full bg-[#0f172a] p-1 shadow-lg shadow-slate-200">
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
                  className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-xs font-bold transition-all ${isActive
                      ? 'border-white bg-white text-slate-900 shadow-sm'
                      : 'border-transparent bg-transparent text-white/80 hover:bg-white/10 hover:text-white'
                    }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {tab.label}
                </button>
              )
            })}
          </div>

          <div className="inline-flex items-center gap-3 rounded-full border border-slate-200 bg-white p-1 px-4 shadow-sm transition-all hover:border-slate-300 hover:shadow-md">
            <div className="flex items-center gap-2 border-l border-slate-100 pl-3 py-1">
              <Users className="h-4 w-4 text-[#4974f9]" />
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">المسافرين</span>
            </div>
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => setPassengerCount(Math.max(1, passengerCount - 1))}
                aria-label="تقليل عدد المسافرين"
                className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-50 text-slate-400 transition-all hover:bg-slate-100 hover:text-[#4974f9] active:scale-90"
              >
                <Minus className="h-3.5 w-3.5" />
              </button>

              <span className="min-w-[1ch] text-center text-sm font-black text-slate-900">{passengerCount}</span>

              <button
                type="button"
                onClick={() => setPassengerCount(Math.min(9, passengerCount + 1))}
                aria-label="زيادة عدد المسافرين"
                className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-50 text-slate-400 transition-all hover:bg-slate-100 hover:text-[#4974f9] active:scale-90"
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
                        className="absolute left-3 top-3 z-20 inline-flex items-center justify-center text-slate-400 transition hover:text-[#4974f9]"
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
                          className="absolute left-1/2 top-1/2 z-10 hidden h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50 hover:text-slate-900 active:translate-y-[-46%] sm:inline-flex"
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
                className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-3 text-sm font-black text-slate-700 transition hover:bg-slate-50"
              >
                <Plus className="h-4 w-4" />
                إضافة رحلة أخرى
              </button>
            </div>
          </div>
        ) : (
          <>
            {activeTab === 'round-trip' ? (
              <div className="mb-2 px-1 text-right text-xs text-slate-500">
                حدد رحلة الذهاب والعودة عبر اختيار (من/إلى/تاريخ الذهاب/تاريخ العودة)
              </div>
            ) : null}
            <div
              className={`grid gap-0 rounded-xl border border-slate-200 bg-white ${activeTab === 'round-trip' ? 'lg:grid-cols-4' : 'lg:grid-cols-3'
                }`}
            >
              <div className="relative sm:col-span-2 sm:grid sm:grid-cols-2">
                <div className="border-b border-slate-200 sm:border-b-0 sm:border-l sm:pl-14">
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
                  className="absolute left-1/2 top-1/2 z-10 hidden h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50 hover:text-slate-900 active:translate-y-[-46%] sm:inline-flex"
                >
                  <ArrowLeftRight className="h-4 w-4" />
                </button>

                <div className="border-b border-slate-200 sm:border-b-0 sm:border-l sm:pr-14">
                  <AirportField
                    label="إلى"
                    value={toCity}
                    onChange={setToCity}
                    ariaLabel="اختر مطار الوصول"
                    blockedValue={fromCity}
                  />
                </div>
              </div>

              <div className={`${activeTab === 'round-trip' ? 'sm:col-span-2' : 'sm:col-span-1'}`}>
                <div className={`grid ${activeTab === 'round-trip' ? 'sm:grid-cols-2' : ''}`}>
                  <div
                    className={`border-t border-slate-200 sm:border-t-0 ${activeTab === 'round-trip' ? 'sm:border-l' : ''
                      }`}
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
                    <div className="border-t border-slate-200 sm:border-t-0">
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

            </div>
          </>
        )}

        <button
          type="button"
          onClick={goToSearch}
          className="mt-6 h-14 w-full rounded-2xl bg-[#4974f9] text-base font-black text-white shadow-xl shadow-[#4974f9]/30 transition-all hover:-translate-y-0.5 hover:bg-[#355ecb] hover:shadow-2xl hover:shadow-[#4974f9]/40 active:translate-y-[1px]"
        >
          ابحث عن أفضل الرحلات الآن
        </button>
      </div>
    </div>
  )
}

export default HeroSearchPanel
