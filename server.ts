import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { del } from '@vercel/blob';
import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { kv } from '@vercel/kv';

dotenv.config();
dotenv.config({ path: '.env.local' });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json());

  // Vercel KV / Persistent Storage Helpers
  const isVercelKvConfigured = Boolean(
    process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN
  );

  const DATA_DIR = path.resolve(__dirname, 'data');
  const SETTINGS_FILE = path.join(DATA_DIR, 'configuracoes.json');

  const ensureDataDir = () => {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
    } catch (e) {
      console.warn('[Storage] Não foi possível criar pasta data:', e);
    }
  };

  const readLocalSettings = (): Record<string, any> => {
    try {
      ensureDataDir();
      if (fs.existsSync(SETTINGS_FILE)) {
        const raw = fs.readFileSync(SETTINGS_FILE, 'utf-8');
        return JSON.parse(raw) || {};
      }
    } catch (err) {
      console.warn('[Storage] Erro ao ler configuracoes.json:', err);
    }
    return {};
  };

  const writeLocalSettings = (data: Record<string, any>) => {
    try {
      ensureDataDir();
      fs.writeFileSync(SETTINGS_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      console.error('[Storage] Erro ao gravar configuracoes.json:', err);
    }
  };

  const getDbSetting = async (key: string): Promise<any> => {
    if (isVercelKvConfigured) {
      try {
        const val = await kv.get(key);
        if (val !== null && val !== undefined) {
          return val;
        }
      } catch (kvErr) {
        console.warn('[Vercel KV] Erro ao ler do Vercel KV, usando fallback local:', kvErr);
      }
    }
    const local = readLocalSettings();
    return local[key] ?? null;
  };

  const setDbSetting = async (key: string, value: any): Promise<{ storage: string }> => {
    let storageUsed = 'local-db';
    if (isVercelKvConfigured) {
      try {
        await kv.set(key, value);
        storageUsed = 'vercel-kv';
      } catch (kvErr) {
        console.warn('[Vercel KV] Erro ao gravar no Vercel KV, usando fallback local:', kvErr);
      }
    }

    // Always mirror to local file for maximum resilience
    const local = readLocalSettings();
    local[key] = value;
    local[`${key}_updatedAt`] = new Date().toISOString();
    writeLocalSettings(local);

    return { storage: storageUsed };
  };

  // Health check endpoint
  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      kvConfigured: isVercelKvConfigured
    });
  });

  // Vercel Blob status endpoint
  app.get('/api/blob/status', (_req, res) => {
    const hasToken = Boolean(process.env.BLOB_READ_WRITE_TOKEN);
    res.json({
      configured: hasToken,
      kvConfigured: isVercelKvConfigured
    });
  });

  // Rota GET /api/configuracoes
  // Busca a URL da foto do cabeçalho salva no banco de dados persistente
  app.get('/api/configuracoes', async (_req, res) => {
    try {
      const fotoCorretoraHeader = await getDbSetting('fotoCorretoraHeader');
      return res.json({
        success: true,
        fotoCorretoraHeader: fotoCorretoraHeader || null,
        storage: isVercelKvConfigured ? 'vercel-kv' : 'persistent-db'
      });
    } catch (err: any) {
      console.error('[API /api/configuracoes GET] Erro:', err);
      return res.status(500).json({
        success: false,
        error: 'Erro ao buscar configurações no banco de dados.',
        fotoCorretoraHeader: null
      });
    }
  });

  // Rota POST /api/configuracoes
  // Salva a nova URL da foto no banco de dados (Vercel KV / Postgres / DB persistente)
  app.post('/api/configuracoes', async (req, res) => {
    try {
      const { fotoCorretoraHeader, url, fotoHeader, imageUrl } = req.body || {};
      const targetUrl = fotoCorretoraHeader ?? url ?? fotoHeader ?? imageUrl;

      if (targetUrl === undefined || targetUrl === null) {
        return res.status(400).json({
          success: false,
          error: 'Nenhuma URL de foto foi fornecida (esperado: fotoCorretoraHeader).'
        });
      }

      const cleanUrl = String(targetUrl).trim();
      const { storage } = await setDbSetting('fotoCorretoraHeader', cleanUrl);

      console.log('[API /api/configuracoes POST] Foto salva com sucesso no banco de dados:', {
        fotoCorretoraHeader: cleanUrl,
        storage
      });

      return res.json({
        success: true,
        fotoCorretoraHeader: cleanUrl,
        storage,
        message: 'Foto do cabeçalho salva com sucesso no banco de dados!'
      });
    } catch (err: any) {
      console.error('[API /api/configuracoes POST] Erro:', err);
      return res.status(500).json({
        success: false,
        error: err?.message || 'Erro ao salvar configuração no banco de dados.'
      });
    }
  });

  // Vercel Blob client upload handler using handleUpload from @vercel/blob/client
  // Generates client token for direct client-to-blob uploads
  const handleBlobUpload = async (req: express.Request, res: express.Response) => {
    const body = req.body as HandleUploadBody;

    try {
      const token = process.env.BLOB_READ_WRITE_TOKEN;

      if (!token) {
        console.warn('[Vercel Blob] Atenção: BLOB_READ_WRITE_TOKEN não configurado no servidor.');
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
            maximumSizeInBytes: 50 * 1024 * 1024, // 50MB
            tokenPayload: JSON.stringify({
              source: 'oliveira-elias-exclusive-admin',
              pathname,
              clientPayload: clientPayload || null,
              multipart
            })
          };
        },
        onUploadCompleted: async ({ blob, tokenPayload }) => {
          console.log('[Vercel Blob] Upload de imagem concluído com sucesso:', blob.url, tokenPayload);
        }
      });

      return res.json(jsonResponse);
    } catch (error) {
      console.error('[Vercel Blob] Erro no endpoint handleUpload:', error);
      return res.status(400).json({
        error: (error as Error).message || 'Erro ao processar upload no Vercel Blob'
      });
    }
  };

  // Mount on both /api/upload (standard Vercel Blob convention) and /api/blob/upload
  app.post('/api/upload', handleBlobUpload);
  app.post('/api/blob/upload', handleBlobUpload);

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
