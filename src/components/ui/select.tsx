import { forwardRef } from 'react'
import { ChevronDown } from 'lucide-react'
import { Label } from './label'

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string | null
  hint?: string
  required?: boolean
  fullWidth?: boolean
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  function Select(
    {
      label,
      error,
      hint,
      required,
      fullWidth = true,
      id,
      className = '',
      children,
      ...props
    },
    ref
  ) {
    const selectId = id || props.name
    const errorId = `${selectId}-error`
    const hintId = `${selectId}-hint`

    const describedBy = error ? errorId : hint ? hintId : undefined

    return (
      <div className={fullWidth ? 'w-full' : ''}>
        {label && (
          <Label htmlFor={selectId} required={required}>
            {label}
          </Label>
        )}

        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            className={`
              w-full px-3.5 py-2.5 pr-10 text-sm
              border rounded-lg
              bg-white text-slate-900
              transition-colors
              appearance-none
              focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900
              disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed
              ${
                error
                  ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                  : 'border-slate-300'
              }
              ${className}
            `}
            aria-invalid={error ? 'true' : undefined}
            aria-describedby={describedBy}
            {...props}
          >
            {children}
          </select>
          <ChevronDown
            aria-hidden="true"
            className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none"
          />
        </div>

        {error ? (
          <p
            id={errorId}
            role="alert"
            className="text-xs text-red-600 mt-1.5"
          >
            {error}
          </p>
        ) : hint ? (
          <p id={hintId} className="text-xs text-slate-500 mt-1.5">
            {hint}
          </p>
        ) : null}
      </div>
    )
  }
)