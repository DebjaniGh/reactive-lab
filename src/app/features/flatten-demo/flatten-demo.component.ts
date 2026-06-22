// flatten-demo.component.ts

import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  Subject,
  Subscription,
  switchMap,
  mergeMap,
  concatMap,
  exhaustMap,
  tap,
  finalize,
} from 'rxjs';
import { FakeTaskService, TaskResult } from './fake-task.service';

type TaskStatus = 'loading' | 'completed' | 'cancelled' | 'ignored';

interface TaskEntry {
  id: number;
  task: string;
  status: TaskStatus;
  duration?: number;
  timestamp: Date;
}

interface LogEntry {
  id: number;
  stage: string;
  message: string;
}

type OperatorName = 'switchMap' | 'mergeMap' | 'concatMap' | 'exhaustMap';

interface OperatorColumn {
  name: OperatorName;
  icon: string;
  label: string;
  description: string;
  entries: TaskEntry[];
  completed: number;
  cancelled: number;
  ignored: number;
  active: number;
}

@Component({
  selector: 'app-flatten-demo',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './flatten-demo.component.html',
  styleUrl: './flatten-demo.component.scss',
})
export class FlattenDemoComponent implements OnDestroy {

  // ── One Subject per operator — all receive the same emissions ──
  private switch$$ = new Subject<string>();
  private merge$$ = new Subject<string>();
  private concat$$ = new Subject<string>();
  private exhaust$$ = new Subject<string>();

  // ── Subscriptions ──
  private subs: Subscription[] = [];

  // ── Task duration ──
  taskDuration = 2000;

  // ── Task counter ──
  private taskCounter = 0;
  private taskLabels = ['A', 'B', 'C', 'D', 'E', 'F'];

  // ── Log ──
  log: LogEntry[] = [];
  private logCounter = 0;

  // ── Four operator columns ──
  columns: OperatorColumn[] = [
    {
      name: 'switchMap',
      icon: '🔀',
      label: 'switchMap',
      description: 'Cancels previous',
      entries: [],
      completed: 0,
      cancelled: 0,
      ignored: 0,
      active: 0,
    },
    {
      name: 'mergeMap',
      icon: '🔄',
      label: 'mergeMap',
      description: 'Runs all in parallel',
      entries: [],
      completed: 0,
      cancelled: 0,
      ignored: 0,
      active: 0,
    },
    {
      name: 'concatMap',
      icon: '📦',
      label: 'concatMap',
      description: 'Queues in order',
      entries: [],
      completed: 0,
      cancelled: 0,
      ignored: 0,
      active: 0,
    },
    {
      name: 'exhaustMap',
      icon: '🚫',
      label: 'exhaustMap',
      description: 'Ignores while busy',
      entries: [],
      completed: 0,
      cancelled: 0,
      ignored: 0,
      active: 0,
    },
  ];

  constructor(private taskService: FakeTaskService) {
    this.setupSwitchMap();
    this.setupMergeMap();
    this.setupConcatMap();
    this.setupExhaustMap();
  }

  // ── switchMap: cancels previous ──
  private setupSwitchMap(): void {
    const col = this.columns[0];

    const sub = this.switch$$
      .pipe(
        tap((task) => {
          // Mark any loading entries as cancelled
          col.entries.forEach((e) => {
            if (e.status === 'loading') {
              e.status = 'cancelled';
              col.cancelled++;
              col.active--;
              this.addLog('🔀', `${task} arrived → cancelled previous`);
            }
          });

          col.active++;
          col.entries.unshift({
            id: col.entries.length + 1,
            task,
            status: 'loading',
            timestamp: new Date(),
          });
        }),
        switchMap((task) =>
          this.taskService.run(task, this.taskDuration)
        )
      )
      .subscribe((result) => {
        this.completeTask(col, result);
        this.addLog('🔀', `${result.task} completed (${result.duration}ms)`);
      });

    this.subs.push(sub);
  }

