// error-demo.component.ts

import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  Subject,
  Subscription,
  switchMap,
  catchError,
  retry,
  throwError,
  of,
  delay,
  tap,
  Observable,
} from 'rxjs';

interface RequestResult {
  query: string;
  data: string[];
  status: 'success' | 'error' | 'recovered';
}

interface LogEntry {
  id: number;
  panel: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

type SimulateMode = 'success' | 'error-404' | 'error-500';

@Component({
  selector: 'app-error-demo',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './error-demo.component.html',
  styleUrl: './error-demo.component.scss',
})
export class ErrorDemoComponent implements OnDestroy {

  // ── One Subject per panel — all receive same query ──
  private panel1$$ = new Subject<SimulateMode>();
  private panel2$$ = new Subject<SimulateMode>();
  private panel3$$ = new Subject<SimulateMode>();

  // ── Subscriptions ──
  private subs = new Subscription();

  // ── Log ──
  log: LogEntry[] = [];
  private logCounter = 0;

  // ── Panel 1: No catchError inside switchMap ──
  panel1Results: RequestResult[] = [];
  panel1Alive = true;
  panel1AttemptCount = 0;

  // ── Panel 2: catchError INSIDE switchMap ──
  panel2Results: RequestResult[] = [];
  panel2Alive = true;
  panel2AttemptCount = 0;

  // ── Panel 3: retry(3) + catchError ──
  panel3Results: RequestResult[] = [];
  panel3Alive = true;
  panel3AttemptCount = 0;
  panel3RetryCount = 0;

  constructor() {
    this.setupPanel1();
    this.setupPanel2();
    this.setupPanel3();
  }

  // ── Simulate a fake API call ──
  private fakeApi(mode: SimulateMode): Observable<string[]> {
    return of(mode).pipe(
      delay(800),
      switchMap((m) => {
        if (m === 'success') {
          return of(['Result 1', 'Result 2', 'Result 3']);
        }
        if (m === 'error-404') {
          return throwError(() => ({ status: 404, message: 'Not Found' }));
        }
        return throwError(() => ({ status: 500, message: 'Server Error' }));
      })
    );
  }

  // ── Panel 1: catchError OUTSIDE switchMap ──
  // Stream dies permanently on first error
  private setupPanel1(): void {
    const sub = this.panel1$$
      .pipe(
        tap((mode) => {
          this.panel1AttemptCount++;
          this.addLog('1️⃣', `Panel 1: attempting "${mode}"`, 'info');
        }),
        switchMap((mode) => this.fakeApi(mode)),
        // ❌ catchError is OUTSIDE switchMap
        // This catches errors from the OUTER stream
        // Once triggered, the outer stream TERMINATES
        catchError((err) => {
          this.panel1Alive = false;
          this.addLog(
            '1️⃣',
            `Panel 1: ❌ ERROR ${err.status} caught OUTSIDE switchMap — stream TERMINATED`,
            'error'
          );
          this.panel1Results.unshift({
            query: 'error',
            data: [],
            status: 'error',
          });
          return of([]);  // returns fallback, but stream is now dead
        })
      )
      .subscribe({
        next: (data) => {
          if (data.length > 0) {
            this.panel1Results.unshift({
              query: 'success',
              data,
              status: 'success',
            });
            this.addLog('1️⃣', `Panel 1: ✅ received ${data.length} results`, 'success');
          }
        },
        error: () => {
          this.panel1Alive = false;
        },
        complete: () => {
          this.panel1Alive = false;
          this.addLog('1️⃣', 'Panel 1: ⚠️ stream completed (terminated)', 'warning');
        }
      });

    this.subs.add(sub);
  }

