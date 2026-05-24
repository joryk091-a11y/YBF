import { useEffect, useState } from 'react'
import { Car, Hotel, Plane, Search, Armchair, UserCheck, CreditCard, Shield, Package, Clock, Globe, Award, ShieldCheck } from 'lucide-react'

import HeroSearchPanel from '../components/HeroSearchPanel.jsx'
import heroPlane from '../assets/image1.png'

const serviceTabs = [
  { id: 'flight', label: 'رحلات', icon: Plane },
  { id: 'hotel', label: 'فنادق', icon: Hotel },
  { id: 'car', label: 'تأجير سيارات', icon: Car },
]


const faqItems = [
  {
    q: 'ما هو الوزن المسموح به؟',
    a: 'الوزن المسموح به هو الحد الذي تسمح به شركات الطيران للأمتعة، سواء كانت أمتعة الشحن أو أمتعة المقصورة التي يسمح لكل راكب بحملها. تتضمن هذه الحدود قيودًا على الوزن والحجم المسموح بهما مجانًا. تختلف هذه الحدود من شركة طيران إلى أخرى، وتعتمد على عدة عوامل، مثل درجة المقصورة، ونوع الطائرة، والوجهة المقصودة، وغيرها. يمكن العثور على تفاصيل الوزن المسموح به عند حجز التذكرة، ويفضل مراجعة هذه المعلومات لضمان التزامك بالقواعد المحددة.',
  },
  {
    q: 'هل يمكن تعديل بيانات المسافر بعد الحجز؟',
    a: 'وفقًا لسياسات شركات الطيران، لا يمكن تعديل بيانات المسافر بعد حجز التذكرة، سواء كان الاسم غير صحيح أو ناقص. ومع ذلك، قد تسمح بعض شركات الطيران بتصحيح الاسم بما لا يزيد عن ثلاثة أحرف بشرط ألا يتغير المعنى.',
  },
  {
    q: 'متى اروح المطار قبل الرحلة بكم؟',
    a: 'من أجل تنفيذ معاملاتك بسلاسة، يوصى بالتواجد في المطار قبل ساعتين على الأقل من موعد الإقلاع للرحلات الداخلية، وقبل 3 ساعات على الأقل من موعد الإقلاع للرحلات الدولية.',
  },
  {
    q: 'هل يمكنني تغيير تاريخ أو مسار التذكرة؟',
    a: 'أي تغييرات في التذكرة تكون وفقًا لسياسات شركة الطيران. في حالة السماح بتغيير التذكرة، سيتم فرض رسوم تغيير أو فارق سعر وفقًا لسياسة شركة الطيران.',
  },
  {
    q: 'ما هي الأمور التي يجب معرفتها حول إجراءات الإلغاء والاسترداد؟',
    a: 'يجب قراءة شروط إلغاء واسترداد التذكرة بعناية قبل الحجز. يتم تصنيف الحجوزات بطرق مختلفة في شركات الطيران. وبما أن قواعد التذاكر تتغير حسب الوقت المتبقي قبل الرحلة، وشركة الطيران، وفئة التذكرة، يجب اختيار التذكرة التي تناسب ظروفك وبرنامجك من البداية لتجنب المشاكل لاحقًا.',
  },
]

const steps = [
  {
    title: 'ابحث عن رحلتك',
    description: 'قارن بين مئات الرحلات والأسعار من مختلف شركات الطيران اليمنية والدولية.',
    icon: Search,
    color: 'bg-blue-50 text-blue-600',
  },
  {
    title: 'اختر مقعدك',
    description: 'استعرض مخطط الطائرة الحقيقي واختر مقعدك المفضل بكل سهولة.',
    icon: Armchair,
    color: 'bg-amber-50 text-amber-600',
  },
  {
    title: 'أدخل بياناتك',
    description: 'قم بتعبئة بيانات المسافرين وحفظها لحجوزاتك القادمة بشكل أسرع.',
    icon: UserCheck,
    color: 'bg-emerald-50 text-emerald-600',
  },
  {
    title: 'احجز واستلم التذكرة',
    description: 'ادفع بأمان عبر وسائل الدفع المتاحة واستلم تذكرتك الإلكترونية فوراً.',
    icon: CreditCard,
    color: 'bg-purple-50 text-purple-600',
  },
]

