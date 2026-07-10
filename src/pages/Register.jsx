import { useState, useEffect } from 'react'
import { Eye, EyeOff, FileText, Lock, Mail, User, UserPlus, X, CheckCircle2 } from 'lucide-react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import logo from '../assets/logo.png'

const strengthLevels = [
    { label: 'ضعيفة', color: 'bg-red-500', width: 'w-1/4' },
    { label: 'مقبولة', color: 'bg-amber-500', width: 'w-2/4' },
    { label: 'جيدة', color: 'bg-brand-blue', width: 'w-3/4' },
    { label: 'قوية', color: 'bg-emerald-555', width: 'w-full' },
]

const countries = [
    { code: '+967', flag: '🇾🇪', name: 'اليمن' },
    { code: '+966', flag: '🇸🇦', name: 'السعودية' },
    { code: '+971', flag: '🇦🇪', name: 'الإمارات' },
    { code: '+968', flag: '🇴🇲', name: 'عمان' },
    { code: '+965', flag: '🇰🇼', name: 'الكويت' },
    { code: '+974', flag: '🇶🇦', name: 'قطر' },
    { code: '+20', flag: '🇪🇬', name: 'مصر' },
]

function getStrength(password) {
    let score = 0
    if (password.length >= 8) score++
    if (/[A-Z]/.test(password)) score++
    if (/[0-9]/.test(password)) score++
    if (/[^A-Za-z0-9]/.test(password)) score++
    return score
}

