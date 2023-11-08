import { NgxsErrorProviderDirective } from './ngxs-error-provider.directive';

describe('ErrorProviderDirective', () => {
  it('should create an instance', () => {
    const directive = new NgxsErrorProviderDirective(null);
    expect(directive).toBeTruthy();
  });
});
