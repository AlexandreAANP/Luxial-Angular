import { HttpErrorResponse, HttpClient } from '@angular/common/http';
import { DOCUMENT } from '@angular/common';
import { AfterViewInit, Directive, ElementRef, OnDestroy, Renderer2, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

type LeadPayload = {
  name: string;
  email: string;
  phone: string;
  address: string;
  message: string;
  consent: boolean;
  locale: string;
  source: string;
  company: string;
  elapsedMs: number;
  estimate?: unknown;
};

type LeadResponse =
  { kind: 'success' } | { kind: 'validation'; errors: string[] } | { kind: 'failure' };

@Directive({
  standalone: true,
})
export class PageInteractions implements AfterViewInit, OnDestroy {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly renderer = inject(Renderer2);
  private readonly document = inject(DOCUMENT);
  private readonly http = inject(HttpClient);
  private readonly cleanups: Array<() => void> = [];
  private readonly observers: IntersectionObserver[] = [];
  private readonly timers: number[] = [];

  ngAfterViewInit(): void {
    this.setupReveals();
    this.setupLeadForms();
    this.setupParallax();
    this.setupServiceRows();
    this.setupPropertyFilters();
    this.setupPropertyBar();
    this.setupLightbox();
  }

  ngOnDestroy(): void {
    this.cleanups.forEach((cleanup) => cleanup());
    this.observers.forEach((observer) => observer.disconnect());
    const view = this.document.defaultView;
    this.timers.forEach((timer) => view?.clearTimeout(timer));
    this.document.documentElement.classList.remove('reveal-on');
  }

  private setupReveals(): void {
    const elements = this.host.nativeElement.querySelectorAll<HTMLElement>('[data-reveal]');
    const view = this.document.defaultView;
    if (!elements.length || !view || view.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    if (!('IntersectionObserver' in view)) {
      elements.forEach((element) => this.renderer.addClass(element, 'is-revealed'));
      return;
    }

    this.document.documentElement.classList.add('reveal-on');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }
          observer.unobserve(entry.target);
          const element = entry.target as HTMLElement;
          const delay = Number(element.dataset['revealDelay'] ?? 0);
          this.timers.push(
            view.setTimeout(() => this.renderer.addClass(element, 'is-revealed'), delay),
          );
        });
      },
      { rootMargin: '0px 0px -12% 0px', threshold: 0.05 },
    );

    this.observers.push(observer);
    elements.forEach((element) => observer.observe(element));
    this.timers.push(
      view.setTimeout(
        () => elements.forEach((element) => this.renderer.addClass(element, 'is-revealed')),
        3000,
      ),
    );
  }

  private setupLeadForms(): void {
    const forms = this.host.nativeElement.querySelectorAll<HTMLFormElement>('[data-lead-form]');
    if (!forms.length) {
      return;
    }

    this.cleanups.push(
      this.renderer.listen(this.document, 'luxial:estimate', (event: Event) => {
        const estimate = JSON.stringify((event as CustomEvent<unknown>).detail);
        forms.forEach((form) => {
          const field = form.querySelector<HTMLInputElement>('[data-estimate-state]');
          if (field) {
            field.value = estimate;
          }
        });
      }),
    );

    forms.forEach((form) => {
      const startedAt = Date.now();
      this.cleanups.push(
        this.renderer.listen(form, 'submit', (event: SubmitEvent) => {
          event.preventDefault();
          void this.submitLead(form, startedAt);
        }),
        this.renderer.listen(form, 'input', (event: Event) => {
          const target = event.target;
          if (!(target instanceof HTMLInputElement) && !(target instanceof HTMLTextAreaElement)) {
            return;
          }
          const name = target.getAttribute('name');
          if (!name) {
            return;
          }
          const error = form.querySelector<HTMLElement>(`[data-error-for="${name}"]`);
          if (error) {
            this.renderer.addClass(error, 'hidden');
          }
          target.setAttribute('aria-invalid', 'false');
        }),
      );
    });
  }

  private async submitLead(form: HTMLFormElement, startedAt: number): Promise<void> {
    const status = form.querySelector<HTMLElement>('[data-status]');
    const button = form.querySelector<HTMLButtonElement>('[data-submit]');
    const submitLabel = form.querySelector<HTMLElement>('[data-submit-label]');
    const previousLabel = submitLabel?.textContent ?? '';
    const successId = form.dataset['successId'];
    const estimateState = form.querySelector<HTMLInputElement>('[data-estimate-state]');
    const data = new FormData(form);
    const getValue = (name: string): string => {
      const value = data.get(name);
      return typeof value === 'string' ? value : '';
    };
    const elapsed = form.querySelector<HTMLInputElement>('[data-elapsed]');
    if (elapsed) {
      elapsed.value = String(Date.now() - startedAt);
    }

    const payload: LeadPayload = {
      name: getValue('name'),
      email: getValue('email'),
      phone: getValue('phone'),
      address: getValue('address'),
      message: getValue('message'),
      consent: getValue('consent') === 'yes',
      locale: getValue('locale') || form.dataset['locale'] || 'pt',
      source: getValue('source') || form.dataset['source'] || 'hero',
      company: getValue('company'),
      elapsedMs: Date.now() - startedAt,
    };
    if (estimateState?.value) {
      payload.estimate = JSON.parse(estimateState.value);
    }

    const validationErrors = this.validateLead(payload);
    if (validationErrors.length) {
      this.showValidationErrors(form, validationErrors);
      this.setStatus(status, form.dataset['msgGeneric'] ?? '');
      return;
    }

    this.setStatus(status, form.dataset['msgSending'] ?? '');
    if (button) {
      button.disabled = true;
    }
    if (submitLabel) {
      submitLabel.textContent = form.dataset['msgSending'] ?? previousLabel;
    }

    try {
      const result = await this.sendLead(payload);
      if (result.kind === 'success') {
        const plausible = (
          window as Window & {
            plausible?: (event: string, options?: { props: Record<string, string> }) => void;
          }
        ).plausible;
        if (typeof plausible === 'function') {
          plausible('Lead submitted', {
            props: { source: payload.source, locale: payload.locale },
          });
        }

        const success = successId ? this.document.getElementById(successId) : null;
        if (success) {
          this.renderer.setProperty(form, 'hidden', true);
          this.renderer.setProperty(success, 'hidden', false);
          this.renderer.setAttribute(success, 'tabindex', '-1');
          success.focus();
        } else {
          this.setStatus(status, '');
        }
        return;
      }

      if (result.kind === 'validation') {
        this.showValidationErrors(form, result.errors);
        this.setStatus(status, form.dataset['msgGeneric'] ?? '');
        return;
      }

      this.setStatus(status, form.dataset['msgError'] ?? '');
    } catch (error) {
      console.error('Unable to submit the lead form.', error);
      this.setStatus(status, form.dataset['msgError'] ?? '');
    } finally {
      if (button) {
        button.disabled = false;
      }
      if (submitLabel) {
        submitLabel.textContent = previousLabel;
      }
    }
  }

  private async sendLead(payload: LeadPayload): Promise<LeadResponse> {
    try {
      await firstValueFrom(this.http.post('/api/leads', payload));
      return { kind: 'success' };
    } catch (error) {
      if (error instanceof HttpErrorResponse && error.status === 422) {
        const body: unknown = error.error;
        if (
          typeof body === 'object' &&
          body !== null &&
          'errors' in body &&
          Array.isArray(body.errors)
        ) {
          return {
            kind: 'validation',
            errors: body.errors.filter(
              (value: unknown): value is string => typeof value === 'string',
            ),
          };
        }
        console.error('Lead API returned an invalid validation response.', error);
      }
      if (!(error instanceof HttpErrorResponse)) {
        throw error;
      }
      return { kind: 'failure' };
    }
  }

  private validateLead(payload: LeadPayload): string[] {
    const errors: string[] = [];
    const name = payload.name.trim();
    const email = payload.email.trim();
    const phone = payload.phone.trim();

    if (name.length < 2 || name.length > 120) {
      errors.push('name');
    }
    if (!/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(email) || email.length > 200) {
      errors.push('email');
    }
    if (!/^[+()\d][\d\s()./-]{6,}$/.test(phone) || phone.length > 40) {
      errors.push('phone');
    }
    if (!payload.consent) {
      errors.push('consent');
    }
    if (payload.address.trim().length > 240) {
      errors.push('address');
    }
    if (payload.message.trim().length > 2000) {
      errors.push('message');
    }
    return errors;
  }

  private showValidationErrors(form: HTMLFormElement, errors: string[]): void {
    for (const name of ['name', 'email', 'phone', 'consent']) {
      const invalid = errors.includes(name);
      const message = form.querySelector<HTMLElement>(`[data-error-for="${name}"]`);
      if (message) {
        this.toggleClass(message, 'hidden', !invalid);
      }
      form
        .querySelector<HTMLInputElement | HTMLTextAreaElement>(`[name="${name}"]`)
        ?.setAttribute('aria-invalid', String(invalid));
    }

    const firstInvalid = errors[0];
    if (firstInvalid) {
      form
        .querySelector<HTMLInputElement | HTMLTextAreaElement>(`[name="${firstInvalid}"]`)
        ?.focus();
    }
  }

  private setupParallax(): void {
    const element = this.host.nativeElement.querySelector<HTMLElement>('[data-parallax]');
    const view = this.document.defaultView;
    if (!element || !view || view.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    let frameRequested = false;
    const update = (): void => {
      element.style.transform = `translate3d(0, ${view.scrollY * 0.12}px, 0)`;
      frameRequested = false;
    };
    this.cleanups.push(
      this.renderer.listen(view, 'scroll', () => {
        if (!frameRequested) {
          frameRequested = true;
          view.requestAnimationFrame(update);
        }
      }),
    );
  }

  private setupServiceRows(): void {
    const rows = this.host.nativeElement.querySelectorAll<HTMLElement>('[data-service-row]');
    const images = this.host.nativeElement.querySelectorAll<HTMLElement>('[data-service-image]');
    if (!rows.length || !images.length) {
      return;
    }

    const selectImage = (index: string | undefined): void => {
      images.forEach((image) => {
        const active = image.dataset['serviceImage'] === index;
        this.toggleClass(image, 'opacity-100', active);
        this.toggleClass(image, 'opacity-0', !active);
        this.toggleClass(image, 'absolute', !active);
        this.toggleClass(image, 'inset-0', !active);
      });
    };

    rows.forEach((row) => {
      const index = row.dataset['serviceRow'];
      this.cleanups.push(
        this.renderer.listen(row, 'mouseenter', () => selectImage(index)),
        this.renderer.listen(row, 'focusin', () => selectImage(index)),
      );
    });
  }

  private setupPropertyFilters(): void {
    const container = this.host.nativeElement.querySelector<HTMLElement>('[data-property-filters]');
    if (!container) {
      return;
    }

    const filters = Array.from(
      container.querySelectorAll<HTMLSelectElement>('select[data-filter]'),
    );
    const properties = Array.from(container.querySelectorAll<HTMLElement>('[data-property]'));
    const resultCount = container.querySelector<HTMLElement>('[data-result-count]');
    const noResults = container.querySelector<HTMLElement>('[data-no-results]');
    const clear = container.querySelector<HTMLButtonElement>('[data-clear-filters]');

    const update = (): void => {
      const selected = filters.filter((filter) => filter.value !== '');
      let visibleCount = 0;
      properties.forEach((property) => {
        const matches = selected.every(
          (filter) => property.dataset[filter.dataset['filter'] ?? ''] === filter.value,
        );
        this.renderer.setProperty(property, 'hidden', !matches);
        if (matches) {
          visibleCount += 1;
        }
      });
      if (resultCount) {
        const unit = visibleCount === 1 ? resultCount.dataset['one'] : resultCount.dataset['many'];
        resultCount.textContent = `${visibleCount} ${unit ?? ''}`;
      }
      if (noResults) {
        this.toggleClass(noResults, 'hidden', visibleCount > 0);
      }
      if (clear) {
        this.renderer.setProperty(clear, 'hidden', selected.length === 0);
      }
    };

    filters.forEach((filter) => {
      this.cleanups.push(this.renderer.listen(filter, 'change', update));
    });
    if (clear) {
      this.cleanups.push(
        this.renderer.listen(clear, 'click', () => {
          filters.forEach((filter) => {
            filter.value = '';
          });
          update();
          filters[0]?.focus();
        }),
      );
    }
  }

  private setupPropertyBar(): void {
    const bar = this.host.nativeElement.querySelector<HTMLElement>('[data-property-bar]');
    const heading = this.host.nativeElement.querySelector<HTMLElement>('h1');
    const header = this.host.nativeElement.querySelector<HTMLElement>('#site-header');
    if (!bar || !heading || !header) {
      return;
    }

    const updateTop = (): void => {
      this.renderer.setStyle(bar, 'top', `${header.getBoundingClientRect().height}px`);
    };
    updateTop();
    const view = this.document.defaultView;
    if (view) {
      this.cleanups.push(this.renderer.listen(view, 'resize', updateTop));
    }

    if (!('IntersectionObserver' in window)) {
      return;
    }
    const observer = new IntersectionObserver(([entry]) => {
      const visible = !entry.isIntersecting;
      if (visible) {
        updateTop();
      }
      this.renderer.setStyle(bar, 'opacity', visible ? '1' : '0');
      this.renderer.setStyle(bar, 'transform', visible ? 'translateY(0)' : 'translateY(-100%)');
    });
    observer.observe(heading);
    this.observers.push(observer);
  }

  private setupLightbox(): void {
    const dialog =
      this.host.nativeElement.querySelector<HTMLDialogElement>('[data-lightbox-dialog]');
    if (!dialog || typeof dialog.showModal !== 'function') {
      return;
    }

    const links = Array.from(
      this.host.nativeElement.querySelectorAll<HTMLAnchorElement>('[data-lightbox]'),
    );
    if (!links.length) {
      return;
    }

    const image = dialog.querySelector<HTMLImageElement>('[data-lightbox-image]');
    const caption = dialog.querySelector<HTMLElement>('[data-lightbox-caption]');
    const counter = dialog.querySelector<HTMLElement>('[data-lightbox-counter]');
    const previous = dialog.querySelector<HTMLButtonElement>('[data-lightbox-prev]');
    const next = dialog.querySelector<HTMLButtonElement>('[data-lightbox-next]');
    const close = dialog.querySelector<HTMLButtonElement>('[data-lightbox-close]');
    const getCounterTemplate = (): string => {
      const template = counter?.dataset['template'];
      if (template?.includes('{current}') && template.includes('{total}')) {
        return template;
      }
      return this.document.documentElement.lang === 'en'
        ? '{current} of {total}'
        : '{current} de {total}';
    };
    let currentIndex = 0;
    let trigger: HTMLAnchorElement | null = null;

    const showImage = (index: number): void => {
      currentIndex = (index + links.length) % links.length;
      const link = links[currentIndex];
      const thumbnail = link.querySelector('img');
      if (image) {
        image.src = link.href;
        image.alt = thumbnail?.alt ?? '';
      }
      if (caption) {
        caption.textContent = thumbnail?.alt ?? '';
      }
      if (counter) {
        counter.textContent = getCounterTemplate()
          .replace('{current}', String(currentIndex + 1))
          .replace('{total}', String(links.length));
      }
    };

    const openImage = (index: number, anchor: HTMLAnchorElement): void => {
      trigger = anchor;
      showImage(index);
      dialog.showModal();
      close?.focus();
    };

    if (links.length < 2) {
      if (previous) {
        this.renderer.setAttribute(previous, 'hidden', '');
      }
      if (next) {
        this.renderer.setAttribute(next, 'hidden', '');
      }
    }

    links.forEach((link) => {
      this.cleanups.push(
        this.renderer.listen(link, 'click', (event: MouseEvent) => {
          if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
            return;
          }
          event.preventDefault();
          openImage(Number(link.dataset['lightbox']), link);
        }),
      );
    });
    if (previous) {
      this.cleanups.push(
        this.renderer.listen(previous, 'click', () => showImage(currentIndex - 1)),
      );
    }
    if (next) {
      this.cleanups.push(this.renderer.listen(next, 'click', () => showImage(currentIndex + 1)));
    }
    if (close) {
      this.cleanups.push(this.renderer.listen(close, 'click', () => dialog.close()));
    }
    this.cleanups.push(
      this.renderer.listen(dialog, 'keydown', (event: KeyboardEvent) => {
        if (links.length < 2) {
          return;
        }
        if (event.key === 'ArrowLeft') {
          event.preventDefault();
          showImage(currentIndex - 1);
        } else if (event.key === 'ArrowRight') {
          event.preventDefault();
          showImage(currentIndex + 1);
        }
      }),
      this.renderer.listen(dialog, 'click', (event: MouseEvent) => {
        if (event.target === dialog) {
          dialog.close();
        }
      }),
      this.renderer.listen(dialog, 'close', () => {
        trigger?.focus();
        trigger = null;
      }),
    );
  }

  private setStatus(status: HTMLElement | null, message: string): void {
    if (status) {
      status.textContent = message;
    }
  }

  private toggleClass(element: HTMLElement, className: string, enabled: boolean): void {
    if (enabled) {
      this.renderer.addClass(element, className);
    } else {
      this.renderer.removeClass(element, className);
    }
  }
}
