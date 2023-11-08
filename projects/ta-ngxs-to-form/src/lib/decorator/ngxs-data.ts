import { ngxsDataBuilder } from '../state';

export function ngxsData(name: string): (target: unknown, propertyKey: string, descriptor: PropertyDescriptor) => void {
  return (target: any, propertyKey: string) => {
    setTimeout(() => ngxsDataBuilder.add(name, target[propertyKey]));
  };
}
