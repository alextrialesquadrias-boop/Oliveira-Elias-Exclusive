import React, { useState } from 'react';
import { X, BedDouble, Bath, Car, Maximize2, MapPin, MessageCircle, Check, ChevronLeft, ChevronRight, Share2, ShieldCheck, Tag } from 'lucide-react';
import { Property } from '../types';
import { COMPANY_DATA } from '../data/properties';
import { formatCurrency } from '../utils/formatters';

interface PropertyModalProps {
  property: Property | null;
  onClose: () => void;
}

export const PropertyModal: React.FC<PropertyModalProps> = ({ property, onClose }) => {
  if (!property) return null;

  const [activeImgIndex, setActiveImgIndex] = useState(0);
  const [copiedLink, setCopiedLink] = useState(false);

  const activeImage = property.images[activeImgIndex] || property.images[0];

  const handleNext = () => {
    setActiveImgIndex((prev) => (prev + 1) % property.images.length);
  };

  const handlePrev = () => {
    setActiveImgIndex((prev) => (prev - 1 + property.images.length) % property.images.length);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const waMessage = encodeURIComponent(
    `Olá Daniela! Tenho interesse no imóvel cód. ${property.code} (${property.title} em ${property.neighborhood}, Navegantes) no valor de ${formatCurrency(property.price)}. Poderia me passar mais informações?`
  );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 md:p-6 animate-in fade-in duration-200">
      
      {/* Click outside backdrop */}
      <div className="fixed inset-0" onClick={onClose}></div>

      {/* Modal Dialog Content */}
      <div className="relative bg-slate-900 text-white rounded-3xl max-w-4xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-amber-500/30 z-10 flex flex-col">
        
        {/* Header Bar */}
        <div className="sticky top-0 z-20 bg-slate-900/95 backdrop-blur-md px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="bg-emerald-600 text-white text-xs font-extrabold uppercase px-2.5 py-0.5 rounded">
              Venda
            </span>
            <span className="font-mono text-amber-400 font-bold text-sm bg-slate-950 px-2.5 py-0.5 rounded border border-amber-500/30">
              {property.code}
            </span>
            <span className="text-xs text-slate-400 hidden sm:inline">
              {property.neighborhood}, Navegantes – SC
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
              title="Compartilhar imóvel"
            >
              {copiedLink ? <Check className="w-5 h-5 text-emerald-400" /> : <Share2 className="w-5 h-5" />}
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
              aria-label="Fechar detalhes"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 space-y-8">
          
          {/* Main Gallery */}
          <div className="space-y-3">
            <div className="relative aspect-[16/9] rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-inner">
              <img
                src={activeImage.url}
                alt={activeImage.alt}
                className="w-full h-full object-cover"
              />

              {/* Recommended Image Size indicator */}
              <div className="absolute top-3 left-3 bg-slate-950/85 backdrop-blur-md text-[11px] text-amber-300 font-medium px-2.5 py-1 rounded-md border border-amber-500/30">
                Tamanho recomendado: {activeImage.recommendedDim}
              </div>

              {/* Navigation arrows if multiple images */}
              {property.images.length > 1 && (
                <>
                  <button
                    onClick={handlePrev}
                    className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-slate-950/70 hover:bg-slate-950 text-white transition-colors"
                    aria-label="Foto anterior"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleNext}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-slate-950/70 hover:bg-slate-950 text-white transition-colors"
                    aria-label="Próxima foto"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnail row */}
            {property.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {property.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImgIndex(idx)}
                    className={`relative w-20 h-14 sm:w-24 sm:h-16 rounded-xl overflow-hidden shrink-0 border-2 transition-all ${
                      activeImgIndex === idx ? 'border-amber-400 scale-95' : 'border-slate-800 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img.url} alt={img.alt} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Title & Price Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 mb-1">
                <MapPin className="w-4 h-4" />
                <span>Bairro {property.neighborhood}, Navegantes – SC</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                {property.title}
              </h2>
            </div>
            
            <div className="md:text-right">
              <span className="text-xs text-slate-400 block">Preço de Venda</span>
              <span className="text-2xl sm:text-3xl font-extrabold text-amber-400">
                {formatCurrency(property.price)}
              </span>
            </div>
          </div>

          {/* Quick Specifications Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-800/60 p-4 rounded-2xl border border-slate-700/60 text-center">
            {property.bedrooms !== undefined && (
              <div className="p-2">
                <BedDouble className="w-5 h-5 mx-auto mb-1 text-amber-400" />
                <span className="font-bold text-base block">{property.bedrooms} Dormitórios</span>
                {property.suites ? (
                  <span className="text-xs text-slate-400">({property.suites} Suítes)</span>
                ) : null}
              </div>
            )}

            {property.bathrooms !== undefined && (
              <div className="p-2">
                <Bath className="w-5 h-5 mx-auto mb-1 text-amber-400" />
                <span className="font-bold text-base block">{property.bathrooms} Banheiros</span>
                <span className="text-xs text-slate-400">Total</span>
              </div>
            )}

            {property.parkingSpots !== undefined && (
              <div className="p-2">
                <Car className="w-5 h-5 mx-auto mb-1 text-amber-400" />
                <span className="font-bold text-base block">{property.parkingSpots} Vagas</span>
                <span className="text-xs text-slate-400">Garagem</span>
              </div>
            )}

            <div className="p-2">
              <Maximize2 className="w-5 h-5 mx-auto mb-1 text-amber-400" />
              <span className="font-bold text-base block">{property.areaM2} m²</span>
              <span className="text-xs text-slate-400">Área Privativa</span>
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-lg font-bold text-white mb-2">Descrição do Imóvel</h3>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              {property.description}
            </p>
          </div>

          {/* Characteristics / Features */}
          <div>
            <h3 className="text-lg font-bold text-white mb-3">Diferenciais e Acabamentos</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {property.features.map((feature, i) => (
                <div key={i} className="flex items-center gap-2.5 text-sm text-slate-200 bg-slate-800/40 p-2.5 rounded-xl border border-slate-700/40">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Corretora Responsável Card */}
          <div className="bg-gradient-to-r from-slate-950 to-slate-900 p-5 rounded-2xl border border-amber-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-lg border border-amber-500/40">
                DE
              </div>
              <div>
                <h4 className="font-bold text-white text-base">{COMPANY_DATA.broker}</h4>
                <p className="text-xs text-amber-400">{COMPANY_DATA.creci} • Atendimento 24h</p>
                <p className="text-xs text-slate-400">{COMPANY_DATA.tradeName}</p>
              </div>
            </div>

            <a
              href={`https://wa.me/${COMPANY_DATA.phoneRaw}?text=${waMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold text-sm px-6 py-3.5 rounded-xl shadow-lg transition-all"
            >
              <MessageCircle className="w-5 h-5 fill-white" />
              <span>Falar no WhatsApp sobre este Imóvel</span>
            </a>
          </div>

        </div>

      </div>
    </div>
  );
};
