import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { ProductImage } from './ProductImage';

describe('ProductImage', () => {
  it('serves the original Cloudinary image without the Vercel optimizer', () => {
    // Arrange
    const source =
      'https://res.cloudinary.com/example/image/upload/product.webp';

    // Act
    const html = renderToStaticMarkup(
      <ProductImage src={source} alt="Producto" width={800} height={600} />,
    );

    // Assert
    expect(html).toContain(`src="${source}"`);
    expect(html).not.toContain('/_next/image');
    expect(html).not.toContain('srcSet=');
  });
});
