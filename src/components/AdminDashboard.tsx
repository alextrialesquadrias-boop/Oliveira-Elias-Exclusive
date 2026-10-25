import React, { useState } from 'react';
import {
  X,
  Save,
  LogOut,
  RotateCcw,
  Eye,
  Image as ImageIcon,
  Sparkles,
  Home,
  Check,
  AlertCircle,
  Building,
  DollarSign,
  Maximize2,
  BedDouble,
  Bath,
  Car,
  MapPin,
  Tag
} from 'lucide-react';
import { HeroData, Property, SiteData } from '../types';
import { formatCurrency } from '../utils/formatters';

interface AdminDashboardProps {
  isOpen: boolean;
  heroData: HeroData;
  properties: Property[];
  onSave: (newHero: HeroData, newProperties: Property[]) => void;
  onResetDefaults: () => void;
  onClose: () => void;
  onLogout: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  isOpen,
  heroData,
  properties,
  onSave,
  onResetDefaults,
  onClose,
  onLogout
}) => {
  if (!isOpen) return null;

  // Local draft state for edits
  const [draftHero, setDraftHero] = useState<HeroData>({ ...heroData });
  const [draftProperties, setDraftProperties] = useState<Property[]>(
    properties.map((p) => ({ ...p, images: p.images.map((img) => ({ ...img })) }))
  );

  const [activeTab, setActiveTab] = useState<'hero' | 'properties'>('hero');
  const [selectedPropIndex, setSelectedPropIndex] = useState<number>(0);
  const [showSavedToast, setShowSavedToast] = useState(false);
  const [confirmResetModal, setConfirmResetModal] = useState(false);

  // Suggestions for high-res real estate banner images
  const bannerPresets = [
    {
      label: 'Fachada & Piscina Alto Padrão',
      url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1920&q=85'
    },
    {
      label: 'Living Frente Mar Contemporâneo',
      url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1920&q=85'
    },
    {
      label: 'Mansão Iluminada Crepúsculo',
      url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1920&q=85'
    }
  ];

  const handleHeroChange = (field: keyof HeroData, value: string) => {
    setDraftHero((prev) => ({ ...prev, [field]: value }));
  };

  const handlePropertyChange = (
    index: number,
    field: keyof Property,
    value: any
  ) => {
    setDraftProperties((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handlePropertyImageUrlChange = (propIndex: number, newUrl: string) => {
    setDraftProperties((prev) => {
      const updated = [...prev];
      const images = [...updated[propIndex].images];
      images[0] = {
        ...images[0],
        url: newUrl
      };
      updated[propIndex] = { ...updated[propIndex], images };
      return updated;
    });
  };

  const handleSave = () => {
    onSave(draftHero, draftProperties);
    setShowSavedToast(true);
    setTimeout(() => {
      setShowSavedToast(false);
    }, 3500);
  };

  const handleConfirmReset = () => {
    onResetDefaults();
    setConfirmResetModal(false);
    onClose();
  };

  // Only edit the first 6 featured properties as required
  const featuredSix = draftProperties.slice(0, 6);
  const currentEditingProp = featuredSix[selectedPropIndex] || featuredSix[0];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/90 backdrop-blur-md flex flex-col justify-between animate-in fade-in duration-200">
      
      {/* Top Admin Navigation Bar */}
      <header className="sticky top-0 z-30 bg-slate-900 border-b border-amber-500/30 px-4 sm:px-6 lg:px-8 py-3.5 shadow-xl">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-700 flex items-center justify-center font-bold text-slate-950 text-sm shadow-md">
              OE
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-base">Painel Administrativo</span>
                <span className="text-[10px] uppercase font-extrabold bg-amber-500/20 text-amber-400 border border-amber-500/40 px-2 py-0.5 rounded">
                  Modo Edição
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Edite os textos e cards do site sem mexer no código.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <button
              type="button"
              onClick={() => setConfirmResetModal(true)}
              className="text-xs text-slate-400 hover:text-white px-3 py-2 rounded-xl hover:bg-slate-800 transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Restaurar dados originais de fábrica"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Restaurar Padrão</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="text-xs font-semibold text-slate-200 hover:text-white px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Voltar para visualização do site"
            >
              <Eye className="w-4 h-4 text-amber-400" />
              <span>Ver Site</span>
            </button>

            <button
              type="button"
              onClick={handleSave}
              className="bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 font-extrabold text-xs sm:text-sm px-4 sm:px-5 py-2.5 rounded-xl shadow-lg shadow-amber-500/30 flex items-center gap-2 transition-all transform active:scale-95 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Salvar Alterações</span>
            </button>

            <button
              type="button"
              onClick={onLogout}
              className="text-xs text-red-400 hover:text-red-300 hover:bg-red-950/40 border border-red-500/30 px-3 py-2 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer ml-1"
              title="Sair do painel administrativo"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sair</span>
            </button>
          </div>

        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        
        {/* Success Alert Toast */}
        {showSavedToast && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-950/90 border border-emerald-500/50 text-white flex items-center justify-between shadow-2xl animate-in slide-in-from-top duration-300">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <Check className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-sm text-emerald-300">Alterações Salvas com Sucesso!</p>
                <p className="text-xs text-slate-300">
                  Os dados foram armazenados no seu navegador (localStorage) e já estão visíveis no site.
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowSavedToast(false)}
              className="text-slate-400 hover:text-white p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Tab Selector */}
        <div className="flex gap-2 mb-6 border-b border-slate-800 pb-3">
          <button
            type="button"
            onClick={() => setActiveTab('hero')}
            className={`px-4 sm:px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'hero'
                ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>1. Banner Principal (Hero)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('properties')}
            className={`px-4 sm:px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'properties'
                ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Home className="w-4 h-4" />
            <span>2. Imóveis em Destaque (6 Cards)</span>
          </button>
        </div>

        {/* TAB 1: BANNER PRINCIPAL (HERO) */}
        {activeTab === 'hero' && (
          <div className="bg-slate-900 border border-amber-500/20 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="border-b border-slate-800 pb-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <span>Edição do Banner Principal (Hero)</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Altere os textos de chamada e a imagem de fundo que aparecem na primeira dobra do site.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Form inputs */}
              <div className="lg:col-span-7 space-y-5">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Título Principal do Banner *
                  </label>
                  <input
                    type="text"
                    value={draftHero.title}
                    onChange={(e) => handleHeroChange('title', e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 focus:border-amber-400 text-white text-base rounded-xl py-3 px-4 outline-none font-semibold"
                    placeholder="Encontre o Imóvel dos Seus Sonhos em Navegantes"
                  />
                  <p className="text-[11px] text-slate-400 mt-1.5">
                    Dica: A palavra "Navegantes" é automaticamente destacada com gradiente dourado.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Subtítulo do Banner *
                  </label>
                  <textarea
                    rows={4}
                    value={draftHero.subtitle}
                    onChange={(e) => handleHeroChange('subtitle', e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 focus:border-amber-400 text-white text-sm rounded-xl py-3 px-4 outline-none leading-relaxed"
                    placeholder="Descrição da consultoria imobiliária com Daniela de Oliveira Elias..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center justify-between">
                    <span>URL da Imagem de Fundo (1920 × 1080 px) *</span>
                    <span className="text-[10px] text-amber-400 font-normal">Link direto (HTTPS)</span>
                  </label>
                  <input
                    type="url"
                    value={draftHero.bgImageUrl}
                    onChange={(e) => handleHeroChange('bgImageUrl', e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 focus:border-amber-400 text-white text-xs sm:text-sm font-mono rounded-xl py-3 px-4 outline-none"
                    placeholder="https://images.unsplash.com/..."
                  />
                </div>

                {/* Quick Presets */}
                <div>
                  <span className="block text-xs font-medium text-slate-400 mb-2">
                    Ou selecione um exemplo fotográfico de alta resolução:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {bannerPresets.map((preset, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => handleHeroChange('bgImageUrl', preset.url)}
                        className="text-xs bg-slate-950 hover:bg-amber-500/20 text-slate-300 hover:text-amber-300 border border-slate-800 hover:border-amber-500/40 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Live Preview Card */}
              <div className="lg:col-span-5 bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block">
                  Pré-visualização ao Vivo
                </span>
                <div className="relative aspect-[16/9] rounded-xl overflow-hidden bg-slate-900 border border-slate-800 shadow-inner">
                  <img
                    src={draftHero.bgImageUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80';
                    }}
                  />
                  <div className="absolute inset-0 bg-slate-950/70 p-4 flex flex-col justify-end text-left">
                    <span className="text-[10px] text-amber-400 uppercase font-bold tracking-widest mb-1">
                      Oliveira Elias Exclusive
                    </span>
                    <h3 className="text-sm font-bold text-white line-clamp-2 leading-tight">
                      {draftHero.title}
                    </h3>
                    <p className="text-[10px] text-slate-300 line-clamp-2 mt-1">
                      {draftHero.subtitle}
                    </p>
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 text-center">
                  Esta imagem e textos serão exibidos instantaneamente na página inicial.
                </p>
              </div>

            </div>
          </div>
        )}

        {/* TAB 2: IMÓVEIS EM DESTAQUE (6 CARDS) */}
        {activeTab === 'properties' && (
          <div className="space-y-6">
            
            {/* Header info */}
            <div className="bg-slate-900 border border-amber-500/20 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Home className="w-5 h-5 text-amber-400" />
                  <span>Edição dos 6 Cards de Imóveis em Destaque</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Selecione um card para editar título, tipo, bairro, preço, imagem e especificações.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded-lg">
                  Exclusivo Venda • Navegantes/SC
                </span>
              </div>
            </div>

            {/* Quick Cards Selector Selector Pills */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
              {featuredSix.map((prop, idx) => (
                <button
                  key={prop.id}
                  type="button"
                  onClick={() => setSelectedPropIndex(idx)}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                    selectedPropIndex === idx
                      ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-lg shadow-amber-500/20 scale-102 font-bold'
                      : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700 hover:bg-slate-850'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className="font-mono font-bold">{prop.code}</span>
                      <span className="text-[10px] opacity-80">{prop.type}</span>
                    </div>
                    <p className="text-xs font-bold line-clamp-1">
                      {prop.title}
                    </p>
                  </div>
                  <div className="mt-2 text-[11px] font-extrabold">
                    {formatCurrency(prop.price)}
                  </div>
                </button>
              ))}
            </div>

            {/* Current Selected Property Edit Form */}
            {currentEditingProp && (
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
                
                <div className="flex flex-wrap items-center justify-between gap-3 pb-5 mb-6 border-b border-slate-800">
                  <div className="flex items-center gap-3">
                    <span className="bg-amber-500 text-slate-950 font-mono font-extrabold text-sm px-3 py-1 rounded-xl">
                      Card #{selectedPropIndex + 1}: {currentEditingProp.code}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">
                      {currentEditingProp.type} em {currentEditingProp.neighborhood}, Navegantes
                    </span>
                  </div>
                  <div className="text-sm font-extrabold text-amber-400">
                    Valor: {formatCurrency(currentEditingProp.price)}
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  
                  {/* Property Fields */}
                  <div className="lg:col-span-8 space-y-4">
                    
                    {/* Título do Imóvel */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                        Título do Imóvel (ex: Tipo + Bairro / Diferencial) *
                      </label>
                      <input
                        type="text"
                        value={currentEditingProp.title}
                        onChange={(e) =>
                          handlePropertyChange(selectedPropIndex, 'title', e.target.value)
                        }
                        className="w-full bg-slate-950 border border-slate-700 focus:border-amber-400 text-white text-sm font-semibold rounded-xl py-3 px-3.5 outline-none"
                        placeholder="Ex: Apartamento Frente Mar no Gravatá"
                      />
                    </div>

                    {/* Tipo & Bairro */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                          Tipo de Imóvel *
                        </label>
                        <select
                          value={currentEditingProp.type}
                          onChange={(e) =>
                            handlePropertyChange(selectedPropIndex, 'type', e.target.value)
                          }
                          className="w-full bg-slate-950 border border-slate-700 focus:border-amber-400 text-white text-sm rounded-xl py-3 px-3.5 outline-none cursor-pointer"
                        >
                          <option value="Apartamento">Apartamento</option>
                          <option value="Casa">Casa</option>
                          <option value="Terreno">Terreno</option>
                          <option value="Comercial">Comercial</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                          Bairro em Navegantes *
                        </label>
                        <input
                          type="text"
                          value={currentEditingProp.neighborhood}
                          onChange={(e) =>
                            handlePropertyChange(selectedPropIndex, 'neighborhood', e.target.value)
                          }
                          className="w-full bg-slate-950 border border-slate-700 focus:border-amber-400 text-white text-sm rounded-xl py-3 px-3.5 outline-none"
                          placeholder="Gravatá, Centro, Meia Praia..."
                        />
                      </div>
                    </div>

                    {/* Preço de Venda */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                          Preço de Venda (R$) *
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-amber-400 font-bold text-xs">
                            R$
                          </div>
                          <input
                            type="number"
                            step="1000"
                            min="0"
                            value={currentEditingProp.price}
                            onChange={(e) =>
                              handlePropertyChange(
                                selectedPropIndex,
                                'price',
                                parseFloat(e.target.value) || 0
                              )
                            }
                            className="w-full bg-slate-950 border border-slate-700 focus:border-amber-400 text-white text-sm rounded-xl py-3 pl-10 pr-3.5 outline-none font-mono font-bold"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                          Área Privativa (m²) *
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            min="1"
                            value={currentEditingProp.areaM2}
                            onChange={(e) =>
                              handlePropertyChange(
                                selectedPropIndex,
                                'areaM2',
                                parseFloat(e.target.value) || 0
                              )
                            }
                            className="w-full bg-slate-950 border border-slate-700 focus:border-amber-400 text-white text-sm rounded-xl py-3 px-3.5 outline-none font-mono"
                          />
                          <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400 text-xs">
                            m²
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Quantidade de Quartos, Banheiros e Vagas */}
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                          <BedDouble className="w-3.5 h-3.5 text-amber-400" />
                          <span>Quartos</span>
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={currentEditingProp.bedrooms ?? 0}
                          onChange={(e) =>
                            handlePropertyChange(
                              selectedPropIndex,
                              'bedrooms',
                              parseInt(e.target.value, 10) || 0
                            )
                          }
                          className="w-full bg-slate-950 border border-slate-700 focus:border-amber-400 text-white text-sm rounded-xl py-2.5 px-3 outline-none font-mono text-center"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                          <Bath className="w-3.5 h-3.5 text-amber-400" />
                          <span>Banheiros</span>
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={currentEditingProp.bathrooms ?? 0}
                          onChange={(e) =>
                            handlePropertyChange(
                              selectedPropIndex,
                              'bathrooms',
                              parseInt(e.target.value, 10) || 0
                            )
                          }
                          className="w-full bg-slate-950 border border-slate-700 focus:border-amber-400 text-white text-sm rounded-xl py-2.5 px-3 outline-none font-mono text-center"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                          <Car className="w-3.5 h-3.5 text-amber-400" />
                          <span>Vagas</span>
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={currentEditingProp.parkingSpots ?? 0}
                          onChange={(e) =>
                            handlePropertyChange(
                              selectedPropIndex,
                              'parkingSpots',
                              parseInt(e.target.value, 10) || 0
                            )
                          }
                          className="w-full bg-slate-950 border border-slate-700 focus:border-amber-400 text-white text-sm rounded-xl py-2.5 px-3 outline-none font-mono text-center"
                        />
                      </div>
                    </div>

                    {/* URL da Imagem */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                        <span>URL da Imagem do Imóvel (1200 × 800 px) *</span>
                        <span className="text-[10px] text-amber-400">Recomendado 1200x800px</span>
                      </label>
                      <input
                        type="url"
                        value={currentEditingProp.images[0]?.url || ''}
                        onChange={(e) =>
                          handlePropertyImageUrlChange(selectedPropIndex, e.target.value)
                        }
                        className="w-full bg-slate-950 border border-slate-700 focus:border-amber-400 text-white text-xs sm:text-sm font-mono rounded-xl py-3 px-3.5 outline-none"
                        placeholder="https://images.unsplash.com/..."
                      />
                    </div>

                    {/* Tag / Destaque */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                        Etiqueta de Destaque (opcional)
                      </label>
                      <input
                        type="text"
                        value={currentEditingProp.tag || ''}
                        onChange={(e) =>
                          handlePropertyChange(selectedPropIndex, 'tag', e.target.value)
                        }
                        className="w-full bg-slate-950 border border-slate-700 focus:border-amber-400 text-white text-sm rounded-xl py-2.5 px-3.5 outline-none"
                        placeholder="Ex: Frente Mar, Com Piscina, Oportunidade..."
                      />
                    </div>

                  </div>

                  {/* Property Card Live Preview */}
                  <div className="lg:col-span-4 bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
                    <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block">
                      Como o Card Aparecerá no Site
                    </span>
                    
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                      <div className="relative aspect-[16/10] bg-slate-950 overflow-hidden">
                        <img
                          src={currentEditingProp.images[0]?.url}
                          alt={currentEditingProp.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src =
                              'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=600&q=80';
                          }}
                        />
                        <div className="absolute top-2 left-2 flex gap-1">
                          <span className="bg-emerald-600 text-white text-[10px] font-extrabold uppercase px-2 py-0.5 rounded">
                            Venda
                          </span>
                          {currentEditingProp.tag && (
                            <span className="bg-amber-500 text-slate-950 text-[10px] font-bold px-1.5 py-0.5 rounded">
                              {currentEditingProp.tag}
                            </span>
                          )}
                        </div>
                        <div className="absolute top-2 right-2 font-mono text-[11px] bg-slate-950/80 text-amber-300 px-2 py-0.5 rounded">
                          {currentEditingProp.code}
                        </div>
                      </div>

                      <div className="p-4 space-y-2">
                        <div className="text-[11px] text-amber-400 font-semibold flex items-center justify-between">
                          <span>{currentEditingProp.type}</span>
                          <span className="text-slate-400">{currentEditingProp.neighborhood}, Navegantes</span>
                        </div>
                        <h4 className="text-sm font-bold text-white line-clamp-1">
                          {currentEditingProp.title}
                        </h4>
                        <div className="text-base font-extrabold text-amber-400">
                          {formatCurrency(currentEditingProp.price)}
                        </div>
                        <div className="grid grid-cols-4 gap-1 py-2 border-t border-slate-800 text-[10px] text-slate-400 text-center">
                          <div>{currentEditingProp.bedrooms ?? 0} Qts</div>
                          <div>{currentEditingProp.bathrooms ?? 0} Banhos</div>
                          <div>{currentEditingProp.parkingSpots ?? 0} Vagas</div>
                          <div>{currentEditingProp.areaM2} m²</div>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 text-center">
                      <button
                        type="button"
                        onClick={handleSave}
                        className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs py-2.5 rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>Salvar este Imóvel</span>
                      </button>
                    </div>
                  </div>

                </div>

              </div>
            )}

          </div>
        )}

      </main>

      {/* Confirmation Modal for Resetting to Defaults */}
      {confirmResetModal && (
        <div className="fixed inset-0 z-60 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-sm w-full p-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Restaurar Dados Padrão?</h3>
            <p className="text-xs text-slate-300">
              Isso limpará as edições salvas no navegador e restaurará o conteúdo original da Oliveira Elias Exclusive.
            </p>
            <div className="flex gap-2 justify-center pt-2">
              <button
                type="button"
                onClick={() => setConfirmResetModal(false)}
                className="px-4 py-2 bg-slate-800 text-slate-300 hover:bg-slate-700 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmReset}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                Sim, Restaurar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
