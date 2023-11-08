import { ngxsActionBuilder } from '../state';

export function ngxsAction(name: string) {
  return (constructor: any) => {
    ngxsActionBuilder.add(name, constructor);
    return constructor;
  };
}
