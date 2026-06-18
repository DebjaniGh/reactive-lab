// pipe-demo.component.ts

import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, Subscription, map, filter, tap } from 'rxjs';

/** Represents one value's journey through the pipeline */
interface PipelineEntry {
  id: number;
  raw: number;
  mapped: number;
  passed: boolean;
}

@Component({
  selector: 'app-pipe-demo',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pipe-demo.component.html',
  styleUrl: './pipe-demo.component.scss',
})
export class PipeDemoComponent implements OnDestroy {
  // The raw input Subject — our conveyor belt entry point
  private input$ = new Subject<number>();

  // Subscription tracker
  private sub: Subscription;

  // Public state for the template
  inputValue: number = 1;
  pipeline: PipelineEntry[] = [];
  log: string[] = [];

  // Counter for unique IDs
  private counter = 0;

  constructor() {
    // The pipeline
    this.sub = this.input$
      .pipe(
        // Stage 1: tap() to log the raw value (peek without modifying)
        tap((value) => {
          this.log.push(`🟡 Raw value entered pipeline: ${value}`);
        }),

        // Stage 2: map — the Label Maker
        map((value) => {
          const mapped = value * 10;
          this.log.push(`🔵 map(x => x * 10): ${value} → ${mapped}`);
          return mapped;
        }),

        // Stage 3: tap() to record the entry BEFORE filter decides
        tap((mapped) => {
          this.counter++;
          this.pipeline.push({
            id: this.counter,
            raw: mapped / 10, // reverse to show original
            mapped: mapped,
            passed: mapped > 25, // preview the filter decision
          });
        }),

        // Stage 4: filter — the Bouncer
        filter((mapped) => {
          if (mapped > 25) {
            this.log.push(`🟢 filter(x => x > 25): ${mapped} ✅ PASSED`);
            return true;
          } else {
            this.log.push(`🔴 filter(x => x > 25): ${mapped} ❌ BLOCKED`);
            return false;
          }
        }),
      )
      .subscribe((finalValue) => {
        // Stage 5: Only values that survived the bouncer arrive here
        this.log.push(`📦 subscribe() received: ${finalValue}`);
      });
  }

  /** Push a value onto the conveyor belt */
  onEmit(): void {
    this.input$.next(this.inputValue);
  }

  /** Clear all visual state */
  onClear(): void {
    this.pipeline = [];
    this.log = [];
    this.counter = 0;
  }

  /** Clean up on destroy */
  ngOnDestroy(): void {
    this.sub.unsubscribe();
    this.input$.complete();
  }
}
