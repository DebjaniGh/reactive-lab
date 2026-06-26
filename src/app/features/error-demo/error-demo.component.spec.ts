import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';

import { ErrorDemoComponent } from './error-demo.component';

describe('ErrorDemoComponent', () => {
  let component: ErrorDemoComponent;
  let fixture: ComponentFixture<ErrorDemoComponent>;

  const API_DELAY = 800;
  // Covers panel 3's worst case: 800 + 3 * (500 retry + 800 api) = 4700ms
  const FULL_RETRY_TIMELINE = 5000;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ErrorDemoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ErrorDemoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should start with all panels alive', () => {
    expect(component.panel1Alive).toBeTrue();
    expect(component.panel2Alive).toBeTrue();
    expect(component.panel3Alive).toBeTrue();
  });

  it('onSimulate should log the emission synchronously', () => {
    component.onSimulate('success');
    expect(component.log.some((l) => l.message.includes('Emitting "success"'))).toBeTrue();
  });

  it('success path should deliver results to all panels after the delay', fakeAsync(() => {
    component.onSimulate('success');
    tick(API_DELAY);
    expect(component.panel1Results.length).toBe(1);
    expect(component.panel2Results.length).toBe(1);
    expect(component.panel3Results.length).toBe(1);
    expect(component.panel1Results[0].status).toBe('success');
  }));

  it('panel 1 (catchError OUTSIDE switchMap) should die on first error', fakeAsync(() => {
    component.onSimulate('error-404');
    tick(FULL_RETRY_TIMELINE); // api delay + panel 3 retry timers
    expect(component.panel1Alive).toBeFalse();
    expect(component.panel1Results[0].status).toBe('error');
  }));

  it('panel 2 (catchError INSIDE switchMap) should survive errors', fakeAsync(() => {
    component.onSimulate('error-404');
    tick(FULL_RETRY_TIMELINE);
    expect(component.panel2Alive).toBeTrue();
    expect(component.panel2Results[0].status).toBe('recovered');
  }));

  it('a dead panel 1 should ignore further emissions', fakeAsync(() => {
    component.onSimulate('error-500');
    tick(FULL_RETRY_TIMELINE);
    expect(component.panel1Alive).toBeFalse();

    const attemptsBefore = component.panel1AttemptCount;
    component.onSimulate('success');
    tick(FULL_RETRY_TIMELINE);
    expect(component.panel1AttemptCount).toBe(attemptsBefore); // not re-attempted
  }));

  it('onReset should restore all panels and clear results', fakeAsync(() => {
    component.onSimulate('error-500');
    tick(FULL_RETRY_TIMELINE);

    component.onReset();
    expect(component.panel1Alive).toBeTrue();
    expect(component.panel1Results).toEqual([]);
    expect(component.panel2Results).toEqual([]);
    expect(component.panel3Results).toEqual([]);
    expect(component.log).toEqual([]);

    // works again after reset
    component.onSimulate('success');
    tick(API_DELAY);
    expect(component.panel1Results.length).toBe(1);
  }));
});
