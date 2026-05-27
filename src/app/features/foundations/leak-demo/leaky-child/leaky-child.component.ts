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
import { interval, Subscription } from 'rxjs';

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
  private destroyRef = inject(DestroyRef); // modern Angular way; no need for boilerplate constructor

  ngOnInit(): void {
    // 'async' strategy doesn't need manual subscribe — template handles it
    if (this.strategy === 'async') return;

    const source$ = interval(1000);

    switch (this.strategy) {
      // DANGEROUS: no cleanup at all
      case 'none':
        this.sub = source$.subscribe((t) => this.handleTick(t));
        break;

      // same code for both none and manual BUT for
      //  MANUAL: we'll unsubscribe in ngOnDestroy
      case 'manual':
        this.sub = source$.subscribe((t) => this.handleTick(t));
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

    if (!this.alive) {
      // 💀 We're a zombie — component was destroyed but sub is still firing
      this.zombieTick.emit(this.tick);
    }
  }

  ngOnDestroy(): void {
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
