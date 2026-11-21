import { DOCUMENT } from '@angular/common';
import {
  Component,
  DestroyRef,
  ElementRef,
  HostListener,
  Renderer2,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TranslatePipe } from '@ngx-translate/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { filter } from 'rxjs';
import { getLocaleSwitchPath, isEnglishPath, normalizeSitePath } from './site-locale';

type NavigationItem = {
  labelKey: string;
  ptPath: string;
  enPath: string;
};

const navigationItems: NavigationItem[] = [
  { labelKey: 'NAV.ABOUT', ptPath: '/sobre', enPath: '/en/about' },
  { labelKey: 'NAV.SERVICES', ptPath: '/servicos', enPath: '/en/services' },
  {
    labelKey: 'NAV.PROPERTIES',
    ptPath: '/real-estate',
    enPath: '/en/apartments',
  },
  {
    labelKey: 'NAV.PARTNERSHIPS',
    ptPath: '/parcerias',
    enPath: '/en/partnerships',
  },
  { labelKey: 'NAV.CONTACT', ptPath: '/contactos', enPath: '/en/contact' },
];

@Component({
  selector: 'app-site-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, TranslatePipe],
  templateUrl: './site-header.html',
})
export class SiteHeader {
  private readonly router = inject(Router);
  private readonly document = inject(DOCUMENT);
  private readonly renderer = inject(Renderer2);
  private readonly destroyRef = inject(DestroyRef);
  private readonly menuToggle = viewChild<ElementRef<HTMLButtonElement>>('menuToggle');
  private readonly currentPath = signal('/');

  readonly isEnglish = signal(false);
  readonly isScrolled = signal(false);
  readonly menuOpen = signal(false);
  readonly navigationItems = navigationItems;
  readonly languagePath = computed(() => getLocaleSwitchPath(this.currentPath()));
  readonly languageCode = computed(() => (this.isEnglish() ? 'PT' : 'EN'));
  readonly homePath = computed(() => (this.isEnglish() ? '/en' : '/'));
  readonly contactPath = computed(() => (this.isEnglish() ? '/en/contact' : '/contactos'));
  readonly isHome = computed(() =>
    this.isEnglish() ? this.currentPath() === '/en' : this.currentPath() === '/',
  );

  constructor() {
    this.updateRouteState();
    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => {
        this.updateRouteState();
        this.menuOpen.set(false);
      });
    this.destroyRef.onDestroy(
      this.renderer.listen(this.document, 'keydown', (event: KeyboardEvent) => {
        if (event.key === 'Escape' && this.menuOpen()) {
          this.closeMenu();
          this.menuToggle()?.nativeElement.focus();
        }
      }),
    );
  }

  @HostListener('window:scroll')
  onWindowScroll(): void {
    this.isScrolled.set((this.document.defaultView?.scrollY ?? 0) >= 2);
  }

  toggleMenu(): void {
    this.menuOpen.update((open) => !open);
  }

  closeMenu(): void {
    this.menuOpen.set(false);
  }

  private updateRouteState(): void {
    const path = normalizeSitePath(this.router.url);
    this.currentPath.set(path);
    this.isEnglish.set(isEnglishPath(path));
    this.onWindowScroll();
  }
}
