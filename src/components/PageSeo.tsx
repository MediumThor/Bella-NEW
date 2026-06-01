import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  FAQ_SCHEMA,
  getPageSeo,
  LOCAL_BUSINESS_SCHEMA,
  SITE_NAME,
  SITE_URL,
} from '../config/seo';

const META_ATTR = 'data-bella-seo';

const upsertMeta = (selector: string, create: () => HTMLMetaElement, value: string) => {
  let element = document.head.querySelector<HTMLMetaElement>(selector);
  if (!element) {
    element = create();
    element.setAttribute(META_ATTR, 'true');
    document.head.appendChild(element);
  }
  element.setAttribute('content', value);
};

const upsertLink = (rel: string, href: string) => {
  let element = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"][${META_ATTR}]`);
  if (!element) {
    element = document.createElement('link');
    element.setAttribute('rel', rel);
    element.setAttribute(META_ATTR, 'true');
    document.head.appendChild(element);
  }
  element.setAttribute('href', href);
};

const upsertJsonLd = (id: string, data: object) => {
  let element = document.head.querySelector<HTMLScriptElement>(`script[data-jsonld-id="${id}"]`);
  if (!element) {
    element = document.createElement('script');
    element.type = 'application/ld+json';
    element.setAttribute('data-jsonld-id', id);
    element.setAttribute(META_ATTR, 'true');
    document.head.appendChild(element);
  }
  element.textContent = JSON.stringify(data);
};

const PageSeo = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    const seo = getPageSeo(pathname);
    const canonicalUrl = `${SITE_URL}${seo.path === '/' ? '' : seo.path}`;
    const imageUrl = `${SITE_URL}/homepage.jpeg`;

    document.title = seo.title;

    upsertMeta(
      'meta[name="description"][data-bella-seo]',
      () => {
        const meta = document.createElement('meta');
        meta.name = 'description';
        return meta;
      },
      seo.description,
    );

    if (seo.keywords) {
      upsertMeta(
        'meta[name="keywords"][data-bella-seo]',
        () => {
          const meta = document.createElement('meta');
          meta.name = 'keywords';
          return meta;
        },
        seo.keywords,
      );
    }

    upsertMeta(
      'meta[property="og:title"][data-bella-seo]',
      () => {
        const meta = document.createElement('meta');
        meta.setAttribute('property', 'og:title');
        return meta;
      },
      seo.title,
    );

    upsertMeta(
      'meta[property="og:description"][data-bella-seo]',
      () => {
        const meta = document.createElement('meta');
        meta.setAttribute('property', 'og:description');
        return meta;
      },
      seo.description,
    );

    upsertMeta(
      'meta[property="og:url"][data-bella-seo]',
      () => {
        const meta = document.createElement('meta');
        meta.setAttribute('property', 'og:url');
        return meta;
      },
      canonicalUrl,
    );

    upsertMeta(
      'meta[property="og:type"][data-bella-seo]',
      () => {
        const meta = document.createElement('meta');
        meta.setAttribute('property', 'og:type');
        return meta;
      },
      seo.ogType ?? 'website',
    );

    upsertMeta(
      'meta[property="og:site_name"][data-bella-seo]',
      () => {
        const meta = document.createElement('meta');
        meta.setAttribute('property', 'og:site_name');
        return meta;
      },
      SITE_NAME,
    );

    upsertMeta(
      'meta[property="og:image"][data-bella-seo]',
      () => {
        const meta = document.createElement('meta');
        meta.setAttribute('property', 'og:image');
        return meta;
      },
      imageUrl,
    );

    upsertMeta(
      'meta[name="twitter:card"][data-bella-seo]',
      () => {
        const meta = document.createElement('meta');
        meta.name = 'twitter:card';
        return meta;
      },
      'summary_large_image',
    );

    upsertMeta(
      'meta[name="twitter:title"][data-bella-seo]',
      () => {
        const meta = document.createElement('meta');
        meta.name = 'twitter:title';
        return meta;
      },
      seo.title,
    );

    upsertMeta(
      'meta[name="twitter:description"][data-bella-seo]',
      () => {
        const meta = document.createElement('meta');
        meta.name = 'twitter:description';
        return meta;
      },
      seo.description,
    );

    upsertMeta(
      'meta[name="twitter:image"][data-bella-seo]',
      () => {
        const meta = document.createElement('meta');
        meta.name = 'twitter:image';
        return meta;
      },
      imageUrl,
    );

    upsertMeta(
      'meta[name="robots"][data-bella-seo]',
      () => {
        const meta = document.createElement('meta');
        meta.name = 'robots';
        return meta;
      },
      seo.noindex ? 'noindex,nofollow' : 'index,follow',
    );

    upsertLink('canonical', canonicalUrl);

    upsertJsonLd('local-business', LOCAL_BUSINESS_SCHEMA);
    if (pathname === '/' || pathname === '/areas-we-serve') {
      upsertJsonLd('faq', FAQ_SCHEMA);
    } else {
      document.head.querySelector('script[data-jsonld-id="faq"]')?.remove();
    }
  }, [pathname]);

  return null;
};

export default PageSeo;
