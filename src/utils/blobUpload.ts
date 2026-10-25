import { upload } from '@vercel/blob/client';

export interface UploadProgressCallback {
  (percentage: number): void;
}

/**
 * Uploads an image file directly from the client to Vercel Blob.
 * Uses client-side upload via the `/api/blob/upload` route to avoid Vercel Function size limits.
 *
 * @param file The image File selected by the user.
 * @param folder Subfolder path ('hero' | 'imoveis').
 * @param onProgress Callback function reporting percentage (0-100).
 * @returns The public URL of the uploaded blob.
 */
export async function uploadImageToVercelBlob(
  file: File,
  folder: 'hero' | 'imoveis' = 'imoveis',
  onProgress?: UploadProgressCallback
): Promise<string> {
  if (!file) {
    throw new Error('Nenhum arquivo de imagem foi fornecido.');
  }

  if (!file.type.startsWith('image/')) {
    throw new Error('O arquivo selecionado não é uma imagem válida (formatos aceitos: JPG, PNG, WebP, etc.).');
  }

  // 50 MB max
  const maxBytes = 50 * 1024 * 1024;
  if (file.size > maxBytes) {
    throw new Error('A imagem excede o tamanho máximo permitido de 50MB.');
  }

  // Create clean, unique pathname for Vercel Blob
  const sanitizedOriginalName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const pathname = `oliveira-elias/${folder}/${Date.now()}-${sanitizedOriginalName}`;

  try {
    const blob = await upload(pathname, file, {
      access: 'public',
      handleUploadUrl: '/api/blob/upload',
      onUploadProgress: (progress) => {
        if (onProgress) {
          onProgress(Math.round(progress.percentage));
        }
      }
    });

    return blob.url;
  } catch (err: any) {
    console.error('Falha no upload para Vercel Blob:', err);
    throw err;
  }
}
