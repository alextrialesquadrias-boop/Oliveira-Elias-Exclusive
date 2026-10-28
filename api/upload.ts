import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';

export default async function handler(request: any, response: any) {
  const body = (request.body || {}) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname, clientPayload, multipart) => {
        return {
          allowedContentTypes: [
            'image/jpeg',
            'image/png',
            'image/webp',
            'image/gif',
            'image/svg+xml',
            'image/avif'
          ],
          maximumSizeInBytes: 50 * 1024 * 1024,
          tokenPayload: JSON.stringify({
            source: 'oliveira-elias-exclusive-admin',
            pathname,
            clientPayload: clientPayload || null,
            multipart
          })
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        console.log('[Vercel Blob] Upload concluído:', blob.url, tokenPayload);
      }
    });

    return response.status(200).json(jsonResponse);
  } catch (error: any) {
    return response.status(400).json({ error: error.message });
  }
}
