import { isValid, parseISO } from 'date-fns'
import { ChallengeData } from '../types'

export interface ValidationResult {
  isValid: boolean
  data: ChallengeData | null
  errors: string[]
}

export function isValidDateString(dateStr: string): boolean {
  if (!dateStr) return false
  const date = parseISO(dateStr)
  return isValid(date)
}

export function validateCompletedDay(date: string, startDate: string, totalDays: number): boolean {
  if (!isValidDateString(date) || !isValidDateString(startDate)) return false
  
  const completedDate = parseISO(date)
  const start = parseISO(startDate)
  const dayDifference = Math.floor((completedDate.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
  
  return dayDifference >= 0 && dayDifference < totalDays
}

export function validateChallengeData(data: unknown): ValidationResult {
  const errors: string[] = []
  let sanitizedData: ChallengeData | null = null

  try {
    // Check if data is null or undefined
    if (!data || typeof data !== 'object') {
      errors.push('No challenge data found')
      return { isValid: false, data: null, errors }
    }

    const challengeData = data as any

    // Validate required fields
    const requiredFields = ['days', 'startDate', 'userName', 'completedDays', 'notes', 'lastLoggedDate']
    for (const field of requiredFields) {
      if (!(field in challengeData)) {
        errors.push(`Missing required field: ${field}`)
      }
    }

    // Validate data types and ranges
    if (typeof challengeData.days !== 'number' || challengeData.days < 10 || challengeData.days > 365) {
      errors.push('Invalid challenge duration')
      challengeData.days = Math.max(10, Math.min(365, challengeData.days || 10))
    }

    if (typeof challengeData.startDate !== 'string' || !isValidDateString(challengeData.startDate)) {
      errors.push('Invalid start date')
      challengeData.startDate = new Date().toISOString().split('T')[0]
    }

    if (typeof challengeData.userName !== 'string' || challengeData.userName.trim().length === 0) {
      errors.push('Invalid user name')
      challengeData.userName = 'Anonymous'
    }

    if (!Array.isArray(challengeData.completedDays)) {
      errors.push('Invalid completed days format')
      challengeData.completedDays = []
    }

    if (typeof challengeData.notes !== 'object' || challengeData.notes === null) {
      errors.push('Invalid notes format')
      challengeData.notes = {}
    }

    // Validate completed days format
    challengeData.completedDays = challengeData.completedDays.filter((day: string) => {
      const isValid = isValidDateString(day)
      if (!isValid) {
        errors.push(`Invalid completed day format: ${day}`)
      }
      return isValid
    })

    // Validate notes format
    const validNotes: Record<string, string> = {}
    Object.entries(challengeData.notes).forEach(([date, note]) => {
      if (isValidDateString(date) && typeof note === 'string') {
        validNotes[date] = note
      } else {
        errors.push(`Invalid note format for date: ${date}`)
      }
    })
    challengeData.notes = validNotes

    // Validate lastLoggedDate
    if (challengeData.lastLoggedDate !== null && 
        (typeof challengeData.lastLoggedDate !== 'string' || !isValidDateString(challengeData.lastLoggedDate))) {
      errors.push('Invalid last logged date')
      challengeData.lastLoggedDate = null
    }

    // Create sanitized data
    sanitizedData = {
      days: challengeData.days,
      startDate: challengeData.startDate,
      userName: challengeData.userName.trim(),
      completedDays: challengeData.completedDays,
      notes: challengeData.notes,
      lastLoggedDate: challengeData.lastLoggedDate
    }

    return {
      isValid: errors.length === 0,
      data: sanitizedData,
      errors
    }
  } catch (error) {
    errors.push(`Unexpected error during validation: ${error instanceof Error ? error.message : String(error)}`)
    return { isValid: false, data: null, errors }
  }
}

export const createInitialChallengeData = (
  days: number,
  startDate: string,
  userName: string
): ChallengeData => {
  return {
    days,
    startDate,
    userName,
    completedDays: [],
    notes: {},
    lastLoggedDate: null
  };
};

export function sanitizeChallengeData(data: ChallengeData): ChallengeData {
  return {
    days: Math.max(10, Math.min(365, data.days)),
    startDate: data.startDate,
    userName: data.userName.trim(),
    completedDays: data.completedDays.filter(day => Date.parse(day)),
    notes: Object.fromEntries(
      Object.entries(data.notes).filter(([date, note]) => 
        Date.parse(date) && typeof note === 'string'
      )
    ),
    lastLoggedDate: data.lastLoggedDate || null
  }
} 