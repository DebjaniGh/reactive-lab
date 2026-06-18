import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubDemoComponent } from './sub-demo.component';

describe('SubDemoComponent', () => {
  let component: SubDemoComponent;
  let fixture: ComponentFixture<SubDemoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubDemoComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SubDemoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
