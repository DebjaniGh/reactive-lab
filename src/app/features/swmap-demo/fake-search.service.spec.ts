import { TestBed } from '@angular/core/testing';

import { FakeSearchService } from './fake-search.service';

describe('FakeSearchService', () => {
  let service: FakeSearchService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FakeSearchService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
