import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LeakyChildComponent } from './leaky-child.component';

describe('LeakyChildComponent', () => {
  let component: LeakyChildComponent;
  let fixture: ComponentFixture<LeakyChildComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LeakyChildComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LeakyChildComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
