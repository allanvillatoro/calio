const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const cloudinaryPath = /^[a-zA-Z0-9_-]+$/.test(cloudName ?? '')
  ? `/${cloudName}/image/upload/**`
  : '/__cloudinary_not_configured__/image/upload/**';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: cloudinaryPath,
        search: '',
      },
    ],
  },
};

module.exports = nextConfig;
