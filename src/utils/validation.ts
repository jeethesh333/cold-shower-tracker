import { format, isValid, parseISO } from 'date-fns'
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

export function validateChallengeData(data: any): ValidationResult {
  const errors: string[] = []
  let sanitizedData: ChallengeData | null = null

  try {
    // Check if data is null or undefined
    if (!data) {
      errors.push('No challenge data found')
      return { isValid: false, data: null, errors }
    }

    // Validate required fields
    const requiredFields = ['days', 'startDate', 'userName', 'completedDays', 'notes']
    for (const field of requiredFields) {
      if (!(field in data)) {
        errors.push(`Missing required field: ${field}`)
      }
    }

    // Validate data types and ranges
    if (typeof data.days !== 'number' || data.days < 10 || data.days > 365) {
      errors.push('Invalid challenge duration')
      data.days = Math.max(10, Math.min(365, data.days || 10))
    }

    if (typeof data.startDate !== 'string' || !Date.parse(data.startDate)) {
      errors.push('Invalid start date')
      data.startDate = new Date().toISOString()
    }

    if (typeof data.userName !== 'string' || data.userName.trim().length === 0) {
      errors.push('Invalid user name')
      data.userName = 'Anonymous'
    }

    if (!Array.isArray(data.completedDays)) {
      errors.push('Invalid completed days format')
      data.completedDays = []
    }

    if (typeof data.notes !== 'object' || data.notes === null) {
      errors.push('Invalid notes format')
      data.notes = {}
    }

    // Validate completed days format
    data.completedDays = data.completedDays.filter((day: string) => {
      const isValid = typeof day === 'string' && Date.parse(day)
      if (!isValid) {
        errors.push(`Invalid completed day format: ${day}`)
      }
      return isValid
    })

    // Validate notes format
    const validNotes: Record<string, string> = {}
    Object.entries(data.notes).forEach(([date, note]) => {
      if (Date.parse(date) && typeof note === 'string') {
        validNotes[date] = note
      } else {
        errors.push(`Invalid note format for date: ${date}`)
      }
    })
    data.notes = validNotes

    // If we have any data after validation, consider it valid
    sanitizedData = {
      days: data.days,
      startDate: data.startDate,
      userName: data.userName.trim(),
      completedDays: data.completedDays,
      notes: data.notes,
      lastLoggedDate: data.lastLoggedDate || null
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