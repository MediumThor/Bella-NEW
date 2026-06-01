export const SITE_URL = import.meta.env.VITE_SITE_URL ?? 'https://www.bellastone.net';
export const SITE_NAME = 'Bella Stone';
export const BUSINESS_PHONE = '+1-414-617-8078';
export const BUSINESS_EMAIL = 'bellastone@live.com';

export const DEFAULT_KEYWORDS = [
  'countertops',
  'granite countertops',
  'quartz countertops',
  'stone countertops',
  'countertop fabrication',
  'countertops near me',
  'Milwaukee countertops',
  'Ozaukee County countertops',
  'Mequon countertops',
  'Port Washington countertops',
  'Fredonia WI stone shop',
  'granite Milwaukee',
  'quartz Milwaukee',
  'kitchen countertops Wisconsin',
].join(', ');

export interface PageSeoConfig {
  title: string;
  description: string;
  keywords?: string;
  path: string;
  ogType?: 'website' | 'article';
  noindex?: boolean;
}

export const PAGE_SEO: Record<string, PageSeoConfig> = {
  '/': {
    path: '/',
    title: 'Granite & Quartz Countertops Milwaukee | Bella Stone',
    description:
      'Bella Stone fabricates premium granite, quartz, and natural stone countertops for Milwaukee, Ozaukee County, Mequon, Port Washington, and nearby Wisconsin communities. Custom fabrication since 2008.',
    keywords: DEFAULT_KEYWORDS,
  },
  '/our-process': {
    path: '/our-process',
    title: 'Countertop Fabrication Process | Bella Stone Milwaukee',
    description:
      'See how Bella Stone designs, measures, fabricates, and installs granite and quartz countertops with CNC precision for Milwaukee-area homes and builders.',
    keywords:
      'countertop fabrication, granite fabrication Milwaukee, quartz installation, stone countertop process, Bella Stone',
  },
  '/inventory': {
    path: '/inventory',
    title: 'Granite & Quartz Slab Inventory | Bella Stone',
    description:
      'Browse in-stock granite, quartz, and natural stone slabs at Bella Stone. Serving Milwaukee, Mequon, Port Washington, Ozaukee County, and surrounding areas.',
    keywords:
      'granite slabs Milwaukee, quartz inventory, stone slabs near me, countertop stone selection, Bella Stone inventory',
  },
  '/areas-we-serve': {
    path: '/areas-we-serve',
    title: 'Countertops Near Me | Milwaukee, Ozaukee, Mequon & Port Washington',
    description:
      'Bella Stone installs granite and quartz countertops throughout Milwaukee, Ozaukee County, Mequon, Port Washington, Fredonia, and nearby Wisconsin communities.',
    keywords: DEFAULT_KEYWORDS,
  },
  '/connect': {
    path: '/connect',
    title: 'Contact Bella Stone | Countertop Quotes Milwaukee Area',
    description:
      'Request a countertop quote from Bella Stone. Granite, quartz, and stone fabrication for Milwaukee, Mequon, Port Washington, and Ozaukee County projects.',
    keywords: 'contact Bella Stone, countertop quote Milwaukee, granite quote near me',
  },
  '/blog': {
    path: '/blog',
    title: 'Countertop & Stone Blog | Bella Stone',
    description:
      'Tips, project highlights, and stone countertop insights from Bella Stone in southeastern Wisconsin.',
    keywords: 'countertop blog, granite quartz tips, Bella Stone blog',
  },
  '/resources': {
    path: '/resources',
    title: 'Countertop Resources | Bella Stone',
    description: 'Helpful resources for planning granite, quartz, and stone countertop projects with Bella Stone.',
    keywords: 'countertop resources, stone countertop planning',
  },
};

export const getPageSeo = (pathname: string): PageSeoConfig => {
  const normalized = pathname.replace(/\/+$/, '') || '/';

  if (
    normalized.startsWith('/admin') ||
    normalized.startsWith('/charter-form') ||
    normalized === '/job-checklist' ||
    normalized === '/measurement'
  ) {
    return {
      path: normalized,
      title: `${SITE_NAME} Admin`,
      description: 'Bella Stone internal page.',
      noindex: true,
    };
  }

  return (
    PAGE_SEO[normalized] ?? {
      path: normalized,
      title: `${SITE_NAME} | Granite & Quartz Countertops Milwaukee`,
      description:
        'Premium granite, quartz, and stone countertops fabricated and installed by Bella Stone for Milwaukee and Ozaukee County.',
      keywords: DEFAULT_KEYWORDS,
    }
  );
};

export const LOCAL_BUSINESS_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'HomeAndConstructionBusiness',
  name: 'Bella Stone LLC',
  url: SITE_URL,
  image: `${SITE_URL}/homepage.jpeg`,
  logo: `${SITE_URL}/Logo.png`,
  telephone: BUSINESS_PHONE,
  email: BUSINESS_EMAIL,
  priceRange: '$$',
  foundingDate: '2008',
  address: {
    '@type': 'PostalAddress',
    streetAddress: '737 Tower Drive',
    addressLocality: 'Fredonia',
    addressRegion: 'WI',
    postalCode: '53021',
    addressCountry: 'US',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: 43.4583816,
    longitude: -87.948204,
  },
  areaServed: [
    { '@type': 'City', name: 'Milwaukee' },
    { '@type': 'City', name: 'Mequon' },
    { '@type': 'City', name: 'Port Washington' },
    { '@type': 'City', name: 'Fredonia' },
    { '@type': 'AdministrativeArea', name: 'Ozaukee County' },
    { '@type': 'AdministrativeArea', name: 'Southeast Wisconsin' },
  ],
  sameAs: ['https://www.facebook.com/BellaStoneLLC/'],
  description:
    'Bella Stone fabricates and installs granite, quartz, and natural stone countertops for homeowners, builders, and designers across Milwaukee, Ozaukee County, Mequon, Port Washington, and nearby Wisconsin communities.',
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'Countertop Services',
    itemListElement: [
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'Granite Countertop Fabrication',
          description: 'Custom granite countertop templating, fabrication, and installation.',
        },
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'Quartz Countertop Fabrication',
          description: 'Engineered quartz countertop design, fabrication, and professional installation.',
        },
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'Natural Stone Countertops',
          description: 'Marble, quartzite, and other natural stone countertop solutions.',
        },
      },
    ],
  },
};

export const FAQ_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Does Bella Stone install countertops near me in Milwaukee?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. Bella Stone fabricates and installs granite, quartz, and natural stone countertops throughout Milwaukee, Ozaukee County, Mequon, Port Washington, and surrounding southeastern Wisconsin communities from our Fredonia shop.',
      },
    },
    {
      '@type': 'Question',
      name: 'What countertop materials does Bella Stone offer?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Bella Stone specializes in granite countertops, quartz countertops, and other premium natural stone surfaces for kitchens, bathrooms, and commercial projects.',
      },
    },
    {
      '@type': 'Question',
      name: 'Where is Bella Stone located?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Bella Stone is located at 737 Tower Drive in Fredonia, Wisconsin, and serves homeowners and builders across the greater Milwaukee and Ozaukee County area.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can I view granite and quartz slabs before ordering?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. Bella Stone maintains an inventory of granite, quartz, and natural stone slabs. Visit the inventory page or contact the team to review current in-stock options or source material for custom projects.',
      },
    },
  ],
};
