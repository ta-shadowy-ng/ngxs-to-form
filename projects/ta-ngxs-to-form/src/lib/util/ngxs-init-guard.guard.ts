import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot } from '@angular/router';
import { Store } from '@ngxs/store';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class NgxsInitGuard implements CanActivate {
  constructor(private store: Store) {}

  canActivate(next: ActivatedRouteSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    const { NgxsInit } = next.data;
    if (!NgxsInit) {
      // eslint-disable-next-line no-console
      console.warn('[NgxsInitGuardGuard] data.ngxsInit not defined');
      return false;
    }
    return new Promise<boolean>((resolve) =>
      new Observable((obs) => {
        setTimeout(() =>
          this.store.dispatch(new NgxsInit(next)).subscribe(
            () => {
              obs.next();
              obs.complete();
            },
            (e) => {
              obs.error(e);
              obs.complete();
            },
          ),
        );
      }).subscribe(
        () => resolve(true),
        () => resolve(false),
      ),
    );
  }
}
