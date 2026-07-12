import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { SOCIAL_LINKS } from '@/lib/constants/social-links';
import { Footer } from './Footer';

describe('Footer', () => {
  it('renders social links and copyright details', () => {
    render(<Footer />);

    expect(screen.getByRole('link', { name: 'Instagram' })).toHaveAttribute(
      'href',
      SOCIAL_LINKS.instagram.href,
    );
    expect(screen.getByRole('link', { name: 'TikTok' })).toHaveAttribute(
      'href',
      SOCIAL_LINKS.tiktok.href,
    );
    expect(screen.getByRole('link', { name: 'Facebook' })).toHaveAttribute(
      'href',
      SOCIAL_LINKS.facebook.href,
    );
    expect(
      screen.getByText('© 2026 CALIO Joyería. Todos los derechos reservados.'),
    ).toBeVisible();
    expect(screen.getByText('San Pedro Sula, Honduras')).toBeVisible();
  });
});
