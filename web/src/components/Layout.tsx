import { Outlet } from 'react-router'
import Clock from './Clock'
import Sidebar from './Sidebar'
import { useNow } from '../hooks/useNow'
import './Layout.css'

/**
 * The persistent app shell: sidebar and top bar live here, so they survive
 * navigation. Used as the parent route element, with pages rendered into the
 * <Outlet /> below.
 */
function Layout() {
  const now = useNow()

  return (
    <div className="app">
      <Sidebar />

      <div className="main">
        <header className="topbar">
          <Clock now={now} />
        </header>

        <div className="content">
          <Outlet />
        </div>
      </div>
    </div>
  )
}

export default Layout
