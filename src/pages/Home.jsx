import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Car, Hotel, Plane, MapPin, LayoutGrid, ClipboardList, Ticket, Shield, Package, Clock, Globe, Award, ShieldCheck, HeartPulse, Headphones, Check, LayoutDashboard, FileText } from 'lucide-react'

import HeroSearchPanel from '../components/HeroSearchPanel.jsx'
import heroPlane from '../assets/image1.png'
import { useSearch } from '../utils/SearchContext'
import ScrollReveal from '../components/ScrollReveal.jsx'

import cairoImg from '../assets/cairo.png'
import dubaiImg from '../assets/dubai.png'
import riyadhImg from '../assets/riyadh.png'
import ammanImg from '../assets/amman.png'

const servicesList = [
  {
    title: 'حجز وإصدار التذاكر الرقمية',
    description: 'ابحث وقارن بين خيارات الطيران من وإلى اليمن ووفر عناء الحجز مع تأكيد فوري وتذكرة إلكترونية مؤمنة.',
    icon: Plane,
    badge: 'النظام الأساسي',
    features: ['تأكيد فوري وتصميم QR', 'أسعار تنافسية وحصرية', 'مزامنة فورية مع شركات الطيران'],
    gradient: 'from-blue-600 to-indigo-650',
    glowColor: 'rgba(59,130,246,0.15)'
  },
  {
    title: 'مخطط المقاعد التفاعلي',
    description: 'اختر مقعدك المفضل (بجوار النافذة، الممر، أو مساحة إضافية) مباشرة عبر مخطط تفاعلي حقيقي للطائرة أثناء الحجز.',
    icon: LayoutGrid,
    features: ['تحديد فوري للمقاعد', 'رؤية واضحة لتوزيع الصفوف', 'خيارات لدرجة الأعمال والدرجة السياحية'],
    gradient: 'from-purple-550 to-indigo-600',
    glowColor: 'rgba(168,85,247,0.1)'
  },
  {
    title: 'إدارة وتعديل الحجوزات',
    description: 'لوحة تحكم خاصة بالمسافر لاستعراض التذاكر النشطة، طباعتها، طلب إلغاء الحجز أو تعديل موعد الرحلة بسهولة.',
    icon: ClipboardList,
    features: ['استعراض وتعديل بيانات المسافرين', 'إلغاء واسترجاع مرن للتذاكر', 'تحميل وحفظ التذكرة بصيغة PDF'],
    gradient: 'from-emerald-500 to-teal-650',
    glowColor: 'rgba(16,185,129,0.1)'
  },
  {
    title: 'الخدمات الطبية والرعاية الخاصة',
    description: 'طلب خدمات رعاية إضافية مثل الكراسي المتحركة، مرافق طبي للرحلة، أو رعاية خاصة للأطفال والمسافرين كبار السن.',
    icon: HeartPulse,
    features: ['تنسيق مسبق للخدمات الطبية', 'تأمين كراسي ومعدات حركة بالمطارات', 'متابعة وتأكيد من شركة الطيران'],
    gradient: 'from-rose-500 to-pink-650',
    glowColor: 'rgba(244,63,94,0.1)'
  },
  {
    title: 'بوابة شركات الطيران الشريكة',
    description: 'لوحة عمل متكاملة لشركاء الطيران تتيح لهم جدولة وتعديل الرحلات، مراجعة قوائم المسافرين، والاطلاع على التحليلات المالية.',
    icon: LayoutDashboard,
    features: ['إدارة وجدولة الرحلات للشركاء', 'متابعة وتأكيد قوائم الركاب', 'تقارير مالية وتحليلية للوجهات'],
    gradient: 'from-amber-500 to-orange-600',
    glowColor: 'rgba(245,158,11,0.1)'
  },
  {
    title: 'دعم وحل مشكلات الحجوزات 24/7',
    description: 'فريق دعم فني متواجد على مدار الساعة لمساعدتك في أي استفسارات تخص مواعيد الرحلات أو الحجوزات الطارئة.',
    icon: Headphones,
    badge: 'دعم متكامل',
    features: ['دعم سريع عبر الواتساب والهاتف', 'مساعدة في حالات التغيير الاضطراري', 'استجابة سريعة للشكاوى والمقترحات'],
    gradient: 'from-blue-600 to-indigo-750',
    glowColor: 'rgba(59,130,246,0.15)'
  }
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
    icon: MapPin,
    gradient: 'from-blue-600 to-indigo-650',
    bgLight: 'bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-900/50',
    glowColor: '#3b82f6'
  },
  {
    title: 'اختر مقعدك',
    description: 'استعرض مخطط الطائرة الحقيقي واختر مقعدك المفضل بكل سهولة.',
    icon: LayoutGrid,
    gradient: 'from-amber-500 to-orange-500',
    bgLight: 'bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-900/50',
    glowColor: '#f59e0b'
  },
  {
    title: 'أدخل بياناتك',
    description: 'قم بتعبئة بيانات المسافرين وحفظها لحجوزاتك القادمة بشكل أسرع.',
    icon: ClipboardList,
    gradient: 'from-emerald-500 to-teal-500',
    bgLight: 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/50',
    glowColor: '#10b981'
  },
  {
    title: 'احجز واستلم التذكرة',
    description: 'ادفع بأمان عبر وسائل الدفع المتاحة واستلم تذكرتك الإلكترونية فوراً.',
    icon: Ticket,
    gradient: 'from-purple-500 to-indigo-500',
    bgLight: 'bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400 border-purple-100 dark:border-purple-900/50',
    glowColor: '#8b5cf6'
  },
]

