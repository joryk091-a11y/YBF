import { Outlet } from 'react-router-dom'
import Navbar from '../components/Navbar.jsx'
import Footer from '../components/Footer.jsx'

function MainLayout() {
  return (
    <div className="app-shell min-h-screen text-slate-900" dir="rtl">
      <Navbar />
      <Outlet />
      <Footer />
    </div>
  )
}

export default MainLayout
