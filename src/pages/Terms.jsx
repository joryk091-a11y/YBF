import React from 'react'
import { FileText, Shield, Info, CheckCircle2, UserCheck, CreditCard, RefreshCw, PlaneTakeoff, HelpCircle } from 'lucide-react'

function TermsPage() {
  const policies = [
    {
      id: 'pol1',
      icon: Info,
      label: 'التعريفات',
      title: '1. التعريفات',
      content: `• المنصة (YBF): نظام حجز الرحلات الجوية الإلكتروني وخدماته المرتبطة.
• المستخدم: أي فرد يقوم بالدخول للموقع أو إجراء عملية حجز.
• الناقل الجوي: شركة الطيران المسؤولة فعلياً عن تشغيل الرحلة.`
    },
    {
      id: 'pol2',
      icon: UserCheck,
      label: 'التسجيل والحسابات',
      title: '2. التسجيل والحسابات',
      content: `2.1. يتعهد المستخدم بتقديم بيانات صحيحة ودقيقة عند التسجيل.
2.2. المستخدم مسؤول عن حماية بيانات الوصول إلى حسابه (اسم المستخدم وكلمة المرور).
2.3. للمنصة الحق في إيقاف أو حذف أي حساب يتبين أنه يستخدم لأغراض احتيالية أو تخريبية.`
    },
    {
      id: 'pol3',
      icon: CreditCard,
      label: 'شروط الحجز والدفع',
      title: '3. شروط الحجز والدفع',
      content: `3.1. لا يعتبر الحجز نافذاً إلا بعد استلام تأكيد الحجز وإتمام الدفع بنجاح.
3.2. الأسعار المعروضة قد تتغير وفقاً لتوافر المقاعد وسياسات شركات الطيران.
3.3. العملات والضرائب: تظهر الأسعار شاملة الضرائب ما لم ينص على خلاف ذلك. يتحمل المستخدم أي رسوم إضافية تفرضها البنوك أو سلطات المطار المحلية.
3.4. في حال حدوث خطأ تقني في عرض الأسعار، تحتفظ المنصة بحق تصحيح السعر أو إلغاء الحجز المعني مع إعادة المبلغ للمستخدم.`
    },
    {
      id: 'pol4',
      icon: PlaneTakeoff,
      label: 'سياسات المسافرين (فئات خاصة)',
      title: '4. سياسات المسافرين (فئات خاصة)',
      content: `4.1. القاصرون: لا يُسمح للقاصرين بالسفر دون مرافق إلا وفقاً لسياسة "القاصر غير المصحوب" الخاصة بكل ناقل جوي.
4.2. الرضع: يقتصر حمل الرضع على واحد لكل مسافر بالغ، ويخضع ذلك لسياسات السلامة الدولية.
4.3. ذوو الإعاقة (PRM): يجب إخطار المنصة باحتياجات الحركة قبل 48 ساعة من موعد الرحلة لضمان التنسيق مع المطار. يتم تصنيف الحالات إلى (WCHR, WCHS, WCHC) لضمان توفير الخدمات اللوجستية المناسبة.`
    },
    {
      id: 'pol5',
      icon: Shield,
      label: 'الأمتعة والمواد المحظورة',
      title: '5. الأمتعة والمواد المحظورة',
      content: `5.1. المواد الخطرة: يُمنع منعاً باتاً حمل المتفجرات، المواد المشعة، السوائل القابلة للاشتعال، البطاريات غير المعتمدة، أو أي مواد تصنفها لوائح الطيران المدني الدولية كخطرة.
5.2. الأمتعة الثمينة: تنصح المنصة المسافرين بحمل النقد، المجوهرات، الأدوية، والوثائق الرسمية في حقائب المقصورة (حقيبة اليد) وليس ضمن الأمتعة المسجلة.
5.3. المسؤولية: في حالة فقدان أو تلف الأمتعة، تقع المسؤولية على الناقل الجوي، وتلتزم المنصة بالمساعدة في تقديم بلاغ الفقدان وفقاً لقوانين "اتفاقية مونتريال" المطبقة.`
    },
    {
      id: 'pol6',
      icon: HelpCircle,
      label: 'الحيوانات الأليفة',
      title: '6. الحيوانات الأليفة',
      content: `6.1. يخضع نقل الحيوانات لموافقة مسبقة وتوفر الشهادات الصحية والتطعيمات المطلوبة.
6.2. قد يتم رفض نقل الحيوانات لأسباب صحية أو تنظيمية، وتتحمل الشركة أي مسؤولية تجاه ذلك.`
    },
    {
      id: 'pol7',
      icon: RefreshCw,
      label: 'التغييرات والإلغاء',
      title: '7. التغييرات والإلغاء',
      content: `7.1. سياسة الاسترداد: تخضع لاسترداد الأموال لسياسة "Fare Rules" الخاصة بشركة الطيران.
7.2. إلغاء الرحلات: في حال إلغاء الرحلة من قبل الناقل، سيتم تقديم خيارات إعادة الحجز أو الاسترداد المالي وفقاً لما تحدده شركة الطيران.
7.3. تخصيص المقاعد: المقاعد المحجوزة غير مضمونة بنسبة 100% وقد يتم تغييرها لدواعٍ تشغيلية أو أمنية.`
    },
    {
      id: 'pol8',
      icon: Info,
      label: 'إخلاء المسؤولية',
      title: '8. إخلاء المسؤولية',
      content: `8.1. المنصة تعمل كوسيط تقني (Interface) ولا تضمن دقة معلومات شركات الطيران أو خلوها من الأخطاء البشرية.
8.2. لا تتحمل المنصة مسؤولية أي خسائر غير مباشرة ناتجة عن تأخير الرحلات أو فقدان الاتصال بالرحلات اللاحقة (تذاكر غير مترابطة).`
    },
    {
      id: 'pol9',
      icon: FileText,
      label: 'الملكية الفكرية',
      title: '9. الملكية الفكرية',
      content: `9.1. جميع العلامات التجارية، الرموز، والبرمجيات المستخدمة في YBF هي ملكية خاصة لمطوري المنصة.
9.2. يُحظر نسخ أو استغلال واجهة البرمجة (API) الخاصة بالموقع دون إذن خطي.`
    },
    {
      id: 'pol10',
      icon: CheckCircle2,
      label: 'القانون الواجب التطبيق والنزاعات',
      title: '10. القانون الواجب التطبيق والنزاعات',
      content: `10.1. تخضع هذه الشروط لقوانين الدولة المقر للمنصة.
10.2. في حال حدوث نزاع، يتم السعي لحله ودياً عبر البريد الإلكتروني، وفي حال فشل ذلك، يكون الاختصاص القضائي للمحاكم المحلية المختصة.`
    },
    {
      id: 'pol11',
      icon: RefreshCw,
      label: 'التعديلات',
      title: '11. التعديلات',
      content: `11.1. تحتفظ المنصة بالحق في تعديل هذه الشروط في أي وقت. يعتبر استمرارك في استخدام الموقع بعد التعديل موافقة ضمنية على الشروط الجديدة.`
    }
  ]

  return (
    <main className="min-h-[100svh] bg-[#f8f9fc] pb-24 pt-28 sm:pt-36" dir="rtl">
      <div className="mx-auto max-w-[950px] px-4 sm:px-6 lg:px-8">
        
        {/* Professional Travel Header */}
        <div className="mb-14 border-b border-slate-200 pb-10 text-center md:text-right">
          <div className="flex items-center justify-center md:justify-start gap-3 text-slate-850 mb-4">
            <FileText className="h-6 w-6 text-brand-blue" />
            <span className="text-xs font-black uppercase tracking-widest text-brand-blue">اتفاقية الاستخدام</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 sm:text-5xl">اتفاقية الشروط والأحكام العامة لمنصة YBF</h1>
          <p className="mt-4 text-sm font-semibold text-slate-500 max-w-3xl leading-relaxed mx-auto md:mx-0">
            تاريخ آخر تحديث: 10 يوليو 2026
          </p>
        </div>

        {/* Structured Centered Layout */}
        <div className="max-w-4xl mx-auto space-y-6">
          
          {/* Document Info Box */}
          <div className="flex items-start gap-4 rounded-[24px] bg-blue-500/5 border border-brand-blue/10 p-5 text-brand-blue">
            <Info className="h-5 w-5 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-xs font-black mb-1">اتفاقية ملزمة قانونياً</h3>
              <p className="text-[11px] font-bold leading-6 text-slate-600">
                تُعد هذه الاتفاقية عقداً ملزماً قانونياً بينك (المستخدم/المسافر) وبين إدارة منصة YBF (المنصة). باستخدامك للموقع أو التطبيق، فإنك توافق على الامتثال لكافة البنود الواردة أدناه.
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
