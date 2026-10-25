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
  Tag,
  UploadCloud,
  Loader2,
  CheckCircle2,
  ExternalLink,
  ShieldAlert,
  Info,
  Plus,
  Trash2,
  Edit3,
  Search,
  Filter,
  CheckSquare,
  Square
} from 'lucide-react';
import { HeroData, Property, SiteData } from '../types';
import { formatCurrency } from '../utils/formatters';
import { uploadImageToVercelBlob } from '../utils/blobUpload';

interface AdminDashboardProps {
  isOpen: boolean;
  heroData: HeroData;
  properties: Property[];
  onSave: (newHero: HeroData, newProperties: Property[]) => void;
  onResetDefaults: () => void;
  onClose: () => void;
  onLogout: () => void;
}

type AdminCategoryFilter = 'Todos os Imóveis' | 'Apartamentos' | 'Casas' | 'Terrenos' | 'Comerciais';

interface PropertyFormState {
  id?: string;
  code: string;
  title: string;
  type: 'Apartamento' | 'Casa' | 'Terreno' | 'Comercial';
  neighborhood: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  parkingSpots: number;
  areaM2: number;
  imageUrl: string;
  featured: boolean;
  tag: string;
  description: string;
}

const emptyFormState: PropertyFormState = {
  code: '',
  title: '',
  type: 'Apartamento',
  neighborhood: 'Gravatá',
  price: 850000,
  bedrooms: 3,
  bathrooms: 2,
  parkingSpots: 2,
  areaM2: 120,
  imageUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
  featured: true,
  tag: 'Destaque',
  description: 'Excelente oportunidade de investimento e moradia em Navegantes/SC. Acabamentos de alto padrão com localização privilegiada.'
};

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

  const [activeMainTab, setActiveMainTab] = useState<'hero' | 'manageProperties'>('manageProperties');
  const [adminCategory, setAdminCategory] = useState<AdminCategoryFilter>('Todos os Imóveis');
  const [searchTerm, setSearchTerm] = useState('');

  // Toast and Modals
  const [showSavedToast, setShowSavedToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('Alterações salvas com sucesso!');
  const [confirmResetModal, setConfirmResetModal] = useState(false);
  
  // Property to Delete confirmation modal
  const [propertyToDelete, setPropertyToDelete] = useState<Property | null>(null);

  // Property Form Modal (Add / Edit)
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [formData, setFormData] = useState<PropertyFormState>(emptyFormState);

  // Vercel Blob Upload states
  const [isUploadingHero, setIsUploadingHero] = useState(false);
  const [heroProgress, setHeroProgress] = useState(0);
  const [heroUploadError, setHeroUploadError] = useState<string | null>(null);

  const [isUploadingFormImg, setIsUploadingFormImg] = useState(false);
  const [formImgProgress, setFormImgProgress] = useState(0);
  const [formImgError, setFormImgError] = useState<string | null>(null);

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

  // Helper: map filter to property type
  const filterMatchesType = (propType: Property['type'], cat: AdminCategoryFilter): boolean => {
    if (cat === 'Todos os Imóveis') return true;
    if (cat === 'Apartamentos') return propType === 'Apartamento';
    if (cat === 'Casas') return propType === 'Casa';
    if (cat === 'Terrenos') return propType === 'Terreno';
    if (cat === 'Comerciais') return propType === 'Comercial';
    return true;
  };

  const filteredProperties = draftProperties.filter((item) => {
    if (!filterMatchesType(item.type, adminCategory)) return false;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const codeMatch = item.code.toLowerCase().includes(q);
      const titleMatch = item.title.toLowerCase().includes(q);
      const neighMatch = item.neighborhood.toLowerCase().includes(q);
      return codeMatch || titleMatch || neighMatch;
    }
    return true;
  });

  const getCategoryCount = (cat: AdminCategoryFilter): number => {
    return draftProperties.filter((p) => filterMatchesType(p.type, cat)).length;
  };

  // Open Form to Add New Property
  const handleOpenAddProperty = () => {
    const nextCodeNumber = draftProperties.length + 101;
    setFormData({
      ...emptyFormState,
      code: `OE-${nextCodeNumber}`,
      title: '',
      imageUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
      type: adminCategory === 'Casas' ? 'Casa' : adminCategory === 'Terrenos' ? 'Terreno' : adminCategory === 'Comerciais' ? 'Comercial' : 'Apartamento'
    });
    setFormMode('create');
    setFormImgError(null);
    setIsFormModalOpen(true);
  };

  // Open Form to Edit Existing Property
  const handleOpenEditProperty = (prop: Property) => {
    setFormData({
      id: prop.id,
      code: prop.code,
      title: prop.title,
      type: prop.type,
      neighborhood: prop.neighborhood,
      price: prop.price,
      bedrooms: prop.bedrooms ?? 0,
      bathrooms: prop.bathrooms ?? 0,
      parkingSpots: prop.parkingSpots ?? 0,
      areaM2: prop.areaM2,
      imageUrl: prop.images?.[0]?.url || '',
      featured: Boolean(prop.featured),
      tag: prop.tag || '',
      description: prop.description
    });
    setFormMode('edit');
    setFormImgError(null);
    setIsFormModalOpen(true);
  };

  // Handle Form Submission (Add or Update)
  const handleSavePropertyForm = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      alert('Por favor insira um título para o imóvel.');
      return;
    }

    if (formMode === 'create') {
      const newProp: Property = {
        id: 'prop-' + Date.now(),
        code: formData.code.trim() || `OE-${draftProperties.length + 101}`,
        title: formData.title.trim(),
        type: formData.type,
        neighborhood: formData.neighborhood.trim() || 'Gravatá',
        city: 'Navegantes',
        price: Number(formData.price) || 0,
        bedrooms: formData.type === 'Terreno' ? undefined : Number(formData.bedrooms) || 0,
        bathrooms: formData.type === 'Terreno' ? undefined : Number(formData.bathrooms) || 0,
        parkingSpots: formData.type === 'Terreno' ? undefined : Number(formData.parkingSpots) || 0,
        areaM2: Number(formData.areaM2) || 0,
        featured: Boolean(formData.featured),
        tag: formData.tag.trim() || (formData.featured ? 'Destaque' : undefined),
        description: formData.description.trim() || 'Excelente imóvel à venda em Navegantes – SC.',
        images: [
          {
            url: formData.imageUrl.trim() || 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
            alt: formData.title.trim(),
            recommendedDim: '1200 × 800 px'
          }
        ],
        features: [
          'Acabamento diferenciado',
          'Localização privilegiada em Navegantes',
          'Documentação 100% regularizada',
          'Venda exclusiva com Oliveira Elias'
        ]
      };

      const updated = [newProp, ...draftProperties];
      setDraftProperties(updated);
      onSave(draftHero, updated);
      setToastMessage(`Imóvel ${newProp.code} cadastrado com sucesso!`);
    } else {
      // Edit existing
      const updated = draftProperties.map((p) => {
        if (p.id === formData.id) {
          return {
            ...p,
            code: formData.code.trim() || p.code,
            title: formData.title.trim(),
            type: formData.type,
            neighborhood: formData.neighborhood.trim(),
            price: Number(formData.price) || 0,
            bedrooms: formData.type === 'Terreno' ? undefined : Number(formData.bedrooms) || 0,
            bathrooms: formData.type === 'Terreno' ? undefined : Number(formData.bathrooms) || 0,
            parkingSpots: formData.type === 'Terreno' ? undefined : Number(formData.parkingSpots) || 0,
            areaM2: Number(formData.areaM2) || 0,
            featured: Boolean(formData.featured),
            tag: formData.tag.trim() || undefined,
            description: formData.description.trim(),
            images: [
              {
                url: formData.imageUrl.trim() || p.images[0]?.url,
                alt: formData.title.trim(),
                recommendedDim: '1200 × 800 px'
              },
              ...p.images.slice(1)
            ]
          };
        }
        return p;
      });

      setDraftProperties(updated);
      onSave(draftHero, updated);
      setToastMessage(`Imóvel atualizado com sucesso!`);
    }

    setShowSavedToast(true);
    setTimeout(() => setShowSavedToast(false), 3500);
    setIsFormModalOpen(false);
  };

  // Confirm Delete Property
  const handleConfirmDelete = () => {
    if (!propertyToDelete) return;

    const updated = draftProperties.filter((p) => p.id !== propertyToDelete.id);
    setDraftProperties(updated);
    onSave(draftHero, updated);

    setToastMessage(`Imóvel ${propertyToDelete.code} excluído com sucesso!`);
    setShowSavedToast(true);
    setTimeout(() => setShowSavedToast(false), 3500);

    setPropertyToDelete(null);
  };

  // Upload Property Form Image to Vercel Blob
  const handleFormImageFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingFormImg(true);
    setFormImgProgress(0);
    setFormImgError(null);

    try {
      const publicUrl = await uploadImageToVercelBlob(file, 'imoveis', (percent) => {
        setFormImgProgress(percent);
      });
      setFormData((prev) => ({ ...prev, imageUrl: publicUrl }));
      setToastMessage('Foto enviada com sucesso para o Vercel Blob!');
      setShowSavedToast(true);
      setTimeout(() => setShowSavedToast(false), 3500);
    } catch (err: any) {
      console.error('Erro no upload da foto do imóvel:', err);
      setFormImgError(err?.message || 'Falha no upload para o Vercel Blob.');
      // Fallback preview
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result) {
          setFormData((prev) => ({ ...prev, imageUrl: reader.result as string }));
        }
      };
      reader.readAsDataURL(file);
    } finally {
      setIsUploadingFormImg(false);
      e.target.value = '';
    }
  };

  // Upload Hero background to Vercel Blob
  const handleHeroFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingHero(true);
    setHeroProgress(0);
    setHeroUploadError(null);

    try {
      const publicUrl = await uploadImageToVercelBlob(file, 'hero', (percent) => {
        setHeroProgress(percent);
      });

      const updatedHero = { ...draftHero, bgImageUrl: publicUrl };
      setDraftHero(updatedHero);
      onSave(updatedHero, draftProperties);

      setToastMessage('Upload do Banner para Vercel Blob concluído e salvo!');
      setShowSavedToast(true);
      setTimeout(() => setShowSavedToast(false), 4000);
    } catch (err: any) {
      console.error('Erro no upload Vercel Blob do banner:', err);
      setHeroUploadError(err?.message || 'Falha no upload para o Vercel Blob.');
    } finally {
      setIsUploadingHero(false);
      e.target.value = '';
    }
  };

  const handleHeroChange = (field: keyof HeroData, value: string) => {
    setDraftHero((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveAll = () => {
    onSave(draftHero, draftProperties);
    setToastMessage('Todas as alterações foram salvas com sucesso no site e no localStorage!');
    setShowSavedToast(true);
    setTimeout(() => setShowSavedToast(false), 3500);
  };

  const handleConfirmReset = () => {
    onResetDefaults();
    setConfirmResetModal(false);
    onClose();
  };

  const categoryTabs: AdminCategoryFilter[] = [
    'Todos os Imóveis',
    'Apartamentos',
    'Casas',
    'Terrenos',
    'Comerciais'
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/95 backdrop-blur-md flex flex-col justify-between animate-in fade-in duration-200">
      
      {/* Top Admin Header Bar */}
      <header className="sticky top-0 z-30 bg-slate-900 border-b border-amber-500/30 px-4 sm:px-6 lg:px-8 py-3.5 shadow-xl">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          
          <div className="flex items-center gap-3">
            <div className="bg-white/95 rounded-2xl px-3 py-1.5 shadow-md border border-amber-400/40 flex items-center">
              <img
                src="/assets/aistudio/Logotipo_Oliveira_Elias_em_fundo_transparente_2eedaba8.png"
                alt="Oliveira Elias Exclusive"
                className="h-12 w-auto object-contain max-w-[260px]"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-base">Painel Administrativo</span>
                <span className="text-[10px] uppercase font-extrabold bg-amber-500/20 text-amber-400 border border-amber-500/40 px-2 py-0.5 rounded">
                  Área do Corretor
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Gerencie imóveis dinâmicos, textos e fotos do site em tempo real.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <button
              type="button"
              onClick={() => setConfirmResetModal(true)}
              className="text-xs text-slate-400 hover:text-white px-3 py-2 rounded-xl hover:bg-slate-800 transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Restaurar dados originais"
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
              onClick={handleSaveAll}
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
                <p className="font-bold text-sm text-emerald-300">{toastMessage}</p>
                <p className="text-xs text-slate-300">
                  Os dados foram atualizados no site e armazenados com persistência no navegador.
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

        {/* Main Tab Navigation: Gerenciar Imóveis / Banner Principal */}
        <div className="flex flex-wrap gap-2 mb-6 border-b border-slate-800 pb-3">
          <button
            type="button"
            onClick={() => setActiveMainTab('manageProperties')}
            className={`px-5 sm:px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center gap-2 cursor-pointer ${
              activeMainTab === 'manageProperties'
                ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20 scale-102 border border-amber-400'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Home className="w-4 h-4" />
            <span>Gerenciar Imóveis ({draftProperties.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveMainTab('hero')}
            className={`px-5 sm:px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center gap-2 cursor-pointer ${
              activeMainTab === 'hero'
                ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20 scale-102 border border-amber-400'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Banner Principal (Hero)</span>
          </button>
        </div>

        {/* ============================================================== */}
        {/* ABA: GERENCIAR IMÓVEIS (LISTA DINÂMICA)                          */}
        {/* ============================================================== */}
        {activeMainTab === 'manageProperties' && (
          <div className="space-y-6">
            
            {/* Top Bar with Add Property CTA and Search */}
            <div className="bg-slate-900 border border-amber-500/25 rounded-3xl p-5 sm:p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Building className="w-5 h-5 text-amber-400" />
                  <span>Gerenciar Imóveis à Venda</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Cadastre novos imóveis, altere fotos, preços, especificações ou exclua itens da listagem oficial.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleOpenAddProperty}
                  className="w-full sm:w-auto bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 font-extrabold text-xs sm:text-sm px-5 py-3 rounded-xl shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 cursor-pointer transition-all transform hover:-translate-y-0.5 active:translate-y-0 border border-amber-400"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                  <span>Adicionar Novo Imóvel</span>
                </button>
              </div>
            </div>

            {/* Filter Categories Bar & Search Input */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-900/60 border border-slate-800 p-4 rounded-2xl">
              
              {/* Category Pills: Todos os Imóveis, Apartamentos, Casas, Terrenos, Comerciais */}
              <div className="flex flex-wrap gap-2">
                {categoryTabs.map((cat) => {
                  const count = getCategoryCount(cat);
                  const isActive = adminCategory === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setAdminCategory(cat)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${
                        isActive
                          ? 'bg-amber-500 text-slate-950 shadow-md font-bold border border-amber-400'
                          : 'bg-slate-950 text-slate-300 hover:text-white border border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <span>{cat}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                        isActive ? 'bg-slate-950 text-amber-400' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Quick Search in Admin */}
              <div className="relative min-w-[240px]">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filtrar por código ou título..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-400 text-xs text-white rounded-xl py-2 pl-9 pr-3 outline-none"
                />
              </div>

            </div>

            {/* Property Cards List */}
            {filteredProperties.length === 0 ? (
              <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-12 text-center max-w-lg mx-auto space-y-4">
                <div className="w-16 h-16 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto border border-amber-500/30">
                  <Home className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-white">Nenhum imóvel nesta categoria</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Não há imóveis cadastrados para a categoria selecionada ({adminCategory}).
                </p>
                <button
                  type="button"
                  onClick={handleOpenAddProperty}
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-5 py-2.5 rounded-xl text-xs inline-flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  <Plus className="w-4 h-4" />
                  <span>Cadastrar Imóvel em {adminCategory}</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredProperties.map((prop) => {
                  const imgUrl = prop.images?.[0]?.url || 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80';
                  
                  return (
                    <div
                      key={prop.id}
                      className="bg-slate-900 border border-slate-800 hover:border-amber-500/40 rounded-2xl overflow-hidden shadow-lg flex flex-col justify-between transition-all group"
                    >
                      {/* Top Image + Badges */}
                      <div className="relative aspect-[16/10] bg-slate-950 overflow-hidden">
                        <img
                          src={imgUrl}
                          alt={prop.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src =
                              'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80';
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-black/30"></div>

                        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                          <span className="bg-emerald-600 text-white text-[10px] font-extrabold uppercase px-2 py-0.5 rounded shadow">
                            Venda
                          </span>
                          {prop.featured && (
                            <span className="bg-amber-500 text-slate-950 text-[10px] font-bold px-1.5 py-0.5 rounded shadow">
                              Destaque
                            </span>
                          )}
                        </div>

                        <div className="absolute top-2.5 right-2.5 bg-slate-950/90 text-amber-300 font-mono text-xs font-bold px-2 py-0.5 rounded border border-amber-500/30">
                          {prop.code}
                        </div>

                        <div className="absolute bottom-2 left-2.5 text-[11px] text-amber-400 font-semibold flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" />
                          <span>{prop.neighborhood}, Navegantes</span>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                        <div>
                          <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                            {prop.type}
                          </div>
                          <h4 className="text-sm font-bold text-white line-clamp-2 mt-0.5">
                            {prop.title}
                          </h4>
                          <div className="text-lg font-extrabold text-amber-400 mt-2">
                            {formatCurrency(prop.price)}
                          </div>

                          <div className="grid grid-cols-4 gap-1 py-2 mt-2 border-t border-slate-800 text-[10px] text-slate-400 text-center">
                            <div>{prop.bedrooms ?? 0} Qts</div>
                            <div>{prop.bathrooms ?? 0} Banhos</div>
                            <div>{prop.parkingSpots ?? 0} Vagas</div>
                            <div>{prop.areaM2} m²</div>
                          </div>
                        </div>

                        {/* Action buttons on card: Edit and Delete */}
                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800">
                          <button
                            type="button"
                            onClick={() => handleOpenEditProperty(prop)}
                            className="bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-200 text-xs font-bold py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer border border-slate-700 hover:border-amber-400"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Editar</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setPropertyToDelete(prop)}
                            className="bg-red-950/40 hover:bg-red-900/80 text-red-300 hover:text-white text-xs font-bold py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer border border-red-500/30 hover:border-red-500"
                            title="Excluir este imóvel"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Excluir</span>
                          </button>
                        </div>

                      </div>
                    </div>
                  );
                })}
              </div>
            )}

          </div>
        )}

        {/* ============================================================== */}
        {/* ABA: BANNER PRINCIPAL (HERO)                                   */}
        {/* ============================================================== */}
        {activeMainTab === 'hero' && (
          <div className="bg-slate-900 border border-amber-500/20 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="border-b border-slate-800 pb-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <span>Edição do Banner Principal (Hero)</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Altere os textos principais e a imagem de fundo do banner inicial.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
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
                    Dica: A palavra "Navegantes" recebe destaque automático com gradiente dourado.
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

                {/* Vercel Blob Upload for Hero */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-emerald-500/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                      <UploadCloud className="w-4 h-4 text-emerald-400" />
                      <span>Upload para Vercel Blob (Client Upload)</span>
                    </span>
                    <span className="text-[10px] text-slate-400">1920 × 1080 px</span>
                  </div>

                  <label className={`w-full flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-4 cursor-pointer transition-all ${
                    isUploadingHero
                      ? 'border-emerald-500 bg-emerald-950/20'
                      : 'border-slate-700 hover:border-emerald-400 bg-slate-900/50 hover:bg-slate-900'
                  }`}>
                    {isUploadingHero ? (
                      <div className="flex flex-col items-center gap-2 text-center py-2">
                        <Loader2 className="w-6 h-6 text-emerald-400 animate-spin" />
                        <span className="text-xs font-bold text-white">
                          Enviando imagem... {heroProgress}%
                        </span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-1.5 text-center">
                        <UploadCloud className="w-5 h-5 text-emerald-400" />
                        <span className="text-xs font-bold text-emerald-400 hover:underline">
                          Escolher imagem de fundo do banner
                        </span>
                        <span className="text-[10px] text-slate-400">
                          Enviada diretamente para o Vercel Blob
                        </span>
                      </div>
                    )}

                    <input
                      type="file"
                      accept="image/*"
                      disabled={isUploadingHero}
                      onChange={handleHeroFileUpload}
                      className="hidden"
                    />
                  </label>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                      URL da Imagem Atual
                    </label>
                    <input
                      type="url"
                      value={draftHero.bgImageUrl}
                      onChange={(e) => handleHeroChange('bgImageUrl', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 focus:border-amber-400 text-white text-xs font-mono rounded-xl py-2 px-3 outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Preview */}
              <div className="lg:col-span-5 bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block">
                  Pré-visualização do Banner
                </span>
                <div className="relative aspect-[16/9] rounded-xl overflow-hidden bg-slate-900 border border-slate-800 shadow-inner">
                  <img
                    src={draftHero.bgImageUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-slate-950/70 p-4 flex flex-col justify-end text-left">
                    <h3 className="text-sm font-bold text-white line-clamp-2">
                      {draftHero.title}
                    </h3>
                    <p className="text-[10px] text-slate-300 line-clamp-2 mt-1">
                      {draftHero.subtitle}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleSaveAll}
                  className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs py-2.5 rounded-xl shadow-md transition-colors cursor-pointer flex items-center justify-center gap-2"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Salvar Banner</span>
                </button>
              </div>

            </div>
          </div>
        )}

      </main>

      {/* ============================================================== */}
      {/* MODAL: ADICIONAR / EDITAR IMÓVEL                               */}
      {/* ============================================================== */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-60 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-200">
          <div className="relative bg-slate-900 border border-amber-500/40 rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-y-auto shadow-2xl flex flex-col">
            
            {/* Header */}
            <div className="sticky top-0 z-20 bg-slate-950/95 backdrop-blur-md px-6 py-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                  <Home className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">
                    {formMode === 'create' ? 'Adicionar Novo Imóvel' : `Editar Imóvel (${formData.code})`}
                  </h3>
                  <p className="text-xs text-amber-400">Venda exclusiva • Navegantes/SC</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsFormModalOpen(false)}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSavePropertyForm} className="p-6 space-y-4">
              
              {/* Título */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Título do Imóvel *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Ex: Apartamento Frente Mar com Varanda Gourmet"
                  className="w-full bg-slate-950 border border-slate-700 focus:border-amber-400 text-white text-sm rounded-xl py-3 px-3.5 outline-none font-semibold"
                />
              </div>

              {/* Tipo e Bairro */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Tipo de Imóvel *
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
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
                    required
                    value={formData.neighborhood}
                    onChange={(e) => setFormData({ ...formData, neighborhood: e.target.value })}
                    placeholder="Gravatá, Centro, Meia Praia..."
                    className="w-full bg-slate-950 border border-slate-700 focus:border-amber-400 text-white text-sm rounded-xl py-3 px-3.5 outline-none"
                  />
                </div>
              </div>

              {/* Preço e Código */}
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
                      required
                      step="1000"
                      min="0"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-slate-950 border border-slate-700 focus:border-amber-400 text-white text-sm font-bold font-mono rounded-xl py-3 pl-10 pr-3.5 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Código do Imóvel
                  </label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    placeholder="Ex: OE-109"
                    className="w-full bg-slate-950 border border-slate-700 focus:border-amber-400 text-white text-sm font-mono rounded-xl py-3 px-3.5 outline-none"
                  />
                </div>
              </div>

              {/* Quartos, Banheiros, Vagas, Área */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Quartos
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.bedrooms}
                    onChange={(e) => setFormData({ ...formData, bedrooms: parseInt(e.target.value, 10) || 0 })}
                    className="w-full bg-slate-950 border border-slate-700 focus:border-amber-400 text-white text-sm rounded-xl py-2.5 px-3 outline-none text-center font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Banheiros
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.bathrooms}
                    onChange={(e) => setFormData({ ...formData, bathrooms: parseInt(e.target.value, 10) || 0 })}
                    className="w-full bg-slate-950 border border-slate-700 focus:border-amber-400 text-white text-sm rounded-xl py-2.5 px-3 outline-none text-center font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Vagas
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.parkingSpots}
                    onChange={(e) => setFormData({ ...formData, parkingSpots: parseInt(e.target.value, 10) || 0 })}
                    className="w-full bg-slate-950 border border-slate-700 focus:border-amber-400 text-white text-sm rounded-xl py-2.5 px-3 outline-none text-center font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Área (m²) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.areaM2}
                    onChange={(e) => setFormData({ ...formData, areaM2: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-950 border border-slate-700 focus:border-amber-400 text-white text-sm rounded-xl py-2.5 px-3 outline-none text-center font-mono"
                  />
                </div>
              </div>

              {/* URL da Imagem + Upload Vercel Blob */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-emerald-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                    <UploadCloud className="w-4 h-4 text-emerald-400" />
                    <span>Upload da Foto (Vercel Blob)</span>
                  </span>
                  <span className="text-[10px] text-slate-400">Recomendado: 1200 × 800 px</span>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <label className={`flex-1 w-full border-2 border-dashed rounded-xl p-3 text-center cursor-pointer transition-all ${
                    isUploadingFormImg
                      ? 'border-emerald-500 bg-emerald-950/20'
                      : 'border-slate-700 hover:border-emerald-400 bg-slate-900/60 hover:bg-slate-900'
                  }`}>
                    {isUploadingFormImg ? (
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="w-4 h-4 text-emerald-400 animate-spin" />
                        <span className="text-xs text-white font-bold">Enviando... {formImgProgress}%</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-2 text-emerald-400 text-xs font-bold">
                        <UploadCloud className="w-4 h-4" />
                        <span>Clique para enviar foto</span>
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      disabled={isUploadingFormImg}
                      onChange={handleFormImageFileUpload}
                      className="hidden"
                    />
                  </label>

                  {formData.imageUrl && (
                    <div className="w-16 h-12 rounded-xl overflow-hidden bg-slate-800 border border-slate-700 shrink-0">
                      <img src={formData.imageUrl} alt="Thumbnail" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    URL da Imagem (Pública)
                  </label>
                  <input
                    type="url"
                    required
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full bg-slate-900 border border-slate-700 focus:border-amber-400 text-white text-xs font-mono rounded-xl py-2.5 px-3 outline-none"
                  />
                </div>
              </div>

              {/* Checkbox Destaque & Tag */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center pt-1">
                <label className="flex items-center gap-2.5 bg-slate-950 p-3 rounded-xl border border-slate-800 cursor-pointer hover:border-amber-500/40">
                  <input
                    type="checkbox"
                    checked={formData.featured}
                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                    className="w-4 h-4 text-amber-500 rounded focus:ring-amber-400"
                  />
                  <div>
                    <span className="text-xs font-bold text-white block">Marcar como Destaque</span>
                    <span className="text-[10px] text-slate-400">Exibe selo de destaque no card do site</span>
                  </div>
                </label>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Etiqueta / Tag (opcional)
                  </label>
                  <input
                    type="text"
                    value={formData.tag}
                    onChange={(e) => setFormData({ ...formData, tag: e.target.value })}
                    placeholder="Ex: Frente Mar, Com Piscina, Oportunidade"
                    className="w-full bg-slate-950 border border-slate-700 focus:border-amber-400 text-white text-xs rounded-xl py-3 px-3 outline-none"
                  />
                </div>
              </div>

              {/* Descrição */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Descrição Completa do Imóvel
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descreva detalhes como acabamento, proximidade com a praia, etc..."
                  className="w-full bg-slate-950 border border-slate-700 focus:border-amber-400 text-white text-xs rounded-xl py-2.5 px-3.5 outline-none leading-relaxed"
                />
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsFormModalOpen(false)}
                  className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold rounded-xl text-xs sm:text-sm cursor-pointer shadow-lg shadow-amber-500/20"
                >
                  {formMode === 'create' ? 'Cadastrar Imóvel' : 'Salvar Alterações'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: CONFIRMAR EXCLUSÃO DE IMÓVEL                            */}
      {/* ============================================================== */}
      {propertyToDelete && (
        <div className="fixed inset-0 z-60 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-red-500/40 rounded-3xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl">
            <div className="w-14 h-14 rounded-full bg-red-950/80 text-red-400 border border-red-500/40 flex items-center justify-center mx-auto">
              <Trash2 className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-white">Excluir este Imóvel?</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Você está prestes a excluir o imóvel <strong>{propertyToDelete.code}</strong> ({propertyToDelete.title}). Esta ação removerá o imóvel do site.
            </p>
            <div className="flex gap-2.5 justify-center pt-2">
              <button
                type="button"
                onClick={() => setPropertyToDelete(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold cursor-pointer shadow-lg shadow-red-600/30"
              >
                Sim, Excluir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: CONFIRMAR RESTAURAÇÃO DE FÁBRICA                       */}
      {/* ============================================================== */}
      {confirmResetModal && (
        <div className="fixed inset-0 z-60 bg-black/85 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-sm w-full p-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Restaurar Dados Padrão?</h3>
            <p className="text-xs text-slate-300">
              Isso limpará as alterações do localStorage e restaurará a lista e fotos iniciais da Oliveira Elias Exclusive.
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
