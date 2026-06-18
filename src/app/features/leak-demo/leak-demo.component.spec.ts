import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LeakDemoComponent } from './leak-demo.component';

describe('LeakDemoComponent', () => {
  let component: LeakDemoComponent;
  let fixture: ComponentFixture<LeakDemoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LeakDemoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LeakDemoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
