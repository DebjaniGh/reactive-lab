// fake-task.service.ts

import { Injectable } from '@angular/core';
import { Observable, of, delay, map } from 'rxjs';

export interface TaskResult {
  task: string;
  duration: number;
  timestamp: Date;
}

@Injectable({ providedIn: 'root' })
export class FakeTaskService {

  // Simulates an async task with a fixed delay
  // Using fixed delay (not random) so all 4 operators receive identical conditions
  run(task: string, durationMs: number = 2000): Observable<TaskResult> {
    return of(task).pipe(
      delay(durationMs),
      map((t) => ({
        task: t,
        duration: durationMs,
        timestamp: new Date(),
      }))
    );
  }
}