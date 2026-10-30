import React, { useState, useEffect } from 'react';
import { BedDouble, Bath, Car, Maximize2, Sparkles, MapPin, Tag, ArrowRight, Check, Home, Building2, Layers } from 'lucide-react';
import { Property, SearchFilter } from '../types';
import { formatCurrency } from '../utils/formatters';

interface FeaturedPropertiesProps {
  properties: Property[];
  searchFilter: SearchFilter;
  onSelectProperty: (property: Property) => void;
  onClearFilters: () => void;
}

export type PropertyCategoryTab = 'Todos' | 'Apartamentos' | 'Casas' | 'Terrenos' | 'Comerciais';

export const FeaturedProperties: React.FC<FeaturedPropertiesProps> = ({
  properties,
  searchFilter,
  onSelectProperty,
  onClearFilters
}) => {
  const [activeTab, setActiveTab] = useState<PropertyCategoryTab>('Todos');
  const [showAll, setShowAll] = useState(true);

  // Lista dinâmica de imóveis persistida no banco de dados (Upstash Redis)
  const [propertiesList, setPropertiesList] = useState<Property[]>(properties || []);

  // Sincroniza com as props enviadas pelo componente App
  useEffect(() => {
    if (properties && Array.isArray(properties) && properties.length > 0) {
      setPropertiesList(properties);
    }
  }, [properties]);

  // Busca os imóveis da rota GET /api/imoveis no carregamento inicial
  useEffect(() => {
    let isMounted = true;

    const carregarImoveisDoBanco = async () => {
      try {
        const res = await fetch('/api/imoveis');
        const contentType = res.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          const data = await res.json();
          if (data?.properties && Array.isArray(data.properties) && data.properties.length > 0) {
            if (isMounted) {
              setPropertiesList(data.properties);
            }
          }
        }
      } catch (err) {
        console.warn('[FeaturedProperties] Erro ao buscar imóveis de /api/imoveis:', err);
      }
    };

    carregarImoveisDoBanco();

    // Listener para atualização instantânea disparada pelo Painel Administrativo
    const handleImoveisUpdated = (e: Event) => {
      const customEvent = e as CustomEvent<Property[]>;
      if (customEvent.detail && Array.isArray(customEvent.detail)) {
        setPropertiesList(customEvent.detail);
      } else {
        carregarImoveisDoBanco();
      }
    };

    window.addEventListener('imoveisUpdated', handleImoveisUpdated);
    return () => {
      isMounted = false;
      window.removeEventListener('imoveisUpdated', handleImoveisUpdated);
    };
  }, []);

  // Tab category matcher
  const matchesCategory = (itemType: Property['type'], tab: PropertyCategoryTab): boolean => {
    if (tab === 'Todos') return true;
    if (tab === 'Apartamentos') return itemType === 'Apartamento';
    if (tab === 'Casas') return itemType === 'Casa';
    if (tab === 'Terrenos') return itemType === 'Terreno';
    if (tab === 'Comerciais') return itemType === 'Comercial';
    return true;
  };

  // Filter properties based on searchFilter and active tab
  const filtered = propertiesList.filter((item) => {
    // Tab filter
    if (!matchesCategory(item.type, activeTab)) {
      return false;
    }
    // Search filter type
    if (searchFilter.type && item.type.toLowerCase() !== searchFilter.type.toLowerCase()) {
      return false;
    }
    // Search filter code or text
    if (searchFilter.code.trim()) {
      const q = searchFilter.code.toLowerCase().trim();
      const matchCode = item.code.toLowerCase().includes(q);
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchNeigh = item.neighborhood.toLowerCase().includes(q);
      if (!matchCode && !matchTitle && !matchNeigh) {
        return false;
      }
    }
    // Price range
    if (searchFilter.priceRange) {
      if (searchFilter.priceRange === 'Até R$ 800.000' && item.price > 800000) return false;
      if (searchFilter.priceRange === 'R$ 800.000 a R$ 1.500.000' && (item.price < 800000 || item.price > 1500000)) return false;
      if (searchFilter.priceRange === 'R$ 1.500.000 a R$ 2.000.000' && (item.price < 1500000 || item.price > 2000000)) return false;
      if (searchFilter.priceRange === 'Acima de R$ 2.000.000' && item.price < 2000000) return false;
    }
    return true;
  });

  const isFiltered = !!(searchFilter.code || searchFilter.type || searchFilter.priceRange || activeTab !== 'Todos');

  // Counts for each tab
  const countForTab = (tab: PropertyCategoryTab) => {
    return propertiesList.filter((p) => matchesCategory(p.type, tab)).length;
  };

  const tabs: PropertyCategoryTab[] = ['Todos', 'Apartamentos', 'Casas', 'Terrenos', 'Comerciais'];

  return (
    <section id="imoveis" className="py-20 lg:py-28 bg-slate-900 text-white relative">
      {/* Decorative gradient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-7xl h-96 bg-amber-500/5 blur-[120px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold uppercase tracking-wider mb-3">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Exclusividades em Navegantes</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
            O Imóvel que Você Procura Está Aqui!
          </h2>
          <p className="mt-3 text-slate-300 text-base sm:text-lg">
            Confira as melhores opções selecionadas para venda com a consultoria de Daniela de Oliveira Elias.
          </p>
          <div className="w-20 h-1 bg-amber-500 mx-auto mt-4 rounded-full"></div>
        </div>

        {/* Category Tabs: Todos, Apartamentos, Casas, Terrenos, Comerciais */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-10">
          {tabs.map((tab) => {
            const count = countForTab(tab);
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/25 font-bold scale-105 border border-amber-400'
                    : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60'
                }`}
              >
                <span>{tab}</span>
                <span className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${
                  isActive ? 'bg-slate-950 text-amber-400' : 'bg-slate-700 text-slate-300'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search feedback & reset banner if filters are active */}
        {isFiltered && (
          <div className="mb-8 p-3 sm:p-4 rounded-xl bg-slate-800/90 border border-amber-500/30 flex flex-wrap items-center justify-between gap-3 text-sm">
            <span className="text-slate-300">
              Mostrando <strong className="text-amber-400">{filtered.length}</strong> imóvel(is) com os filtros selecionados.
            </span>
            <button
              onClick={() => {
                onClearFilters();
                setActiveTab('Todos');
                setShowAll(true);
              }}
              className="text-xs font-bold text-amber-400 hover:text-amber-300 underline underline-offset-4 cursor-pointer"
            >
              Limpar Filtros e Ver Todos
            </button>
          </div>
        )}

        {/* Entire Inventory Empty Message */}
        {properties.length === 0 ? (
          <div className="bg-slate-800/60 rounded-3xl p-10 sm:p-14 text-center border border-slate-700 max-w-xl mx-auto my-8 space-y-4">
            <div className="w-16 h-16 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto border border-amber-500/30">
              <Home className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-white">Nenhum imóvel cadastrado no momento</h3>
            <p className="text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
              Novas oportunidades exclusivas de venda em Navegantes/SC estão sendo cadastradas pela corretora Daniela de Oliveira Elias. Entre em contato para atendimento personalizado.
            </p>
          </div>
        ) : filtered.length === 0 ? (
          /* Filtered category empty */
          <div className="bg-slate-800/60 rounded-3xl p-10 text-center border border-slate-700 max-w-xl mx-auto my-8 space-y-4">
            <div className="w-14 h-14 rounded-full bg-slate-700 text-slate-400 flex items-center justify-center mx-auto">
              <Layers className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-white">Nenhum imóvel encontrado em "{activeTab}"</h3>
            <p className="text-xs sm:text-sm text-slate-400">
              Não encontramos imóveis para os filtros atuais. Experimente selecionar outra categoria ou redefinir a busca.
            </p>
            <button
              onClick={() => {
                onClearFilters();
                setActiveTab('Todos');
              }}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-6 py-2.5 rounded-xl text-xs sm:text-sm transition-colors cursor-pointer"
            >
              Ver Todos os Imóveis ({properties.length})
            </button>
          </div>
        ) : (
          /* Property Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {filtered.map((prop) => {
              const mainImg = prop.images?.[0]?.url || 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80';
              const recommendedDim = prop.images?.[0]?.recommendedDim || '1200 × 800 px';

              return (
                <div
                  key={prop.id}
                  className="bg-slate-800/70 border border-slate-700/70 hover:border-amber-500/50 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl hover:shadow-black/50 transition-all duration-300 flex flex-col group"
                >
                  {/* Image Container with Badges */}
                  <div className="relative aspect-[16/10] overflow-hidden bg-slate-950">
                    <img
                      src={mainImg}
                      alt={prop.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      loading="lazy"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src =
                          'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/20"></div>

                    {/* Venda Tag & Property Code */}
                    <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 items-center">
                      <span className="bg-emerald-600 text-white text-[11px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-md shadow-md">
                        Venda
                      </span>
                      {prop.featured && (
                        <span className="bg-amber-500 text-slate-950 text-[11px] font-bold px-2 py-1 rounded-md shadow-md">
                          Destaque
                        </span>
                      )}
                      {prop.tag && !prop.featured && (
                        <span className="bg-amber-500 text-slate-950 text-[11px] font-bold px-2 py-1 rounded-md shadow-md">
                          {prop.tag}
                        </span>
                      )}
                    </div>

                    <div className="absolute top-3 right-3">
                      <span className="bg-slate-950/85 backdrop-blur-md text-amber-300 border border-amber-500/30 text-xs font-mono font-bold px-2 py-0.5 rounded-md">
                        {prop.code}
                      </span>
                    </div>

                    {/* Recommended dimension indicator */}
                    <div className="absolute bottom-2 left-2 bg-slate-950/80 backdrop-blur-sm text-[10px] text-slate-300 px-2 py-0.5 rounded border border-white/10">
                      {recommendedDim}
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      {/* Type + Neighborhood in Navegantes */}
                      <div className="flex items-center justify-between text-xs font-semibold text-amber-400 mb-1.5">
                        <span className="uppercase tracking-wider">
                          {prop.type}
                        </span>
                        <span className="flex items-center gap-1 text-slate-300 font-normal">
                          <MapPin className="w-3.5 h-3.5 text-amber-400" />
                          {prop.neighborhood}, Navegantes
                        </span>
                      </div>

                      {/* Title */}
                      <h3 className="font-bold text-lg text-white group-hover:text-amber-400 transition-colors line-clamp-2 mb-3">
                        {prop.title}
                      </h3>

                      {/* Price */}
                      <div className="mb-4">
                        <span className="text-xs text-slate-400 block">Valor de Venda</span>
                        <span className="text-xl sm:text-2xl font-extrabold text-amber-400 tracking-tight">
                          {formatCurrency(prop.price)}
                        </span>
                      </div>

                      {/* Specifications (Quartos, Banheiros, Vagas, m²) */}
                      <div className="grid grid-cols-4 gap-2 py-3 border-y border-slate-700/80 text-xs text-slate-300 mb-5 text-center">
                        {prop.bedrooms !== undefined && prop.bedrooms > 0 ? (
                          <div title={`${prop.bedrooms} Quartos`}>
                            <BedDouble className="w-4 h-4 mx-auto mb-1 text-amber-400" />
                            <span className="font-semibold block">{prop.bedrooms}</span>
                            <span className="text-[10px] text-slate-400">Qts</span>
                          </div>
                        ) : (
                          <div>
                            <Maximize2 className="w-4 h-4 mx-auto mb-1 text-amber-400" />
                            <span className="font-semibold block">{prop.areaM2}</span>
                            <span className="text-[10px] text-slate-400">m² Total</span>
                          </div>
                        )}

                        {prop.bathrooms !== undefined && prop.bathrooms > 0 ? (
                          <div title={`${prop.bathrooms} Banheiros`}>
                            <Bath className="w-4 h-4 mx-auto mb-1 text-amber-400" />
                            <span className="font-semibold block">{prop.bathrooms}</span>
                            <span className="text-[10px] text-slate-400">Banhos</span>
                          </div>
                        ) : (
                          <div title="Documentação Regularizada">
                            <Check className="w-4 h-4 mx-auto mb-1 text-emerald-400" />
                            <span className="font-semibold block">100%</span>
                            <span className="text-[10px] text-slate-400">Regul.</span>
                          </div>
                        )}

                        {prop.parkingSpots !== undefined && prop.parkingSpots > 0 ? (
                          <div title={`${prop.parkingSpots} Vagas`}>
                            <Car className="w-4 h-4 mx-auto mb-1 text-amber-400" />
                            <span className="font-semibold block">{prop.parkingSpots}</span>
                            <span className="text-[10px] text-slate-400">Vagas</span>
                          </div>
                        ) : (
                          <div title="Navegantes">
                            <MapPin className="w-4 h-4 mx-auto mb-1 text-amber-400" />
                            <span className="font-semibold block truncate">{prop.neighborhood}</span>
                            <span className="text-[10px] text-slate-400">Bairro</span>
                          </div>
                        )}

                        <div title={`${prop.areaM2} m² Área Privativa`}>
                          <Maximize2 className="w-4 h-4 mx-auto mb-1 text-amber-400" />
                          <span className="font-semibold block">{prop.areaM2}</span>
                          <span className="text-[10px] text-slate-400">m²</span>
                        </div>
                      </div>
                    </div>

                    {/* Ver Detalhes Button */}
                    <button
                      type="button"
                      onClick={() => onSelectProperty(prop)}
                      className="w-full bg-slate-900 hover:bg-amber-500 hover:text-slate-950 text-white font-bold text-sm py-3 px-4 rounded-xl border border-amber-500/30 hover:border-amber-400 transition-all flex items-center justify-center gap-2 group-hover:bg-amber-500 group-hover:text-slate-950 cursor-pointer shadow-md"
                    >
                      <span>Ver Detalhes</span>
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </button>

                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer Note under Grid */}
        {propertiesList.length > 0 && (
          <div className="mt-14 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800/80 border border-slate-700 text-xs text-slate-300">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Total de {propertiesList.length} imóveis cadastrados para venda em Navegantes/SC</span>
            </div>
            <p className="text-xs text-slate-400 mt-2">
              Atendimento 24h com a corretora Daniela de Oliveira Elias (CRECI-SC 71040F)
            </p>
          </div>
        )}

      </div>
    </section>
  );
};
