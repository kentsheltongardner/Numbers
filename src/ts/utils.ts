
export function ramp(x: number, max: number, flatness: number) {
    return max * (x / (x + flatness))
}