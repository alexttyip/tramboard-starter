function spacePadString(numString: string) {
    if (numString.length === 1) {
        return '  ' + numString
    } else {
        return numString
    }
}

export function formatNumber(numString: string) {
    if (numString === '0') {
        return '  Due    '
    }
    return spacePadString(numString) + ' mins'
}