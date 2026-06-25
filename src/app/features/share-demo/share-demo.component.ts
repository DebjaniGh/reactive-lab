// share-demo.component.ts

import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  Observable,
  Subscription,
  shareReplay,
} from 'rxjs';

interface SubscriberEntry {
  id: number;
  label: string;
  status: 'waiting' | 'received';
  data: string[] | null;
  timestamp: Date | null;
  fromCache: boolean;
}

interface LogEntry {
  id: number;
  panel: string;
  message: string;
  type: 'fetch' | 'receive' | 'cache' | 'info';
}

@Component({
  selector: 'app-share-demo',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './share-demo.component.html',
  styleUrl: './share-demo.component.scss',
})
export class ShareDemoComponent implements OnDestroy {

  // ── Subscriptions ──
  private subs = new Subscription();

  // ── Log ──
  log: LogEntry[] = [];
  private logCounter = 0;

  // ── Panel 1: No sharing (raw Observable) ──
  rawSubscribers: SubscriberEntry[] = [];
  rawHttpCount = 0;
  private rawSubCounter = 0;
  private rawSource$: Observable<string[]> | null = null;

  // ── Panel 2: With shareReplay(1) ──
  sharedSubscribers: SubscriberEntry[] = [];
  sharedHttpCount = 0;
  private sharedSubCounter = 0;
  private sharedSource$: Observable<string[]> | null = null;

  constructor() {
    this.createSources();
  }

  // ── Create the source Observables ──
  private createSources(): void {
    // Raw source — every subscription triggers a new "HTTP call"
    this.rawSource$ = this.createFakeApi('raw');

    // Shared source — one execution, cached and replayed
    this.sharedSource$ = this.createFakeApi('shared').pipe(
      shareReplay(1)
    );
  }

  // ── Simulated HTTP call ──
  private createFakeApi(panel: string): Observable<string[]> {
    return new Observable<string[]>((subscriber) => {
      // This runs on EVERY subscription for raw
      // But only ONCE for shareReplay
      if (panel === 'raw') {
        this.rawHttpCount++;
        this.addLog('❌', `HTTP call #${this.rawHttpCount} triggered (duplicate!)`, 'fetch');
      } else {
        this.sharedHttpCount++;
        this.addLog('✅', `HTTP call #${this.sharedHttpCount} triggered`, 'fetch');
      }

      // Simulate network delay
      const timer = setTimeout(() => {
        const data = ['User Profile', 'Preferences', 'Settings'];
        subscriber.next(data);
        subscriber.complete();
      }, 1500);

      // Cleanup on unsubscribe
      return () => clearTimeout(timer);
    });
  }

  // ── Add subscriber to Panel 1 (no sharing) ──
  onAddRawSubscriber(): void {
    this.rawSubCounter++;
    const label = `Subscriber ${this.rawSubCounter}`;

    const entry: SubscriberEntry = {
      id: this.rawSubCounter,
      label,
      status: 'waiting',
      data: null,
      timestamp: null,
      fromCache: false,
    };

    this.rawSubscribers.push(entry);
    this.addLog('❌', `${label} subscribing (new HTTP call)...`, 'info');

    const sub = this.rawSource$!.subscribe((data) => {
      entry.status = 'received';
      entry.data = data;
      entry.timestamp = new Date();
      this.addLog('❌', `${label} received data (from its own HTTP call)`, 'receive');
    });

    this.subs.add(sub);
  }

  // ── Add subscriber to Panel 2 (with shareReplay) ──
  onAddSharedSubscriber(): void {
    this.sharedSubCounter++;
    const label = `Subscriber ${this.sharedSubCounter}`;

    const entry: SubscriberEntry = {
      id: this.sharedSubCounter,
      label,
      status: 'waiting',
      data: null,
      timestamp: null,
      fromCache: false,
    };

    this.sharedSubscribers.push(entry);

    // Check if data is already cached
    const wasCached = this.sharedHttpCount > 0 && this.sharedSubscribers.some(
      (s) => s.status === 'received'
    );

    if (wasCached) {
      this.addLog('✅', `${label} subscribing (will get CACHED result)...`, 'cache');
    } else {
      this.addLog('✅', `${label} subscribing...`, 'info');
    }

    const sub = this.sharedSource$!.subscribe((data) => {
      const isFromCache = entry.status === 'waiting' &&
        this.sharedSubscribers.filter((s) => s.status === 'received').length > 0;

      entry.status = 'received';
      entry.data = data;
      entry.timestamp = new Date();
      entry.fromCache = isFromCache || wasCached;

      if (entry.fromCache) {
        this.addLog('✅', `${label} received data (from CACHE — no HTTP call!)`, 'cache');
      } else {
        this.addLog('✅', `${label} received data (from shared HTTP call)`, 'receive');
      }
    });

    this.subs.add(sub);
  }

  onReset(): void {
    this.subs.unsubscribe();
    this.subs = new Subscription();

    this.rawSubscribers = [];
    this.sharedSubscribers = [];
    this.rawHttpCount = 0;
    this.sharedHttpCount = 0;
    this.rawSubCounter = 0;
    this.sharedSubCounter = 0;
    this.log = [];
    this.logCounter = 0;

    this.createSources();
  }

  private addLog(
    panel: string,
    message: string,
    type: 'fetch' | 'receive' | 'cache' | 'info'
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