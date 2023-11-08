import { DefaultValueAccessorDirective } from './default-value-accessor.directive';

describe('DefaultValueAccessorDirective', () => {
  it('should create an instance', () => {
    const directive = new DefaultValueAccessorDirective(null, null, null);
    expect(directive).toBeTruthy();
  });
});
