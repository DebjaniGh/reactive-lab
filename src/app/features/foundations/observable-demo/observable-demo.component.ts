import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { fromEvent } from 'rxjs';

interface DemoEvent {
  id: number;
  label: string;
}

@Component({
  selector: 'app-observable-demo',
  standalone: true,
  imports: [],
  templateUrl: './observable-demo.component.html',
  styleUrl: './observable-demo.component.scss',
})
export class ObservableDemoComponent implements AfterViewInit {
  // get the DOM reference of the emit event button
  @ViewChild('emitEventButton') emitEventButton!: ElementRef<HTMLButtonElement>;
  emittedEvents: DemoEvent[] = [];

  private eventCounter = 0;

  ngAfterViewInit(): void {
    // create an observable from the button click event using fromEvent method
    const clickStream$ = fromEvent(this.emitEventButton.nativeElement, 'click');
    clickStream$.subscribe(() => {
      // start listening to the observable; if we don't subscribe, the observable will not emit any values
      this.emitEvent();
    });
  }

  private emitEvent(): void {
    this.eventCounter++;

    this.emittedEvents.push({
      id: this.eventCounter,
      label: `Event ${this.eventCounter} emitted`,
    });
  }
}
