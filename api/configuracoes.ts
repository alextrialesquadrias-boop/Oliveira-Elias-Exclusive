import { Redis } from '@upstash/redis';

const KV_HEADER_KEY = 'config:fotoCorretoraHeader';

/**
 * Vercel Serverless Function: /api/configuracoes
 * Conecta via Redis.fromEnv() que lê automaticamente KV_REST_API_URL e KV_REST_API_TOKEN.
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

  // Instanciação usando Redis.fromEnv() que lê automaticamente KV_REST_API_URL e KV_REST_API_TOKEN
  let redis: Redis | null = null;
  try {
    redis = Redis.fromEnv();
  } catch (e) {
    console.warn('[Vercel Serverless] Redis.fromEnv() aviso:', e);
  }

  // GET: Retorna a foto salva ou null caso o banco esteja vazio
  if (req.method === 'GET') {
    try {
      if (redis) {
        const url = await redis.get<string>(KV_HEADER_KEY);
        if (url && typeof url === 'string' && url.trim()) {
          return res.status(200).json({
            success: true,
            fotoCorretoraHeader: url.trim(),
            storage: 'upstash-redis'
          });
        }

        const altUrl = await redis.get<string>('fotoCorretoraHeader');
        if (altUrl && typeof altUrl === 'string' && altUrl.trim()) {
          return res.status(200).json({
            success: true,
            fotoCorretoraHeader: altUrl.trim(),
            storage: 'upstash-redis'
          });
        }
      }

      return res.status(200).json({
        success: true,
        fotoCorretoraHeader: null,
        storage: redis ? 'upstash-redis' : 'none'
      });
    } catch (err: any) {
      console.warn('[Vercel Serverless GET] Erro ao buscar do Redis:', err);
      return res.status(200).json({
        success: true,
        fotoCorretoraHeader: null
      });
    }
  }

  // POST: Salva a nova URL enviada pelo painel administrativo
  if (req.method === 'POST') {
    try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
      const { fotoCorretoraHeader, url, fotoHeader, imageUrl } = body;
      const targetUrl = fotoCorretoraHeader ?? url ?? fotoHeader ?? imageUrl;

      if (!targetUrl || typeof targetUrl !== 'string' || !targetUrl.trim()) {
        return res.status(400).json({
          success: false,
          error: 'Nenhuma URL de foto fornecida (esperado: { fotoCorretoraHeader: "NOVA_URL" }).'
        });
      }

      const cleanUrl = targetUrl.trim();
      if (redis) {
        await redis.set(KV_HEADER_KEY, cleanUrl);
        await redis.set('fotoCorretoraHeader', cleanUrl);
      }

      return res.status(200).json({
        success: true,
        fotoCorretoraHeader: cleanUrl,
        storage: redis ? 'upstash-redis' : 'none'
      });
    } catch (err: any) {
      console.error('[Vercel Serverless POST] Erro ao salvar no Redis:', err);
      return res.status(500).json({
        success: false,
        error: err?.message || 'Erro ao salvar no banco de dados Upstash Redis.'
      });
    }
  }

  return res.status(405).json({ error: 'Método não permitido.' });
}
