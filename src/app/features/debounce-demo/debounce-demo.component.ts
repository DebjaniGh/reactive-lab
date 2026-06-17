// debounce-demo.component.ts

import { Component, OnDestroy, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {  
  Subscription,
  debounceTime,
  distinctUntilChanged,
  tap,
  fromEvent,
  map,
} from 'rxjs';

interface StageEntry {
  id: number;
  value: string;
  timestamp: Date;
}

interface LogEntry {
  id: number;
  stage: string;
  message: string;
}

@Component({
  selector: 'app-debounce-demo',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './debounce-demo.component.html',
  styleUrl: './debounce-demo.component.scss',
})
export class DebounceDemoComponent implements AfterViewInit, OnDestroy {

  // Reference to the search input element
  @ViewChild('searchInput') searchInputRef!: ElementRef<HTMLInputElement>;

  // Subscription tracker
  private sub: Subscription | null = null;

  // Public state for template
  rawEntries: StageEntry[] = [];
  debouncedEntries: StageEntry[] = [];
  distinctEntries: StageEntry[] = [];
  log: LogEntry[] = [];

  // Counters
  rawCount = 0;
  debouncedCount = 0;
  distinctCount = 0;

  // Debounce time (configurable)
  debounceMs = 300;

  // Log counter
  private logCounter = 0;

  ngAfterViewInit(): void {
    this.setupPipeline();
  }

  private setupPipeline(): void {
    const input = this.searchInputRef.nativeElement;

    /**
     * fromEvent(input, 'input')           // Observable<Event>
        .pipe(
          map(event => event.target.value), // Observable<string>
          tap(value => { ... }),            // Observable<string> (unchanged)
          debounceTime(300),                // Observable<string> (filtered by time)
          tap(value => { ... }),            // Observable<string> (unchanged)
          distinctUntilChanged(),           // Observable<string> (filtered by equality)
          tap(value => { ... })             // Observable<string> (unchanged)
  )
  .subscribe(finalValue => { ... })   // Subscription (activates the stream)
     */
    // Create the Observable from DOM Events
    this.sub = fromEvent(input, 'input')
      .pipe( // chain multiple operators together
        /* Extract the input value from the DOM event
          Before - Observable<Event>
          After - Observable<string> */
        map((event: Event) => (event.target as HTMLInputElement).value),

        // Stage 1: Raw — every single keystroke
        tap((value) => {
          this.rawCount++;
          this.rawEntries.unshift({
            id: this.rawCount,
            value,
            timestamp: new Date(),
          });
          this.addLog('⌨️', `Raw: "${value}"`); // Shows the unfiltered stream
        }),

        // Stage 2: debounceTime — wait for silence
        debounceTime(this.debounceMs),

        tap((value) => {
          this.debouncedCount++;
          this.debouncedEntries.unshift({
            id: this.debouncedCount,
            value,
            timestamp: new Date(),
          });
          this.addLog('⏱️', `debounced: "${value}" (after ${this.debounceMs}ms silence)`);
        }),

        // Stage 3: distinctUntilChanged — ignore duplicates
        distinctUntilChanged(),

        tap((value) => {
          this.distinctCount++;
          this.distinctEntries.unshift({
            id: this.distinctCount,
            value,
            timestamp: new Date(),
          });
          this.addLog('✅', `distinct: "${value}" (new value — passed!)`);
        })
      )
      .subscribe((finalValue) => {
        this.addLog('📦', `subscribe() received: "${finalValue}"`);
      });
  }

  onClear(): void {
    this.rawEntries = [];
    this.debouncedEntries = [];
    this.distinctEntries = [];
    this.log = [];
    this.rawCount = 0;
    this.debouncedCount = 0;
    this.distinctCount = 0;
    this.logCounter = 0;

    // Clear the input field
    if (this.searchInputRef) {
      this.searchInputRef.nativeElement.value = '';
    }
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
    this.sub?.unsubscribe();
  }
}