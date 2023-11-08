import { clone } from './clone';
import { patchModel } from './patch-model';
import { INgxsDataChange } from '../model';

export function applyChanges(
  getState: any,
  setState: (data: unknown) => unknown,
  payload: INgxsDataChange,
  prefix: string | null,
  processing: (data: unknown) => Promise<unknown> = (data: unknown) => Promise.resolve(data),
): Promise<unknown> {
  const model = getState();
  const result = patchModel(model, (prefix === null ? '' : `${prefix}.`) + payload.path, payload.data);
  return Promise.resolve(processing(clone(result))).then((data) => setState(data));
}
