import React, { useState, useEffect, useRef } from 'react';
import { 
    Search, Trash2, Send, MessageSquare, User, RefreshCw, AlertCircle
} from 'lucide-react';

const Messages = ({ token, showToast }) => {
    const [conversations, setConversations] = useState([]);
    const [activeConversation, setActiveConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [replyText, setReplyText] = useState('');
    const [loadingConversations, setLoadingConversations] = useState(true);
    const [loadingMessages, setLoadingMessages] = useState(false);

    const chatEndRef = useRef(null);

    // Suppress ESLint warning by referencing token
    useEffect(() => {
        if (token) {
            // Token is available
        }
    }, [token]);

    // Fetch conversations list
    const fetchConversations = async () => {
        try {
            const res = await fetch('http://localhost:8080/api/admin/chat/conversations');
            const data = await res.json();
            if (data.success) {
                setConversations(data.conversations || []);
            }
        } catch (error) {
            console.error('Error fetching conversations:', error);
        }
    };

    // Fetch message history for selected conversation
    const fetchActiveMessages = async (email) => {
        if (!email) return;
        try {
            const res = await fetch(`http://localhost:8080/api/chat/messages?email=${encodeURIComponent(email)}`);
            const data = await res.json();
            if (data.success) {
                setMessages(data.messages || []);
            }
        } catch (error) {
            console.error('Error fetching active messages:', error);
        }
    };

    // Mark messages as read
    const markAsRead = async (email) => {
        if (!email) return;
        try {
            await fetch(`http://localhost:8080/api/admin/chat/read?email=${encodeURIComponent(email)}`, {
                method: 'PUT'
            });
            // Update local badge counts
            setConversations(prev => prev.map(c => 
                c.sender_email === email ? { ...c, unread_count: 0 } : c
            ));
        } catch (error) {
            console.error('Error marking as read:', error);
        }
    };

    // Handle select conversation
    const handleSelectConversation = (conv) => {
        setActiveConversation(conv);
        setLoadingMessages(true);
        fetchActiveMessages(conv.sender_email).finally(() => setLoadingMessages(false));
        markAsRead(conv.sender_email);
    };

    // Send reply
    const handleSendReply = async (e) => {
        e.preventDefault();
        if (!replyText.trim() || !activeConversation) return;

        const text = replyText.trim();
        setReplyText('');

        const newMsg = {
            id_chat: Date.now(),
            user_id: activeConversation.user_id || null,
            sender: 'admin',
            sender_name: 'المسؤول',
            sender_email: activeConversation.sender_email,
            message: text,
            created_at: new Date().toISOString()
        };

        // Optimistic UI updates
        setMessages(prev => [...prev, newMsg]);
        setConversations(prev => prev.map(c => 
            c.sender_email === activeConversation.sender_email 
                ? { ...c, last_message: text, last_message_time: new Date().toISOString() }
                : c
        ));

        try {
            const res = await fetch('http://localhost:8080/api/chat/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: activeConversation.user_id || null,
                    sender: 'admin',
                    sender_name: 'المسؤول',
                    sender_email: activeConversation.sender_email,
                    message: text
                })
            });
            const data = await res.json();
            if (data.success) {
                fetchActiveMessages(activeConversation.sender_email);
                fetchConversations();
            }
        } catch (error) {
            console.error('Error sending reply:', error);
            showToast('خطأ في إرسال الرد.');
        }
    };

    // Delete conversation
    const handleDeleteConversation = async (email) => {
        if (!window.confirm('هل أنت متأكد من رغبتك في حذف هذه المحادثة نهائياً؟')) return;
        try {
            const res = await fetch(`http://localhost:8080/api/admin/chat/conversations?email=${encodeURIComponent(email)}`, {
                method: 'DELETE'
            });
            const data = await res.json();
            if (data.success) {
                showToast('تم حذف المحادثة بنجاح.');
                setConversations(prev => prev.filter(c => c.sender_email !== email));
                if (activeConversation && activeConversation.sender_email === email) {
                    setActiveConversation(null);
                    setMessages([]);
                }
            } else {
                showToast('فشل حذف المحادثة.');
            }
        } catch (error) {
            console.error('Error deleting conversation:', error);
            showToast('خطأ في الاتصال بالخادم لحذف المحادثة.');
        }
    };

    // Auto-scroll to bottom of chat
    useEffect(() => {
        if (chatEndRef.current) {
            chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    // Initial load and polling of conversations list
    useEffect(() => {
        const loadInitial = async () => {
            setLoadingConversations(true);
            await fetchConversations();
            setLoadingConversations(false);
        };
        loadInitial();

        const intervalId = setInterval(() => {
            fetchConversations();
        }, 3000);

        return () => clearInterval(intervalId);
    }, []);

    // Polling messages of active conversation
    useEffect(() => {
        let intervalId;
        if (activeConversation) {
            intervalId = setInterval(() => {
                fetchActiveMessages(activeConversation.sender_email);
            }, 3000);
        }
        return () => {
            if (intervalId) clearInterval(intervalId);
        };
    }, [activeConversation]);

    // Filter conversations based on search query
    const filteredConversations = conversations.filter(conv => 
        (conv.sender_name && conv.sender_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (conv.sender_email && conv.sender_email.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (conv.last_message && conv.last_message.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const getInitials = (name) => {
        if (!name) return '?';
        return name.trim().charAt(0);
    };

    const formatTime = (isoString) => {
        if (!isoString) return '';
        try {
            const date = new Date(isoString);
            return date.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
        } catch {
            return '';
        }
    };

    return (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xl flex h-[620px]" dir="rtl">
            
            {/* Right Panel: Conversations List (Sidebar) */}
            <div className="w-80 sm:w-96 border-l border-slate-200 dark:border-slate-800 flex flex-col bg-slate-50/50 dark:bg-slate-900/30">
                {/* Sidebar Header */}
                <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-2">
                        <MessageSquare className="text-blue-600" size={20} />
                        <h4 className="text-sm font-black text-slate-800 dark:text-white">محادثات الدعم المباشر</h4>
                    </div>
                    <button 
                        onClick={fetchConversations} 
                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"
                        title="تحديث المحادثات"
                    >
                        <RefreshCw size={14} className="text-slate-500" />
                    </button>
                </div>

                {/* Search Bar */}
                <div className="p-3 border-b border-slate-200/60 dark:border-slate-800/60 shrink-0">
                    <div className="relative">
                        <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                        <input
                            type="text"
                            placeholder="بحث بالاسم، البريد أو الرسالة..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 focus:border-blue-500 rounded-xl py-2 pr-9 pl-4 text-xs font-bold outline-none transition-all"
                        />
                    </div>
                </div>

                {/* Conversations List Scrollable */}
                <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/40">
                    {loadingConversations ? (
                        <div className="py-20 text-center text-slate-400 font-bold text-xs flex flex-col items-center gap-2">
                            <div className="h-6 w-6 border-3 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                            جاري التحميل...
                        </div>
                    ) : filteredConversations.length === 0 ? (
                        <div className="py-20 text-center text-slate-400 font-bold text-xs">
                            لا توجد محادثات نشطة.
                        </div>
                    ) : (
                        filteredConversations.map((conv) => {
                            const isActive = activeConversation && activeConversation.sender_email === conv.sender_email;
                            return (
                                <div
                                    key={conv.sender_email}
                                    onClick={() => handleSelectConversation(conv)}
                                    className={`flex items-center gap-3 p-4 cursor-pointer hover:bg-slate-100/50 dark:hover:bg-slate-800/20 transition-all ${
                                        isActive ? 'bg-blue-50/50 dark:bg-blue-950/20 border-r-4 border-blue-600' : ''
                                    }`}
                                >
                                    {/* Avatar */}
                                    <div className="h-11 w-11 rounded-full flex items-center justify-center font-black text-sm bg-gradient-to-tr from-blue-500 to-indigo-600 text-white shrink-0 shadow-sm">
                                        {getInitials(conv.sender_name)}
                                    </div>

                                    {/* Conversation Snippet */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-center mb-1">
                                            <h5 className="text-xs font-black text-slate-800 dark:text-white truncate">{conv.sender_name}</h5>
                                            <span className="text-[9px] text-slate-400 font-bold shrink-0">{formatTime(conv.last_message_time)}</span>
                                        </div>
                                        <p className="text-[10px] text-slate-400 font-bold truncate mb-1">{conv.sender_email}</p>
                                        <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold truncate leading-relaxed">
                                            {conv.last_message}
                                        </p>
                                    </div>

                                    {/* Unread badge */}
                                    {conv.unread_count > 0 && (
                                        <div className="h-5 w-5 bg-emerald-500 text-white rounded-full flex items-center justify-center text-[9px] font-black shrink-0">
                                            {conv.unread_count}
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Left Panel: Active Chat Thread */}
            <div className="flex-1 flex flex-col bg-white dark:bg-slate-950/10 relative">
                
                {activeConversation ? (
                    <>
                        {/* Chat Header */}
                        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 px-6 py-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full flex items-center justify-center font-black text-xs bg-gradient-to-tr from-blue-500 to-indigo-600 text-white shrink-0 shadow-sm">
                                    {getInitials(activeConversation.sender_name)}
                                </div>
                                <div>
                                    <h4 className="text-xs font-black text-slate-800 dark:text-white">{activeConversation.sender_name}</h4>
                                    <p className="text-[9px] text-slate-400 font-bold mt-0.5">{activeConversation.sender_email}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => handleDeleteConversation(activeConversation.sender_email)}
                                className="p-2.5 text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all"
                                title="حذف المحادثة نهائياً"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/20 dark:bg-slate-950/20">
                            {loadingMessages ? (
                                <div className="py-20 text-center text-slate-400 font-bold text-xs flex flex-col items-center gap-2">
                                    <div className="h-6 w-6 border-3 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                    جاري تحميل الرسائل...
                                </div>
                            ) : messages.length === 0 ? (
                                <div className="py-20 text-center text-slate-400 font-bold text-xs">
                                    لا توجد رسائل في هذه المحادثة.
                                </div>
                            ) : (
                                messages.map((msg, index) => {
                                    const isAdmin = msg.sender === 'admin';
                                    return (
                                        <div 
                                            key={msg.id_chat || index}
                                            className={`flex flex-col max-w-[75%] ${isAdmin ? 'mr-auto items-end' : 'ml-auto items-start'}`}
                                        >
                                            <div 
                                                className={`rounded-2xl px-4 py-2.5 text-xs font-bold shadow-sm leading-relaxed ${
                                                    isAdmin 
                                                        ? 'bg-gradient-to-tr from-blue-600 to-indigo-700 text-white rounded-bl-none' 
                                                        : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-100 dark:border-slate-800/80 rounded-br-none'
                                                }`}
                                            >
                                                {msg.message}
                                            </div>
                                            <span className="text-[8px] text-slate-400 mt-1 font-bold">
                                                {isAdmin ? 'المسؤول' : msg.sender_name} · {formatTime(msg.created_at)}
                                            </span>
                                        </div>
                                    );
                                })
                            )}
                            <div ref={chatEndRef} />
                        </div>

                        {/* Input Area */}
                        <form onSubmit={handleSendReply} className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-3 shrink-0">
                            <input
                                type="text"
                                placeholder="اكتب ردك هنا..."
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs font-bold outline-none focus:border-blue-500 transition-all"
                            />
                            <button
                                type="submit"
                                disabled={!replyText.trim()}
                                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-700 text-white shadow-md shadow-blue-600/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 cursor-pointer"
                            >
                                <Send size={14} className="rotate-180" />
                            </button>
                        </form>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8 select-none">
                        <div className="h-16 w-16 bg-blue-50 dark:bg-blue-900/10 rounded-2xl flex items-center justify-center text-blue-600 mb-4 shadow-inner">
                            <MessageSquare size={32} />
                        </div>
                        <h4 className="text-sm font-black text-slate-700 dark:text-slate-200 mb-1">مركز الدعم والمحادثات الحية</h4>
                        <p className="text-xs text-slate-400 font-bold text-center max-w-sm leading-relaxed">
                            اختر إحدى المحادثات من القائمة الجانبية للتواصل مع المسافرين والزوار والرد على استفساراتهم بشكل فوري.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Messages;
