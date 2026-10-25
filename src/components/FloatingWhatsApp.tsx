import React, { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { COMPANY_DATA } from '../data/properties';

export const FloatingWhatsApp: React.FC = () => {
  const [showTooltip, setShowTooltip] = useState(true);

  const defaultMessage = encodeURIComponent('Olá Daniela! Vi o site da Oliveira Elias Exclusive e gostaria de atendimento sobre imóveis à venda em Navegantes.');

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end">
      {/* Tooltip badge */}
      {showTooltip && (
        <div className="mb-2.5 bg-slate-950/95 backdrop-blur-md text-white text-xs py-2 px-3.5 rounded-2xl shadow-2xl border border-emerald-500/30 flex items-center gap-2 max-w-[260px] animate-bounce duration-1000">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping shrink-0"></div>
          <span className="text-[11px] font-medium leading-tight text-slate-200">
            <strong>Daniela de Oliveira Elias</strong> está online agora (24h)
          </span>
          <button
            onClick={() => setShowTooltip(false)}
            className="text-slate-400 hover:text-white ml-1 p-0.5"
            aria-label="Fechar aviso"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Floating button */}
      <a
        href={`https://wa.me/${COMPANY_DATA.phoneRaw}?text=${defaultMessage}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Falar no WhatsApp com Daniela de Oliveira Elias"
        className="group relative flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-white rounded-full shadow-2xl shadow-emerald-950/60 hover:shadow-emerald-500/50 transition-all transform hover:scale-110 active:scale-95 border-2 border-emerald-500 p-1"
      >
        <img
          src="/assets/aistudio/image_c900f1c9.png"
          alt="WhatsApp Oficial Daniela de Oliveira Elias"
          className="w-full h-full object-contain drop-shadow"
        />
        
        {/* Radar ping ring */}
        <span className="absolute -inset-1 rounded-full border-2 border-emerald-400/60 animate-ping pointer-events-none opacity-40"></span>
      </a>
    </div>
  );
};
