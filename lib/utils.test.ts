import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  formatPrice,
  mergeFilesByName,
  moveArrayItem,
  toNumber,
} from './utils';

function createFile(name: string) {
  return new File(['image'], name, {
    type: 'image/jpeg',
  });
}

describe('getImageUrl', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it('resolves Cloudinary filenames against the configured cloud name', async () => {
    vi.stubEnv('NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME', 'calio-test');
    vi.resetModules();

    const { getImageUrl } = await import('./utils');

    expect(getImageUrl('products/collar.jpg')).toBe(
      'https://res.cloudinary.com/calio-test/image/upload/products/collar.jpg',
    );
  });
});

describe('formatPrice', () => {
  it('formats integer prices without decimal places', () => {
    expect(formatPrice(1500)).toBe('L1,500');
  });

  it('formats decimal prices with two decimal places', () => {
    expect(formatPrice(1500.5)).toBe('L1,500.50');
  });
});

describe('toNumber', () => {
  it('converts numeric strings to numbers', () => {
    expect(toNumber('42.5')).toBe(42.5);
  });

  it('returns zero for non-numeric strings', () => {
    expect(toNumber('abc')).toBe(0);
  });
});

describe('mergeFilesByName', () => {
  it('appends incoming files with new names', () => {
    const existingFile = createFile('collar.jpg');
    const incomingFile = createFile('detalle.jpg');

    const files = mergeFilesByName([existingFile], [incomingFile]);

    expect(files).toEqual([existingFile, incomingFile]);
  });

  it('keeps the existing file when incoming files have duplicate names', () => {
    const existingFile = createFile('collar.jpg');
    const duplicateFile = createFile('collar.jpg');

    const files = mergeFilesByName([existingFile], [duplicateFile]);

    expect(files).toEqual([existingFile]);
  });
});

describe('moveArrayItem', () => {
  it('moves an item from one index to another without mutating the original array', () => {
    const items = ['primera', 'segunda', 'tercera'];

    const movedItems = moveArrayItem(items, 0, 2);

    expect(movedItems).toEqual(['segunda', 'tercera', 'primera']);
    expect(items).toEqual(['primera', 'segunda', 'tercera']);
  });

  it('returns the original array for invalid moves', () => {
    const items = ['primera', 'segunda'];

    expect(moveArrayItem(items, -1, 1)).toBe(items);
    expect(moveArrayItem(items, 0, 4)).toBe(items);
    expect(moveArrayItem(items, 1, 1)).toBe(items);
  });
});
