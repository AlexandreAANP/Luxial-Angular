import { getLocaleSwitchPath, normalizeSitePath } from './site-locale';

describe('site locale routes', () => {
  it('switches property detail pages between matching locales', () => {
    expect(
      getLocaleSwitchPath('/real-estate/tres-castelos-praia-da-rocha'),
    ).toBe('/en/apartments/tres-castelos-praia-da-rocha');
    expect(
      getLocaleSwitchPath('/en/apartments/tres-castelos-praia-da-rocha'),
    ).toBe('/real-estate/tres-castelos-praia-da-rocha');
  });

  it('normalizes trailing slashes and query strings before locale switching', () => {
    const path = normalizeSitePath('/en/contact/?source=footer');
    expect(path).toBe('/en/contact');
    expect(getLocaleSwitchPath(path)).toBe('/contactos');
  });
});
