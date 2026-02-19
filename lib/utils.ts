export function formatPrice(price: number): string {
  return `L${price.toLocaleString("es-HN", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

const BASE_URL = `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/`;

export function getImageUrl(filename: string): string {
  return `${BASE_URL}${filename}`;
}
