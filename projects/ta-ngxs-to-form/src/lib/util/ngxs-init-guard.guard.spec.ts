import { TestBed, inject } from '@angular/core/testing';
import { NgxsModule } from '@ngxs/store';

import { NgxsInitGuard } from './ngxs-init-guard.guard';

describe('NgxsInitGuardGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [NgxsInitGuard],
      imports: [NgxsModule.forRoot()],
    });
  });

  it('should ...', inject([NgxsInitGuard], (guard: NgxsInitGuard) => {
    expect(guard).toBeTruthy();
  }));
});
