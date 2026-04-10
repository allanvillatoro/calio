'use server';

import { createHash } from 'node:crypto';
import axios from 'axios';

import {
  cloudinaryApi,
  getCloudinaryCredentials,
} from '@/lib/api/cloudinary.api';

interface CloudinaryUploadResponse {
  public_id: string;
  format: string;
}

function createCloudinarySignature(
  params: Record<string, string>,
  apiSecret: string,
) {
  const serializedParams = Object.entries(params)
    .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
    .map(([key, value]) => `${key}=${value}`)
    .join('&');

  return createHash('sha1')
    .update(`${serializedParams}${apiSecret}`)
    .digest('hex');
}

async function uploadImageToCloudinary(file: File): Promise<string> {
  const { apiKey, apiSecret } = getCloudinaryCredentials();
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const signedParams = {
    asset_folder: 'calio',
    overwrite: 'false',
    timestamp,
    unique_filename: 'true',
    use_filename: 'true',
  };
  const signature = createCloudinarySignature(signedParams, apiSecret);

  const formData = new FormData();
  formData.append('file', file);
  formData.append('api_key', apiKey);
  formData.append('timestamp', timestamp);
  formData.append('asset_folder', signedParams.asset_folder);
  formData.append('use_filename', signedParams.use_filename);
  formData.append('unique_filename', signedParams.unique_filename);
  formData.append('overwrite', signedParams.overwrite);
  formData.append('signature', signature);

  try {
    const response = await cloudinaryApi.post<CloudinaryUploadResponse>(
      '/image/upload',
      formData,
    );

    const filename = response.data.public_id.split('/').pop();

    if (!filename) {
      throw new Error('Cloudinary upload failed: missing public_id');
    }

    return `${filename}.${response.data.format}`;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        `Cloudinary upload failed: ${JSON.stringify(error.response?.data ?? error.message)}`,
      );
    }

    throw error;
  }
}

export async function uploadProductImagesAction(
  files: File[],
): Promise<string[]> {
  if (files.length === 0) {
    return [];
  }

  return Promise.all(files.map((file) => uploadImageToCloudinary(file)));
}
