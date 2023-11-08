export function clone(obj: unknown): unknown {
  return JSON.parse(JSON.stringify(obj));
}
