import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SwmapDemoComponent } from './swmap-demo.component';

describe('SwmapDemoComponent', () => {
  let component: SwmapDemoComponent;
  let fixture: ComponentFixture<SwmapDemoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SwmapDemoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SwmapDemoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
