export type WeeklyReportData = {
  internName: string
  internEmail: string
  mentorName: string | null
  weekStart: string // ISO date (Monday)
  weekEnd: string   // ISO date (Sunday)
  totalHours: number
  daysLogged: number
  daysInWeek: number
  tasksCompletedThisWeek: number
  submissionsThisWeek: number
  highlights: string[]     // top accomplishments
  dailyEntries: {
    date: string
    hours: number
    description: string
  }[]
  internId: string
}