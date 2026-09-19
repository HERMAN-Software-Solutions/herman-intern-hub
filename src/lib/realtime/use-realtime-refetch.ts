'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type RealtimeEvent = 'INSERT' | 'UPDATE' | 'DELETE' | '*'

/**
 * Subscribes to Postgres changes on a Supabase table and calls
 * `router.refresh()` whenever the matching event fires.
 *
 * RLS still applies — users only receive events for rows
 * their policies allow them to SELECT.
 *
 * @example
 *   useRealtimeRefetch({ table: 'tasks', event: 'INSERT', filter: `assigned_to=eq.${userId}` })
 */
export function useRealtimeRefetch({
  table,
  event = '*',
  schema = 'public',
  filter,
  channelName,
  debounceMs = 300,
}: {
  table: string
  event?: RealtimeEvent
  schema?: string
  filter?: string
  channelName?: string
  debounceMs?: number
}) {
  const router = useRouter()
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const supabase = createClient()
    const channelId =
      channelName ?? `${table}-${event}-${filter ?? 'all'}-${Math.random().toString(36).slice(2, 8)}`

    const channel = supabase
      .channel(channelId)
      .on(
        'postgres_changes',
        {
          event,
          schema,
          table,
          ...(filter ? { filter } : {}),
        },
        () => {
          // Coalesce rapid events into a single refresh
          if (timeoutRef.current) clearTimeout(timeoutRef.current)
          timeoutRef.current = setTimeout(() => {
            router.refresh()
          }, debounceMs)
        }
      )
      .subscribe()

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      supabase.removeChannel(channel)
    }
  }, [table, event, schema, filter, channelName, debounceMs, router])
}