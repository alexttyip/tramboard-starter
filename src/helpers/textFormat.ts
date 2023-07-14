export function formatNumber(numString: string) {
  if (numString === '0') {
    return 'Due'
  }
  return numString + ' mins'
}
