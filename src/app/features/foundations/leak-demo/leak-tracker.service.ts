// leak-tracker.service.ts
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable() // provided at component level (not root)
export class LeakTrackerService {
  // This Subject lives in the PARENT's injector,
  // so it survives the child's destruction
  readonly zombieTick$$ = new Subject<number>();

  // A "kill switch" stream — emits when we want to force-stop ALL subscriptions
  readonly forceKill$$ = new Subject<void>();

  reportZombie(tick: number): void {
    this.zombieTick$$.next(tick);
  }

  // Trigger the kill switch
  killAll(): void {
    this.forceKill$$.next();
  }
}
