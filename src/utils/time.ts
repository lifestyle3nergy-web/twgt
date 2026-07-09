/**
 * Return the current time as an ISO-8601 timestamp string.
 */
export function currentTimestamp(): string {
  return new Date().toISOString();
}
