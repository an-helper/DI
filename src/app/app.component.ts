import { Component, Inject, InjectionToken } from '@angular/core';

export interface PageConfig {
  title: string;
}

export const PAGE_CONFIG = new InjectionToken<PageConfig>('page.config');

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'DI';

  constructor(
    @Inject(PAGE_CONFIG) public pageConfig: PageConfig,
  ) {}
}
