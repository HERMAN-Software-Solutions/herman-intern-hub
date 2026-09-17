import Link from 'next/link'
import Image from 'next/image'

export function Logo({
  href = '/',
  size = 'md',
}: {
  href?: string
  size?: 'sm' | 'md'
}) {
  const dims = size === 'sm' ? 'h-6 w-6' : 'h-8 w-8'
  const text = size === 'sm' ? 'text-base' : 'text-lg'

  return (
    <Link href={href} className="flex items-center gap-2.5 group">
      <Image
       src="/brand/logo.png"
       alt="HERMAN Intern Hub"
       width={40}
       height={40}
       className={`${dims} rounded object-contain`}
      />
      <span
        className={`${text} font-bold text-slate-900 tracking-tight group-hover:text-slate-700 transition-colors`}
      >
        HERMAN Intern Hub
      </span>
    </Link>
  )
}