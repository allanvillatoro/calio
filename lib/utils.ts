export function formatPrice(price: number): string {
  return `L. ${price.toLocaleString('es-HN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

const CLOUD_NAME = 'dggrup7kw';
const BASE_URL = `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/`;

export function getImageUrl(filename: string): string {
  return `${BASE_URL}${filename}`;
}

