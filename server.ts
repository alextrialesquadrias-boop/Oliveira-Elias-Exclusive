import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { del } from '@vercel/blob';
import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json());

  // Health check endpoint
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Vercel Blob status endpoint
  app.get('/api/blob/status', (_req, res) => {
    const hasToken = Boolean(process.env.BLOB_READ_WRITE_TOKEN);
    res.json({ configured: hasToken });
  });

  // Vercel Blob client upload handler
  // Implements the client-upload token generation and webhook handling
  app.post('/api/blob/upload', async (req, res) => {
    const body = req.body as HandleUploadBody;

    try {
      const token = process.env.BLOB_READ_WRITE_TOKEN;

      if (!token) {
        return res.status(400).json({
          error:
            'A variável de ambiente BLOB_READ_WRITE_TOKEN não foi configurada no servidor. Por favor, configure o token do Vercel Blob no arquivo .env.',
          code: 'TOKEN_MISSING'
        });
      }

      const jsonResponse = await handleUpload({
        body,
        request: req,
        token,
        onBeforeGenerateToken: async (pathname /*, clientPayload, multipart */) => {
          return {
            allowedContentTypes: [
              'image/jpeg',
              'image/png',
              'image/webp',
              'image/gif',
              'image/svg+xml',
              'image/avif'
            ],
            maximumSizeInBytes: 50 * 1024 * 1024, // 50MB (bypasses server function limit via direct client upload)
            tokenPayload: JSON.stringify({
              source: 'oliveira-elias-exclusive-admin',
              pathname
            })
          };
        },
        onUploadCompleted: async ({ blob, tokenPayload }) => {
          console.log('[Vercel Blob] Upload de imagem concluído com sucesso:', blob.url, tokenPayload);
        }
      });

      return res.json(jsonResponse);
    } catch (error) {
      console.error('[Vercel Blob] Erro no endpoint /api/blob/upload:', error);
      return res.status(400).json({
        error: (error as Error).message || 'Erro ao processar upload no Vercel Blob'
      });
    }
  });

  // Vercel Blob permanent deletion endpoint
  // Deletes one or multiple images permanently from Vercel Blob storage using del()
  const handleDeleteBlob = async (req: express.Request, res: express.Response) => {
    try {
      const { url, urls } = req.body || {};
      const targets: string[] = [];

      if (typeof url === 'string' && url.trim()) {
        targets.push(url.trim());
      }
      if (Array.isArray(urls)) {
        for (const u of urls) {
          if (typeof u === 'string' && u.trim()) {
            targets.push(u.trim());
          }
        }
      }

      if (targets.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Nenhuma URL de imagem foi fornecida para exclusão.'
        });
      }

      // Filter only authentic Vercel Blob storage URLs to avoid unnecessary external API calls
      const isVercelBlob = (targetUrl: string) => {
        return (
          typeof targetUrl === 'string' &&
          (targetUrl.includes('.blob.vercel-storage.com') ||
            targetUrl.includes('vercel-storage.com'))
        );
      };

      const blobUrlsToDelete = targets.filter(isVercelBlob);

      if (blobUrlsToDelete.length === 0) {
        return res.json({
          success: true,
          deleted: false,
          count: 0,
          message: 'As URLs fornecidas não são do Vercel Blob (nenhuma exclusão de armazenamento necessária).'
        });
      }

      const token = process.env.BLOB_READ_WRITE_TOKEN;
      if (!token) {
        console.warn('[Vercel Blob Delete] BLOB_READ_WRITE_TOKEN não configurado no servidor.');
        return res.json({
          success: false,
          deleted: false,
          count: 0,
          warning: 'BLOB_READ_WRITE_TOKEN não configurado no ambiente do servidor.'
        });
      }

      // Permanent deletion via @vercel/blob del()
      await del(blobUrlsToDelete, { token });
      console.log('[Vercel Blob Delete] Imagem(ns) excluída(s) permanentemente com sucesso:', blobUrlsToDelete);

      return res.json({
        success: true,
        deleted: true,
        count: blobUrlsToDelete.length,
        deletedUrls: blobUrlsToDelete
      });
    } catch (error: any) {
      console.warn('[Vercel Blob Delete] Aviso/erro ao tentar excluir blob(s):', error?.message || error);
      // Respond gracefully with 200 so client actions never break
      return res.json({
        success: false,
        deleted: false,
        error: error?.message || 'Falha ao excluir imagem do Vercel Blob'
      });
    }
  };

  app.post('/api/delete-blob', handleDeleteBlob);
  app.delete('/api/delete-blob', handleDeleteBlob);
  app.post('/api/blob/delete', handleDeleteBlob);
  app.delete('/api/blob/delete', handleDeleteBlob);

  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
