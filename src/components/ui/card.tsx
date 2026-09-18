import { forwardRef } from 'react'

type CardPadding = 'none' | 'sm' | 'md' | 'lg'

const PADDING: Record<CardPadding, string> = {
  none: '',
  sm: 'p-4',
  md: 'p-5 sm:p-6',
  lg: 'p-6 sm:p-8',
}

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  padding?: CardPadding
  hover?: boolean
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  function Card(
    { padding = 'md', hover = false, className = '', children, ...props },
    ref
  ) {
    return (
      <div
        ref={ref}
        className={`
          bg-white border border-slate-200 rounded-xl
          ${PADDING[padding]}
          ${
            hover
              ? 'transition-all duration-200 hover:border-slate-400 hover:shadow-md'
              : ''
          }
          ${className}
        `}
        {...props}
      >
        {children}
      </div>
    )
  }
)

// Optional sub-components for structured cards
export function CardHeader({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={`mb-4 ${className}`}>{children}</div>
  )
}

export function CardTitle({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <h3 className={`text-base sm:text-lg font-semibold text-slate-900 ${className}`}>
      {children}
    </h3>
  )
}

export function CardDescription({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <p className={`text-sm text-slate-500 mt-1 ${className}`}>{children}</p>
  )
}

export function CardContent({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) {
  return <div className={className}>{children}</div>
}

export function CardFooter({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={`mt-4 pt-4 border-t border-slate-100 ${className}`}>
      {children}
    </div>
  )
}