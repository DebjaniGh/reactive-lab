import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AppComponent } from './app.component';

describe('AppComponent', () => {
  let fixture: ComponentFixture<AppComponent>;
  let component: AppComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the app', () => {
    expect(component).toBeTruthy();
  });

  it(`should have the 'reactive-lab' title`, () => {
    expect(component.title).toEqual('reactive-lab');
  });

  describe('navItems', () => {
    it('should define a non-empty navigation list', () => {
      expect(component.navItems.length).toBeGreaterThan(0);
    });

    it('should give every nav item a path, label and icon', () => {
      component.navItems.forEach((item) => {
        expect(item.path).toBeTruthy();
        expect(item.label).toBeTruthy();
        expect(item.icon).toBeTruthy();
      });
    });

    it('should have unique paths', () => {
      const paths = component.navItems.map((i) => i.path);
      expect(new Set(paths).size).toBe(paths.length);
    });

    it('should include the signals-demo route', () => {
      expect(component.navItems.some((i) => i.path === 'signals-demo')).toBeTrue();
    });

    it('should render a nav link for each nav item', () => {
      const links = fixture.nativeElement.querySelectorAll('a[mat-list-item]');
      expect(links.length).toBe(component.navItems.length);
    });
  });
});
