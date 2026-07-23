import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Navbar } from '../components/NavBar';
import { createCampaign } from '../firebase/firestore';
import { ArrowLeft, Sparkles, Image as ImageIcon, Key, Check } from 'lucide-react';

export const CreateCampaign = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [imagem, setImagem] = useState('');
  const [loading, setLoading] = useState(false);

  const diaAtual = new Date().getDate();

  // Gera o código limpo (remove acentos e caracteres especiais para criar um ID seguro no Firestore)
  const generateCampaignCode = (rawName: string) => {
    if (!rawName.trim()) return '';
    const nameFormatted = rawName
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove acentos
      .replace(/[^a-z0-9]/g, '');     // Remove símbolos e pontuações
      
    return `${nameFormatted}${diaAtual}`;
  };

  const campaignCode = generateCampaignCode(nome);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nome.trim()) {
      alert('Por favor, informe o nome da campanha.');
      return;
    }

    if (!currentUser) {
      alert('Você precisa estar autenticado para criar uma campanha.');
      return;
    }

    setLoading(true);

    try {
      await createCampaign({
        id: campaignCode || `campanha-${Date.now()}`,
        nome: nome.trim(),
        descricao: descricao.trim(),
        imagem: imagem.trim(),
        criadorId: currentUser.uid,
        criadoEm: new Date().toISOString(),
        membros: [currentUser.uid],
      });

      alert(`Campanha criada com sucesso! Código: ${campaignCode}`);
      navigate('/');
    } catch (err: any) {
      console.error('Erro ao criar campanha:', err);
      // Exibe a mensagem real do erro (ex: permissão do Firestore, regra de banco, etc.)
      alert(`Erro ao criar campanha: ${err?.message || 'Verifique sua conexão e tente novamente.'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans selection:bg-slate-100 dark:selection:bg-slate-800 transition-colors duration-200">
      <Navbar />

      <main className="flex-1 w-full max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 text-xs font-mono font-bold uppercase tracking-wider mb-6 transition"
        >
          <ArrowLeft className="w-4 h-4" /> Voltar ao Dashboard
        </Link>

        {/* CARTÃO DE CRIAÇÃO DA CAMPANHA */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm">
          <div className="flex items-center gap-2.5 mb-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <h1 className="text-xl font-mono font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100">
              Criar Nova Campanha
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 font-sans">
            Defina os detalhes da aventura e compartilhe o código com seus investigadores.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* NOME DA CAMPANHA */}
            <div>
              <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                Nome da Campanha *
              </label>
              <input
                type="text"
                required
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Ex: Mundo Dragão"
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3 text-xs focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-100 transition"
              />
            </div>

            {/* CÓDIGO DA CAMPANHA */}
            {campaignCode && (
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Key className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <div>
                    <span className="block text-[10px] font-mono uppercase text-amber-700 dark:text-amber-400 font-bold">
                      Código de Acesso Gerado:
                    </span>
                    <span className="text-sm font-mono font-extrabold text-amber-900 dark:text-amber-200">
                      {campaignCode}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* DESCRIÇÃO */}
            <div>
              <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                Descrição
              </label>
              <textarea
                rows={4}
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                placeholder="Descreva brevemente o mistério ou a premissa da história..."
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3 text-xs focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-100 transition"
              />
            </div>

            {/* URL DA IMAGEM DE CAPA */}
            <div>
              <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5" /> URL da Imagem de Capa
              </label>
              <input
                type="url"
                value={imagem}
                onChange={(e) => setImagem(e.target.value)}
                placeholder="https://exemplo.com/imagem.jpg"
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3 text-xs focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-100 transition"
              />
            </div>

            {/* PREVIEW DA IMAGEM */}
            {imagem && (
              <div className="mt-2 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 h-32 bg-slate-100 dark:bg-slate-950">
                <img
                  src={imagem}
                  alt="Preview"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
            )}

            {/* BOTÃO SUBMIT */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-[#080b11] hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-slate-200 text-white dark:text-slate-950 text-xs font-mono font-bold uppercase tracking-widest py-3.5 rounded-full transition shadow-md disabled:opacity-50 active:scale-95"
              >
                <Check className="w-4 h-4" />
                {loading ? 'Criando Campanha...' : 'Criar Campanha'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};