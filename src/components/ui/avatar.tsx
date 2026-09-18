const SIZES = {
  xs: 'w-6 h-6 text-[10px]',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-14 h-14 text-lg',
  xl: 'w-20 h-20 text-2xl',
}

export function Avatar({
  name,
  src,
  size = 'md',
  className = '',
}: {
  name?: string | null
  src?: string | null
  size?: keyof typeof SIZES
  className?: string
}) {
  const initials = (name ?? '?')
    .trim()
    .split(' ')
    .map((p) => p.charAt(0))
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase()

  if (src) {
    return (
      <img
        src={src}
        alt={name ?? 'Avatar'}
        className={`${SIZES[size]} rounded-full object-cover flex-shrink-0 ${className}`}
      />
    )
  }

  return (
    <div
      className={`
        ${SIZES[size]}
        rounded-full bg-slate-900 text-white
        flex items-center justify-center font-semibold
        flex-shrink-0
        ${className}
      `}
      aria-label={name ?? 'User avatar'}
    >
      {initials}
    </div>
  )
}