import React, { useState } from 'react';
import { X, Lock, Mail, KeyRound, ShieldAlert, Check, Eye, EyeOff } from 'lucide-react';
import { COMPANY_DATA } from '../data/properties';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: () => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess
}) => {
  if (!isOpen) return null;

  const [email, setEmail] = useState('admin@oliveiraeliasexclusive.com.br');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    setTimeout(() => {
      const cleanEmail = email.trim().toLowerCase();
      if (cleanEmail === 'admin@oliveiraeliasexclusive.com.br' && password === 'admin123') {
        onLoginSuccess();
      } else {
        setError('E-mail ou senha incorretos. Verifique suas credenciais.');
      }
      setIsLoading(false);
    }, 400);
  };

  const fillDemoCredentials = () => {
    setEmail('admin@oliveiraeliasexclusive.com.br');
    setPassword('admin123');
    setError('');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="fixed inset-0" onClick={onClose}></div>

      <div className="relative bg-slate-900 text-white rounded-3xl max-w-md w-full shadow-2xl border border-amber-500/40 z-10 overflow-hidden">
        
        {/* Header */}
        <div className="bg-slate-950 px-6 py-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-white">Acesso Restrito</h3>
              <p className="text-xs text-amber-400">Painel do Corretor • Oliveira Elias</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 sm:p-8">
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800 text-xs text-slate-300 leading-relaxed mb-4">
              <p className="font-semibold text-white mb-1 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                Área de Gestão de Conteúdo
              </p>
              Faça login para editar textos do banner principal, imagens e os 6 imóveis em destaque sem alterar o código.
            </div>

            {error && (
              <div className="p-3 bg-red-950/80 border border-red-500/40 rounded-xl text-red-200 text-xs flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-red-400 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                E-mail de Acesso
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@oliveiraeliasexclusive.com.br"
                  className="w-full bg-slate-950 border border-slate-700 focus:border-amber-400 text-white text-sm rounded-xl py-3 pl-10 pr-3.5 outline-none font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Senha
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <KeyRound className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Digite sua senha"
                  className="w-full bg-slate-950 border border-slate-700 focus:border-amber-400 text-white text-sm rounded-xl py-3 pl-10 pr-10 outline-none font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 font-bold text-sm py-3.5 px-6 rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <span>Autenticando...</span>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Entrar no Painel</span>
                  </>
                )}
              </button>
            </div>

            {/* Quick Fill Helper */}
            <div className="pt-3 border-t border-slate-800 text-center">
              <button
                type="button"
                onClick={fillDemoCredentials}
                className="text-[11px] text-amber-400/80 hover:text-amber-300 underline underline-offset-4 cursor-pointer"
              >
                Preencher credenciais padrão (admin@oliveiraeliasexclusive.com.br / admin123)
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
};
