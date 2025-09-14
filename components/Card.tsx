import type { ReactNode } from "react"

interface CardProps {
  title: string
  children: ReactNode
  className?: string
}

export function Card({ title, children, className = "" }: CardProps) {
  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      </div>
      <div className="p-4 h-full">{children}</div>
    </div>
  )
}
