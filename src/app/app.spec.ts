import { routes } from './app.routes';

describe('site routes', () => {
  it('maps every site page to a lazy-loaded Angular component', () => {
    const pageRoutes = routes.filter((route) => route.data?.['locale']);
    expect(pageRoutes).toHaveLength(18);
    expect(pageRoutes.every((route) => route.loadComponent)).toBe(true);
    expect(pageRoutes.every((route) => !route.data?.['sourcePage'])).toBe(true);
  });

  it('redirects legacy index.html URLs to their Angular routes', () => {
    const legacyRoutes = routes.filter((route) =>
      route.path?.endsWith('index.html'),
    );
    expect(legacyRoutes).toHaveLength(18);
  });
});