  // ── mergeMap: runs all in parallel ──
  private setupMergeMap(): void {
    const col = this.columns[1];

    const sub = this.merge$$
      .pipe(
        tap((task) => {
          col.active++;
          col.entries.unshift({
            id: col.entries.length + 1,
            task,
            status: 'loading',
            timestamp: new Date(),
          });
          this.addLog('🔄', `${task} started (parallel)`);
        }),
        mergeMap((task) =>
          this.taskService.run(task, this.taskDuration).pipe(
            tap((result) => {
              this.completeTask(col, result);
              this.addLog('🔄', `${result.task} completed (${result.duration}ms)`);
            })
          )
        )
      )
      .subscribe();

    this.subs.push(sub);
  }

  // ── concatMap: queues in order ──
  private setupConcatMap(): void {
    const col = this.columns[2];

    const sub = this.concat$$
      .pipe(
        tap((task) => {
          const status = col.active > 0 ? 'loading' : 'loading';
          col.entries.unshift({
            id: col.entries.length + 1,
            task,
            status: 'loading',
            timestamp: new Date(),
          });
          if (col.active > 0) {
            this.addLog('📦', `${task} queued (waiting for current task)`);
          } else {
            this.addLog('📦', `${task} started (queue empty)`);
          }
          col.active++;
        }),
        concatMap((task) =>
          this.taskService.run(task, this.taskDuration).pipe(
            tap((result) => {
              this.completeTask(col, result);
              this.addLog('📦', `${result.task} completed (${result.duration}ms)`);
            })
          )
        )
      )
      .subscribe();

    this.subs.push(sub);
  }

  // ── exhaustMap: ignores while busy ──
  private setupExhaustMap(): void {
    const col = this.columns[3];

    const sub = this.exhaust$$
      .pipe(
        tap((task) => {
          if (col.active > 0) {
            // exhaustMap will ignore this — mark it visually
            col.entries.unshift({
              id: col.entries.length + 1,
              task,
              status: 'ignored',
              timestamp: new Date(),
            });
            col.ignored++;
            this.addLog('🚫', `${task} IGNORED (busy with current task)`);
          } else {
            col.active++;
            col.entries.unshift({
              id: col.entries.length + 1,
              task,
              status: 'loading',
              timestamp: new Date(),
            });
            this.addLog('🚫', `${task} started (not busy)`);
          }
        }),
        exhaustMap((task) =>
          this.taskService.run(task, this.taskDuration).pipe(
            tap((result) => {
              this.completeTask(col, result);
              this.addLog('🚫', `${result.task} completed (${result.duration}ms)`);
            })
          )
        )
      )
      .subscribe();

    this.subs.push(sub);
  }

  // ── Shared helper: mark task as completed ──
  private completeTask(col: OperatorColumn, result: TaskResult): void {
    const entry = col.entries.find(
      (e) => e.task === result.task && e.status === 'loading'
    );
    if (entry) {
      entry.status = 'completed';
      entry.duration = result.duration;
    }
    col.completed++;
    col.active = Math.max(0, col.active - 1);
  }

  // ── Emit a task to ALL four operators simultaneously ──
  onEmitTask(): void {
    const label = this.taskLabels[this.taskCounter % this.taskLabels.length];
    this.taskCounter++;
    const task = `Task ${label}`;

    this.addLog('📡', `Emitted: ${task} → all 4 operators`);

    // Same task goes to all four operators
    this.switch$$.next(task);
    this.merge$$.next(task);
    this.concat$$.next(task);
    this.exhaust$$.next(task);
  }

  onClear(): void {
    this.columns.forEach((col) => {
      col.entries = [];
      col.completed = 0;
      col.cancelled = 0;
      col.ignored = 0;
      col.active = 0;
    });
    this.log = [];
    this.logCounter = 0;
    this.taskCounter = 0;
  }

  private addLog(stage: string, message: string): void {
    this.logCounter++;
    this.log.unshift({
      id: this.logCounter,
      stage,
      message,
    });
  }

  ngOnDestroy(): void {
    this.subs.forEach((s) => s.unsubscribe());
    this.switch$$.complete();
    this.merge$$.complete();
    this.concat$$.complete();
    this.exhaust$$.complete();
  }
}