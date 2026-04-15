import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

const BASE_URL = `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/`;

export function getImageUrl(filename: string): string {
  return `${BASE_URL}${filename}`;
}

export function formatPrice(price: number): string {
  const hasDecimals = !Number.isInteger(price);

  return `L${price.toLocaleString('es-HN', {
    minimumFractionDigits: hasDecimals ? 2 : 0,
    maximumFractionDigits: hasDecimals ? 2 : 0,
  })}`;
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function toNumber(value: string): number {
  const n = Number(value);
  return Number.isNaN(n) ? 0 : n;
}

export function mergeFilesByName(
  existingFiles: File[],
  incomingFiles: File[],
): File[] {
  const fileMap = new Map(existingFiles.map((file) => [file.name, file]));

  incomingFiles.forEach((file) => {
    if (!fileMap.has(file.name)) {
      fileMap.set(file.name, file);
    }
  });

  return Array.from(fileMap.values());
}

export function moveArrayItem<T>(
  items: T[],
  fromIndex: number,
  toIndex: number,
): T[] {
  if (
    fromIndex === toIndex ||
    fromIndex < 0 ||
    toIndex < 0 ||
    fromIndex >= items.length ||
    toIndex >= items.length
  ) {
    return items;
  }

  const nextItems = [...items];
  const [movedItem] = nextItems.splice(fromIndex, 1);
  nextItems.splice(toIndex, 0, movedItem);

  return nextItems;
}