const popularDestinations = [
  {
    id: 'cairo',
    city: 'القاهرة',
    country: 'جمهورية مصر العربية',
    airport: 'مطار القاهرة الدولي',
    image: cairoImg,
    price: '180',
    tag: 'الأكثر زيارة',
  },
  {
    id: 'dubai',
    city: 'دبي',
    country: 'الإمارات العربية المتحدة',
    airport: 'مطار دبي الدولي',
    image: dubaiImg,
    price: '220',
    tag: 'طلب مرتفع',
  },
  {
    id: 'riyadh',
    city: 'الرياض',
    country: 'المملكة العربية السعودية',
    airport: 'مطار الملك خالد الدولي',
    image: riyadhImg,
    price: '250',
    tag: 'شعبية كبيرة',
  },
  {
    id: 'amman',
    city: 'عمّان',
    country: 'المملكة الأردنية الهاشمية',
    airport: 'مطار الملكة علياء الدولي',
    image: ammanImg,
    price: '190',
    tag: 'أفضل قيمة',
  },
]

const qrGrid = [
  1, 1, 1, 0, 1, 0, 0, 1, 1, 1,
  1, 0, 1, 0, 0, 1, 0, 1, 0, 1,
  1, 1, 1, 0, 1, 1, 0, 1, 1, 1,
  0, 0, 0, 1, 0, 0, 1, 0, 0, 0,
  1, 0, 1, 0, 1, 1, 0, 1, 0, 1,
  0, 1, 0, 1, 0, 0, 1, 0, 1, 0,
  0, 0, 1, 0, 1, 1, 0, 1, 0, 0,
  1, 1, 1, 0, 0, 1, 0, 1, 1, 0,
  1, 0, 1, 0, 1, 0, 1, 0, 0, 1,
  1, 1, 1, 0, 1, 1, 0, 1, 1, 0
]

const qrGridMini = [
  1, 1, 0, 1, 1, 1,
  1, 1, 1, 0, 0, 1,
  0, 1, 0, 1, 1, 0,
  1, 0, 1, 1, 0, 1,
  1, 1, 0, 0, 1, 0,
  1, 1, 1, 0, 0, 1
]

