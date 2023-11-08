export function isEqual(value1: unknown, value2: unknown): boolean {
  if ((value1 === undefined || value1 === null) && (value2 === undefined || value2 === null)) {
    return true;
  }
  if (value1 === undefined || value1 === null || value2 === undefined || value2 === null) {
    return false;
  }
  if (typeof value1 === 'number' || typeof value2 === 'number') {
    return parseFloat(value1 as string) === parseFloat(value2 as string);
  }
  if (typeof value1 === 'object' || typeof value2 === 'object') {
    return JSON.stringify(value1) === JSON.stringify(value2);
  }
  return value1 === value2;
}
