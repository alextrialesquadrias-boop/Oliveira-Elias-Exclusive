import React, { useState } from 'react';
import { X, MessageCircle, Phone, Mail, Clock, MapPin, Send, Check } from 'lucide-react';
import { COMPANY_DATA } from '../data/properties';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
}

export const ContactModal: React.FC<ContactModalProps> = ({
  isOpen,
  onClose,
  title = "Atendimento Personalizado",
  subtitle = "Fale diretamente com a corretora Daniela de Oliveira Elias"
}) => {
  if (!isOpen) return null;

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);

    const waText = encodeURIComponent(
      `Olá Daniela! Gostaria de atendimento personalizado.\n- Nome: ${name}\n- Telefone: ${phone}\n- Mensagem: ${message || 'Gostaria de conhecer opções de imóveis à venda em Navegantes.'}`
    );

    window.open(`https://wa.me/${COMPANY_DATA.phoneRaw}?text=${waText}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 md:p-6 animate-in fade-in duration-200">
      <div className="fixed inset-0" onClick={onClose}></div>

      <div className="relative bg-slate-900 text-white rounded-3xl max-w-lg w-full shadow-2xl border border-emerald-500/40 z-10 overflow-hidden">
        
        {/* Header */}
        <div className="bg-slate-950/90 px-6 py-5 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-lg text-white">{title}</h3>
            <p className="text-xs text-emerald-400">{subtitle}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 sm:p-8 space-y-6">
          
          {/* Quick contact direct badges */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <a
              href={`https://wa.me/${COMPANY_DATA.phoneRaw}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 bg-emerald-950/60 border border-emerald-500/30 rounded-xl flex items-center gap-3 hover:bg-emerald-900/40 transition-colors"
            >
              <div className="w-9 h-9 rounded-lg bg-white p-1.5 flex items-center justify-center shrink-0 shadow-sm">
                <img
                  src="/assets/aistudio/image_c900f1c9.png"
                  alt="WhatsApp"
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">WhatsApp 24h</span>
                <span className="text-xs font-bold text-white">{COMPANY_DATA.phone}</span>
              </div>
            </a>

            <a
              href={`mailto:${COMPANY_DATA.email}`}
              className="p-3 bg-slate-800/60 border border-slate-700/60 rounded-xl flex items-center gap-3 hover:bg-slate-800 transition-colors"
            >
              <div className="w-9 h-9 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                <Mail className="w-5 h-5" />
              </div>
              <div className="truncate">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">E-mail</span>
                <span className="text-xs font-bold text-white truncate block">{COMPANY_DATA.email}</span>
              </div>
            </a>
          </div>

          {/* Form */}
          {sent ? (
            <div className="text-center py-6 space-y-3">
              <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/40">
                <Check className="w-7 h-7" />
              </div>
              <h4 className="text-lg font-bold text-white">Mensagem Encaminhada!</h4>
              <p className="text-xs text-slate-300">
                A corretora Daniela de Oliveira Elias entrará em contato o mais breve possível.
              </p>
              <button
                onClick={onClose}
                className="mt-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-6 py-2 rounded-xl text-xs transition-colors"
              >
                Fechar
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Seu Nome *
                </label>
                <input
                  required
                  type="text"
                  placeholder="Seu nome completo"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 focus:border-emerald-400 text-white text-sm rounded-xl py-2.5 px-3.5 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Seu Telefone / WhatsApp *
                </label>
                <input
                  required
                  type="tel"
                  placeholder="(47) 99999-9999"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 focus:border-emerald-400 text-white text-sm rounded-xl py-2.5 px-3.5 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Como podemos ajudar?
                </label>
                <textarea
                  rows={3}
                  placeholder="Gostaria de agendar uma visita ou receber opções de imóveis..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 focus:border-emerald-400 text-white text-sm rounded-xl py-2.5 px-3.5 outline-none"
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold text-sm py-3 px-6 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2.5 cursor-pointer"
              >
                <img
                  src="/assets/aistudio/image_c900f1c9.png"
                  alt="WhatsApp"
                  className="w-5 h-5 object-contain"
                />
                <span>Conversar com a Corretora Agora</span>
              </button>
            </form>
          )}

          <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Atendimento 24 horas, de segunda a segunda</span>
            <span>CRECI-SC 71040F</span>
          </div>

        </div>

      </div>
    </div>
  );
};
