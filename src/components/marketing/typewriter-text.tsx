'use client'

import { useEffect, useState } from 'react'

export function TypewriterText({
  text,
  typingSpeed = 150,
  deletingSpeed = 100,
  pauseTime = 2000,
  className = '',
  style,
}: {
  text: string
  typingSpeed?: number
  deletingSpeed?: number
  pauseTime?: number
  className?: string
  style?: React.CSSProperties
}) {
  const [displayed, setDisplayed] = useState('')
  const [phase, setPhase] = useState<'typing' | 'paused' | 'deleting'>('typing')

  useEffect(() => {
    let timer: NodeJS.Timeout

    if (phase === 'typing') {
      if (displayed.length < text.length) {
        timer = setTimeout(() => {
          setDisplayed(text.slice(0, displayed.length + 1))
        }, typingSpeed)
      } else {
        // Fully typed, wait then delete
        timer = setTimeout(() => {
          setPhase('paused')
        }, pauseTime)
      }
    } else if (phase === 'paused') {
      // Small pause then start deleting
      timer = setTimeout(() => {
        setPhase('deleting')
      }, 300)
    } else if (phase === 'deleting') {
      if (displayed.length > 0) {
        timer = setTimeout(() => {
          setDisplayed(text.slice(0, displayed.length - 1))
        }, deletingSpeed)
      } else {
        // Fully deleted, restart typing
        timer = setTimeout(() => {
          setPhase('typing')
        }, 400)
      }
    }

    return () => clearTimeout(timer)
  }, [displayed, phase, text, typingSpeed, deletingSpeed, pauseTime])

  return (
    <span className={className} style={style}>
      {displayed}
    </span>
  )
}