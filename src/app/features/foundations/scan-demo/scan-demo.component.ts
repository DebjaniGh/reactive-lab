// scan-demo.component.ts

import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, Subscription, scan, tap } from 'rxjs';

// ── Types ──

interface LogEntry {
  id: number;
  panel: string;
  message: string;
}

interface CartItem {
  name: string;
  icon: string;
  price: number;
}

interface CartState {
  items: CartItem[];
  total: number;
  count: number;
}

// ── Reducer (pure function) ──

function counterReducer(acc: number, val: number): number {
  return acc + val;
}

function cartReducer(state: CartState, item: CartItem): CartState {
  const items = [...state.items, item];
  return {
    items,
    total: items.reduce((sum, i) => sum + i.price, 0),
    count: items.length,
  };
}

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
export class ScanDemoComponent implements OnDestroy {
  // The Subject — entry point for counter events
  private counter$$ = new Subject<number>();
  private cart$$ = new Subject<CartItem>();

  // Subscription tracker
  private subs: Subscription[] = [];

  // Public state for template
  counterValue = 0;
  log: LogEntry[] = [];
  cartState: CartState = { items: [], total: 0, count: 0 };
  menu = MENU;

  // Log counter
  private logCounter = 0;

  constructor() {
    this.setupCounter();
    this.setupCart();
  }

  // ── Counter Pipeline ──
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

  // ── Template Actions ──

  onCounter(value: number): void {
    this.counter$$.next(value);
  }

  onClearLog(): void {
    this.log = [];
    this.logCounter = 0;
  }

  onAddToCart(item: CartItem): void {
    this.cart$$.next(item);
  }

  // ── Helpers ──

  private addLog(panel: string, message: string): void {
    this.logCounter++;
    this.log.unshift({
      id: this.logCounter,
      panel,
      message,
    });
  }

  ngOnDestroy(): void {
    this.subs.forEach((s) => s.unsubscribe());
    this.counter$$.complete();
    this.cart$$.complete();
  }
}
