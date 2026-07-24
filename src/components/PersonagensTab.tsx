import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getUserCharacters } from '../firebase/firestore';
import type { Character } from '../interfaces/Character';
import { UserPlus, Plus, X, Heart, Zap, User, Check, ExternalLink } from 'lucide-react';

interface PersonagensTabProps {
  campaignId: string;
  campaignCharacters?: Character[];
  onAddCharacterToCampaign?: (characterId: string) => Promise<void>;
}

export const PersonagensTab: React.FC<PersonagensTabProps> = ({
  campaignCharacters = [],
  onAddCharacterToCampaign,
}) => {
  const { currentUser } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userCharacters, setUserCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(false);
  const [linkingId, setLinkingId] = useState<string | null>(null);

  // Carrega as fichas do usuário logado ao abrir o modal
  useEffect(() => {
    if (isModalOpen && currentUser?.uid) {
      const fetchUserChars = async () => {
        setLoading(true);
        try {
          const chars = await getUserCharacters(currentUser.uid);
          setUserCharacters(chars);
        } catch (error) {
          console.error('Erro ao buscar fichas do usuário:', error);
        } finally {
          setLoading(false);
        }
      };
      fetchUserChars();
    }
  }, [isModalOpen, currentUser]);

  // Função para vincular a ficha selecionada
  const handleSelectCharacter = async (charId: string) => {
    if (!onAddCharacterToCampaign) return;
    try {
      setLinkingId(charId);
      await onAddCharacterToCampaign(charId);
      setIsModalOpen(false);
    } catch (error) {
      console.error('Erro ao vincular personagem:', error);
    } finally {
      setLinkingId(null);
    }
  };

  return (
    <div className="w-full flex flex-col gap-6">
      {/* CABEÇALHO COM TÍTULO E BOTÃO */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <h1 className="text-xl font-bold font-mono uppercase tracking-wider text-slate-100">
            Personagens & Indivíduos
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-sans">
            Registros dos investigadores e participantes ativos nesta campanha.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-100 text-xs font-mono font-bold uppercase tracking-wider px-4 py-2.5 rounded-xl transition border border-slate-700/50 active:scale-95 shadow-sm"
        >
          <UserPlus className="w-4 h-4 text-emerald-500" />
          Adicionar Personagem
        </button>
      </div>

      {/* LISTA DE PERSONAGENS DA CAMPANHA */}
      {campaignCharacters.length === 0 ? (
        <div className="border border-dashed border-slate-800 rounded-2xl p-12 text-center my-4 bg-slate-900/30">
          <User className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <h3 className="text-xs font-mono font-bold uppercase text-slate-400 tracking-wider">
            Nenhum personagem vinculado
          </h3>
          <p className="text-xs text-slate-500 mt-1 mb-6">
            Adicione uma de suas fichas para participar desta história.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono font-bold px-4 py-2 rounded-xl transition"
          >
            <Plus className="w-4 h-4" />
            Vincular Personagem
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {campaignCharacters.map((char) => (
            <div
              key={char.id}
              className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 flex flex-col justify-between hover:border-slate-700 transition shadow-sm"
            >
              <div>
                <div className="flex items-start gap-4">
                  {/* Foto/Avatar */}
                  <div className="w-14 h-14 rounded-xl bg-slate-800 border border-slate-700 overflow-hidden flex items-center justify-center shrink-0">
                    {char.imagem ? (
                      <img src={char.imagem} alt={char.nome} className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-6 h-6 text-slate-500" />
                    )}
                  </div>

                  {/* Nome e Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-bold text-slate-100 truncate">{char.nome}</h3>
                    <p className="text-[11px] font-mono text-slate-400 uppercase tracking-wider mt-0.5 truncate">
                      {char.arquetipo || 'Sem Classe'} • {char.origem || 'Sem Origem'}
                    </p>
                  </div>
                </div>

                {/* Atributos / Stats Rápidos */}
                <div className="flex items-center gap-4 mt-4 pt-3 border-t border-slate-800/60 text-xs font-mono text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <Heart className="w-3.5 h-3.5 text-rose-500" />
                    <span>{char.vidaAtual ?? 0} / {char.vidaMaxima ?? 0}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-amber-500" />
                    <span>{char.peAtual ?? 0} / {char.peMaximo ?? 0}</span>
                  </div>
                </div>
              </div>

              {/* Botão para abrir a ficha completa */}
              <div className="mt-4 pt-3 border-t border-slate-800/60 flex justify-end">
                <Link
                  to={`/character/${char.id}`}
                  className="text-xs font-mono font-bold text-slate-400 hover:text-slate-100 flex items-center gap-1 transition"
                >
                  Ver Ficha Completa <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL: SELECIONAR FICHAS CRIADAS */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
            
            {/* Header Modal */}
            <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
              <div>
                <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-slate-100">
                  Seus Personagens Criados
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Escolha uma ficha para adicionar a esta campanha.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Conteúdo/Lista Modal */}
            <div className="p-5 overflow-y-auto flex-1 flex flex-col gap-3">
              {loading ? (
                <div className="text-center py-12 text-xs font-mono text-slate-500 uppercase tracking-widest animate-pulse">
                  Buscando suas fichas...
                </div>
              ) : userCharacters.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  <p className="text-xs">Você ainda não criou nenhum personagem no seu perfil.</p>
                </div>
              ) : (
                userCharacters.map((char) => {
                  const isAlreadyInCampaign = campaignCharacters.some((c) => c.id === char.id);

                  return (
                    <div
                      key={char.id}
                      className={`p-4 rounded-xl border flex items-center justify-between transition ${
                        isAlreadyInCampaign
                          ? 'bg-slate-900/30 border-slate-800/50 opacity-60'
                          : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-lg bg-slate-800 border border-slate-700 overflow-hidden flex items-center justify-center shrink-0">
                          {char.imagem ? (
                            <img src={char.imagem} alt={char.nome} className="w-full h-full object-cover" />
                          ) : (
                            <User className="w-5 h-5 text-slate-500" />
                          )}
                        </div>
                        <div className="truncate">
                          <h4 className="text-xs font-bold text-slate-100 truncate">{char.nome}</h4>
                          <p className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                            {char.arquetipo || 'Sem Classe'}
                          </p>
                        </div>
                      </div>

                      {isAlreadyInCampaign ? (
                        <span className="text-[10px] font-mono font-bold text-slate-500 flex items-center gap-1 uppercase">
                          <Check className="w-3 h-3 text-emerald-500" /> Já na Campanha
                        </span>
                      ) : (
                        <button
                          onClick={() => char.id && handleSelectCharacter(char.id)}
                          disabled={linkingId === char.id}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-950 font-mono text-xs font-bold uppercase rounded-lg transition disabled:opacity-50"
                        >
                          {linkingId === char.id ? 'Vinculando...' : 'Selecionar'}
                        </button>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer Modal: Botão de Criar Personagem */}
            <div className="p-4 border-t border-slate-800 bg-slate-900/40 flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="text-xs text-slate-400">Não encontrou quem procurava?</span>
              <Link
                to="/character/new"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold uppercase tracking-wider px-4 py-2.5 rounded-xl transition"
              >
                <Plus className="w-4 h-4" />
                Criar Novo Personagem
              </Link>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};