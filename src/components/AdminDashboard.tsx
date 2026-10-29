import React, { useState, useEffect } from 'react';
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
  Square,
  FileText,
  ShieldCheck,
  UserCheck,
  Settings
} from 'lucide-react';
import { HeroData, Property, SiteData, AboutData } from '../types';
import { COMPANY_DATA, DEFAULT_ABOUT_DATA } from '../data/properties';
import { formatCurrency } from '../utils/formatters';
import {
  uploadImageToVercelBlob,
  deleteImageFromVercelBlob,
  isVercelBlobUrl
} from '../utils/blobUpload';

interface AdminDashboardProps {
  isOpen: boolean;
  heroData: HeroData;
  aboutData: AboutData;
  properties: Property[];
  onSave: (newHero: HeroData, newProperties: Property[], newAbout: AboutData) => void;
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
  aboutData,
  properties,
  onSave,
  onResetDefaults,
  onClose,
  onLogout
}) => {
  if (!isOpen) return null;

  // Local draft state for edits
  const [draftHero, setDraftHero] = useState<HeroData>({ ...heroData });
  const [draftAbout, setDraftAbout] = useState<AboutData>({ ...aboutData });
  const [draftProperties, setDraftProperties] = useState<Property[]>(
    properties.map((p) => ({ ...p, images: p.images.map((img) => ({ ...img })) }))
  );

  const [activeMainTab, setActiveMainTab] = useState<'manageProperties' | 'hero' | 'about' | 'settings'>('manageProperties');
  const [adminCategory, setAdminCategory] = useState<AdminCategoryFilter>('Todos os Imóveis');
  const [searchTerm, setSearchTerm] = useState('');

  // Toast and Modals
  const [showSavedToast, setShowSavedToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('Alterações salvas com sucesso!');
  const [confirmResetModal, setConfirmResetModal] = useState(false);
  
  // Property to Delete confirmation state (inline and modal)
  const [propertyToDelete, setPropertyToDelete] = useState<Property | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Property Form Modal (Add / Edit)
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [formData, setFormData] = useState<PropertyFormState>(emptyFormState);
  const [formError, setFormError] = useState<string | null>(null);
  const [originalPropertyImage, setOriginalPropertyImage] = useState<string | null>(null);

  // Vercel Blob Upload states
  const [isUploadingHero, setIsUploadingHero] = useState(false);
  const [heroProgress, setHeroProgress] = useState(0);
  const [heroUploadError, setHeroUploadError] = useState<string | null>(null);

  const [isUploadingAboutImg, setIsUploadingAboutImg] = useState(false);
  const [aboutImgProgress, setAboutImgProgress] = useState(0);
  const [aboutImgError, setAboutImgError] = useState<string | null>(null);

  const [isUploadingFormImg, setIsUploadingFormImg] = useState(false);
  const [formImgProgress, setFormImgProgress] = useState(0);
  const [formImgError, setFormImgError] = useState<string | null>(null);

  // Foto da Corretora no Cabeçalho (Header) state (carregada do Upstash Redis via GET /api/configuracoes)
  const [draftFotoHeader, setDraftFotoHeader] = useState<string>(
    aboutData.brokerImageUrl || DEFAULT_ABOUT_DATA.brokerImageUrl
  );
  const [isUploadingHeaderImg, setIsUploadingHeaderImg] = useState(false);
  const [headerImgProgress, setHeaderImgProgress] = useState(0);
  const [headerImgError, setHeaderImgError] = useState<string | null>(null);

  // Vercel Blob token status check from server
  const [isBlobConfigured, setIsBlobConfigured] = useState<boolean | null>(null);

  useEffect(() => {
    fetch('/api/blob/status')
      .then((res) => res.json())
      .then((data) => {
        setIsBlobConfigured(Boolean(data.configured));
      })
      .catch(() => {
        setIsBlobConfigured(false);
      });

    // Carrega as URLs das fotos do cabeçalho e da seção Sobre salvas no banco persistente (Upstash Redis)
    fetch('/api/configuracoes')
      .then((res) => res.json())
      .then((data) => {
        if (data?.fotoCorretoraHeader && typeof data.fotoCorretoraHeader === 'string' && data.fotoCorretoraHeader.trim()) {
          setDraftFotoHeader(data.fotoCorretoraHeader.trim());
        }
        if (data?.fotoSobre && typeof data.fotoSobre === 'string' && data.fotoSobre.trim()) {
          setDraftAbout((prev) => ({ ...prev, brokerImageUrl: data.fotoSobre.trim() }));
        }
      })
      .catch((err) => {
        console.warn('[AdminDashboard] Erro ao carregar fotos da API:', err);
      });
  }, []);

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
    setOriginalPropertyImage(null);
    setFormMode('create');
    setFormImgError(null);
    setFormError(null);
    setIsFormModalOpen(true);
  };

  // Open Form to Edit Existing Property
  const handleOpenEditProperty = (prop: Property) => {
    const currentImg = prop.images?.[0]?.url || '';
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
      imageUrl: currentImg,
      featured: Boolean(prop.featured),
      tag: prop.tag || '',
      description: prop.description
    });
    setOriginalPropertyImage(currentImg);
    setFormMode('edit');
    setFormImgError(null);
    setFormError(null);
    setIsFormModalOpen(true);
  };

  // Handle Form Submission (Add or Update)
  const handleSavePropertyForm = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.title.trim()) {
      setFormError('Por favor insira um título para o imóvel.');
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
      onSave(draftHero, updated, draftAbout);
      setToastMessage(`Imóvel ${newProp.code} cadastrado com sucesso!`);
    } else {
      // Edit existing property: if image changed and previous was on Vercel Blob, delete the old one
      if (originalPropertyImage && isVercelBlobUrl(originalPropertyImage)) {
        const currentUrl = formData.imageUrl.trim();
        if (currentUrl !== originalPropertyImage) {
          deleteImageFromVercelBlob(originalPropertyImage).catch((delErr) => {
            console.warn('[Vercel Blob] Erro ao deletar imagem substituída do imóvel:', delErr);
          });
        }
      }

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
      onSave(draftHero, updated, draftAbout);
      setToastMessage(`Imóvel atualizado com sucesso!`);
    }

    setShowSavedToast(true);
    setTimeout(() => setShowSavedToast(false), 3500);
    setIsFormModalOpen(false);
  };

  // Direct and instantaneous property deletion with permanent Vercel Blob cleanup
  const handleDeleteDirect = (id: string, code?: string) => {
    // 1. Identify and extract Vercel Blob image URLs associated with this property
    const propToDelete = draftProperties.find((p) => p.id === id);
    const blobImagesToDelete: string[] = [];

    if (propToDelete?.images) {
      for (const img of propToDelete.images) {
        if (img.url && isVercelBlobUrl(img.url)) {
          blobImagesToDelete.push(img.url);
        }
      }
    }

    // 2. Call Vercel Blob permanent deletion asynchronously (never blocks UI if network fails)
    if (blobImagesToDelete.length > 0) {
      deleteImageFromVercelBlob(blobImagesToDelete).catch((err) => {
        console.warn('[Vercel Blob] Erro ao excluir imagem(ns) do imóvel no storage:', err);
      });
    }

    // 3. Remove property from state and sync to localStorage
    const updated = draftProperties.filter((p) => p.id !== id);
    setDraftProperties(updated);
    onSave(draftHero, updated, draftAbout);

    setToastMessage(
      blobImagesToDelete.length > 0
        ? `Imóvel ${code ? code : ''} e imagem excluídos permanentemente!`
        : `Imóvel ${code ? code : ''} excluído com sucesso!`
    );
    setShowSavedToast(true);
    setTimeout(() => setShowSavedToast(false), 3500);

    setDeletingId(null);
    setPropertyToDelete(null);
  };

  // Confirm Delete Property from custom modal
  const handleConfirmDelete = () => {
    if (!propertyToDelete) return;
    handleDeleteDirect(propertyToDelete.id, propertyToDelete.code);
  };

  // Upload Property Form Image to Vercel Blob with old image deletion
  const handleFormImageFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const previousImageUrl = formData.imageUrl;

    setIsUploadingFormImg(true);
    setFormImgProgress(0);
    setFormImgError(null);

    try {
      // 1. If previous image was on Vercel Blob, delete it to keep within Hobby free tier
      if (isVercelBlobUrl(previousImageUrl)) {
        deleteImageFromVercelBlob(previousImageUrl).catch((delErr) => {
          console.warn('[Vercel Blob] Aviso ao excluir imagem anterior durante upload de nova foto:', delErr);
        });
      }

      // 2. Upload new image directly to Vercel Blob
      const publicUrl = await uploadImageToVercelBlob(file, 'imoveis', (percent) => {
        setFormImgProgress(percent);
      });

      setFormData((prev) => ({ ...prev, imageUrl: publicUrl }));
      const isCloud = isVercelBlobUrl(publicUrl);
      setToastMessage(
        isCloud
          ? 'Foto enviada com sucesso para o Vercel Blob!'
          : 'Foto carregada com sucesso!'
      );
      setShowSavedToast(true);
      setTimeout(() => setShowSavedToast(false), 3500);
    } catch (err: any) {
      console.error('Erro no upload da foto do imóvel:', err);
      setFormImgError(err?.message || 'Falha no upload da imagem.');
    } finally {
      setIsUploadingFormImg(false);
      e.target.value = '';
    }
  };

  // Upload Hero background to Vercel Blob with old banner deletion
  const handleHeroFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const previousBannerUrl = draftHero.bgImageUrl;

    setIsUploadingHero(true);
    setHeroProgress(0);
    setHeroUploadError(null);

    try {
      // 1. If previous banner was on Vercel Blob, permanently delete it
      if (isVercelBlobUrl(previousBannerUrl)) {
        deleteImageFromVercelBlob(previousBannerUrl).catch((delErr) => {
          console.warn('[Vercel Blob] Erro ao excluir banner antigo do Vercel Blob:', delErr);
        });
      }

      // 2. Upload new banner to Vercel Blob
      const publicUrl = await uploadImageToVercelBlob(file, 'hero', (percent) => {
        setHeroProgress(percent);
      });

      const updatedHero = { ...draftHero, bgImageUrl: publicUrl };
      setDraftHero(updatedHero);
      onSave(updatedHero, draftProperties, draftAbout);

      const isCloud = isVercelBlobUrl(publicUrl);
      setToastMessage(
        isCloud
          ? 'Upload do Banner concluído e salvo no Vercel Blob!'
          : 'Banner atualizado com sucesso!'
      );
      setShowSavedToast(true);
      setTimeout(() => setShowSavedToast(false), 4000);
    } catch (err: any) {
      console.error('Erro no upload Vercel Blob do banner:', err);
      setHeroUploadError(err?.message || 'Falha no upload do banner.');
    } finally {
      setIsUploadingHero(false);
      e.target.value = '';
    }
  };

  const handleHeroChange = (field: keyof HeroData, value: string) => {
    setDraftHero((prev) => ({ ...prev, [field]: value }));
  };

  // Upload Broker Photo to Vercel Blob with permanent deletion of previous image
  const handleAboutFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const previousBrokerImg = draftAbout.brokerImageUrl;

    setIsUploadingAboutImg(true);
    setAboutImgProgress(0);
    setAboutImgError(null);

    try {
      // 1. If previous photo was on Vercel Blob, permanently delete it from storage
      if (isVercelBlobUrl(previousBrokerImg)) {
        deleteImageFromVercelBlob(previousBrokerImg).catch((delErr) => {
          console.warn('[Vercel Blob] Erro ao excluir foto anterior da corretora:', delErr);
        });
      }

      // 2. Upload new photo directly to Vercel Blob
      const publicUrl = await uploadImageToVercelBlob(file, 'sobre', (percent) => {
        setAboutImgProgress(percent);
      });

      const updatedAbout = { ...draftAbout, brokerImageUrl: publicUrl };
      setDraftAbout(updatedAbout);
      onSave(draftHero, draftProperties, updatedAbout);

      // Salva a nova URL no banco de dados persistente (Upstash Redis) via POST /api/configuracoes
      fetch('/api/configuracoes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fotoSobre: publicUrl })
      })
        .then(() => {
          window.dispatchEvent(new CustomEvent('fotoSobreUpdated', { detail: publicUrl }));
        })
        .catch((e) => {
          console.warn('[AdminDashboard] Erro ao sincronizar fotoSobre com o banco de dados:', e);
        });

      const isCloud = isVercelBlobUrl(publicUrl);
      setToastMessage(
        isCloud
          ? 'Foto da corretora enviada para o Vercel Blob e salva no banco de dados!'
          : 'Foto da corretora salva com sucesso no banco de dados Upstash Redis!'
      );
      setShowSavedToast(true);
      setTimeout(() => setShowSavedToast(false), 4000);
    } catch (err: any) {
      console.error('Erro no upload da foto da corretora para Vercel Blob:', err);
      setAboutImgError(err?.message || 'Falha no upload da foto da corretora.');
    } finally {
      setIsUploadingAboutImg(false);
      e.target.value = '';
    }
  };

  // Upload Foto do Cabeçalho (Header) para Vercel Blob com exclusão da foto anterior
  const handleHeaderFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const previousHeaderImg = draftFotoHeader;

    setIsUploadingHeaderImg(true);
    setHeaderImgProgress(0);
    setHeaderImgError(null);

    try {
      // 1. Se a foto anterior estava no Vercel Blob, exclui para preservar a cota Hobby
      if (isVercelBlobUrl(previousHeaderImg)) {
        deleteImageFromVercelBlob(previousHeaderImg).catch((delErr) => {
          console.warn('[Vercel Blob] Erro ao excluir foto anterior do cabeçalho:', delErr);
        });
      }

      // 2. Faz o upload da nova foto para a pasta 'cabecalho'
      const publicUrl = await uploadImageToVercelBlob(file, 'cabecalho', (percent) => {
        setHeaderImgProgress(percent);
      });

      setDraftFotoHeader(publicUrl);

      // 3. Salva a nova URL retornada pelo Vercel Blob no Banco de Dados (POST /api/configuracoes)
      const res = await fetch('/api/configuracoes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ fotoCorretoraHeader: publicUrl })
      });
      const data = await res.json().catch(() => ({}));

      // Dispara evento para atualização imediata no cabeçalho
      window.dispatchEvent(new CustomEvent('fotoCorretoraHeaderUpdated', { detail: publicUrl }));

      const isCloud = isVercelBlobUrl(publicUrl);
      setToastMessage(
        isCloud
          ? 'Foto do cabeçalho enviada para o Vercel Blob e salva no banco de dados Upstash Redis!'
          : 'Foto do cabeçalho salva com sucesso no banco de dados Upstash Redis!'
      );
      setShowSavedToast(true);
      setTimeout(() => setShowSavedToast(false), 4500);
    } catch (err: any) {
      console.error('Erro no upload da foto do cabeçalho para Vercel Blob:', err);
      setHeaderImgError(err?.message || 'Falha no upload da foto do cabeçalho.');
    } finally {
      setIsUploadingHeaderImg(false);
      e.target.value = '';
    }
  };

  const handleAboutChange = (field: keyof AboutData, value: string) => {
    setDraftAbout((prev) => ({ ...prev, [field]: value }));
  };

  // Salva a Foto do Cabeçalho no Banco de Dados persistente (Upstash Redis)
  const handleSaveHeaderSettings = async () => {
    try {
      const res = await fetch('/api/configuracoes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ fotoCorretoraHeader: draftFotoHeader })
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      await res.json();

      // Dispara evento para o Header atualizar imediatamente em tempo real
      window.dispatchEvent(new CustomEvent('fotoCorretoraHeaderUpdated', { detail: draftFotoHeader }));

      setToastMessage('Foto do cabeçalho salva com sucesso no banco de dados Upstash Redis!');
      setShowSavedToast(true);
      setTimeout(() => setShowSavedToast(false), 4500);
    } catch (e: any) {
      console.error('Erro ao salvar foto do cabeçalho no banco de dados:', e);
      setToastMessage('Erro ao salvar no banco de dados. Tente novamente.');
      setShowSavedToast(true);
      setTimeout(() => setShowSavedToast(false), 4500);
    }
  };

  const handleSaveAbout = async () => {
    // If broker photo was on Vercel Blob and was replaced via manual URL input
    if (isVercelBlobUrl(aboutData.brokerImageUrl) && draftAbout.brokerImageUrl !== aboutData.brokerImageUrl) {
      deleteImageFromVercelBlob(aboutData.brokerImageUrl).catch((delErr) => {
        console.warn('[Vercel Blob] Erro ao excluir foto anterior da corretora após salvar:', delErr);
      });
    }

    // Salva a foto da seção Sobre e do cabeçalho no banco de dados persistente via POST /api/configuracoes
    const payload: { fotoSobre?: string; fotoCorretoraHeader?: string } = {};
    if (draftAbout.brokerImageUrl) payload.fotoSobre = draftAbout.brokerImageUrl;
    if (draftFotoHeader) payload.fotoCorretoraHeader = draftFotoHeader;

    if (Object.keys(payload).length > 0) {
      fetch('/api/configuracoes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
        .then(() => {
          if (payload.fotoSobre) {
            window.dispatchEvent(new CustomEvent('fotoSobreUpdated', { detail: payload.fotoSobre }));
          }
          if (payload.fotoCorretoraHeader) {
            window.dispatchEvent(new CustomEvent('fotoCorretoraHeaderUpdated', { detail: payload.fotoCorretoraHeader }));
          }
        })
        .catch((e) => {
          console.warn('[AdminDashboard] Erro ao sincronizar fotos com o banco de dados:', e);
        });
    }

    onSave(draftHero, draftProperties, draftAbout);
    setToastMessage('Seção A Imobiliária salva no banco de dados Upstash Redis!');
    setShowSavedToast(true);
    setTimeout(() => setShowSavedToast(false), 3500);
  };

  const handleSaveAll = async () => {
    // If the banner was replaced with another URL and the original was on Vercel Blob, delete the old one
    if (isVercelBlobUrl(heroData.bgImageUrl) && draftHero.bgImageUrl !== heroData.bgImageUrl) {
      deleteImageFromVercelBlob(heroData.bgImageUrl).catch((delErr) => {
        console.warn('[Vercel Blob] Erro ao excluir banner anterior após salvar:', delErr);
      });
    }

    // If broker photo was replaced with another URL and the original was on Vercel Blob, delete the old one
    if (isVercelBlobUrl(aboutData.brokerImageUrl) && draftAbout.brokerImageUrl !== aboutData.brokerImageUrl) {
      deleteImageFromVercelBlob(aboutData.brokerImageUrl).catch((delErr) => {
        console.warn('[Vercel Blob] Erro ao excluir foto anterior da corretora após salvar:', delErr);
      });
    }

    // Salva as fotos no banco de dados persistente via POST /api/configuracoes
    const payload: { fotoSobre?: string; fotoCorretoraHeader?: string } = {};
    if (draftAbout.brokerImageUrl) payload.fotoSobre = draftAbout.brokerImageUrl;
    if (draftFotoHeader) payload.fotoCorretoraHeader = draftFotoHeader;

    if (Object.keys(payload).length > 0) {
      fetch('/api/configuracoes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
        .then(() => {
          if (payload.fotoSobre) {
            window.dispatchEvent(new CustomEvent('fotoSobreUpdated', { detail: payload.fotoSobre }));
          }
          if (payload.fotoCorretoraHeader) {
            window.dispatchEvent(new CustomEvent('fotoCorretoraHeaderUpdated', { detail: payload.fotoCorretoraHeader }));
          }
        })
        .catch((e) => {
          console.warn('[AdminDashboard] Erro ao sincronizar fotos com o banco de dados:', e);
        });
    }

    onSave(draftHero, draftProperties, draftAbout);
    setToastMessage('Todas as alterações foram salvas com sucesso no banco de dados Upstash Redis!');
    setShowSavedToast(true);
    setTimeout(() => setShowSavedToast(false), 3500);
  };

  const handleConfirmReset = () => {
    onResetDefaults();
    fetch('/api/configuracoes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fotoCorretoraHeader: DEFAULT_ABOUT_DATA.brokerImageUrl,
        fotoSobre: DEFAULT_ABOUT_DATA.brokerImageUrl
      })
    }).catch((e) => console.warn(e));

    window.dispatchEvent(new CustomEvent('fotoCorretoraHeaderUpdated', { detail: DEFAULT_ABOUT_DATA.brokerImageUrl }));
    window.dispatchEvent(new CustomEvent('fotoSobreUpdated', { detail: DEFAULT_ABOUT_DATA.brokerImageUrl }));
    setDraftFotoHeader(DEFAULT_ABOUT_DATA.brokerImageUrl);
    setDraftAbout((prev) => ({ ...prev, brokerImageUrl: DEFAULT_ABOUT_DATA.brokerImageUrl }));
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
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-white text-base">Painel Administrativo</span>
                <span className="text-[10px] uppercase font-extrabold bg-amber-500/20 text-amber-400 border border-amber-500/40 px-2 py-0.5 rounded">
                  Área do Corretor
                </span>
                {isBlobConfigured === true ? (
                  <span className="text-[10px] uppercase font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded flex items-center gap-1.5 shadow-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Vercel Blob Ativo
                  </span>
                ) : isBlobConfigured === false ? (
                  <span
                    className="text-[10px] uppercase font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded flex items-center gap-1.5"
                    title="Defina BLOB_READ_WRITE_TOKEN no .env para upload em nuvem na Vercel"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                    Armazenamento Local
                  </span>
                ) : null}
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

          <button
            type="button"
            onClick={() => setActiveMainTab('about')}
            className={`px-5 sm:px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center gap-2 cursor-pointer ${
              activeMainTab === 'about'
                ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20 scale-102 border border-amber-400'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Seção A Imobiliária (Sobre)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveMainTab('settings')}
            className={`px-5 sm:px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center gap-2 cursor-pointer ${
              activeMainTab === 'settings'
                ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20 scale-102 border border-amber-400'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Configurações do Site</span>
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
                        {deletingId === prop.id ? (
                          <div className="bg-red-950/90 border border-red-500/60 rounded-xl p-2.5 space-y-2 mt-2 animate-in fade-in">
                            <div className="flex items-center gap-1.5 text-red-200 text-xs font-bold">
                              <AlertCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                              <span>Excluir {prop.code}?</span>
                            </div>
                            <p className="text-[11px] text-slate-300 leading-tight">
                              Confirma a exclusão deste imóvel?
                            </p>
                            <div className="grid grid-cols-2 gap-2 pt-1">
                              <button
                                type="button"
                                onClick={() => {
                                  setDeletingId(null);
                                  setPropertyToDelete(null);
                                }}
                                className="px-2 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg transition-colors cursor-pointer text-center"
                              >
                                Cancelar
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteDirect(prop.id, prop.code)}
                                className="px-2 py-1.5 bg-red-600 hover:bg-red-500 text-white text-xs font-extrabold rounded-lg transition-colors cursor-pointer shadow-lg shadow-red-600/30 flex items-center justify-center gap-1 text-center"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Sim, Excluir</span>
                              </button>
                            </div>
                          </div>
                        ) : (
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
                              onClick={() => {
                                setDeletingId(prop.id);
                                setPropertyToDelete(prop);
                              }}
                              className="bg-red-950/40 hover:bg-red-900/80 text-red-300 hover:text-white text-xs font-bold py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer border border-red-500/30 hover:border-red-500"
                              title="Excluir este imóvel"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Excluir</span>
                            </button>
                          </div>
                        )}

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

        {/* ============================================================== */}
        {/* ABA: SEÇÃO A IMOBILIÁRIA (SOBRE)                               */}
        {/* ============================================================== */}
        {activeMainTab === 'about' && (
          <div className="bg-slate-900 border border-amber-500/25 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
            
            <div className="border-b border-slate-800 pb-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider mb-2">
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  <span>Conteúdo Institucional</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-white">
                  Seção A Imobiliária (Sobre)
                </h2>
                <p className="text-xs sm:text-sm text-slate-400 mt-1">
                  Altere a foto oficial da corretora e personalize os textos descritivos institucionais que aparecem na página inicial.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleSaveAbout}
                  className="bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 font-extrabold text-xs sm:text-sm px-5 py-2.5 rounded-xl shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
                >
                  <Save className="w-4 h-4" />
                  <span>Salvar Seção A Imobiliária</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Form Fields: Photo Upload and Paragraphs */}
              <div className="lg:col-span-7 space-y-6">
                
                {/* 1. Foto da Corretora no Cabeçalho (Header) */}
                <div className="p-5 rounded-2xl bg-slate-950 border-2 border-amber-500/40 shadow-xl space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <label className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                      <UserCheck className="w-4 h-4 text-amber-400" />
                      <span>Foto da Corretora no Cabeçalho (Header)</span>
                    </label>

                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/40 text-[11px] font-bold text-emerald-300">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                      <span>Banco de Dados Persistente</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    Esta foto aparece no cabeçalho fixo no topo de todas as páginas, posicionada ao lado esquerdo da logo oficial da imobiliária. A foto é salva no <strong>Banco de Dados</strong> (Vercel KV / persistente) através da API <code className="text-amber-400 font-mono text-[11px]">/api/configuracoes</code>, visível para todos os visitantes em qualquer dispositivo.
                  </p>

                  {/* Prévia ao vivo do Cabeçalho */}
                  <div className="bg-slate-900/90 p-3.5 rounded-xl border border-slate-800">
                    <span className="text-[10px] font-bold uppercase text-amber-400/90 tracking-wider block mb-2">
                      Prévia do Cabeçalho (Ao Vivo):
                    </span>
                    <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800/80 flex items-center justify-center">
                      <div className="bg-white/95 rounded-2xl px-3 py-2 shadow-md border border-amber-400/50 flex items-center gap-3">
                        <img
                          src={draftFotoHeader}
                          alt="Prévia Foto Corretora no Cabeçalho"
                          className="h-11 w-11 sm:h-12 sm:w-12 rounded-lg object-cover object-top border border-amber-400/40 shadow-sm shrink-0"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = DEFAULT_ABOUT_DATA.brokerImageUrl;
                          }}
                        />
                        <img
                          src="/logo-oliveira-elias.png"
                          alt="Logo Oficial"
                          className="logo-animada inline-block h-9 sm:h-10 w-auto object-contain max-w-[180px] sm:max-w-[240px]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Vercel Blob Upload Zone para Cabeçalho */}
                  <label className={`w-full flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-4 cursor-pointer transition-all ${
                    isUploadingHeaderImg
                      ? 'border-emerald-500 bg-emerald-950/20'
                      : 'border-slate-700 hover:border-amber-400 bg-slate-900/50 hover:bg-slate-900'
                  }`}>
                    {isUploadingHeaderImg ? (
                      <div className="flex flex-col items-center gap-2 text-center py-2">
                        <Loader2 className="w-6 h-6 text-emerald-400 animate-spin" />
                        <span className="text-xs font-bold text-white">
                          Enviando foto para Vercel Blob... {headerImgProgress}%
                        </span>
                        <span className="text-[10px] text-slate-400">
                          A imagem anterior será excluída permanentemente para preservar a cota.
                        </span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-center">
                        <div className="w-9 h-9 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center">
                          <UploadCloud className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-xs font-bold text-amber-400 hover:underline">
                            Clique para selecionar nova foto para o Cabeçalho
                          </span>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            Upload direto para o Vercel Blob (JPG, PNG ou WebP)
                          </p>
                        </div>
                      </div>
                    )}

                    <input
                      type="file"
                      accept="image/*"
                      disabled={isUploadingHeaderImg}
                      onChange={handleHeaderFileUpload}
                      className="hidden"
                    />
                  </label>

                  {headerImgError && (
                    <div className="p-3 bg-red-950/50 border border-red-500/40 rounded-xl text-xs text-red-300 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                      <span>{headerImgError}</span>
                    </div>
                  )}

                  {/* Manual URL Input */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                      URL da Foto do Cabeçalho (Corretora)
                    </label>
                    <input
                      type="text"
                      value={draftFotoHeader}
                      onChange={(e) => setDraftFotoHeader(e.target.value)}
                      placeholder="Cole aqui a URL da imagem (https://...)"
                      className="w-full bg-slate-900 border border-slate-700 focus:border-amber-400 text-white text-xs sm:text-sm font-mono rounded-xl py-2.5 px-3 outline-none"
                    />
                    <div className="flex flex-wrap gap-2 mt-2">
                      <button
                        type="button"
                        onClick={() => setDraftFotoHeader(draftAbout.brokerImageUrl)}
                        className="text-[11px] text-amber-400 hover:text-amber-300 bg-slate-900 hover:bg-slate-800 border border-slate-700 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                      >
                        Usar mesma foto da seção Sobre
                      </button>
                      <button
                        type="button"
                        onClick={() => setDraftFotoHeader(DEFAULT_ABOUT_DATA.brokerImageUrl)}
                        className="text-[11px] text-slate-400 hover:text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-700 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                      >
                        Restaurar foto padrão
                      </button>
                    </div>
                  </div>
                </div>

                {/* 2. Foto da Corretora (Seção Sobre / A Imobiliária) */}
                <div className="p-5 rounded-2xl bg-slate-950 border border-amber-500/30 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <label className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                      <UserCheck className="w-4 h-4 text-amber-400" />
                      <span>Foto da Corretora (Seção Sobre / A Imobiliária) *</span>
                    </label>

                    {/* Aviso de Tamanho Recomendado (visível no painel administrativo) */}
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/15 border border-amber-500/40 text-[11px] font-bold text-amber-300">
                      <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                      <span>Tamanho Recomendado: 800 × 1000 px</span>
                    </div>
                  </div>

                  {/* Vercel Blob Upload Zone */}
                  <label className={`w-full flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-5 cursor-pointer transition-all ${
                    isUploadingAboutImg
                      ? 'border-emerald-500 bg-emerald-950/20'
                      : 'border-slate-700 hover:border-amber-400 bg-slate-900/50 hover:bg-slate-900'
                  }`}>
                    {isUploadingAboutImg ? (
                      <div className="flex flex-col items-center gap-2 text-center py-2">
                        <Loader2 className="w-6 h-6 text-emerald-400 animate-spin" />
                        <span className="text-xs font-bold text-white">
                          Enviando foto para Vercel Blob... {aboutImgProgress}%
                        </span>
                        <span className="text-[10px] text-slate-400">
                          A imagem anterior será excluída permanentemente para preservar a cota.
                        </span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-center">
                        <div className="w-10 h-10 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center">
                          <UploadCloud className="w-5 h-5" />
                        </div>
                        <div>
                          <span className="text-xs font-bold text-amber-400 hover:underline">
                            Clique para selecionar a foto da corretora
                          </span>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            Upload direto para o Vercel Blob (JPG, PNG ou WebP até 50MB)
                          </p>
                        </div>
                      </div>
                    )}

                    <input
                      type="file"
                      accept="image/*"
                      disabled={isUploadingAboutImg}
                      onChange={handleAboutFileUpload}
                      className="hidden"
                    />
                  </label>

                  {aboutImgError && (
                    <div className="p-3 bg-red-950/50 border border-red-500/40 rounded-xl text-xs text-red-300 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                      <span>{aboutImgError}</span>
                    </div>
                  )}

                  {/* Manual URL input */}
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                      Ou digite / cole a URL da Imagem
                    </label>
                    <input
                      type="url"
                      value={draftAbout.brokerImageUrl}
                      onChange={(e) => handleAboutChange('brokerImageUrl', e.target.value)}
                      placeholder="https://..."
                      className="w-full bg-slate-900 border border-slate-700 focus:border-amber-400 text-white text-xs font-mono rounded-xl py-2.5 px-3 outline-none"
                    />
                    <p className="text-[10px] text-slate-500 mt-1">
                      Ao trocar a foto, fotos antigas hospedadas no Vercel Blob são excluídas automaticamente para manter o plano gratuito.
                    </p>
                  </div>
                </div>

                {/* 2. Primeiro Parágrafo */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-amber-400" />
                      <span>Primeiro Parágrafo (Apresentação e Liderança) *</span>
                    </label>
                    <span className="text-[10px] text-slate-400">Texto inicial</span>
                  </div>
                  <textarea
                    rows={5}
                    value={draftAbout.paragraph1}
                    onChange={(e) => handleAboutChange('paragraph1', e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 focus:border-amber-400 text-white text-sm rounded-xl py-3 px-4 outline-none leading-relaxed"
                    placeholder="A Oliveira Elias Exclusive é uma empresa especializada em consultoria e negócios imobiliários sediada na cidade de Navegantes – SC..."
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Começa com a apresentação da empresa: &quot;A Oliveira Elias Exclusive é uma empresa especializada em consultoria...&quot;
                  </p>
                </div>

                {/* 3. Segundo Parágrafo */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-amber-400" />
                      <span>Segundo Parágrafo (Foco Exclusivo em Venda) *</span>
                    </label>
                    <span className="text-[10px] text-slate-400">Diferencial</span>
                  </div>
                  <textarea
                    rows={4}
                    value={draftAbout.paragraph2}
                    onChange={(e) => handleAboutChange('paragraph2', e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 focus:border-amber-400 text-white text-sm rounded-xl py-3 px-4 outline-none leading-relaxed"
                    placeholder="Com atuação exclusiva no segmento de VENDA de imóveis residenciais e comerciais, não trabalhamos com locação..."
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Começa com o posicionamento exclusivo de vendas: &quot;Com atuação exclusiva no segmento de VENDA...&quot;
                  </p>
                </div>

              </div>

              {/* Preview Column */}
              <div className="lg:col-span-5 bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4 sticky top-24">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5 text-amber-400" />
                    <span>Pré-visualização da Seção</span>
                  </span>
                  <span className="text-[10px] text-slate-400">Como aparece no site</span>
                </div>

                {/* Card preview with broker image and credential badge */}
                <div className="relative rounded-2xl overflow-hidden shadow-2xl border-2 border-slate-800 bg-slate-900">
                  <div className="aspect-[4/5] w-full overflow-hidden">
                    <img
                      src={draftAbout.brokerImageUrl}
                      alt="Pré-visualização da Corretora"
                      className="w-full h-full object-cover object-top"
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-transparent to-transparent pointer-events-none"></div>

                  {/* Dark Credential Badge (exactly like the site) */}
                  <div className="absolute bottom-3 left-3 right-3 bg-slate-900/95 backdrop-blur-md p-3.5 rounded-xl border border-amber-500/30 text-white shadow-xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-sm text-white">{COMPANY_DATA.broker}</h4>
                        <p className="text-[11px] text-amber-400 font-semibold">{COMPANY_DATA.creci}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{COMPANY_DATA.tradeName}</p>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400">
                        <UserCheck className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Live Text Preview */}
                <div className="bg-slate-900/70 p-4 rounded-xl border border-slate-800 space-y-2 text-xs text-slate-300">
                  <span className="text-[10px] font-bold uppercase text-amber-400/80 tracking-wider block">
                    Prévia dos Textos
                  </span>
                  <p className="line-clamp-3 leading-relaxed text-slate-300">
                    {draftAbout.paragraph1 || 'Sem primeiro parágrafo preenchido.'}
                  </p>
                  <p className="line-clamp-2 leading-relaxed text-slate-400">
                    {draftAbout.paragraph2 || 'Sem segundo parágrafo preenchido.'}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleSaveAbout}
                  className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs py-3 rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95"
                >
                  <Save className="w-4 h-4" />
                  <span>Salvar Alterações (Cabeçalho & Sobre)</span>
                </button>
              </div>

            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* ABA: CONFIGURAÇÕES DO SITE (CABEÇALHO & IDENTIDADE)             */}
        {/* ============================================================== */}
        {activeMainTab === 'settings' && (
          <div className="bg-slate-900 border border-amber-500/25 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
            
            <div className="border-b border-slate-800 pb-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider mb-2">
                  <Settings className="w-4 h-4 text-amber-400" />
                  <span>Configurações Globais</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-white">
                  Configurações do Site
                </h2>
                <p className="text-xs sm:text-sm text-slate-400 mt-1">
                  Gerencie elementos visuais do site, incluindo a foto da corretora que acompanha a logo no cabeçalho fixo.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleSaveHeaderSettings}
                  className="bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 font-extrabold text-xs sm:text-sm px-6 py-2.5 rounded-xl shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
                >
                  <Save className="w-4 h-4" />
                  <span>Salvar Alterações</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Left Column: Form Controls */}
              <div className="lg:col-span-7 space-y-6">
                
                {/* Form Card for Header Broker Photo */}
                <div className="p-6 rounded-2xl bg-slate-950 border-2 border-amber-500/40 shadow-xl space-y-5">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                    <label className="text-sm font-bold text-white flex items-center gap-2">
                      <UserCheck className="w-4 h-4 text-amber-400" />
                      <span>URL da Foto do Cabeçalho (Corretora)</span>
                    </label>

                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/40 text-[11px] font-bold text-emerald-300">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                      <span>Banco de Dados Persistente</span>
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    Esta foto é exibida no cabeçalho fixo no topo de todas as páginas, posicionada diretamente ao lado da logo oficial da imobiliária. O valor é salvo no <strong>Banco de Dados</strong> (Vercel KV / persistente) através da rota <code className="text-amber-400 font-mono text-xs font-bold">/api/configuracoes</code>, visível publicamente para qualquer visitante em qualquer dispositivo.
                  </p>

                  {/* Input field strictly formatted as requested: label + <input type="text"> */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                      URL da Foto do Cabeçalho (Corretora)
                    </label>
                    <input
                      type="text"
                      value={draftFotoHeader}
                      onChange={(e) => setDraftFotoHeader(e.target.value)}
                      placeholder="Cole aqui a URL da imagem (https://...)"
                      className="w-full bg-slate-900 border border-slate-700 focus:border-amber-400 text-white text-xs sm:text-sm font-mono rounded-xl py-3 px-3.5 outline-none transition-colors"
                    />
                    <div className="flex flex-wrap items-center gap-2 mt-2.5">
                      <button
                        type="button"
                        onClick={() => setDraftFotoHeader(draftAbout.brokerImageUrl)}
                        className="text-xs text-amber-400 hover:text-amber-300 bg-slate-900 hover:bg-slate-800 border border-slate-700 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                      >
                        Usar mesma foto da seção Sobre
                      </button>
                      <button
                        type="button"
                        onClick={() => setDraftFotoHeader(DEFAULT_ABOUT_DATA.brokerImageUrl)}
                        className="text-xs text-slate-400 hover:text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-700 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                      >
                        Restaurar foto padrão
                      </button>
                    </div>
                  </div>

                  {/* Upload via Vercel Blob option */}
                  <div className="pt-2 border-t border-slate-800/80">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                      Ou faça o upload de uma nova foto (Vercel Blob):
                    </span>

                    <label className={`w-full flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-4 cursor-pointer transition-all ${
                      isUploadingHeaderImg
                        ? 'border-emerald-500 bg-emerald-950/20'
                        : 'border-slate-700 hover:border-amber-400 bg-slate-900/50 hover:bg-slate-900'
                    }`}>
                      {isUploadingHeaderImg ? (
                        <div className="flex flex-col items-center gap-2 text-center py-2">
                          <Loader2 className="w-6 h-6 text-emerald-400 animate-spin" />
                          <span className="text-xs font-bold text-white">
                            Enviando foto para Vercel Blob... {headerImgProgress}%
                          </span>
                          <span className="text-[10px] text-slate-400">
                            A foto antiga será excluída do storage para preservar a cota.
                          </span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-2 text-center">
                          <div className="w-8 h-8 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center">
                            <UploadCloud className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="text-xs font-bold text-amber-400 hover:underline">
                              Clique para selecionar foto do seu dispositivo
                            </span>
                            <p className="text-[11px] text-slate-400 mt-0.5">
                              Upload automático para Vercel Blob (JPG, PNG ou WebP)
                            </p>
                          </div>
                        </div>
                      )}

                      <input
                        type="file"
                        accept="image/*"
                        disabled={isUploadingHeaderImg}
                        onChange={handleHeaderFileUpload}
                        className="hidden"
                      />
                    </label>

                    {headerImgError && (
                      <div className="mt-3 p-3 bg-red-950/50 border border-red-500/40 rounded-xl text-xs text-red-300 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                        <span>{headerImgError}</span>
                      </div>
                    )}
                  </div>

                  {/* Save Button inside card */}
                  <div className="pt-3 border-t border-slate-800 flex justify-end">
                    <button
                      type="button"
                      onClick={handleSaveHeaderSettings}
                      className="w-full sm:w-auto bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 font-extrabold text-xs sm:text-sm px-6 py-3 rounded-xl shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
                    >
                      <Save className="w-4 h-4" />
                      <span>Salvar Alterações</span>
                    </button>
                  </div>

                </div>

              </div>

              {/* Right Column: Live Interactive Preview */}
              <div className="lg:col-span-5 bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4 sticky top-24">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Eye className="w-4 h-4 text-amber-400" />
                    <span>Pré-visualização do Cabeçalho</span>
                  </span>
                  <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    Ao Vivo
                  </span>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed">
                  Veja exatamente como a foto da corretora e a logo da Oliveira Elias Exclusive são exibidas no topo do site:
                </p>

                {/* Simulated Header Bar */}
                <div className="bg-slate-950 border border-amber-500/30 rounded-2xl p-5 shadow-2xl relative overflow-hidden">
                  <div className="text-[10px] font-bold uppercase text-slate-400 mb-2 flex items-center justify-between">
                    <span>Simulação do Header Fixo</span>
                    <span className="text-amber-400">Escala Real</span>
                  </div>

                  <div className="flex items-center justify-center py-4 bg-gradient-to-b from-slate-900 to-slate-950 rounded-xl border border-slate-800">
                    {/* White Brand Box identical to the actual site */}
                    <div className="bg-white/95 rounded-2xl px-3 py-2 shadow-md border border-amber-400/50 flex items-center gap-3">
                      <img
                        src={draftFotoHeader}
                        alt="Foto da Corretora"
                        className="h-12 w-12 rounded-lg object-cover object-top border border-amber-400/40 shadow-sm shrink-0"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = DEFAULT_ABOUT_DATA.brokerImageUrl;
                        }}
                      />
                      <img
                        src="/logo-oliveira-elias.png"
                        alt="Logo Oliveira Elias"
                        className="logo-animada inline-block h-10 w-auto object-contain max-w-[200px]"
                      />
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-800/80 text-[11px] text-slate-400 space-y-1">
                    <p className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Sincronização imediata no site</span>
                    </p>
                    <p className="text-slate-400">
                      Armazenamento: <code className="text-amber-300 font-mono">Banco de Dados (Vercel KV / Persistente)</code>
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleSaveHeaderSettings}
                  className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs py-3 rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95"
                >
                  <Save className="w-4 h-4" />
                  <span>Salvar Alterações</span>
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
              {formError && (
                <div className="p-3 bg-red-950/80 border border-red-500/50 rounded-xl text-red-200 text-xs flex items-center gap-2 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}
              
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
              <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-3">
                {formMode === 'edit' && formData.id ? (
                  <button
                    type="button"
                    onClick={() => {
                      const prop = draftProperties.find((p) => p.id === formData.id);
                      if (prop) {
                        setIsFormModalOpen(false);
                        setPropertyToDelete(prop);
                        setDeletingId(prop.id);
                      }
                    }}
                    className="px-3.5 py-2.5 bg-red-950/60 hover:bg-red-900/80 text-red-300 hover:text-white rounded-xl text-xs font-bold border border-red-500/40 cursor-pointer flex items-center gap-1.5 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Excluir Imóvel</span>
                  </button>
                ) : (
                  <div />
                )}

                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => setIsFormModalOpen(false)}
                    className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold cursor-pointer transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold rounded-xl text-xs sm:text-sm cursor-pointer shadow-lg shadow-amber-500/20 transition-all"
                  >
                    {formMode === 'create' ? 'Cadastrar Imóvel' : 'Salvar Alterações'}
                  </button>
                </div>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL CUSTOMIZADO: CONFIRMAR EXCLUSÃO DE IMÓVEL               */}
      {/* ============================================================== */}
      {propertyToDelete && (
        <div
          className="fixed inset-0 z-[100] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => {
            setPropertyToDelete(null);
            setDeletingId(null);
          }}
        >
          <div
            className="bg-slate-900 border border-red-500/50 rounded-3xl max-w-sm sm:max-w-md w-full p-6 text-center space-y-4 shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => {
                setPropertyToDelete(null);
                setDeletingId(null);
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Fechar"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-14 h-14 rounded-full bg-red-950/80 text-red-400 border border-red-500/40 flex items-center justify-center mx-auto shadow-inner">
              <Trash2 className="w-7 h-7" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-white">Excluir este Imóvel?</h3>
              <p className="text-amber-400 text-xs font-mono font-bold mt-0.5">
                Código: {propertyToDelete.code} • {propertyToDelete.type}
              </p>
            </div>

            <div className="bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800 text-left text-xs text-slate-300 space-y-1.5">
              <p className="font-semibold text-white truncate">
                {propertyToDelete.title}
              </p>
              <p className="text-slate-400 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-amber-400" />
                <span>Bairro {propertyToDelete.neighborhood}, Navegantes</span>
              </p>
              <p className="text-red-400 font-semibold pt-1 border-t border-slate-800/80">
                Esta ação removerá o imóvel imediatamente do site e salvará as alterações no navegador.
              </p>
            </div>

            <div className="flex gap-2.5 justify-end pt-2">
              <button
                type="button"
                onClick={() => {
                  setPropertyToDelete(null);
                  setDeletingId(null);
                }}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold cursor-pointer transition-colors"
              >
                Cancelar (Não)
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold cursor-pointer shadow-lg shadow-red-600/30 transition-all flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Sim, Excluir Imóvel</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: CONFIRMAR RESTAURAÇÃO DE FÁBRICA                       */}
      {/* ============================================================== */}
      {confirmResetModal && (
        <div
          className="fixed inset-0 z-[100] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setConfirmResetModal(false)}
        >
          <div
            className="bg-slate-900 border border-slate-700 rounded-2xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
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
