import { forwardRef } from 'react'
import { Loader2 } from 'lucide-react'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success'
type Size = 'sm' | 'md' | 'lg'

const VARIANTS: Record<Variant, string> = {
  primary:
    'bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-white shadow-sm',
  secondary:
    'bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-700 border border-slate-300 hover:border-slate-400',
  ghost:
    'bg-transparent hover:bg-slate-100 active:bg-slate-200 text-slate-700',
  danger:
    'bg-red-600 hover:bg-red-700 active:bg-red-800 text-white shadow-sm',
  success:
    'bg-green-600 hover:bg-green-700 active:bg-green-800 text-white shadow-sm',
}

const SIZES: Record<Size, string> = {
  sm: 'text-xs px-3 py-1.5 gap-1.5 rounded-md',
  md: 'text-sm px-4 py-2.5 gap-2 rounded-lg',
  lg: 'text-base px-6 py-3 gap-2 rounded-lg',
}

const DISABLED =
  'disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none'

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  loading?: boolean
  fullWidth?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      fullWidth = false,
      disabled,
      className = '',
      children,
      ...props
    },
    ref
  ) {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={`
          inline-flex items-center justify-center font-medium
          transition-all duration-150
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2
          ${VARIANTS[variant]}
          ${SIZES[size]}
          ${DISABLED}
          ${fullWidth ? 'w-full' : ''}
          ${className}
        `}
        {...props}
      >
        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
        {children}
      </button>
    )
  }
)