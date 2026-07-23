import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Navbar } from '../components/NavBar';
import { getCampaignById, joinCampaign, type Campaign } from '../firebase/firestore';
import { ArrowLeft, Search, Users, CheckCircle, ShieldAlert } from 'lucide-react';

export const SearchCampaign = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const [searchCode, setSearchCode] = useState('');
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [joining, setJoining] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchCode.trim()) return;

    setLoading(true);
    setSearched(true);
    setCampaign(null);

    try {
      const result = await getCampaignById(searchCode);
      setCampaign(result);
    } catch (error) {
      console.error('Erro na busca:', error);
      alert('Erro ao buscar campanha.');
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async () => {
    if (!campaign || !currentUser) return;

    setJoining(true);
    try {
      await joinCampaign(campaign.id, currentUser.uid);
      alert(`Você entrou na campanha "${campaign.nome}" com sucesso!`);
      navigate('/');
    } catch (error) {
      console.error('Erro ao participar:', error);
      alert('Erro ao entrar na campanha.');
    } finally {
      setJoining(false);
    }
  };

  const isAlreadyMember = campaign && currentUser && campaign.membros?.includes(currentUser.uid);

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

        {/* CARTÃO DE PESQUISA */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm">
          <div className="flex items-center gap-2.5 mb-2">
            <Search className="w-5 h-5 text-slate-700 dark:text-slate-300" />
            <h1 className="text-xl font-mono font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100">
              Pesquisar Campanha
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 font-sans">
            Digite o código único da campanha para encontrá-la no Limbo (Exemplo: <code>mundodragao23</code>).
          </p>

          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 mb-6">
            <input
              type="text"
              required
              value={searchCode}
              onChange={(e) => setSearchCode(e.target.value)}
              placeholder="Digite o código da campanha..."
              className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3 text-xs focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-100 transition"
            />
            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center gap-2 bg-[#080b11] hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-slate-200 text-white dark:text-slate-950 text-xs font-mono font-bold uppercase tracking-widest px-6 py-3.5 rounded-2xl transition shadow-md disabled:opacity-50 active:scale-95"
            >
              {loading ? 'Buscando...' : 'Buscar'}
            </button>
          </form>

          {/* RESULTADOS DA BUSCA */}
          {searched && !loading && (
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
              {campaign ? (
                <div className="border border-slate-200/80 dark:border-slate-800 rounded-2xl overflow-hidden bg-slate-50/50 dark:bg-slate-950/50">
                  {campaign.imagem && (
                    <div className="h-40 w-full overflow-hidden">
                      <img
                        src={campaign.imagem}
                        alt={campaign.nome}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  <div className="p-5">
                    <div className="flex justify-between items-start gap-4 mb-2">
                      <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                        {campaign.nome}
                      </h2>
                      <span className="text-[10px] font-mono bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2.5 py-1 rounded-full font-bold">
                        #{campaign.id}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-400 mb-4 line-clamp-3">
                      {campaign.descricao || 'Sem descrição cadastrada.'}
                    </p>

                    <div className="flex items-center gap-2 text-xs font-mono text-slate-400 mb-5">
                      <Users className="w-4 h-4" />
                      <span>{campaign.membros?.length || 1} participante(s)</span>
                    </div>

                    {isAlreadyMember ? (
                      <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-mono text-xs font-bold bg-emerald-500/10 p-3 rounded-xl">
                        <CheckCircle className="w-4 h-4" />
                        Você já faz parte desta campanha!
                      </div>
                    ) : (
                      <button
                        onClick={handleJoin}
                        disabled={joining}
                        className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-mono text-xs font-extrabold uppercase tracking-widest py-3 rounded-xl transition active:scale-95 disabled:opacity-50"
                      >
                        {joining ? 'Entrando...' : 'Entrar nesta Campanha'}
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-600 dark:text-red-400 text-xs font-mono">
                  <ShieldAlert className="w-5 h-5 shrink-0" />
                  Nenhuma campanha foi encontrada com o código "{searchCode}".
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};