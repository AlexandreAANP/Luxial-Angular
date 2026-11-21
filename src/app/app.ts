import { DOCUMENT } from '@angular/common';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { Meta } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';
import { filter } from 'rxjs';
import { SiteFooter } from './site-footer';
import { SiteHeader } from './site-header';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, SiteHeader, SiteFooter],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly document = inject(DOCUMENT);
  private readonly meta = inject(Meta);
  private readonly translate = inject(TranslateService);
  private readonly destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    this.updatePageMetadata();
    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => this.updatePageMetadata());
  }

  private updatePageMetadata(): void {
    let activeRoute = this.route;
    while (activeRoute.firstChild) {
      activeRoute = activeRoute.firstChild;
    }

    const data = activeRoute.snapshot.data;
    this.document.documentElement.lang =
      typeof data['locale'] === 'string' ? data['locale'] : 'pt-PT';
    const language = data['locale'] === 'en' ? 'en' : 'pt';
    this.translate.use(language).subscribe({
      error: (error: unknown) => console.error(`Unable to load ${language} translations.`, error),
    });
    const description = data['description'];
    if (typeof description === 'string') {
      this.meta.updateTag({ name: 'description', content: description });
    }
  }
}
