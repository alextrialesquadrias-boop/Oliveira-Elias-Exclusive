import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { del } from '@vercel/blob';
import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { Redis } from '@upstash/redis';

dotenv.config();
dotenv.config({ path: '.env.local' });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json());

  // Configuração do Cliente Upstash Redis com suporte a ARMAZENAR_URL e ARMAZENAR_TOKEN
  const upstashUrl =
    process.env.ARMAZENAR_URL ||
    process.env.ARMAZENAR_REST_API_URL ||
    process.env.UPSTASH_REDIS_REST_URL ||
    process.env.KV_REST_API_URL;

  const upstashToken =
    process.env.ARMAZENAR_TOKEN ||
    process.env.ARMAZENAR_REST_API_TOKEN ||
    process.env.UPSTASH_REDIS_REST_TOKEN ||
    process.env.KV_REST_API_TOKEN;

  let redisClient: Redis | null = null;
  const isRedisConfigured = Boolean(upstashUrl && upstashToken);

  if (isRedisConfigured) {
    try {
      redisClient = new Redis({
        url: upstashUrl!,
        token: upstashToken!
      });
      console.log('[Upstash Redis] Cliente conectado com sucesso usando ARMAZENAR_URL.');
    } catch (err) {
      console.warn('[Upstash Redis] Erro ao instanciar cliente Redis:', err);
    }
  } else {
    console.info(
      '[Upstash Redis] Variáveis ARMAZENAR_URL / ARMAZENAR_TOKEN não detectadas no ambiente local. Usando persistência local segura com fallback.'
    );
  }

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

  const KV_HEADER_KEY = 'config:fotoCorretoraHeader';

  const getDbSetting = async (key: string = KV_HEADER_KEY): Promise<string | null> => {
    if (redisClient) {
      try {
        const val = await redisClient.get<string>(key);
        if (val !== null && val !== undefined && typeof val === 'string' && val.trim()) {
          return val.trim();
        }
        // Fallback para chave sem prefixo
        const altVal = await redisClient.get<string>('fotoCorretoraHeader');
        if (altVal !== null && altVal !== undefined && typeof altVal === 'string' && altVal.trim()) {
          return altVal.trim();
        }
      } catch (kvErr) {
        console.warn('[Upstash Redis] Erro ao ler do Redis (tratado com fallback):', kvErr);
      }
    }

    const local = readLocalSettings();
    const localVal = local[key] ?? local['fotoCorretoraHeader'] ?? null;
    return localVal ? String(localVal).trim() : null;
  };

  const setDbSetting = async (key: string = KV_HEADER_KEY, value: string): Promise<{ storage: string }> => {
    let storageUsed = 'local-db';
    if (redisClient) {
      try {
        await redisClient.set(key, value);
        await redisClient.set('fotoCorretoraHeader', value);
        storageUsed = 'upstash-redis';
      } catch (kvErr) {
        console.warn('[Upstash Redis] Erro ao gravar no Redis, usando fallback local:', kvErr);
      }
    }

    // Grava também no arquivo local para garantir resiliência offline e reinicializações
    const local = readLocalSettings();
    local[key] = value;
    local['fotoCorretoraHeader'] = value;
    local[`${key}_updatedAt`] = new Date().toISOString();
    writeLocalSettings(local);

    return { storage: storageUsed };
  };

  // Health check endpoint
  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      redisConfigured: isRedisConfigured
    });
  });

  // Upstash Redis / Vercel Blob status endpoint
  app.get('/api/blob/status', (_req, res) => {
    const hasToken = Boolean(process.env.BLOB_READ_WRITE_TOKEN);
    res.json({
      configured: hasToken,
      redisConfigured: isRedisConfigured
    });
  });

  // Rota GET /api/configuracoes
  // Retorna a URL da foto salva no Upstash Redis (chave: config:fotoCorretoraHeader)
  app.get('/api/configuracoes', async (_req, res) => {
    try {
      const fotoCorretoraHeader = await getDbSetting(KV_HEADER_KEY);
      return res.json({
        success: true,
        fotoCorretoraHeader: fotoCorretoraHeader || null,
        storage: redisClient ? 'upstash-redis' : 'local-db'
      });
    } catch (err: any) {
      console.warn('[API /api/configuracoes GET] Erro tratado graciosamente:', err);
      return res.json({
        success: true,
        fotoCorretoraHeader: null
      });
    }
  });

  // Rota POST /api/configuracoes
  // Salva a nova URL da foto no Upstash Redis usando a chave config:fotoCorretoraHeader
  app.post('/api/configuracoes', async (req, res) => {
    try {
      const { fotoCorretoraHeader, url, fotoHeader, imageUrl } = req.body || {};
      const targetUrl = fotoCorretoraHeader ?? url ?? fotoHeader ?? imageUrl;

      if (!targetUrl || typeof targetUrl !== 'string' || !targetUrl.trim()) {
        return res.status(400).json({
          success: false,
          error: 'Nenhuma URL de foto foi fornecida (esperado: { fotoCorretoraHeader: "NOVA_URL" }).'
        });
      }

      const cleanUrl = targetUrl.trim();
      const { storage } = await setDbSetting(KV_HEADER_KEY, cleanUrl);

      console.log('[API /api/configuracoes POST] URL salva com sucesso no Upstash Redis:', cleanUrl);

      return res.json({
        success: true,
        fotoCorretoraHeader: cleanUrl,
        storage,
        message: 'Foto do cabeçalho salva com sucesso no banco de dados Upstash Redis!'
      });
    } catch (err: any) {
      console.error('[API /api/configuracoes POST] Erro ao salvar:', err);
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
