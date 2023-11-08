import { isEqual } from './is-equal';

export function patchModel(model: unknown, path: string, value: unknown): unknown {
  if (path === null) {
    return { ...(model as Record<string, unknown>) };
  }
  if (path === '') {
    return value;
  }
  const parts = path.split('.');
  setValueByPart(model, value, parts);
  return model;
}

function setValueByPart(obj: any, value: unknown, parts: string[]): void {
  const part = parts.shift();
  let next;

  const p = part!.indexOf('[');
  if (!part) {
    return;
  }
  if (!obj) {
    return;
  }
  if (p < 0) {
    if (parts.length === 0) {
      obj[part] = value;
      return;
    }
    next = obj[part];
  } else {
    const index = part.substring(p + 1, part.length - 1);
    const field = part.substring(0, p);
    if (index.indexOf(':') < 0) {
      const idx = parseInt(index, 10);
      if (parts.length === 0) {
        obj[field][idx] = value;
        return;
      }
      next = obj[field][idx];
      if (next === null || next === undefined) {
        obj[field][idx] = {};
        next = obj[field][idx];
      }
      if (next === null || next === undefined) {
        obj[part] = {};
        next = obj[part];
      }
    } else {
      if (obj[field] === null || obj[field] === undefined) {
        obj[field] = [];
      }
      const searchCriteria = index.split(':');
      const idx = obj[field].findIndex((item: any) => isEqual(item[searchCriteria[0]], searchCriteria[1]));
      if (parts.length === 0) {
        if (idx === 0) {
          obj[field].push(value);
        } else {
          obj[field][idx] = value;
        }
        return;
      }
      next = obj[field][idx];
      if (next === null || next === undefined) {
        const o: any = {};
        // eslint-disable-next-line prefer-destructuring
        o[searchCriteria[0]] = searchCriteria[1];
        obj[field].push(o);
        next = o;
      }
    }
  }

  setValueByPart(next, value, parts);
}
