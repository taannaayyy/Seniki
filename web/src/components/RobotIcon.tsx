type RobotIconProps = {
  className?: string
}

/** Mini line-art robot. Inherits size and colour from its container. */
function RobotIcon({ className }: RobotIconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <g
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* antenna */}
        <path d="M12 3.1v2.4" />
        {/* head */}
        <rect x="3.75" y="5.5" width="16.5" height="12.25" rx="3.5" />
        {/* ears */}
        <path d="M1.75 10.9v2.6M22.25 10.9v2.6" />
        {/* mouth */}
        <path d="M9.75 14.7h4.5" />
      </g>
      <circle cx="12" cy="2" r="1.15" fill="currentColor" />
      <circle cx="9" cy="11" r="1.3" fill="currentColor" />
      <circle cx="15" cy="11" r="1.3" fill="currentColor" />
    </svg>
  )
}

export default RobotIcon
