export const DEFAULT_SITE_URL = 'https://caliojoyeria.com';
export const LOGO_PATH = '/images/logo.png';

export function getProductUrl(
  siteUrl: string,
  productIdOrSlug: number | string,
) {
  return `${siteUrl.replace(/\/$/, '')}/productos/${productIdOrSlug}`;
}
