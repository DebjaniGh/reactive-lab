import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';

import { ShareDemoComponent } from './share-demo.component';

describe('ShareDemoComponent', () => {
  let component: ShareDemoComponent;
  let fixture: ComponentFixture<ShareDemoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShareDemoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShareDemoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    // tear down any in-flight fake-api timers
    component.ngOnDestroy();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should start with zero HTTP calls', () => {
    expect(component.rawHttpCount).toBe(0);
    expect(component.sharedHttpCount).toBe(0);
  });

  it('raw Observable should trigger a new HTTP call for every subscriber', () => {
    component.onAddRawSubscriber();
    component.onAddRawSubscriber();
    component.onAddRawSubscriber();
    expect(component.rawHttpCount).toBe(3);
    expect(component.rawSubscribers.length).toBe(3);
  });

  it('shareReplay(1) should trigger only ONE HTTP call for many subscribers', () => {
    component.onAddSharedSubscriber();
    component.onAddSharedSubscriber();
    component.onAddSharedSubscriber();
    expect(component.sharedHttpCount).toBe(1);
    expect(component.sharedSubscribers.length).toBe(3);
  });

  it('shared subscribers should receive data after the simulated delay', fakeAsync(() => {
    component.onAddSharedSubscriber();
    component.onAddSharedSubscriber();
    tick(1500); // fake network delay
    expect(component.sharedSubscribers.every((s) => s.status === 'received')).toBeTrue();
    expect(component.sharedHttpCount).toBe(1);
  }));

  it('onReset should clear subscribers and counters', fakeAsync(() => {
    component.onAddRawSubscriber();
    component.onAddSharedSubscriber();
    tick(1500);

    component.onReset();
    expect(component.rawSubscribers).toEqual([]);
    expect(component.sharedSubscribers).toEqual([]);
    expect(component.rawHttpCount).toBe(0);
    expect(component.sharedHttpCount).toBe(0);
  }));
});
