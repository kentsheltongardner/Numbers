export function ramp(x, max, flatness) {
    return max * (x / (x + flatness));
}
