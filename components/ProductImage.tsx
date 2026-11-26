import Image from 'next/image';
import type { ComponentProps } from 'react';

export function ProductImage({ alt, ...props }: ComponentProps<typeof Image>) {
  return <Image {...props} alt={alt} unoptimized />;
}
