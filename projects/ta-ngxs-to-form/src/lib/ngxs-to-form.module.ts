import { CommonModule } from '@angular/common';
import { InjectionToken, ModuleWithProviders, NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgxsModule } from '@ngxs/store';
import { NgLocaleModule } from '@ta-shadowy/ng-locale';
import { DefaultValueAccessorDirective } from './default-value-accessor/default-value-accessor.directive';
// eslint-disable-next-line import/no-cycle
import { NgxsFormDirective } from './ngxs-form/ngxs-form.directive';
// eslint-disable-next-line import/no-cycle
import { NgxsGroupDirective } from './ngxs-group/ngxs-group.directive';
// eslint-disable-next-line import/no-cycle
import { NgxsErrorProviderDirective } from './ngxs-error-provider/ngxs-error-provider.directive';

export const NGXS_FORM_ACTIONS = new InjectionToken('NGXS_FORM_ACTIONS');

@NgModule({
  declarations: [NgxsFormDirective, NgxsGroupDirective, DefaultValueAccessorDirective, NgxsErrorProviderDirective],
  imports: [CommonModule, FormsModule, NgxsModule, NgLocaleModule],
  exports: [NgxsFormDirective, NgxsGroupDirective, DefaultValueAccessorDirective, NgxsErrorProviderDirective],
})
export class NgxsToFormModule {
  static register(classList: unknown[] = []): ModuleWithProviders<NgxsToFormModule> {
    return {
      ngModule: NgxsToFormModule,
      providers: [
        {
          provide: NGXS_FORM_ACTIONS,
          useValue: classList,
        },
      ],
    };
  }
}
