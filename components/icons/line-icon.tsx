import type React from "react"

interface LineIconProps extends React.SVGProps<SVGSVGElement> {
  bgColor?: string
  iconColor?: string
}

export function LineIcon({ bgColor = "white", iconColor = "#776B5D", ...props }: LineIconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" {...props}>
      <rect x="2" y="2" width="20" height="20" rx="4" fill={bgColor} />
      <path
        fill={iconColor}
        d="M19.3 10.7c0-3.2-3.2-5.8-7.2-5.8s-7.2 2.6-7.2 5.8c0 2.9 2.6 5.3 6 5.8.3 0 .7.2.7.4s0 .4 0 .5c0 0-.1.5-.1.6-.1.2-.3.7.6.4 3.2-1.7 5.4-3.9 6.2-5.7.2-.4.2-.8 0-1.2z"
      />
    </svg>
  )
}
