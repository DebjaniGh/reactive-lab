import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CombineDemoComponent } from './combine-demo.component';

describe('CombineDemoComponent', () => {
  let component: CombineDemoComponent;
  let fixture: ComponentFixture<CombineDemoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CombineDemoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CombineDemoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
