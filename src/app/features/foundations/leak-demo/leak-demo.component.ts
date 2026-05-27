// leak-demo.component.ts

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  LeakyChildComponent,
  CleanupStrategy,
} from './leaky-child/leaky-child.component';

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
  templateUrl: './leak-demo.component.html',
  styleUrl: './leak-demo.component.scss',
})
export class LeakDemoComponent {
  // ① Strategy selection
  selectedStrategy: CleanupStrategy = 'none';
  strategies: { value: CleanupStrategy; label: string; icon: string }[] = [
    { value: 'none', label: 'No cleanup', icon: '💀' },
    { value: 'manual', label: 'Manual unsubscribe', icon: '🔧' },
    { value: 'takeUntilDestroyed', label: 'takeUntilDestroyed', icon: '✅' },
    { value: 'async', label: 'async pipe', icon: '✅' },
  ];

  // ② Mount state
  isMounted = false;

  // ③ Tracking leaks
  activeSubs = 0;
  zombieLog: ZombieEntry[] = [];
  mountCount = 0;

  // ④ Derived state
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

  /** Receive zombie ticks from the dead child */
  onZombieTick(tick: number): void {
    this.zombieLog.push({
      id: this.zombieLog.length + 1,
      tick,
      timestamp: new Date(),
      instance: this.mountCount,
    });
  }

  /** Reset everything */
  onReset(): void {
    // Destroy first if mounted
    this.isMounted = false;
    this.activeSubs = 0;
    this.zombieLog = [];
    this.mountCount = 0;
  }
}
