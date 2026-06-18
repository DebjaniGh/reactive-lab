import { Component } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { DatePipe } from '@angular/common';

/** Represents a single emitted event for display */
interface TimelineEvent {
  id: number;
  timestamp: Date;
  label: string;
}

@Component({
    selector: 'app-sub-demo',
    imports: [DatePipe],
    templateUrl: './sub-demo.component.html',
    styleUrl: './sub-demo.component.scss'
})
export class SubDemoComponent {
  // our event source
  private event$ = new Subject<number>();

  // tracks the active subscription
  private sub: Subscription | null = null;

  // Counter for labeling each emitted event
  private counter = 0;

  // Public state for the template
  isSubscribed = false;
  timeline: TimelineEvent[] = [];
  log: string[] = [];

  onSubscribe(): void {
    if (this.sub) return; // already subscribed, bail out

    this.sub = this.event$.subscribe((value) => {
      // start listening
      const event: TimelineEvent = {
        id: value,
        timestamp: new Date(),
        label: `Event #${value}`,
      };
      this.timeline.push(event);
      this.log.push(`✅ Received: Event #${value}`);
    });

    this.isSubscribed = true;
    this.log.push('Subscribed — now listening');
  }

  onUnsubscribe(): void {
    if (!this.sub) return; // nothing to unsubscribe

    this.sub.unsubscribe(); // tears down the connection
    this.sub = null;
    this.isSubscribed = false;
    this.log.push('🔇 Unsubscribed — stopped listening');
  }

  /** Speak into the microphone — push a value */
  onEmit(): void {
    this.counter++;
    this.event$.next(this.counter); // fires regardless of listeners
    this.log.push(
      `🎤 Emitted: Event #${this.counter}` +
        (this.isSubscribed ? '' : ' (no one listening!)'),
    );
  }

  /** Safety net — clean up if Angular destroys this component */
  ngOnDestroy(): void {
    this.onUnsubscribe();
    this.event$.complete(); // closes the Subject permanently
  }
}
