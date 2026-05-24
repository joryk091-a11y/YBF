import logo from '../assets/logo.png';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin, ArrowUpRight, ShieldCheck, Globe } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="relative bg-[#0a1120] text-slate-400 py-16 overflow-hidden border-t border-white/5" dir="rtl">
            {/* ─── Decorative Background Elements ───────────────────── */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20">
                <div className="absolute top-[-10%] left-[10%] h-64 w-64 rounded-full bg-blue-600/10 blur-[100px]" />
                <div className="absolute bottom-[-10%] right-[10%] h-64 w-64 rounded-full bg-indigo-600/10 blur-[100px]" />
            </div>

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-16">
                    
                    {/* Brand Section */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3">
                            <img src={logo} alt="Logo" className="h-12 w-12 object-contain" />
                            <span className="text-xl font-black text-white tracking-tight">Yemen Booking Flight</span>
                        </div>
                        <p className="text-sm font-bold leading-7 text-slate-500 max-w-xs">
                            نحن بوابتك الأولى لاستكشاف العالم. نقدم لك تجربة حجز طيران فريدة، آمنة، وسريعة بأسعار تنافسية.
                        </p>
                        <div className="flex items-center gap-4">
                            {[Facebook, Twitter, Instagram, Linkedin].map((Icon, i) => (
                                <a key={i} href="#" className="h-10 w-10 flex items-center justify-center rounded-xl bg-white/5 border border-white/5 text-slate-400 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all duration-300">
                                    <Icon size={18} />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="text-white font-black mb-8 text-lg flex items-center gap-2">
                            روابط سريعة
                            <div className="h-1 w-4 bg-blue-600 rounded-full" />
                        </h4>
                        <ul className="space-y-4">
                            {[
                                { name: 'الرئيسية', path: '/' },
                                { name: 'البحث عن رحلات', path: '/search' },
                                { name: 'شركات الطيران', path: '/companies' },
                                { name: 'من نحن', path: '/about' }
                            ].map((link, i) => (
                                <li key={i}>
                                    <Link to={link.path} className="group flex items-center gap-2 text-sm font-bold hover:text-white transition-colors">
                                        <div className="h-1 w-0 group-hover:w-2 bg-blue-600 transition-all rounded-full" />
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Support & Services */}
                    <div>
                        <h4 className="text-white font-black mb-8 text-lg flex items-center gap-2">
                            الدعم والخدمات
                            <div className="h-1 w-4 bg-blue-600 rounded-full" />
                        </h4>
                        <ul className="space-y-4">
                            {[
                                { name: 'مركز المساعدة', icon: Globe },
                                { name: 'سياسة الخصوصية', icon: ShieldCheck },
                                { name: 'الشروط والأحكام', icon: ArrowUpRight },
                                { name: 'تواصل معنا', icon: Mail }
                            ].map((item, i) => (
                                <li key={i}>
                                    <a href="#" className="flex items-center gap-3 text-sm font-bold hover:text-white transition-colors group">
                                        <item.icon size={16} className="text-slate-600 group-hover:text-blue-500 transition-colors" />
                                        {item.name}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h4 className="text-white font-black mb-8 text-lg flex items-center gap-2">
                            معلومات التواصل
                            <div className="h-1 w-4 bg-blue-600 rounded-full" />
                        </h4>
                        <div className="space-y-6">
                            <div className="flex items-start gap-4">
                                <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-white/5 border border-white/5 text-blue-500 shrink-0">
                                    <MapPin size={20} />
                                </div>
                                <div className="text-sm font-bold leading-6">
                                    الجمهورية اليمنية، صنعاء<br/>
                                    شارع الزبيري، مجمع اليزن
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-white/5 border border-white/5 text-blue-500 shrink-0">
                                    <Phone size={18} />
                                </div>
                                <div className="text-sm font-black dir-ltr">+967 1 234 567</div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-white/5 border border-white/5 text-blue-500 shrink-0">
                                    <Mail size={18} />
                                </div>
                                <div className="text-sm font-black tracking-wide">support@ybf.com</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
                    <p className="text-xs font-bold text-slate-600">
                        جميع الحقوق محفوظة © {new Date().getFullYear()} <span className="text-white">Yemen Booking Flight</span>
                    </p>
                    <div className="flex items-center gap-8">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" className="h-3 opacity-20 hover:opacity-100 transition-opacity grayscale invert" />
                        <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-6 opacity-20 hover:opacity-100 transition-opacity grayscale invert" />
                        <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="PayPal" className="h-4 opacity-20 hover:opacity-100 transition-opacity grayscale invert" />
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
