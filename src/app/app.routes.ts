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
      import('./features/foundations/observable-demo/observable-demo.component').then(
        (m) => m.ObservableDemoComponent,
      ),
  },
  {
    path: 'sub-demo',
    loadComponent: () =>
      import('./features/foundations/sub-demo/sub-demo.component').then(
        (m) => m.SubDemoComponent,
      ),
  },
  {
    path: 'pipe-demo',
    loadComponent: () =>
      import('./features/foundations/pipe-demo/pipe-demo.component').then(
        (m) => m.PipeDemoComponent,
      ),
  },
  {
    path: 'leak-demo',
    loadComponent: () =>
      import('./features/foundations/leak-demo/leak-demo.component').then(
        (m) => m.LeakDemoComponent,
      ),
  },
];
