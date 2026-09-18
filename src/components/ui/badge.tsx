type Variant =
  | 'default'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'neutral'

type Size = 'sm' | 'md'

const VARIANTS: Record<Variant, string> = {
  default: 'bg-slate-100 text-slate-700',
  success: 'bg-green-100 text-green-800',
  warning: 'bg-amber-100 text-amber-800',
  danger: 'bg-red-100 text-red-800',
  info: 'bg-blue-100 text-blue-800',
  neutral: 'bg-slate-100 text-slate-600',
}

const SIZES: Record<Size, string> = {
  sm: 'text-[10px] px-2 py-0.5',
  md: 'text-xs px-2.5 py-1',
}

export function Badge({
  children,
  variant = 'default',
  size = 'md',
  className = '',
}: {
  children: React.ReactNode
  variant?: Variant
  size?: Size
  className?: string
}) {
  return (
    <span
      className={`
        inline-flex items-center font-medium rounded-full
        ${VARIANTS[variant]}
        ${SIZES[size]}
        ${className}
      `}
    >
      {children}
    </span>
  )
}