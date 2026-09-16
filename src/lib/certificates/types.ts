export type ScoreBreakdown = {
  task_completion_rate: number
  submission_quality_rate: number
  log_consistency_rate: number
  mentor_rating: number | null
  peer_rating: number | null
  tasks_completed: number
  tasks_assigned: number
  submissions_approved_first_try: number
  submissions_total: number
  days_logged: number
  working_days: number
}

export type ScoreResult = {
  score: number          // 0.0 – 5.0
  band: RatingBand
  breakdown: ScoreBreakdown
}

export type RatingBand =
  | 'Excellent'
  | 'Very Good'
  | 'Good'
  | 'Satisfactory'
  | 'Needs Improvement'

export function getRatingBand(score: number): RatingBand {
  if (score >= 4.5) return 'Excellent'
  if (score >= 3.5) return 'Very Good'
  if (score >= 2.5) return 'Good'
  if (score >= 1.5) return 'Satisfactory'
  return 'Needs Improvement'
}

export function getStars(score: number): number {
  return Math.round(score)
}