// signal-demo.component.ts

import {
  Component,
  OnDestroy,
  signal,
  computed,
  effect,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { BehaviorSubject, Subscription, map } from 'rxjs';

interface LogEntry {
  id: number;
  panel: string;
  message: string;
  type: 'update' | 'derive' | 'cleanup' | 'info';
}

@Component({
  selector: 'app-signal-demo',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './signals-demo.component.html',
  styleUrl: './signals-demo.component.scss',
})
export class SignalDemoComponent implements OnDestroy {

  // ── Logs ──
  bsLog: LogEntry[] = [];
  sigLog: LogEntry[] = [];
  private bsLogCounter = 0;
  private sigLogCounter = 0;

  // ═══════════════════════════════════════════
  // Panel 1: BehaviorSubject (Push-based)
  // ═══════════════════════════════════════════

  // Private BehaviorSubject — only this component can write
  private count$$ = new BehaviorSubject<number>(0);

  // Public Observable — template subscribes via async pipe
  count$ = this.count$$.asObservable();

  // Derived state — computed from count$ using map()
  doubled$ = this.count$.pipe(map(c => c * 2));
  isEven$ = this.count$.pipe(map(c => c % 2 === 0));

  // Subscription tracking
  bsSubscriptionCount = 0;
  private bsSubs = new Subscription();

  // Track subscriptions for display
  bsActiveSubscriptions: string[] = [];

  constructor() {
    // Each pipe creates a subscription that needs cleanup
    this.bsSubscriptionCount = 3; // count$, doubled$, isEven$ via async pipe
    this.bsActiveSubscriptions = ['count$ | async', 'doubled$ | async', 'isEven$ | async'];

    this.addBsLog('📡', 'BehaviorSubject created with initial value: 0', 'info');
    this.addBsLog('📡', `${this.bsSubscriptionCount} subscriptions needed (via async pipe)`, 'info');

    // ═══════════════════════════════════════════
    // Panel 2: Signal (Pull-based) — setup in fields
    // ═══════════════════════════════════════════

    this.addSigLog('⚡', 'Signal created with initial value: 0', 'info');
    this.addSigLog('⚡', '0 subscriptions needed — zero cleanup!', 'info');

    // Effect — runs automatically when any signal it reads changes
    effect(() => {
      const current = this.signalCount();
      this.addSigLog('⚡', `effect() detected change: count = ${current}`, 'derive');
    });
  }

  // ═══════════════════════════════════════════
  // Panel 2: Signal (Pull-based)
  // ═══════════════════════════════════════════

  // Signal — a reactive variable
  signalCount = signal(0);

  // Computed — derived state, automatically recalculated
  signalDoubled = computed(() => this.signalCount() * 2);
  signalIsEven = computed(() => this.signalCount() % 2 === 0);

  // ── BehaviorSubject Actions ──

  bsIncrement(): void {
    const next = this.count$$.getValue() + 1;
    this.count$$.next(next);
    this.addBsLog('📡', `count$$.next(${next}) — pushed to all subscribers`, 'update');
  }

  bsDecrement(): void {
    const next = this.count$$.getValue() - 1;
    this.count$$.next(next);
    this.addBsLog('📡', `count$$.next(${next}) — pushed to all subscribers`, 'update');
  }

  bsReset(): void {
    this.count$$.next(0);
    this.addBsLog('📡', 'count$$.next(0) — reset', 'update');
  }

  // ── Signal Actions ──

  sigIncrement(): void {
    this.signalCount.update(v => v + 1);
    this.addSigLog('⚡', `count.update(${this.signalCount()}) — Angular auto-updates views`, 'update');
  }

  sigDecrement(): void {
    this.signalCount.update(v => v - 1);
    this.addSigLog('⚡', `count.update(${this.signalCount()}) — Angular auto-updates views`, 'update');
  }

  sigReset(): void {
    this.signalCount.set(0);
    this.addSigLog('⚡', 'count.set(0) — reset', 'update');
  }

  clearBsLog(): void {
    this.bsLog = [];
    this.bsLogCounter = 0;
  }

  clearSigLog(): void {
    this.sigLog = [];
    this.sigLogCounter = 0;
  }

  private addBsLog(
    panel: string,
    message: string,
    type: 'update' | 'derive' | 'cleanup' | 'info'
  ): void {
    this.bsLogCounter++;
    this.bsLog.unshift({ id: this.bsLogCounter, panel, message, type });
  }

  private addSigLog(
    panel: string,
    message: string,
    type: 'update' | 'derive' | 'cleanup' | 'info'
  ): void {
    this.sigLogCounter++;
    this.sigLog.unshift({ id: this.sigLogCounter, panel, message, type });
  }

  ngOnDestroy(): void {
    this.bsSubs.unsubscribe();
    this.addBsLog('📡', 'ngOnDestroy: manual cleanup required for BehaviorSubject', 'cleanup');
    this.addSigLog('⚡', 'ngOnDestroy: NO cleanup needed for Signals', 'cleanup');
  }
}