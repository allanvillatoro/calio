import axios from 'axios';

function getCloudinaryCloudName() {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

  if (!cloudName) {
    throw new Error('NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME is not configured');
  }

  return cloudName;
}

export function getCloudinaryCredentials() {
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!apiKey || !apiSecret) {
    throw new Error('Cloudinary credentials are not configured');
  }

  return { apiKey, apiSecret };
}

export const cloudinaryApi = axios.create({
  baseURL: `https://api.cloudinary.com/v1_1/${getCloudinaryCloudName()}`,
});
