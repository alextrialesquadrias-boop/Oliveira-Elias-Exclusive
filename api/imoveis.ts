import { Redis } from '@upstash/redis';
import { PROPERTIES_DATA } from '../src/data/properties';

const KV_IMOVEIS_KEY = 'data:properties';

/**
 * Vercel Serverless Function: /api/imoveis
 * Conecta via Redis.fromEnv() que lê automaticamente KV_REST_API_URL e KV_REST_API_TOKEN.
 * Gerencia a lista completa de imóveis com persistência em nuvem.
 */
export default async function handler(req: any, res: any) {
  // Configuração CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Instanciação usando Redis.fromEnv()
  let redis: Redis | null = null;
  try {
    redis = Redis.fromEnv();
  } catch (e) {
    console.warn('[Vercel Serverless /api/imoveis] Redis.fromEnv() aviso:', e);
  }

  // Helper para buscar lista do Redis
  const fetchPropertiesFromRedis = async (): Promise<any[]> => {
    if (!redis) return PROPERTIES_DATA;
    try {
      let val = await redis.get<any>(KV_IMOVEIS_KEY);
      if (!val) {
        val = await redis.get<any>('imoveis');
      }
      if (typeof val === 'string') {
        try {
          val = JSON.parse(val);
        } catch {}
      }
      if (Array.isArray(val) && val.length > 0) {
        return val;
      }
    } catch (err) {
      console.warn('[Vercel Serverless] Erro ao ler imoveis do Redis:', err);
    }
    return PROPERTIES_DATA;
  };

  // GET: Retorna a lista de imóveis salva no banco
  if (req.method === 'GET') {
    try {
      const properties = await fetchPropertiesFromRedis();
      return res.status(200).json({
        success: true,
        properties,
        count: properties.length,
        storage: redis ? 'upstash-redis' : 'fallback'
      });
    } catch (err: any) {
      console.error('[Vercel Serverless /api/imoveis GET] Erro:', err);
      return res.status(200).json({
        success: true,
        properties: PROPERTIES_DATA,
        count: PROPERTIES_DATA.length,
        storage: 'fallback'
      });
    }
  }

  // POST: Salva a nova lista de imóveis (ou processa ações de create/edit/delete/reset)
  if (req.method === 'POST') {
    try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
      let propertiesToSave: any[] | null = null;

      if (Array.isArray(body)) {
        propertiesToSave = body;
      } else if (Array.isArray(body.properties)) {
        propertiesToSave = body.properties;
      } else if (body.action === 'reset') {
        propertiesToSave = PROPERTIES_DATA;
      } else if (body.action === 'delete' && body.id) {
        const current = await fetchPropertiesFromRedis();
        propertiesToSave = current.filter((p: any) => p.id !== body.id);
      } else if (body.property) {
        const current = await fetchPropertiesFromRedis();
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

      if (redis) {
        await redis.set(KV_IMOVEIS_KEY, propertiesToSave);
        await redis.set('imoveis', propertiesToSave);
      }

      return res.status(200).json({
        success: true,
        properties: propertiesToSave,
        count: propertiesToSave.length,
        storage: redis ? 'upstash-redis' : 'none',
        message: 'Lista de imóveis salva com sucesso no banco de dados Upstash Redis!'
      });
    } catch (err: any) {
      console.error('[Vercel Serverless /api/imoveis POST] Erro ao salvar:', err);
      return res.status(500).json({
        success: false,
        error: err?.message || 'Erro ao salvar imóveis no banco de dados.'
      });
    }
  }

  return res.status(405).json({ error: 'Método não permitido.' });
}
