import { isValid, parseISO } from 'date-fns'
import { ChallengeData, SessionNote } from '../types'

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
    const requiredFields = ['days', 'startDate', 'userName', 'completedDays', 'notes']
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
      challengeData.userName = 'User'
    }

    if (!Array.isArray(challengeData.completedDays)) {
      errors.push('Invalid completed days format')
      challengeData.completedDays = []
    }

    if (typeof challengeData.notes !== 'object' || challengeData.notes === null) {
      errors.push('Invalid notes format')
      challengeData.notes = {}
    }

    // Validate completed days format and remove duplicates
    const uniqueCompletedDays = new Set<string>();
    challengeData.completedDays = challengeData.completedDays.filter((day: string) => {
      const isValid = isValidDateString(day);
      if (!isValid) {
        errors.push(`Invalid completed day format: ${day}`);
        return false;
      }
      if (uniqueCompletedDays.has(day)) {
        return false; // Remove duplicate
      }
      uniqueCompletedDays.add(day);
      return true;
    });

    // Validate notes format
    const validNotes: Record<string, SessionNote> = {}
    Object.entries(challengeData.notes).forEach(([date, note]) => {
      if (isValidDateString(date)) {
        const now = new Date().toISOString();
        if (typeof note === 'string') {
          // Convert old format to new format
          validNotes[date] = {
            date,
            note,
            createdAt: now,
            updatedAt: now
          }
        } else if (typeof note === 'object' && note !== null) {
          const noteObj = note as { note?: string; createdAt?: string; updatedAt?: string; timestamp?: string }
          if (typeof noteObj.note === 'string') {
            // Handle migration from old format (timestamp) to new format (createdAt/updatedAt)
            const createdAt = noteObj.createdAt || noteObj.timestamp || now;
            validNotes[date] = {
              date,
              note: noteObj.note,
              createdAt,
              updatedAt: noteObj.updatedAt || createdAt
            }
          }
        }
      }
    })
    challengeData.notes = validNotes

    // Create sanitized data
    sanitizedData = {
      days: challengeData.days,
      startDate: challengeData.startDate,
      userName: challengeData.userName.trim(),
      completedDays: Array.from(uniqueCompletedDays),
      notes: challengeData.notes,
      lastLoggedDate: challengeData.lastLoggedDate || null
    }

    // Return validation result
    return {
      isValid: errors.length === 0,
      data: sanitizedData,
      errors
    }
  } catch (error) {
    console.error('Error validating challenge data:', error)
    errors.push('Error validating challenge data')
    return {
      isValid: false,
      data: null,
      errors
    }
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
  const validNotes: Record<string, SessionNote> = {}
  Object.entries(data.notes).forEach(([date, note]) => {
    if (Date.parse(date)) {
      const now = new Date().toISOString();
      if (typeof note === 'string') {
        validNotes[date] = {
          date,
          note,
          createdAt: now,
          updatedAt: now
        }
      } else if (typeof note === 'object' && note !== null && 'note' in note) {
        const noteObj = note as { note: string; createdAt?: string; updatedAt?: string; timestamp?: string }
        validNotes[date] = {
          date,
          note: noteObj.note,
          createdAt: noteObj.createdAt || noteObj.timestamp || now,
          updatedAt: noteObj.updatedAt || noteObj.createdAt || noteObj.timestamp || now
        }
      }
    }
  })

  return {
    days: Math.max(10, Math.min(365, data.days)),
    startDate: data.startDate,
    userName: data.userName.trim(),
    completedDays: data.completedDays.filter(day => Date.parse(day)),
    notes: validNotes,
    lastLoggedDate: data.lastLoggedDate || null
  }
} 