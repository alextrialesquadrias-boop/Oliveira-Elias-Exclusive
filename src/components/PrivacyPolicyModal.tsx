import React from 'react';
import { X, ShieldCheck, Lock, FileText } from 'lucide-react';
import { COMPANY_DATA } from '../data/properties';

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyPolicyModal: React.FC<PrivacyPolicyModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 md:p-6 animate-in fade-in duration-200">
      <div className="fixed inset-0" onClick={onClose}></div>

      <div className="relative bg-slate-900 text-white rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-700 z-10 overflow-hidden">
        
        {/* Header */}
        <div className="bg-slate-950 px-6 py-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-white">Política de Privacidade</h3>
              <p className="text-xs text-amber-400">{COMPANY_DATA.corporateName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-5 text-sm text-slate-300 leading-relaxed">
          
          <div>
            <h4 className="text-base font-bold text-white mb-2 flex items-center gap-2">
              <Lock className="w-4 h-4 text-amber-400" />
              1. Identificação do Controlador de Dados
            </h4>
            <p>
              Esta Política de Privacidade aplica-se à <strong>{COMPANY_DATA.corporateName}</strong> (Nome Fantasia: <strong>{COMPANY_DATA.tradeName}</strong>), inscrita no CNPJ sob o nº <strong>{COMPANY_DATA.cnpj}</strong>, com sede na {COMPANY_DATA.address}, representada pela corretora de imóveis <strong>{COMPANY_DATA.broker}</strong>, <strong>{COMPANY_DATA.creci}</strong>.
            </p>
          </div>

          <div>
            <h4 className="text-base font-bold text-white mb-2 flex items-center gap-2">
              <FileText className="w-4 h-4 text-amber-400" />
              2. Coleta e Finalidade dos Dados Pessoais
            </h4>
            <p>
              Os dados coletados em nosso site (como nome, número de telefone/WhatsApp, e-mail e preferências de imóveis para compra ou venda em Navegantes/SC) destinam-se exclusivamente para:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1 text-slate-400">
              <li>Responder a solicitações de informações sobre imóveis à venda;</li>
              <li>Agendar visitas presenciais aos imóveis selecionados;</li>
              <li>Elaborar propostas de compra ou avaliação de imóveis a pedido do cliente;</li>
              <li>Cumprimento de obrigações legais perante os órgãos reguladores (COAF, CRECI-SC).</li>
            </ul>
          </div>

          <div>
            <h4 className="text-base font-bold text-white mb-2">
              3. Compartilhamento e Sigilo
            </h4>
            <p>
              Em conformidade estrita com a Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018), seus dados pessoais nunca são comercializados ou compartilhados com terceiros para fins publicitários. O acesso às informações é restrito à corretora responsável Daniela de Oliveira Elias para a condução das negociações imobiliárias.
            </p>
          </div>

          <div>
            <h4 className="text-base font-bold text-white mb-2">
              4. Direitos do Titular
            </h4>
            <p>
              O titular dos dados tem o direito de solicitar a confirmação, o acesso, a correção ou a exclusão de seus dados a qualquer momento, bastando enviar um e-mail para <strong className="text-amber-400">{COMPANY_DATA.email}</strong> ou mensagem para <strong className="text-amber-400">{COMPANY_DATA.phone}</strong>.
            </p>
          </div>

          <div className="pt-4 border-t border-slate-800 text-xs text-slate-400">
            Última atualização: Outubro de 2026. Navegantes – SC.
          </div>

        </div>

        {/* Footer */}
        <div className="bg-slate-950 px-6 py-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-6 py-2.5 rounded-xl text-xs transition-colors"
          >
            Entendido
          </button>
        </div>

      </div>
    </div>
  );
};
