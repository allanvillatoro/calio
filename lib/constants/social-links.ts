export const SOCIAL_LINKS = {
  instagram: {
    href: 'https://instagram.com/calio.hnd',
    dmHref: 'https://ig.me/m/calio.hnd',
    label: 'Instagram',
  },
  tiktok: {
    href: 'https://tiktok.com/@calio.hnd',
    label: 'TikTok',
  },
  facebook: {
    href: 'https://facebook.com/caliojoyeria',
    label: 'Facebook',
  },
} as const;

export const SOCIAL_PROFILE_LINKS = [
  SOCIAL_LINKS.instagram,
  SOCIAL_LINKS.tiktok,
  SOCIAL_LINKS.facebook,
] as const;
