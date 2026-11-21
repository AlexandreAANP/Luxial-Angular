import { Routes } from '@angular/router';

const pageRoutes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () => import('./pages/home.page').then((m) => m.HomePage),
    title: 'LUXIAL · Gestão de alojamento local no Algarve, em Portimão e Alvor',
    data: {
      locale: 'pt-PT',
      description:
        'Gerimos o seu apartamento ou moradia no Algarve: anúncios, preços, hóspedes, limpezas, manutenção e conformidade legal. Peça uma estimativa do rendimento anual do seu imóvel, sem compromisso.',
    },
  },
  {
    path: 'contactos',
    loadComponent: () => import('./pages/contact.page').then((m) => m.ContactPage),
    title: 'Contactos · LUXIAL, gestão de alojamento local no Algarve',
    data: {
      locale: 'pt-PT',
      description:
        'Telefone, WhatsApp e email da LUXIAL. Gestão de alojamento local em Portimão e Alvor, com apoio a hóspedes durante a estadia.',
    },
  },
  {
    path: 'sobre',
    loadComponent: () => import('./pages/about.page').then((m) => m.AboutPage),
    title: 'Quem somos · Gestão local em Portimão e Alvor | LUXIAL',
    data: {
      locale: 'pt-PT',
      description:
        'A LUXIAL gere alojamento local em Portimão e Alvor. Conheça quem somos, a área que cobrimos e a forma como trabalhamos.',
    },
  },
  {
    path: 'servicos',
    loadComponent: () => import('./pages/services.page').then((m) => m.ServicesPage),
    title: 'Serviços · Gestão completa de alojamento local | LUXIAL',
    data: {
      locale: 'pt-PT',
      description:
        'Anúncio, preços dinâmicos, hóspedes, check-in, limpeza, manutenção, conformidade legal e relatórios. Tudo o que deixa de ser da sua responsabilidade quando entrega o imóvel à LUXIAL.',
    },
  },
  {
    path: 'real-estate',
    loadComponent: () => import('./pages/properties.page').then((m) => m.PropertiesPage),
    title: 'Imóveis · Casas que gerimos no Algarve | LUXIAL',
    data: {
      locale: 'pt-PT',
      description:
        'Apartamentos e moradias que a LUXIAL gere em Portimão e Alvor. Reservas no Airbnb e no Booking.com; aqui ficam as fotografias, as comodidades e o registo AL.',
    },
  },
  {
    path: 'real-estate/tres-castelos-praia-da-rocha',
    loadComponent: () => import('./pages/property-detail.page').then((m) => m.PropertyDetailPage),
    title: 'Três Castelos · T1, Portimão | LUXIAL',
    data: {
      locale: 'pt-PT',
      description:
        'Apartamento com varanda e vista de mar em Três Castelos, Praia da Rocha, a poucos minutos a pé da praia.',
    },
  },
  {
    path: 'parcerias',
    loadComponent: () => import('./pages/partnerships.page').then((m) => m.PartnershipsPage),
    title: 'Parcerias · A rede local da LUXIAL | LUXIAL',
    data: {
      locale: 'pt-PT',
      description:
        'Fotografia, vídeo e experiências no mar. Os parceiros com quem a LUXIAL trabalha em Portimão e Alvor.',
    },
  },
  {
    path: 'politica-de-privacidade',
    loadComponent: () => import('./pages/privacy-policy.page').then((m) => m.PrivacyPolicyPage),
    title: 'Política de Privacidade | LUXIAL',
    data: {
      locale: 'pt-PT',
      description:
        'Como a LUXIAL recolhe, utiliza e protege os dados pessoais de quem visita este site e de quem nos confia a gestão do seu imóvel.',
    },
  },
  {
    path: 'termos-e-condicoes',
    loadComponent: () => import('./pages/terms.page').then((m) => m.TermsPage),
    title: 'Termos e Condições | LUXIAL',
    data: {
      locale: 'pt-PT',
      description:
        'Condições de utilização do site da LUXIAL, natureza das estimativas de rendimento apresentadas e informação legal obrigatória.',
    },
  },
  {
    path: 'en',
    pathMatch: 'full',
    loadComponent: () => import('./pages/home.page').then((m) => m.HomePage),
    title: 'LUXIAL · Holiday rental management in the Algarve, Portimão and Alvor',
    data: {
      locale: 'en',
      description:
        'We manage your Algarve apartment or villa: listings, pricing, guests, cleaning, maintenance and legal compliance. Ask for an estimate of the annual income your property could earn, with no obligation.',
    },
  },
  {
    path: 'en/contact',
    loadComponent: () => import('./pages/contact.page').then((m) => m.ContactPage),
    title: 'Contact · LUXIAL, holiday rental management in the Algarve',
    data: {
      locale: 'en',
      description:
        'Phone, WhatsApp and email for LUXIAL. Holiday rental management in Portimão and Alvor, with guest support throughout the stay.',
    },
  },
  {
    path: 'en/about',
    loadComponent: () => import('./pages/about.page').then((m) => m.AboutPage),
    title: 'About · Local management in Portimão and Alvor | LUXIAL',
    data: {
      locale: 'en',
      description:
        'LUXIAL manages holiday rentals in Portimão and Alvor. Meet who we are, the area we cover and the way we work.',
    },
  },
  {
    path: 'en/services',
    loadComponent: () => import('./pages/services.page').then((m) => m.ServicesPage),
    title: 'Services · Full holiday rental management | LUXIAL',
    data: {
      locale: 'en',
      description:
        'Listing, dynamic pricing, guests, check-in, cleaning, maintenance, legal compliance and reporting. Everything that stops being your responsibility when LUXIAL takes on your property.',
    },
  },
  {
    path: 'en/apartments',
    loadComponent: () => import('./pages/properties.page').then((m) => m.PropertiesPage),
    title: 'Properties · Homes we manage in the Algarve | LUXIAL',
    data: {
      locale: 'en',
      description:
        'Apartments and villas LUXIAL manages in Portimão and Alvor. Bookings happen on Airbnb and Booking.com; here you get the photographs, the amenities and the AL registration.',
    },
  },
  {
    path: 'en/apartments/tres-castelos-praia-da-rocha',
    loadComponent: () => import('./pages/property-detail.page').then((m) => m.PropertyDetailPage),
    title: 'Três Castelos · T1, Portimão | LUXIAL',
    data: {
      locale: 'en',
      description:
        "An apartment with a balcony and a sea view in Três Castelos, Praia da Rocha, a few minutes' walk from the beach.",
    },
  },
  {
    path: 'en/partnerships',
    loadComponent: () => import('./pages/partnerships.page').then((m) => m.PartnershipsPage),
    title: 'Partnerships · The LUXIAL local network | LUXIAL',
    data: {
      locale: 'en',
      description:
        'Photography, video and experiences at sea. The partners LUXIAL works with in Portimão and Alvor.',
    },
  },
  {
    path: 'en/privacy-policy',
    loadComponent: () => import('./pages/privacy-policy.page').then((m) => m.PrivacyPolicyPage),
    title: 'Privacy Policy | LUXIAL',
    data: {
      locale: 'en',
      description:
        'How LUXIAL collects, uses and protects the personal data of people who visit this site and of owners who trust us with their property.',
    },
  },
  {
    path: 'en/terms',
    loadComponent: () => import('./pages/terms.page').then((m) => m.TermsPage),
    title: 'Terms & Conditions | LUXIAL',
    data: {
      locale: 'en',
      description:
        'Terms governing the use of the LUXIAL website, the nature of the income estimates shown, and the required legal information.',
    },
  },
];

const legacyPathRedirects: Routes = pageRoutes.map(({ path }) => ({
  path: path ? `${path}/index.html` : 'index.html',
  pathMatch: 'full',
  redirectTo: path ? `/${path}` : '/',
}));

export const routes: Routes = [
  ...pageRoutes,
  ...legacyPathRedirects,
  {
    path: '**',
    redirectTo: '',
  },
];
