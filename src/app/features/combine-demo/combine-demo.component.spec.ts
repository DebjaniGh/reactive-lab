import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CombinationOperatorsComponent } from './combine-demo.component';

describe('CombinationOperatorsComponent', () => {
  let component: CombinationOperatorsComponent;
  let fixture: ComponentFixture<CombinationOperatorsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CombinationOperatorsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CombinationOperatorsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges(); // triggers ngOnInit → wires the streams
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should start with empty logs and no emissions', () => {
    expect(component.combineLatestLog).toEqual([]);
    expect(component.mergeLog).toEqual([]);
    expect(component.forkJoinLog).toEqual([]);
    expect(component.hasEmittedA).toBeFalse();
    expect(component.hasEmittedB).toBeFalse();
    expect(component.hasEmittedC).toBeFalse();
  });

  it('merge should log every individual emission', () => {
    component.emitA();
    component.emitB();
    expect(component.mergeLog.length).toBe(2);
    expect(component.hasEmittedA).toBeTrue();
    expect(component.hasEmittedB).toBeTrue();
  });

  it('combineLatest should only emit once all three sources have a value', () => {
    component.emitA();
    expect(component.combineLatestLog.length).toBe(0); // B and C missing

    component.emitB();
    expect(component.combineLatestLog.length).toBe(0); // C still missing

    component.emitC();
    expect(component.combineLatestLog.length).toBe(1); // now all three present

    component.emitA();
    expect(component.combineLatestLog.length).toBe(2); // re-emits on new A
  });

  it('forkJoin should emit only after all sources complete', () => {
    component.emitA();
    component.emitB();
    component.emitC();
    expect(component.forkJoinDone).toBeFalse();

    component.completeA();
    component.completeB();
    expect(component.forkJoinDone).toBeFalse(); // C not complete

    component.completeC();
    expect(component.forkJoinDone).toBeTrue();
    expect(component.forkJoinLog.length).toBe(1);
  });

  it('clearLog should clear only the targeted operator log', () => {
    component.emitA();
    component.emitB();
    component.emitC();
    expect(component.mergeLog.length).toBeGreaterThan(0);

    component.clearLog('merge');
    expect(component.mergeLog).toEqual([]);
    expect(component.combineLatestLog.length).toBeGreaterThan(0);
  });

  it('reset should clear all state and rewire streams', () => {
    component.emitA();
    component.emitB();
    component.emitC();

    component.reset();

    expect(component.combineLatestLog).toEqual([]);
    expect(component.mergeLog).toEqual([]);
    expect(component.forkJoinLog).toEqual([]);
    expect(component.hasEmittedA).toBeFalse();
    expect(component.forkJoinDone).toBeFalse();

    // streams are rewired — emitting again still works
    component.emitA();
    expect(component.mergeLog.length).toBe(1);
  });
});
