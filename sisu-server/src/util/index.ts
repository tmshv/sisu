export function normalizePath(filepath: string): string {
    return filepath.replace(/\\/g, "/");
}