function HomePage() {
  const [showHeroText, setShowHeroText] = useState(false)
  const [activeService, setActiveService] = useState('flight')

  useEffect(() => {
    const timer = setTimeout(() => setShowHeroText(true), 80)
    return () => clearTimeout(timer)
  }, [])

  return (
    <main>
      <section className="relative min-h-[100svh] overflow-hidden bg-[#e9edf6]">
        <img
          src={heroPlane}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover object-center -translate-y-14 sm:-translate-y-20 lg:-translate-y-28"
        />

        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(120% 90% at 50% 14%, transparent 55%, rgba(233,237,246,0.55) 78%, rgba(233,237,246,0.92) 100%)',
          }}
          aria-hidden="true"
        />

        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-56 bg-gradient-to-b from-transparent via-[#f4f3f9]/70 to-[#f4f3f9] sm:h-64"
          aria-hidden="true"
        />

        <div className="relative mx-auto flex min-h-[100svh] max-w-7xl items-center px-4 pb-14 pt-16 sm:px-6 sm:pb-16 sm:pt-20">
          <div className="relative z-10 max-w-xl text-right -translate-y-[6.75rem] sm:-translate-y-[7.5rem] sm:-translate-x-3 lg:-translate-y-[8.5rem] lg:-translate-x-6">
            <h1
              className={`mt-8 text-4xl font-black leading-[1.02] text-slate-900 transition-all duration-700 sm:text-5xl lg:text-7xl ${showHeroText ? 'translate-x-0 opacity-100' : 'translate-x-6 opacity-0'
                }`}
            >
              هل أنت مستعد
              <br />
              <span className="text-[#f93f3b]">للإقلاع؟</span>
            </h1>
          </div>
        </div>
      </section>

      <div id="search-panel" className="relative z-30 -mt-60 pb-12 sm:-mt-64 sm:pb-16">
        <div className="absolute -top-10 left-1/2 z-40 -translate-x-1/2 sm:-top-12" dir="rtl">
          <div className="inline-flex overflow-hidden rounded-lg bg-white shadow-sm ring-1 ring-slate-200">
            {serviceTabs.map((tab) => {
              const Icon = tab.icon
              const isActive = activeService === tab.id
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveService(tab.id)}
                  className={`inline-flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold transition sm:px-5 ${isActive ? 'bg-slate-900 text-white' : 'bg-white text-slate-700 hover:bg-slate-100'
                    }`}
                >
                  <Icon className="h-4.5 w-4.5" />
                  {tab.label}
                </button>
              )
            })}
          </div>
        </div>

        <div className="pt-4">
          <HeroSearchPanel />
        </div>


        {/* Innovative 'Flight Journey' Section */}
        <section id="how-it-works" className="mx-auto mt-40 max-w-7xl px-4 sm:px-6 lg:px-8 relative" dir="rtl">
          <div className="relative mb-24 text-center">
            <span className="inline-block rounded-full bg-blue-600/10 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 mb-4">
              رحلة الحجز
            </span>
            <h2 className="text-4xl font-black tracking-tight text-slate-900 sm:text-5xl">خطوات بسيطة.. لرحلة سعيدة</h2>
            <div className="mx-auto mt-4 h-1.5 w-24 rounded-full bg-gradient-to-r from-blue-600 to-indigo-400" />
          </div>

          <div className="relative">
            <svg className="absolute left-0 top-1/2 hidden w-full -translate-y-1/2 lg:block" height="200" viewBox="0 0 1200 200" fill="none" preserveAspectRatio="none">
              <path
                d="M50,100 C200,100 250,50 400,50 C550,50 650,150 800,150 C950,150 1000,100 1150,100"
                stroke="#cbd5e1"
                strokeWidth="2"
                strokeDasharray="12 12"
                className="animate-[dash_60s_linear_infinite]"
              />
              <circle r="4" fill="#2563eb">
                <animateMotion
                  path="M50,100 C200,100 250,50 400,50 C550,50 650,150 800,150 C950,150 1000,100 1150,100"
                  dur="10s"
                  repeatCount="indefinite"
                />
              </circle>
            </svg>

            <div className="grid gap-12 lg:grid-cols-4 relative z-10">
              {steps.map((step, index) => (
                <div
                  key={index}
                  className={`group relative flex flex-col items-center text-center transition-all duration-500 hover:scale-105 ${index % 2 === 0 ? 'lg:-translate-y-8' : 'lg:translate-y-8'
                    }`}
                >
                  <div className={`relative mb-8 flex h-24 w-24 items-center justify-center rounded-[2rem] border-4 border-white shadow-2xl transition-all duration-500 group-hover:rotate-[15deg] group-hover:shadow-blue-600/20 ${step.color}`}>
                    <div className="absolute inset-0 rounded-[2rem] opacity-20 bg-current" />
                    <step.icon className="h-10 w-10 relative z-10" />
                    <div className="absolute -right-2 -top-2 flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-sm font-black text-white shadow-lg">
                      {index + 1}
                    </div>
                  </div>
                  <div className="rounded-[2.5rem] bg-white/40 p-8 backdrop-blur-xl border border-white/60 shadow-xl transition-all group-hover:bg-white group-hover:shadow-2xl">
                    <h3 className="mb-4 text-xl font-black text-slate-900">{step.title}</h3>
                    <p className="text-sm leading-7 font-medium text-slate-500">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <style>{`
          @keyframes dash {
            to { stroke-dashoffset: -1000; }
          }
        `}</style>

        {/* Modernized FAQ Section */}
        <section id="faq" className="mx-auto mt-40 max-w-4xl px-4 pb-32 sm:px-6 lg:px-8" dir="rtl">
          <div className="text-center mb-16">
            <span className="inline-block rounded-full bg-blue-600/10 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 mb-4">
              الأسئلة الشائعة
            </span>
            <h2 className="text-3xl font-black text-slate-900 sm:text-5xl">لديك استفسار؟ <br /> <span className="text-blue-600">نحن هنا للإجابة</span></h2>
            <p className="mt-6 text-sm font-semibold text-slate-500 sm:text-base">
              إليك كل ما تحتاج معرفته حول إجراءات الحجز، الأمتعة، والسياسات العامة.
            </p>
          </div>

          <div className="space-y-4">
            {faqItems.map((item, index) => (
              <details
                key={index}
                className="group overflow-hidden rounded-3xl border border-slate-200 bg-white transition-all duration-300 hover:border-blue-400 hover:shadow-2xl hover:shadow-blue-600/5"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-6 text-right text-lg font-black text-slate-800 transition-colors group-open:bg-blue-600 group-open:text-white marker:content-none">
                  <div className="flex items-center gap-4">
                    <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-600/10 text-xs font-black text-blue-600 group-open:bg-white/20 group-open:text-white">
                      {index + 1}
                    </span>
                    <span>{item.q}</span>
                  </div>
                  <div className="relative h-6 w-6">
                    <div className="absolute top-1/2 left-1/2 h-0.5 w-4 -translate-x-1/2 -translate-y-1/2 bg-current transition-transform group-open:rotate-180" />
                    <div className="absolute top-1/2 left-1/2 h-4 w-0.5 -translate-x-1/2 -translate-y-1/2 bg-current transition-transform group-open:rotate-90" />
                  </div>
                </summary>
                <div className="border-t border-slate-100 bg-slate-50/50 p-8">
                  <p className="text-sm leading-8 font-medium text-slate-600 sm:text-base">
                    {item.a}
                  </p>
                  <div className="mt-6 flex items-center gap-3">
                    <span className="text-[10px] font-black text-slate-400 uppercase">هل كان هذا مفيداً؟</span>
                    <button className="rounded-lg bg-white border border-slate-200 px-3 py-1 text-xs font-bold text-slate-600 hover:bg-emerald-50 hover:text-emerald-600 transition-colors">نعم</button>
                    <button className="rounded-lg bg-white border border-slate-200 px-3 py-1 text-xs font-bold text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors">لا</button>
                  </div>
                </div>
              </details>
            ))}
          </div>
        </section>
      </div>
      
    </main>
  )
}

export default HomePage
