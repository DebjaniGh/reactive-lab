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
});
