import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Eye, EyeOff, Lock, Mail, Plane, UserRound, ArrowLeft, X } from 'lucide-react'
import logo from '../assets/logo.png'

function LoginPage() {
    const navigate = useNavigate()
    const location = useLocation()
    const [showPassword, setShowPassword] = useState(false)
    const [focused, setFocused] = useState(null)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        // محاكاة وقت الاتصال بالخادم (ثانية واحدة)
        setTimeout(() => {
            // التحقق الوهمي (Mock Authentication)
            if (email === 'yemenia@gmail.com') {
                // بيانات وهمية لمدير طيران اليمنية
                const mockUser = {
                    id: 1,
                    name: 'مدير النظام',
                    email: 'yemenia@gmail.com',
                    role: 'company_admin',
                    airline_id: 1,
                    airline_name: 'طيران اليمنية'
                }
                
                // حفظ البيانات في المتصفح لكي تقرأها باقي الصفحات
                localStorage.setItem('user', JSON.stringify(mockUser))
                
                // توجيهكِ مباشرة إلى صفحة التقارير التي صممناها
                navigate('/company-analytics') 
            } else {
                // رسالة خطأ إذا تم إدخال إيميل آخر
                setError('للتجربة، يرجى استخدام الإيميل: yemenia@gmail.com')
            }
            setLoading(false)
        }, 1000)
    }

    return (
        <main className="flex-1 flex flex-col lg:flex-row bg-white pt-20 lg:pt-0" dir="rtl">
            {/* ─── Right form panel ──────────────────────────────────── */}
            <div className="flex flex-1 flex-col justify-center px-6 pt-32 pb-16 sm:px-10 lg:px-16 xl:px-24">
                {/* Mobile logo */}
                <div className="mb-8 flex items-center gap-3 lg:hidden">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-50 border border-slate-200 shadow-sm p-2">
                        <img src={logo} alt="Logo" className="w-full h-full object-contain brightness-0" />
                    </div>
                    <span className="text-base font-black text-slate-900">Yemen Booking Flight</span>
                </div>

                <div className="mx-auto w-full max-w-[580px]">
                    {/* Header */}
                    <div className="mb-10 text-right">
                        <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-[#4974f9]/10 text-[#4974f9] mb-6">
                            <UserRound className="h-7 w-7" />
                        </div>
                        <h1 className="text-4xl font-black tracking-tight text-slate-900">مرحبًا بعودتك</h1>
                        <p className="mt-3 text-base font-bold text-slate-500">
                            سجّل دخولك لمتابعة حجوزاتك وإدارة رحلاتك القادمة.
                        </p>
                    </div>

                    <form className="space-y-6" onSubmit={handleSubmit}>
                        {error && (
                            <div className="rounded-2xl bg-red-50 p-4 border border-red-100 flex items-center gap-3 text-red-600 text-sm font-bold">
                                <X className="h-4 w-4" />
                                {error}
                            </div>
                        )}
                        {/* Email */}
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

                        {/* Password */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <label className="block text-[11px] font-black uppercase tracking-widest text-slate-400">كلمة المرور</label>
                                <Link to="/forgot-password" size="sm" className="text-[11px] font-black text-[#4974f9] hover:underline">نسيت كلمة المرور؟</Link>
                            </div>
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
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative flex h-16 w-full items-center justify-center overflow-hidden rounded-2xl bg-[#0f172a] text-base font-black text-white shadow-xl shadow-slate-200 transition-all duration-300 hover:-translate-y-0.5 hover:bg-slate-800 active:translate-y-[1px] disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <span className="relative">تسجيل الدخول</span>
                                    <ArrowLeft className="relative mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
                                </>
                            )}
                        </button>

                        {/* Register link */}
                        <p className="text-center text-sm font-bold text-slate-500">
                            لا تملك حسابًا؟{' '}
                            <Link to="/register" state={location.state} className="font-black text-[#4974f9] transition hover:text-[#1e40af]">
                                إنشاء حساب جديد
                            </Link>
                        </p>
                    </form>
                </div>
            </div>

            {/* ─── Left decorative panel ──────────────────────────────── */}
            <div className="relative hidden lg:flex lg:w-1/2 flex-col justify-center items-center overflow-hidden bg-gradient-to-br from-[#0a1628] to-[#10203d] p-12 text-white">
                {/* Animated background elements */}
                <div className="absolute top-0 right-0 h-full w-full opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 20% 30%, #4974f9 0%, transparent 50%), radial-gradient(circle at 80% 70%, #d9312b 0%, transparent 50%)' }} />
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />

                <div className="relative z-10 text-center max-w-md">
                    <h2 className="text-4xl font-black leading-tight mb-6">وجهتك القادمة<br />بانتظارك</h2>
                    <p className="text-slate-400 font-bold leading-8 mb-10">استمتع بتجربة حجز فريدة وسلسة مع أفضل العروض على الرحلات الداخلية والدولية.</p>

                    <div className="grid grid-cols-3 gap-6">
                        {[
                            { val: '10K+', label: 'مستخدم' },
                            { val: '500+', label: 'وجهة' },
                            { val: '24/7', label: 'دعم' }
                        ].map(stat => (
                            <div key={stat.label} className="text-center">
                                <p className="text-xl font-black text-[#4974f9]">{stat.val}</p>
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </main>
    )
}

export default LoginPage