import { Component, computed, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { filter } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TranslatePipe } from '@ngx-translate/core';
import { getLocaleSwitchPath, isEnglishPath, normalizeSitePath } from './site-locale';

type FooterLink = {
  labelKey: string;
  ptPath: string;
  enPath: string;
};

type FooterGroup = {
  titleKey: string;
  links: FooterLink[];
  noteKey?: string;
};

@Component({
  selector: 'app-site-footer',
  standalone: true,
  imports: [RouterLink, TranslatePipe],
  templateUrl: './site-footer.html',
})
export class SiteFooter {
  private readonly router = inject(Router);
  readonly isEnglish = signal(false);
  private readonly currentPath = signal('/');

  readonly languagePath = computed(() => getLocaleSwitchPath(this.currentPath()));
  readonly footerGroups: FooterGroup[] = [
    {
      titleKey: 'FOOTER.OWNERS',
      links: [
        {
          labelKey: 'NAV.SERVICES',
          ptPath: '/servicos',
          enPath: '/en/services',
        },
        {
          labelKey: 'NAV.CONTACT',
          ptPath: '/contactos',
          enPath: '/en/contact',
        },
      ],
    },
    {
      titleKey: 'FOOTER.GUESTS',
      links: [
        {
          labelKey: 'NAV.PROPERTIES',
          ptPath: '/real-estate',
          enPath: '/en/apartments',
        },
      ],
      noteKey: 'FOOTER.BOOKINGS_NOTE',
    },
    {
      titleKey: 'FOOTER.COMPANY',
      links: [
        { labelKey: 'NAV.ABOUT', ptPath: '/sobre', enPath: '/en/about' },
        {
          labelKey: 'NAV.PARTNERSHIPS',
          ptPath: '/parcerias',
          enPath: '/en/partnerships',
        },
        {
          labelKey: 'FOOTER.SWITCH_LANGUAGE',
          ptPath: '',
          enPath: '',
        },
      ],
    },
  ];

  constructor() {
    this.updateRouteState();
    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe(() => this.updateRouteState());
  }

  private updateRouteState(): void {
    const path = normalizeSitePath(this.router.url);
    this.currentPath.set(path);
    this.isEnglish.set(isEnglishPath(path));
  }
}
