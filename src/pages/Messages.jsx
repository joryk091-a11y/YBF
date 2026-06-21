import React, { useState, useEffect, useCallback } from 'react';
import { 
    Mail, Search, Trash2, CheckCircle, Clock, Info, 
    ArrowLeft, Filter, AlertCircle, Send, CheckSquare, MessageSquare
} from 'lucide-react';

const Messages = ({ token, showToast }) => {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedMessage, setSelectedMessage] = useState(null);
    const [replyText, setReplyText] = useState('');
    const [sendingReply, setSendingReply] = useState(false);

    // Fetch messages from database
    const fetchMessages = useCallback(async () => {
        try {
            setLoading(true);
            const res = await fetch('http://localhost:8080/api/admin/messages');
            const data = await res.json();
            if (data.success) {
                setMessages(data.messages);
            }
        } catch (error) {
            console.error('Error fetching messages:', error);
            showToast('خطأ في الاتصال بالخادم لجلب الرسائل.');
        } finally {
            setLoading(false);
        }
    }, [showToast]);

    useEffect(() => {
        fetchMessages();
    }, [fetchMessages]);

    // Handle Reply submit
    const handleSendReply = async (e) => {
        e.preventDefault();
        if (!replyText.trim() || !selectedMessage) return;

        setSendingReply(true);
        try {
            const res = await fetch(`http://localhost:8080/api/admin/messages/${selectedMessage.id_messages}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    status: 'replied',
                    reply: replyText
                })
            });
            const data = await res.json();
            if (data.success) {
                showToast('تم إرسال الرد وتحديث حالة الرسالة بنجاح.');
                // Update local state
                setMessages(prev => prev.map(m => 
                    m.id_messages === selectedMessage.id_messages 
                        ? { ...m, status: 'replied', reply: replyText } 
                        : m
                ));
                // Update selected message in view modal
                setSelectedMessage(prev => ({ ...prev, status: 'replied', reply: replyText }));
                setReplyText('');
            } else {
                showToast('فشل في إرسال الرد.');
            }
        } catch (error) {
            console.error('Error replying to message:', error);
            showToast('خطأ في الاتصال بالخادم لإرسال الرد.');
        } finally {
            setSendingReply(false);
        }
    };

    // Mark as read
    const handleMarkAsRead = async (msg) => {
        if (msg.status !== 'unread') return;

        try {
            const res = await fetch(`http://localhost:8080/api/admin/messages/${msg.id_messages}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'read' })
            });
            const data = await res.json();
            if (data.success) {
                setMessages(prev => prev.map(m => 
                    m.id_messages === msg.id_messages ? { ...m, status: 'read' } : m
                ));
                if (selectedMessage && selectedMessage.id_messages === msg.id_messages) {
                    setSelectedMessage(prev => ({ ...prev, status: 'read' }));
                }
            }
        } catch (error) {
            console.error('Error marking message as read:', error);
        }
    };

    // Delete Message
    const handleDeleteMessage = async (id) => {
        if (!window.confirm('هل أنت متأكد من رغبتك في حذف هذه الرسالة نهائياً؟')) return;

        try {
            const res = await fetch(`http://localhost:8080/api/admin/messages/${id}`, {
                method: 'DELETE'
            });
            const data = await res.json();
            if (data.success) {
                showToast('تم حذف الرسالة بنجاح.');
                setMessages(prev => prev.filter(m => m.id_messages !== id));
                if (selectedMessage && selectedMessage.id_messages === id) {
                    setSelectedMessage(null);
                }
            } else {
                showToast('فشل حذف الرسالة.');
            }
        } catch (error) {
            console.error('Error deleting message:', error);
            showToast('خطأ في الاتصال بالخادم لحذف الرسالة.');
        }
    };

    // Filtered messages
    const filteredMessages = messages.filter(msg => {
        const matchesSearch = 
            msg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            msg.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (msg.subject && msg.subject.toLowerCase().includes(searchQuery.toLowerCase())) ||
            msg.message.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesStatus = 
            statusFilter === 'all' || 
            msg.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    // Counts
    const totalCount = messages.length;
    const unreadCount = messages.filter(m => m.status === 'unread').length;
    const readCount = messages.filter(m => m.status === 'read').length;
    const repliedCount = messages.filter(m => m.status === 'replied').length;

    // Helper to get formatted status badge
    const renderStatusBadge = (status) => {
        switch (status) {
            case 'unread':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-rose-500/10 text-rose-500">
                        <AlertCircle size={12} />
                        غير مقروءة
                    </span>
                );
            case 'read':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-blue-500/10 text-blue-500">
                        <Clock size={12} />
                        مقروءة
                    </span>
                );
            case 'replied':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-500/10 text-emerald-500">
                        <CheckCircle size={12} />
                        تم الرد
                    </span>
                );
            default:
                return null;
        }
    };

    return (
        <div className="space-y-6">
            {/* 1. Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">إجمالي الرسائل</p>
                        <h4 className="text-3xl font-black mt-1">{totalCount}</h4>
                    </div>
                    <div className="h-12 w-12 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
                        <MessageSquare size={24} />
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">رسائل غير مقروءة</p>
                        <h4 className="text-3xl font-black mt-1 text-rose-500">{unreadCount}</h4>
                    </div>
                    <div className="h-12 w-12 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
                        <AlertCircle size={24} />
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">تم الرد عليها</p>
                        <h4 className="text-3xl font-black mt-1 text-emerald-500">{repliedCount}</h4>
                    </div>
                    <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                        <CheckCircle size={24} />
                    </div>
                </div>
            </div>

            {/* 2. Main Layout split: List on right/full, Detail modal or panel */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm p-8">
                {/* Search & Filters */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
                    <div>
                        <h4 className="text-sm font-black">صندوق بريد الرسائل والشكاوى</h4>
                        <p className="text-xs text-slate-400 mt-1">تصفح الرسائل الواردة من المسافرين والرد عليها مباشرة</p>
                    </div>

                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        {/* Search */}
                        <div className="relative flex-1 sm:w-64">
                            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input
                                type="text"
                                placeholder="بحث في الرسائل..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 focus:border-blue-500 rounded-2xl py-2.5 pr-10 pl-4 text-xs font-bold outline-none"
                            />
                        </div>

                        {/* Filter status */}
                        <div className="relative">
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 rounded-2xl py-2.5 px-4 text-xs font-bold outline-none cursor-pointer"
                            >
                                <option value="all">جميع الحالات</option>
                                <option value="unread">غير مقروءة</option>
                                <option value="read">مقروءة</option>
                                <option value="replied">تم الرد</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Table / List */}
                {loading ? (
                    <div className="py-20 text-center text-slate-400 font-bold text-xs flex flex-col items-center gap-3">
                        <div className="h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        جاري تحميل الرسائل...
                    </div>
                ) : filteredMessages.length === 0 ? (
                    <div className="py-20 text-center text-slate-400 font-bold text-xs border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl">
                        لا توجد رسائل واردة تطابق الفلاتر المحددة.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-right border-collapse">
                            <thead>
                                <tr className="border-b border-slate-200 dark:border-slate-800/80 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                                    <th className="py-4 px-6">المرسل</th>
                                    <th className="py-4 px-6">الموضوع</th>
                                    <th className="py-4 px-6">تاريخ الإرسال</th>
                                    <th className="py-4 px-6">الحالة</th>
                                    <th className="py-4 px-6 text-left">الإجراءات</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredMessages.map((msg) => (
                                    <tr 
                                        key={msg.id_messages}
                                        onClick={() => {
                                            setSelectedMessage(msg);
                                            handleMarkAsRead(msg);
                                        }}
                                        className={`border-b border-slate-100 dark:border-slate-800/40 hover:bg-slate-50 dark:hover:bg-slate-800/10 cursor-pointer transition-colors ${
                                            msg.status === 'unread' ? 'font-bold bg-blue-50/10 dark:bg-blue-500/5' : ''
                                        }`}
                                    >
                                        <td className="py-4 px-6">
                                            <div className="font-black text-xs text-slate-800 dark:text-white">{msg.name}</div>
                                            <div className="text-[10px] text-slate-400 mt-0.5">{msg.email}</div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="text-xs font-bold">{msg.subject || '—'}</div>
                                            <div className="text-[10px] text-slate-400 line-clamp-1 mt-0.5 max-w-xs">{msg.message}</div>
                                        </td>
                                        <td className="py-4 px-6 text-xs text-slate-500 font-bold">
                                            {new Date(msg.created_at).toLocaleDateString('ar-YE', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </td>
                                        <td className="py-4 px-6">
                                            {renderStatusBadge(msg.status)}
                                        </td>
                                        <td className="py-4 px-6 text-left" onClick={(e) => e.stopPropagation()}>
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => {
                                                        setSelectedMessage(msg);
                                                        handleMarkAsRead(msg);
                                                    }}
                                                    className="p-2 text-blue-500 hover:bg-blue-500/10 rounded-xl transition-colors"
                                                    title="عرض الرسالة"
                                                >
                                                    <Mail size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteMessage(msg.id_messages)}
                                                    className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-xl transition-colors"
                                                    title="حذف الرسالة"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* 3. Reply / View Modal */}
            {selectedMessage && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm select-none">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200" dir="rtl">
                        {/* Modal Header */}
                        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 bg-blue-600/10 text-blue-600 rounded-xl flex items-center justify-center">
                                    <Mail size={18} />
                                </div>
                                <div>
                                    <h4 className="text-sm font-black">تفاصيل رسالة المسافر</h4>
                                    <p className="text-[10px] text-slate-400 font-bold mt-0.5">تواصل وتقديم الدعم لحل شكاوى ومقترحات المسافرين</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setSelectedMessage(null)}
                                className="h-10 w-10 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 hover:text-slate-800 dark:hover:bg-slate-700/80 dark:hover:text-white transition-all"
                            >
                                <ArrowLeft size={16} />
                            </button>
                        </div>

                        {/* Modal Body (Scrollable) */}
                        <div className="p-8 space-y-6 overflow-y-auto flex-1">
                            {/* Meta Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-800/30 p-4 rounded-2xl border border-slate-100 dark:border-slate-800/60">
                                <div>
                                    <span className="text-[10px] font-black text-slate-400">المرسل</span>
                                    <h5 className="text-xs font-black text-slate-800 dark:text-white mt-1">{selectedMessage.name}</h5>
                                </div>
                                <div>
                                    <span className="text-[10px] font-black text-slate-400">البريد الإلكتروني</span>
                                    <h5 className="text-xs font-bold text-slate-800 dark:text-white mt-1">{selectedMessage.email}</h5>
                                </div>
                                {selectedMessage.phone && (
                                    <div>
                                        <span className="text-[10px] font-black text-slate-400">رقم الهاتف</span>
                                        <h5 className="text-xs font-bold text-slate-800 dark:text-white mt-1 dir-ltr text-right">{selectedMessage.phone}</h5>
                                    </div>
                                )}
                                <div>
                                    <span className="text-[10px] font-black text-slate-400">تاريخ الرسالة</span>
                                    <h5 className="text-xs font-bold text-slate-800 dark:text-white mt-1">
                                        {new Date(selectedMessage.created_at).toLocaleString('ar-YE', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </h5>
                                </div>
                            </div>

                            {/* Message Subject & Body */}
                            <div className="space-y-2">
                                <span className="text-[10px] font-black text-slate-400">الموضوع</span>
                                <h4 className="text-sm font-black text-slate-800 dark:text-white bg-slate-50 dark:bg-slate-800/20 py-2 px-4 rounded-xl border border-slate-100 dark:border-slate-800/40">
                                    {selectedMessage.subject || 'بدون موضوع'}
                                </h4>
                            </div>

                            <div className="space-y-2">
                                <span className="text-[10px] font-black text-slate-400">نص الرسالة</span>
                                <p className="text-xs font-bold leading-7 text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/10 p-5 rounded-2xl border border-slate-100 dark:border-slate-800/30 whitespace-pre-wrap">
                                    {selectedMessage.message}
                                </p>
                            </div>

                            {/* Existing Reply if already answered */}
                            {selectedMessage.status === 'replied' && selectedMessage.reply && (
                                <div className="space-y-2 bg-emerald-50/10 dark:bg-emerald-500/5 p-5 rounded-2xl border border-emerald-500/20">
                                    <div className="flex items-center gap-2 text-emerald-500 mb-1">
                                        <CheckCircle size={14} />
                                        <span className="text-[10px] font-black uppercase">الرد المرسل مسبقاً</span>
                                    </div>
                                    <p className="text-xs font-bold leading-7 text-slate-600 dark:text-slate-300 whitespace-pre-wrap">
                                        {selectedMessage.reply}
                                    </p>
                                </div>
                            )}

                            {/* Reply Input Form (If not answered, or to update reply) */}
                            {selectedMessage.status !== 'replied' && (
                                <form onSubmit={handleSendReply} className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800/60">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400">كتابة الرد على المسافر</label>
                                        <textarea
                                            value={replyText}
                                            onChange={(e) => setReplyText(e.target.value)}
                                            placeholder="اكتب ردك هنا وسيتم إرساله للمسافر وتحديث حالة الشكوى..."
                                            rows={4}
                                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-blue-500 rounded-2xl py-3.5 px-5 text-xs font-bold outline-none leading-6"
                                            required
                                        ></textarea>
                                    </div>

                                    <div className="flex justify-end">
                                        <button
                                            type="submit"
                                            disabled={sendingReply}
                                            className="bg-blue-600 hover:bg-blue-700 text-white font-black py-3 px-6 rounded-2xl text-xs transition-all shadow-md shadow-blue-500/20 flex items-center gap-2 disabled:opacity-50"
                                        >
                                            {sendingReply ? (
                                                <>
                                                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                    جاري الإرسال...
                                                </>
                                            ) : (
                                                <>
                                                    <Send size={14} />
                                                    إرسال الرد وتحديث الحالة
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Messages;
