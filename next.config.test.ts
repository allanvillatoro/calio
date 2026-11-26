import { createRequire } from 'node:module';
import { afterEach, describe, expect, it, vi } from 'vitest';

const require = createRequire(import.meta.url);
const configPath = require.resolve('./next.config.js');

function loadConfig(cloudName: string | undefined) {
  vi.stubEnv('NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME', cloudName);
  delete require.cache[configPath];
  return require(configPath) as {
    images: { remotePatterns: Array<{ pathname: string; search: string }> };
  };
}

afterEach(() => {
  vi.unstubAllEnvs();
  delete require.cache[configPath];
});

describe('Cloudinary image configuration', () => {
  it('restricts remote images to the configured Cloudinary account', () => {
    // Arrange and act
    const config = loadConfig('example-cloud');

    // Assert
    expect(config.images.remotePatterns[0]).toMatchObject({
      hostname: 'res.cloudinary.com',
      pathname: '/example-cloud/image/upload/**',
      search: '',
    });
  });

  it('does not allow all Cloudinary accounts when the cloud name is missing or invalid', () => {
    // Arrange and act
    const missing = loadConfig(undefined);
    const invalid = loadConfig('../**');

    // Assert
    expect(missing.images.remotePatterns[0].pathname).toBe(
      '/__cloudinary_not_configured__/image/upload/**',
    );
    expect(invalid.images.remotePatterns[0].pathname).toBe(
      '/__cloudinary_not_configured__/image/upload/**',
    );
  });
});
