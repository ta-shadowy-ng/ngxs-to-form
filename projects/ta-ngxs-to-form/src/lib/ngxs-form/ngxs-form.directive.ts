import { AfterViewInit, Directive, ElementRef, forwardRef, Inject, Input, OnDestroy, Optional, Self } from '@angular/core';
import { AbstractControl, ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR, NgControl } from '@angular/forms';
import { LocaleService } from '@ta-shadowy/ng-locale';
import { DefaultValueAccessorDirective } from '../default-value-accessor/default-value-accessor.directive';
import { NgxsDataOptions } from '../model';
// eslint-disable-next-line import/no-cycle
import { NgxsGroupDirective } from '../ngxs-group/ngxs-group.directive';

@Directive({
  selector: '[ngxsForm]',
  providers: [
    {
      provide: NgControl,
      useExisting: forwardRef(() => NgxsFormDirective),
    },
  ],
})
export class NgxsFormDirective extends NgControl implements AfterViewInit, OnDestroy {
  private info: { path: string; control: NgxsFormDirective };

  private _field: string;

  @Input() ngxsFormOptions: NgxsDataOptions;

  @Input() ngxsFormType = 'any';

  get field(): string {
    return this._field;
  }

  @Input('ngxsForm') set field(value: string) {
    if (this._field === value) {
      return;
    }
    this._field = value;
    if (this.info === null) {
      return;
    }
    this.ngOnDestroy();
    this.init();
  }

  @Input() override set disabled(value: boolean) {
    if (this.valueAccessor) {
      this.valueAccessor.setDisabledState!(value);
    }
  }

  readonly control: AbstractControl | null;

  constructor(
    private element: ElementRef,
    @Optional() private group: NgxsGroupDirective,
    @Optional() @Self() @Inject(NG_VALUE_ACCESSOR) valueAccessors: ControlValueAccessor[],
    private locale: LocaleService,
  ) {
    super();
    this.control = new FormControl();
    this.control.statusChanges.subscribe((result) => {
      if (result === 'INVALID') {
        this.setInvalidStyle();
        return;
      }
      this.setValidStyle();
    });
    if (!!valueAccessors && valueAccessors.length > 1) {
      // eslint-disable-next-line prefer-destructuring
      this.valueAccessor = valueAccessors.filter((item) => !(item instanceof DefaultValueAccessorDirective))[0];
    } else {
      this.valueAccessor = valueAccessors ? valueAccessors[0] : null;
    }
  }

  viewToModelUpdate(): void {}

  ngAfterViewInit(): void {
    this.init();
  }

  ngOnDestroy(): void {
    this.group.unRegister(this.info);
  }

  setValidStyle() {
    this.removeClass('ng-invalid');
    this.addClass('ng-valid');
  }

  setInvalidStyle() {
    this.removeClass('ng-valid');
    this.addClass('ng-invalid');
  }

  setTouchStyle() {
    this.removeClass('ng-dirty');
  }

  resetTouchStyle() {
    this.addClass('ng-dirty');
  }

  /**
   * Prepare data for setting to control
   * @param value
   */
  forView(value: unknown): unknown {
    if (value === null || value === undefined) {
      return value;
    }
    switch (this.ngxsFormType) {
      case 'float':
      case 'int':
      case 'number':
        return value.toString().replace(/\./g, this.locale.decimalSeparator);
      default:
        return value;
    }
  }

  /**
   * Prepare value for return to model
   * @param value
   */
  forModel(value: unknown): unknown {
    switch (this.ngxsFormType) {
      case 'int':
        return NgxsFormDirective.parseInt(value);
      case 'float':
      case 'number':
        return this.parseFloat(value);
      default:
        return value;
    }
  }

  private static parseInt(value: unknown): unknown {
    if (value === '') {
      return null;
    }
    const resultInt = parseInt(value as string, 10);
    if (Number.isNaN(resultInt)) {
      return value;
    }
    if (resultInt.toString() === value!.toString().replace(/ /g, '')) {
      return resultInt;
    }
    return value;
  }

  private parseFloat(value: unknown): unknown {
    if (value === '') {
      return null;
    }
    const valueFloat = value!.toString().replace(new RegExp(`\\${this.locale.decimalSeparator}`, 'g'), '.');
    const resultFloat = parseFloat(valueFloat);
    if (Number.isNaN(resultFloat)) {
      return value;
    }
    if (resultFloat.toString() === valueFloat.replace(/ /g, '')) {
      return resultFloat;
    }
    return value;
  }

  private init() {
    if (!this.group) {
      // eslint-disable-next-line no-console
      console.warn('Group should be defined');
      return;
    }
    if (this.valueAccessor) {
      this.info = this.group.register(this.field, this, this.ngxsFormOptions);
    } else {
      // eslint-disable-next-line no-console
      console.warn('valueAccessors not defined');
    }
  }

  private addClass(className: string) {
    if (this.element.nativeElement.classList) {
      this.element.nativeElement.classList.add(className);
      return;
    }
    const list = this.element.nativeElement.className.split(' ');
    if (list.findIndex((item: any) => item === className) >= 0) {
      return;
    }
    list.push(className);
    this.element.nativeElement.className = list.join(' ');
  }

  private removeClass(className: string) {
    if (this.element.nativeElement.classList) {
      this.element.nativeElement.classList.remove(className);
      return;
    }
    const list = this.element.nativeElement.className.split(' ');
    const index = list.findIndex((item: any) => item === className);
    if (index < 0) {
      return;
    }
    list.splice(index, 1);
    this.element.nativeElement.className = list.join(' ');
  }
}
