import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Eye, EyeOff, Lock, Mail, ArrowLeft, X } from 'lucide-react'
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

        try {
            const response = await fetch('http://localhost:8080/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            })
            const data = await response.json()
            if (data.success) {
                // Save user details to localStorage
                localStorage.setItem('user', JSON.stringify(data.user))

                // Redirect user to where they wanted to go, or home page
                const from = location.state?.from || '/'
                navigate(from, { state: location.state })
            } else {
                setError(data.error || 'البريد الإلكتروني أو كلمة المرور غير صحيحة')
            }
        } catch {
            setError('تعذر الاتصال بالخادم')
        } finally {
            setLoading(false)
        }
    }

    return (
        <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-blue-100 to-blue-200 px-4 py-8 pt-24 sm:pt-44 md:pt-48 relative overflow-hidden" dir="rtl">
            {/* Modern subtle ambient glows within brand blue identity */}
            <div className="absolute inset-0 pointer-events-none opacity-70 z-0">
                <div className="absolute -top-20 -right-20 h-[600px] w-[600px] rounded-full bg-blue-350/40 blur-[120px]" />
                <div className="absolute -bottom-20 -left-20 h-[600px] w-[600px] rounded-full bg-indigo-300/30 blur-[120px]" />
            </div>

            {/* Centralized Login Card */}
            <div className="relative z-10 w-full max-w-[540px] bg-white rounded-[2.5rem] border border-slate-200/50 p-8 sm:p-10 shadow-[0_20px_50px_rgba(15,23,42,0.08)]">
                {/* Logo & Header */}
                <div className="flex flex-col items-center mb-8">
                    <div className="relative mb-4 flex items-center justify-center h-16 w-16">
                        <div className="absolute inset-0 rounded-full bg-brand-blue/20 blur-md animate-pulse" />
                        <img src={logo} alt="Logo" className="relative z-10 h-12 w-12 object-contain brightness-0" />
                    </div>
                    <h1 className="text-2xl font-black text-slate-900">مرحبًا بعودتك</h1>
                    <p className="mt-2 text-xs font-semibold text-slate-550 text-center leading-relaxed">
                        سجّل دخولك لمتابعة حجوزاتك وإدارة رحلاتك القادمة.
                    </p>
                </div>

                <form className="space-y-5" onSubmit={handleSubmit}>
                    {error && (
                        <div className="rounded-2xl bg-red-50 p-4 border border-red-100 flex items-center gap-3 text-red-650 text-xs sm:text-sm font-bold">
                            <X className="h-4 w-4 shrink-0" />
                            {error}
                        </div>
                    )}

                    {/* Email */}
                    <div className="space-y-2">
                        <label className="block text-[11px] font-black uppercase tracking-widest text-slate-400">البريد الإلكتروني</label>
                        <div className={`relative flex items-center rounded-2xl border bg-slate-50/50 transition-all duration-200 ${focused === 'email' ? 'border-brand-blue bg-white shadow-[0_0_0_4px_rgba(73,116,249,0.08)]' : 'border-slate-200 hover:border-slate-300'}`}>
                            <Mail className="pointer-events-none absolute right-4 h-4 w-4 text-slate-400" />
                            <input
                                type="email"
                                className="w-full bg-transparent py-4.5 pr-12 pl-4 text-sm sm:text-base font-bold text-slate-900 placeholder:text-slate-350 outline-none"
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

                    {/* Password */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <label className="block text-[11px] font-black uppercase tracking-widest text-slate-400">كلمة المرور</label>
                            <Link to="/forgot-password" className="text-[11px] font-black text-brand-blue hover:underline">نسيت كلمة المرور؟</Link>
                        </div>
                        <div className={`relative flex items-center rounded-2xl border bg-slate-50/50 transition-all duration-200 ${focused === 'pass' ? 'border-brand-blue bg-white shadow-[0_0_0_4px_rgba(73,116,249,0.08)]' : 'border-slate-200 hover:border-slate-300'}`}>
                            <Lock className="pointer-events-none absolute right-4 h-4 w-4 text-slate-400" />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                className="w-full bg-transparent py-4.5 pr-12 pl-14 text-sm sm:text-base font-bold text-slate-900 placeholder:text-slate-350 outline-none"
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
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="group relative flex h-14 w-full items-center justify-center overflow-hidden rounded-2xl bg-brand-blue text-sm sm:text-base font-black text-white shadow-lg shadow-brand-blue/20 transition-all duration-300 hover:bg-brand-blue-hover active:scale-98 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
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
                    <p className="text-center text-xs sm:text-sm font-bold text-slate-500 pt-2">
                        لا تملك حسابًا؟{' '}
                        <Link to="/register" state={location.state} className="font-black text-brand-blue transition hover:text-brand-blue-hover">
                            إنشاء حساب جديد
                        </Link>
                    </p>
                </form>
            </div>
        </main>
    )
}

export default LoginPage