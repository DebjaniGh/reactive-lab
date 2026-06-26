import { ComponentFixture, TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';

import { SignalDemoComponent } from './signals-demo.component';

describe('SignalDemoComponent', () => {
  let component: SignalDemoComponent;
  let fixture: ComponentFixture<SignalDemoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SignalDemoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SignalDemoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Signal panel', () => {
    it('should start at 0', () => {
      expect(component.signalCount()).toBe(0);
    });

    it('should increment and decrement', () => {
      component.sigIncrement();
      expect(component.signalCount()).toBe(1);
      component.sigDecrement();
      expect(component.signalCount()).toBe(0);
    });

    it('should compute derived doubled and isEven signals', () => {
      component.sigIncrement(); // 1
      expect(component.signalDoubled()).toBe(2);
      expect(component.signalIsEven()).toBeFalse();
      component.sigIncrement(); // 2
      expect(component.signalDoubled()).toBe(4);
      expect(component.signalIsEven()).toBeTrue();
    });

    it('reset should set the signal back to 0', () => {
      component.sigIncrement();
      component.sigReset();
      expect(component.signalCount()).toBe(0);
    });
  });

  describe('BehaviorSubject panel', () => {
    it('should push new values to count$', async () => {
      component.bsIncrement();
      const value = await firstValueFrom(component.count$);
      expect(value).toBe(1);
    });

    it('should compute derived doubled$ stream', async () => {
      component.bsIncrement();
      component.bsIncrement();
      const doubled = await firstValueFrom(component.doubled$);
      expect(doubled).toBe(4);
    });

    it('reset should push 0', async () => {
      component.bsIncrement();
      component.bsReset();
      const value = await firstValueFrom(component.count$);
      expect(value).toBe(0);
    });
  });

  describe('separate activity logs', () => {
    it('should log BehaviorSubject actions only to bsLog', () => {
      const beforeSig = component.sigLog.length;
      component.bsIncrement();
      expect(component.bsLog[0].message).toContain('count$$.next');
      expect(component.sigLog.length).toBe(beforeSig); // sig log untouched
    });

    it('should log Signal actions only to sigLog', () => {
      const beforeBs = component.bsLog.length;
      component.sigIncrement();
      expect(component.sigLog[0].message).toContain('count.update');
      expect(component.bsLog.length).toBe(beforeBs); // bs log untouched
    });

    it('clearBsLog should clear only the BehaviorSubject log', () => {
      component.sigIncrement();
      const sigLen = component.sigLog.length;
      component.clearBsLog();
      expect(component.bsLog).toEqual([]);
      expect(component.sigLog.length).toBe(sigLen);
    });

    it('clearSigLog should clear only the Signal log', () => {
      component.bsIncrement();
      const bsLen = component.bsLog.length;
      component.clearSigLog();
      expect(component.sigLog).toEqual([]);
      expect(component.bsLog.length).toBe(bsLen);
    });
  });
});