function RegisterPage() {
    const navigate = useNavigate()
    const location = useLocation()
    const [mounted, setMounted] = useState(false)
    
    useEffect(() => {
        setMounted(true)
    }, [])
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [isTermsOpen, setIsTermsOpen] = useState(false)
    const [password, setPassword] = useState('')
    const [fullName, setFullName] = useState('')
    const [email, setEmail] = useState('')
    const [phone, setPhone] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [countryCode, setCountryCode] = useState('+967')
    const [agreed, setAgreed] = useState(false)
    const [focused, setFocused] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const strength = getStrength(password)
    const strengthInfo = strengthLevels[Math.max(0, strength - 1)]

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')

        if (password !== confirmPassword) {
            setError('كلمات المرور غير متطابقة')
            return
        }



        setLoading(true)
        try {
            const response = await fetch('http://localhost:8080/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    fullName,
                    email,
                    phone: `${countryCode}${phone}`,
                    password
                })
            })

            const data = await response.json()
            if (data.success) {
                
                const userInfo = {
                    id: data.userId,
                    fullName,
                    email
                }
                localStorage.setItem('user', JSON.stringify(userInfo))

                alert('تم إنشاء الحساب بنجاح!')

                const from = location.state?.from || '/'
                navigate(from, { state: location.state })
            } else {
                setError(data.error || 'حدث خطأ أثناء إنشاء الحساب')
            }
        } catch (err) {
            setError('تعذر الاتصال بالخادم')
        } finally {
            setLoading(false)
        }
    }

    return (
        <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-blue-100 to-blue-200 px-4 py-8 pt-24 sm:pt-36 md:pt-40 relative overflow-hidden" dir="rtl">
            {}
            <div className="absolute inset-0 pointer-events-none opacity-70 z-0">
                <div className="absolute -top-20 -right-20 h-[600px] w-[600px] rounded-full bg-blue-350/40 blur-[120px]" />
                <div className="absolute -bottom-20 -left-20 h-[600px] w-[600px] rounded-full bg-indigo-300/30 blur-[120px]" />
            </div>

            {}
            <div className="relative z-10 w-full max-w-6xl flex flex-col lg:grid gap-8 lg:grid-cols-[0.7fr_1.3fr] items-center">
                
                {}
                <div className={`hidden lg:flex flex-col text-right text-slate-800 space-y-6 pr-0 lg:pl-12 self-start pt-10 transition-all duration-1000 delay-100 ease-out transform ${mounted ? 'translate-x-0 opacity-100' : 'translate-x-12 opacity-0'}`}>
                    <h2 className="text-5xl lg:text-6xl font-black leading-[1.2] bg-gradient-to-b from-brand-blue to-[#13287a] bg-clip-text text-transparent tracking-tight">
                        <span className="whitespace-nowrap">اكتشف طريقة</span> <br />
                        <span className="whitespace-nowrap">أسرع وأسهل</span> <br />
                        <span className="whitespace-nowrap">لحجز رحلاتك</span>
                    </h2>
                    <p className="text-base lg:text-lg font-bold text-slate-550 leading-relaxed max-w-md">
                        انضم إلينا الآن واستمتع بتجربة سفر رقمية متكاملة. <br />
                        نحن نتيح لك تخطيط رحلاتك، إدارة حجوزاتك، <br />
                        والتواصل المباشر مع شركات الطيران المفضلة لديك.
                    </p>
                </div>

                {}
                <div className={`w-full max-w-[580px] mx-auto lg:mr-4 lg:ml-auto bg-white rounded-[2.5rem] border border-slate-200/50 p-6 sm:p-10 shadow-[0_20px_50px_rgba(15,23,42,0.08)] transition-all duration-1000 delay-300 ease-out transform ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}`}>
                {}
                <div className="flex flex-col items-center mb-8">
                    <div className="relative mb-4 flex items-center justify-center h-16 w-16">
                        <div className="absolute inset-0 rounded-full bg-brand-blue/20 blur-md animate-pulse" />
                        <img src={logo} alt="Logo" className="relative z-10 h-12 w-12 object-contain brightness-0" />
                    </div>
                    <h1 className="text-2xl font-black text-slate-900">إنشاء حساب جديد</h1>
                    <p className="mt-2 text-xs font-semibold text-slate-550 text-center leading-relaxed">
                        أدخل بياناتك لتبدأ رحلتك معنا.
                    </p>
                </div>

                <form className="space-y-5" onSubmit={handleSubmit}>
                    {error && (
                        <div className="rounded-2xl bg-red-50 p-4 border border-red-100 flex items-center gap-3 text-red-650 text-xs sm:text-sm font-bold animate-shake">
                            <X className="h-4 w-4 shrink-0" />
                            {error}
                        </div>
                    )}

                    {}
                    <div className="space-y-2">
                        <label className="block text-[11px] font-black uppercase tracking-widest text-slate-400">الاسم الكامل</label>
                        <div className={`relative flex items-center rounded-2xl border bg-slate-50/50 transition-all duration-200 ${focused === 'name' ? 'border-brand-blue bg-white shadow-[0_0_0_4px_rgba(73,116,249,0.08)]' : 'border-slate-200 hover:border-slate-300'}`}>
                            <User className="pointer-events-none absolute right-4 h-4 w-4 text-slate-400" />
                            <input
                                className="w-full bg-transparent py-4 pr-12 pl-4 text-sm sm:text-base font-bold text-slate-900 placeholder:text-slate-350 outline-none"
                                placeholder=""
                                required
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                onFocus={() => setFocused('name')}
                                onBlur={() => setFocused(null)}
                            />
                        </div>
                    </div>

                    {}
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <label className="block text-[11px] font-black uppercase tracking-widest text-slate-400">البريد الإلكتروني</label>
                            <div className={`relative flex items-center rounded-2xl border bg-slate-50/50 transition-all duration-200 ${focused === 'email' ? 'border-brand-blue bg-white shadow-[0_0_0_4px_rgba(73,116,249,0.08)]' : 'border-slate-200 hover:border-slate-300'}`}>
                                <Mail className="pointer-events-none absolute right-4 h-4 w-4 text-slate-400" />
                                <input
                                    type="email"
                                    className="w-full bg-transparent py-4 pr-12 pl-4 text-sm sm:text-base font-bold text-slate-900 placeholder:text-slate-350 outline-none"
                                    placeholder=""
                                    required
                                    dir="ltr"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    onFocus={() => setFocused('email')}
                                    onBlur={() => setFocused(null)}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="block text-[11px] font-black uppercase tracking-widest text-slate-400">رقم الهاتف</label>
                            <div className={`relative flex items-center rounded-2xl border bg-slate-50/50 transition-all duration-200 ${focused === 'phone' ? 'border-brand-blue bg-white shadow-[0_0_0_4px_rgba(73,116,249,0.08)]' : 'border-slate-200 hover:border-slate-300'}`} dir="ltr">
                                <div className="relative flex items-center pl-4">
                                    <select
                                        value={countryCode}
                                        onChange={(e) => setCountryCode(e.target.value)}
                                        className="appearance-none bg-transparent pr-6 pl-1 text-xs sm:text-sm font-black text-slate-700 outline-none cursor-pointer z-10"
                                    >
                                        {countries.map(c => (
                                            <option key={c.code} value={c.code}>{c.flag} {c.code}</option>
                                        ))}
                                    </select>
                                    <div className="pointer-events-none absolute right-0 h-4 w-[1px] bg-slate-200" />
                                </div>
                                <input
                                    type="tel"
                                    className="w-full bg-transparent py-4 pl-4 pr-4 text-sm sm:text-base font-bold text-slate-900 placeholder:text-slate-350 outline-none"
                                    placeholder=""
                                    required
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    onFocus={() => setFocused('phone')}
                                    onBlur={() => setFocused(null)}
                                />
                            </div>
                        </div>
                    </div>

                    {}
                    <div className="space-y-2">
                        <label className="block text-[11px] font-black uppercase tracking-widest text-slate-400">كلمة المرور</label>
                        <div className={`relative flex items-center rounded-2xl border bg-slate-50/50 transition-all duration-200 ${focused === 'pass' ? 'border-brand-blue bg-white shadow-[0_0_0_4px_rgba(73,116,249,0.08)]' : 'border-slate-200 hover:border-slate-300'}`}>
                            <Lock className="pointer-events-none absolute right-4 h-4 w-4 text-slate-400" />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                className="w-full bg-transparent py-4 pr-12 pl-14 text-sm sm:text-base font-bold text-slate-900 placeholder:text-slate-350 outline-none"
                                placeholder=""
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                onFocus={() => setFocused('pass')}
                                onBlur={() => setFocused(null)}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword((v) => !v)}
                                className="absolute left-3 flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                            >
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>

                        {}
                        {password.length > 0 && (
                            <div className="mt-2 space-y-1.5">
                                <div className="flex h-1.5 gap-1 overflow-hidden rounded-full bg-slate-100">
                                    {[1, 2, 3, 4].map((level) => (
                                        <div
                                            key={level}
                                            className={`flex-1 rounded-full transition-all duration-350 ${strength >= level ? strengthInfo?.color : 'bg-slate-200'}`}
                                        />
                                    ))}
                                </div>
                                <p className={`text-[10px] sm:text-[11px] font-black ${strengthInfo?.color?.replace('bg-', 'text-')}`}>
                                    قوة كلمة المرور: {strengthInfo?.label}
                                </p>
                            </div>
                        )}
                    </div>

                    {}
                    <div className="space-y-2">
                        <label className="block text-[11px] font-black uppercase tracking-widest text-slate-400">تأكيد كلمة المرور</label>
                        <div className={`relative flex items-center rounded-2xl border bg-slate-50/50 transition-all duration-200 ${focused === 'confirm' ? 'border-brand-blue bg-white shadow-[0_0_0_4px_rgba(73,116,249,0.08)]' : 'border-slate-200 hover:border-slate-300'}`}>
                            <Lock className="pointer-events-none absolute right-4 h-4 w-4 text-slate-400" />
                            <input
                                type={showConfirmPassword ? 'text' : 'password'}
                                className="w-full bg-transparent py-4 pr-12 pl-14 text-sm sm:text-base font-bold text-slate-900 placeholder:text-slate-350 outline-none"
                                placeholder=""
                                required
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                onFocus={() => setFocused('confirm')}
                                onBlur={() => setFocused(null)}
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword((v) => !v)}
                                className="absolute left-3 flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                            >
                                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                    </div>



                    {}
                    <button
                        type="submit"
                        disabled={loading}
                        className="group relative flex h-14 w-full items-center justify-center overflow-hidden rounded-2xl bg-brand-blue text-sm sm:text-base font-black text-white shadow-lg shadow-brand-blue/20 transition-all duration-300 hover:bg-brand-blue-hover active:scale-98 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
                    >
                        {loading ? (
                            <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                <UserPlus className="relative ml-2 h-5 w-5" />
                                <span className="relative">إنشاء حسابي الآن</span>
                            </>
                        )}
                    </button>

                    {}
                    <div className="flex items-center gap-4 py-1">
                        <div className="h-px flex-1 bg-slate-100" />
                        <span className="text-[11px] font-black text-slate-400">أو</span>
                        <div className="h-px flex-1 bg-slate-100" />
                    </div>

                    {}
                    <p className="text-center text-xs sm:text-sm font-bold text-slate-500">
                        لديك حساب بالفعل؟{' '}
                        <Link to="/login" state={location.state} className="font-black text-brand-blue transition hover:text-brand-blue-hover">
                            تسجيل الدخول
                        </Link>
                    </p>
                </form>
                </div>
            </div>

            {}
            {isTermsOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm" dir="rtl">
                    <div className="relative w-full max-w-lg overflow-hidden rounded-[32px] bg-white shadow-2xl">
                        {}
                        <div className="flex items-center justify-between border-b border-slate-100 bg-white px-6 py-5">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-blue/10">
                                    <FileText className="h-5 w-5 text-brand-blue" />
                                </div>
                                <h2 className="text-lg font-black text-slate-900">الشروط والأحكام</h2>
                            </div>
                            <button
                                onClick={() => setIsTermsOpen(false)}
                                className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-50 text-slate-400 transition hover:bg-slate-100 hover:text-slate-900"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {}
                        <div className="max-h-[55vh] overflow-y-auto px-6 py-6">
                            <div className="space-y-5 text-right">
                                {[
                                    { num: '1', title: 'قبول الشروط', body: 'باستخدامك لمنصة Yemen Booking Flight، فإنك توافق على الالتزام بكافة الشروط والأحكام المذكورة هنا. يرجى قراءتها بعناية قبل إتمام أي عملية حجز.' },
                                    { num: '2', title: 'سياسة الحجز', body: 'تخضع جميع الحجوزات لسياسات شركات الطيران المعنية. نحن نعمل كوسيط لتسهيل عملية الحجز، ولسنا مسؤولين عن أي تغييرات تطرأ على مواعيد الرحلات من قبل الشركات.' },
                                    { num: '3', title: 'سياسة الإلغاء والاسترداد', body: 'تعتمد شروط الإلغاء والاسترداد على فئة التذكرة المشتراة وسياسة شركة الطيران. قد يتم تطبيق رسوم إدارية في حال طلب الإلغاء أو التغيير.' },
                                    { num: '4', title: 'خصوصية البيانات', body: 'نحن ملتزمون بحماية بياناتك الشخصية وتشفيرها وفقاً لأعلى معايير الأمان العالمية. لن يتم مشاركة بياناتك مع أي طرف ثالث إلا لتنفيذ عملية الحجز.' },
                                ].map(({ num, title, body }) => (
                                    <div key={num} className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
                                        <h3 className="text-sm font-black text-slate-900">{num}. {title}</h3>
                                        <p className="mt-2 text-xs font-bold leading-7 text-slate-500">{body}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {}
                        <div className="border-t border-slate-100 bg-slate-50 px-6 py-4">
                            <button
                                onClick={() => { setAgreed(true); setIsTermsOpen(false) }}
                                className="flex h-12 w-full items-center justify-center rounded-2xl bg-brand-blue hover:bg-brand-blue-hover text-sm font-black text-white shadow-lg shadow-brand-blue/20 transition-all cursor-pointer"
                            >
                                <CheckCircle2 className="ml-2 h-4 w-4" />
                                لقد قرأت الشروط وأوافق عليها
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    )
}

export default RegisterPage
