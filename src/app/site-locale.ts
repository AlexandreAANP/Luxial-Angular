const localeRoutes: Record<string, string> = {
  '/': '/en',
  '/en': '/',
  '/contactos': '/en/contact',
  '/en/contact': '/contactos',
  '/sobre': '/en/about',
  '/en/about': '/sobre',
  '/servicos': '/en/services',
  '/en/services': '/servicos',
  '/real-estate': '/en/apartments',
  '/en/apartments': '/real-estate',
  '/real-estate/tres-castelos-praia-da-rocha':
    '/en/apartments/tres-castelos-praia-da-rocha',
  '/en/apartments/tres-castelos-praia-da-rocha':
    '/real-estate/tres-castelos-praia-da-rocha',
  '/parcerias': '/en/partnerships',
  '/en/partnerships': '/parcerias',
  '/politica-de-privacidade': '/en/privacy-policy',
  '/en/privacy-policy': '/politica-de-privacidade',
  '/termos-e-condicoes': '/en/terms',
  '/en/terms': '/termos-e-condicoes',
};

export function normalizeSitePath(url: string): string {
  return url.split(/[?#]/, 1)[0].replace(/\/+$/, '') || '/';
}

export function isEnglishPath(path: string): boolean {
  return path === '/en' || path.startsWith('/en/');
}

export function getLocaleSwitchPath(path: string): string {
  return localeRoutes[path] ?? (isEnglishPath(path) ? '/' : '/en');
}
