// leak-demo.component.ts

import { Component, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  LeakyChildComponent,
  CleanupStrategy,
} from './leaky-child/leaky-child.component';
import { LeakTrackerService } from './leak-tracker.service';

interface ZombieEntry {
  id: number;
  tick: number;
  timestamp: Date;
  instance: number;
}

@Component({
  selector: 'app-leak-demo',
  standalone: true,
  imports: [CommonModule, FormsModule, LeakyChildComponent],
  providers: [LeakTrackerService],
  templateUrl: './leak-demo.component.html',
  styleUrl: './leak-demo.component.scss',
})
export class LeakDemoComponent {

  // Strategy selection
  selectedStrategy: CleanupStrategy = 'none';
  strategies: { value: CleanupStrategy; label: string; icon: string }[] = [
    { value: 'none', label: 'No cleanup', icon: '💀' },
    { value: 'manual', label: 'Manual unsubscribe', icon: '🔧' },
    { value: 'takeUntilDestroyed', label: 'takeUntilDestroyed', icon: '✅' },
    { value: 'async', label: 'async pipe', icon: '✅' },
  ];

  // Mount state
  isMounted = false;

  // Tracking leaks
  activeSubs = 0;
  zombieLog: ZombieEntry[] = [];
  mountCount = 0;

  constructor(private leakTracker: LeakTrackerService, private cdr: ChangeDetectorRef) {
    // Subscribe to zombie reports from the (now or future) child
    this.leakTracker.zombieTick$$.subscribe((tick) => {
      this.zombieLog.unshift({
        id: this.zombieLog.length + 1,
        tick,
        timestamp: new Date(),
        instance: this.mountCount,
      });
      this.cdr.detectChanges(); // force re-render (zombie fires outside CD)
    });
  }

  // Derived state
  get isLeaking(): boolean {
    return !this.isMounted && this.activeSubs > 0;
  }

  get statusLabel(): string {
    if (this.isMounted) return '🟢 Component alive — subscription active';
    if (this.isLeaking)
      return '🔴 Component DESTROYED — subscription still running!';
    return '⚪ Component not mounted';
  }

  /** Mount the child component */
  onMount(): void {
    if (this.isMounted) return;

    this.mountCount++;
    this.activeSubs++;
    this.isMounted = true;
  }

  /** Destroy the child component */
  onDestroy(): void {
    if (!this.isMounted) return;

    this.isMounted = false;

    // If cleanup strategy works, the sub dies with the component
    const cleanStrategies: CleanupStrategy[] = [
      'manual',
      'takeUntilDestroyed',
      'async',
    ];

    if (cleanStrategies.includes(this.selectedStrategy)) {
      this.activeSubs = Math.max(0, this.activeSubs - 1);
    }
    // 'none' → activeSubs stays elevated → leak indicator turns red
  }

  /** Reset everything */
  onReset(): void {
    this.leakTracker.killAll(); // actually stop all leaked subscriptions
    // Destroy first if mounted
    this.isMounted = false;
    this.activeSubs = 0;
    this.zombieLog = [];
    this.mountCount = 0;
  }
}
