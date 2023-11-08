import { async, TestBed } from '@angular/core/testing';
import { NgxsToFormModule } from './ngxs-to-form.module';

describe('NgxsToFormModule', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [NgxsToFormModule],
    }).compileComponents();
  }));

  it('should create', () => {
    expect(NgxsToFormModule).toBeDefined();
  });
});
