import { TestBed, fakeAsync, tick } from '@angular/core/testing';

import { FakeSearchService, SearchResult } from './fake-search.service';

describe('FakeSearchService', () => {
  let service: FakeSearchService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FakeSearchService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return matching results for a known query', fakeAsync(() => {
    let result: SearchResult | undefined;
    service.search('rxjs').subscribe((r) => (result = r));
    tick(2000); // cover the max random delay
    expect(result?.query).toBe('rxjs');
    expect(result?.items.length).toBeGreaterThan(0);
  }));

  it('should be case-insensitive', fakeAsync(() => {
    let result: SearchResult | undefined;
    service.search('RXJS').subscribe((r) => (result = r));
    tick(2000);
    expect(result?.items).toContain('RxJS Operators');
  }));

  it('should return a no-results message for an unknown query', fakeAsync(() => {
    let result: SearchResult | undefined;
    service.search('zzzz').subscribe((r) => (result = r));
    tick(2000);
    expect(result?.items[0]).toContain('No results for');
  }));
});
