import { forwardRef } from 'react'
import { Label } from './label'

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string | null
  hint?: string
  required?: boolean
  fullWidth?: boolean
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  function Input(
    {
      label,
      error,
      hint,
      required,
      fullWidth = true,
      id,
      className = '',
      ...props
    },
    ref
  ) {
    const inputId = id || props.name

    return (
      <div className={fullWidth ? 'w-full' : ''}>
        {label && (
          <Label htmlFor={inputId} required={required}>
            {label}
          </Label>
        )}

        <input
          ref={ref}
          id={inputId}
          className={`
            w-full px-3.5 py-2.5 text-sm
            border rounded-lg
            bg-white text-slate-900
            placeholder:text-slate-400
            transition-colors
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
          {...props}
        />

        {error ? (
          <p className="text-xs text-red-600 mt-1.5">{error}</p>
        ) : hint ? (
          <p className="text-xs text-slate-500 mt-1.5">{hint}</p>
        ) : null}
      </div>
    )
  }
)