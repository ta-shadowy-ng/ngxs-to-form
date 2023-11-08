import { Directive, ElementRef, forwardRef, HostListener, Inject, Optional, Renderer2 } from '@angular/core';
import { COMPOSITION_BUFFER_MODE, ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { ɵgetDOM as getDOM } from '@angular/platform-browser';

@Directive({
  selector: 'input:not([type=checkbox])[ngxsForm],textarea[ngxsForm],[defaultValueAccessor]',
  /* tslint:enable */
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DefaultValueAccessorDirective),
      multi: true,
    },
  ],
})
export class DefaultValueAccessorDirective implements ControlValueAccessor {
  private _composing = false;

  constructor(
    private _renderer: Renderer2,
    private _elementRef: ElementRef,
    @Optional() @Inject(COMPOSITION_BUFFER_MODE) private readonly _compositionMode: boolean,
  ) {
    if (this._compositionMode == null) {
      this._compositionMode = !isAndroid();
    }
  }

  onChange: (data: unknown) => void = () => {};

  onTouched = () => {};

  writeValue(value: unknown): void {
    const normalizedValue = value == null ? '' : value;
    this._renderer.setProperty(this._elementRef.nativeElement, 'value', normalizedValue);
  }

  registerOnChange(fn: (data: unknown) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this._renderer.setProperty(this._elementRef.nativeElement, 'disabled', isDisabled);
  }

  @HostListener('input', ['$event.target.value']) private handleInput(value: unknown) {
    if (!this._compositionMode || (this._compositionMode && !this._composing)) {
      this.onChange(value);
    }
  }

  @HostListener('blur') private handleBlur() {
    this.onTouched();
  }

  @HostListener('compositionstart') private handleCompositionStart() {
    this._composing = true;
  }

  @HostListener('compositionend', ['$event.target.value']) private handleCompositionEnd(value: unknown) {
    this._composing = false;
    if (this._compositionMode) {
      this.onChange(value);
    }
  }
}

function isAndroid(): boolean {
  const userAgent = getDOM() ? getDOM().getUserAgent() : '';
  return /android (\d+)/.test(userAgent.toLowerCase());
}
