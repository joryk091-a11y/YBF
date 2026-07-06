import logo from '../assets/logo.png';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin, ArrowUpRight, ShieldCheck, Globe, Shield, Lock, CreditCard, RefreshCw } from 'lucide-react';

const Footer = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const goTo = (path, event) => {
        if (path.includes('#')) {
            event?.preventDefault();
            const [url, hash] = path.split('#');
            const targetUrl = url || '/';
            
            if (location.pathname === targetUrl) {
                const target = document.getElementById(hash);
                target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            } else {
                navigate(targetUrl);
                setTimeout(() => {
                    const target = document.getElementById(hash);
                    target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 100);
            }
        }
    };

    return (
        <footer className="relative bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800/60 text-slate-600 dark:text-slate-400 py-8 overflow-hidden" dir="rtl">
            {/* ─── Premium Background Ambient Glows ───────────────────── */}
            <div className="absolute inset-0 pointer-events-none opacity-40">
                <div className="absolute -top-40 right-10 h-[300px] w-[300px] rounded-full bg-blue-500/5 blur-[80px]" />
                <div className="absolute -bottom-40 left-10 h-[350px] w-[350px] rounded-full bg-sky-400/5 blur-[90px]" />
            </div>

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-10">
                    
                    {/* Brand Column */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3">
                            <img src={logo} alt="Logo" className="h-12 w-12 object-contain brightness-0 dark:invert" />
                            <div className="flex flex-col">
                                <span className="text-base font-black text-slate-900 dark:text-slate-100 tracking-wide">Yemen Booking Flight</span>
                                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 tracking-wider">بوابتك لحجز رحلات اليمن</span>
                            </div>
                        </div>
                        <p className="text-xs font-bold leading-6 text-slate-500 dark:text-slate-400 max-w-xs">
                            بوابتكم الأولى والموثوقة لحجز الطيران وتسهيل المعاملات بأسعار منافسة وجودة خدمات استثنائية على مدار الساعة.
                        </p>
                        <div className="flex items-center gap-3">
                            {[Facebook, Twitter, Instagram, Linkedin].map((Icon, i) => (
                                <a 
                                    key={i} 
                                    href="#" 
                                    className="h-9 w-9 flex items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/50 dark:border-slate-700/50 text-slate-500 dark:text-slate-400 hover:bg-blue-600 hover:text-white hover:border-blue-600 hover:scale-105 active:scale-95 transition-all duration-300 shadow-sm cursor-pointer"
                                >
                                    <Icon size={16} />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Quick Navigation Links */}
                    <div>
                        <h4 className="text-slate-900 dark:text-slate-100 font-black mb-8 text-sm uppercase tracking-wider flex items-center gap-2">
                            روابط سريعة
                            <span className="h-1 w-3 rounded bg-blue-600" />
                        </h4>
                        <ul className="space-y-3.5">
                            {[
                                { name: 'الرئيسية', path: '/' },
                                { name: 'خدماتنا', path: '#services' },
                                { name: 'كيف نعمل', path: '#how-it-works' },
                                { name: 'الأسئلة الشائعة', path: '#faq' }
                            ].map((link, i) => (
                                <li key={i}>
                                    {link.path.startsWith('#') ? (
                                        <a 
                                            href={link.path}
                                            onClick={(e) => goTo(link.path, e)}
                                            className="group inline-flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200 hover:-translate-x-1"
                                        >
                                            <span className="h-1 w-1 rounded-full bg-slate-300 dark:bg-slate-700 group-hover:bg-blue-600 group-hover:dark:bg-blue-400 transition-colors" />
                                            {link.name}
                                        </a>
                                    ) : (
                                        <Link 
                                            to={link.path} 
                                            className="group inline-flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200 hover:-translate-x-1"
                                        >
                                            <span className="h-1 w-1 rounded-full bg-slate-300 dark:bg-slate-700 group-hover:bg-blue-600 group-hover:dark:bg-blue-400 transition-colors" />
                                            {link.name}
                                        </Link>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Terms & Policies Links */}
                    <div>
                        <h4 className="text-slate-900 dark:text-slate-100 font-black mb-8 text-sm uppercase tracking-wider flex items-center gap-2">
                            الشروط والسياسات
                            <span className="h-1 w-3 rounded bg-blue-600" />
                        </h4>
                        <ul className="space-y-3.5">
                            {[
                                { name: 'شروط الاستخدام العام', icon: Shield, path: '/terms#pol1' },
                                { name: 'خصوصية بيانات السفر', icon: Lock, path: '/terms#pol2' },
                                { name: 'سياسة الدفع والسداد', icon: CreditCard, path: '/terms#pol3' },
                                { name: 'سياسة التعديل والاسترجاع', icon: RefreshCw, path: '/terms#pol4' }
                            ].map((item, i) => (
                                <li key={i}>
                                    <a 
                                        href={item.path}
                                        onClick={(e) => goTo(item.path, e)}
                                        className="group inline-flex items-center gap-2.5 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200 hover:-translate-x-1"
                                    >
                                        <item.icon size={14} className="text-slate-400 dark:text-slate-500 group-hover:text-blue-600 group-hover:dark:text-blue-400 transition-colors" />
                                        {item.name}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Footer Bottom copyright */}
                <div className="pt-6 border-t border-slate-100 dark:border-slate-800/60 flex justify-center text-center">
                    <p className="text-xs font-bold text-slate-400 dark:text-slate-500 text-center w-full">
                        جميع الحقوق محفوظة © {new Date().getFullYear()} <span className="text-slate-800 dark:text-slate-200 font-black">Yemen Booking Flight</span>
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
