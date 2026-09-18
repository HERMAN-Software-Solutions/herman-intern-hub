import { forwardRef } from 'react'

export interface LabelProps
  extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean
  htmlFor?: string
}

export const Label = forwardRef<HTMLLabelElement, LabelProps>(
  function Label(
    { required, className = '', children, ...props },
    ref
  ) {
    return (
      <label
        ref={ref}
        className={`block text-sm font-medium text-slate-700 mb-1.5 ${className}`}
        {...props}
      >
        {children}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
    )
  }
)