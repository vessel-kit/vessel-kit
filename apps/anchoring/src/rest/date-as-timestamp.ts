export function dateAsTimestamp(d: Date) {
  return Math.round(d.valueOf() / 1000);
}
