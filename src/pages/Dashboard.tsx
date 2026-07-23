import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getUserCharacters, deleteCharacter, getUserCampaigns, type Campaign } from '../firebase/firestore';
import type { Character } from '../interfaces/Character';
import { Navbar } from '../components/NavBar';
import { Link } from 'react-router-dom';
import { Plus, Trash2, Edit3, Eye, Heart, Zap, Search, FolderPlus, Users, Key, Layers, ArrowRight, ShieldCheck } from 'lucide-react';

export const Dashboard = () => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'fichas' | 'campanhas'>('fichas');
  const [characters, setCharacters] = useState<Character[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    if (currentUser?.uid) {
      try {
        setLoading(true);
        const [charData, campData] = await Promise.all([
          getUserCharacters(currentUser.uid),
          getUserCampaigns(currentUser.uid),
        ]);
        setCharacters(charData);
        setCampaigns(campData);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentUser]);

  const handleDeleteCharacter = async (id: string, name: string) => {
    if (window.confirm(`Tem certeza que deseja apagar a ficha de "${name}"?`)) {
      try {
        await deleteCharacter(id);
        setCharacters((prev) => prev.filter((char) => char.id !== id));
      } catch (error) {
        alert('Erro ao excluir a ficha.');
      }
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans selection:bg-slate-100 dark:selection:bg-slate-800 transition-colors duration-200">
      <Navbar />

      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-8 py-8 sm:py-12">
        {/* CABEÇALHO COM ABAS */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8 sm:mb-12">
          <div>
            <div className="flex items-center flex-wrap gap-2 text-xl sm:text-2xl font-mono uppercase tracking-wider">
              <span className="font-light text-slate-400 dark:text-slate-500">SUAS</span>

              {/* BOTÃO FICHAS */}
              <button
                onClick={() => setActiveTab('fichas')}
                className={`px-3.5 py-1 rounded-xl text-xs sm:text-sm font-mono font-bold tracking-widest transition-all duration-200 active:scale-95 border ${
                  activeTab === 'fichas'
                    ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-950 border-slate-900 dark:border-slate-100 shadow-sm'
                    : 'bg-transparent text-slate-400 border-transparent hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900'
                }`}
              >
                FICHAS
              </button>

              <span className="font-light text-slate-300 dark:text-slate-700">&</span>

              {/* BOTÃO CAMPANHAS */}
              <button
                onClick={() => setActiveTab('campanhas')}
                className={`px-3.5 py-1 rounded-xl text-xs sm:text-sm font-mono font-bold tracking-widest transition-all duration-200 active:scale-95 border ${
                  activeTab === 'campanhas'
                    ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-950 border-slate-900 dark:border-slate-100 shadow-sm'
                    : 'bg-transparent text-slate-400 border-transparent hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900'
                }`}
              >
                CAMPANHAS
              </button>
            </div>

            <p className="text-slate-400 dark:text-slate-500 text-xs mt-2 font-normal">
              {activeTab === 'fichas'
                ? 'Gerencie os investigadores das suas histórias.'
                : 'Acompanhe as campanhas que você participa ou mestra.'}
            </p>
          </div>

          {/* BOTÕES DE AÇÃO RÁPIDA */}
          <div className="w-full lg:w-auto flex flex-wrap items-center gap-2.5 sm:gap-3">
            <Link
              to="/campaign/search"
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200/80 dark:border-slate-800 text-[11px] font-mono font-bold uppercase tracking-wider px-4 py-3 rounded-2xl transition active:scale-95"
            >
              <Search className="w-4 h-4 text-slate-500" />
              Pesquisar Campanha
            </Link>

            <Link
              to="/campaign/new"
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200/80 dark:border-slate-800 text-[11px] font-mono font-bold uppercase tracking-wider px-4 py-3 rounded-2xl transition active:scale-95"
            >
              <FolderPlus className="w-4 h-4 text-slate-500" />
              Criar Campanha
            </Link>

            <Link
              to="/character/new"
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#080b11] hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-slate-200 text-white dark:text-slate-950 text-[11px] font-mono font-extrabold uppercase tracking-widest px-5 py-3 rounded-2xl transition shadow-md active:scale-95"
            >
              <Plus className="w-4 h-4" />
              Nova Ficha
            </Link>
          </div>
        </div>

        {/* CONTEÚDO CENTRAL */}
        {loading ? (
          <div className="text-center py-20 text-slate-400 dark:text-slate-600 font-mono text-xs tracking-widest uppercase animate-pulse">
            Carregando do Limbo...
          </div>
        ) : activeTab === 'fichas' ? (
          /* ================= ABA FICHAS ================= */
          characters.length === 0 ? (
            <div className="border-2 border-dashed border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-8 sm:p-16 text-center max-w-2xl mx-auto my-6 sm:my-8">
              <h2 className="text-xs font-mono font-bold tracking-[0.35em] text-slate-400 dark:text-slate-500 uppercase mb-3">
                NENHUMA FICHA AINDA
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-xs mb-6">
                Você ainda não criou nenhum investigador.
              </p>
              <Link
                to="/character/new"
                className="inline-flex items-center gap-1.5 text-slate-950 dark:text-slate-100 hover:text-slate-700 dark:hover:text-slate-300 text-xs font-extrabold transition"
              >
                <Plus className="w-3.5 h-3.5" />
                Criar meu primeiro personagem
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {characters.map((char) => (
                <div
                  key={char.id}
                  className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl overflow-hidden hover:border-slate-300 dark:hover:border-slate-700 transition shadow-sm hover:shadow-md flex flex-col justify-between"
                >
                  <div>
                    <div className="h-36 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 relative">
                      {char.imagem ? (
                        <img
                          src={char.imagem}
                          alt={char.nome}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-300 dark:text-slate-600 font-mono font-bold uppercase tracking-widest text-sm">
                          {char.arquetipo || 'Investigador'}
                        </div>
                      )}
                    </div>

                    <div className="p-5 sm:p-6">
                      <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 truncate">
                        {char.nome}
                      </h2>
                      <p className="text-[10px] font-mono font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1 truncate">
                        {char.origem || 'Sem Origem'} • {char.arquetipo || 'Sem Arquétipo'}
                      </p>

                      <div className="flex gap-4 sm:gap-5 mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs font-mono">
                        <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                          <Heart className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>
                            {char.vidaAtual ?? 20} / {char.vidaMaxima ?? 20}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                          <Zap className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>
                            {char.peAtual ?? 10} / {char.peMaximo ?? 10}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-50/60 dark:bg-slate-800/40 px-5 sm:px-6 py-3.5 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                    <Link
                      to={`/character/${char.id}`}
                      className="flex items-center gap-1.5 text-slate-900 dark:text-slate-200 hover:text-slate-600 dark:hover:text-slate-400 text-xs font-bold transition py-1"
                    >
                      <Eye className="w-3.5 h-3.5" /> Abrir Ficha
                    </Link>

                    <div className="flex items-center gap-2 sm:gap-3">
                      <Link
                        to={`/character/edit/${char.id}`}
                        className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition"
                        title="Editar"
                        aria-label="Editar"
                      >
                        <Edit3 className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
                      </Link>
                      <button
                        onClick={() => char.id && handleDeleteCharacter(char.id, char.nome)}
                        className="p-1.5 text-slate-300 dark:text-slate-600 hover:text-red-500 dark:hover:text-red-400 transition"
                        title="Excluir"
                        aria-label="Excluir"
                      >
                        <Trash2 className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          /* ================= ABA CAMPANHAS ================= */
          campaigns.length === 0 ? (
            <div className="border-2 border-dashed border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-8 sm:p-16 text-center max-w-2xl mx-auto my-6 sm:my-8">
              <h2 className="text-xs font-mono font-bold tracking-[0.35em] text-slate-400 dark:text-slate-500 uppercase mb-3">
                NENHUMA CAMPANHA AINDA
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-xs mb-6">
                Você não criou e nem participa de nenhuma campanha.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4">
                <Link
                  to="/campaign/new"
                  className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-slate-200 text-white dark:text-slate-950 px-4 py-2.5 rounded-xl text-xs font-bold font-mono uppercase tracking-wider transition"
                >
                  <FolderPlus className="w-4 h-4" />
                  Criar Campanha
                </Link>
                <Link
                  to="/campaign/search"
                  className="inline-flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 px-4 py-2.5 rounded-xl text-xs font-bold font-mono uppercase tracking-wider transition"
                >
                  <Search className="w-4 h-4" />
                  Buscar pelo Código
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {campaigns.map((camp) => {
                const isMaster = camp.criadorId === currentUser?.uid;
                // Redireciona para /mestre/:id caso seja o criador, ou /campaign/:id para jogador
                const targetPath = isMaster ? `/mestre/${camp.id}` : `/campaign/${camp.id}`;

                return (
                  <Link
                    key={camp.id}
                    to={targetPath}
                    className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl overflow-hidden hover:border-slate-400 dark:hover:border-slate-600 transition shadow-sm hover:shadow-md flex flex-col justify-between group cursor-pointer"
                  >
                    <div>
                      <div className="h-36 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 relative overflow-hidden">
                        {camp.imagem ? (
                          <img
                            src={camp.imagem}
                            alt={camp.nome}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-300 dark:text-slate-600 font-mono font-bold uppercase tracking-widest text-sm">
                            <Layers className="w-8 h-8 opacity-40 group-hover:scale-110 transition-transform duration-300" />
                          </div>
                        )}
                        
                        <div className="absolute top-3 right-3 bg-slate-950/80 backdrop-blur-md text-slate-200 font-mono text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 border border-slate-800">
                          <Key className="w-3 h-3 text-slate-400" />
                          {camp.id}
                        </div>
                      </div>

                      <div className="p-5 sm:p-6">
                        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 truncate group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors">
                          {camp.nome}
                        </h2>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-2 h-8">
                          {camp.descricao || 'Sem descrição cadastrada.'}
                        </p>

                        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs font-mono text-slate-400">
                          <Users className="w-3.5 h-3.5 text-slate-400" />
                          <span>{camp.membros?.length || 1} participante(s)</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-slate-50/60 dark:bg-slate-800/40 px-5 sm:px-6 py-3.5 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                      <span className="flex items-center gap-1 text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                        {isMaster && <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />}
                        {isMaster ? 'Mestre (Criador)' : 'Jogador'}
                      </span>

                      <span className="flex items-center gap-1 text-[11px] font-mono font-bold text-slate-500 group-hover:text-slate-900 dark:group-hover:text-slate-100 transition-colors">
                        Entrar{' '}
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )
        )}
      </main>
    </div>
  );
};