import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getUserCharacters, deleteCharacter } from '../firebase/firestore';
import type { Character } from '../interfaces/Character';
import { Navbar } from '../components/NavBar';
import { Link } from 'react-router-dom';
import { Plus, Trash2, Edit3, Eye, Heart, Zap } from 'lucide-react';

export const Dashboard = () => {
  const { currentUser } = useAuth();
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCharacters = async () => {
    if (currentUser?.uid) {
      try {
        setLoading(true);
        const data = await getUserCharacters(currentUser.uid);
        setCharacters(data);
      } catch (error) {
        console.error('Erro ao carregar fichas:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchCharacters();
  }, [currentUser]);

  const handleDelete = async (id: string, name: string) => {
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
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-slate-100">
      <Navbar />

      <main className="max-w-6xl mx-auto px-8 py-12">
        {/* Cabeçalho do Dashboard */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-12">
          <div>
            <h1 className="text-3xl font-mono font-light tracking-[0.35em] text-slate-950 uppercase">
              SUAS FICHAS
            </h1>
            <p className="text-slate-400 text-xs mt-2 font-normal">
              Gerencie os investigadores das suas campanhas.
            </p>
          </div>

          <Link
            to="/character/new"
            className="flex items-center gap-2 bg-[#080b11] hover:bg-slate-800 text-white text-[11px] font-extrabold uppercase tracking-widest px-6 py-3 rounded-full transition shadow-md"
          >
            <Plus className="w-4 h-4" />
            Nova Ficha
          </Link>
        </div>

        {/* Conteúdo Central */}
        {loading ? (
          <div className="text-center py-20 text-slate-400 font-mono text-xs tracking-widest uppercase">
            Buscando fichas no Limbo...
          </div>
        ) : characters.length === 0 ? (
          /* Card do Estado Vazio (Sem fichas) */
          <div className="border-2 border-dashed border-slate-200/80 rounded-3xl p-16 text-center max-w-2xl mx-auto my-8">
            <h2 className="text-xs font-mono font-bold tracking-[0.35em] text-slate-400 uppercase mb-3">
              NENHUMA FICHA AINDA
            </h2>
            <p className="text-slate-500 text-xs mb-6">
              Você ainda não criou nenhum investigador.
            </p>
            <Link
              to="/character/new"
              className="inline-flex items-center gap-1.5 text-slate-950 hover:text-slate-700 text-xs font-extrabold transition"
            >
              <Plus className="w-3.5 h-3.5" />
              Criar meu primeiro personagem
            </Link>
          </div>
        ) : (
          /* Grid de Fichas (Caso existam personagens cadastrados) */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {characters.map((char) => (
              <div
                key={char.id}
                className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden hover:border-slate-300 transition shadow-sm hover:shadow-md flex flex-col justify-between"
              >
                <div>
                  <div className="h-36 bg-slate-50 border-b border-slate-100 relative">
                    {char.imagem ? (
                      <img
                        src={char.imagem}
                        alt={char.nome}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-300 font-mono font-bold uppercase tracking-widest text-sm">
                        {char.arquetipo || 'Investigador'}
                      </div>
                    )}
                  </div>

                  <div className="p-6">
                    <h2 className="text-lg font-bold text-slate-900">{char.nome}</h2>
                    <p className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest mt-1">
                      {char.origem} • {char.arquetipo}
                    </p>

                    <div className="flex gap-5 mt-5 pt-4 border-t border-slate-100 text-xs font-mono">
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <Heart className="w-3.5 h-3.5 text-red-500" />
                        <span>
                          {char.vidaAtual ?? 20} / {char.vidaMaxima ?? 20}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <Zap className="w-3.5 h-3.5 text-amber-500" />
                        <span>
                          {char.peAtual ?? 10} / {char.peMaximo ?? 10}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50/60 px-6 py-3.5 border-t border-slate-100 flex justify-between items-center">
                  <Link
                    to={`/character/${char.id}`}
                    className="flex items-center gap-1.5 text-slate-900 hover:text-slate-600 text-xs font-bold"
                  >
                    <Eye className="w-3.5 h-3.5" /> Abrir Ficha
                  </Link>

                  <div className="flex items-center gap-3">
                    <Link
                      to={`/character/edit/${char.id}`}
                      className="text-slate-400 hover:text-slate-700 transition"
                      title="Editar"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </Link>
                    <button
                      onClick={() => char.id && handleDelete(char.id, char.nome)}
                      className="text-slate-300 hover:text-red-500 transition"
                      title="Excluir"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};