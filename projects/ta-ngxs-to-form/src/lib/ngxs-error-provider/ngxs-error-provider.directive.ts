import { Directive, Input, OnDestroy, Optional } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
// eslint-disable-next-line import/no-cycle
import { NgxsGroupDirective } from '../ngxs-group/ngxs-group.directive';

@Directive({
  selector: '[ngxsErrorProvider]',
})
export class NgxsErrorProviderDirective implements OnDestroy {
  private _field: string;

  private currentError: string;

  get field(): string {
    return this._field;
  }

  @Input('ngxsErrorProvider') set field(value: string) {
    if (this._field === value) {
      return;
    }
    this._field = value;
    this.delete();
    this.init();
  }

  readonly errors$: BehaviorSubject<unknown> = new BehaviorSubject<unknown>(null);

  constructor(@Optional() private group: NgxsGroupDirective) {}

  update(error: unknown) {
    const hash = JSON.stringify(error);
    if (hash === this.currentError) {
      return;
    }
    this.currentError = hash;
    this.errors$.next(error);
  }

  ngOnDestroy(): void {
    this.errors$.complete();
    this.delete();
  }

  private delete() {
    if (!this.group) {
      return;
    }
    this.group.unregisterErrorProvider(this);
  }

  private init() {
    if (!this.group) {
      return;
    }
    this.group.registerErrorProvider(this);
  }
}
