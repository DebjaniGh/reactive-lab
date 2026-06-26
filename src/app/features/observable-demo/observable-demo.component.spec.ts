import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ObservableDemoComponent } from './observable-demo.component';

describe('ObservableDemoComponent', () => {
  let component: ObservableDemoComponent;
  let fixture: ComponentFixture<ObservableDemoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ObservableDemoComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ObservableDemoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should start with no emitted events', () => {
    expect(component.emittedEvents).toEqual([]);
  });

  it('should emit an event when the button is clicked', () => {
    const button = fixture.nativeElement.querySelector('button');
    button.click();
    expect(component.emittedEvents.length).toBe(1);
    expect(component.emittedEvents[0].label).toContain('Event 1');
  });

  it('should accumulate multiple events with incrementing ids', () => {
    const button = fixture.nativeElement.querySelector('button');
    button.click();
    button.click();
    button.click();
    expect(component.emittedEvents.length).toBe(3);
    expect(component.emittedEvents[2].id).toBe(3);
  });
});
