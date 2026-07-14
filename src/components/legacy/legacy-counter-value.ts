export function getCounterValue(total: number, elapsed: number, duration: number) {
  const progress = Math.min(1, Math.max(0, elapsed / duration));
  return Math.min(total, Math.round(total * progress));
}
