import { ChangeDetectorRef, Directive, Input, OnDestroy } from '@angular/core';
import { Store } from '@ngxs/store';
import { Observable, Subscription } from 'rxjs';
// eslint-disable-next-line import/no-cycle
import { NgxsFormDirective } from '../../public-api';
// eslint-disable-next-line import/no-cycle
import { NgxsErrorProviderDirective } from '../ngxs-error-provider/ngxs-error-provider.directive';
import { NgxsDataOptions, TouchResult, ValidationResult } from '../model';
import { ngxsActionBuilder, ngxsDataBuilder } from '../state';
import { getValueByPath } from '../util';

@Directive({
  selector: '[ngxsGroup]',
})
export class NgxsGroupDirective implements OnDestroy {
  private controls: { path: string; control: NgxsFormDirective }[] = [];

  private errorProviders: { path: string; control: NgxsErrorProviderDirective }[] = [];

  private subscription: Subscription;

  private model$: Observable<unknown>;

  private touch$: Observable<TouchResult>;

  private oldValue: { [key: string]: unknown } = {};

  private touched: string[] = [];

  private validation$: Observable<ValidationResult>;

  private validationHash: string;

  private validation: ValidationResult;

  @Input('ngxsGroup') action: string;

  @Input() ngxsGroupOptions: NgxsDataOptions;

  @Input() ngxsTouch = true;

  constructor(private store: Store, private cdRef: ChangeDetectorRef) {}

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  register(path: string, control: NgxsFormDirective, options: NgxsDataOptions): { path: string; control: NgxsFormDirective } {
    const result: { path: string; control: NgxsFormDirective } = { path, control };
    this.setupControl(path, control, this.setupOptions(options));
    this.controls.push(result);
    if (this.touched.indexOf(path) >= 0) {
      control.setTouchStyle();
    } else {
      control.resetTouchStyle();
    }
    this.setErrors(result);
    return result;
  }

  unRegister(element: { path: string; control: NgxsFormDirective }): void {
    element.control.valueAccessor!.registerOnChange(() => {});
    element.control.valueAccessor!.registerOnTouched(() => {});
    this.controls = this.controls.filter((item) => item.path !== element.path && item.control !== element.control);
  }

  registerErrorProvider(control: NgxsErrorProviderDirective) {
    const { field } = control;
    if (this.errorProviders.filter((item) => item.path === field && item.control === control).length > 0) {
      return;
    }
    this.errorProviders.push({ path: field, control });
  }

  unregisterErrorProvider(control: NgxsErrorProviderDirective) {
    const { field } = control;
    const pos = this.errorProviders.findIndex((item) => item.path === field && item.control === control);
    if (pos < 0) {
      return;
    }
    this.errorProviders.splice(pos, 1);
  }

  private change(path: string, data: unknown): void {
    const action = this.createAction('', { path, data });
    if (action) {
      this.store.dispatch(action);
    }
  }

  private touch(path: any): void {
    if (!this.ngxsTouch) {
      return;
    }
    const action = this.createAction(':touch', path);
    if (action) {
      this.store.dispatch(action);
    }
  }

  private setupControl(path: string, control: NgxsFormDirective, options: NgxsDataOptions) {
    let timout: any = null;
    control.valueAccessor!.registerOnChange((data: any) => {
      if (timout) {
        clearTimeout(timout);
      }
      timout = setTimeout(() => {
        this.change(path, control.forModel(data));
        timout = null;
      }, options.timeoutBeforeChange);
    });
    control.valueAccessor!.registerOnTouched(() => this.touch(path));
    this.setupData();
  }

  private setupData() {
    setTimeout(() => {
      if (this.model$ !== null) {
        return;
      }
      this.model$ = this.createData();
      if (this.model$ === null) {
        return;
      }
      this.subscription = this.model$.subscribe((result) => this.updateData(result));
      this.touch$ = this.createData('touch');
      if (this.touch$ !== null) {
        this.subscription.add(this.touch$.subscribe((result) => this.touchData(result)));
      }
      this.validation$ = this.createData('validation');
      if (this.validation$ !== null) {
        this.subscription.add(this.validation$.subscribe((result) => this.validateData(result)));
      }
    });
  }

  private updateData(model: unknown) {
    const data = this.controls.reduce((obj: any, value) => {
      let o = obj[value.path];
      if (!o) {
        o = { controls: [] };
        obj[value.path] = o;
      }
      o.controls.push(value.control);
      return obj;
    }, {});
    Object.keys(data).forEach((path) => {
      const oldValue = this.oldValue[path];
      const value = getValueByPath(model, path);
      const newValue = JSON.stringify(value);
      if (oldValue === newValue) {
        return;
      }
      this.oldValue[path] = newValue;
      data[path].controls.forEach((control: any) => control.valueAccessor.writeValue(control.forView(value)));
      this.cdRef.markForCheck();
    });
  }

  private touchData(touch: TouchResult) {
    const list = Object.keys(touch || {});
    const unTouch = this.touched.filter((item) => list.indexOf(item) < 0);
    const touched = list.filter((item) => this.touched.indexOf(item) < 0);
    this.controls.forEach((item: any) => {
      if (unTouch.indexOf(item.path) >= 0) {
        item.control.control.markAsUntouched();
        item.control.resetTouchStyle();
        return;
      }
      if (touched.indexOf(item.path) >= 0) {
        item.control.control.markAsTouched();
        item.control.setTouchStyle();
      }
    });
    this.touched = list;
  }

  private validateData(validation: ValidationResult) {
    const hash = JSON.stringify(validation);
    if (hash === this.validationHash) {
      return;
    }
    this.validation = { ...validation };
    this.validationHash = hash;
    this.controls.forEach((item) => this.setErrors(item));
    this.errorProviders.forEach((item) => this.setErrorsToProvider(item));
  }

  private setErrors(item: { path: string; control: NgxsFormDirective }) {
    const clear = () => {
      const listError = Object.keys(item.control.control!.errors || {}).sort();
      if (listError.length > 0) {
        item.control.control!.setErrors(null);
      }
    };

    if (!this.validation) {
      clear();
      return;
    }
    const current = this.validation[item.path];
    if (current === undefined || current === null) {
      clear();
      return;
    }
    item.control.control!.setErrors(current);
  }

  private setupOptions(options: NgxsDataOptions): NgxsDataOptions {
    options = options || {};
    const result = { ...(this.ngxsGroupOptions || {}), ...options };
    result.timeoutBeforeChange =
      result.timeoutBeforeChange === undefined || result.timeoutBeforeChange === null ? 0 : result.timeoutBeforeChange;
    return result;
  }

  private createAction(suffix: string, ...args: any[]): unknown {
    const action = this.action + suffix;
    const constructor: any = ngxsActionBuilder.get(action);
    if (!constructor) {
      // eslint-disable-next-line no-console
      console.warn('[NgxsGroupDirective]', `action "${action}" - not found`);
      return null;
    }
    return new constructor(...args);
  }

  private createData(action?: string | undefined): any {
    const selector = this.action + (action === null || action === undefined ? '' : `:${action}`);
    const method: () => unknown = ngxsDataBuilder.get(selector);
    if (!method) {
      // eslint-disable-next-line no-console
      console.warn('[NgxsGroupDirective]', `selector "${selector}" - not found`);
      return null;
    }
    return this.store.select(method);
  }

  private setErrorsToProvider(item: { path: string; control: NgxsErrorProviderDirective }) {
    item.control.update(this.validation[item.path] || null);
  }
}
