import {
  Children,
  isValidElement,
  type ReactElement,
  type ReactNode,
} from 'react';
import { describe, expect, it } from 'vitest';
import type { PdfCartItem } from '@/lib/cart/order-pdf-image.helpers';
import { SOCIAL_PROFILE_LINKS } from '@/lib/constants/social-links';
import { CartOrderPdfDocument } from './CartOrderPdfDocument';

function createPdfItem(overrides: Partial<PdfCartItem> = {}): PdfCartItem {
  return {
    product: {
      id: 12,
      name: 'Collar Perla',
      description: 'Collar dorado con dije de perla',
      price: 250,
      discount: 0,
      priceWithDiscount: 250,
      quantity: 5,
      images: ['collar-perla.jpg'],
      category: 'collares',
      inStore: true,
    },
    quantity: 2,
    imageSrc: 'data:image/png;base64,collar',
    ...overrides,
  };
}

function renderDocument(
  overrides: Partial<Parameters<typeof CartOrderPdfDocument>[0]> = {},
) {
  return CartOrderPdfDocument({
    items: [createPdfItem()],
    logoSrc: 'data:image/png;base64,logo',
    siteUrl: 'https://calio.test/',
    subtotal: 250,
    ...overrides,
  });
}

function walkReactTree(node: ReactNode, visit: (node: ReactNode) => void) {
  visit(node);

  if (!isValidElement<{ children?: ReactNode }>(node)) {
    return;
  }

  Children.forEach(node.props.children, (child) => {
    walkReactTree(child, visit);
  });
}

function collectText(node: ReactElement) {
  const text: string[] = [];

  walkReactTree(node, (child) => {
    if (typeof child === 'string' || typeof child === 'number') {
      text.push(String(child));
    }
  });

  return text;
}

function collectSources(node: ReactElement) {
  const sources: string[] = [];

  walkReactTree(node, (child) => {
    if (!isValidElement<{ src?: unknown }>(child)) {
      return;
    }

    if (typeof child.props.src === 'string') {
      sources.push(child.props.src);
    }
  });

  return sources;
}

describe('CartOrderPdfDocument', () => {
  it('renders order headers, item details, and subtotal', () => {
    const document = renderDocument({
      subtotal: 500,
    });

    expect(collectText(document)).toEqual(
      expect.arrayContaining([
        'Pedido',
        'Imagen',
        'Precio',
        'Collar Perla',
        'Collar dorado con dije de perla',
        'Cantidad: ',
        '2',
        'L250',
        'Subtotal: ',
        'L500',
      ]),
    );
  });

  it('links each product to its public product page', () => {
    const document = renderDocument({
      items: [
        createPdfItem(),
        createPdfItem({
          product: {
            ...createPdfItem().product,
            id: 18,
            name: 'Anillo Luna',
            description: 'Anillo plateado ajustable',
            price: 180,
            discount: 10,
            priceWithDiscount: 162,
            quantity: 3,
            images: ['anillo-luna.jpg'],
            category: 'anillos',
          },
          quantity: 1,
          imageSrc: 'data:image/png;base64,anillo',
        }),
      ],
      siteUrl: 'https://calio.test/',
    });

    expect(collectSources(document)).toEqual(
      expect.arrayContaining([
        'https://calio.test/productos/12',
        'https://calio.test/productos/18',
      ]),
    );
  });

  it('renders logo and product images only when image sources are available', () => {
    const document = renderDocument({
      items: [
        createPdfItem(),
        createPdfItem({
          product: {
            ...createPdfItem().product,
            id: 18,
            name: 'Anillo Luna',
            images: ['anillo-luna.jpg'],
          },
          imageSrc: undefined,
        }),
      ],
    });

    expect(collectSources(document)).toContain('data:image/png;base64,logo');
    expect(collectSources(document)).toContain('data:image/png;base64,collar');
    expect(collectSources(document)).not.toContain(
      'data:image/png;base64,anillo',
    );

    const documentWithoutLogo = renderDocument({
      logoSrc: undefined,
    });

    expect(collectSources(documentWithoutLogo)).not.toContain(
      'data:image/png;base64,logo',
    );
  });

  it('renders social links and footer location', () => {
    const document = renderDocument();
    const text = collectText(document);
    const sources = collectSources(document);

    SOCIAL_PROFILE_LINKS.forEach((link) => {
      expect(text).toContain(link.label);
      expect(sources).toContain(link.href);
    });
    expect(text).toContain('San Pedro Sula, Honduras');
  });
});
