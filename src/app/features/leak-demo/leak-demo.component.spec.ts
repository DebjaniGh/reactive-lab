import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LeakDemoComponent } from './leak-demo.component';

describe('LeakDemoComponent', () => {
  let component: LeakDemoComponent;
  let fixture: ComponentFixture<LeakDemoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LeakDemoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LeakDemoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should start unmounted and not leaking', () => {
    expect(component.isMounted).toBeFalse();
    expect(component.isLeaking).toBeFalse();
    expect(component.statusLabel).toContain('not mounted');
  });

  it('onMount should mark mounted and track an active subscription', () => {
    component.onMount();
    expect(component.isMounted).toBeTrue();
    expect(component.activeSubs).toBe(1);
    expect(component.mountCount).toBe(1);
  });

  it('"none" strategy should LEAK after destroy (active sub remains)', () => {
    component.selectedStrategy = 'none';
    component.onMount();
    component.onDestroy();
    expect(component.isMounted).toBeFalse();
    expect(component.activeSubs).toBe(1); // not cleaned up
    expect(component.isLeaking).toBeTrue();
  });

  it('"manual" strategy should clean up after destroy', () => {
    component.selectedStrategy = 'manual';
    component.onMount();
    component.onDestroy();
    expect(component.activeSubs).toBe(0);
    expect(component.isLeaking).toBeFalse();
  });

  it('"takeUntilDestroyed" strategy should clean up after destroy', () => {
    component.selectedStrategy = 'takeUntilDestroyed';
    component.onMount();
    component.onDestroy();
    expect(component.activeSubs).toBe(0);
  });

  it('onReset should clear all tracking state', () => {
    component.selectedStrategy = 'none';
    component.onMount();
    component.onDestroy();
    component.onReset();
    expect(component.activeSubs).toBe(0);
    expect(component.mountCount).toBe(0);
    expect(component.zombieLog).toEqual([]);
    expect(component.isMounted).toBeFalse();
  });
});
