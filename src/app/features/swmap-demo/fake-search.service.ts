// fake-search.service.ts

import { Injectable } from '@angular/core';
import { Observable, of, delay, tap } from 'rxjs';

export interface SearchResult {
  query: string;
  items: string[];
  duration: number;
}

const FAKE_DATABASE: Record<string, string[]> = {
  a:       ['Angular', 'AWS', 'Azure', 'Apollo'],
  an:      ['Angular', 'Ansible', 'Android'],
  ang:     ['Angular', 'AngularJS', 'Angular Material'],
  angu:    ['Angular', 'Angular Universal'],
  angul:   ['Angular', 'Angular CLI'],
  angular: ['Angular Framework', 'Angular Material', 'Angular CLI', 'Angular Universal'],
  r:       ['React', 'Redux', 'RxJS', 'Rust'],
  rx:      ['RxJS', 'RxJava', 'RxSwift'],
  rxj:     ['RxJS'],
  rxjs:    ['RxJS Operators', 'RxJS Subjects', 'RxJS Schedulers'],
  v:       ['Vue', 'Vite', 'Vercel'],
  vue:     ['Vue.js', 'Vuex', 'Vue Router', 'Vuetify'],
  s:       ['Svelte', 'SolidJS', 'Spring'],
  sv:      ['Svelte', 'SVG'],
  n:       ['Next.js', 'Node.js', 'NestJS', 'NgRx'],
  ng:      ['NgRx', 'Nginx', 'Angular'],
  ngr:     ['NgRx Store', 'NgRx Effects', 'NgRx Selectors'],
};

@Injectable({ providedIn: 'root' })
export class FakeSearchService {

  // Simulates a slow API call with random delay
  search(query: string): Observable<SearchResult> {
    const normalized = query.toLowerCase().trim();
    const items = FAKE_DATABASE[normalized] || [`No results for "${query}"`];

    // Random delay between 500ms and 2000ms — simulates network latency
    const duration = Math.floor(Math.random() * 1500) + 500;

    return of({ query, items, duration }).pipe(
      delay(duration)
    );
  }
}