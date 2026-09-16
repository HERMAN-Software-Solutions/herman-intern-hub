import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { OnboardingProgress } from '../_components/progress'
import { TechForm } from './tech-form'

export const metadata = {
  title: 'Your tech stack — HERMAN Intern Hub',
}

export default async function TechStackStep() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('status')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/login')
  if (profile.status === 'active') redirect('/dashboard')

  const { data: techStacks } = await supabase
    .from('tech_stacks')
    .select('id, name, category')
    .eq('is_active', true)
    .order('category')
    .order('name')

  const { data: existing } = await supabase
    .from('intern_tech_stacks')
    .select('tech_stack_id, proficiency, is_primary')
    .eq('intern_id', user.id)

  const initialSelections: Record<
    string,
    { proficiency: string; is_primary: boolean }
  > = {}
  for (const row of existing ?? []) {
    initialSelections[row.tech_stack_id] = {
      proficiency: row.proficiency,
      is_primary: row.is_primary,
    }
  }

  return (
    <div>
      <OnboardingProgress current="tech-stack" />

      <h2 className="text-xl font-bold text-slate-900 mb-1">
        Choose your tech stack
      </h2>
      <p className="text-sm text-slate-500 mb-6">
        Pick the technologies you want to focus on. You can change these later.
      </p>

      <TechForm
        techStacks={techStacks ?? []}
        initialSelections={initialSelections}
      />
    </div>
  )
}