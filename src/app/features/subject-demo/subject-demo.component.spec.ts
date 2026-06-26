import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubjectDemoComponent } from './subject-demo.component';

describe('SubjectDemoComponent', () => {
  let component: SubjectDemoComponent;
  let fixture: ComponentFixture<SubjectDemoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubjectDemoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SubjectDemoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('onEmit should deliver to all early subscribers', () => {
    component.onEmit();
    component.panels.forEach((panel) => {
      expect(panel.earlyEntries.length).toBeGreaterThan(0);
    });
  });

  it('plain Subject late subscriber should receive NOTHING from before', () => {
    component.onEmit(); // Value 1
    component.onEmit(); // Value 2
    component.onAddLateSubscriber();
    // panels[0] = Subject
    expect(component.panels[0].lateEntries.length).toBe(0);
  });

  it('BehaviorSubject late subscriber should receive the most recent value', () => {
    component.onEmit(); // Value 1
    component.onEmit(); // Value 2
    component.onAddLateSubscriber();
    // panels[1] = BehaviorSubject → 1 replayed value (latest)
    expect(component.panels[1].lateEntries.length).toBe(1);
    expect(component.panels[1].lateEntries[0].value).toBe('Value 2');
  });

  it('ReplaySubject(2) late subscriber should receive the last 2 values', () => {
    component.onEmit(); // Value 1
    component.onEmit(); // Value 2
    component.onEmit(); // Value 3
    component.onAddLateSubscriber();
    // panels[2] = ReplaySubject(2) → last 2 buffered
    expect(component.panels[2].lateEntries.length).toBe(2);
  });

  it('should not add late subscribers twice', () => {
    component.onEmit();
    component.onAddLateSubscriber();
    component.onAddLateSubscriber();
    expect(component.log.some((l) => l.message.includes('already added'))).toBeTrue();
  });

  it('onReset should clear late subscribers and reset emission counters', () => {
    component.onEmit();
    component.onAddLateSubscriber();
    component.onReset();

    component.panels.forEach((panel) => {
      expect(panel.lateEntries).toEqual([]);
      expect(panel.hasLateSubscriber).toBeFalse();
    });

    // plain Subject early subscriber receives nothing until a new emit
    expect(component.panels[0].earlyEntries).toEqual([]);
    // BehaviorSubject re-emits its initial value to the fresh early subscriber
    expect(component.panels[1].earlyEntries.length).toBe(1);
    expect(component.panels[1].earlyEntries[0].value).toBe('initial');
  });
});
