import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PipeDemoComponent } from './pipe-demo.component';

describe('PipeDemoComponent', () => {
  let component: PipeDemoComponent;
  let fixture: ComponentFixture<PipeDemoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PipeDemoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PipeDemoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should map value * 10 and record a pipeline entry on emit', () => {
    component.inputValue = 1;
    component.onEmit();
    expect(component.pipeline.length).toBe(1);
    expect(component.pipeline[0].raw).toBe(1);
    expect(component.pipeline[0].mapped).toBe(10);
  });

  it('should BLOCK values whose mapped result is <= 25', () => {
    component.inputValue = 2; // mapped = 20, blocked
    component.onEmit();
    expect(component.pipeline[0].passed).toBeFalse();
    expect(component.log.some((l) => l.includes('BLOCKED'))).toBeTrue();
    expect(component.log.some((l) => l.includes('subscribe() received'))).toBeFalse();
  });

  it('should PASS values whose mapped result is > 25', () => {
    component.inputValue = 3; // mapped = 30, passes
    component.onEmit();
    expect(component.pipeline[0].passed).toBeTrue();
    expect(component.log.some((l) => l.includes('PASSED'))).toBeTrue();
    expect(component.log.some((l) => l.includes('subscribe() received: 30'))).toBeTrue();
  });

  it('onClear should reset pipeline and log', () => {
    component.inputValue = 3;
    component.onEmit();
    component.onClear();
    expect(component.pipeline).toEqual([]);
    expect(component.log).toEqual([]);
  });
});
