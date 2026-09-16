const STEPS = [
  { key: 'profile', label: 'Profile' },
  { key: 'tech-stack', label: 'Tech stack' },
  { key: 'pending', label: 'Mentor' },
]

export function OnboardingProgress({ current }: { current: string }) {
  const currentIndex = STEPS.findIndex((s) => s.key === current)

  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {STEPS.map((step, i) => {
        const done = i < currentIndex
        const active = i === currentIndex
        return (
          <div key={step.key} className="flex items-center gap-2">
            <div
              className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-semibold transition-colors ${
                done
                  ? 'bg-green-600 text-white'
                  : active
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-200 text-slate-500'
              }`}
            >
              {done ? '✓' : i + 1}
            </div>
            <span
              className={`text-sm ${
                active
                  ? 'text-slate-900 font-medium'
                  : done
                    ? 'text-slate-600'
                    : 'text-slate-400'
              }`}
            >
              {step.label}
            </span>
            {i < STEPS.length - 1 && (
              <div
                className={`w-8 h-0.5 ${
                  done ? 'bg-green-600' : 'bg-slate-200'
                }`}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}