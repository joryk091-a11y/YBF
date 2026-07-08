import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, ShieldCheck, ArrowRight, Building2, Activity, Mail, Eye, EyeOff } from 'lucide-react';
import logo from '../assets/logo.png';
import { useAuth } from '../utils/AuthContext';

const CompanyLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [focusedField, setFocusedField] = useState(null);
    const { setUser } = useAuth();
    const navigate = useNavigate();

    React.useEffect(() => {
        const role = localStorage.getItem('userRole');
        const adminToken = localStorage.getItem('adminToken');
        const companyToken = localStorage.getItem('companyToken');
        const companyId = localStorage.getItem('companyId');

        if (role === 'admin' && adminToken) {
            navigate('/admin/dashboard');
        } else if (role === 'company' && companyToken && companyId) {
            navigate('/company/dashboard');
        } else if (role === 'company' && companyToken && !companyId) {
            // بيانات ناقصة، قم بتنظيف الجلسة للسماح بدخول جديد
            localStorage.clear();
        }
    }, [navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await fetch('http://localhost:8080/api/company-login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (data.success) {
                if (data.role === 'admin') {
                    localStorage.setItem('userRole', 'admin');
                    localStorage.setItem('adminToken', 'admin-token-' + data.id);
                    setUser({
                        role: 'super_admin',
                        airline_name: 'Yemenia',
                        airline_id: 1,
                    });
                    navigate('/admin/dashboard');
                } else {
                    const companyName = data.airline_name || (data.airline_code === 'IY' ? 'خطوط طيران اليمنية' : data.airline_code === 'BS' ? 'طيران بلقيس' : 'فلاي عدن');
                    const companyId = data.airline_id || data.id;
                    const companyLogo = data.logo_url || (data.airline_code === 'IY' ? '/logos/yemenia.png' : data.airline_code === 'BS' ? '/logos/bilqis.png' : '/logos/flyaden.png');
                    localStorage.setItem('userRole', 'company');
                    localStorage.setItem('companyToken', 'company-token-' + data.id);
                    localStorage.setItem('companyId', companyId);
                    localStorage.setItem('companyName', companyName);
                    localStorage.setItem('airlineCode', data.airline_code);
                    localStorage.setItem('companyLogo', companyLogo);
                    setUser({
                        role: 'company_admin',
                        airline_name: companyName,
                        airline_id: companyId,
                        logo_url: companyLogo,
                    });
                    navigate('/company/dashboard');
                }
            } else {
                setError(data.error || 'البريد الإلكتروني أو كلمة المرور غير صحيحة.');
            }
        } catch (error) {
            console.error('Company login error:', error);
            setError('تعذر الاتصال بالخادم.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-[#f8faff] overflow-hidden" dir="rtl">
            {/* ─── Login Form Panel ─────────────────────────────────── */}
            <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 sm:p-12 relative z-10 bg-white lg:rounded-l-[60px] shadow-2xl">
                <div className="w-full max-w-md">

                    {/* Header */}
                    <div className="mb-10">
                        <div className="flex items-center gap-3 mb-6">
                            <Link to="/" className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-600/20">
                                <Building2 size={24} />
                            </Link>
                            <h3 className="text-xl font-black text-slate-900">بوابة الشركات والإدارة</h3>
                        </div>
                        <h1 className="text-4xl font-black tracking-tight text-slate-900 mb-3">تسجيل الدخول</h1>
                        <p className="text-slate-500 font-bold">أدخل بريدك الإلكتروني وكلمة المرور للوصول إلى لوحة التحكم.</p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-100 flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center text-red-600 shrink-0">
                                <Lock size={16} />
                            </div>
                            <p className="text-sm font-bold text-red-700">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Email Field */}
                        <div className="space-y-2">
                            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest" htmlFor="email">
                                البريد الإلكتروني
                            </label>
                            <div className={`relative flex items-center rounded-2xl border bg-slate-50/50 transition-all duration-200 ${focusedField === 'email' ? 'border-blue-500 bg-white shadow-[0_0_0_4px_rgba(59,130,246,0.08)]' : 'border-slate-200 hover:border-slate-300'}`}>
                                <Mail className="pointer-events-none absolute right-4 h-4 w-4 text-slate-400" />
                                <input
                                    type="email"
                                    id="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    onFocus={() => setFocusedField('email')}
                                    onBlur={() => setFocusedField(null)}
                                    className="w-full bg-transparent py-5 pr-12 pl-4 text-base font-bold text-slate-900 placeholder:text-slate-350 outline-none"
                                    placeholder=""
                                    required
                                    dir="ltr"
                                />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div className="space-y-2">
                            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest" htmlFor="password">
                                كلمة المرور
                            </label>
                            <div className={`relative flex items-center rounded-2xl border bg-slate-50/50 transition-all duration-200 ${focusedField === 'password' ? 'border-blue-500 bg-white shadow-[0_0_0_4px_rgba(59,130,246,0.08)]' : 'border-slate-200 hover:border-slate-300'}`}>
                                <Lock className="pointer-events-none absolute right-4 h-4 w-4 text-slate-400" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    id="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    onFocus={() => setFocusedField('password')}
                                    onBlur={() => setFocusedField(null)}
                                    className="w-full bg-transparent py-5 pr-12 pl-14 text-base font-bold text-slate-900 placeholder:text-slate-350 outline-none"
                                    placeholder=""
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(v => !v)}
                                    className="absolute left-3 flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className={`group relative w-full h-16 flex items-center justify-center overflow-hidden rounded-2xl bg-blue-600 text-white font-black text-lg shadow-xl shadow-blue-600/25 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-600/40 active:scale-[0.98] ${loading ? 'opacity-80 cursor-not-allowed' : ''}`}
                            disabled={loading}
                        >
                            <div className="absolute inset-0 bg-gradient-to-l from-indigo-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                            {loading ? (
                                <span className="relative flex items-center gap-3">
                                    <div className="h-6 w-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                                    جاري التحقق...
                                </span>
                            ) : (
                                <span className="relative flex items-center gap-2">
                                    دخول للمنصة
                                    <ArrowRight size={20} className="mr-2 group-hover:-translate-x-1 transition-transform" />
                                </span>
                            )}
                        </button>
                    </form>

                    {/* Footer Links */}
                    <div className="mt-10 pt-8 border-t border-slate-100 flex justify-center">
                        <a href="mailto:ybf.support@gmail.com" className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors">
                            <Mail size={16} />
                            الدعم الفني للشركاء
                        </a>
                    </div>
                </div>
            </div>

            {/* ─── Decorative Side Panel ────────────────────────────── */}
            <div className="relative hidden lg:flex lg:w-1/2 flex-col justify-center items-center p-12 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-white to-indigo-600/10 z-0" />
                <div className="absolute top-[-10%] right-[-10%] h-[500px] w-[500px] rounded-full bg-blue-500/5 blur-[100px] animate-pulse" />
                <div className="absolute bottom-[-10%] left-[-10%] h-[500px] w-[500px] rounded-full bg-indigo-500/5 blur-[100px] animate-pulse" style={{ animationDelay: '2s' }} />

                <div className="relative z-10 text-center">
                    <div className="mb-8">
                        <img src={logo} alt="Logo" className="h-32 w-auto mx-auto object-contain brightness-0" />
                    </div>
                    <h2 className="text-5xl font-black mb-6 tracking-tight text-slate-900">
                        شريك <span className="text-blue-600">النجاح</span>
                    </h2>
                    <p className="text-xl text-slate-500 font-bold max-w-md mx-auto leading-relaxed">
                        قم بإدارة رحلاتك، حجوزاتك، وعملياتك بكل سهولة وذكاء من خلال منصة الإدارة المتكاملة.
                    </p>
                </div>

                <div className="absolute inset-0 opacity-20 pointer-events-none"
                    style={{ backgroundImage: 'radial-gradient(circle at 50% 50%, #4974f9 0%, transparent 50%)' }} />
            </div>
        </div>
    );
};

export default CompanyLogin;