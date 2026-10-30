import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { del } from '@vercel/blob';
import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { Redis } from '@upstash/redis';
import { PROPERTIES_DATA } from './src/data/properties';

dotenv.config();
dotenv.config({ path: '.env.local' });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json());

  // Mapeia variáveis legadas ou customizadas para KV_REST_API_* caso existam
  if (process.env.ARMAZENAR_URL && !process.env.KV_REST_API_URL) {
    process.env.KV_REST_API_URL = process.env.ARMAZENAR_URL;
  }
  if (process.env.ARMAZENAR_REST_API_URL && !process.env.KV_REST_API_URL) {
    process.env.KV_REST_API_URL = process.env.ARMAZENAR_REST_API_URL;
  }
  if (process.env.ARMAZENAR_TOKEN && !process.env.KV_REST_API_TOKEN) {
    process.env.KV_REST_API_TOKEN = process.env.ARMAZENAR_TOKEN;
  }
  if (process.env.ARMAZENAR_REST_API_TOKEN && !process.env.KV_REST_API_TOKEN) {
    process.env.KV_REST_API_TOKEN = process.env.ARMAZENAR_REST_API_TOKEN;
  }

  // Conexão com Upstash Redis usando Redis.fromEnv()
  // O Redis.fromEnv() lê automaticamente KV_REST_API_URL e KV_REST_API_TOKEN (e UPSTASH_REDIS_REST_URL/TOKEN)
  let redisClient: Redis | null = null;
  const isRedisConfigured = Boolean(
    (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) ||
    (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN)
  );

  const getRedisClient = (): Redis | null => {
    if (redisClient) return redisClient;
    try {
      if (
        (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) ||
        (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN)
      ) {
        redisClient = Redis.fromEnv();
        return redisClient;
      }
    } catch (err) {
      console.warn('[Upstash Redis] Erro ao instanciar com Redis.fromEnv():', err);
    }
    return null;
  };

  if (isRedisConfigured) {
    try {
      redisClient = Redis.fromEnv();
      console.log('[Upstash Redis] Conectado via Redis.fromEnv() (KV_REST_API_URL e KV_REST_API_TOKEN detectados no Vercel).');
    } catch (err) {
      console.warn('[Upstash Redis] Falha inicial ao executar Redis.fromEnv():', err);
    }
  } else {
    console.info(
      '[Upstash Redis] Variáveis KV_REST_API_URL e KV_REST_API_TOKEN não detectadas localmente. Usando persistência local com fallback.'
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
  const KV_SOBRE_KEY = 'config:fotoSobre';

  const getDbSetting = async (key: string): Promise<string | null> => {
    const cleanKey = key.replace(/^config:/, '');
    const client = getRedisClient();
    if (client) {
      try {
        const val = await client.get<string>(key);
        if (val !== null && val !== undefined && typeof val === 'string' && val.trim()) {
          return val.trim();
        }
        // Fallback para chave sem prefixo config:
        const altVal = await client.get<string>(cleanKey);
        if (altVal !== null && altVal !== undefined && typeof altVal === 'string' && altVal.trim()) {
          return altVal.trim();
        }
      } catch (kvErr) {
        console.warn(`[Upstash Redis] Erro ao ler ${key} com Redis.fromEnv() (tratado com fallback):`, kvErr);
      }
    }

    const local = readLocalSettings();
    const localVal = local[key] ?? local[cleanKey] ?? null;
    return localVal ? String(localVal).trim() : null;
  };

  const setDbSetting = async (key: string, value: string): Promise<{ storage: string }> => {
    let storageUsed = 'local-db';
    const cleanKey = key.replace(/^config:/, '');
    const client = getRedisClient();
    if (client) {
      try {
        await client.set(key, value);
        await client.set(cleanKey, value);
        storageUsed = 'upstash-redis';
      } catch (kvErr) {
        console.warn(`[Upstash Redis] Erro ao gravar ${key} com Redis.fromEnv(), usando fallback local:`, kvErr);
      }
    }

    // Grava também no arquivo local para garantir resiliência offline e reinicializações
    const local = readLocalSettings();
    local[key] = value;
    local[cleanKey] = value;
    local[`${key}_updatedAt`] = new Date().toISOString();
    writeLocalSettings(local);

    return { storage: storageUsed };
  };

  const KV_IMOVEIS_KEY = 'data:properties';
  const IMOVEIS_FILE = path.join(DATA_DIR, 'imoveis.json');

  const readLocalProperties = (): any[] | null => {
    try {
      ensureDataDir();
      if (fs.existsSync(IMOVEIS_FILE)) {
        const raw = fs.readFileSync(IMOVEIS_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (err) {
      console.warn('[Storage] Erro ao ler imoveis.json:', err);
    }
    return null;
  };

  const writeLocalProperties = (data: any[]) => {
    try {
      ensureDataDir();
      fs.writeFileSync(IMOVEIS_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      console.error('[Storage] Erro ao gravar imoveis.json:', err);
    }
  };

  const getDbProperties = async (): Promise<any[]> => {
    const client = getRedisClient();
    if (client) {
      try {
        let val = await client.get<any>(KV_IMOVEIS_KEY);
        if (!val) {
          val = await client.get<any>('imoveis');
        }
        if (typeof val === 'string') {
          try {
            val = JSON.parse(val);
          } catch {}
        }
        if (Array.isArray(val) && val.length > 0) {
          return val;
        }
      } catch (kvErr) {
        console.warn('[Upstash Redis] Erro ao ler imoveis com Redis.fromEnv():', kvErr);
      }
    }

    const local = readLocalProperties();
    if (local && Array.isArray(local) && local.length > 0) {
      return local;
    }

    // Inicializa o arquivo local com os dados padrão caso esteja vazio
    writeLocalProperties(PROPERTIES_DATA);
    return PROPERTIES_DATA;
  };

  const setDbProperties = async (properties: any[]): Promise<{ storage: string }> => {
    let storageUsed = 'local-db';
    const client = getRedisClient();
    if (client) {
      try {
        await client.set(KV_IMOVEIS_KEY, properties);
        await client.set('imoveis', properties);
        storageUsed = 'upstash-redis';
      } catch (kvErr) {
        console.warn('[Upstash Redis] Erro ao gravar imoveis com Redis.fromEnv():', kvErr);
      }
    }

    writeLocalProperties(properties);
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
  // Retorna a URL da foto do cabeçalho e da seção Sobre salvas no Upstash Redis
  app.get('/api/configuracoes', async (_req, res) => {
    try {
      const [fotoCorretoraHeader, fotoSobre] = await Promise.all([
        getDbSetting(KV_HEADER_KEY),
        getDbSetting(KV_SOBRE_KEY)
      ]);

      return res.json({
        success: true,
        fotoCorretoraHeader: fotoCorretoraHeader || null,
        fotoSobre: fotoSobre || null,
        storage: getRedisClient() ? 'upstash-redis' : 'local-db'
      });
    } catch (err: any) {
      console.warn('[API /api/configuracoes GET] Erro tratado graciosamente:', err);
      return res.json({
        success: true,
        fotoCorretoraHeader: null,
        fotoSobre: null
      });
    }
  });

  // Rota POST /api/configuracoes
  // Salva a URL da foto do cabeçalho e/ou da seção Sobre no Upstash Redis
  app.post('/api/configuracoes', async (req, res) => {
    try {
      const {
        fotoCorretoraHeader,
        fotoSobre,
        fotoCorretoraSobre,
        url,
        fotoHeader,
        imageUrl,
        type
      } = req.body || {};

      let headerUrl = fotoCorretoraHeader ?? fotoHeader;
      let sobreUrl = fotoSobre ?? fotoCorretoraSobre;

      // Suporte a chamada com url genérica e type
      if (!headerUrl && !sobreUrl && (url || imageUrl)) {
        const target = url || imageUrl;
        if (type === 'sobre') {
          sobreUrl = target;
        } else {
          headerUrl = target;
        }
      }

      if (!headerUrl && !sobreUrl) {
        return res.status(400).json({
          success: false,
          error: 'Nenhuma URL de foto foi fornecida (esperado: { fotoCorretoraHeader: "URL" } ou { fotoSobre: "URL" }).'
        });
      }

      let storageUsed = 'local-db';

      if (headerUrl && typeof headerUrl === 'string' && headerUrl.trim()) {
        const cleanHeader = headerUrl.trim();
        const resHeader = await setDbSetting(KV_HEADER_KEY, cleanHeader);
        storageUsed = resHeader.storage;
        console.log('[API /api/configuracoes POST] Foto do cabeçalho salva no Upstash Redis:', cleanHeader);
      }

      if (sobreUrl && typeof sobreUrl === 'string' && sobreUrl.trim()) {
        const cleanSobre = sobreUrl.trim();
        const resSobre = await setDbSetting(KV_SOBRE_KEY, cleanSobre);
        storageUsed = resSobre.storage;
        console.log('[API /api/configuracoes POST] Foto da seção Sobre salva no Upstash Redis:', cleanSobre);
      }

      const [currentHeader, currentSobre] = await Promise.all([
        getDbSetting(KV_HEADER_KEY),
        getDbSetting(KV_SOBRE_KEY)
      ]);

      return res.json({
        success: true,
        fotoCorretoraHeader: currentHeader || null,
        fotoSobre: currentSobre || null,
        storage: storageUsed,
        message: 'Configurações salvas com sucesso no banco de dados Upstash Redis!'
      });
    } catch (err: any) {
      console.error('[API /api/configuracoes POST] Erro ao salvar:', err);
      return res.status(500).json({
        success: false,
        error: err?.message || 'Erro ao salvar configuração no banco de dados.'
      });
    }
  });

  // Rota GET /api/imoveis
  // Retorna a lista completa de imóveis do banco de dados (Upstash Redis)
  app.get('/api/imoveis', async (_req, res) => {
    try {
      const properties = await getDbProperties();
      return res.json({
        success: true,
        properties,
        count: properties.length,
        storage: getRedisClient() ? 'upstash-redis' : 'local-db'
      });
    } catch (err: any) {
      console.error('[API /api/imoveis GET] Erro ao buscar imóveis:', err);
      return res.json({
        success: true,
        properties: PROPERTIES_DATA,
        count: PROPERTIES_DATA.length,
        storage: 'fallback'
      });
    }
  });

  // Rota POST /api/imoveis
  // Salva (cria, edita, exclui) a lista de imóveis no banco de dados persistente
  app.post('/api/imoveis', async (req, res) => {
    try {
      const body = req.body || {};
      let propertiesToSave: any[] | null = null;

      if (Array.isArray(body)) {
        propertiesToSave = body;
      } else if (Array.isArray(body.properties)) {
        propertiesToSave = body.properties;
      } else if (body.action === 'reset') {
        propertiesToSave = PROPERTIES_DATA;
      } else if (body.action === 'delete' && body.id) {
        const current = await getDbProperties();
        propertiesToSave = current.filter((p: any) => p.id !== body.id);
      } else if (body.property) {
        const current = await getDbProperties();
        const incoming = body.property;
        const existsIndex = current.findIndex((p: any) => p.id === incoming.id);
        if (existsIndex >= 0) {
          propertiesToSave = current.map((p: any, idx: number) => idx === existsIndex ? { ...p, ...incoming } : p);
        } else {
          propertiesToSave = [incoming, ...current];
        }
      }

      if (!propertiesToSave || !Array.isArray(propertiesToSave)) {
        return res.status(400).json({
          success: false,
          error: 'Formato inválido. Esperado { properties: Property[] } ou { property: Property }.'
        });
      }

      const { storage } = await setDbProperties(propertiesToSave);
      console.log(`[API /api/imoveis POST] ${propertiesToSave.length} imóveis salvos no Upstash Redis (${storage}).`);

      return res.json({
        success: true,
        properties: propertiesToSave,
        count: propertiesToSave.length,
        storage,
        message: 'Lista de imóveis salva com sucesso no banco de dados Upstash Redis!'
      });
    } catch (err: any) {
      console.error('[API /api/imoveis POST] Erro ao salvar imóveis:', err);
      return res.status(500).json({
        success: false,
        error: err?.message || 'Erro ao salvar imóveis no banco de dados.'
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
