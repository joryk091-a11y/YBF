import React from 'react'
import { FileText, Shield, Info, CheckCircle2, UserCheck, CreditCard, RefreshCw, PlaneTakeoff, Headphones } from 'lucide-react'

function TermsPage() {
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

  return (
    <main className="min-h-[100svh] bg-[#f8f9fc] pb-24 pt-28 sm:pt-36" dir="rtl">
      <div className="mx-auto max-w-[950px] px-4 sm:px-6 lg:px-8">
        
        {/* Professional Travel Header */}
        <div className="mb-14 border-b border-slate-200 pb-10 text-center md:text-right">
          <div className="flex items-center justify-center md:justify-start gap-3 text-slate-850 mb-4">
            <FileText className="h-6 w-6 text-brand-blue" />
            <span className="text-xs font-black uppercase tracking-widest text-brand-blue">شروط الخدمة</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 sm:text-5xl">شروط الخدمة وسياسات الحجز</h1>
          <p className="mt-4 text-sm font-semibold text-slate-500 max-w-3xl leading-relaxed mx-auto md:mx-0">
            مرحباً بكم في منصة حجز رحلات اليمن. توضح هذه الصفحة السياسات المعتمدة لتسهيل عملية حجز التذاكر وإصدارها، لضمان تجربة سفر سلسة وآمنة لجميع مسافرينا.
          </p>
        </div>

        {/* Structured Centered Layout */}
        <div className="max-w-4xl mx-auto space-y-6">
          
          {/* Document Info Box */}
          <div className="flex items-start gap-4 rounded-[24px] bg-blue-500/5 border border-brand-blue/10 p-5 text-brand-blue">
            <Info className="h-5 w-5 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-xs font-black mb-1">توجيهات هامة لرحلتك</h3>
              <p className="text-[11px] font-bold leading-6 text-slate-600">
                نهدف من خلال هذه السياسات إلى إيضاح حقوق والتزامات المسافر. يرجى التأكد من استيفاء شروط وثائق السفر وصلاحيتها قبل تأكيد الحجز والدفع.
              </p>
            </div>
          </div>

          {/* Unified Policies Card Container */}
          <div className="bg-white rounded-[24px] border border-slate-200/60 p-6 sm:p-10 shadow-sm divide-y divide-slate-100">
            {policies.map((pol) => {
              const PolIcon = pol.icon
              return (
                <section 
                  key={pol.id} 
                  id={pol.id} 
                  className="py-8 first:pt-0 last:pb-0 scroll-mt-44"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-blue/10 text-brand-blue">
                      <PolIcon size={16} />
                    </div>
                    <h2 className="text-lg font-black text-slate-900">{pol.title}</h2>
                  </div>
                  <p className="text-xs font-semibold leading-8 text-slate-600 text-justify whitespace-pre-line">
                    {pol.content}
                  </p>
                </section>
              )
            })}
          </div>

        </div>

      </div>
    </main>
  )
}

export default TermsPage
