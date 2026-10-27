import { upload } from '@vercel/blob/client';

export interface UploadProgressCallback {
  (percentage: number): void;
}

/**
 * Checks whether the server has BLOB_READ_WRITE_TOKEN configured.
 */
export async function checkBlobStorageStatus(): Promise<boolean> {
  try {
    const res = await fetch('/api/blob/status');
    if (!res.ok) return false;
    const data = await res.json();
    return Boolean(data.configured);
  } catch {
    return false;
  }
}

/**
 * Uploads an image file directly from the client to Vercel Blob.
 * Uses client-side direct upload via handleUpload at `/api/upload` to bypass server function limits.
 * If BLOB_READ_WRITE_TOKEN is not configured on the server, falls back to local data URL preview.
 *
 * @param file The image File selected by the user.
 * @param folder Subfolder path ('hero' | 'imoveis' | 'sobre').
 * @param onProgress Callback function reporting percentage (0-100).
 * @returns The public URL of the uploaded blob (or base64 preview if local).
 */
export async function uploadImageToVercelBlob(
  file: File,
  folder: 'hero' | 'imoveis' | 'sobre' = 'imoveis',
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

  // Check if Vercel Blob token is configured on the server
  const isConfigured = await checkBlobStorageStatus();

  if (!isConfigured) {
    console.warn(
      '[Vercel Blob] BLOB_READ_WRITE_TOKEN não está configurado no servidor. Utilizando pré-visualização local.'
    );

    // Provide smooth progress feedback for local preview
    if (onProgress) {
      onProgress(35);
      await new Promise((r) => setTimeout(r, 80));
      onProgress(85);
      await new Promise((r) => setTimeout(r, 80));
      onProgress(100);
    }

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject(new Error('Falha ao processar a imagem local.'));
        }
      };
      reader.onerror = () => reject(new Error('Erro na leitura do arquivo local.'));
      reader.readAsDataURL(file);
    });
  }

  try {
    const blob = await upload(pathname, file, {
      access: 'public',
      handleUploadUrl: '/api/upload',
      onUploadProgress: (progress) => {
        if (onProgress) {
          onProgress(Math.round(progress.percentage));
        }
      }
    });

    return blob.url;
  } catch (err: any) {
    console.error('Falha no upload para Vercel Blob:', err);

    const errorMessage = String(err?.message || '');
    if (
      errorMessage.includes('retrieve the client token') ||
      errorMessage.includes('Failed to retrieve')
    ) {
      throw new Error(
        'Falha ao obter o token do Vercel Blob. Verifique se a variável BLOB_READ_WRITE_TOKEN está configurada e válida no arquivo .env.'
      );
    }

    throw err;
  }
}

/**
 * Checks whether a given URL belongs to the Vercel Blob store.
 */
export function isVercelBlobUrl(url?: string | null): boolean {
  if (!url || typeof url !== 'string') return false;
  return (
    url.includes('.blob.vercel-storage.com') ||
    url.includes('vercel-storage.com')
  );
}

export interface DeleteBlobResult {
  success: boolean;
  deleted: boolean;
  count?: number;
  message?: string;
  error?: string;
  warning?: string;
}

/**
 * Permanently deletes one or multiple images from Vercel Blob storage.
 * Calls the backend `/api/delete-blob` endpoint which uses the server token.
 * If the image is not a Vercel Blob URL (e.g. initial Unsplash placeholder or local asset),
 * it returns safely without doing a network request.
 * If deletion fails or the image was already removed, it catches the error and never blocks the UI.
 *
 * @param urlOrUrls A single image URL or an array of image URLs to delete permanently.
 */
export async function deleteImageFromVercelBlob(
  urlOrUrls: string | string[]
): Promise<DeleteBlobResult> {
  const urls = Array.isArray(urlOrUrls) ? urlOrUrls : [urlOrUrls];
  const validBlobUrls = urls.filter(isVercelBlobUrl);

  // If no URLs belong to Vercel Blob, return early safely
  if (validBlobUrls.length === 0) {
    return {
      success: true,
      deleted: false,
      count: 0,
      message: 'Nenhuma URL de Vercel Blob para exclusão.'
    };
  }

  try {
    const response = await fetch('/api/delete-blob', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ urls: validBlobUrls })
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      console.warn('[Vercel Blob Delete] Resposta não-200 ao excluir:', errData);
      return {
        success: false,
        deleted: false,
        error: errData?.error || `HTTP ${response.status}`
      };
    }

    const data: DeleteBlobResult = await response.json();
    return data;
  } catch (error: any) {
    console.warn('[Vercel Blob Delete] Erro de rede ou servidor ao excluir imagem:', error);
    // Never crash the client UI
    return {
      success: false,
      deleted: false,
      error: error?.message || 'Falha de conexão ao excluir imagem'
    };
  }
}