function HomePage() {
  const [showHeroText, setShowHeroText] = useState(false)
  const [activeStep, setActiveStep] = useState(0)
  const [openFaq, setOpenFaq] = useState(0)
  const navigate = useNavigate()
  const { updateSearchCriteria } = useSearch()

  const handleDestinationSelect = (destId) => {
    updateSearchCriteria({ toCity: destId })
    const searchPanel = document.getElementById('search-panel')
    if (searchPanel) {
      searchPanel.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  const handleBookNow = (e, destId) => {
    e.stopPropagation()
    updateSearchCriteria({ toCity: destId })
    navigate('/search')
  }

  useEffect(() => {
    const timer = setTimeout(() => setShowHeroText(true), 80)
    return () => clearTimeout(timer)
  }, [])

  const stepMockups = [
    // Step 1: Flight Search Mockup
    <div key="step-1" className="flex flex-col gap-4 bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-md border border-slate-100 dark:border-slate-800 w-full max-w-sm mx-auto">
      <div className="flex items-center justify-between border-b border-slate-50 dark:border-slate-800 pb-3">
        <span className="text-xs font-black text-slate-800 dark:text-white">البحث عن رحلة</span>
        <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
      </div>
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex-1 bg-slate-50 dark:bg-slate-950 rounded-xl p-2 text-right">
            <span className="block text-[8px] text-slate-400">من</span>
            <span className="text-xs font-black text-slate-700 dark:text-slate-200">عدن (ADE)</span>
          </div>
          <div className="h-6 w-6 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shrink-0 select-none text-[10px] font-black">⇄</div>
          <div className="flex-1 bg-slate-50 dark:bg-slate-950 rounded-xl p-2 text-right">
            <span className="block text-[8px] text-slate-400">إلى</span>
            <span className="text-xs font-black text-slate-700 dark:text-slate-200">القاهرة (CAI)</span>
          </div>
        </div>
        <div className="bg-slate-50 dark:bg-slate-950 rounded-xl p-3 flex justify-between items-center">
          <div className="text-right">
            <span className="block text-[8px] text-slate-400 font-semibold">تاريخ المغادرة</span>
            <span className="text-xs font-black text-slate-700 dark:text-slate-200">28 يوليو 2026</span>
          </div>
          <Plane className="h-4 w-4 text-blue-500" />
        </div>
        <button className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-black shadow-sm transition-all">
          البحث عن الرحلات
        </button>
      </div>
    </div>,

    // Step 2: Seat Selection Mockup
    <div key="step-2" className="flex flex-col gap-4 bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-md border border-slate-100 dark:border-slate-800 w-full max-w-sm mx-auto">
      <div className="flex items-center justify-between border-b border-slate-50 dark:border-slate-800 pb-3">
        <span className="text-xs font-black text-slate-800 dark:text-white">اختيار المقعد</span>
        <span className="text-[10px] font-bold text-amber-600 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-full">درجة الأعمال</span>
      </div>
      <div className="grid grid-cols-4 gap-2 justify-center py-2 max-w-[200px] mx-auto">
        {['1A', '1B', '1C', '1D', '2A', '2B', '2C', '2D', '3A', '3B', '3C', '3D'].map((seat, i) => {
          const isSelected = seat === '2B';
          const isBooked = ['1A', '1D', '3A', '3C'].includes(seat);
          return (
            <button
              key={seat}
              disabled={isBooked}
              className={`h-8 w-8 rounded-lg text-[9px] font-black transition-all flex items-center justify-center ${isSelected
                ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20 scale-105'
                : isBooked
                  ? 'bg-slate-100 dark:bg-slate-950 text-slate-350 dark:text-slate-700 cursor-not-allowed'
                  : 'bg-slate-50 dark:bg-slate-850 hover:bg-amber-50 dark:hover:bg-amber-950 text-slate-700 dark:text-slate-300 border border-slate-200/40 dark:border-slate-800'
                }`}
            >
              {seat}
            </button>
          );
        })}
      </div>
      <div className="flex justify-between items-center border-t border-slate-50 dark:border-slate-800 pt-3">
        <span className="text-[10px] text-slate-400 font-bold">المقعد المختار</span>
        <span className="text-xs font-black text-amber-600">الصف 2 ، المقعد 2B</span>
      </div>
    </div>,

    // Step 3: Traveler Details Mockup
    <div key="step-3" className="flex flex-col gap-4 bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-md border border-slate-100 dark:border-slate-800 w-full max-w-sm mx-auto">
      <div className="flex items-center justify-between border-b border-slate-50 dark:border-slate-800 pb-3">
        <span className="text-xs font-black text-slate-800 dark:text-white">معلومات المسافر الرئيسي</span>
        <span className="text-[10px] text-emerald-600 font-black">الخطوة 3 من 4</span>
      </div>
      <div className="space-y-3">
        <div className="space-y-1 text-right">
          <label className="text-[9px] font-black text-slate-450">الاسم الكامل (كما في الجواز)</label>
          <input
            type="text"
            readOnly
            value="أحمد محمد علي"
            className="w-full bg-slate-50 dark:bg-slate-950 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 border-none outline-none"
          />
        </div>
        <div className="space-y-1 text-right">
          <label className="text-[9px] font-black text-slate-450">رقم جواز السفر</label>
          <input
            type="text"
            readOnly
            value="092837482"
            className="w-full bg-slate-50 dark:bg-slate-950 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 border-none outline-none"
          />
        </div>
        <div className="flex items-center gap-2 mt-2 bg-emerald-50/50 dark:bg-emerald-950/10 p-2.5 rounded-xl border border-emerald-100/50 dark:border-emerald-900/40">
          <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
          <span className="text-[9px] font-black text-emerald-700 dark:text-emerald-400">تم التحقق من تطابق البيانات مع شروط السفر</span>
        </div>
      </div>
    </div>,

    // Step 4: Booking & Ticket Mockup
    <div key="step-4" className="relative overflow-hidden bg-gradient-to-br from-indigo-900 to-slate-900 rounded-3xl p-5 text-white w-full max-w-sm mx-auto shadow-xl border border-indigo-950">
      {/* Flight info */}
      <div className="relative z-10 flex justify-between items-start mb-6">
        <div>
          <span className="text-[10px] font-bold text-indigo-250 block">رقم الرحلة</span>
          <span className="text-sm font-black tracking-wider">IY 607</span>
        </div>
        <div className="text-left">
          <span className="text-[10px] font-bold text-indigo-250 block">اليمنية للخطوط الجوية</span>
          <span className="text-xs bg-indigo-500/30 px-2 py-0.5 rounded-md font-bold text-white">تذكرة مؤكدة</span>
        </div>
      </div>

      {/* Flight locations details */}
      <div className="relative z-10 flex justify-between items-center bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10 mb-5">
        <div>
          <span className="text-lg font-black block tracking-wider">ADE</span>
          <span className="text-[9px] text-white/70 block">عدن</span>
        </div>
        <div className="flex flex-col items-center flex-1 mx-2">
          <span className="text-[8px] text-indigo-250 font-bold mb-1">مباشر</span>
          <div className="w-full h-0.5 bg-white/20 relative">
            <Plane className="h-3.5 w-3.5 text-blue-400 absolute left-1/2 -translate-x-1/2 -top-1.5 transform rotate-90" />
          </div>
          <span className="text-[8px] text-white/50 mt-1">3 ساعات و 15 دقيقة</span>
        </div>
        <div className="text-left">
          <span className="text-lg font-black block tracking-wider">CAI</span>
          <span className="text-[9px] text-white/70 block">القاهرة</span>
        </div>
      </div>

      {/* QR Code mock */}
      <div className="relative z-10 flex items-center justify-between border-t border-white/10 pt-4">
        <div className="space-y-1">
          <span className="text-[8px] text-white/60 block">اسم الراكب</span>
          <span className="text-xs font-black block">Ahmed Mohamed</span>
        </div>
        <div className="bg-white p-1 rounded-xl shadow-lg border border-slate-100/10 flex items-center justify-center shrink-0">
          {/* Detailed Premium QR Code */}
          <div className="grid grid-cols-10 gap-[1px] w-12 h-12 bg-white p-[2px] rounded-lg select-none">
            {qrGrid.map((cell, idx) => (
              <div
                key={idx}
                className={`rounded-[0.5px] ${cell ? 'bg-slate-900' : 'bg-slate-100'}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  ]

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
              <span className="text-[#4974f9]">للإقلاع؟</span>
            </h1>
          </div>
        </div>
      </section>

      <div id="search-panel" className="relative z-30 -mt-40 pb-12 sm:-mt-80 sm:pb-16">
        <ScrollReveal animation="fade-up" duration={800} delay={100}>
          <div className="pt-4">
            <HeroSearchPanel />
          </div>
        </ScrollReveal>

        {/* الوجهات الأكثر طلباً */}
        <section id="popular-destinations" className="mx-auto mt-16 max-w-7xl px-4 sm:px-6 lg:px-8 relative" dir="rtl">
          <ScrollReveal animation="fade-down" duration={700}>
            <div className="text-center mb-16 relative flex flex-col items-center">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 px-4 py-1.5 text-[10px] font-black tracking-wider text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 uppercase mb-4 shadow-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
                الوجهات المفضلة
              </span>
              <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white sm:text-4xl md:text-5xl leading-tight">
                الوجهات <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">الأكثر طلباً</span>
              </h2>
              <div className="relative mt-4 mb-6 flex items-center justify-center w-32">
                <div className="absolute h-[2px] w-full bg-slate-200/60 dark:bg-slate-800" />
                <div className="absolute h-1 w-12 rounded-full bg-gradient-to-r from-blue-600 to-indigo-500 shadow-md shadow-blue-500/30" />
              </div>
              <p className="text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400 max-w-xl mx-auto leading-relaxed">
                اكتشف خيارات السفر المفضلة لعملائنا وخطط لرحلتك القادمة إلى أكثر المدن حيوية بأفضل الأسعار.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {popularDestinations.map((dest, index) => (
              <ScrollReveal
                key={dest.id}
                animation="fade-up"
                duration={700}
                delay={index * 100}
              >
                <div
                  onClick={() => handleDestinationSelect(dest.id)}
                  className="group relative h-[380px] overflow-hidden rounded-[2.5rem] bg-white border border-slate-100 dark:border-slate-800/80 shadow-[0_15px_45px_rgba(0,0,0,0.02)] hover:shadow-[0_30px_60px_rgba(73,116,249,0.12)] hover:-translate-y-1.5 transition-all duration-300 overflow-hidden cursor-pointer"
                >
                  {/* Image background with scale effect */}
                  <img
                    src={dest.image}
                    alt={dest.city}
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                  />

                  {/* Dark gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/40 to-transparent opacity-90 transition-opacity group-hover:opacity-95" />

                  {/* Card Glow Effect */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-[radial-gradient(circle_at_bottom,rgba(59,130,246,0.15)_0%,transparent_70%)]" />

                  {/* Top Tag */}
                  <div className="absolute left-6 top-6 z-10">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 backdrop-blur-md px-3 py-1 text-[10px] font-black text-white uppercase tracking-wider">
                      {dest.tag}
                    </span>
                  </div>

                  {/* Bottom Content Container */}
                  <div className="absolute inset-x-0 bottom-0 p-6 flex flex-col justify-end h-1/2 z-10 text-right">
                    <span className="text-[10px] font-bold text-blue-300 mb-1">{dest.country}</span>
                    <h3 className="text-2xl font-black text-white mb-1 group-hover:text-blue-200 transition-colors">
                      {dest.city}
                    </h3>
                    <p className="text-[10px] text-white/70 font-semibold mb-4 flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-blue-400 shrink-0" />
                      {dest.airport}
                    </p>

                    {/* Divider */}
                    <div className="h-px bg-white/10 my-3 transition-all duration-500 group-hover:bg-white/20" />

                    {/* Price and Action Button */}
                    <div className="flex items-center justify-between mt-1">
                      <div className="flex flex-col text-right">
                        <span className="text-[9px] font-bold text-white/50">تبدأ من</span>
                        <div className="flex items-baseline gap-0.5">
                          <span className="text-xl font-black text-white tabular-nums">${dest.price}</span>
                        </div>
                      </div>

                      <button
                        onClick={(e) => handleBookNow(e, dest.id)}
                        className="relative overflow-hidden rounded-xl bg-blue-600 hover:bg-blue-500 px-4 py-2.5 text-xs font-black text-white shadow-lg shadow-blue-600/20 transition-all duration-300 hover:-translate-y-0.5 active:scale-95 group/btn"
                      >
                        <span className="relative z-10">احجز الآن</span>
                        <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-1000" />
                      </button>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </section>

        {/* Services Bento Grid Section */}
        <section id="services" className="mx-auto mt-20 max-w-7xl px-4 sm:px-6 lg:px-8 relative" dir="rtl">
          <ScrollReveal animation="fade-down" duration={700}>
            <div className="text-center mb-16 relative flex flex-col items-center">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 px-4 py-1.5 text-[10px] font-black tracking-wider text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 uppercase mb-4 shadow-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
                خدمات المنصة
              </span>
              <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white sm:text-4xl md:text-5xl leading-tight">
                خدماتنا الرقمية <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">المتكاملة</span>
              </h2>
              <div className="relative mt-4 mb-6 flex items-center justify-center w-32">
                <div className="absolute h-[2px] w-full bg-slate-200/60 dark:bg-slate-800" />
                <div className="absolute h-1 w-12 rounded-full bg-gradient-to-r from-blue-600 to-indigo-500 shadow-md shadow-blue-500/30" />
              </div>
              <p className="text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400 max-w-xl mx-auto leading-relaxed">
                نوفر لك باقة شاملة من الخدمات السياحية الرقمية لنجعل تجربة سفرك سهلة وخالية من المتاعب.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {servicesList.map((service, index) => {
              const Icon = service.icon;
              const isFeatured = index === 0 || index === 5;
              return (
                <ScrollReveal
                  key={index}
                  animation="scale-up"
                  duration={700}
                  delay={index * 80}
                  className={isFeatured ? 'lg:col-span-2' : 'lg:col-span-1'}
                >
                  <div
                    className="group relative h-full rounded-[2.5rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 p-8 shadow-[0_15px_45px_rgba(0,0,0,0.02)] hover:shadow-[0_30px_60px_rgba(73,116,249,0.06)] hover:-translate-y-1.5 transition-all duration-300 overflow-hidden flex flex-col justify-between"
                  >
                    {/* Color Glow Indicator behind card */}
                    <div
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                      style={{
                        background: `radial-gradient(circle 140px at 50% 100%, ${service.glowColor}, transparent 80%)`
                      }}
                    />

                    <div>
                      {/* Top Header of Card */}
                      <div className="flex justify-between items-start mb-6">
                        <div className={`p-4 rounded-2xl bg-gradient-to-br ${service.gradient} text-white shadow-md`}>
                          <Icon className="h-6 w-6" />
                        </div>
                        {service.badge && (
                          <span className="text-[10px] font-black tracking-wider uppercase bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 px-3 py-1 rounded-full">
                            {service.badge}
                          </span>
                        )}
                      </div>

                      {/* Title and Description */}
                      <h3 className="text-xl font-black text-slate-800 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {service.title}
                      </h3>
                      <p className="text-xs leading-relaxed font-semibold text-slate-450 dark:text-slate-500 mb-6 max-w-xl">
                        {service.description}
                      </p>
                    </div>

                    {/* Features List and Interactive Mockups (Split-view for featured cards) */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-t border-slate-50 dark:border-slate-800/60 pt-6">
                      <ul className="space-y-2.5">
                        {service.features.map((feat, idx) => (
                          <li key={idx} className="flex items-center gap-2.5 text-[11px] font-bold text-slate-650 dark:text-slate-300">
                            <Check className="h-4.5 w-4.5 text-blue-500 shrink-0" />
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>

                      {/* Mockup for Flight Service */}
                      {isFeatured && service.title === 'حجز وإصدار التذاكر الرقمية' && (
                        <div className="hidden md:flex flex-col bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-5 text-white w-64 shrink-0 shadow-lg relative overflow-hidden group/pass translate-y-2">
                          <div className="absolute right-0 top-0 h-16 w-16 bg-white/5 rounded-full blur-xl" />
                          <div className="flex justify-between items-center text-[9px] font-bold mb-4">
                            <span>طيران السعيدة</span>
                            <span className="bg-white/20 px-2 py-0.5 rounded-md">مؤكد</span>
                          </div>
                          <div className="flex justify-between items-center mb-4">
                            <div>
                              <span className="text-xs font-black block">ADE</span>
                              <span className="text-[8px] opacity-75">عدن</span>
                            </div>
                            <div className="flex-1 flex flex-col items-center mx-4">
                              <span className="text-[7px] text-blue-200/80 font-bold mb-0.5">مباشر</span>
                              <div className="w-full h-0.5 relative flex items-center justify-center">
                                <div className="w-full h-[1px] bg-white/20 border-t border-dashed border-white/40" />
                                <div className="absolute left-0 h-1 w-1 rounded-full bg-white/60" />
                                <div className="absolute right-0 h-1 w-1 rounded-full bg-white/60" />
                              </div>
                              <span className="text-[6px] text-white/50 mt-0.5">3 س 15 د</span>
                            </div>
                            <div className="text-left">
                              <span className="text-xs font-black block">CAI</span>
                              <span className="text-[8px] opacity-75">القاهرة</span>
                            </div>
                          </div>
                          <div className="border-t border-white/10 pt-3 flex justify-between items-center">
                            <span className="text-[8px] opacity-70">رقم البوابة 04</span>
                            <div className="bg-white p-0.5 rounded flex items-center justify-center shrink-0">
                              <div className="grid grid-cols-6 gap-[0.5px] w-6 h-6 bg-white p-[0.5px] rounded select-none">
                                {qrGridMini.map((cell, idx) => (
                                  <div
                                    key={idx}
                                    className={`rounded-[0.25px] ${cell ? 'bg-slate-900' : 'bg-slate-150'}`}
                                  />
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Mockup for Support Service */}
                      {isFeatured && service.title === 'دعم وحل مشكلات الحجوزات 24/7' && (
                        <div className="hidden md:flex flex-col bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-3xl p-4 w-64 shrink-0 shadow-sm translate-y-2">
                          <div className="flex items-center gap-2.5 mb-3">
                            <div className="h-7 w-7 rounded-full bg-blue-500 flex items-center justify-center text-[10px] text-white font-black">م</div>
                            <div>
                              <span className="text-[9px] font-black text-slate-800 dark:text-white block">مستشار الدعم</span>
                              <span className="text-[7px] text-emerald-500 font-bold block">نشط الآن</span>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="bg-blue-600 text-white rounded-2xl rounded-tr-sm p-2 text-[9px] font-semibold text-right max-w-[85%] mr-auto">
                              مرحباً بك! كيف يمكنني مساعدتك في حجزك اليوم؟
                            </div>
                            <div className="bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-300 rounded-2xl rounded-tl-sm p-2 text-[9px] font-semibold text-right max-w-[70%] ml-auto">
                              أود الاستفسار عن تعديل موعد الرحلة.
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </ScrollReveal>
              );
            })}
          </div>
        </section>

        {/* Interactive Split-Screen 'Flight Journey' Section */}
        <section id="how-it-works" className="mx-auto mt-20 max-w-7xl px-4 sm:px-6 lg:px-8 relative" dir="rtl">
          <ScrollReveal animation="fade-down" duration={700}>
            <div className="relative mb-20 text-center flex flex-col items-center">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 px-4 py-1.5 text-[10px] font-black tracking-wider text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 uppercase mb-4 shadow-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
                كيفية الحجز
              </span>
              <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white sm:text-4xl md:text-5xl leading-tight">
                خطوات بسيطة <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">تفصلك عن وجهتك</span>
              </h2>
              <div className="relative mt-4 mb-6 flex items-center justify-center w-32">
                <div className="absolute h-[2px] w-full bg-slate-200/60 dark:bg-slate-800" />
                <div className="absolute h-1 w-12 rounded-full bg-gradient-to-r from-blue-600 to-indigo-500 shadow-md shadow-blue-500/30" />
              </div>
              <p className="text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400 max-w-xl mx-auto leading-relaxed">
                تصفح التفاعلية الحية لتتعرف على تجربة الحجز خطوة بخطوة وتأكيد تذكرتك في ثوانٍ معدودة.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid gap-8 lg:grid-cols-12 items-center">
            {/* Steps Left Interactive Showcase (5 Columns) */}
            <ScrollReveal
              animation="fade-right"
              duration={850}
              className="lg:col-span-5 flex justify-center items-center relative min-h-[380px] order-last lg:order-first"
            >
              {/* Radial glow tailored to step color */}
              <div
                className="absolute inset-0 rounded-[3rem] blur-3xl opacity-15 pointer-events-none transition-all duration-500 scale-90"
                style={{
                  background: `radial-gradient(circle, ${steps[activeStep].glowColor} 0%, transparent 70%)`
                }}
              />

              {/* Frameless glass envelope for the mockup */}
              <div className="relative w-full max-w-sm rounded-[3rem] bg-white/20 dark:bg-slate-900/30 backdrop-blur-xl border border-white/40 dark:border-slate-800/40 p-8 shadow-2xl transition-all duration-500">
                {stepMockups[activeStep]}
              </div>
            </ScrollReveal>

            {/* Steps List Right Panel (7 Columns) */}
            <div className="lg:col-span-7 space-y-4">
              {steps.map((step, index) => {
                const Icon = step.icon;
                const isActive = activeStep === index;
                return (
                  <ScrollReveal
                    key={index}
                    animation="fade-left"
                    duration={600}
                    delay={index * 100}
                  >
                    <div
                      onMouseEnter={() => setActiveStep(index)}
                      onClick={() => setActiveStep(index)}
                      className={`w-full flex items-start text-right gap-5 p-6 rounded-[2rem] border transition-all duration-500 cursor-pointer ${isActive
                        ? 'bg-white dark:bg-slate-900 border-blue-500/30 dark:border-blue-500/20 shadow-[0_20px_50px_rgba(73,116,249,0.06)] scale-[1.01]'
                        : 'bg-white/40 dark:bg-slate-950/20 border-slate-100 dark:border-slate-900/50 hover:bg-white/60 dark:hover:bg-slate-900/40'
                        }`}
                    >
                      {/* Step Icon Container */}
                      <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr ${isActive ? 'from-blue-600 to-indigo-650 text-white' : 'from-slate-100 to-slate-200 text-slate-500 dark:from-slate-800 dark:to-slate-900 dark:text-slate-400'
                        } shadow-sm transition-all duration-500`}>
                        <Icon className="h-6 w-6" />
                      </div>

                      {/* Text details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className={`text-lg font-black transition-colors ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-800 dark:text-slate-350'
                            }`}>
                            {step.title}
                          </h3>
                          <span className={`text-[10px] font-black tracking-wider uppercase px-2.5 py-0.5 rounded-full transition-colors ${isActive ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-455' : 'bg-slate-100 dark:bg-slate-850 text-slate-400 dark:text-slate-500'
                            }`}>
                            الخطوة 0{index + 1}
                          </span>
                        </div>
                        <p className={`text-xs leading-relaxed font-semibold transition-colors ${isActive ? 'text-slate-550 dark:text-slate-300' : 'text-slate-400 dark:text-slate-500'
                          }`}>
                          {step.description}
                        </p>
                      </div>
                    </div>
                  </ScrollReveal>
                );
              })}
            </div>
          </div>
        </section>

        {/* Modernized FAQ Section */}
        <section id="faq" className="mx-auto mt-20 max-w-4xl px-4 pb-20 sm:px-6 lg:px-8" dir="rtl">
          <ScrollReveal animation="fade-down" duration={700}>
            <div className="relative mb-24 text-center flex flex-col items-center">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 px-4 py-1.5 text-[10px] font-black tracking-wider text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 uppercase mb-4 shadow-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
                الأسئلة الشائعة
              </span>
              <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white sm:text-4xl md:text-5xl leading-tight">
                لديك استفسار؟ <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">نحن هنا للإجابة</span>
              </h2>
              <div className="relative mt-4 mb-6 flex items-center justify-center w-32">
                <div className="absolute h-[2px] w-full bg-slate-200/60 dark:bg-slate-800" />
                <div className="absolute h-1 w-12 rounded-full bg-gradient-to-r from-blue-600 to-indigo-500 shadow-md shadow-blue-500/30" />
              </div>
              <p className="text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400 max-w-xl mx-auto leading-relaxed">
                إليك كل ما تحتاج معرفته حول إجراءات الحجز، الأمتعة، والسياسات العامة.
              </p>
            </div>
          </ScrollReveal>

          <div className="space-y-4 relative z-10">
            {faqItems.map((item, index) => {
              const isOpen = openFaq === index;
              return (
                <ScrollReveal
                  key={index}
                  animation="fade-up"
                  duration={600}
                  delay={index * 80}
                >
                  <div
                    className={`group overflow-hidden rounded-[2rem] border transition-all duration-300 bg-white dark:bg-slate-900 ${isOpen
                      ? 'border-blue-500/30 dark:border-blue-500/20 shadow-[0_20px_50px_rgba(73,116,249,0.04)]'
                      : 'border-slate-100 dark:border-slate-800/80 hover:border-slate-350 dark:hover:border-slate-700 shadow-sm'
                      }`}
                  >
                    {/* Question Summary (Trigger) */}
                    <button
                      onClick={() => setOpenFaq(isOpen ? null : index)}
                      className="w-full flex items-center justify-between gap-4 p-6 text-right text-base font-black text-slate-800 dark:text-white focus:outline-none"
                    >
                      <div className="flex items-center gap-4">
                        <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-xs font-black transition-colors ${isOpen
                          ? 'bg-blue-600 text-white'
                          : 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400'
                          }`}>
                          0{index + 1}
                        </span>
                        <span className={`transition-colors ${isOpen ? 'text-blue-600 dark:text-blue-400' : 'text-slate-800 dark:text-slate-200'}`}>{item.q}</span>
                      </div>

                      {/* Plus/Minus Animated Icon */}
                      <div className="relative h-5 w-5 shrink-0 flex items-center justify-center">
                        <div className={`absolute h-0.5 w-4 bg-slate-450 transition-transform duration-300 ${isOpen ? 'rotate-180 bg-blue-500' : ''}`} />
                        <div className={`absolute h-4 w-0.5 bg-slate-455 transition-transform duration-300 ${isOpen ? 'rotate-90 scale-0 bg-blue-500' : ''}`} />
                      </div>
                    </button>

                    {/* Answer Body (Smooth Height Transition) */}
                    <div className={`grid transition-all duration-300 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                      <div className="overflow-hidden">
                        <div className="border-t border-slate-50 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/30 p-8">
                          <p className="text-xs sm:text-sm leading-relaxed font-semibold text-slate-500 dark:text-slate-400">
                            {item.a}
                          </p>

                          {/* Feedback Buttons */}
                          <div className="mt-6 flex items-center gap-3">
                            <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">هل كان هذا مفيداً؟</span>
                            <button className="rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-1 text-[10px] font-black text-slate-650 dark:text-slate-350 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 hover:text-emerald-600 dark:hover:text-emerald-450 hover:border-emerald-250 dark:hover:border-emerald-900 transition-colors">نعم</button>
                            <button className="rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-1 text-[10px] font-black text-slate-650 dark:text-slate-350 hover:bg-blue-50 dark:hover:bg-blue-950/20 hover:text-blue-600 dark:hover:text-blue-455 hover:border-blue-250 dark:hover:border-blue-900 transition-colors">لا</button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </ScrollReveal>
              );
            })}
          </div>
        </section>
      </div>

    </main>
  )
}

export default HomePage
