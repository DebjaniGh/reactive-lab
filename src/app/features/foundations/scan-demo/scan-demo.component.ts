// scan-demo.component.ts

import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, Subscription, scan, tap } from 'rxjs';

// ── Types ──

interface LogEntry {
  id: number;
  panel: string;
  message: string;
}

// ── Reducer (pure function) ──

function counterReducer(acc: number, val: number): number {
  return acc + val;
}

@Component({
  selector: 'app-scan-demo',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './scan-demo.component.html',
  styleUrl: './scan-demo.component.scss',
})
export class ScanDemoComponent implements OnDestroy {
  // The Subject — entry point for counter events
  private counter$$ = new Subject<number>();

  // Subscription tracker
  private subs: Subscription[] = [];

  // Public state for template
  counterValue = 0;
  log: LogEntry[] = [];

  // Log counter
  private logCounter = 0;

  constructor() {
    this.setupCounter();
  }

  // ── Counter Pipeline ──
  private setupCounter(): void {
    const sub = this.counter$$
      .pipe(
        // scan() receives each value and accumulates it
        scan(counterReducer, 0),

        // tap() logs the pipeline step (peek without modifying)
        tap((acc) => {
          this.addLog('🔢', `acc + val → new acc: ${acc}`);
        }),
      )
      .subscribe((value) => {
        // The accumulated value updates the template
        this.counterValue = value;
      });

    this.subs.push(sub);
  }

  // ── Template Actions ──

  onCounter(value: number): void {
    this.counter$$.next(value);
  }

  onClearLog(): void {
    this.log = [];
    this.logCounter = 0;
  }

  // ── Helpers ──

  private addLog(panel: string, message: string): void {
    this.logCounter++;
    this.log.unshift({
      id: this.logCounter,
      panel,
      message,
    });
  }

  ngOnDestroy(): void {
    this.subs.forEach((s) => s.unsubscribe());
    this.counter$$.complete();
  }
}
