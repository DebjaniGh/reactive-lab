import { TestBed } from '@angular/core/testing';

import { FakeTaskService } from './fake-task.service';

describe('FakeTaskService', () => {
  let service: FakeTaskService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FakeTaskService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
