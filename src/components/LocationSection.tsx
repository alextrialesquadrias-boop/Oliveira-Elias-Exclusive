import React, { useState } from 'react';
import { MapPin, Clock, Phone, Navigation, Copy, Check, ExternalLink, Mail } from 'lucide-react';
import { COMPANY_DATA } from '../data/properties';

export const LocationSection: React.FC = () => {
  const [copied, setCopied] = useState(false);

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(COMPANY_DATA.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  // Google Maps embed URL centered on the exact address:
  // Avenida Prefeito Cirino Adolfo Cabral, 7443, Gravata, Navegantes - SC, 88372-612
  const encodedAddress = encodeURIComponent("Avenida Prefeito Cirino Adolfo Cabral, 7443, Gravata, Navegantes, SC, 88372-612");
  const mapsEmbedUrl = `https://maps.google.com/maps?q=${encodedAddress}&t=&z=16&ie=UTF8&iwloc=&output=embed`;
  const googleMapsDirectionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}`;

  return (
    <section id="localizacao" className="py-20 lg:py-28 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-800 text-xs font-semibold uppercase tracking-wider mb-3">
            <MapPin className="w-4 h-4 text-amber-600" />
            <span>Navegantes - Santa Catarina</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Nossa Localização
          </h2>
          <p className="mt-2 text-slate-600 text-base sm:text-lg">
            Venha tomar um café ou solicite nosso atendimento personalizado onde você estiver.
          </p>
          <div className="w-20 h-1 bg-amber-500 mx-auto mt-4 rounded-full"></div>
        </div>

        {/* Content Layout: Info Card + Responsive Google Maps Iframe */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Details Card */}
          <div className="lg:col-span-5 bg-slate-900 text-white rounded-3xl p-8 sm:p-10 shadow-2xl border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-6 border border-emerald-500/30">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                <span>Atendimento Ativo 24h</span>
              </div>

              <h3 className="text-2xl font-bold text-white mb-2">
                {COMPANY_DATA.tradeName}
              </h3>
              <p className="text-xs text-amber-400 font-medium mb-6">
                {COMPANY_DATA.broker} • {COMPANY_DATA.creci}
              </p>

              {/* Endereço */}
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                      Endereço
                    </span>
                    <p className="text-sm sm:text-base font-medium text-slate-100 leading-relaxed">
                      Avenida Prefeito Cirino Adolfo Cabral, 7443, Bloco B, Apt 405, Bairro Gravatá, Navegantes/SC, CEP 88372-612
                    </p>
                  </div>
                </div>

                {/* Horário de Atendimento */}
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                      Horário de Atendimento
                    </span>
                    <p className="text-sm sm:text-base font-semibold text-emerald-400">
                      24 horas, de segunda a segunda
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Todos os dias, inclusive fins de semana e feriados.
                    </p>
                  </div>
                </div>

                {/* Telefone / WhatsApp */}
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                      Telefone & WhatsApp
                    </span>
                    <a
                      href={`https://wa.me/${COMPANY_DATA.phoneRaw}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-base sm:text-lg font-bold text-white hover:text-amber-400 transition-colors inline-block"
                    >
                      {COMPANY_DATA.phone}
                    </a>
                  </div>
                </div>

                {/* E-mail */}
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div className="break-all">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                      E-mail Oficial
                    </span>
                    <a
                      href={`mailto:${COMPANY_DATA.email}`}
                      className="text-xs sm:text-sm font-medium text-slate-200 hover:text-amber-400 transition-colors"
                    >
                      {COMPANY_DATA.email}
                    </a>
                  </div>
                </div>

              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="pt-8 mt-6 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <a
                href={googleMapsDirectionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm py-3 px-4 rounded-xl shadow-lg transition-all"
              >
                <Navigation className="w-4 h-4" />
                <span>Como Chegar</span>
              </a>

              <button
                type="button"
                onClick={handleCopyAddress}
                className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs sm:text-sm py-3 px-4 rounded-xl border border-slate-700 transition-all cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-400 font-semibold">Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copiar Endereço</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Interactive Google Maps Iframe */}
          <div className="lg:col-span-7 h-[420px] sm:h-[500px] lg:h-auto rounded-3xl overflow-hidden shadow-2xl border-2 border-slate-200 relative bg-slate-100">
            <iframe
              title="Localização Oliveira Elias Exclusive - Navegantes SC"
              src={mapsEmbedUrl}
              width="100%"
              height="100%"
              style={{ border: 0, minHeight: '400px' }}
              allowFullScreen={false}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="w-full h-full"
            ></iframe>

            {/* Overlay tag on top of map */}
            <div className="absolute bottom-4 left-4 right-4 sm:right-auto bg-slate-950/90 backdrop-blur-md text-white p-3.5 rounded-2xl border border-amber-500/30 shadow-xl max-w-sm pointer-events-none">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-400 mb-0.5">
                <MapPin className="w-4 h-4" />
                <span>Bairro Gravatá • Navegantes - SC</span>
              </div>
              <p className="text-[11px] text-slate-300">
                Avenida Prefeito Cirino Adolfo Cabral, 7443, Bloco B, Apt 405
              </p>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
