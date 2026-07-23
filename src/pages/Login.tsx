import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

export const Login = () => {
  const location = useLocation();
  const [isRegister, setIsRegister] = useState(location.pathname === '/register');
  
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Palavra sem espaços manuais (o CSS cuidará do espaçamento perfeito)
  const fullTitle = 'LIMBO';
  const [displayedTitle, setDisplayedTitle] = useState('');

  const { login, register } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    let index = 0;
    setDisplayedTitle('');
    const interval = setInterval(() => {
      if (index < fullTitle.length) {
        setDisplayedTitle(fullTitle.substring(0, index + 1));
        index++;
      } else {
        clearInterval(interval);
      }
    }, 200);

    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegister) {
        await register(email, password);
      } else {
        await login(email, password);
      }
      navigate('/');
    } catch (err: any) {
      if (isRegister) {
        setError('Erro ao criar conta. Verifique os dados inseridos.');
      } else {
        setError('E-mail ou senha incorretos.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col items-center justify-center p-4 sm:p-6 py-8 selection:bg-slate-100 dark:selection:bg-slate-800 transition-colors duration-200">
      <div className="w-full max-w-sm flex flex-col items-center">
        
        {/* Título sem quebra de linha com responsividade no tamanho da fonte e espaçamento */}
        <div className="min-h-[50px] sm:min-h-[60px] flex items-center justify-center mb-2">
          <h1 className="text-3xl sm:text-4xl font-light tracking-[0.35em] sm:tracking-[0.45em] text-slate-950 dark:text-slate-100 font-mono whitespace-nowrap pl-[0.35em] sm:pl-[0.45em] flex items-center">
            {displayedTitle}
            <span className="animate-pulse border-r-2 border-slate-950 dark:border-slate-100 h-6 sm:h-7 ml-1 inline-block" />
          </h1>
        </div>

        {/* Os 3 Pontos com Animação de Carregamento */}
        <div className="flex items-center justify-center gap-3 sm:gap-4 my-4 sm:my-6 h-6">
          <span
            className={`w-2 sm:w-2.5 h-2 sm:h-2.5 bg-slate-950 dark:bg-slate-100 rounded-full transition-all duration-300 ${
              loading ? 'animate-bounce [animation-delay:-0.3s]' : 'opacity-100'
            }`}
          />
          <span
            className={`w-2 sm:w-2.5 h-2 sm:h-2.5 bg-slate-950 dark:bg-slate-100 rounded-full transition-all duration-300 ${
              loading ? 'animate-bounce [animation-delay:-0.15s]' : 'opacity-100'
            }`}
          />
          <span
            className={`w-2 sm:w-2.5 h-2 sm:h-2.5 bg-slate-950 dark:bg-slate-100 rounded-full transition-all duration-300 ${
              loading ? 'animate-bounce' : 'opacity-100'
            }`}
          />
        </div>

        {/* Abas Alternadoras (CRIAR CONTA / ENTRAR) */}
        <div className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full p-1 flex items-center mb-6 sm:mb-8 shadow-sm">
          <button
            type="button"
            onClick={() => {
              setIsRegister(true);
              setError('');
            }}
            className={`flex-1 py-2 sm:py-2.5 text-[11px] sm:text-xs font-bold uppercase tracking-wider rounded-full transition-all duration-200 active:scale-95 ${
              isRegister
                ? 'bg-[#080b11] dark:bg-slate-100 text-white dark:text-slate-950 shadow-md'
                : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
            }`}
          >
            Criar Conta
          </button>
          <button
            type="button"
            onClick={() => {
              setIsRegister(false);
              setError('');
            }}
            className={`flex-1 py-2 sm:py-2.5 text-[11px] sm:text-xs font-bold uppercase tracking-wider rounded-full transition-all duration-200 active:scale-95 ${
              !isRegister
                ? 'bg-[#080b11] dark:bg-slate-100 text-white dark:text-slate-950 shadow-md'
                : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
            }`}
          >
            Entrar
          </button>
        </div>

        {/* Mensagem de erro */}
        {error && (
          <div className="w-full mb-4 p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 text-xs rounded-xl text-center font-medium">
            {error}
          </div>
        )}

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="w-full space-y-4 sm:space-y-5">
          {isRegister && (
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5 ml-1">
                Nome
              </label>
              <input
                type="text"
                required
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="seu nome"
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-slate-800 dark:text-slate-100 text-sm placeholder-slate-300 dark:placeholder-slate-600 focus:outline-none focus:border-slate-400 dark:focus:border-slate-600 transition shadow-sm"
              />
            </div>
          )}

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5 ml-1">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="voce@exemplo.com"
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-slate-800 dark:text-slate-100 text-sm placeholder-slate-300 dark:placeholder-slate-600 focus:outline-none focus:border-slate-400 dark:focus:border-slate-600 transition shadow-sm"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5 ml-1">
              Senha
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-slate-800 dark:text-slate-100 text-sm placeholder-slate-300 dark:placeholder-slate-600 focus:outline-none focus:border-slate-400 dark:focus:border-slate-600 transition shadow-sm"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#080b11] hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-slate-200 text-white dark:text-slate-950 text-xs font-extrabold uppercase tracking-widest py-3.5 sm:py-4 rounded-full transition duration-200 shadow-lg disabled:opacity-50 active:scale-[0.98] mt-2"
          >
            {isRegister ? 'Criar Conta' : 'Entrar'}
          </button>
        </form>

        {/* Rodapé Alternador */}
        <p className="mt-6 sm:mt-8 text-xs text-slate-400 dark:text-slate-500">
          {isRegister ? (
            <>
              Já tem conta?{' '}
              <button
                type="button"
                onClick={() => setIsRegister(false)}
                className="text-slate-900 dark:text-slate-100 font-bold hover:underline ml-0.5"
              >
                Entrar
              </button>
            </>
          ) : (
            <>
              Novo por aqui?{' '}
              <button
                type="button"
                onClick={() => setIsRegister(true)}
                className="text-slate-900 dark:text-slate-100 font-bold hover:underline ml-0.5"
              >
                Criar conta
              </button>
            </>
          )
          }
        </p>

      </div>
    </div>
  );
};