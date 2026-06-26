import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Observable, of, delay } from 'rxjs';

import { SwmapDemoComponent } from './swmap-demo.component';
import { FakeSearchService, SearchResult } from './fake-search.service';

// Deterministic stub — fixed 500ms delay (real service uses a random delay)
class StubSearchService {
  search(query: string): Observable<SearchResult> {
    return of({ query, items: [`${query}-result`], duration: 500 }).pipe(delay(500));
  }
}

describe('SwmapDemoComponent', () => {
  let component: SwmapDemoComponent;
  let fixture: ComponentFixture<SwmapDemoComponent>;

  function type(value: string): void {
    const input = component.searchInputRef.nativeElement;
    input.value = value;
    input.dispatchEvent(new Event('input'));
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SwmapDemoComponent],
    })
      .overrideComponent(SwmapDemoComponent, {
        set: { providers: [{ provide: FakeSearchService, useClass: StubSearchService }] },
      })
      .compileComponents();

    fixture = TestBed.createComponent(SwmapDemoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges(); // ngAfterViewInit → pipeline
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should ignore empty queries', fakeAsync(() => {
    type('');
    tick(component.debounceMs);
    tick(500);
    expect(component.totalRequests).toBe(0);
  }));

  it('should run a search and surface results after debounce + delay', fakeAsync(() => {
    type('angular');
    tick(component.debounceMs);
    tick(500); // service delay
    expect(component.totalRequests).toBe(1);
    expect(component.completedRequests).toBe(1);
    expect(component.results).toEqual(['angular-result']);
  }));

  it('switchMap should cancel an in-flight request when a new query arrives', fakeAsync(() => {
    type('a');
    tick(component.debounceMs);
    // first request now loading; new distinct query arrives before it resolves
    type('ab');
    tick(component.debounceMs);
    tick(500); // let the second request finish
    expect(component.cancelledRequests).toBe(1);
    expect(component.completedRequests).toBe(1);
    expect(component.results).toEqual(['ab-result']);
  }));

  it('onClear should reset all state', fakeAsync(() => {
    type('angular');
    tick(component.debounceMs);
    tick(500);
    component.onClear();
    expect(component.requests).toEqual([]);
    expect(component.results).toEqual([]);
    expect(component.totalRequests).toBe(0);
    expect(component.cancelledRequests).toBe(0);
  }));
});
