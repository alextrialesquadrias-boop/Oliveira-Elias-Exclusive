import React from 'react';
import { Home, UserCheck, ArrowRight, ShieldCheck, Clock, MessageSquareQuote } from 'lucide-react';
import { COMPANY_DATA } from '../data/properties';

interface CtaSectionProps {
  onOpenNegotiate: () => void;
  onOpenPersonalizedSupport: () => void;
}

export const CtaSection: React.FC<CtaSectionProps> = ({
  onOpenNegotiate,
  onOpenPersonalizedSupport
}) => {
  return (
    <section className="py-16 lg:py-24 bg-slate-950 relative overflow-hidden border-t border-b border-amber-500/20">
      {/* Decorative gradient glow */}
      <div className="absolute inset-0 bg-radial-gradient from-amber-500/10 via-transparent to-transparent opacity-60"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
          
          {/* Card CTA 1: Negocie seu Imóvel */}
          <div className="relative rounded-3xl p-8 sm:p-10 bg-gradient-to-br from-slate-900 via-slate-900/95 to-slate-800 border border-amber-500/30 shadow-2xl hover:border-amber-400 transition-all duration-300 flex flex-col justify-between group overflow-hidden">
            {/* Top accent badge */}
            <div className="absolute top-0 right-0 w-36 h-36 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition-all"></div>

            <div>
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 flex items-center justify-center mb-6 shadow-lg shadow-amber-500/20 group-hover:scale-110 transition-transform">
                <Home className="w-7 h-7 stroke-[2.2]" />
              </div>

              <div className="inline-block text-xs font-bold uppercase tracking-widest text-amber-400 mb-2">
                Proprietários em Navegantes
              </div>

              <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-4">
                Negocie seu Imóvel
              </h3>

              <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-6">
                Deseja vender sua casa, apartamento ou terreno em Navegantes com agilidade e total segurança jurídica? Conte com a assessoria especializada e avaliação mercadológica precisa da corretora <strong>Daniela de Oliveira Elias (CRECI-SC 71040F)</strong>.
              </p>

              <ul className="space-y-2 mb-8 text-xs sm:text-sm text-slate-300">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                  <span>Avaliação precisa e valorização do seu imóvel</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                  <span>Divulgação qualificada para compradores reais</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                  <span>Acompanhamento documental do início à escritura</span>
                </li>
              </ul>
            </div>

            {/* Botão "Negociar" */}
            <div>
              <button
                type="button"
                onClick={onOpenNegotiate}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 font-extrabold text-sm sm:text-base py-3.5 px-8 rounded-xl shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40 transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
              >
                <span>Negociar</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Card CTA 2: Atendimento Personalizado */}
          <div className="relative rounded-3xl p-8 sm:p-10 bg-gradient-to-br from-slate-900 via-slate-900/95 to-slate-800 border border-emerald-500/30 shadow-2xl hover:border-emerald-400 transition-all duration-300 flex flex-col justify-between group overflow-hidden">
            {/* Top accent badge */}
            <div className="absolute top-0 right-0 w-36 h-36 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all"></div>

            <div>
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 text-white flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/20 group-hover:scale-110 transition-transform">
                <UserCheck className="w-7 h-7 stroke-[2.2]" />
              </div>

              <div className="inline-block text-xs font-bold uppercase tracking-widest text-emerald-400 mb-2">
                Atendimento 24 Horas
              </div>

              <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-4">
                Atendimento Personalizado
              </h3>

              <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-6">
                Busca um imóvel exclusivo para moradia ou investimento com perfil sob medida? Receba atendimento humanizado e individualizado 24 horas por dia, de segunda a segunda, com a corretora <strong>Daniela de Oliveira Elias</strong>.
              </p>

              <ul className="space-y-2 mb-8 text-xs sm:text-sm text-slate-300">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  <span>Disponibilidade 24 horas, inclusive fins de semana</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  <span>Consultoria exclusiva para perfil de alto padrão</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  <span>Visitas guiadas nos melhores bairros de Navegantes</span>
                </li>
              </ul>
            </div>

            {/* Botão "Atendimento" */}
            <div>
              <button
                type="button"
                onClick={onOpenPersonalizedSupport}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-extrabold text-sm sm:text-base py-3.5 px-8 rounded-xl shadow-lg shadow-emerald-900/40 hover:shadow-emerald-600/40 transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer border border-emerald-400/30"
              >
                <span>Atendimento</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
