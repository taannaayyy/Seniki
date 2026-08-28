import { useState } from 'react'
import { NavLink } from 'react-router'
import { MoonIcon, PanelIcon, SunIcon } from './NavIcons'
import RobotIcon from './RobotIcon'
import { useMediaQuery } from '../hooks/useMediaQuery'
import { useTheme } from '../hooks/useTheme'
import { USER_NAME } from '../lib/user'
import { NAV_ITEMS } from '../navigation'
import './Sidebar.css'

function Sidebar() {
  const { theme, toggle } = useTheme()
  const nextTheme = theme === 'dark' ? 'Day mode' : 'Dark mode'

  // Collapse follows the viewport until the user decides for themselves,
  // after which their choice wins at any width.
  const isNarrow = useMediaQuery('(max-width: 768px)')
  const [collapseOverride, setCollapseOverride] = useState<boolean | null>(null)
  const collapsed = collapseOverride ?? isNarrow

  return (
    <aside
      className={collapsed ? 'sidebar sidebar-collapsed' : 'sidebar'}
      aria-label="Sidebar"
    >
      <div className="sidebar-brand">
        <RobotIcon className="sidebar-mark" />
        <span className="sidebar-name">Seniki</span>
        <button
          type="button"
          className="icon-button sidebar-toggle"
          onClick={() => setCollapseOverride(!collapsed)}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-expanded={!collapsed}
        >
          <PanelIcon className="icon-button-icon" />
        </button>
      </div>

      <div className="divider nav-divider" aria-hidden="true" />

      <nav className="sidebar-nav" aria-label="Main">
        {NAV_ITEMS.map(({ path, label, Icon }) => (
          <NavLink
            key={path}
            to={path}
            /* A plain string, not the usual isActive callback: the current
               row is styled off the aria-current="page" NavLink already sets
               (see Sidebar.css), so no className function is needed. */
            className="nav-item"
            /* Without `end`, "/" would match every route. */
            end={path === '/'}
            /* Surfaces the label when the rail is collapsed on narrow screens */
            title={label}
          >
            <Icon className="nav-icon" />
            <span className="nav-label">{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="divider footer-divider" aria-hidden="true" />

        <button type="button" className="account" title={USER_NAME}>
          <span className="account-avatar" aria-hidden="true">
            {USER_NAME.slice(0, 1)}
          </span>
          <span className="account-name">{USER_NAME}</span>
          <svg className="account-chevron" viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M6 9.5l6 6 6-6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        <button
          type="button"
          className="icon-button theme-toggle"
          onClick={toggle}
          title={nextTheme}
          /* Icon-only, so the label lives here instead of in the markup. */
          aria-label={nextTheme}
          aria-pressed={theme === 'dark'}
        >
          {theme === 'dark' ? (
            <SunIcon className="icon-button-icon" />
          ) : (
            <MoonIcon className="icon-button-icon" />
          )}
        </button>
      </div>
    </aside>
  )
}

export default Sidebar
