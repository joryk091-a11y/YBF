import { useState } from 'react'
import { Eye, EyeOff, FileText, Lock, Mail, Phone, Shield, User, UserPlus, X, CheckCircle2, Plane } from 'lucide-react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import logo from '../assets/logo.png'


const features = [
    { icon: Plane, title: 'احجز رحلتك بسهولة', desc: 'اختر من بين مئات الرحلات الداخلية والدولية' },
    { icon: Shield, title: 'حجز آمن ومضمون', desc: 'جميع بياناتك محمية بتشفير SSL عالي المستوى' },
    { icon: CheckCircle2, title: 'تأكيد فوري', desc: 'احصل على تذكرتك فور إتمام عملية الحجز' },
]

const strengthLevels = [
    { label: 'ضعيفة', color: 'bg-red-500', width: 'w-1/4' },
    { label: 'مقبولة', color: 'bg-amber-500', width: 'w-2/4' },
    { label: 'جيدة', color: 'bg-blue-500', width: 'w-3/4' },
    { label: 'قوية', color: 'bg-emerald-500', width: 'w-full' },
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

        if (!agreed) {
            setError('يجب الموافقة على الشروط والأحكام')
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
                // Automatically log in the user after registration
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
        <main className="flex-1 flex flex-col lg:flex-row bg-white pt-20 lg:pt-0" dir="rtl">
            {/* ─── Left decorative panel ──────────────────────────────── */}
            <div className="relative hidden lg:flex lg:w-1/2 flex-col justify-between overflow-hidden bg-gradient-to-br from-[#0a1628] via-[#10203d] to-[#0f172a] p-12 text-white">
                {/* Animated blobs */}
                <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-[#4974f9]/20 blur-[80px] animate-pulse" />
                <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-[#d9312b]/15 blur-[80px] animate-pulse" style={{ animationDelay: '1s' }} />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-64 w-64 rounded-full bg-[#4974f9]/10 blur-[60px]" />

                {/* Grid overlay */}
                <div
                    className="absolute inset-0 opacity-[0.04]"
                    style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '24px 24px' }}
                />


                {/* Center content */}
                <div className="relative z-10 my-auto">
                    <h2 className="text-4xl font-black leading-tight xl:text-5xl">
                        سفرك يبدأ<br />
                        <span className="bg-gradient-to-l from-[#93b4ff] to-[#4974f9] bg-clip-text text-transparent">
                            من هنا
                        </span>
                    </h2>

                    {/* Feature list */}
                    <div className="mt-10 space-y-5">
                        {features.map(({ icon: Icon, title, desc }) => (
                            <div key={title} className="flex items-start gap-4">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white/5 border border-white/10">
                                    <Icon className="h-5 w-5 text-[#4974f9]" />
                                </div>
                                <div>
                                    <p className="text-sm font-black text-white">{title}</p>
                                    <p className="text-xs font-bold text-slate-500 mt-0.5">{desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>

            {/* ─── Right form panel ──────────────────────────────────── */}
            <div className="flex flex-1 flex-col justify-center px-6 pt-32 pb-16 sm:px-10 lg:px-16 xl:px-24">
                {/* Mobile logo */}
                <div className="mb-8 flex items-center gap-3 lg:hidden">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-50 border border-slate-200 shadow-sm p-2">
                        <img src={logo} alt="Logo" className="w-full h-full object-contain brightness-0" />
                    </div>
                </div>

                <div className="mx-auto w-full max-w-[580px]">
                    {/* Header */}
                    <div className="mb-8">
                        <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#4974f9] to-[#7c3aed] shadow-xl shadow-[#4974f9]/25 mb-5">
                            <UserPlus className="h-7 w-7 text-white" />
                        </div>
                        <h1 className="text-4xl font-black tracking-tight text-slate-900">إنشاء حساب جديد</h1>
                        <p className="mt-3 text-base font-bold text-slate-500">
                            أدخل بياناتك لتبدأ رحلتك معنا.
                        </p>
                    </div>

                    <form className="space-y-5" onSubmit={handleSubmit}>
                        {error && (
                            <div className="rounded-2xl bg-red-50 p-4 border border-red-100 flex items-center gap-3 text-red-600 text-sm font-bold animate-shake">
                                <X className="h-4 w-4" />
                                {error}
                            </div>
                        )}
                        {/* Full name */}
                        <div className="space-y-2">
                            <label className="block text-[11px] font-black uppercase tracking-widest text-slate-400">الاسم الكامل</label>
                            <div className={`relative flex items-center rounded-2xl border bg-slate-50/50 transition-all duration-200 ${focused === 'name' ? 'border-[#4974f9] bg-white shadow-[0_0_0_4px_rgba(73,116,249,0.08)]' : 'border-slate-200 hover:border-slate-300'}`}>
                                <User className="pointer-events-none absolute right-4 h-4 w-4 text-slate-400" />
                                <input
                                    className="w-full bg-transparent py-5 pr-12 pl-4 text-base font-bold text-slate-900 placeholder:text-slate-300 outline-none"
                                    placeholder="مثال: محمد أحمد علي"
                                    required
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    onFocus={() => setFocused('name')}
                                    onBlur={() => setFocused(null)}
                                />
                            </div>
                        </div>

                        {/* Email + Phone */}
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <label className="block text-[11px] font-black uppercase tracking-widest text-slate-400">البريد الإلكتروني</label>
                                <div className={`relative flex items-center rounded-2xl border bg-slate-50/50 transition-all duration-200 ${focused === 'email' ? 'border-[#4974f9] bg-white shadow-[0_0_0_4px_rgba(73,116,249,0.08)]' : 'border-slate-200 hover:border-slate-300'}`}>
                                    <Mail className="pointer-events-none absolute right-4 h-4 w-4 text-slate-400" />
                                    <input
                                        type="email"
                                        className="w-full bg-transparent py-5 pr-12 pl-4 text-base font-bold text-slate-900 placeholder:text-slate-300 outline-none"
                                        placeholder="example@email.com"
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
                                <div className={`relative flex items-center rounded-2xl border bg-slate-50/50 transition-all duration-200 ${focused === 'phone' ? 'border-[#4974f9] bg-white shadow-[0_0_0_4px_rgba(73,116,249,0.08)]' : 'border-slate-200 hover:border-slate-300'}`} dir="ltr">
                                    {/* Country Selector */}
                                    <div className="relative flex items-center pl-4">
                                        <select
                                            value={countryCode}
                                            onChange={(e) => setCountryCode(e.target.value)}
                                            className="appearance-none bg-transparent pr-6 pl-1 text-sm font-black text-slate-700 outline-none cursor-pointer z-10"
                                        >
                                            {countries.map(c => (
                                                <option key={c.code} value={c.code}>{c.flag} {c.code}</option>
                                            ))}
                                        </select>
                                        <div className="pointer-events-none absolute right-0 h-4 w-[1px] bg-slate-200" />
                                    </div>

                                    <input
                                        type="tel"
                                        className="w-full bg-transparent py-5 pl-4 pr-4 text-base font-bold text-slate-900 placeholder:text-slate-300 outline-none"
                                        placeholder="7XX XXX XXX"
                                        required
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        onFocus={() => setFocused('phone')}
                                        onBlur={() => setFocused(null)}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Password */}
                        <div className="space-y-2">
                            <label className="block text-[11px] font-black uppercase tracking-widest text-slate-400">كلمة المرور</label>
                            <div className={`relative flex items-center rounded-2xl border bg-slate-50/50 transition-all duration-200 ${focused === 'pass' ? 'border-[#4974f9] bg-white shadow-[0_0_0_4px_rgba(73,116,249,0.08)]' : 'border-slate-200 hover:border-slate-300'}`}>
                                <Lock className="pointer-events-none absolute right-4 h-4 w-4 text-slate-400" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    className="w-full bg-transparent py-5 pr-12 pl-14 text-base font-bold text-slate-900 placeholder:text-slate-300 outline-none"
                                    placeholder="••••••••"
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

                            {/* Strength meter */}
                            {password.length > 0 && (
                                <div className="mt-2 space-y-1.5">
                                    <div className="flex h-1.5 gap-1 overflow-hidden rounded-full bg-slate-100">
                                        {[1, 2, 3, 4].map((level) => (
                                            <div
                                                key={level}
                                                className={`flex-1 rounded-full transition-all duration-300 ${strength >= level ? strengthInfo?.color : 'bg-slate-200'}`}
                                            />
                                        ))}
                                    </div>
                                    <p className={`text-[11px] font-black ${strengthInfo?.color?.replace('bg-', 'text-')}`}>
                                        قوة كلمة المرور: {strengthInfo?.label}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Confirm password */}
                        <div className="space-y-2">
                            <label className="block text-[11px] font-black uppercase tracking-widest text-slate-400">تأكيد كلمة المرور</label>
                            <div className={`relative flex items-center rounded-2xl border bg-slate-50/50 transition-all duration-200 ${focused === 'confirm' ? 'border-[#4974f9] bg-white shadow-[0_0_0_4px_rgba(73,116,249,0.08)]' : 'border-slate-200 hover:border-slate-300'}`}>
                                <Lock className="pointer-events-none absolute right-4 h-4 w-4 text-slate-400" />
                                <input
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    className="w-full bg-transparent py-5 pr-12 pl-14 text-base font-bold text-slate-900 placeholder:text-slate-300 outline-none"
                                    placeholder="••••••••"
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

                        {/* Terms */}
                        <div className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                            <button
                                type="button"
                                onClick={() => setAgreed((v) => !v)}
                                className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition-all ${agreed ? 'border-[#4974f9] bg-[#4974f9]' : 'border-slate-300 bg-white hover:border-[#4974f9]'}`}
                            >
                                {agreed && <CheckCircle2 className="h-3.5 w-3.5 text-white" />}
                            </button>
                            <p className="text-xs font-bold leading-6 text-slate-600">
                                أوافق على{' '}
                                <button
                                    type="button"
                                    onClick={() => setIsTermsOpen(true)}
                                    className="font-black text-[#4974f9] underline-offset-2 hover:underline transition"
                                >
                                    الشروط والأحكام
                                </button>
                                {' '}وسياسة الخصوصية.
                            </p>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative flex h-16 w-full items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-l from-[#4974f9] to-[#3b5fe0] text-base font-black text-white shadow-xl shadow-[#4974f9]/25 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-2xl hover:shadow-[#4974f9]/35 active:translate-y-[1px] active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            <div className="absolute inset-0 bg-gradient-to-l from-[#3b5fe0] to-[#4974f9] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                            {loading ? (
                                <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <UserPlus className="relative ml-2 h-5 w-5" />
                                    <span className="relative">إنشاء حسابي الآن</span>
                                </>
                            )}
                        </button>

                        {/* Divider */}
                        <div className="flex items-center gap-4">
                            <div className="h-px flex-1 bg-slate-100" />
                            <span className="text-[11px] font-black text-slate-400">أو</span>
                            <div className="h-px flex-1 bg-slate-100" />
                        </div>

                        {/* Login link */}
                        <p className="text-center text-sm font-bold text-slate-500">
                            لديك حساب بالفعل؟{' '}
                            <Link to="/login" state={location.state} className="font-black text-[#4974f9] transition hover:text-[#1e40af]">
                                تسجيل الدخول
                            </Link>
                        </p>
                    </form>
                </div>
            </div>

            {/* ─── Terms Modal ──────────────────────────────────────── */}
            {isTermsOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm" dir="rtl">
                    <div className="relative w-full max-w-lg overflow-hidden rounded-[32px] bg-white shadow-2xl">
                        {/* Modal header */}
                        <div className="flex items-center justify-between border-b border-slate-100 bg-white px-6 py-5">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#4974f9]/10">
                                    <FileText className="h-5 w-5 text-[#4974f9]" />
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

                        {/* Modal body */}
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

                        {/* Modal footer */}
                        <div className="border-t border-slate-100 bg-slate-50 px-6 py-4">
                            <button
                                onClick={() => { setAgreed(true); setIsTermsOpen(false) }}
                                className="flex h-12 w-full items-center justify-center rounded-2xl bg-gradient-to-l from-[#4974f9] to-[#3b5fe0] text-sm font-black text-white shadow-lg shadow-[#4974f9]/20 transition-all hover:shadow-xl hover:shadow-[#4974f9]/30"
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
