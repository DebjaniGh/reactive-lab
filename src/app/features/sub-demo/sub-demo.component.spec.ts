import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubDemoComponent } from './sub-demo.component';

describe('SubDemoComponent', () => {
  let component: SubDemoComponent;
  let fixture: ComponentFixture<SubDemoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubDemoComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SubDemoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not be subscribed initially', () => {
    expect(component.isSubscribed).toBeFalse();
    expect(component.timeline).toEqual([]);
  });

  it('onSubscribe should mark as subscribed', () => {
    component.onSubscribe();
    expect(component.isSubscribed).toBeTrue();
  });

  it('should receive emitted events while subscribed', () => {
    component.onSubscribe();
    component.onEmit();
    expect(component.timeline.length).toBe(1);
    expect(component.timeline[0].label).toContain('Event #1');
  });

  it('should NOT receive events when not subscribed', () => {
    component.onEmit();
    expect(component.timeline.length).toBe(0);
    expect(component.log.some((l) => l.includes('no one listening'))).toBeTrue();
  });

  it('onUnsubscribe should stop receiving events', () => {
    component.onSubscribe();
    component.onEmit();
    component.onUnsubscribe();
    component.onEmit();
    expect(component.isSubscribed).toBeFalse();
    expect(component.timeline.length).toBe(1); // only the first emit landed
  });

  it('should ignore duplicate subscribe calls', () => {
    component.onSubscribe();
    component.onSubscribe();
    component.onEmit();
    expect(component.timeline.length).toBe(1); // not doubled
  });
});
