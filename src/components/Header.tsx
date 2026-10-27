import React, { useState, useEffect } from 'react';
import { MessageCircle, Menu, X, Phone, Building2, ShieldCheck } from 'lucide-react';
import { COMPANY_DATA } from '../data/properties';

interface HeaderProps {
  onNavigate: (sectionId: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ onNavigate }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (sectionId: string) => {
    onNavigate(sectionId);
    setMobileMenuOpen(false);
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-slate-950/95 backdrop-blur-md shadow-lg shadow-black/20 border-b border-amber-500/20 py-3'
          : 'bg-gradient-to-b from-slate-950/90 via-slate-950/70 to-transparent py-4 sm:py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          
          {/* Official Company Logo with 3D Entrance */}
          <button
            onClick={() => handleNavClick('inicio')}
            className="flex items-center text-left focus:outline-none cursor-pointer"
            title="Oliveira Elias Exclusive — Início"
          >
            <div className="bg-white/95 hover:bg-white rounded-2xl px-3 sm:px-4 py-1.5 sm:py-2 shadow-md shadow-black/20 border border-amber-400/50 hover:border-amber-400 transition-all flex items-center [perspective:1000px]">
              <img
                src="/logo-oliveira-elias.png"
                alt="Oliveira Elias Exclusive — Negócios Imobiliários"
                fetchPriority="high"
                className="logo-entrada-3d logo-3d-interactive h-12 sm:h-[58px] md:h-[66px] w-auto object-contain max-w-[280px] sm:max-w-[360px] md:max-w-[420px]"
              />
            </div>
          </button>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            <button
              onClick={() => handleNavClick('inicio')}
              className="px-3.5 py-2 text-sm font-medium text-slate-200 hover:text-amber-400 transition-colors rounded-lg hover:bg-white/5"
            >
              Início
            </button>
            <button
              onClick={() => handleNavClick('imoveis')}
              className="px-3.5 py-2 text-sm font-medium text-slate-200 hover:text-amber-400 transition-colors rounded-lg hover:bg-white/5"
            >
              Imóveis
            </button>
            <button
              onClick={() => handleNavClick('a-imobiliaria')}
              className="px-3.5 py-2 text-sm font-medium text-slate-200 hover:text-amber-400 transition-colors rounded-lg hover:bg-white/5"
            >
              A Imobiliária
            </button>
            <button
              onClick={() => handleNavClick('contato')}
              className="px-3.5 py-2 text-sm font-medium text-slate-200 hover:text-amber-400 transition-colors rounded-lg hover:bg-white/5"
            >
              Contato
            </button>
          </nav>

          {/* Right Action: WhatsApp Button */}
          <div className="hidden sm:flex items-center gap-3">
            <a
              href={`https://wa.me/${COMPANY_DATA.phoneRaw}?text=${encodeURIComponent('Olá Daniela! Gostaria de informações sobre os imóveis para venda em Navegantes/SC.')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-full shadow-lg shadow-emerald-900/30 hover:shadow-emerald-600/40 transition-all transform hover:-translate-y-0.5 active:translate-y-0 border border-emerald-400/30"
            >
              <img
                src="/assets/aistudio/image_c900f1c9.png"
                alt="WhatsApp"
                className="w-5 h-5 object-contain"
              />
              <span>WhatsApp</span>
              <span className="hidden lg:inline text-emerald-100 font-normal">
                {COMPANY_DATA.phone}
              </span>
            </a>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 md:hidden">
            <a
              href={`https://wa.me/${COMPANY_DATA.phoneRaw}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp"
              className="p-1.5 bg-emerald-600 text-white rounded-full hover:bg-emerald-500 transition-colors flex items-center justify-center"
            >
              <img
                src="/assets/aistudio/image_c900f1c9.png"
                alt="WhatsApp"
                className="w-5 h-5 object-contain"
              />
            </a>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-200 hover:text-white hover:bg-white/10 rounded-lg focus:outline-none"
              aria-label="Abrir Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-3 pt-3 border-t border-slate-800 bg-slate-950/98 backdrop-blur-xl rounded-2xl p-4 shadow-2xl border border-amber-500/20">
            <div className="flex flex-col gap-2">
              <button
                onClick={() => handleNavClick('inicio')}
                className="text-left px-3 py-2.5 text-sm font-medium text-slate-200 hover:text-amber-400 hover:bg-slate-900 rounded-lg transition-colors"
              >
                Início
              </button>
              <button
                onClick={() => handleNavClick('imoveis')}
                className="text-left px-3 py-2.5 text-sm font-medium text-slate-200 hover:text-amber-400 hover:bg-slate-900 rounded-lg transition-colors"
              >
                Imóveis à Venda
              </button>
              <button
                onClick={() => handleNavClick('a-imobiliaria')}
                className="text-left px-3 py-2.5 text-sm font-medium text-slate-200 hover:text-amber-400 hover:bg-slate-900 rounded-lg transition-colors"
              >
                A Imobiliária
              </button>
              <button
                onClick={() => handleNavClick('contato')}
                className="text-left px-3 py-2.5 text-sm font-medium text-slate-200 hover:text-amber-400 hover:bg-slate-900 rounded-lg transition-colors"
              >
                Contato & Localização
              </button>

              <div className="pt-3 mt-1 border-t border-slate-800/80">
                <a
                  href={`https://wa.me/${COMPANY_DATA.phoneRaw}?text=${encodeURIComponent('Olá Daniela! Gostaria de atendimento personalizado.')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-semibold py-3 px-4 rounded-xl text-sm shadow-md"
                >
                  <img
                    src="/assets/aistudio/image_c900f1c9.png"
                    alt="WhatsApp"
                    className="w-5 h-5 object-contain"
                  />
                  <span>Falar no WhatsApp ({COMPANY_DATA.phone})</span>
                </a>
                <p className="text-center text-[11px] text-slate-400 mt-2">
                  Atendimento 24 horas • Navegantes/SC
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
