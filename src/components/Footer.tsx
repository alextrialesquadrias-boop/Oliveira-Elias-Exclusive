import React from 'react';
import { Building2, Phone, Mail, Clock, MapPin, Instagram, Facebook, ShieldCheck, ArrowUp, Lock } from 'lucide-react';
import { COMPANY_DATA } from '../data/properties';

interface FooterProps {
  onOpenPrivacyPolicy: () => void;
  onOpenContact: () => void;
  onOpenAdmin: () => void;
  onNavigate: (sectionId: string) => void;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenPrivacyPolicy,
  onOpenContact,
  onOpenAdmin,
  onNavigate
}) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer id="contato" className="bg-slate-950 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Footer Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-12 pb-14 border-b border-slate-800/80">
          
          {/* Brand Intro / Overview */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center">
              <div className="bg-white/95 rounded-2xl px-4 py-2 shadow-md border border-amber-400/40 inline-flex items-center">
                <img
                  src="/logo-oliveira-elias.png"
                  alt="Oliveira Elias Exclusive"
                  className="h-[60px] w-auto object-contain max-w-[360px]"
                />
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Consultoria e negócios imobiliários de alto padrão em Navegantes/SC. Especialista em compra, venda e avaliação de imóveis com atendimento exclusivo e personalizado.
            </p>

            <div className="pt-2 text-xs text-slate-500 space-y-1">
              <p>Razão Social: {COMPANY_DATA.corporateName}</p>
              <p>CNPJ: {COMPANY_DATA.cnpj}</p>
            </div>

            {/* Social Media Links */}
            <div className="pt-2 flex items-center gap-3">
              <a
                href={COMPANY_DATA.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram @daniela_oliveiraelias"
                className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 hover:border-amber-400 hover:text-amber-400 hover:bg-amber-400/10 text-slate-300 flex items-center justify-center transition-all duration-300 shadow-sm group hover:scale-105 cursor-pointer"
                title="Siga no Instagram: @daniela_oliveiraelias"
              >
                <Instagram className="w-5 h-5 group-hover:scale-110 transition-transform" />
              </a>

              <a
                href={COMPANY_DATA.facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook Daniela Oliveira Corretora de Imóveis"
                className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 hover:border-amber-400 hover:text-amber-400 hover:bg-amber-400/10 text-slate-300 flex items-center justify-center transition-all duration-300 shadow-sm group hover:scale-105 cursor-pointer"
                title="Página no Facebook: Daniela Oliveira Corretora de Imóveis"
              >
                <Facebook className="w-5 h-5 group-hover:scale-110 transition-transform" />
              </a>

              <a
                href={COMPANY_DATA.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-slate-400 hover:text-amber-400 ml-1 transition-colors cursor-pointer"
                title="Instagram @daniela_oliveiraelias"
              >
                {COMPANY_DATA.instagram}
              </a>
            </div>
          </div>

          {/* Coluna 1: A Imobiliária */}
          <div className="lg:col-span-4 space-y-4">
            <h4 className="text-sm font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-amber-500" />
              <span>A Imobiliária</span>
            </h4>

            <div className="space-y-3 text-sm text-slate-300">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-1" />
                <div>
                  <p className="font-medium text-white">Endereço Oficial:</p>
                  <p className="text-xs sm:text-sm text-slate-400 leading-relaxed mt-0.5">
                    {COMPANY_DATA.address}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0 mt-1" />
                <div>
                  <p className="font-medium text-white">Registro Profissional:</p>
                  <p className="text-xs sm:text-sm text-amber-300 font-semibold mt-0.5">
                    {COMPANY_DATA.creci}
                  </p>
                  <p className="text-xs text-slate-400">
                    Responsável: {COMPANY_DATA.broker}
                  </p>
                </div>
              </div>

              <div className="pt-2">
                <p className="text-xs text-emerald-400 font-medium bg-emerald-950/60 border border-emerald-500/20 rounded-lg p-2.5">
                  Atuação exclusiva em <strong>VENDA</strong> de imóveis residenciais e comerciais em Navegantes/SC.
                </p>
              </div>
            </div>
          </div>

          {/* Coluna 2: Contato */}
          <div className="lg:col-span-4 space-y-4">
            <h4 className="text-sm font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
              <Phone className="w-4 h-4 text-amber-500" />
              <span>Contato</span>
            </h4>

            <div className="space-y-3 text-sm text-slate-300">
              {/* Telefone / WhatsApp com Logo Oficial */}
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 shrink-0 mt-0.5 flex items-center justify-center">
                  <img
                    src="/assets/aistudio/image_c900f1c9.png"
                    alt="WhatsApp"
                    className="w-5 h-5 object-contain"
                  />
                </div>
                <div>
                  <span className="text-xs text-slate-400 block">Telefone / WhatsApp:</span>
                  <a
                    href={`https://wa.me/${COMPANY_DATA.phoneRaw}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-bold text-white hover:text-emerald-400 transition-colors text-base inline-block"
                  >
                    {COMPANY_DATA.phone}
                  </a>
                </div>
              </div>

              {/* E-mail */}
              <div className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-amber-400 shrink-0 mt-1" />
                <div className="break-all">
                  <span className="text-xs text-slate-400 block">E-mail:</span>
                  <a
                    href={`mailto:${COMPANY_DATA.email}`}
                    className="text-xs sm:text-sm text-slate-200 hover:text-amber-400 transition-colors"
                  >
                    {COMPANY_DATA.email}
                  </a>
                </div>
              </div>

              {/* Horário */}
              <div className="flex items-start gap-3">
                <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-1" />
                <div>
                  <span className="text-xs text-slate-400 block">Horário de Atendimento:</span>
                  <p className="text-xs sm:text-sm text-emerald-400 font-semibold">
                    {COMPANY_DATA.hoursShort}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Todos os dias, inclusive fins de semana.
                  </p>
                </div>
              </div>

              {/* Links Fale Conosco e Política de Privacidade */}
              <div className="pt-3 flex flex-wrap items-center gap-4 text-xs font-semibold">
                <button
                  type="button"
                  onClick={onOpenContact}
                  className="text-amber-400 hover:text-amber-300 underline underline-offset-4 cursor-pointer"
                >
                  Fale Conosco
                </button>
                <span className="text-slate-600">•</span>
                <button
                  type="button"
                  onClick={onOpenPrivacyPolicy}
                  className="text-amber-400 hover:text-amber-300 underline underline-offset-4 cursor-pointer"
                >
                  Política de Privacidade
                </button>
              </div>

            </div>
          </div>

        </div>

        {/* Linha Final Obrigatória */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p className="text-center sm:text-left font-medium">
            www.oliveiraeliasexclusive.com.br © 2026. Todos os direitos reservados.
          </p>
          
          <div className="flex items-center gap-4">
            <span className="text-[11px] text-slate-400">
              Navegantes – SC
            </span>

            <button
              onClick={scrollToTop}
              className="p-2 rounded-lg bg-slate-900 hover:bg-amber-500 hover:text-slate-950 text-slate-300 border border-slate-800 transition-colors cursor-pointer"
              aria-label="Voltar ao Topo"
              title="Voltar ao Topo"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Acesso Restrito posicionado exatamente no MEIO da página no FINAL do site */}
        <div className="mt-8 pt-6 border-t border-slate-900/90 flex flex-col items-center justify-center text-center">
          <button
            type="button"
            onClick={onOpenAdmin}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-slate-900/90 hover:bg-slate-800 text-slate-400 hover:text-amber-400 border border-slate-800 hover:border-amber-500/40 text-xs font-semibold tracking-wider uppercase transition-all shadow-md group cursor-pointer focus:outline-none"
            title="Acesso Restrito ao Painel do Corretor"
          >
            <Lock className="w-3.5 h-3.5 text-slate-500 group-hover:text-amber-400 transition-colors" />
            <span>Acesso Restrito</span>
          </button>
          <span className="text-[10px] text-slate-500 mt-1.5">
            Área de Gestão • Daniela de Oliveira Elias Imóveis
          </span>
        </div>

      </div>
    </footer>
  );
};