  // ── Panel 2: catchError INSIDE switchMap ──
  // Stream survives every error
  private setupPanel2(): void {
    const sub = this.panel2$$
      .pipe(
        tap((mode) => {
          this.panel2AttemptCount++;
          this.addLog('2️⃣', `Panel 2: attempting "${mode}"`, 'info');
        }),
        switchMap((mode) =>
          // ✅ catchError is INSIDE switchMap
          // This catches errors from the INNER Observable only
          // The outer stream stays alive
          this.fakeApi(mode).pipe(
            catchError((err) => {
              this.addLog(
                '2️⃣',
                `Panel 2: ❌ ERROR ${err.status} caught INSIDE switchMap — stream SURVIVES`,
                'error'
              );

              if (err.status === 404) {
                // Recoverable — return empty results
                this.panel2Results.unshift({
                  query: 'error-404',
                  data: ['No results found'],
                  status: 'recovered',
                });
                return of(['No results found']);
              }

              // Fatal — return error indicator but stream still lives
              this.panel2Results.unshift({
                query: 'error-500',
                data: [],
                status: 'error',
              });
              return of([]);
            })
          )
        )
      )
      .subscribe({
        next: (data) => {
          if (data.length > 0 && data[0] !== 'No results found') {
            this.panel2Results.unshift({
              query: 'success',
              data,
              status: 'success',
            });
            this.addLog('2️⃣', `Panel 2: ✅ received ${data.length} results`, 'success');
          }
        },
        error: () => {
          this.panel2Alive = false;
          this.addLog('2️⃣', 'Panel 2: ❌ stream terminated (should not happen)', 'error');
        }
      });

    this.subs.add(sub);
  }

  // ── Panel 3: retry(3) + catchError ──
  // Automatically retries 3 times before giving up
  private setupPanel3(): void {
    const sub = this.panel3$$
      .pipe(
        tap((mode) => {
          this.panel3AttemptCount++;
          this.panel3RetryCount = 0;
          this.addLog('3️⃣', `Panel 3: attempting "${mode}"`, 'info');
        }),
        switchMap((mode) =>
          this.fakeApi(mode).pipe(
            // retry(3) resubscribes up to 3 times on error
            retry({
              count: 3,
              delay: (err, retryCount) => {
                this.panel3RetryCount = retryCount;
                this.addLog(
                  '3️⃣',
                  `Panel 3: 🔄 retry attempt ${retryCount}/3 (${err.status})`,
                  'warning'
                );
                return of(null).pipe(delay(500)); // wait 500ms between retries
              }
            }),
            catchError((err) => {
              this.addLog(
                '3️⃣',
                `Panel 3: ❌ all 3 retries failed (${err.status}) — recovering`,
                'error'
              );
              this.panel3Results.unshift({
                query: `error-after-retries`,
                data: [],
                status: 'error',
              });
              return of([]);
            })
          )
        )
      )
      .subscribe({
        next: (data) => {
          if (data.length > 0) {
            this.panel3Results.unshift({
              query: 'success',
              data,
              status: 'success',
            });
            this.addLog(
              '3️⃣',
              `Panel 3: ✅ succeeded after ${this.panel3RetryCount} retries`,
              'success'
            );
          }
        }
      });

    this.subs.add(sub);
  }

  // ── Template Actions ──

  onSimulate(mode: SimulateMode): void {
    this.addLog('📡', `Emitting "${mode}" to all panels`, 'info');

    if (this.panel1Alive) {
      this.panel1$$.next(mode);
    } else {
      this.addLog('1️⃣', 'Panel 1: ❌ stream is dead — ignoring emission', 'error');
    }

    this.panel2$$.next(mode);
    this.panel3$$.next(mode);
  }

  onReset(): void {
    this.subs.unsubscribe();
    this.subs = new Subscription();

    // Reset all state
    this.panel1Results = [];
    this.panel2Results = [];
    this.panel3Results = [];
    this.panel1Alive = true;
    this.panel2Alive = true;
    this.panel3Alive = true;
    this.panel1AttemptCount = 0;
    this.panel2AttemptCount = 0;
    this.panel3AttemptCount = 0;
    this.panel3RetryCount = 0;
    this.log = [];
    this.logCounter = 0;

    // Fresh subjects
    (this as any).panel1$$ = new Subject<SimulateMode>();
    (this as any).panel2$$ = new Subject<SimulateMode>();
    (this as any).panel3$$ = new Subject<SimulateMode>();

    this.setupPanel1();
    this.setupPanel2();
    this.setupPanel3();
  }

  private addLog(
    panel: string,
    message: string,
    type: 'success' | 'error' | 'warning' | 'info'
  ): void {
    this.logCounter++;
    this.log.unshift({
      id: this.logCounter,
      panel,
      message,
      type,
    });
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
}