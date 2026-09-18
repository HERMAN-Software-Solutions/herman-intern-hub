import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { PageHeader } from '@/components/ui/page-header'
import { ProjectForm } from './project-form'

export const metadata = { title: 'New Project — HERMAN Admin' }

export default function NewProjectPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-3xl">
      <Link
        href="/admin/projects"
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 transition-colors mb-6"
      >
        <ChevronLeft className="w-4 h-4" />
        Back to projects
      </Link>

      <PageHeader
        title="New project"
        description="Create a project and assign interns to it."
      />

      <ProjectForm />
    </div>
  )
}