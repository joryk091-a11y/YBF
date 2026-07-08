import { useMemo, useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Bell, LogOut, UserRound, CheckCheck, BellRing, Ticket, Plane, Clock, CreditCard, XCircle, X } from 'lucide-react'
import defaultLogo from '../assets/logo.png'

const defaultNavItems = [
  { label: 'الرئيسية', href: '/' },
  { label: 'الوجهات', href: '/search' },
  { label: 'حجوزاتي', href: '/my-bookings' },
  { label: 'الشروط والأحكام', href: '/terms' },
]

const typeConfig = {
  booking: { color: 'bg-blue-500', label: 'حجز', icon: Plane },
  reminder: { color: 'bg-amber-500', label: 'تذكير', icon: Clock },
  payment: { color: 'bg-emerald-500', label: 'دفع', icon: CreditCard },
  cancellation: { color: 'bg-red-500', label: 'إلغاء', icon: XCircle },
  general: { color: 'bg-slate-400', label: 'عام', icon: Bell },
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
    return d.toLocaleDateString('ar-EG-u-nu-latn', { month: 'short', day: 'numeric' })
  }

  return (
    <div className="absolute left-0 top-14 z-50 w-96 overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white shadow-[0_20px_50px_rgba(0,0,0,0.1)] animate-in fade-in slide-in-from-top-2 duration-200" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 bg-slate-50/50">
        <div className="flex items-center gap-2">
          <BellRing className="h-4 w-4 text-blue-500" />
          <span className="text-sm font-black text-slate-900">الإشعارات</span>
          {unread > 0 && (
            <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-blue-500 px-1.5 text-[10px] font-black text-white">
              {unread}
            </span>
          )}
        </div>
        {unread > 0 && (
          <button
            onClick={markAllRead}
            className="flex items-center gap-1.5 text-[11px] font-black text-blue-500 hover:text-blue-600 hover:underline"
          >
            <CheckCheck className="h-3.5 w-3.5" />
            تحديد الكل كمقروء
          </button>
        )}
      </div>

      {/* List */}
      <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-100">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-14">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-55">
              <Bell className="h-7 w-7 text-slate-300" />
            </div>
            <p className="text-sm font-bold text-slate-450">لا توجد إشعارات</p>
          </div>
        ) : (
          notifications.map(n => {
            const tc = typeConfig[n.type] || typeConfig.general
            return (
              <div
                key={n.id_notifications}
                className={`group relative flex w-full gap-4 p-5 text-right transition-colors hover:bg-slate-50/60 ${!n.is_read ? 'bg-blue-500/[0.03]' : ''}`}
              >
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

                {!n.is_read && (
                  <div className="absolute left-8 top-1/2 -translate-y-1/2 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />
                )}

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
      <div className="border-t border-slate-100 px-5 py-3 bg-slate-50/50">
        <Link
          to="/my-bookings"
          onClick={onClose}
          className="block text-center text-[11px] font-black text-blue-500 hover:text-blue-600 hover:underline"
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
        .catch(() => { })
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
    <header className="fixed top-0 inset-x-0 z-50 w-full px-4 pt-4 sm:px-6 lg:px-8 transition-all duration-300" dir="rtl">
      <div className="mx-auto max-w-7xl">
        <nav className="backdrop-blur-xl bg-white/85 dark:bg-slate-900/80 border border-slate-200/50 dark:border-slate-800/40 rounded-[2rem] px-6 py-2.5 text-slate-850 dark:text-slate-200 shadow-[0_10px_35px_rgba(0,0,0,0.08)] transition-all duration-300">
          {/* Desktop Menu */}
          <div className="relative hidden md:flex md:items-center md:justify-between">
            <div className="flex items-center justify-end gap-3.5">
              <Link to="/" className="inline-flex items-center focus:outline-none">
                <img
                  src={logoSrc}
                  alt={logoAlt}
                  className="h-14 w-14 object-contain brightness-0 dark:brightness-0 dark:invert transition-transform duration-300 hover:scale-105"
                />
              </Link>
              <div className="hidden flex-col justify-center lg:flex">
                <span className="font-brand text-[13px] font-black tracking-wide text-slate-800 dark:text-slate-100">
                  Yemen Booking Flight
                </span>
                <span className="mt-0.5 text-[10px] font-bold tracking-wide text-slate-450 dark:text-slate-400">
                  حجز رحلات اليمن
                </span>
              </div>
            </div>

            <div className="absolute left-1/2 -translate-x-1/2">
              <ul className="flex items-center gap-6">
                {links.map((item) => {
                  const isActive = location.pathname === item.href || (item.href.startsWith('#') && location.pathname === '/');
                  return (
                    <li key={item.label}>
                      {item.href.startsWith('#') ? (
                        <a
                          href={item.href}
                          onClick={(event) => goTo(item.href, event)}
                          className={`group relative inline-flex select-none py-1.5 px-3.5 text-xs font-black transition-all duration-300 rounded-xl ${isActive
                              ? 'text-blue-500 bg-blue-500/5 dark:bg-blue-500/10'
                              : 'text-slate-650 dark:text-slate-300 hover:text-blue-500 dark:hover:text-blue-400'
                            } focus:outline-none`}
                        >
                          {item.label}
                          <span className={`pointer-events-none absolute -bottom-0.5 left-1/2 h-[2px] w-0 -translate-x-1/2 rounded-full bg-gradient-to-r from-blue-600 to-indigo-500 transition-all duration-300 group-hover:w-1/2 ${isActive ? 'w-1/2' : ''}`} />
                        </a>
                      ) : (
                        <Link
                          to={item.href}
                          state={item.label === 'الوجهات' ? { showAll: true } : undefined}
                          className={`group relative inline-flex select-none py-1.5 px-3.5 text-xs font-black transition-all duration-300 rounded-xl ${location.pathname === item.href
                              ? 'text-blue-500 bg-blue-500/5 dark:bg-blue-500/10'
                              : 'text-slate-655 dark:text-slate-300 hover:text-blue-500 dark:hover:text-blue-400'
                            } focus:outline-none`}
                        >
                          {item.label}
                          <span className={`pointer-events-none absolute -bottom-0.5 left-1/2 h-[2px] w-0 -translate-x-1/2 rounded-full bg-gradient-to-r from-blue-600 to-indigo-500 transition-all duration-300 group-hover:w-1/2 ${location.pathname === item.href ? 'w-1/2' : ''}`} />
                        </Link>
                      )}
                    </li>
                  )
                })}
              </ul>
            </div>

            <div className="flex items-center justify-start gap-3">
              {/* Bell Button with Dropdown */}
              {user && (
                <div ref={bellRef} className="relative flex items-center">
                  <button
                    onClick={() => setShowNotifications(v => !v)}
                    className="relative flex items-center justify-center p-2 text-slate-600 hover:text-blue-500 hover:scale-105 transition-all duration-300 cursor-pointer focus:outline-none"
                  >
                    <Bell size={20} />
                    {unreadCount > 0 && (
                      <span className="absolute top-1.5 right-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[8px] font-black text-white ring-1 ring-white animate-bounce">
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
                  <div className="flex items-center gap-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 px-4 py-2">
                    <UserRound size={16} className="text-blue-600" />
                    <span className="text-xs font-black text-blue-700">
                      {user.fullName?.split(' ')[0]}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      localStorage.removeItem('user')
                      setUser(null)
                      navigate('/')
                    }}
                    className="h-10 w-10 flex items-center justify-center text-slate-500 hover:text-red-500 hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer focus:outline-none"
                    title="تسجيل الخروج"
                  >
                    <LogOut size={16} />
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
                  className="inline-flex select-none items-center rounded-xl bg-blue-600 hover:bg-blue-500 px-5 py-2.5 text-xs font-black text-white shadow-lg shadow-blue-600/15 transition-all duration-300 hover:scale-105 hover:bg-blue-500/90 active:scale-95"
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
                  className="h-12 w-12 object-contain brightness-0 dark:brightness-0 dark:invert"
                />
              </Link>
            </div>

            <div className="flex items-center gap-2.5">
              {user && (
                <button
                  onClick={() => navigate('/my-bookings')}
                  className="relative flex items-center justify-center p-1.5 text-slate-650 hover:text-blue-500 transition duration-300 focus:outline-none cursor-pointer"
                >
                  <Bell size={18} />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 h-3.5 w-3.5 flex items-center justify-center rounded-full bg-red-500 text-[7px] font-black text-white ring-1 ring-white">
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
                className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200/50 dark:border-slate-800/50 bg-slate-50 dark:bg-slate-800 text-slate-650 dark:text-slate-300 transition duration-300 hover:bg-slate-100 dark:hover:bg-slate-700 focus:outline-none cursor-pointer"
              >
                <span className="relative block h-3.5 w-4">
                  <span
                    className={`absolute right-0 top-0 h-[2px] w-4 rounded bg-slate-700 dark:bg-slate-300 transition duration-300 ${isMenuOpen ? 'translate-y-[6px] rotate-45' : ''}`}
                  />
                  <span
                    className={`absolute right-0 top-[6px] h-[2px] w-4 rounded bg-slate-700 dark:bg-slate-300 transition duration-300 ${isMenuOpen ? 'opacity-0' : ''}`}
                  />
                  <span
                    className={`absolute right-0 top-[12px] h-[2px] w-4 rounded bg-slate-700 dark:bg-slate-300 transition duration-300 ${isMenuOpen ? '-translate-y-[6px] -rotate-45' : ''}`}
                  />
                </span>
              </button>
            </div>
          </div>

          {/* Mobile Menu Dropdown */}
          <div
            className={`overflow-hidden transition-all duration-300 md:hidden ${isMenuOpen ? 'max-h-96 pt-4 opacity-100' : 'max-h-0 opacity-0'}`}
          >
            <ul className="space-y-1.5 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 bg-white/90 dark:bg-slate-900/95 backdrop-blur-md p-3 shadow-lg">
              {links.map((item) => (
                <li key={`${item.label}-mobile`}>
                  {item.href.startsWith('#') ? (
                    <a
                      href={item.href}
                      onClick={(event) => goTo(item.href, event)}
                      className="block rounded-xl px-4 py-2.5 text-xs font-black text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-850 hover:text-blue-500 transition duration-300 focus:outline-none"
                    >
                      {item.label}
                    </a>
                  ) : (
                    <Link
                      to={item.href}
                      state={item.label === 'الوجهات' ? { showAll: true } : undefined}
                      onClick={() => setIsMenuOpen(false)}
                      className="block rounded-xl px-4 py-2.5 text-xs font-black text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-850 hover:text-blue-500 transition duration-300 focus:outline-none"
                    >
                      {item.label}
                    </Link>
                  )}
                </li>
              ))}

              {/* Login/Logout in Mobile Menu */}
              <li className="pt-2 border-t border-slate-100">
                {user ? (
                  <div className="flex items-center justify-between px-4 py-2">
                    <span className="text-xs font-black text-slate-800">
                      مرحباً، {user.fullName?.split(' ')[0]}
                    </span>
                    <button
                      onClick={() => {
                        localStorage.removeItem('user')
                        setUser(null)
                        navigate('/')
                      }}
                      className="text-xs font-black text-red-500 hover:underline cursor-pointer"
                    >
                      تسجيل الخروج
                    </button>
                  </div>
                ) : (
                  <Link
                    to={loginHref}
                    onClick={() => setIsMenuOpen(false)}
                    className="block text-center rounded-xl bg-blue-500 py-2.5 text-xs font-black text-white hover:bg-blue-600 transition-colors duration-300 focus:outline-none"
                  >
                    {loginLabel}
                  </Link>
                )}
              </li>
            </ul>
          </div>
        </nav>
      </div>
    </header>
  )
}

export default Navbar
