// scan-demo.component.ts

import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, Subscription, scan, tap } from 'rxjs';

// ── Types ──

/** Represents a single log entry displayed in the Scan Pipeline Log. */
interface LogEntry {
  id: number;
  panel: string;
  message: string;
}

/** Menu or cart item with display icon and unit price. */
interface CartItem {
  name: string;
  icon: string;
  price: number;
}

/** Accumulated cart state produced by scan(cartReducer, initialState). */
interface CartState {
  items: CartItem[];
  total: number;
  count: number;
}

/** Traffic light state with label and color. */
interface TrafficState {
  label: string;
  color: string;
}

type TrafficAction = 'GO' | 'SLOW' | 'STOP';

// ── Reducer (pure function) ──

/**
 * Accumulates a numeric counter by simple addition.
 * @param acc Current accumulated value.
 * @param val Incoming delta to apply to the accumulator.
 * @returns The new accumulated value.
 */
function counterReducer(acc: number, val: number): number {
  return acc + val;
}

/**
 * Adds an item to the cart and derives aggregate fields.
 * @param state Current cart state.
 * @param item Item to add.
 * @returns New cart state with updated items, total, and count.
 */
function cartReducer(state: CartState, item: CartItem): CartState {
  const items = [...state.items, item];
  return {
    items,
    total: items.reduce((sum, i) => sum + i.price, 0),
    count: items.length,
  };
}

/** 
 * Transforms traffic light actions into display state.
 * @param state Current traffic state.
 * @param action Incoming action to process.
 * @returns New traffic state with updated label and color.
 */
function trafficReducer(state: TrafficState, action: TrafficAction): TrafficState {
  switch (action) {
    case 'GO':   return { label: '🟢 GO',   color: 'green' };
    case 'SLOW': return { label: '🟡 SLOW', color: 'yellow' };
    case 'STOP': return { label: '🔴 STOP', color: 'red' };
    default:     return state;
  }
}

/** Demo menu items used by the Mini Cart panel */
const MENU: CartItem[] = [
  { name: 'Pizza',  icon: '🍕', price: 8  },
  { name: 'Burger', icon: '🍔', price: 6  },
  { name: 'Taco',   icon: '🌮', price: 4  },
  { name: 'Sushi',  icon: '🍣', price: 10 },
];

@Component({
  selector: 'app-scan-demo',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './scan-demo.component.html',
  styleUrl: './scan-demo.component.scss',
})
/** Demo component showcasing RxJS scan() with a counter and a mini cart, including a live log. */
export class ScanDemoComponent implements OnDestroy {
  // The Subject — entry point for counter events
  private counter$$ = new Subject<number>();
  // Entry point for cart item events
  private cart$$ = new Subject<CartItem>();
  // Entry point for traffic light actions
  private traffic$$ = new Subject<TrafficAction>();

  // Subscription tracker
  private subs: Subscription[] = [];

  // Public state for template
  counterValue = 0;
  log: LogEntry[] = [];
  cartState: CartState = { items: [], total: 0, count: 0 };
  menu = MENU;
  trafficState: TrafficState = { label: '🟡 STOP', color: 'red' };
  
  // Log counter
  private logCounter = 0;

  constructor() {
    this.setupCounter();
    this.setupCart();
    this.setupTraffic();
  }

  // ── Counter Pipeline ──
  /** Builds the counter stream using scan(acc + val) and logs each accumulation. */
  private setupCounter(): void {
    const sub = this.counter$$
      .pipe(
        // scan() receives each value and accumulates it
        scan(counterReducer, 0),

        // tap() logs the pipeline step (peek without modifying)
        tap((acc) => {
          this.addLog('🔢', `acc + val → new acc: ${acc}`);
        }),
      )
      .subscribe((value) => {
        // The accumulated value updates the template
        this.counterValue = value;
      });

    this.subs.push(sub);
  }

  /** Builds the cart state stream with scan(cartReducer) and logs the latest addition. */
  private setupCart(): void {
  const sub = this.cart$$
    .pipe(
      scan(cartReducer, { items: [], total: 0, count: 0 }),
      tap((state) => {
        const latest = state.items[state.items.length - 1];
        this.addLog(
          '🛒',
          `+ ${latest.icon} ${latest.name} ($${latest.price}) → total: $${state.total}`
        );
      })
    )
    .subscribe((state) => {
      this.cartState = state;
    });

    this.subs.push(sub);
  }

  /** Builds the traffic light state stream with scan(trafficReducer) and logs the latest state change. */
  private setupTraffic(): void {
  const sub = this.traffic$$
    .pipe(
      scan(trafficReducer, { label: '🔴 STOP', color: 'red' }),
      tap((state) => {
        this.addLog('🔄', `→ ${state.label}`);
      })
    )
    .subscribe((state) => {
      this.trafficState = state;
    });

  this.subs.push(sub);
}

  // ── Template Actions ──

  /** Emits a counter delta into the accumulation pipeline. */
  onCounter(value: number): void {
    this.counter$$.next(value);
  }

  /** Clears the visual log and resets its incrementing id counter. */
  onClearLog(): void {
    this.log = [];
    this.logCounter = 0;
  }

  /** Pushes a selected menu item into the cart accumulation pipeline. */
  onAddToCart(item: CartItem): void {
    this.cart$$.next(item);
  } 

  /** Emits a traffic light action into the accumulation pipeline. */
  onTraffic(action: TrafficAction): void {
    this.traffic$$.next(action);
  }

  // ── Helpers ──

  /** Prepends a formatted entry to the in-memory log shown in the template. */
  private addLog(panel: string, message: string): void {
    this.logCounter++;
    this.log.unshift({
      id: this.logCounter,
      panel,
      message,
    });
  }

  /** Ensures all subscriptions are disposed and Subjects are completed to avoid leaks. */
  ngOnDestroy(): void {
    this.subs.forEach((s) => s.unsubscribe());
    this.counter$$.complete();
    this.cart$$.complete();
    this.traffic$$.complete();
  }
}
