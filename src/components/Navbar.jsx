import { useMemo, useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Bell, LogOut, UserRound, CheckCheck, BellRing, Ticket, Plane, Clock, CreditCard, XCircle, X } from 'lucide-react'
import defaultLogo from '../assets/logo.png'

const defaultNavItems = [
  { label: 'الرئيسية', href: '/' },
  { label: 'الوجهات', href: '#hero' },
  { label: 'حجوزاتي', href: '/my-bookings' },
  { label: 'الشركات', href: '/company/login' },
  { label: 'تواصل معنا', href: '#footer' },
]

const typeConfig = {
  booking:      { color: 'bg-blue-500',    label: 'حجز',       icon: Plane },
  reminder:     { color: 'bg-amber-500',   label: 'تذكير',     icon: Clock },
  payment:      { color: 'bg-emerald-500', label: 'دفع',       icon: CreditCard },
  cancellation: { color: 'bg-red-500',     label: 'إلغاء',     icon: XCircle },
  general:      { color: 'bg-slate-400',   label: 'عام',       icon: Bell },
}

function NotificationDropdown({ userId, onClose }) {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchNotifications = () => {
    if (!userId) { setLoading(false); return }
    fetch(`http://localhost:8080/api/notifications/${userId}`)
      .then(r => r.json())
      .then(d => { if (d.success) setNotifications(d.notifications) })
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchNotifications() }, [userId])

  const markRead = async (id) => {
    await fetch(`http://localhost:8080/api/notifications/${id}/read`, { method: 'PATCH' })
    setNotifications(prev => prev.map(n => n.id_notifications === id ? { ...n, is_read: 1 } : n))
  }

  const deleteNotification = async (e, id) => {
    e.stopPropagation()
    await fetch(`http://localhost:8080/api/notifications/${id}`, { method: 'DELETE' })
    setNotifications(prev => prev.filter(n => n.id_notifications !== id))
  }

  const markAllRead = async () => {
    await fetch(`http://localhost:8080/api/notifications/read-all/${userId}`, { method: 'PATCH' })
    setNotifications(prev => prev.map(n => ({ ...n, is_read: 1 })))
  }

  const unread = notifications.filter(n => !n.is_read).length

  const formatTime = (ts) => {
    if (!ts) return ''
    const d = new Date(ts)
    const now = new Date()
    const diff = Math.floor((now - d) / 1000)
    if (diff < 60) return 'الآن'
    if (diff < 3600) return `منذ ${Math.floor(diff / 60)} د`
    if (diff < 86400) return `منذ ${Math.floor(diff / 3600)} س`
    return d.toLocaleDateString('ar-EG', { month: 'short', day: 'numeric' })
  }

  return (
    <div className="absolute left-0 top-14 z-50 w-96 overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.15)] animate-in fade-in slide-in-from-top-2 duration-200" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
        <div className="flex items-center gap-2">
          <BellRing className="h-4 w-4 text-[#4974f9]" />
          <span className="text-sm font-black text-slate-900">الإشعارات</span>
          {unread > 0 && (
            <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#4974f9] px-1.5 text-[10px] font-black text-white">
              {unread}
            </span>
          )}
        </div>
        {unread > 0 && (
          <button
            onClick={markAllRead}
            className="flex items-center gap-1.5 text-[11px] font-black text-[#4974f9] hover:underline"
          >
            <CheckCheck className="h-3.5 w-3.5" />
            تحديد الكل كمقروء
          </button>
        )}
      </div>

      {/* List */}
      <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-50">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#4974f9] border-t-transparent" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-14">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50">
              <Bell className="h-7 w-7 text-slate-300" />
            </div>
            <p className="text-sm font-bold text-slate-400">لا توجد إشعارات</p>
          </div>
        ) : (
          notifications.map(n => {
            const tc = typeConfig[n.type] || typeConfig.general
            return (
              <div
                key={n.id_notifications}
                className={`group relative flex w-full gap-4 p-5 text-right transition-colors hover:bg-slate-50/80 ${!n.is_read ? 'bg-blue-50/30' : ''}`}
              >
                {/* Clicking this area marks it as read */}
                <button
                  onClick={() => markRead(n.id_notifications)}
                  className="flex flex-1 gap-4 text-right focus:outline-none cursor-pointer"
                >
                  <div className={`mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${tc.color} text-white`}>
                    {tc.icon && <tc.icon size={14} />}
                  </div>
                  <div className="flex-1 min-w-0 pr-0 pl-7">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-[13px] leading-snug ${!n.is_read ? 'font-black text-slate-900' : 'font-bold text-slate-700'}`}>
                        {n.title}
                      </p>
                      <span className="shrink-0 text-[10px] font-bold text-slate-400">{formatTime(n.created_at)}</span>
                    </div>
                    <p className="mt-1 text-[11px] font-bold leading-5 text-slate-500 whitespace-pre-line">{n.message}</p>
                  </div>
                </button>

                {/* Status Dot / Unread */}
                {!n.is_read && (
                  <div className="absolute left-8 top-1/2 -translate-y-1/2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#4974f9]" />
                )}

                {/* Dismiss (Delete) Button - X */}
                <button
                  onClick={(e) => deleteNotification(e, n.id_notifications)}
                  className="absolute left-4 top-4 opacity-0 group-hover:opacity-100 flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 text-slate-400 hover:bg-red-50 hover:text-red-500 hover:scale-105 transition-all duration-200 cursor-pointer shadow-sm border border-slate-200/50"
                  title="حذف الإشعار"
                >
                  <X size={10} />
                </button>
              </div>
            )
          })
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-slate-100 px-5 py-3">
        <Link
          to="/my-bookings"
          onClick={onClose}
          className="block text-center text-[11px] font-black text-[#4974f9] hover:underline"
        >
          عرض جميع الحجوزات ←
        </Link>
      </div>
    </div>
  )
}

function Navbar({
  logoSrc = defaultLogo,
  logoAlt = 'شعار الموقع',
  navItems = defaultNavItems,
  loginLabel = 'تسجيل الدخول',
  loginHref = '/login',
  onLoginClick,
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const bellRef = useRef(null)
  const navigate = useNavigate()
  const location = useLocation()

  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('user') || 'null') } catch { return null }
  })

  useEffect(() => {
    try {
      setUser(JSON.parse(localStorage.getItem('user') || 'null'))
    } catch {
      setUser(null)
    }
  }, [location])

  const links = useMemo(
    () => (Array.isArray(navItems) && navItems.length ? navItems : defaultNavItems),
    [navItems],
  )

  // Fetch unread count
  useEffect(() => {
    if (!user?.id) return
    const fetch_ = () =>
      fetch(`http://localhost:8080/api/notifications/${user.id}`)
        .then(r => r.json())
        .then(d => { if (d.success) setUnreadCount(d.notifications.filter(n => !n.is_read).length) })
        .catch(() => {})
    fetch_()
    const interval = setInterval(fetch_, 30000)
    return () => clearInterval(interval)
  }, [user?.id])

  // Close dropdown on outside click
  useEffect(() => {
    if (!showNotifications) return
    const handler = (e) => {
      if (bellRef.current && !bellRef.current.contains(e.target)) {
        setShowNotifications(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [showNotifications])

  const goTo = (href, event) => {
    event?.preventDefault()
    setIsMenuOpen(false)
    if (!href) return
    if (href.startsWith('#')) {
      const target = document.getElementById(href.slice(1))
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' })
      } else {
        navigate('/')
        setTimeout(() => {
          const newTarget = document.getElementById(href.slice(1))
          newTarget?.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }, 100)
      }
      return
    }
    navigate(href)
  }

  return (
    <header className="-top-2 absolute inset-x-0 z-40 px-0 sm:-top-3" dir="rtl">
      <nav className="[-webkit-tap-highlight-color:transparent] rounded-none border border-white/10 bg-[#0f172a] px-4 py-3 text-white sm:px-6">
        {/* Desktop Menu */}
        <div className="relative hidden md:flex md:items-center md:justify-between">
          <div className="flex items-center justify-end gap-3">
            <Link to="/" className="inline-flex items-center focus:outline-none">
              <img
                src={logoSrc}
                alt={logoAlt}
                className="h-18 w-18 object-contain drop-shadow-[0_6px_16px_rgba(56,189,248,0.35)]"
              />
            </Link>
            <div className="hidden flex-col justify-center lg:flex">
              <span className="font-brand text-[13px] font-bold tracking-[0.06em] text-white/85">
                Yemen Booking Flight
              </span>
              <span className="mt-0.5 text-[10px] font-semibold tracking-[0.12em] text-white/60">
                حجز رحلات اليمن
              </span>
            </div>
          </div>

          <div className="absolute left-1/2 -translate-x-1/2">
            <ul className="flex items-center gap-8">
              {links.map((item) => (
                <li key={item.label}>
                  {item.href.startsWith('#') ? (
                    <a
                      href={item.href}
                      onClick={(event) => goTo(item.href, event)}
                      className="group relative inline-flex select-none py-1 text-sm font-semibold text-white/85 transition-all duration-300 hover:text-[#b4d3f8] focus:outline-none"
                    >
                      {item.label}
                      <span className="pointer-events-none absolute -bottom-1.5 left-1/2 h-[2px] w-full -translate-x-1/2 scale-x-0 rounded-full bg-[#b4d3f8] opacity-95 transition-transform duration-300 group-hover:scale-x-100" />
                    </a>
                  ) : (
                    <Link
                      to={item.href}
                      className="group relative inline-flex select-none py-1 text-sm font-semibold text-white/85 transition-all duration-300 hover:text-[#b4d3f8] focus:outline-none"
                    >
                      {item.label}
                      <span className="pointer-events-none absolute -bottom-1.5 left-1/2 h-[2px] w-full -translate-x-1/2 scale-x-0 rounded-full bg-[#b4d3f8] opacity-95 transition-transform duration-300 group-hover:scale-x-100" />
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex items-center justify-start gap-4">
            {/* Bell Button with Dropdown */}
            {user && (
              <div ref={bellRef} className="relative">
                <button
                  onClick={() => setShowNotifications(v => !v)}
                  className="relative h-10 w-10 flex items-center justify-center rounded-full bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors"
                >
                  <Bell size={20} />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-black text-white ring-2 ring-[#0f172a]">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>
                {showNotifications && (
                  <NotificationDropdown
                    userId={user.id}
                    onClose={() => setShowNotifications(false)}
                  />
                )}
              </div>
            )}

            {user ? (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-3 rounded-full bg-white/5 border border-white/10 px-4 py-2">
                  <UserRound size={18} className="text-[#4974f9]" />
                  <span className="text-sm font-black text-white">
                    {user.fullName?.split(' ')[0]}
                  </span>
                </div>
                <button
                  onClick={() => {
                    localStorage.removeItem('user')
                    setUser(null)
                    navigate('/')
                  }}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white transition-all duration-300"
                  title="تسجيل الخروج"
                >
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <a
                href={loginHref}
                onMouseDown={(event) => event.preventDefault()}
                onClick={(event) => {
                  if (onLoginClick) return onLoginClick(event)
                  goTo(loginHref, event)
                }}
                className="inline-flex select-none items-center rounded-full border border-[#b4d3f8]/22 bg-[#b4d3f8]/12 px-5 py-2.5 text-sm font-bold text-white transition-all duration-300 hover:scale-105 hover:bg-[#b4d3f8]/24 focus:outline-none"
              >
                {loginLabel}
              </a>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        <div className="flex items-center justify-between md:hidden">
          <div className="flex items-center gap-2">
            <Link to="/" className="inline-flex items-center focus:outline-none">
              <img
                src={logoSrc}
                alt={logoAlt}
                className="h-14 w-14 object-contain drop-shadow-[0_6px_16px_rgba(56,189,248,0.35)]"
              />
            </Link>
          </div>

          <div className="flex items-center gap-3">
            {user && (
              <button
                onClick={() => navigate('/my-bookings')}
                className="relative h-10 w-10 flex items-center justify-center rounded-xl border border-white/20 bg-white/10 text-white transition duration-300 hover:bg-white/20 focus:outline-none"
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 h-4 w-4 flex items-center justify-center rounded-full bg-red-500 text-[9px] font-black text-white ring-1 ring-[#0f172a]">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
            )}
            <button
              type="button"
              aria-expanded={isMenuOpen}
              aria-label="فتح قائمة التنقل"
              onClick={() => setIsMenuOpen((current) => !current)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/20 bg-white/10 text-white transition duration-300 hover:bg-white/20 focus:outline-none"
            >
              <span className="relative block h-4 w-5">
                <span
                  className={`absolute right-0 top-0 h-[2px] w-5 rounded bg-white transition duration-300 ${isMenuOpen ? 'translate-y-[7px] rotate-45' : ''}`}
                />
                <span
                  className={`absolute right-0 top-[7px] h-[2px] w-5 rounded bg-white transition duration-300 ${isMenuOpen ? 'opacity-0' : ''}`}
                />
                <span
                  className={`absolute right-0 top-[14px] h-[2px] w-5 rounded bg-white transition duration-300 ${isMenuOpen ? '-translate-y-[7px] -rotate-45' : ''}`}
                />
              </span>
            </button>
          </div>
        </div>

        <div
          className={`overflow-hidden transition-all duration-300 md:hidden ${isMenuOpen ? 'max-h-80 pt-4 opacity-100' : 'max-h-0 opacity-0'}`}
        >
          <ul className="space-y-1 rounded-xl border border-white/15 bg-white/5 p-3">
            {links.map((item) => (
              <li key={`${item.label}-mobile`}>
                {item.href.startsWith('#') ? (
                  <a
                    href={item.href}
                    onClick={(event) => goTo(item.href, event)}
                    className="block rounded-lg px-3 py-2 text-sm font-semibold text-white/90 transition duration-300 hover:bg-[#b4d3f8]/12 focus:outline-none"
                  >
                    {item.label}
                  </a>
                ) : (
                  <Link
                    to={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    className="block rounded-lg px-3 py-2 text-sm font-semibold text-white/90 transition duration-300 hover:bg-[#b4d3f8]/12 focus:outline-none"
                  >
                    {item.label}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </header>
  )
}

export default Navbar
