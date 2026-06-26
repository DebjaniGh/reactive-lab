import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScanDemoComponent } from './scan-demo.component';

describe('ScanDemoComponent', () => {
  let component: ScanDemoComponent;
  let fixture: ComponentFixture<ScanDemoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScanDemoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScanDemoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('counter should accumulate values via scan()', () => {
    component.onCounter(1);
    component.onCounter(1);
    component.onCounter(-1);
    expect(component.counterValue).toBe(1);
  });

  it('cart should accumulate items and total via scan()', () => {
    const pizza = component.menu[0];
    const burger = component.menu[1];
    component.onAddToCart(pizza);
    component.onAddToCart(burger);
    expect(component.cartState.count).toBe(2);
    expect(component.cartState.total).toBe(pizza.price + burger.price);
  });

  it('traffic light should transition through the state machine', () => {
    component.onTraffic('GO');
    expect(component.trafficState.color).toBe('green');
    component.onTraffic('STOP');
    expect(component.trafficState.color).toBe('red');
  });

  it('should write entries to the log on each action', () => {
    component.onCounter(5);
    expect(component.log.length).toBeGreaterThan(0);
  });

  it('onClearLog should empty the log', () => {
    component.onCounter(5);
    component.onClearLog();
    expect(component.log).toEqual([]);
  });
});
