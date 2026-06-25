import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatSidenavModule,
    MatToolbarModule,
    MatListModule,
    MatIconModule,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'reactive-lab';

  navItems = [
    { path: 'observable-demo', label: 'Observable Demo', icon: 'visibility' },
    { path: 'sub-demo', label: 'Subscription Demo', icon: 'podcasts' },
    { path: 'pipe-demo', label: 'Pipe Demo', icon: 'plumbing' },
    {
      path: 'leak-demo',
      label: 'Leak Demo',
      icon: 'bug_report',
    },
    {
      path: 'scan-demo',
      label: 'Scan Demo',
      icon: 'inventory',
    },
    {
      path: 'debounce-demo',
      label: 'Debounce Demo',
      icon: 'timer',
    },
    {
      path: 'swmap-demo',
      label: 'SwitchMap Demo',
      icon: 'switch_access',
    },
    {
      path: 'flatten-demo',
      label: 'Flatten Demo',
      icon: 'layers',
    },
    {
      path: 'combine-demo',
      label: 'Combination Operators Demo',
      icon: 'merge',
    },
    {
      path: 'error-demo',
      label: 'Error Handling Demo',
      icon: 'error',
    },
    {
      path: 'subject-demo',
      label: 'Subjects Demo',
      icon: 'subject',
    },
    {
      path: 'share-demo',
      label: 'Share Replay Demo',
      icon: 'share',
    }
  ];
}
