'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { sendApplicationReceived } from '@/lib/email/send'

type ApplicationInput = {
  name: string
  email: string
  phone: string
  university: string
  course: string
  year_of_study: string
  tech_stack_interest: string[]
  portfolio_url: string
  message: string
}

export async function submitApplication(input: ApplicationInput) {
  // Basic validation (server-side, don't trust client)
  if (!input.name?.trim()) return { error: 'Name is required' }
  if (!input.email?.trim()) return { error: 'Email is required' }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email))
    return { error: 'Invalid email' }
  if (!input.university?.trim()) return { error: 'University is required' }
  if (!input.course?.trim()) return { error: 'Course is required' }
  if (!input.year_of_study?.trim()) return { error: 'Year of study is required' }
  if (!input.tech_stack_interest?.length)
    return { error: 'Select at least one tech stack' }
  if (!input.message?.trim() || input.message.trim().length < 20)
    return { error: 'Message must be at least 20 characters' }

  const supabase = createAdminClient()

  // Rate limit — check if this email applied in the last 24 hours
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  const { data: recent } = await supabase
    .from('applications')
    .select('id')
    .eq('email', input.email.toLowerCase())
    .gte('submitted_at', oneDayAgo)
    .limit(1)

  if (recent && recent.length > 0) {
    return {
      error:
        'You have already applied with this email in the last 24 hours. Please wait before applying again.',
    }
  }

  const { error } = await supabase.from('applications').insert({
    name: input.name.trim(),
    email: input.email.toLowerCase().trim(),
    phone: input.phone?.trim() || null,
    university: input.university.trim(),
    course: input.course.trim(),
    year_of_study: input.year_of_study.trim(),
    tech_stack_interest: input.tech_stack_interest,
    portfolio_url: input.portfolio_url?.trim() || null,
    message: input.message.trim(),
    status: 'pending',
  })

  if (error) {
    console.error('Application insert error:', error)
    return { error: 'Something went wrong. Please try again.' }
  }

    // Send confirmation email (fire-and-forget, don't block the response)
  sendApplicationReceived(input.email.toLowerCase().trim(), input.name.trim())
    .then((res) => {
      if (!res.success) {
        console.error('Confirmation email failed:', res.error)
      }
    })

  return { success: true }
}

export async function checkApplicationStatus(email: string) {
  if (!email?.trim()) return { error: 'Email is required' }

  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('applications')
    .select('name, status, submitted_at')
    .eq('email', email.toLowerCase().trim())
    .order('submitted_at', { ascending: false })
    .limit(1)
    .single()

  if (error || !data) {
    return { error: 'No application found with that email.' }
  }

  return { data }
}