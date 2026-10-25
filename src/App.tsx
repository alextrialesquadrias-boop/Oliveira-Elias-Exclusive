/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
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
import { PROPERTIES_DATA } from './data/properties';
import { Property, SearchFilter } from './types';

export default function App() {
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

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      
      {/* 1. Cabeçalho Fixo */}
      <Header onNavigate={handleNavigate} />

      <main className="flex-grow">
        {/* 2. Banner Principal (Hero) com Busca */}
        <Hero
          filter={filter}
          onFilterChange={handleFilterChange}
          onSearch={handleSearchSubmit}
        />

        {/* 3. Seção "A Imobiliária" */}
        <AboutSection />

        {/* 4. Grade de Imóveis em Destaque */}
        <FeaturedProperties
          properties={PROPERTIES_DATA}
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

      {/* 7. Rodapé */}
      <Footer
        onOpenPrivacyPolicy={() => setIsPrivacyOpen(true)}
        onOpenContact={() => setIsContactOpen(true)}
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

    </div>
  );
}
