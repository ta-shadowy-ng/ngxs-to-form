import { isEqual } from './is-equal';

export function getValueByPath(obj: unknown, path: string) {
  if (path === null) {
    return null;
  }
  if (path === '') {
    return obj;
  }
  const parts = path.split('.');
  return getValueByPart(obj, parts);
}

function getValueByPart(obj: any, parts: string[]): unknown {
  if (obj === null || obj === undefined) {
    return null;
  }
  if (parts.length === 0) {
    return obj;
  }
  const part = parts.shift();
  if (!part) {
    return null;
  }
  const p = part.indexOf('[');
  if (p < 0) {
    return getValueByPart(obj[part], parts);
  }
  const index = part.substring(p + 1, part.length - 1);
  const key = part.substring(0, p);
  if (index.indexOf(':') < 0) {
    return getValueByPart(obj[key][parseInt(index, 10)], parts);
  }
  const searchCriteria = index.split(':');
  return getValueByPart(
    (obj as unknown[]).find((item: any) => isEqual(item[searchCriteria[0]], searchCriteria[1])),
    parts,
  );
}
