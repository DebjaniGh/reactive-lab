import { TestBed, fakeAsync, tick } from '@angular/core/testing';

import { FakeTaskService, TaskResult } from './fake-task.service';

describe('FakeTaskService', () => {
  let service: FakeTaskService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FakeTaskService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should not emit before the delay elapses', fakeAsync(() => {
    let result: TaskResult | undefined;
    service.run('Task A', 1000).subscribe((r) => (result = r));
    tick(500);
    expect(result).toBeUndefined();
    tick(500);
    expect(result).toBeDefined();
  }));

  it('should emit a TaskResult echoing the task name and duration', fakeAsync(() => {
    let result: TaskResult | undefined;
    service.run('Task B', 2000).subscribe((r) => (result = r));
    tick(2000);
    expect(result?.task).toBe('Task B');
    expect(result?.duration).toBe(2000);
    expect(result?.timestamp instanceof Date).toBeTrue();
  }));
});
