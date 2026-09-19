'use client'

import { useRealtimeRefetch } from '@/lib/realtime/use-realtime-refetch'

/**
 * Mounts a Supabase Realtime subscription that auto-refreshes
 * the tasks list whenever a new task is assigned to this user.
 *
 * Renders nothing — it's a side-effect-only component.
 */
export function TasksRealtimeRefresher({ userId }: { userId: string }) {
  useRealtimeRefetch({
    table: 'tasks',
    event: 'INSERT',
    filter: `assigned_to=eq.${userId}`,
  })

  useRealtimeRefetch({
    table: 'tasks',
    event: 'UPDATE',
    filter: `assigned_to=eq.${userId}`,
  })

  return null
}