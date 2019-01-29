export function array<T>(maybeArray?: Array<T>): Array<T> {
    return Array.isArray(maybeArray)
        ? maybeArray!
        : [];
}
