/**
 * Parses quiz accuracy values such as "75%" into a number.
 * Returns 0 for missing or invalid values.
 */
export function parseQuizAccuracy(value: string | undefined): number {
  if (!value) return 0;
  const parsed = Number.parseInt(value.replace("%", ""), 10);
  return Number.isFinite(parsed) ? parsed : 0;
}
