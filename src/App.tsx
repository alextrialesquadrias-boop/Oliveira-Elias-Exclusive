/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Settings, ShieldCheck, LogOut, Lock } from 'lucide-react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { AboutSection } from './components/AboutSection';
import { FeaturedProperties } from './components/FeaturedProperties';
import { CtaSection } from './components/CtaSection';
import { LocationSection } from './components/LocationSection';
import { Footer } from './components/Footer';
import { FloatingWhatsApp } from './components/FloatingWhatsApp';
import { PropertyModal } from './components/PropertyModal';
import { NegotiateModal } from './components/NegotiateModal';
import { ContactModal } from './components/ContactModal';
import { PrivacyPolicyModal } from './components/PrivacyPolicyModal';
import { AdminLoginModal } from './components/AdminLoginModal';
import { AdminDashboard } from './components/AdminDashboard';
import {
  PROPERTIES_DATA,
  DEFAULT_HERO_DATA,
  DEFAULT_ABOUT_DATA,
  STORAGE_KEY,
  AUTH_STORAGE_KEY
} from './data/properties';
import { Property, SearchFilter, HeroData, AboutData, SiteData } from './types';

export default function App() {
  // Load initial customized site data from localStorage (or fallback to defaults)
  const [siteData, setSiteData] = useState<SiteData>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.hero && Array.isArray(parsed.properties) && parsed.properties.length > 0) {
          return {
            hero: parsed.hero,
            about: parsed.about || DEFAULT_ABOUT_DATA,
            properties: parsed.properties
          };
        }
      }
    } catch (e) {
      console.warn('Erro ao carregar dados do localStorage:', e);
    }
    return {
      hero: DEFAULT_HERO_DATA,
      about: DEFAULT_ABOUT_DATA,
      properties: PROPERTIES_DATA
    };
  });

  // Admin authentication state
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(() => {
    try {
      return localStorage.getItem(AUTH_STORAGE_KEY) === 'true';
    } catch {
      return false;
    }
  });

  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [isAdminDashboardOpen, setIsAdminDashboardOpen] = useState(false);

  // Search state
  const [filter, setFilter] = useState<SearchFilter>({
    code: '',
    city: 'Navegantes',
    type: '',
    priceRange: ''
  });

  // Modal states
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [isNegotiateOpen, setIsNegotiateOpen] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);

  const handleFilterChange = (newValues: Partial<SearchFilter>) => {
    setFilter((prev) => ({ ...prev, ...newValues }));
  };

  const handleSearchSubmit = () => {
    const el = document.getElementById('imoveis');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleClearFilters = () => {
    setFilter({
      code: '',
      city: 'Navegantes',
      type: '',
      priceRange: ''
    });
  };

  const handleNavigate = (sectionId: string) => {
    const target = document.getElementById(sectionId);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Admin handlers
  const handleOpenAdmin = () => {
    if (isAdminLoggedIn) {
      setIsAdminDashboardOpen(true);
    } else {
      setIsAdminLoginOpen(true);
    }
  };

  const handleLoginSuccess = () => {
    try {
      localStorage.setItem(AUTH_STORAGE_KEY, 'true');
    } catch (e) {
      console.warn(e);
    }
    setIsAdminLoggedIn(true);
    setIsAdminLoginOpen(false);
    setIsAdminDashboardOpen(true);
  };

  const handleSaveSiteData = (newHero: HeroData, newProperties: Property[], newAbout: AboutData) => {
    const newData: SiteData = {
      hero: newHero,
      about: newAbout,
      properties: newProperties
    };
    setSiteData(newData);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
    } catch (e) {
      console.warn('Erro ao salvar no localStorage:', e);
    }
  };

  const handleResetDefaults = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      fetch('/api/configuracoes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fotoCorretoraHeader: DEFAULT_ABOUT_DATA.brokerImageUrl })
      }).catch((e) => console.warn(e));
      window.dispatchEvent(new CustomEvent('fotoCorretoraHeaderUpdated', { detail: DEFAULT_ABOUT_DATA.brokerImageUrl }));
      window.dispatchEvent(new Event('storage'));
    } catch (e) {
      console.warn(e);
    }
    const defaultData: SiteData = {
      hero: DEFAULT_HERO_DATA,
      about: DEFAULT_ABOUT_DATA,
      properties: PROPERTIES_DATA
    };
    setSiteData(defaultData);
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    } catch (e) {
      console.warn(e);
    }
    setIsAdminLoggedIn(false);
    setIsAdminDashboardOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      
      {/* Discreet Admin Top Bar when logged in */}
      {isAdminLoggedIn && (
        <div className="sticky top-0 z-50 bg-amber-500 text-slate-950 px-4 py-1.5 text-xs font-bold flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-slate-950 animate-pulse"></span>
            <span>Painel do Corretor Ativo • Oliveira Elias Exclusive</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsAdminDashboardOpen(true)}
              className="bg-slate-950 text-amber-400 hover:text-white px-3 py-1 rounded-lg text-[11px] font-extrabold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Editar Conteúdo</span>
            </button>
            <button
              onClick={handleLogout}
              className="text-slate-950 hover:text-red-900 text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sair</span>
            </button>
          </div>
        </div>
      )}

      {/* 1. Cabeçalho Fixo com Foto da Corretora Dinâmica e Logo */}
      <Header
        onNavigate={handleNavigate}
        brokerImageUrl={siteData.about.brokerImageUrl}
      />

      <main className="flex-grow">
        {/* 2. Banner Principal (Hero) com Busca e Conteúdo Dinâmico */}
        <Hero
          heroData={siteData.hero}
          filter={filter}
          onFilterChange={handleFilterChange}
          onSearch={handleSearchSubmit}
        />

        {/* 3. Seção "A Imobiliária" */}
        <AboutSection aboutData={siteData.about} />

        {/* 4. Grade de Imóveis em Destaque (Cards Dinâmicos Editáveis) */}
        <FeaturedProperties
          properties={siteData.properties}
          searchFilter={filter}
          onSelectProperty={(prop) => setSelectedProperty(prop)}
          onClearFilters={handleClearFilters}
        />

        {/* 5. Dois Cards CTA: Negocie seu Imóvel e Atendimento Personalizado */}
        <CtaSection
          onOpenNegotiate={() => setIsNegotiateOpen(true)}
          onOpenPersonalizedSupport={() => setIsContactOpen(true)}
        />

        {/* 6. Seção de Localização (Endereço, 24h, Telefone e Iframe Google Maps) */}
        <LocationSection />
      </main>

      {/* 7. Rodapé com Link Oculto "Acesso Restrito" */}
      <Footer
        onOpenPrivacyPolicy={() => setIsPrivacyOpen(true)}
        onOpenContact={() => setIsContactOpen(true)}
        onOpenAdmin={handleOpenAdmin}
        onNavigate={handleNavigate}
      />

      {/* Botão Flutuante de WhatsApp */}
      <FloatingWhatsApp />

      {/* Interactive Modals */}
      <PropertyModal
        property={selectedProperty}
        onClose={() => setSelectedProperty(null)}
      />

      <NegotiateModal
        isOpen={isNegotiateOpen}
        onClose={() => setIsNegotiateOpen(false)}
      />

      <ContactModal
        isOpen={isContactOpen}
        onClose={() => setIsContactOpen(false)}
      />

      <PrivacyPolicyModal
        isOpen={isPrivacyOpen}
        onClose={() => setIsPrivacyOpen(false)}
      />

      {/* Admin Login Modal (Acesso Restrito) */}
      <AdminLoginModal
        isOpen={isAdminLoginOpen}
        onClose={() => setIsAdminLoginOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* Admin Dashboard (Painel de Edição) */}
      <AdminDashboard
        isOpen={isAdminDashboardOpen}
        heroData={siteData.hero}
        aboutData={siteData.about}
        properties={siteData.properties}
        onSave={handleSaveSiteData}
        onResetDefaults={handleResetDefaults}
        onClose={() => setIsAdminDashboardOpen(false)}
        onLogout={handleLogout}
      />

    </div>
  );
}
