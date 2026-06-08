// leaky-child.component.ts

import {
  Component,
  OnInit,
  OnDestroy,
  Input,
  Output,
  EventEmitter,
  DestroyRef,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { interval, Subscription, takeUntil } from 'rxjs';
import { LeakTrackerService } from '../leak-tracker.service';

/** The four cleanup strategies we demo */
export type CleanupStrategy =
  | 'none' // no cleanup — leaks on purpose
  | 'manual' // manual unsubscribe in ngOnDestroy
  | 'takeUntilDestroyed' // modern Angular (v16+)
  | 'async'; // template-driven — handled in template

@Component({
  selector: 'app-leaky-child',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './leaky-child.component.html',
})
export class LeakyChildComponent implements OnInit, OnDestroy {
  // Parent tells us which cleanup strategy to use
  @Input({ required: true }) strategy!: CleanupStrategy;

  // Report zombie activity back to parent
  @Output() zombieTick = new EventEmitter<number>();

  // Public state for the template
  tick = 0;
  alive = true;

  // For the 'async' strategy — expose the Observable directly
  tick$ = interval(1000);

  // Internal cleanup tools
  private sub: Subscription | null = null;
  constructor(private leakTracker: LeakTrackerService, private destroyRef: DestroyRef) {}

  ngOnInit(): void {
    console.log('🟢 CHILD ngOnInit — strategy:', this.strategy);

    // 'async' strategy doesn't need manual subscribe — template handles it
    if (this.strategy === 'async') return;

    const source$ = interval(1000);

    switch (this.strategy) {
      // DANGEROUS: no cleanup at all
      case 'none':
        console.log('🟢 Subscribing with NO cleanup');
        this.sub = source$.pipe(takeUntil(this.leakTracker.forceKill$$))   //  kill switch
         .subscribe((t) => this.handleTick(t));
        break;

      // same code for both none and manual BUT for
      //  MANUAL: we'll unsubscribe in ngOnDestroy
      case 'manual':
        this.sub = source$.pipe(takeUntil(this.leakTracker.forceKill$$)). // kill switch
        subscribe((t) => this.handleTick(t));
        break;

      // ✅ MODERN: takeUntilDestroyed auto-completes when component dies
      case 'takeUntilDestroyed':
        source$
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe((t) => this.handleTick(t));
        break;
    }
  }

  /** Process each tick — whether component is alive or zombie */
  private handleTick(t: number): void {
    this.tick = t + 1;
    console.log('⏱️ TICK fired:', this.tick, '| alive:', this.alive);

    if (!this.alive) {
      console.log('💀 ZOMBIE TICK — emitting to parent:', this.tick);

      // We're a zombie — component was destroyed but sub is still firing
      // this.zombieTick.emit(this.tick);
      this.leakTracker.reportZombie(this.tick);
    }
  }

  ngOnDestroy(): void {
    console.log('🔴 CHILD ngOnDestroy — strategy:', this.strategy);

    this.alive = false;

    // Only the 'manual' strategy cleans up here
    if (this.strategy === 'manual' && this.sub) {
      this.sub.unsubscribe();
    }

    // 'none'      → sub keeps running → LEAK
    // 'manual'    → sub.unsubscribe() → clean
    // 'takeUntilDestroyed' → auto-completed already → clean
    // 'async'     → Angular unsubs automatically → clean
  }
}
