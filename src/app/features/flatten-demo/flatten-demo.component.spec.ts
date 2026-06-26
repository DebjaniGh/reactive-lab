import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';

import { FlattenDemoComponent } from './flatten-demo.component';

describe('FlattenDemoComponent', () => {
  let component: FlattenDemoComponent;
  let fixture: ComponentFixture<FlattenDemoComponent>;

  // column indices: 0 switchMap, 1 mergeMap, 2 concatMap, 3 exhaustMap
  const SWITCH = 0;
  const EXHAUST = 3;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FlattenDemoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FlattenDemoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should expose four operator columns', () => {
    expect(component.columns.map((c) => c.name)).toEqual([
      'switchMap',
      'mergeMap',
      'concatMap',
      'exhaustMap',
    ]);
  });

  it('onEmitTask should add a loading entry to every column', () => {
    component.onEmitTask();
    component.columns.forEach((col) => {
      expect(col.entries.length).toBe(1);
      expect(col.entries[0].status).toBe('loading');
    });
  });

  it('switchMap should cancel the previous task when a new one arrives', () => {
    component.onEmitTask();
    component.onEmitTask(); // second emission cancels the first
    expect(component.columns[SWITCH].cancelled).toBe(1);
  });

  it('exhaustMap should ignore a new task while busy', () => {
    component.onEmitTask();
    component.onEmitTask(); // exhaustMap is busy → ignores this
    expect(component.columns[EXHAUST].ignored).toBe(1);
  });

  it('mergeMap should complete all tasks after the delay', fakeAsync(() => {
    component.onEmitTask();
    tick(component.taskDuration);
    expect(component.columns[1].completed).toBe(1);
    expect(component.columns[1].entries[0].status).toBe('completed');
  }));

  it('onClear should reset every column and the log', () => {
    component.onEmitTask();
    component.onClear();
    component.columns.forEach((col) => {
      expect(col.entries).toEqual([]);
      expect(col.completed).toBe(0);
      expect(col.cancelled).toBe(0);
      expect(col.ignored).toBe(0);
      expect(col.active).toBe(0);
    });
    expect(component.log).toEqual([]);
  });
});
