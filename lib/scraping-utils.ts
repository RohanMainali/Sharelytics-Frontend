/**
 * Safely extracts a number from a string, handling commas and other formatting
 * @param text The text to extract a number from
 * @param defaultValue The default value to return if extraction fails
 * @returns The extracted number or the default value
 */
export function extractNumber(text: string | undefined | null, defaultValue = 0): number {
  if (!text) return defaultValue

  // Remove commas, percentage signs, and other non-numeric characters except decimal points and minus signs
  const cleanedText = text.replace(/[^\d.-]/g, "")
  const number = Number.parseFloat(cleanedText)

  return isNaN(number) ? defaultValue : number
}

/**
 * Safely extracts a date from a string
 * @param text The text to extract a date from
 * @returns The extracted date or null if extraction fails
 */
export function extractDate(text: string | undefined | null): Date | null {
  if (!text) return null

  // Try to parse the date
  const date = new Date(text)

  // Check if the date is valid
  return isNaN(date.getTime()) ? null : date
}

/**
 * Safely extracts text from an element
 * @param element The element to extract text from
 * @param defaultValue The default value to return if extraction fails
 * @returns The extracted text or the default value
 */
export function extractText(element: any, defaultValue = ""): string {
  try {
    return element?.text?.()?.trim() || defaultValue
  } catch (e) {
    return defaultValue
  }
}
