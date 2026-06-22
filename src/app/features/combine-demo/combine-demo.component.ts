import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  Subject,
  combineLatest,
  merge,
  forkJoin,
  Subscription
} from 'rxjs';

interface EmitLog {
  value: any;
  timestamp: string;
}

@Component({
  selector: 'app-combine-demo',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './combine-demo.component.html',
  styleUrls: ['./combine-demo.component.scss']
})
export class CombinationOperatorsComponent implements OnDestroy {

  // ── Sources ──────────────────────────────────────────────
  private sourceA$ = new Subject<string>();
  private sourceB$ = new Subject<string>();
  private sourceC$ = new Subject<string>();

  private counterA = 0;
  private counterB = 0; 
  private counterC = 0;

  // ── Logs ─────────────────────────────────────────────────
  combineLatestLog: EmitLog[] = [];
  mergeLog:         EmitLog[] = [];
  forkJoinLog:      EmitLog[] = [];

  forkJoinStatus = 'Waiting for all sources to complete...';
  forkJoinDone   = false;

  // ── Subscriptions ────────────────────────────────────────
  private subs = new Subscription();

  /* ── forkJoin helpers ───────────────────────────────────── 
   Separate subjects just for forkJoin

   Why not reuse sourceA$, sourceB$, sourceC$?
   Problem with reusing:
    ─────────────────────────────────────────────────
    sourceA$.complete()  ← would complete the source
                            used by combineLatest too!
                            combineLatest would BREAK 

    Solution:
    ─────────────────────────────────────────────────
    forkA$ is a COPY that only forkJoin listens to
    Completing forkA$ doesn't affect sourceA$ 
   */
 
  private forkA$ = new Subject<string>();
  private forkB$ = new Subject<string>();
  private forkC$ = new Subject<string>();
  forkACompleted = false;
  forkBCompleted = false;
  forkCCompleted = false;

  ngOnInit(): void {
    this.setupCombineLatest();
    this.setupMerge();
    this.setupForkJoin();
  }
  
  private setupCombineLatest(): void {
    const sub = combineLatest([
      this.sourceA$,
      this.sourceB$,
      this.sourceC$
    ]).subscribe(([a, b, c]) => {
      this.combineLatestLog.push({
        value: `[${a}, ${b}, ${c}]`,
        timestamp: this.now()
      });
    });
    this.subs.add(sub);
  }

  private setupMerge(): void {
    const sub = merge(
      this.sourceA$,
      this.sourceB$,
      this.sourceC$
    ).subscribe(value => {
      this.mergeLog.push({ value, timestamp: this.now() });
    });
    this.subs.add(sub);
  }

  private setupForkJoin(): void {
    const sub = forkJoin({
      a: this.forkA$,
      b: this.forkB$,
      c: this.forkC$
    }).subscribe({
      next: result => {
        this.forkJoinLog.push({
          value: `{ a: ${result.a}, b: ${result.b}, c: ${result.c} }`,
          timestamp: this.now()
        });
        this.forkJoinStatus = '✅ All completed! Got last values:';
        this.forkJoinDone = true;
      },
      error: err => {
        this.forkJoinStatus = `❌ Error: ${err}`;
      }
    });
    this.subs.add(sub);
  }

  // ── Emit buttons ──────────────────────────────────────────
  emitA(): void {
    const val = `A${++this.counterA}`;
    this.sourceA$.next(val);
    // also push to forkJoin source if not completed
    if (!this.forkACompleted) this.forkA$.next(val);
  }

  emitB(): void {
    const val = `B${++this.counterB}`;
    this.sourceB$.next(val);
    if (!this.forkBCompleted) this.forkB$.next(val);
  }

  emitC(): void {
    const val = `C${++this.counterC}`;
    this.sourceC$.next(val);
    if (!this.forkCCompleted) this.forkC$.next(val);
  }

  // ── forkJoin complete buttons ────────────────────────────
  completeA(): void {
    if (!this.forkACompleted) {
      this.forkACompleted = true;
      this.forkA$.complete();
    }
  }

  completeB(): void {
    if (!this.forkBCompleted) {
      this.forkBCompleted = true;
      this.forkB$.complete();
    }
  }

  completeC(): void {
    if (!this.forkCCompleted) {
      this.forkCCompleted = true;
      this.forkC$.complete();
    }
  }

  reset(): void {
    // Step 1: Kill all subscriptions
    this.subs.unsubscribe();
    this.subs = new Subscription();

    // Step 2: Create brand new Subjects
    // (old ones are dead after unsubscribe)
    this.sourceA$ = new Subject<string>();
    this.sourceB$ = new Subject<string>();
    this.sourceC$ = new Subject<string>();
    this.forkA$   = new Subject<string>();
    this.forkB$   = new Subject<string>();
    this.forkC$   = new Subject<string>();

    // Step 3: Clear all log arrays
    this.counterA = this.counterB = this.counterC = 0;
    this.combineLatestLog = [];
    this.mergeLog         = [];
    this.forkJoinLog      = [];
    this.forkJoinStatus   = 'Waiting for all sources to complete...';
    this.forkJoinDone     = false;
    this.forkACompleted   = false;
    this.forkBCompleted   = false;
    this.forkCCompleted   = false;

    // Step 4: Re-wire all subscriptions
    this.setupCombineLatest();
    this.setupMerge();
    this.setupForkJoin();
  }

  // ── Utilities ────────────────────────────────────────────
  private now(): string {
    return new Date().toLocaleTimeString('en', { hour12: false });
  }

  clearLog(operator: 'combineLatest' | 'merge' | 'forkJoin'): void {
    if (operator === 'combineLatest') this.combineLatestLog = [];
    if (operator === 'merge')         this.mergeLog = [];
    if (operator === 'forkJoin')      this.forkJoinLog = [];
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
}