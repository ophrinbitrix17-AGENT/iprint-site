import site from '../content/site.json';

/** Хлебные крошки → BreadcrumbList (Б3 §3). */
export function breadcrumbs(items: { label: string; href: string }[]) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.label, item: new URL(it.href, site.url).href })),
  };
}

/** Описание самой страницы (AboutPage / ContactPage / WebPage) со связью на компанию. */
export function webPage(type: string, path: string, name: string, description: string, dateModified?: string) {
  return {
    '@type': type,
    '@id': `${site.url}${path}#page`,
    url: `${site.url}${path}`,
    name,
    description,
    inLanguage: 'uk',
    isPartOf: { '@id': `${site.url}/#website` },
    about: { '@id': `${site.url}/#org` },
    ...(dateModified ? { dateModified } : {}),
  };
}
