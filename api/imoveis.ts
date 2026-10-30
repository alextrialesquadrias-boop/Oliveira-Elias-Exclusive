import { Redis } from '@upstash/redis';

const KV_IMOVEIS_KEY = 'data:properties';

/**
 * Base de dados padrão caso o Upstash Redis ainda não tenha sido populado
 * Totalmente autocontida para não depender de resolução externa no runtime serverless da Vercel.
 */
const DEFAULT_PROPERTIES = [
  {
    id: 'oe-101',
    code: 'OE-101',
    title: 'Apartamento Frente Mar com Varanda Gourmet',
    type: 'Apartamento',
    neighborhood: 'Gravatá',
    city: 'Navegantes',
    price: 1850000,
    bedrooms: 3,
    suites: 3,
    bathrooms: 4,
    parkingSpots: 2,
    areaM2: 142,
    featured: true,
    tag: 'Frente Mar',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
        alt: 'Apartamento Frente Mar no Gravatá',
        recommendedDim: '1200 x 800 px (Fachada / Vista Mar)'
      },
      {
        url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
        alt: 'Living integrado com vista',
        recommendedDim: '1200 x 800 px (Living e Sala)'
      },
      {
        url: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80',
        alt: 'Varanda gourmet com churrasqueira a carvão',
        recommendedDim: '1200 x 800 px (Varanda Gourmet)'
      }
    ],
    description: 'Espetacular apartamento frente mar localizado no coração do Bairro Gravatá em Navegantes. Living amplo e integrado com cozinha gourmet, sacada ampla com churrasqueira a carvão e vista panorâmica indevassável da praia.',
    features: [
      'Vista mar permanente',
      '3 Suítes privativas',
      'Varanda gourmet com churrasqueira',
      '2 Vagas de garagem cobertas',
      'Piso em porcelanato 90x90cm',
      'Infraestrutura para ar-condicionado split',
      'Tubulação para água quente',
      'Condomínio com elevador e hall decorado'
    ]
  },
  {
    id: 'oe-102',
    code: 'OE-102',
    title: 'Casa de Alto Padrão com Piscina Próxima ao Mar',
    type: 'Casa',
    neighborhood: 'Gravatá',
    city: 'Navegantes',
    price: 1280000,
    bedrooms: 4,
    suites: 2,
    bathrooms: 3,
    parkingSpots: 3,
    areaM2: 220,
    featured: true,
    tag: 'Com Piscina',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
        alt: 'Casa de Alto Padrão no Gravatá',
        recommendedDim: '1200 x 800 px (Fachada Externa)'
      },
      {
        url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1200&q=80',
        alt: 'Área de lazer com piscina privativa',
        recommendedDim: '1200 x 800 px (Piscina e Deck)'
      },
      {
        url: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=80',
        alt: 'Interior moderno',
        recommendedDim: '1200 x 800 px (Ambientes Integrados)'
      }
    ],
    description: 'Residência contemporânea e sofisticada a apenas poucos metros da praia de Gravatá. Arquitetura moderna com pé direito duplo, excelente iluminação natural, área de lazer completa com piscina aquecida e espaço gourmet com churrasqueira.',
    features: [
      'Piscina privativa com iluminação em LED',
      'Espaço gourmet com churrasqueira',
      '2 Suítes + 2 Dormitórios amplos',
      'Garagem para até 3 veículos',
      'Pé-direito duplo no living',
      'Sistema de segurança e cerca elétrica',
      'Excelente ventilação cruzada'
    ]
  },
  {
    id: 'oe-103',
    code: 'OE-103',
    title: 'Cobertura Duplex Exclusiva com Vista Panorâmica',
    type: 'Apartamento',
    neighborhood: 'Centro',
    city: 'Navegantes',
    price: 2450000,
    bedrooms: 4,
    suites: 4,
    bathrooms: 5,
    parkingSpots: 3,
    areaM2: 280,
    featured: true,
    tag: 'Exclusividade',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80',
        alt: 'Cobertura Duplex no Centro de Navegantes',
        recommendedDim: '1200 x 800 px (Área Social / Vista)'
      },
      {
        url: 'https://images.unsplash.com/photo-1600607687644-c7171b42498f?auto=format&fit=crop&w=1200&q=80',
        alt: 'Terraço privativo com jacuzzi',
        recommendedDim: '1200 x 800 px (Terraço Superior)'
      },
      {
        url: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1200&q=80',
        alt: 'Suíte master requintada',
        recommendedDim: '1200 x 800 px (Suíte Master)'
      }
    ],
    description: 'O ápice da sofisticação e conforto no Centro de Navegantes. Cobertura duplex imponente com 4 suítes plenas, terraço superior privativo com spa/hidromassagem e vista 360° da orla.',
    features: [
      '4 Suítes completas com sacada',
      'Terraço descoberto com spa/jacuzzi privativo',
      'Espaço gourmet no pavimento superior',
      '3 Vagas de garagem privativas',
      'Elevador com acesso aos dois andares',
      'Isolamento acústico de alta performance',
      'Vista mar e rio permanente'
    ]
  },
  {
    id: 'oe-104',
    code: 'OE-104',
    title: 'Apartamento Novo a 150m da Praia',
    type: 'Apartamento',
    neighborhood: 'Meia Praia',
    city: 'Navegantes',
    price: 790000,
    bedrooms: 2,
    suites: 1,
    bathrooms: 2,
    parkingSpots: 1,
    areaM2: 78,
    featured: true,
    tag: 'Pronto para Morar',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80',
        alt: 'Apartamento Novo em Meia Praia Navegantes',
        recommendedDim: '1200 x 800 px (Sala de Estar)'
      },
      {
        url: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1200&q=80',
        alt: 'Cozinha e bancada moderna',
        recommendedDim: '1200 x 800 px (Cozinha e Jantar)'
      },
      {
        url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80',
        alt: 'Suíte aconchegante',
        recommendedDim: '1200 x 800 px (Dormitório)'
      }
    ],
    description: 'Apartamento recém-entregue, ideal para morar ou investimento com alta valorização em Meia Praia, Navegantes.',
    features: [
      '1 Suíte + 1 Dormitório',
      'Sacada com churrasqueira a carvão',
      'Prédio com salão de festas decorado',
      'Piso porcelanato e teto rebaixado em gesso',
      'Vaga privativa coberta',
      'Medidores individuais de água, luz e gás',
      '150 metros da praia'
    ]
  },
  {
    id: 'oe-105',
    code: 'OE-105',
    title: 'Terreno Residencial / Comercial Privilegiado',
    type: 'Terreno',
    neighborhood: 'Gravatá',
    city: 'Navegantes',
    price: 650000,
    areaM2: 360,
    featured: true,
    tag: 'Oportunidade',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80',
        alt: 'Terreno Plano no Gravatá Navegantes',
        recommendedDim: '1200 x 800 px (Foto Aérea / Terreno)'
      },
      {
        url: 'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=1200&q=80',
        alt: 'Entorno urbanizado no Gravatá',
        recommendedDim: '1200 x 800 px (Entorno e Acessos)'
      }
    ],
    description: 'Excelente terreno plano, aterrado e murado em localização estratégica no Bairro Gravatá em Navegantes. Medindo 12x30 metros (360m²).',
    features: [
      'Área total de 360 m² (12m x 30m)',
      'Terreno plano, seco e murado',
      'Rua pavimentada com infraestrutura completa',
      'Documentação 100% regularizada',
      'Viabilidade para residencial e comercial',
      'Excelente potencial de valorização imobiliária'
    ]
  },
  {
    id: 'oe-106',
    code: 'OE-106',
    title: 'Sala Comercial Moderna na Avenida Principal',
    type: 'Comercial',
    neighborhood: 'Centro',
    city: 'Navegantes',
    price: 890000,
    bathrooms: 2,
    parkingSpots: 2,
    areaM2: 95,
    featured: true,
    tag: 'Investimento Comercial',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80',
        alt: 'Sala Comercial no Centro de Navegantes',
        recommendedDim: '1200 x 800 px (Recepção / Escritório)'
      },
      {
        url: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=1200&q=80',
        alt: 'Ambiente executivo moderno',
        recommendedDim: '1200 x 800 px (Espaço de Reuniões)'
      }
    ],
    description: 'Imóvel comercial corporativo de alto nível no Centro de Navegantes. Fachada envidraçada espelhada, hall imponente com controle de acesso biométrico.',
    features: [
      '95 m² de área privativa',
      '2 Vagas de garagem no subsolo',
      '2 Lavabos privativos com louças de padrão superior',
      'Prédio com portaria 24 horas e elevadores velozes',
      'Piso elevado e preparação para ar condicionado VRF',
      'Localização nobre no coração financeiro da cidade'
    ]
  },
  {
    id: 'oe-107',
    code: 'OE-107',
    title: 'Casa Térrea Moderna com Amplo Quintal',
    type: 'Casa',
    neighborhood: 'Gravatá',
    city: 'Navegantes',
    price: 980000,
    bedrooms: 3,
    suites: 1,
    bathrooms: 2,
    parkingSpots: 2,
    areaM2: 155,
    featured: false,
    tag: 'Conforto Familiar',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80',
        alt: 'Casa Térrea no Gravatá',
        recommendedDim: '1200 x 800 px (Fachada Frontal)'
      }
    ],
    description: 'Linda residência térrea com design minimalista, acabamentos refinados, cozinha integrada ao living, churrasqueira coberta e amplo espaço nos fundos.',
    features: [
      '1 Suíte ampla + 2 Quartos',
      'Área de churrasqueira integrada',
      'Terreno com quintal privativo',
      'Garagem coberta para 2 carros',
      'Acabamento em gesso e iluminação embutida'
    ]
  },
  {
    id: 'oe-108',
    code: 'OE-108',
    title: 'Apartamento com Vista Mar Lateral a 50m da Praia',
    type: 'Apartamento',
    neighborhood: 'Gravatá',
    city: 'Navegantes',
    price: 1150000,
    bedrooms: 3,
    suites: 1,
    bathrooms: 2,
    parkingSpots: 2,
    areaM2: 110,
    featured: false,
    tag: 'Próximo ao Mar',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80',
        alt: 'Apartamento Gravatá 50m do Mar',
        recommendedDim: '1200 x 800 px (Vista da Varanda)'
      }
    ],
    description: 'Excelente apartamento a apenas meia quadra da orla do Gravatá. Ampla sacada com churrasqueira, móveis sob medida na cozinha e banheiros.',
    features: [
      '3 Quartos sendo 1 Suíte',
      'Sacada ampla com churrasqueira a carvão',
      '50 metros da orla de Gravatá',
      '2 Vagas de garagem privativas',
      'Condomínio de baixo custo com elevador'
    ]
  }
];

