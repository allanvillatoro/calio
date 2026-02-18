export function formatPrice(price: number): string {
  return `L. ${price.toLocaleString('es-HN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

