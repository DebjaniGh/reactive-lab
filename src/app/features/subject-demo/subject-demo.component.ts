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

  // ── Ordered references to pair with panels by index ──
  private get subjects(): Subject<string>[] {
    return [this.subject$, this.behavior$, this.replay$];
  }

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

  // ── Reusable subscriber factory ──
  private subscribeTo(
    source$: Subject<string>,
    panel: PanelState,
    isLate: boolean,
    logOnReceive = false
  ): Subscription {
    return source$.subscribe((value) => {
      const entries = isLate ? panel.lateEntries : panel.earlyEntries;
      const count = isLate ? ++panel.lateCount : ++panel.earlyCount;
      entries.unshift({
        id: count,
        value,
        timestamp: new Date(),
        isLate,
      });
      if (logOnReceive) {
        this.addLog(panel.icon, `${panel.name} late subscriber received: "${value}"`, 'receive');
      }
    });
  }

  // ── Early subscribers — subscribed from the start ──
  private setupEarlySubscribers(): void {
    this.subjects.forEach((source$, i) => {
      this.subs.add(this.subscribeTo(source$, this.panels[i], false));
    });

    this.addLog('📺', 'BehaviorSubject early subscriber received initial value: "initial"', 'receive');
  }

  // ── Emit a value to ALL three Subjects ──
  onEmit(): void {
    this.emitCounter++;
    const value = `Value ${this.emitCounter}`;

    this.addLog('📡', `Emitted "${value}" to all three Subjects`, 'emit');

    this.subjects.forEach((source$) => source$.next(value));
  }

  // ── Add late subscribers to ALL three ──
  onAddLateSubscriber(): void {
    // Prevent adding multiple late subscribers
    if (this.panels[0].hasLateSubscriber) {
      this.addLog('⚠️', 'Late subscribers already added', 'info');
      return;
    }

    this.addLog('🕐', 'Adding late subscribers to all three Subjects...', 'subscribe');

    // Subject — late subscriber gets NOTHING
    this.panels[0].hasLateSubscriber = true;
    this.lateSubs.add(this.subscribeTo(this.subject$, this.panels[0], true, true));
    this.addLog('📢', 'Subject: late subscriber got NOTHING — missed all previous values', 'info');

    // BehaviorSubject — late subscriber gets the most recent value
    this.panels[1].hasLateSubscriber = true;
    this.lateSubs.add(this.subscribeTo(this.behavior$, this.panels[1], true, true));

    // ReplaySubject — late subscriber gets the last 2 buffered values
    this.panels[2].hasLateSubscriber = true;
    this.lateSubs.add(this.subscribeTo(this.replay$, this.panels[2], true, true));
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