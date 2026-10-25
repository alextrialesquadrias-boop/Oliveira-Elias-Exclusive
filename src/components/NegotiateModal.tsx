import React, { useState } from 'react';
import { X, Home, MessageCircle, Check, Send, ShieldCheck, MapPin } from 'lucide-react';
import { COMPANY_DATA } from '../data/properties';

interface NegotiateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NegotiateModal: React.FC<NegotiateModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    propertyType: 'Apartamento',
    neighborhood: 'Gravatá',
    estimatedValue: '',
    details: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);

    const message = encodeURIComponent(
      `Olá Daniela! Quero negociar meu imóvel para VENDA em Navegantes:\n- Nome: ${formData.name}\n- Telefone: ${formData.phone}\n- Tipo: ${formData.propertyType}\n- Bairro em Navegantes: ${formData.neighborhood}\n- Valor Estimado: ${formData.estimatedValue || 'A combinar'}\n- Detalhes: ${formData.details || 'Nenhum detalhe adicional'}`
    );

    window.open(`https://wa.me/${COMPANY_DATA.phoneRaw}?text=${message}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 md:p-6 animate-in fade-in duration-200">
      <div className="fixed inset-0" onClick={onClose}></div>

      <div className="relative bg-slate-900 text-white rounded-3xl max-w-xl w-full shadow-2xl border border-amber-500/40 z-10 overflow-hidden">
        
        {/* Modal Header */}
        <div className="bg-slate-950/90 px-6 py-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <Home className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-white">Negocie seu Imóvel</h3>
              <p className="text-xs text-amber-400">Venda exclusiva em Navegantes/SC</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8">
          {submitted ? (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/40">
                <Check className="w-8 h-8" />
              </div>
              <h4 className="text-xl font-bold text-white">Informações Enviadas com Sucesso!</h4>
              <p className="text-sm text-slate-300 max-w-sm mx-auto">
                A corretora <strong>Daniela de Oliveira Elias</strong> já recebeu seus dados para iniciar a avaliação do seu imóvel em Navegantes.
              </p>
              <button
                onClick={onClose}
                className="mt-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-6 py-2.5 rounded-xl text-sm transition-colors"
              >
                Concluir
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-4">
                Preencha os dados abaixo para receber uma avaliação mercadológica precisa e cadastrar seu imóvel para venda com <strong>Oliveira Elias Exclusive</strong>.
              </p>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Seu Nome Completo *
                </label>
                <input
                  required
                  type="text"
                  placeholder="Ex: João da Silva"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 focus:border-amber-400 text-white text-sm rounded-xl py-3 px-3.5 outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Telefone / WhatsApp *
                  </label>
                  <input
                    required
                    type="tel"
                    placeholder="(47) 99999-9999"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 focus:border-amber-400 text-white text-sm rounded-xl py-3 px-3.5 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Tipo do Imóvel
                  </label>
                  <select
                    value={formData.propertyType}
                    onChange={(e) => setFormData({ ...formData, propertyType: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 focus:border-amber-400 text-white text-sm rounded-xl py-3 px-3.5 outline-none"
                  >
                    <option value="Apartamento">Apartamento</option>
                    <option value="Casa">Casa</option>
                    <option value="Terreno">Terreno</option>
                    <option value="Comercial">Comercial</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Bairro em Navegantes
                  </label>
                  <select
                    value={formData.neighborhood}
                    onChange={(e) => setFormData({ ...formData, neighborhood: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 focus:border-amber-400 text-white text-sm rounded-xl py-3 px-3.5 outline-none"
                  >
                    <option value="Gravatá">Gravatá</option>
                    <option value="Centro">Centro</option>
                    <option value="Meia Praia">Meia Praia</option>
                    <option value="São Pedro">São Pedro</option>
                    <option value="Outro bairro em Navegantes">Outro Bairro em Navegantes</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Valor Pretendido (opcional)
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: R$ 1.200.000"
                    value={formData.estimatedValue}
                    onChange={(e) => setFormData({ ...formData, estimatedValue: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 focus:border-amber-400 text-white text-sm rounded-xl py-3 px-3.5 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Detalhes adicionais (dormitórios, metragem, diferenciais)
                </label>
                <textarea
                  rows={3}
                  placeholder="Ex: Apartamento com 3 suítes, vista para o mar, 2 vagas de garagem no Gravatá..."
                  value={formData.details}
                  onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 focus:border-amber-400 text-white text-sm rounded-xl py-3 px-3.5 outline-none"
                ></textarea>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm sm:text-base py-3.5 px-6 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2.5 cursor-pointer"
                >
                  <img
                    src="/assets/aistudio/image_c900f1c9.png"
                    alt="WhatsApp"
                    className="w-5 h-5 object-contain"
                  />
                  <span>Enviar e Negociar com Daniela</span>
                </button>
              </div>

              <p className="text-[11px] text-slate-400 text-center">
                Atendimento sigiloso e exclusivo • CRECI-SC 71040F
              </p>
            </form>
          )}
        </div>

      </div>
    </div>
  );
};
