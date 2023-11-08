import { clone } from './clone';

export function applyTouch(getState: () => unknown, setState: (data: unknown) => unknown, field: string, path: string) {
  const model: any = clone(getState());
  if (!model[field]) {
    model[field] = {};
  }
  model[field][path] = true;
  setState(model);
}
