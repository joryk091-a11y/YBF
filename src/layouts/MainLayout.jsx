import { useState, useEffect, useRef } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Navbar from '../components/Navbar.jsx'
import Footer from '../components/Footer.jsx'
import { MessageSquare, Send, X, Mail, Sparkles, ShieldCheck } from 'lucide-react'

function MainLayout() {
  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const location = useLocation();
  const chatEndRef = useRef(null);

  const isHomePage = location.pathname === '/' || location.pathname === '/home';

  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem('admin_chat_history');
    return saved ? JSON.parse(saved) : [
      { id: 1, sender: 'admin', text: 'مرحباً بك! كيف يمكنني مساعدتك اليوم بخصوص استفساراتك أو حجوزاتك على المنصة؟ ✈️', time: new Date().toISOString() }
    ];
  });

  const user = JSON.parse(localStorage.getItem('user') || 'null');

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping, isOpen]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userMessage = {
      id: Date.now(),
      sender: 'user',
      text: inputText.trim(),
      senderName: user?.name || 'زائر',
      time: new Date().toISOString()
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    localStorage.setItem('admin_chat_history', JSON.stringify(updatedMessages));
    setInputText('');

    // Trigger admin typing and response simulation
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      const adminReply = {
        id: Date.now() + 1,
        sender: 'admin',
        text: 'شكراً لتواصلك معنا. لقد تم استلام رسالتك وإرسالها فوراً إلى المسؤول عن المنصة، وسيقوم بمراجعة تفاصيل حسابك والتواصل معك في أقرب وقت ممكن.',
        time: new Date().toISOString()
      };
      const finalMessages = [...updatedMessages, adminReply];
      setMessages(finalMessages);
      localStorage.setItem('admin_chat_history', JSON.stringify(finalMessages));
    }, 1500);
  };

  return (
    <div className="app-shell min-h-screen text-slate-900 relative" dir="rtl">
      <Navbar />
      <Outlet />
      <Footer />

      {/* Floating Chat Widget - Rendered only on Home Page */}
      {isHomePage && (
        <div className="fixed bottom-6 right-6 z-[999] flex flex-col items-end font-sans">
          {isOpen && (
            <div className="relative mb-4 w-80 max-w-[calc(100vw-2rem)] overflow-hidden rounded-3xl bg-white border border-slate-100 shadow-2xl flex flex-col h-[420px] animate-in fade-in slide-in-from-bottom-5 duration-300">
              {/* Chat Header */}
              <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#4974f9] to-[#3a5fd4] text-white">
                      <ShieldCheck size={18} />
                    </div>
                    <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-emerald-500 animate-pulse" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-900">إدارة المنصة الكاملة</h4>
                    <p className="text-[9px] text-slate-400 font-bold">نشط الآن · الرد خلال ثوانٍ</p>
                  </div>
                </div>
              </div>

              {/* Chat Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/20">
                {messages.map((msg) => (
                  <div 
                    key={msg.id}
                    className={`flex flex-col max-w-[80%] ${msg.sender === 'user' ? 'mr-auto items-end' : 'ml-auto items-start'}`}
                  >
                    <div 
                      className={`rounded-2xl px-3.5 py-2.5 text-xs font-bold shadow-sm leading-relaxed ${
                        msg.sender === 'user' 
                          ? 'bg-gradient-to-tr from-[#4974f9] to-[#3a5fd4] text-white rounded-br-none' 
                          : 'bg-white text-slate-800 border border-slate-100 rounded-bl-none'
                      }`}
                    >
                      {msg.text}
                    </div>
                    <span className="text-[8px] text-slate-400 mt-1 font-bold">
                      {new Date(msg.time).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))}

                {isTyping && (
                  <div className="flex flex-col items-start max-w-[80%] ml-auto">
                    <div className="bg-white text-slate-400 border border-slate-100 rounded-2xl rounded-bl-none px-4 py-3 flex gap-1 items-center shadow-sm">
                      <span className="h-1.5 w-1.5 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="h-1.5 w-1.5 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="h-1.5 w-1.5 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Chat Input Bar */}
              <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-100 flex items-center gap-2 bg-white">
                <input 
                  type="text" 
                  value={inputText}
                  onChange={e => setInputText(e.target.value)}
                  placeholder="اكتب استفسارك هنا..."
                  className="flex-1 bg-slate-50 border border-slate-200/80 rounded-xl px-3.5 py-2.5 text-xs font-bold outline-none focus:border-[#4974f9] transition-all"
                />
                <button 
                  type="submit"
                  disabled={!inputText.trim()}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-[#4974f9] to-[#3a5fd4] text-white shadow-md shadow-[#4974f9]/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 cursor-pointer"
                >
                  <Send size={14} className="rotate-180" />
                </button>
              </form>

              {/* Quick Contact Footer */}
              <div className="px-5 py-2 border-t border-slate-50 bg-slate-50/10 flex items-center justify-between text-[8px] text-slate-400 font-bold">
                <a href="mailto:admin@gmail.com" className="flex items-center gap-1 hover:text-[#4974f9] transition-colors">
                  <Mail size={9} />
                  admin@gmail.com
                </a>
                <span className="flex items-center gap-0.5">
                  <Sparkles size={9} className="text-amber-500 animate-pulse" />
                  دعم فني مباشر
                </span>
              </div>
            </div>
          )}

          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`flex h-14 w-14 items-center justify-center rounded-2xl text-white shadow-xl transition-all duration-300 hover:scale-110 active:scale-95 cursor-pointer ${
              isOpen 
                ? 'bg-slate-800 shadow-slate-800/30 rotate-90' 
                : 'bg-gradient-to-tr from-[#4974f9] to-[#3a5fd4] shadow-[#4974f9]/30'
            }`}
          >
            {isOpen ? <X size={22} /> : <MessageSquare size={22} className="animate-pulse" />}
          </button>
        </div>
      )}
    </div>
  )
}

export default MainLayout
