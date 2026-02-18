export function getCoverageIgnorePatterns(): string[] {
  return ["**/node_modules/**", "**/dist/**"];
}

export function normalizePattern(pattern: string): string {
  return pattern.replace(/\\/g, "/");
}
