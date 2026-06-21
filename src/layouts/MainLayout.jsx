import { useState, useEffect, useRef } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar.jsx'
import Footer from '../components/Footer.jsx'
import { MessageSquare, Send, X, Mail, Sparkles, ShieldCheck } from 'lucide-react'

function MainLayout() {
  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState([]);
  const location = useLocation();
  const navigate = useNavigate();
  const chatEndRef = useRef(null);

  const isHomePage = location.pathname === '/' || location.pathname === '/home';
  const loggedInUser = JSON.parse(localStorage.getItem('user') || 'null');

  // Get active chat user details
  const getChatUser = () => {
    const loggedIn = JSON.parse(localStorage.getItem('user') || 'null');
    if (loggedIn) {
      return {
        id: loggedIn.id || null,
        name: loggedIn.fullName || loggedIn.name || 'مستخدم',
        email: loggedIn.email
      };
    }
    return null;
  };

  const fetchChatHistory = async (email) => {
    if (!email) return;
    try {
      const res = await fetch(`http://localhost:8080/api/chat/messages?email=${encodeURIComponent(email)}`);
      const data = await res.json();
      if (data.success) {
        setMessages(data.messages || []);
      }
    } catch (error) {
      console.error('Error fetching chat history:', error);
    }
  };

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // Polling for new messages
  useEffect(() => {
    let intervalId;
    if (isOpen) {
      const chatUser = getChatUser();
      if (chatUser) {
        fetchChatHistory(chatUser.email);

        intervalId = setInterval(() => {
          fetchChatHistory(chatUser.email);
        }, 3000);
      }
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isOpen]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const chatUser = getChatUser();
    if (!chatUser) return;

    const text = inputText.trim();
    setInputText('');

    // Optimistic UI update
    const tempMessage = {
      id_chat: Date.now(),
      user_id: chatUser.id,
      sender: 'user',
      sender_name: chatUser.name,
      sender_email: chatUser.email,
      message: text,
      created_at: new Date().toISOString()
    };
    setMessages(prev => [...prev, tempMessage]);

    try {
      const res = await fetch('http://localhost:8080/api/chat/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: chatUser.id,
          sender: 'user',
          sender_name: chatUser.name,
          sender_email: chatUser.email,
          message: text
        })
      });
      const data = await res.json();
      if (data.success) {
        fetchChatHistory(chatUser.email);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
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

              {!loggedInUser ? (
                /* Unauthenticated view */
                <div className="flex-1 flex flex-col items-center justify-center p-6 text-center bg-slate-50/20 select-none">
                  <div className="h-14 w-14 bg-blue-50/60 dark:bg-blue-900/10 rounded-2xl flex items-center justify-center text-[#4974f9] mb-4 shadow-sm border border-blue-100/40">
                    <MessageSquare size={24} />
                  </div>
                  <h5 className="text-xs font-black text-slate-800 mb-1.5">يرجى تسجيل الدخول أولاً</h5>
                  <p className="text-[10px] text-slate-400 font-bold max-w-[200px] leading-relaxed mb-4">
                    يجب أن يكون لديك حساب مسجل ومسجل الدخول لتتمكن من مراسلة الدعم الفني والحصول على المساعدة.
                  </p>
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      navigate('/login');
                    }}
                    className="bg-gradient-to-tr from-[#4974f9] to-[#3a5fd4] text-white text-[10px] font-black py-2.5 px-6 rounded-xl hover:scale-105 active:scale-95 transition-all shadow-md shadow-[#4974f9]/20 cursor-pointer"
                  >
                    تسجيل الدخول
                  </button>
                </div>
              ) : (
                /* Authenticated user chat view */
                <>
                  {/* Chat Messages Area */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/20">
                    {messages.map((msg, index) => (
                      <div 
                        key={msg.id_chat || msg.id || index}
                        className={`flex flex-col max-w-[80%] ${msg.sender === 'user' ? 'mr-auto items-end' : 'ml-auto items-start'}`}
                      >
                        <div 
                          className={`rounded-2xl px-3.5 py-2.5 text-xs font-bold shadow-sm leading-relaxed ${
                            msg.sender === 'user' 
                              ? 'bg-gradient-to-tr from-[#4974f9] to-[#3a5fd4] text-white rounded-br-none' 
                              : 'bg-white text-slate-800 border border-slate-100 rounded-bl-none'
                          }`}
                        >
                          {msg.message || msg.text}
                        </div>
                        <span className="text-[8px] text-slate-400 mt-1 font-bold">
                          {new Date(msg.created_at || msg.time).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    ))}
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
                </>
              )}

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
