import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LeakyChildComponent, CleanupStrategy } from './leaky-child.component';
import { LeakTrackerService } from '../leak-tracker.service';

describe('LeakyChildComponent', () => {
  let fixture: ComponentFixture<LeakyChildComponent>;
  let component: LeakyChildComponent;

  function createWith(strategy: CleanupStrategy): void {
    fixture = TestBed.createComponent(LeakyChildComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('strategy', strategy);
    fixture.detectChanges(); // triggers ngOnInit
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LeakyChildComponent],
      // Service is normally provided by the parent; supply it here.
      providers: [LeakTrackerService],
    }).compileComponents();
  });

  it('should create with a required strategy input', () => {
    createWith('none');
    expect(component).toBeTruthy();
    expect(component.strategy).toBe('none');
  });

  it('should start alive with tick at 0', () => {
    createWith('manual');
    expect(component.alive).toBeTrue();
    expect(component.tick).toBe(0);
  });

  it('should mark itself not alive on destroy', () => {
    createWith('manual');
    fixture.destroy();
    expect(component.alive).toBeFalse();
  });

  it('async strategy should expose a tick$ observable and skip manual subscription', () => {
    createWith('async');
    expect(component.tick$).toBeTruthy();
    expect(component.alive).toBeTrue();
  });

  it('takeUntilDestroyed strategy should create without throwing', () => {
    expect(() => createWith('takeUntilDestroyed')).not.toThrow();
    expect(component).toBeTruthy();
  });
});
