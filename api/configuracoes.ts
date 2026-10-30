import { Redis } from '@upstash/redis';

const KV_HEADER_KEY = 'config:fotoCorretoraHeader';
const KV_SOBRE_KEY = 'config:fotoSobre';

/**
 * Vercel Serverless Function: /api/configuracoes
 * Conecta via Redis.fromEnv() que lê automaticamente KV_REST_API_URL e KV_REST_API_TOKEN.
 * Gerencia a Foto do Cabeçalho e a Foto da Seção Sobre com persistência global.
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

  // Instanciação usando Redis com checagem segura das variáveis de ambiente
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  let redis: Redis | null = null;
  if (url && token) {
    try {
      redis = new Redis({ url, token });
    } catch (e) {
      console.warn('[Vercel Serverless] Redis aviso:', e);
    }
  }

  // GET: Retorna as fotos salvas (cabeçalho e sobre) ou null caso o banco esteja vazio
  if (req.method === 'GET') {
    try {
      let fotoCorretoraHeader: string | null = null;
      let fotoSobre: string | null = null;

      if (redis) {
        // Foto do Cabeçalho
        const headerVal = await redis.get<string>(KV_HEADER_KEY);
        if (headerVal && typeof headerVal === 'string' && headerVal.trim()) {
          fotoCorretoraHeader = headerVal.trim();
        } else {
          const altHeader = await redis.get<string>('fotoCorretoraHeader');
          if (altHeader && typeof altHeader === 'string' && altHeader.trim()) {
            fotoCorretoraHeader = altHeader.trim();
          }
        }

        // Foto da Seção Sobre
        const sobreVal = await redis.get<string>(KV_SOBRE_KEY);
        if (sobreVal && typeof sobreVal === 'string' && sobreVal.trim()) {
          fotoSobre = sobreVal.trim();
        } else {
          const altSobre = await redis.get<string>('fotoSobre');
          if (altSobre && typeof altSobre === 'string' && altSobre.trim()) {
            fotoSobre = altSobre.trim();
          }
        }
      }

      return res.status(200).json({
        success: true,
        fotoCorretoraHeader,
        fotoSobre,
        storage: redis ? 'upstash-redis' : 'none'
      });
    } catch (err: any) {
      console.warn('[Vercel Serverless GET] Erro ao buscar do Redis:', err);
      return res.status(200).json({
        success: true,
        fotoCorretoraHeader: null,
        fotoSobre: null
      });
    }
  }

  // POST: Salva as URLs enviadas pelo painel administrativo
  if (req.method === 'POST') {
    try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
      const {
        fotoCorretoraHeader,
        fotoSobre,
        fotoCorretoraSobre,
        url,
        fotoHeader,
        imageUrl,
        type
      } = body;

      let headerUrl = fotoCorretoraHeader ?? fotoHeader;
      let sobreUrl = fotoSobre ?? fotoCorretoraSobre;

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
          error: 'Nenhuma URL de foto fornecida (esperado: { fotoCorretoraHeader: "URL" } ou { fotoSobre: "URL" }).'
        });
      }

      if (redis) {
        if (headerUrl && typeof headerUrl === 'string' && headerUrl.trim()) {
          const cleanHeader = headerUrl.trim();
          await redis.set(KV_HEADER_KEY, cleanHeader);
          await redis.set('fotoCorretoraHeader', cleanHeader);
        }

        if (sobreUrl && typeof sobreUrl === 'string' && sobreUrl.trim()) {
          const cleanSobre = sobreUrl.trim();
          await redis.set(KV_SOBRE_KEY, cleanSobre);
          await redis.set('fotoSobre', cleanSobre);
        }
      }

      return res.status(200).json({
        success: true,
        fotoCorretoraHeader: headerUrl ? String(headerUrl).trim() : undefined,
        fotoSobre: sobreUrl ? String(sobreUrl).trim() : undefined,
        storage: redis ? 'upstash-redis' : 'none',
        message: 'Configurações salvas com sucesso no banco de dados Upstash Redis!'
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