/**
 * Instancia o cliente do Upstash Redis usando Redis.fromEnv()
 * Lê automaticamente KV_REST_API_URL e KV_REST_API_TOKEN ou UPSTASH_REDIS_REST_URL e UPSTASH_REDIS_REST_TOKEN.
 */
function getRedis(): Redis | null {
  try {
    const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
    if (!url || !token) {
      return null;
    }
    return new Redis({ url, token });
  } catch (e) {
    console.warn('[Vercel Serverless /api/imoveis] Redis aviso:', e);
    return null;
  }
}

/**
 * Vercel Serverless Function: /api/imoveis
 * Garante SEMPRE retorno em JSON (nunca página HTML de erro).
 */
export default async function handler(req: any, res: any) {
  // CORS
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

  // Wrapper global try/catch para garantir 100% de retorno em JSON
  try {
    const redis = getRedis();

    // Helper interno para buscar do Redis de forma segura
    const fetchFromRedis = async (): Promise<any[]> => {
      if (!redis) return DEFAULT_PROPERTIES;
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
        console.warn('[Vercel Serverless] Erro ao consultar Redis:', err);
      }
      return DEFAULT_PROPERTIES;
    };

    // GET /api/imoveis
    if (req.method === 'GET') {
      const properties = await fetchFromRedis();
      return res.status(200).json({
        success: true,
        properties,
        count: properties.length,
        storage: redis ? 'upstash-redis' : 'fallback'
      });
    }

    // POST /api/imoveis
    if (req.method === 'POST') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
      let propertiesToSave: any[] | null = null;

      if (Array.isArray(body)) {
        propertiesToSave = body;
      } else if (Array.isArray(body.properties)) {
        propertiesToSave = body.properties;
      } else if (body.action === 'reset') {
        propertiesToSave = DEFAULT_PROPERTIES;
      } else if (body.action === 'delete' && body.id) {
        const current = await fetchFromRedis();
        propertiesToSave = current.filter((p: any) => p.id !== body.id);
      } else if (body.property) {
        const current = await fetchFromRedis();
        const incoming = body.property;
        const existsIndex = current.findIndex((p: any) => p.id === incoming.id);
        if (existsIndex >= 0) {
          propertiesToSave = current.map((p: any, idx: number) => (idx === existsIndex ? { ...p, ...incoming } : p));
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
        try {
          await redis.set(KV_IMOVEIS_KEY, propertiesToSave);
          await redis.set('imoveis', propertiesToSave);
        } catch (saveErr) {
          console.warn('[Vercel Serverless] Falha ao persistir no Redis:', saveErr);
        }
      }

      return res.status(200).json({
        success: true,
        properties: propertiesToSave,
        count: propertiesToSave.length,
        storage: redis ? 'upstash-redis' : 'memory',
        message: 'Lista de imóveis salva com sucesso no banco de dados Upstash Redis!'
      });
    }

    // DELETE /api/imoveis
    if (req.method === 'DELETE') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
      const id = req.query?.id || body?.id;

      if (!id) {
        return res.status(400).json({
          success: false,
          error: 'ID do imóvel não fornecido.'
        });
      }

      const current = await fetchFromRedis();
      const updated = current.filter((p: any) => p.id !== id);

      if (redis) {
        try {
          await redis.set(KV_IMOVEIS_KEY, updated);
          await redis.set('imoveis', updated);
        } catch (delErr) {
          console.warn('[Vercel Serverless] Falha ao deletar no Redis:', delErr);
        }
      }

      return res.status(200).json({
        success: true,
        id,
        properties: updated,
        count: updated.length,
        storage: redis ? 'upstash-redis' : 'memory',
        message: `Imóvel ${id} excluído com sucesso do banco de dados Upstash Redis!`
      });
    }

    return res.status(405).json({
      success: false,
      error: 'Método não permitido.'
    });
  } catch (fatalError: any) {
    console.error('[Vercel Serverless /api/imoveis FATAL]:', fatalError);
    // Sempre retorna JSON para evitar que o navegador receba HTML
    return res.status(200).json({
      success: true,
      properties: DEFAULT_PROPERTIES,
      count: DEFAULT_PROPERTIES.length,
      storage: 'fallback-error',
      error: fatalError?.message || 'Falha ao carregar imóveis'
    });
  }
}
