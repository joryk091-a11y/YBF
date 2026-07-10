import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, User, Eye, EyeOff, ShieldAlert, ArrowLeft, Shield, CheckCircle } from 'lucide-react';
import { useAuth } from '../utils/AuthContext';

const AdminLogin = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [focusedField, setFocusedField] = useState(null);
    const { setUser } = useAuth();
    const navigate = useNavigate();

    
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
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (data.success) {
                if (data.role === 'admin') {
                    localStorage.setItem('userRole', 'admin');
                    localStorage.setItem('adminToken', 'admin-token-' + data.id);
                    localStorage.setItem('adminUsername', data.username || username);
                    setUser({
                        role: 'super_admin',
                        airline_name: 'Yemenia',
                        airline_id: 1,
                    });
                    navigate('/admin/dashboard');
                } else {
                    setError('هذا الحساب ليس له صلاحيات مدير النظام.');
                }
            } else {
                setError(data.error || 'اسم المستخدم أو كلمة المرور غير صحيحة.');
            }
        } catch (err) {
            console.error('Admin login connection error:', err);
            setError('تعذر الاتصال بخادم قاعدة البيانات.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#f8faff] dark:bg-[#070b13] text-slate-800 dark:text-slate-100 p-6 relative overflow-hidden" dir="rtl">
            {}
            <div className="absolute inset-0 pointer-events-none z-0">
                <div className="absolute top-[-10%] right-[-10%] h-[600px] w-[600px] rounded-full bg-blue-500/5 dark:bg-blue-500/10 blur-[120px]" />
                <div className="absolute bottom-[-10%] left-[-10%] h-[600px] w-[600px] rounded-full bg-indigo-500/5 dark:bg-indigo-500/10 blur-[120px]" />
                <div className="absolute top-[30%] left-[40%] h-[400px] w-[400px] rounded-full bg-sky-500/5 blur-[100px]" />
                
                {}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:20px_20px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_80%,transparent_100%)]" />
            </div>

            {}
            <Link 
                to="/" 
                className="absolute top-6 right-6 flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-blue-600 transition-all duration-300 bg-white/70 dark:bg-slate-900/70 border border-slate-200/50 dark:border-slate-800/50 py-2.5 px-4 rounded-xl shadow-sm hover:shadow backdrop-blur-md cursor-pointer"
            >
                <ArrowLeft size={14} className="rotate-180" />
                <span>العودة للرئيسية</span>
            </Link>

            <div className="relative z-10 w-full max-w-md">
                {}
                <div className="bg-white/80 dark:bg-slate-900/80 border border-slate-200/60 dark:border-slate-800/60 rounded-3xl p-10 shadow-2xl shadow-blue-900/5 backdrop-blur-xl relative overflow-hidden">
                    
                    {}
                    <div className="text-center mb-8">
                        {}
                        <div className="relative mx-auto mb-5 w-16 h-16 bg-gradient-to-tr from-blue-600 to-[#3a5fd4] text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/25">
                            <Shield size={28} />
                        </div>
                        <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">بوابة مدير النظام</h2>
                        <p className="text-[11px] text-slate-400 dark:text-slate-500 font-bold mt-2">أدخل البيانات المعتمدة للوصول إلى لوحة التحكم (Admin)</p>
                    </div>

                    {}
                    {error && (
                        <div className="mb-6 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                            <ShieldAlert size={18} className="text-rose-600 shrink-0 mt-0.5" />
                            <p className="text-xs font-bold text-rose-700 dark:text-rose-450 leading-relaxed">{error}</p>
                        </div>
                    )}

                    {}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        
                        {}
                        <div className="space-y-1.5">
                            <label className="block text-[10px] font-black text-slate-450 dark:text-slate-500 uppercase tracking-widest" htmlFor="username">
                                اسم المستخدم للمسؤول
                            </label>
                            <div className={`relative flex items-center rounded-2xl border transition-all duration-300 ${
                                focusedField === 'username' 
                                    ? 'border-blue-500 bg-white dark:bg-slate-900 shadow-[0_0_0_4px_rgba(59,130,246,0.12)]' 
                                    : 'border-slate-200/80 dark:border-slate-800/85 bg-slate-50/30 dark:bg-slate-950/20 hover:border-slate-350 dark:hover:border-slate-700'
                            }`}>
                                <User className={`absolute right-4 h-4 w-4 transition-colors duration-300 ${focusedField === 'username' ? 'text-blue-500' : 'text-slate-400'}`} />
                                <input
                                    type="text"
                                    id="username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    onFocus={() => setFocusedField('username')}
                                    onBlur={() => setFocusedField(null)}
                                    className="w-full bg-transparent py-4 pr-12 pl-4 text-sm font-bold outline-none text-slate-900 dark:text-white font-mono"
                                    placeholder=""
                                    required
                                    dir="ltr"
                                    autoComplete="off"
                                />
                            </div>
                        </div>

                        {}
                        <div className="space-y-1.5">
                            <label className="block text-[10px] font-black text-slate-450 dark:text-slate-500 uppercase tracking-widest" htmlFor="password">
                                كلمة المرور
                            </label>
                            <div className={`relative flex items-center rounded-2xl border transition-all duration-300 ${
                                focusedField === 'password' 
                                    ? 'border-blue-500 bg-white dark:bg-slate-900 shadow-[0_0_0_4px_rgba(59,130,246,0.12)]' 
                                    : 'border-slate-200/80 dark:border-slate-800/85 bg-slate-50/30 dark:bg-slate-950/20 hover:border-slate-350 dark:hover:border-slate-700'
                            }`}>
                                <Lock className={`absolute right-4 h-4 w-4 transition-colors duration-300 ${focusedField === 'password' ? 'text-blue-500' : 'text-slate-400'}`} />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    id="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    onFocus={() => setFocusedField('password')}
                                    onBlur={() => setFocusedField(null)}
                                    className="w-full bg-transparent py-4 pr-12 pl-12 text-sm font-bold outline-none text-slate-900 dark:text-white"
                                    placeholder=""
                                    required
                                    autoComplete="new-password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(prev => !prev)}
                                    className="absolute left-3 flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                                >
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        {}
                        <button
                            type="submit"
                            className={`w-full h-14 flex items-center justify-center rounded-2xl bg-blue-600 text-white font-black text-sm shadow-lg shadow-blue-500/20 hover:bg-blue-700 hover:shadow-xl hover:shadow-blue-500/30 hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 cursor-pointer border-0 ${
                                loading ? 'opacity-85 cursor-not-allowed' : ''
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
