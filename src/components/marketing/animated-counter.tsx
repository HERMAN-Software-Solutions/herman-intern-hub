'use client'

import { useEffect, useRef, useState } from 'react'

export function AnimatedCounter({
  to,
  duration = 1800,
  suffix = '',
  prefix = '',
  className = '',
  style,
}: {
  to: number
  duration?: number
  suffix?: string
  prefix?: string
  className?: string
  style?: React.CSSProperties
}) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const [started, setStarted] = useState(false)

  // Start when element scrolls into view
  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !started) {
          setStarted(true)
        }
      },
      { threshold: 0.3 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [started])

  // Animate
  useEffect(() => {
    if (!started) return

    // Respect reduced motion
    const prefersReduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches
    if (prefersReduced) {
      setCount(to)
      return
    }

    const start = performance.now()
    let raf: number

    function tick(now: number) {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      // Ease-out cubic for a nice deceleration
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.round(eased * to))

      if (progress < 1) {
        raf = requestAnimationFrame(tick)
      }
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [started, to, duration])

  return (
    <span ref={ref} className={className} style={style}>
      {prefix}
      {count}
      {suffix}
    </span>
  )
}