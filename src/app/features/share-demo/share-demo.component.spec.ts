import { ComponentFixture, TestBed } from '@angular/core/testing';

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

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
