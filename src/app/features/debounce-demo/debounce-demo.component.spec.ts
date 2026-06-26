import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';

import { DebounceDemoComponent } from './debounce-demo.component';

describe('DebounceDemoComponent', () => {
  let component: DebounceDemoComponent;
  let fixture: ComponentFixture<DebounceDemoComponent>;

  /** Helper: type a value into the search input and dispatch the 'input' event */
  function type(value: string): void {
    const input = component.searchInputRef.nativeElement;
    input.value = value;
    input.dispatchEvent(new Event('input'));
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DebounceDemoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DebounceDemoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges(); // triggers ngAfterViewInit → builds the pipeline
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should record a raw entry on every keystroke immediately', () => {
    type('a');
    type('ab');
    expect(component.rawCount).toBe(2);
    expect(component.rawEntries.length).toBe(2);
  });

  it('should emit a debounced + distinct value after the debounce window', fakeAsync(() => {
    type('hello');
    expect(component.debouncedCount).toBe(0); // not yet — still within window

    tick(component.debounceMs);
    expect(component.debouncedCount).toBe(1);
    expect(component.distinctCount).toBe(1);
    expect(component.distinctEntries[0].value).toBe('hello');
  }));

  it('should filter out consecutive duplicate values via distinctUntilChanged', fakeAsync(() => {
    type('same');
    tick(component.debounceMs);
    type('same');
    tick(component.debounceMs);
    expect(component.debouncedCount).toBe(2); // debounce fired twice
    expect(component.distinctCount).toBe(1);  // but distinct only passed once
  }));

  it('onClear should reset all stages', fakeAsync(() => {
    type('x');
    tick(component.debounceMs);
    component.onClear();
    expect(component.rawEntries).toEqual([]);
    expect(component.debouncedEntries).toEqual([]);
    expect(component.distinctEntries).toEqual([]);
    expect(component.rawCount).toBe(0);
  }));
});
