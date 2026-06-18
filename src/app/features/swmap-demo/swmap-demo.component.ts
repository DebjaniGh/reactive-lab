// switchmap-demo.component.ts

import {
  Component,
  OnDestroy,
  ElementRef,
  ViewChild,
  AfterViewInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  Subscription,
  fromEvent,
  map,
  debounceTime,
  distinctUntilChanged,
  switchMap,
  tap,
  filter,
} from 'rxjs';
import { FakeSearchService, SearchResult } from './fake-search.service';

interface RequestEntry {
  id: number;
  query: string;
  status: 'loading' | 'completed' | 'cancelled';
  duration?: number;
  timestamp: Date;
}

interface LogEntry {
  id: number;
  stage: string;
  message: string;
}

@Component({
  selector: 'app-swmap-demo',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './swmap-demo.component.html',
  styleUrl: './swmap-demo.component.scss',
})
export class SwmapDemoComponent implements AfterViewInit, OnDestroy {

  @ViewChild('searchInput') searchInputRef!: ElementRef<HTMLInputElement>;

  private sub: Subscription | null = null;

  // ── Public state ──
  requests: RequestEntry[] = [];
  results: string[] = [];
  currentQuery = '';
  log: LogEntry[] = [];
  debounceMs = 300;

  // ── Counters ──
  totalRequests = 0;
  cancelledRequests = 0;
  completedRequests = 0;

  // ── Log counter ──
  private logCounter = 0;

  constructor(private searchService: FakeSearchService) {}

  ngAfterViewInit(): void {
    this.setupPipeline();
  }

  private setupPipeline(): void {
    const input = this.searchInputRef.nativeElement;

    this.sub = fromEvent(input, 'input')
      .pipe(
        // Extract value from DOM event
        map((event: Event) => (event.target as HTMLInputElement).value.trim()),

        // Log raw input
        tap((value) => {
          this.addLog('⌨️', `Raw input: "${value}"`);
        }),

        // Wait for typing to pause
        debounceTime(this.debounceMs),

        tap((value) => {
          this.addLog('⏱️', `Debounced: "${value}"`);
        }),

        // Ignore if same query
        distinctUntilChanged(),

        tap((value) => {
          this.addLog('✅', `Distinct: "${value}" — new query`);
        }),

        // Ignore empty strings as API calls should not be made for empty queries
        filter((value) => value.length > 0),

        // 🔀 THE STAR OF THE SHOW — switchMap!
        switchMap((query) => {
          // Mark previous loading request as cancelled
          this.requests.forEach((r) => {
            if (r.status === 'loading') {
              // The actual cancellation is done by switchMap() internally
              // Any currently-loading request is visually marked as cancelled
              r.status = 'cancelled';
              this.cancelledRequests++;
              this.addLog('❌', `CANCELLED: "${r.query}" (new query arrived)`);
            }
          });

          // Track this new request
          this.totalRequests++;
          const requestEntry: RequestEntry = {
            id: this.totalRequests,
            query,
            status: 'loading',
            timestamp: new Date(),
          };
          this.requests.unshift(requestEntry);
          this.currentQuery = query;
          this.addLog('🔀', `switchMap: started search for "${query}"`);

          // Return the inner Observable — this is what switchMap subscribes to
          return this.searchService.search(query).pipe(
            tap((result) => {
              // Mark this request as completed
              requestEntry.status = 'completed';
              requestEntry.duration = result.duration;
              this.completedRequests++;
            })
          );
        })
      )
      .subscribe((result: SearchResult) => {
        this.results = result.items;
        this.addLog(
          '📦',
          `Results for "${result.query}": ${result.items.length} items (${result.duration}ms)`
        );
      });
  }

  onClear(): void {
    this.requests = [];
    this.results = [];
    this.currentQuery = '';
    this.log = [];
    this.logCounter = 0;
    this.totalRequests = 0;
    this.cancelledRequests = 0;
    this.completedRequests = 0;

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