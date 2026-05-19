export const DEFAULT_SITE_URL = 'https://caliojoyeria.com';
export const LOGO_PATH = '/images/logo.png';

export function getProductUrl(siteUrl: string, productId: number) {
  return `${siteUrl.replace(/\/$/, '')}/productos/${productId}`;
}
