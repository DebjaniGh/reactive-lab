import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FlattenDemoComponent } from './flatten-demo.component';

describe('FlattenDemoComponent', () => {
  let component: FlattenDemoComponent;
  let fixture: ComponentFixture<FlattenDemoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FlattenDemoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FlattenDemoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
