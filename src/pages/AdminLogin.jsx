import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Mail, Eye, EyeOff, ShieldAlert, ArrowLeft, Shield, CheckCircle } from 'lucide-react';

const AdminLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [focusedField, setFocusedField] = useState(null);
    const navigate = useNavigate();

    // If already logged in, redirect to dashboard
    useEffect(() => {
        const role = localStorage.getItem('userRole');
        const adminToken = localStorage.getItem('adminToken');
        if (role === 'admin' && adminToken) {
            navigate('/admin/dashboard');
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
                    localStorage.setItem('adminEmail', data.email || email);
                    navigate('/admin/dashboard');
                } else {
                    setError('هذا الحساب ليس له صلاحيات مدير النظام.');
                }
            } else {
                setError(data.error || 'البريد الإلكتروني أو كلمة المرور غير صحيحة.');
            }
        } catch (err) {
            console.error('Admin login connection error:', err);
            setError('تعذر الاتصال بخادم قاعدة البيانات.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#0b1120] text-slate-800 dark:text-slate-100 p-6 relative overflow-hidden" dir="rtl">
            {/* Mesh decorative backgrounds */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-10%] right-[-10%] h-[600px] w-[600px] rounded-full bg-blue-500/5 blur-[120px]" />
                <div className="absolute bottom-[-10%] left-[-10%] h-[600px] w-[600px] rounded-full bg-indigo-500/5 blur-[120px]" />
            </div>

            <div className="relative z-10 w-full max-w-md">
                
                {/* Back button to homepage */}
                <div className="mb-6 flex justify-start">
                    <Link to="/" className="flex items-center gap-2 text-xs font-black text-slate-400 hover:text-blue-600 transition-colors">
                        <ArrowLeft size={16} className="rotate-180" />
                        <span>العودة للموقع الرئيسي</span>
                    </Link>
                </div>

                {/* Login Card */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-10 shadow-xl shadow-slate-100 dark:shadow-none">
                    
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="h-16 w-16 bg-blue-600 text-white rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-blue-500/25 mb-4 animate-pulse">
                            <Shield size={32} />
                        </div>
                        <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">بوابة مدير النظام (Admin)</h2>
                        <p className="text-xs text-slate-400 font-bold mt-1.5">أدخل البيانات المعتمدة لإدارة حجز طيران YBF</p>
                    </div>



                    {/* Error Alerts */}
                    {error && (
                        <div className="mb-6 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 flex items-center gap-3">
                            <ShieldAlert size={18} className="text-rose-600 shrink-0" />
                            <p className="text-xs font-bold text-rose-700 dark:text-rose-400">{error}</p>
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        
                        {/* Email Input */}
                        <div className="space-y-2">
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest" htmlFor="email">
                                البريد الإلكتروني للادمن
                            </label>
                            <div className={`relative flex items-center rounded-2xl border bg-slate-50/50 dark:bg-slate-800/40 transition-all duration-200 ${
                                focusedField === 'email' 
                                    ? 'border-blue-500 bg-white dark:bg-slate-900 shadow-[0_0_0_4px_rgba(59,130,246,0.08)]' 
                                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                            }`}>
                                <Mail className="pointer-events-none absolute right-4 h-4 w-4 text-slate-400" />
                                <input
                                    type="email"
                                    id="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    onFocus={() => setFocusedField('email')}
                                    onBlur={() => setFocusedField(null)}
                                    className="w-full bg-transparent py-4 pr-12 pl-4 text-sm font-bold outline-none text-slate-900 dark:text-white"
                                    placeholder="أدخل البريد الإلكتروني"
                                    required
                                    dir="ltr"
                                    autoComplete="off"
                                />
                            </div>
                        </div>

                        {/* Password Input */}
                        <div className="space-y-2">
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest" htmlFor="password">
                                كلمة المرور
                            </label>
                            <div className={`relative flex items-center rounded-2xl border bg-slate-50/50 dark:bg-slate-800/40 transition-all duration-200 ${
                                focusedField === 'password' 
                                    ? 'border-blue-500 bg-white dark:bg-slate-900 shadow-[0_0_0_4px_rgba(59,130,246,0.08)]' 
                                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                            }`}>
                                <Lock className="pointer-events-none absolute right-4 h-4 w-4 text-slate-400" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    id="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    onFocus={() => setFocusedField('password')}
                                    onBlur={() => setFocusedField(null)}
                                    className="w-full bg-transparent py-4 pr-12 pl-12 text-sm font-bold outline-none text-slate-900 dark:text-white"
                                    placeholder="أدخل كلمة المرور"
                                    required
                                    autoComplete="new-password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(prev => !prev)}
                                    className="absolute left-3 flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200"
                                >
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            className={`w-full h-14 flex items-center justify-center rounded-2xl bg-blue-600 text-white font-black text-sm shadow-lg shadow-blue-500/20 hover:bg-blue-700 hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-300 active:scale-[0.98] ${
                                loading ? 'opacity-80 cursor-not-allowed' : ''
                            }`}
                            disabled={loading}
                        >
                            {loading ? (
                                <span className="flex items-center gap-3">
                                    <div className="h-5 w-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                                    جاري التحقق والدخول...
                                </span>
                            ) : (
                                <span>دخول للوحة التحكم</span>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;
