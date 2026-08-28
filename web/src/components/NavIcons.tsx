type IconProps = {
  className?: string
}

const shared = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.7,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
}

export function HomeIcon({ className }: IconProps) {
  return (
    <svg className={className} {...shared}>
      <path d="M3.5 10.6 12 4l8.5 6.6V19a1.5 1.5 0 0 1-1.5 1.5H5A1.5 1.5 0 0 1 3.5 19z" />
      <path d="M9.5 20.5v-5.2h5v5.2" />
    </svg>
  )
}

export function CalendarIcon({ className }: IconProps) {
  return (
    <svg className={className} {...shared}>
      <rect x="3.5" y="5.5" width="17" height="15" rx="2.5" />
      <path d="M3.5 10.5h17M8.5 3.5v4M15.5 3.5v4" />
    </svg>
  )
}

export function TodoIcon({ className }: IconProps) {
  return (
    <svg className={className} {...shared}>
      <path d="M4 7.8l2 2 3.6-4M4 16.8l2 2 3.6-4" />
      <path d="M13 7.5h7M13 16.5h7" />
    </svg>
  )
}

export function FinanceIcon({ className }: IconProps) {
  return (
    <svg className={className} {...shared}>
      <rect x="3" y="6" width="18" height="13" rx="2.5" />
      <path d="M3 10.5h18" />
      <path d="M16.5 15h2" />
    </svg>
  )
}

export function HealthIcon({ className }: IconProps) {
  return (
    <svg className={className} {...shared}>
      <path d="M12 20.2C12 20.2 4.5 16 4.5 10.9A3.9 3.9 0 0 1 12 8.6a3.9 3.9 0 0 1 7.5 2.3c0 5.1-7.5 9.3-7.5 9.3z" />
    </svg>
  )
}

export function PeopleIcon({ className }: IconProps) {
  return (
    <svg className={className} {...shared}>
      <circle cx="9.2" cy="8.4" r="3.3" />
      <path d="M3.4 19.6c0-3.1 2.6-5.2 5.8-5.2s5.8 2.1 5.8 5.2" />
      <path d="M16.2 5.6a3.3 3.3 0 0 1 0 5.6" />
      <path d="M17.6 14.8c1.9.6 3 2.4 3 4.8" />
    </svg>
  )
}

export function SunIcon({ className }: IconProps) {
  return (
    <svg className={className} {...shared}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2.6v2.1M12 19.3v2.1M4.2 4.2l1.5 1.5M18.3 18.3l1.5 1.5M2.6 12h2.1M19.3 12h2.1M4.2 19.8l1.5-1.5M18.3 5.7l1.5-1.5" />
    </svg>
  )
}

export function MoonIcon({ className }: IconProps) {
  return (
    <svg className={className} {...shared}>
      <path d="M20.2 14.3A8.4 8.4 0 1 1 9.7 3.8a6.6 6.6 0 0 0 10.5 10.5z" />
    </svg>
  )
}

export function PanelIcon({ className }: IconProps) {
  return (
    <svg className={className} {...shared}>
      <rect x="3.5" y="4.5" width="17" height="15" rx="2.5" />
      <path d="M9.8 4.5v15" />
    </svg>
  )
}
