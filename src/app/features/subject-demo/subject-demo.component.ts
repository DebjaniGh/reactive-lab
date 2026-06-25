// subject-demo.component.ts

import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  Subject,
  BehaviorSubject,
  ReplaySubject,
  Subscription,
} from 'rxjs';

interface EmissionEntry {
  id: number;
  value: string;
  timestamp: Date;
  isLate: boolean;
}

interface LogEntry {
  id: number;
  panel: string;
  message: string;
  type: 'emit' | 'subscribe' | 'receive' | 'info';
}

interface PanelState {
  name: string;
  icon: string;
  description: string;
  earlyEntries: EmissionEntry[];
  lateEntries: EmissionEntry[];
  hasLateSubscriber: boolean;
  earlyCount: number;
  lateCount: number;
}

@Component({
  selector: 'app-subject-demo',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './subject-demo.component.html',
  styleUrl: './subject-demo.component.scss',
})
export class SubjectDemoComponent implements OnDestroy {

  // ── The three Subject types ──
  private subject$ = new Subject<string>();
  private behavior$ = new BehaviorSubject<string>('initial');
  private replay$ = new ReplaySubject<string>(2); // buffer last 2 values

  // ── Subscriptions ──
  private subs = new Subscription();
  private lateSubs = new Subscription();

  // ── Emission counter ──
  private emitCounter = 0;

  // ── Log ──
  log: LogEntry[] = [];
  private logCounter = 0;

  // ── Panel states ──
  panels: PanelState[] = [
    {
      name: 'Subject',
      icon: '📢',
      description: 'Late subscribers get nothing from before they joined.',
      earlyEntries: [],
      lateEntries: [],
      hasLateSubscriber: false,
      earlyCount: 0,
      lateCount: 0,
    },
    {
      name: 'BehaviorSubject',
      icon: '📺',
      description: 'Late subscribers immediately get the most recent value.',
      earlyEntries: [],
      lateEntries: [],
      hasLateSubscriber: false,
      earlyCount: 0,
      lateCount: 0,
    },
    {
      name: 'ReplaySubject(2)',
      icon: '📹',
      description: 'Late subscribers get the last 2 values replayed.',
      earlyEntries: [],
      lateEntries: [],
      hasLateSubscriber: false,
      earlyCount: 0,
      lateCount: 0,
    },
  ];

  constructor() {
    this.setupEarlySubscribers();
  }

  // ── Early subscribers — subscribed from the start ──
  private setupEarlySubscribers(): void {
    // Subject — early subscriber
    const sub1 = this.subject$.subscribe((value) => {
      this.panels[0].earlyCount++;
      this.panels[0].earlyEntries.unshift({
        id: this.panels[0].earlyCount,
        value,
        timestamp: new Date(),
        isLate: false,
      });
    });

    // BehaviorSubject — early subscriber
    const sub2 = this.behavior$.subscribe((value) => {
      this.panels[1].earlyCount++;
      this.panels[1].earlyEntries.unshift({
        id: this.panels[1].earlyCount,
        value,
        timestamp: new Date(),
        isLate: false,
      });
    });

    // ReplaySubject — early subscriber
    const sub3 = this.replay$.subscribe((value) => {
      this.panels[2].earlyCount++;
      this.panels[2].earlyEntries.unshift({
        id: this.panels[2].earlyCount,
        value,
        timestamp: new Date(),
        isLate: false,
      });
    });

    this.subs.add(sub1);
    this.subs.add(sub2);
    this.subs.add(sub3);

    this.addLog('📺', 'BehaviorSubject early subscriber received initial value: "initial"', 'receive');
  }

  // ── Emit a value to ALL three Subjects ──
  onEmit(): void {
    this.emitCounter++;
    const value = `Value ${this.emitCounter}`;

    this.addLog('📡', `Emitted "${value}" to all three Subjects`, 'emit');

    this.subject$.next(value);
    this.behavior$.next(value);
    this.replay$.next(value);
  }

  // ── Add late subscribers to ALL three ──
  onAddLateSubscriber(): void {
    // Prevent adding multiple late subscribers
    if (this.panels[0].hasLateSubscriber) {
      this.addLog('⚠️', 'Late subscribers already added', 'info');
      return;
    }

    this.addLog('🕐', 'Adding late subscribers to all three Subjects...', 'subscribe');

    // Subject — late subscriber
    this.panels[0].hasLateSubscriber = true;
    const late1 = this.subject$.subscribe((value) => {
      this.panels[0].lateCount++;
      this.panels[0].lateEntries.unshift({
        id: this.panels[0].lateCount,
        value,
        timestamp: new Date(),
        isLate: true,
      });
      this.addLog('📢', `Subject late subscriber received: "${value}"`, 'receive');
    });
    this.addLog('📢', 'Subject: late subscriber got NOTHING — missed all previous values', 'info');

    // BehaviorSubject — late subscriber
    this.panels[1].hasLateSubscriber = true;
    const late2 = this.behavior$.subscribe((value) => {
      this.panels[1].lateCount++;
      this.panels[1].lateEntries.unshift({
        id: this.panels[1].lateCount,
        value,
        timestamp: new Date(),
        isLate: true,
      });
      this.addLog('📺', `BehaviorSubject late subscriber received: "${value}"`, 'receive');
    });

    // ReplaySubject — late subscriber
    this.panels[2].hasLateSubscriber = true;
    const late3 = this.replay$.subscribe((value) => {
      this.panels[2].lateCount++;
      this.panels[2].lateEntries.unshift({
        id: this.panels[2].lateCount,
        value,
        timestamp: new Date(),
        isLate: true,
      });
      this.addLog('📹', `ReplaySubject late subscriber received: "${value}"`, 'receive');
    });

    this.lateSubs.add(late1);
    this.lateSubs.add(late2);
    this.lateSubs.add(late3);
  }

  onReset(): void {
    // Unsubscribe everything
    this.subs.unsubscribe();
    this.lateSubs.unsubscribe();
    this.subs = new Subscription();
    this.lateSubs = new Subscription();

    // Fresh Subjects
    this.subject$ = new Subject<string>();
    this.behavior$ = new BehaviorSubject<string>('initial');
    this.replay$ = new ReplaySubject<string>(2);

    // Reset state
    this.emitCounter = 0;
    this.logCounter = 0;
    this.log = [];

    this.panels.forEach((p) => {
      p.earlyEntries = [];
      p.lateEntries = [];
      p.hasLateSubscriber = false;
      p.earlyCount = 0;
      p.lateCount = 0;
    });

    // Re-setup early subscribers
    this.setupEarlySubscribers();
  }

  private addLog(
    panel: string,
    message: string,
    type: 'emit' | 'subscribe' | 'receive' | 'info'
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
    this.lateSubs.unsubscribe();
  }
}