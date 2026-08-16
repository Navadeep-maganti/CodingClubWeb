/**
 * Roll number & email validation utilities.
 *
 * Email rule: must match ^[0-9]{6}@student\.nitandhra\.ac\.in$
 * Example valid: 123456@student.nitandhra.ac.in
 */

export const STUDENT_EMAIL_REGEX = /^([0-9]{6})@student\.nitandhra\.ac\.in$/
export const ROLL_NUMBER_REGEX = /^[0-9]{6}$/
export const STUDENT_EMAIL_DOMAIN = "student.nitandhra.ac.in"

export type ValidationResult =
  | { ok: true; rollNumber: string; email: string }
  | { ok: false; reason: string }

/**
 * Extract roll number from a student email.
 * Returns null if email is not a valid student email.
 */
export function extractRollNumber(email: string): string | null {
  if (!email) return null
  const lower = email.toLowerCase().trim()
  const match = lower.match(STUDENT_EMAIL_REGEX)
  return match ? match[1] : null
}

/**
 * Strict email validation - frontend, backend, middleware, API routes all use this.
 */
export function validateStudentEmail(email: string): ValidationResult {
  if (!email || typeof email !== "string") {
    return { ok: false, reason: "Email is required." }
  }
  const lower = email.toLowerCase().trim()
  if (!lower.endsWith(`@${STUDENT_EMAIL_DOMAIN}`)) {
    return { ok: false, reason: `Only @${STUDENT_EMAIL_DOMAIN} emails are allowed.` }
  }
  if (!STUDENT_EMAIL_REGEX.test(lower)) {
    return {
      ok: false,
      reason: "Email must be in the format 123456@student.nitandhra.ac.in (6-digit roll number).",
    }
  }
  const rollNumber = extractRollNumber(lower) as string
  return { ok: true, rollNumber, email: lower }
}

/**
 * Validate a standalone roll number string.
 */
export function validateRollNumber(roll: string): ValidationResult {
  if (!roll || typeof roll !== "string") {
    return { ok: false, reason: "Roll number is required." }
  }
  const clean = roll.trim()
  if (!ROLL_NUMBER_REGEX.test(clean)) {
    return { ok: false, reason: "Roll number must be exactly 6 digits." }
  }
  return { ok: true, rollNumber: clean, email: `${clean}@${STUDENT_EMAIL_DOMAIN}` }
}
