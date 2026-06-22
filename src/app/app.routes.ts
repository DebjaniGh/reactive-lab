import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'observable-demo',
    pathMatch: 'full',
  },
  {
    path: 'observable-demo',
    loadComponent: () =>
      import('./features/observable-demo/observable-demo.component').then(
        (m) => m.ObservableDemoComponent,
      ),
  },
  {
    path: 'sub-demo',
    loadComponent: () =>
      import('./features/sub-demo/sub-demo.component').then(
        (m) => m.SubDemoComponent,
      ),
  },
  {
    path: 'pipe-demo',
    loadComponent: () =>
      import('./features/pipe-demo/pipe-demo.component').then(
        (m) => m.PipeDemoComponent,
      ),
  },
  {
    path: 'leak-demo',
    loadComponent: () =>
      import('./features/leak-demo/leak-demo.component').then(
        (m) => m.LeakDemoComponent,
      ),
  },
  {
    path: 'scan-demo',
    loadComponent: () =>
      import('./features/scan-demo/scan-demo.component').then(
        (m) => m.ScanDemoComponent,
      ),
  },
  {
    path: 'debounce-demo',
    loadComponent: () =>
      import('./features/debounce-demo/debounce-demo.component').then(
        (m) => m.DebounceDemoComponent,
      ),
  },
  {
    path: 'swmap-demo',
    loadComponent: () =>
      import('./features/swmap-demo/swmap-demo.component').then(
        (m) => m.SwmapDemoComponent,
      ),
  },
  {
    path: 'flatten-demo',
    loadComponent: () =>
      import('./features/flatten-demo/flatten-demo.component').then(
        (m) => m.FlattenDemoComponent,
      ),
  },
];
