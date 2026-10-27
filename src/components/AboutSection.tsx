import React from 'react';
import { ShieldCheck, Award, CheckCircle2, UserCheck, Scale, Home, Clock, MapPin } from 'lucide-react';
import { COMPANY_DATA, DEFAULT_ABOUT_DATA } from '../data/properties';
import { AboutData } from '../types';

interface AboutSectionProps {
  aboutData?: AboutData;
}

export const AboutSection: React.FC<AboutSectionProps> = ({ aboutData }) => {
  const data = aboutData || DEFAULT_ABOUT_DATA;

  return (
    <section id="a-imobiliaria" className="py-20 lg:py-28 bg-white relative overflow-hidden">
      {/* Subtle decorative background elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-amber-50 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-slate-100 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200/60 text-amber-800 text-xs font-semibold uppercase tracking-wider mb-3">
            <ShieldCheck className="w-4 h-4 text-amber-600" />
            <span>Consultoria & Negócios Imobiliários</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            A Imobiliária
          </h2>
          <div className="w-20 h-1 bg-amber-500 mx-auto mt-4 rounded-full"></div>
        </div>

        {/* Two Columns Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Column 1: Corretora Daniela de Oliveira Elias */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-slate-100 group">
              <img
                src={data.brokerImageUrl || DEFAULT_ABOUT_DATA.brokerImageUrl}
                alt="Daniela de Oliveira Elias - Corretora de Imóveis CRECI-SC 71040F"
                className="w-full h-[450px] sm:h-[520px] object-cover object-top group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent"></div>

              {/* Bottom Credential Card */}
              <div className="absolute bottom-4 left-4 right-4 bg-slate-900/90 backdrop-blur-md p-4 rounded-2xl border border-amber-500/30 text-white shadow-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-base text-white">{COMPANY_DATA.broker}</h3>
                    <p className="text-xs text-amber-400 font-semibold">{COMPANY_DATA.creci}</p>
                    <p className="text-[11px] text-slate-300 mt-0.5">{COMPANY_DATA.tradeName}</p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400">
                    <UserCheck className="w-5 h-5" />
                  </div>
                </div>
              </div>
            </div>

            {/* Accent decorative badge */}
            <div className="absolute -bottom-6 -right-4 sm:-right-6 bg-gradient-to-br from-amber-500 to-amber-600 text-slate-950 p-4 rounded-2xl shadow-xl border-2 border-white hidden sm:block max-w-[200px]">
              <div className="flex items-center gap-2 font-extrabold text-sm mb-1 text-slate-950">
                <Clock className="w-4 h-4 text-slate-950" />
                <span>Atendimento 24h</span>
              </div>
              <p className="text-[11px] font-medium text-slate-900 leading-tight">
                De segunda a segunda, inclusive finais de semana.
              </p>
            </div>
          </div>

          {/* Column 2: Rich Descriptive Content */}
          <div className="lg:col-span-7 space-y-6 text-slate-700">
            <div>
              <p className="text-xs font-bold text-amber-600 uppercase tracking-widest mb-2">
                Excelência no Mercado Imobiliário
              </p>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-snug">
                Oliveira Elias Exclusive
              </h3>
              <p className="text-sm font-semibold text-slate-500 mt-1">
                {COMPANY_DATA.corporateName} • CNPJ: {COMPANY_DATA.cnpj}
              </p>
            </div>

            <p className="text-base sm:text-lg leading-relaxed text-slate-600 whitespace-pre-line">
              {data.paragraph1 || DEFAULT_ABOUT_DATA.paragraph1}
            </p>

            <p className="text-base leading-relaxed text-slate-600 whitespace-pre-line">
              {data.paragraph2 || DEFAULT_ABOUT_DATA.paragraph2}
            </p>

            {/* Core Pillars (Focused in compra, venda e avaliação de imóveis) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
              
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 hover:border-amber-400 hover:bg-amber-50/30 transition-colors">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center mb-3">
                  <Home className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-slate-900 text-sm mb-1">Venda Exclusiva</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Portfólio qualificado de casas, apartamentos, coberturas e terrenos em Navegantes.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 hover:border-amber-400 hover:bg-amber-50/30 transition-colors">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center mb-3">
                  <UserCheck className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-slate-900 text-sm mb-1">Assessoria na Compra</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Acompanhamento minucioso de ponta a ponta na escolha do seu patrimônio.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 hover:border-amber-400 hover:bg-amber-50/30 transition-colors">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center mb-3">
                  <Scale className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-slate-900 text-sm mb-1">Avaliação Precisa</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Análise técnica e de mercado criteriosa para precificação real do seu imóvel.
                </p>
              </div>

            </div>

            {/* Key Official Highlights */}
            <div className="pt-2">
              <ul className="space-y-2.5">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="text-sm text-slate-700">
                    <strong>Corretora Responsável:</strong> Daniela de Oliveira Elias, devidamente inscrita no Conselho Regional de Corretores de Imóveis sob o <strong>CRECI-SC 71040F</strong>.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="text-sm text-slate-700">
                    <strong>Localização Privilegiada:</strong> Sede no bairro Gravatá, polo imobiliário de maior valorização em Navegantes/SC.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="text-sm text-slate-700">
                    <strong>Disponibilidade Total:</strong> Atendimento 24 horas, de segunda a segunda, para tirar dúvidas e agendar visitas exclusivas.
                  </span>
                </li>
              </ul>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
