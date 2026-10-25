import React from 'react';
import { Search, MapPin, Building, DollarSign, KeyRound, Sparkles } from 'lucide-react';
import { SearchFilter, HeroData } from '../types';
import { PRICE_RANGES, PROPERTY_TYPES } from '../data/properties';

interface HeroProps {
  heroData: HeroData;
  filter: SearchFilter;
  onFilterChange: (newFilter: Partial<SearchFilter>) => void;
  onSearch: () => void;
}

export const Hero: React.FC<HeroProps> = ({ heroData, filter, onFilterChange, onSearch }) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch();
  };

  // Format title highlighting "Navegantes" if present
  const renderTitle = (title: string) => {
    if (title.includes('Navegantes')) {
      const parts = title.split('Navegantes');
      return (
        <>
          {parts[0]}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-500">
            Navegantes
          </span>
          {parts.slice(1).join('Navegantes')}
        </>
      );
    }
    return title;
  };

  return (
    <section id="inicio" className="relative min-h-[90vh] lg:min-h-[92vh] flex items-center justify-center pt-24 pb-16 lg:pt-28 lg:pb-20 overflow-hidden bg-slate-950">
      {/* Background Image with Luxury Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroData.bgImageUrl}
          alt="Imóvel de Alto Padrão em Navegantes - Fachada e Living Luxuoso"
          className="w-full h-full object-cover object-center transform scale-105 transition-transform duration-1000"
        />
        {/* Recommended dimension indicator overlay */}
        <div className="absolute top-20 right-4 sm:right-6 bg-slate-950/80 backdrop-blur-md text-[10px] sm:text-xs text-amber-300/90 border border-amber-500/30 px-2.5 py-1 rounded-md shadow-lg hidden sm:flex items-center gap-1.5 z-10">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
          <span>Imagem Hero: 1920 × 1080 px</span>
        </div>

        {/* Gradient overlays for contrast and luxury mood */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-slate-950/50"></div>
        <div className="absolute inset-0 bg-radial-gradient from-transparent via-slate-950/40 to-slate-950/90"></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 w-full text-center">
        {/* Exclusive Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/80 backdrop-blur-md border border-amber-500/40 text-amber-300 text-xs sm:text-sm font-medium mb-6 shadow-xl">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span className="tracking-wide">Atuação Exclusiva em Venda de Imóveis • Navegantes - SC</span>
        </div>

        {/* Main Title */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.15] mb-5 max-w-4xl mx-auto drop-shadow-md">
          {renderTitle(heroData.title)}
        </h1>

        {/* Subtitle */}
        <p className="text-sm sm:text-lg text-slate-200 max-w-2xl mx-auto mb-8 sm:mb-10 font-normal leading-relaxed drop-shadow">
          {heroData.subtitle}
        </p>

        {/* Search Bar Container */}
        <div className="bg-slate-900/90 backdrop-blur-xl p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-2xl border border-amber-500/30 max-w-5xl mx-auto text-left">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3.5 sm:gap-4 items-end">
            
            {/* 1. Código do Imóvel */}
            <div className="lg:col-span-3">
              <label htmlFor="property-code" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                <span>Código do Imóvel</span>
              </label>
              <div className="relative">
                <input
                  id="property-code"
                  type="text"
                  placeholder="Ex: OE-101"
                  value={filter.code}
                  onChange={(e) => onFilterChange({ code: e.target.value })}
                  className="w-full bg-slate-950/80 border border-slate-700 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 text-white placeholder-slate-500 text-sm rounded-xl py-3 px-3.5 transition-all outline-none"
                />
              </div>
            </div>

            {/* 2. Cidade */}
            <div className="lg:col-span-2">
              <label htmlFor="property-city" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-amber-400" />
                <span>Cidade</span>
              </label>
              <div className="relative">
                <select
                  id="property-city"
                  value={filter.city}
                  onChange={(e) => onFilterChange({ city: e.target.value })}
                  className="w-full bg-slate-950/80 border border-slate-700 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 text-white text-sm rounded-xl py-3 px-3.5 transition-all outline-none cursor-pointer appearance-none"
                >
                  <option value="Navegantes">Navegantes</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" fillRule="evenodd"></path></svg>
                </div>
              </div>
            </div>

            {/* 3. Tipo de Imóvel */}
            <div className="lg:col-span-3">
              <label htmlFor="property-type" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-amber-400" />
                <span>Tipo de Imóvel</span>
              </label>
              <div className="relative">
                <select
                  id="property-type"
                  value={filter.type}
                  onChange={(e) => onFilterChange({ type: e.target.value })}
                  className="w-full bg-slate-950/80 border border-slate-700 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 text-white text-sm rounded-xl py-3 px-3.5 transition-all outline-none cursor-pointer appearance-none"
                >
                  {PROPERTY_TYPES.map((t) => (
                    <option key={t} value={t === 'Todos os Tipos' ? '' : t}>
                      {t}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" fillRule="evenodd"></path></svg>
                </div>
              </div>
            </div>

            {/* 4. Faixa de Preço */}
            <div className="lg:col-span-2">
              <label htmlFor="property-price" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-amber-400" />
                <span>Faixa de Preço</span>
              </label>
              <div className="relative">
                <select
                  id="property-price"
                  value={filter.priceRange}
                  onChange={(e) => onFilterChange({ priceRange: e.target.value })}
                  className="w-full bg-slate-950/80 border border-slate-700 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 text-white text-sm rounded-xl py-3 px-3.5 transition-all outline-none cursor-pointer appearance-none"
                >
                  {PRICE_RANGES.map((r) => (
                    <option key={r.label} value={r.label === 'Qualquer Preço' ? '' : r.label}>
                      {r.label}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" fillRule="evenodd"></path></svg>
                </div>
              </div>
            </div>

            {/* 5. Botão "Buscar" */}
            <div className="lg:col-span-2">
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 font-bold text-sm sm:text-base py-3 px-4 rounded-xl shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Search className="w-4 h-4 stroke-[2.5]" />
                <span>Buscar</span>
              </button>
            </div>

          </form>

          {/* Quick neighborhood filters */}
          <div className="mt-4 pt-3.5 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
            <span className="font-medium text-slate-300">Bairros mais procurados em Navegantes:</span>
            <div className="flex flex-wrap gap-1.5">
              {['Gravatá', 'Centro', 'Meia Praia'].map((b) => (
                <button
                  key={b}
                  type="button"
                  onClick={() => {
                    onFilterChange({ code: b });
                    onSearch();
                  }}
                  className="px-2.5 py-1 rounded-full bg-slate-800/60 hover:bg-amber-500/20 hover:text-amber-300 border border-slate-700/60 hover:border-amber-500/40 transition-colors"
                >
                  {b}
                </button>
              ))}
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
