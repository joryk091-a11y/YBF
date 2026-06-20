import React, { useState } from 'react'
import { FileText, Shield, Info, CheckCircle2, ChevronLeft, Calendar, UserCheck, CreditCard, RefreshCw, PlaneTakeoff, Headphones } from 'lucide-react'

function TermsPage() {
  const [activeSection, setActiveSection] = useState(0)

  const policies = [
    {
      id: 'pol1',
      icon: Shield,
      label: 'الاستخدام العام للمنصة',
      title: 'قواعد الاستخدام العام لخدمات المنصة',
      content: `تحدد هذه الوثيقة الإرشادات العامة لاستخدام بوابة "حجز رحلات اليمن" (YBF) لتصفح رحلات الطيران وحجز التذاكر. يعد تصفحك للموقع أو إتمام أي عملية حجز إقراراً بالالتزام بشروط الخدمة الموضحة وتعهداً باستخدام المنصة لأغراض الحجز الشخصي أو التجاري المشروع فقط.`
    },
    {
      id: 'pol2',
      icon: UserCheck,
      label: 'بيانات وجوازات المسافرين',
      title: 'مطابقة بيانات السفر للوثائق الرسمية',
      content: `يتحمل العميل المسؤولية الكاملة عن دقة البيانات الشخصية المدخلة عند الحجز. يجب أن يتطابق اسم المسافر تماماً مع تهجئة الاسم الواردة في جواز السفر ساري المفعول (والذي يجب ألا تقل صلاحيته عن 6 أشهر من تاريخ السفر). المنصة غير مسؤولة عن رفض صعود الركاب بسبب اختلاف البيانات.`
    },
    {
      id: 'pol3',
      icon: CreditCard,
      label: 'الدفع وتأكيد الحجوزات',
      title: 'سياسة الدفع الإلكتروني وتأكيد الحجز',
      content: `تظهر أسعار التذاكر شاملة للرسوم الأساسية والضرائب الحكومية المطبقة. يتم تأكيد المقاعد وإصدار التذكرة الإلكترونية فور التحقق من إتمام عملية الدفع بنجاح عبر قنوات السداد المتوفرة. قد تختلف الأسعار وتوافر المقاعد حتى يتم الدفع الفعلي للحجز.`
    },
    {
      id: 'pol4',
      icon: RefreshCw,
      label: 'التعديل والاسترجاع',
      title: 'سياسة تعديل التواريخ وإلغاء التذاكر',
      content: `تخضع جميع شروط الاسترجاع وتعديل مواعيد الرحلات لسياسات شركة الطيران الناقلة (مثل اليمنية، بلقيس، وغيرها) ونوع التذكرة المحجوزة. عند طلب الإلغاء، تقوم المنصة بتطبيق شروط شركة الطيران واحتساب الرسوم المقررة قبل إعادة المبالغ المستحقة للعميل.`
    },
    {
      id: 'pol5',
      icon: PlaneTakeoff,
      label: 'الأمتعة ومواعيد الإقلاع',
      title: 'الالتزام بجداول الرحلات والأوزان المسموحة',
      content: `تلتزم شركات الطيران الناقلة بالأوزان المحددة لكل تذكرة، ويجب على المسافر دفع رسوم إضافية للوزن الزائد مباشرة في المطار. كما يُنصح المسافرون بالتواجد في المطار قبل 3 ساعات من موعد الإقلاع المحدد، حيث تخلي المنصة مسؤوليتها عن أي تأخير ناجم عن تخلف الراكب.`
    },
    {
      id: 'pol6',
      icon: Headphones,
      label: 'الدعم ومعالجة الشكاوى',
      title: 'دعم العملاء وحل إشكالات السفر',
      content: `فريق دعم العملاء في منصة YBF متواجد لمساعدتكم وتسهيل تواصلكم مع شركات الطيران. في حال إلغاء الرحلة أو تأجيلها من قبل الناقل الجوي بسبب ظروف الطيران أو القوة القاهرة، سنعمل جاهدين لتوفير البدائل المتاحة أو معالجة طلبات التعويض وفق قواعد الناقل المعتمدة.`
    }
  ]

  const scrollToSection = (index) => {
    setActiveSection(index)
    const element = document.getElementById(policies[index].id)
    if (element) {
      const offset = 140
      const bodyRect = document.body.getBoundingClientRect().top
      const elementRect = element.getBoundingClientRect().top
      const elementPosition = elementRect - bodyRect
      const offsetPosition = elementPosition - offset

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      })
    }
  }

  return (
    <main className="min-h-[100svh] bg-[#f8f9fc] pb-24 pt-28 sm:pt-36" dir="rtl">
      <div className="mx-auto max-w-[1300px] px-4 sm:px-6 lg:px-8">
        
        {/* Professional Travel Header */}
        <div className="mb-14 border-b border-slate-200 pb-10">
          <div className="flex items-center gap-3 text-[#1e293b] mb-4">
            <FileText className="h-6 w-6 text-[#4974f9]" />
            <span className="text-xs font-black uppercase tracking-widest text-[#4974f9]">شروط الخدمة</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-[#0f172a] sm:text-5xl">شروط الخدمة وسياسات الحجز</h1>
          <p className="mt-4 text-sm font-semibold text-slate-500 max-w-3xl leading-relaxed">
            مرحباً بكم في منصة حجز رحلات اليمن. توضح هذه الصفحة السياسات المعتمدة لتسهيل عملية حجز التذاكر وإصدارها، لضمان تجربة سفر سلسة وآمنة لجميع مسافرينا.
          </p>
        </div>

        {/* Structured Two-Column Layout */}
        <div className="grid gap-10 lg:grid-cols-[320px_1fr]">
          
          {/* Policy Document Sidebar Outline */}
          <aside className="sticky top-40 hidden h-fit rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm lg:block">
            <h2 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-6 flex items-center gap-2">
              <Info size={14} className="text-slate-400" />
              أقسام سياسة السفر
            </h2>
            <nav className="space-y-1">
              {policies.map((pol, idx) => (
                <button
                  key={pol.id}
                  onClick={() => scrollToSection(idx)}
                  className={`w-full text-right flex items-center justify-between rounded-xl px-4 py-3 text-xs font-black transition-all ${
                    activeSection === idx
                      ? 'bg-[#4974f9]/5 text-[#4974f9] border-r-4 border-[#4974f9]'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <span>{pol.label}</span>
                  <ChevronLeft size={14} className={`opacity-40 transition-transform ${activeSection === idx ? 'translate-x-1' : ''}`} />
                </button>
              ))}
            </nav>
          </aside>

          {/* Policy Content Body */}
          <div className="space-y-6">
            <div className="rounded-[24px] border border-slate-200 bg-white p-6 sm:p-10 shadow-sm">
              
              {/* Document Info Box */}
              <div className="mb-10 flex items-start gap-4 rounded-2xl bg-blue-500/5 border border-[#4974f9]/10 p-5 text-[#4974f9]">
                <Info className="h-5 w-5 shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-xs font-black mb-1">توجيهات هامة لرحلتك</h3>
                  <p className="text-[11px] font-bold leading-6 text-slate-600">
                    نهدف من خلال هذه السياسات إلى إيضاح حقوق والتزامات المسافر. يرجى التأكد من استيفاء شروط وثائق السفر وصلاحيتها قبل تأكيد الحجز والدفع.
                  </p>
                </div>
              </div>

              {/* Policies Content */}
              <div className="divide-y divide-slate-100">
                {policies.map((pol, idx) => {
                  const PolIcon = pol.icon
                  return (
                    <section 
                      key={pol.id} 
                      id={pol.id} 
                      className="py-8 first:pt-0 last:pb-0 scroll-mt-44"
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#4974f9]/10 text-[#4974f9]">
                          <PolIcon size={16} />
                        </div>
                        <h2 className="text-lg font-black text-slate-900">{pol.title}</h2>
                      </div>
                      <p className="text-xs font-semibold leading-8 text-slate-600 text-justify">
                        {pol.content}
                      </p>
                    </section>
                  )
                })}
              </div>
            </div>

            {/* Official Signature Section */}
            <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4 text-right">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#4974f9]/10 text-[#4974f9]">
                  <Shield size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-900">سياسات حجز معتمدة</h4>
                  <p className="text-[11px] font-bold text-slate-400 mt-1">تخضع هذه اللائحة للتحديثات الدورية لعام 2026 م</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs font-black text-emerald-600 bg-emerald-50 px-4 py-2 rounded-full border border-emerald-100 shrink-0">
                <CheckCircle2 size={16} />
                سياسات معتمدة ومتوافقة
              </div>
            </div>

          </div>

        </div>

      </div>
    </main>
  )
}

export default TermsPage
