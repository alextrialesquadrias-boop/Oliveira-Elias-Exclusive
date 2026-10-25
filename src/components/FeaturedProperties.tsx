import React, { useState } from 'react';
import { BedDouble, Bath, Car, Maximize2, Sparkles, MapPin, Tag, ArrowRight, Check } from 'lucide-react';
import { Property, SearchFilter } from '../types';
import { formatCurrency } from '../utils/formatters';

interface FeaturedPropertiesProps {
  properties: Property[];
  searchFilter: SearchFilter;
  onSelectProperty: (property: Property) => void;
  onClearFilters: () => void;
}

export const FeaturedProperties: React.FC<FeaturedPropertiesProps> = ({
  properties,
  searchFilter,
  onSelectProperty,
  onClearFilters
}) => {
  const [activeTab, setActiveTab] = useState<'Todos' | 'Apartamento' | 'Casa' | 'Terreno' | 'Comercial'>('Todos');
  const [showAll, setShowAll] = useState(false);

  // Filter properties based on searchFilter and active tab
  const filtered = properties.filter((item) => {
    // Tab filter
    if (activeTab !== 'Todos' && item.type !== activeTab) {
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

  // Display either the top 6 or all matching
  const displayedProperties = showAll ? filtered : filtered.slice(0, 6);
  const isFiltered = !!(searchFilter.code || searchFilter.type || searchFilter.priceRange || activeTab !== 'Todos');

  return (
    <section id="imoveis" className="py-20 lg:py-28 bg-slate-900 text-white relative">
      {/* Decorative gradient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-7xl h-96 bg-amber-500/5 blur-[120px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
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

        {/* Quick Filter Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-10">
          {(['Todos', 'Apartamento', 'Casa', 'Terreno', 'Comercial'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`px-4 sm:px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                activeTab === tab
                  ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20 font-bold scale-105'
                  : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60'
              }`}
            >
              {tab === 'Todos' ? 'Todos os Imóveis' : tab + 's'}
            </button>
          ))}
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
              className="text-xs font-bold text-amber-400 hover:text-amber-300 underline underline-offset-4"
            >
              Limpar Filtros e Ver Todos
            </button>
          </div>
        )}

        {/* Property Grid (6 items default) */}
        {displayedProperties.length === 0 ? (
          <div className="bg-slate-800/60 rounded-3xl p-12 text-center border border-slate-700 max-w-xl mx-auto my-8">
            <p className="text-lg text-slate-300 font-medium mb-3">
              Nenhum imóvel encontrado para os critérios selecionados.
            </p>
            <p className="text-sm text-slate-400 mb-6">
              Entre em contato direto com Daniela de Oliveira Elias para encontrar opções personalizadas em Navegantes.
            </p>
            <button
              onClick={() => {
                onClearFilters();
                setActiveTab('Todos');
              }}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-6 py-2.5 rounded-xl text-sm transition-colors"
            >
              Redefinir Filtros
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {displayedProperties.map((prop) => (
              <div
                key={prop.id}
                className="bg-slate-800/70 border border-slate-700/70 hover:border-amber-500/50 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl hover:shadow-black/50 transition-all duration-300 flex flex-col group"
              >
                {/* Image Container with Badges */}
                <div className="relative aspect-[16/10] overflow-hidden bg-slate-950">
                  <img
                    src={prop.images[0].url}
                    alt={prop.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/20"></div>

                  {/* Venda Tag & Property Code */}
                  <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 items-center">
                    <span className="bg-emerald-600 text-white text-[11px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-md shadow-md">
                      Venda
                    </span>
                    {prop.tag && (
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

                  {/* Recommended image dimension placeholder indicator */}
                  <div className="absolute bottom-2 left-2 bg-slate-950/80 backdrop-blur-sm text-[10px] text-slate-300 px-2 py-0.5 rounded border border-white/10">
                    {prop.images[0].recommendedDim}
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
                      {prop.bedrooms !== undefined ? (
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

                      {prop.bathrooms !== undefined ? (
                        <div title={`${prop.bathrooms} Banheiros`}>
                          <Bath className="w-4 h-4 mx-auto mb-1 text-amber-400" />
                          <span className="font-semibold block">{prop.bathrooms}</span>
                          <span className="text-[10px] text-slate-400">Banhos</span>
                        </div>
                      ) : (
                        <div title="Documentado">
                          <Check className="w-4 h-4 mx-auto mb-1 text-emerald-400" />
                          <span className="font-semibold block">100%</span>
                          <span className="text-[10px] text-slate-400">Regul.</span>
                        </div>
                      )}

                      {prop.parkingSpots !== undefined ? (
                        <div title={`${prop.parkingSpots} Vagas`}>
                          <Car className="w-4 h-4 mx-auto mb-1 text-amber-400" />
                          <span className="font-semibold block">{prop.parkingSpots}</span>
                          <span className="text-[10px] text-slate-400">Vagas</span>
                        </div>
                      ) : (
                        <div title="Navegantes">
                          <MapPin className="w-4 h-4 mx-auto mb-1 text-amber-400" />
                          <span className="font-semibold block">Gravatá</span>
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
            ))}
          </div>
        )}

        {/* Botão "Ver Todos os Imóveis" abaixo */}
        <div className="mt-14 text-center">
          <button
            type="button"
            onClick={() => {
              setShowAll(!showAll);
              if (!showAll && isFiltered) {
                onClearFilters();
              }
            }}
            className="inline-flex items-center gap-3 bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 font-extrabold text-base py-4 px-8 rounded-2xl shadow-xl shadow-amber-500/20 hover:shadow-amber-500/40 transition-all transform hover:-translate-y-1 active:translate-y-0 cursor-pointer border border-amber-300"
          >
            <span>{showAll ? 'Mostrar Menos Imóveis' : 'Ver Todos os Imóveis'}</span>
            <ArrowRight className="w-5 h-5" />
          </button>
          <p className="text-xs text-slate-400 mt-3">
            Atendimento 24h com a corretora Daniela de Oliveira Elias (CRECI-SC 71040F)
          </p>
        </div>

      </div>
    </section>
  );
};
