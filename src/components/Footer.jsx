import logo from '../assets/logo.png';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin, ArrowUpRight, ShieldCheck, Globe } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="relative bg-white border-t border-slate-100 text-slate-600 py-16 overflow-hidden" dir="rtl">
            {/* ─── Premium Background Ambient Glows ───────────────────── */}
            <div className="absolute inset-0 pointer-events-none opacity-40">
                <div className="absolute -top-40 right-10 h-[300px] w-[300px] rounded-full bg-blue-500/5 blur-[80px]" />
                <div className="absolute -bottom-40 left-10 h-[350px] w-[350px] rounded-full bg-sky-400/5 blur-[90px]" />
            </div>

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-16">
                    
                    {/* Brand Column */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3">
                            <img src={logo} alt="Logo" className="h-12 w-12 object-contain brightness-0" />
                            <div className="flex flex-col">
                                <span className="text-base font-black text-slate-900 tracking-wide">Yemen Booking Flight</span>
                                <span className="text-[10px] font-bold text-slate-400 tracking-wider">بوابتك لحجز رحلات اليمن</span>
                            </div>
                        </div>
                        <p className="text-xs font-bold leading-6 text-slate-500 max-w-xs">
                            بوابتكم الأولى والموثوقة لحجز الطيران وتسهيل المعاملات بأسعار منافسة وجودة خدمات استثنائية على مدار الساعة.
                        </p>
                        <div className="flex items-center gap-3">
                            {[Facebook, Twitter, Instagram, Linkedin].map((Icon, i) => (
                                <a 
                                    key={i} 
                                    href="#" 
                                    className="h-9 w-9 flex items-center justify-center rounded-xl bg-slate-50 border border-slate-200/50 text-slate-500 hover:bg-blue-600 hover:text-white hover:border-blue-600 hover:scale-105 active:scale-95 transition-all duration-300 shadow-sm cursor-pointer"
                                >
                                    <Icon size={16} />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Quick Navigation Links */}
                    <div>
                        <h4 className="text-slate-900 font-black mb-8 text-sm uppercase tracking-wider flex items-center gap-2">
                            روابط سريعة
                            <span className="h-1 w-3 rounded bg-blue-600" />
                        </h4>
                        <ul className="space-y-3.5">
                            {[
                                { name: 'الرئيسية', path: '/' },
                                { name: 'البحث عن رحلات', path: '/search' },
                                { name: 'شركات الطيران', path: '/companies' },
                                { name: 'من نحن', path: '/about' }
                            ].map((link, i) => (
                                <li key={i}>
                                    <Link 
                                        to={link.path} 
                                        className="group inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-blue-600 transition-all duration-200 hover:-translate-x-1"
                                    >
                                        <span className="h-1 w-1 rounded-full bg-slate-300 group-hover:bg-blue-600 transition-colors" />
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Support & Legal Links */}
                    <div>
                        <h4 className="text-slate-900 font-black mb-8 text-sm uppercase tracking-wider flex items-center gap-2">
                            الدعم والخدمات
                            <span className="h-1 w-3 rounded bg-blue-600" />
                        </h4>
                        <ul className="space-y-3.5">
                            {[
                                { name: 'مركز المساعدة', icon: Globe },
                                { name: 'سياسة الخصوصية', icon: ShieldCheck },
                                { name: 'الشروط والأحكام', icon: ArrowUpRight },
                                { name: 'تواصل معنا', icon: Mail }
                            ].map((item, i) => (
                                <li key={i}>
                                    <a 
                                        href="#" 
                                        className="group inline-flex items-center gap-2.5 text-xs font-bold text-slate-500 hover:text-blue-600 transition-all duration-200 hover:-translate-x-1"
                                    >
                                        <item.icon size={14} className="text-slate-400 group-hover:text-blue-600 transition-colors" />
                                        {item.name}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact & Map Card */}
                    <div>
                        <h4 className="text-slate-900 font-black mb-8 text-sm uppercase tracking-wider flex items-center gap-2">
                            معلومات التواصل
                            <span className="h-1 w-3 rounded bg-blue-600" />
                        </h4>
                        <div className="space-y-4">
                            <div className="flex items-start gap-3">
                                <div className="h-9 w-9 flex items-center justify-center rounded-xl bg-slate-50 border border-slate-200/50 text-blue-600 shrink-0 shadow-sm">
                                    <MapPin size={16} />
                                </div>
                                <div className="text-xs font-bold leading-5 text-slate-500">
                                    الجمهورية اليمنية، صنعاء<br/>
                                    شارع الزبيري، مجمع اليزن
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="h-9 w-9 flex items-center justify-center rounded-xl bg-slate-50 border border-slate-200/50 text-blue-600 shrink-0 shadow-sm">
                                    <Phone size={14} />
                                </div>
                                <div className="text-xs font-black text-slate-700 dir-ltr">+967 1 234 567</div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="h-9 w-9 flex items-center justify-center rounded-xl bg-slate-50 border border-slate-200/50 text-blue-600 shrink-0 shadow-sm">
                                    <Mail size={14} />
                                </div>
                                <div className="text-xs font-black text-slate-700 tracking-wide">ybf.support@gmail.com</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Bottom copyright and cards */}
                <div className="pt-8 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6">
                    <p className="text-xs font-bold text-slate-400">
                        جميع الحقوق محفوظة © {new Date().getFullYear()} <span className="text-slate-800 font-black">Yemen Booking Flight</span>
                    </p>
                    <div className="flex items-center gap-8">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" className="h-3 opacity-60 hover:opacity-100 transition-opacity grayscale" />
                        <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-6 opacity-60 hover:opacity-100 transition-opacity grayscale" />
                        <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="PayPal" className="h-4 opacity-60 hover:opacity-100 transition-opacity grayscale" />
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
