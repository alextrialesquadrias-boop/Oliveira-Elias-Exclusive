import { Redis } from '@upstash/redis';
import { PROPERTIES_DATA } from '../../src/data/properties';

const KV_IMOVEIS_KEY = 'data:properties';

/**
 * Vercel Serverless Function: /api/imoveis/[id]
 * Permite GET e DELETE de um imóvel individual por ID.
 */
export default async function handler(req: any, res: any) {
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

  const { id } = req.query;
  if (!id) {
    return res.status(400).json({ success: false, error: 'ID do imóvel não informado.' });
  }

  let redis: Redis | null = null;
  try {
    redis = Redis.fromEnv();
  } catch (e) {
    console.warn('[Vercel Serverless /api/imoveis/[id]] Redis.fromEnv() aviso:', e);
  }

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
      console.warn('[Vercel Serverless /api/imoveis/[id]] Erro:', err);
    }
    return PROPERTIES_DATA;
  };

  if (req.method === 'GET') {
    const list = await fetchPropertiesFromRedis();
    const prop = list.find((p) => p.id === id);
    if (!prop) {
      return res.status(404).json({ success: false, error: 'Imóvel não encontrado.' });
    }
    return res.status(200).json({ success: true, property: prop });
  }

  if (req.method === 'DELETE') {
    try {
      const current = await fetchPropertiesFromRedis();
      const updated = current.filter((p: any) => p.id !== id);

      if (redis) {
        await redis.set(KV_IMOVEIS_KEY, updated);
        await redis.set('imoveis', updated);
      }

      return res.status(200).json({
        success: true,
        id,
        properties: updated,
        count: updated.length,
        message: `Imóvel ${id} excluído com sucesso!`
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        error: err?.message || 'Erro ao excluir imóvel.'
      });
    }
  }

  return res.status(405).json({ error: 'Método não permitido.' });
}
