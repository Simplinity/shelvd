import { ReactNode } from 'react'

type AlertVariant = 'error' | 'success' | 'warning' | 'info'

interface AlertProps {
  variant?: AlertVariant
  children: ReactNode
  className?: string
}

const Alert = ({ variant = 'info', children, className = '' }: AlertProps) => {
  const variants: Record<AlertVariant, string> = {
    error: 'bg-red-50 border-swiss-red text-swiss-red',
    success: 'bg-green-50 border-green-600 text-green-700',
    warning: 'bg-yellow-50 border-yellow-600 text-yellow-700',
    info: 'bg-gray-50 border-gray-600 text-gray-700',
  }

  return (
    <div
      role="alert"
      className={`
        px-4 py-3
        border-l-4
        text-small
        ${variants[variant]}
        ${className}
      `}
    >
      {children}
    </div>
  )
}

export { Alert }
export type { AlertProps }
