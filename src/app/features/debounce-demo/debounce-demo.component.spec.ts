import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DebounceDemoComponent } from './debounce-demo.component';

describe('DebounceDemoComponent', () => {
  let component: DebounceDemoComponent;
  let fixture: ComponentFixture<DebounceDemoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DebounceDemoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DebounceDemoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
