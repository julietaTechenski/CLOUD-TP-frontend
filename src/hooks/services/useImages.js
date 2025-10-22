import { useState, useCallback } from 'react';
import api from '../../lib/axios';

export const useImages = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const requestUploadUrl = useCallback(async (packageCode, file, purpose = 'CREATION') => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        action: 'upload',
        purpose: purpose,
        contentType: file.type,
        filename: file.name
      });

      const response = await api.get(`/packages/${packageCode}/images?${params}`);
      
      if (response.status === 200) {
        return response.data;
      } else {
        throw new Error('Failed to get upload URL');
      }
    } catch (err) {
      console.error('Error requesting upload URL:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const uploadToS3 = useCallback(async (uploadUrl, file) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      return response;
    } catch (err) {
      console.error('Error uploading to S3:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const uploadImage = useCallback(async (packageCode, file, purpose = 'CREATION') => {
    try {
      setLoading(true);
      setError(null);

      // Step 1: Request upload URL
      const uploadData = await requestUploadUrl(packageCode, file, purpose);
      
      // Step 2: Upload file to S3
      await uploadToS3(uploadData.upload_url, file);
      
      // Step 3: Return the image metadata
      return {
        image_id: uploadData.image_id,
        s3_key: uploadData.s3_key,
        purpose: purpose,
        status: 'UPLOADED'
      };
    } catch (err) {
      console.error('Error uploading image:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [requestUploadUrl, uploadToS3]);

  const getPackageImages = useCallback(async (packageCode) => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get(`/packages/${packageCode}/images`);
      
      if (response.status === 200) {
        return response.data;
      } else {
        throw new Error('Failed to get package images');
      }
    } catch (err) {
      console.error('Error getting package images:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    uploadImage,
    getPackageImages,
    requestUploadUrl,
    uploadToS3
  };
};
