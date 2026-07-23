import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getCharacterById, updateCharacter } from '../firebase/firestore';
import { Navbar } from '../components/NavBar';
import type { Character, ProficiencyLevel } from '../interfaces/Character';
import { LISTA_PERICIAS } from '../data/periciasData';
import { 
  ArrowLeft, Edit3, Heart, Zap, Shield, 
  BookOpen, FileText, User, Sparkles, Target 
} from 'lucide-react';

const getModifier = (score: number): number => Math.floor((score - 10) / 2);

export const ViewCharacter = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [char, setChar] = useState<Character | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const loadData = async () => {
      try {
        const data = await getCharacterById(id);
        if (data) {
          setChar(data as Character);
        }
      } catch (err) {
        console.error('Erro ao carregar ficha:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id]);

  // Alterar HP / PE rapidamente no jogo
  const handleStatChange = async (field: 'vidaAtual' | 'peAtual', delta: number) => {
    if (!char || !id) return;
    const maxVal = field === 'vidaAtual' ? char.vidaMaxima : char.peMaximo;
    const newVal = Math.min(maxVal, Math.max(0, (char[field] || 0) + delta));

    const updated = { ...char, [field]: newVal };
    setChar(updated);

    try {
      await updateCharacter(id, { [field]: newVal });
    } catch (err) {
      console.error('Erro ao atualizar status:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 transition-colors duration-200">
        <Navbar />
        <div className="text-center py-20 font-mono text-xs text-slate-400 dark:text-slate-500 uppercase tracking-widest animate-pulse">
          Carregando ficha do personagem...
        </div>
      </div>
    );
  }

  if (!char) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 transition-colors duration-200">
        <Navbar />
        <div className="text-center py-20 font-mono text-sm text-red-500 dark:text-red-400">
          Personagem não encontrado.
        </div>
      </div>
    );
  }

  const modMap: Record<string, number> = {
    fisico: getModifier(char.atributos?.fisico ?? 10),
    conhecimento: getModifier(char.atributos?.conhecimento ?? 10),
    sabedoria: getModifier(char.atributos?.sabedoria ?? 10),
    presenca: getModifier(char.atributos?.presenca ?? 10),
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans selection:bg-slate-100 dark:selection:bg-slate-800 transition-colors duration-200">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* CABEÇALHO */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 text-xs font-mono font-bold uppercase tracking-wider transition"
          >
            <ArrowLeft className="w-4 h-4" /> Dashboard
          </Link>

          <button
            onClick={() => navigate(`/character/edit/${id}`)}
            className="inline-flex items-center justify-center gap-2 bg-[#080b11] hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-slate-200 text-white dark:text-slate-950 text-xs font-mono font-bold uppercase tracking-wider px-5 py-2.5 rounded-full transition shadow-sm active:scale-95"
          >
            <Edit3 className="w-3.5 h-3.5" /> Editar Ficha
          </button>
        </div>

        {/* CARTÃO PRINCIPAL DO PERSONAGEM */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
          
          {/* PAINEL DA ESQUERDA: INFOS & STATUS */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-6">
            
            {/* CARD DE CABEÇALHO / FOTO */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-4 sm:p-6 shadow-sm flex flex-col sm:flex-row items-center gap-6">
              {char.imagem ? (
                <img
                  src={char.imagem}
                  alt={char.nome}
                  className="w-28 h-28 rounded-2xl object-cover border border-slate-200 dark:border-slate-800 shadow-inner"
                />
              ) : (
                <div className="w-28 h-28 rounded-2xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-600">
                  <User className="w-10 h-10" />
                </div>
              )}

              <div className="space-y-2 text-center sm:text-left flex-1">
                <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                    Nível {char.nivel}
                  </span>
                  <span className="text-slate-300 dark:text-slate-700">•</span>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border border-amber-200/50 dark:border-amber-900/50 px-2.5 py-0.5 rounded-full">
                    Maestria +{char.maestria ?? 2}
                  </span>
                </div>
                <h1 className="text-2xl font-mono font-bold text-slate-900 dark:text-slate-100 uppercase tracking-tight">
                  {char.nome}
                </h1>
                <p className="text-xs font-mono text-slate-500 dark:text-slate-400">
                  <strong className="text-slate-800 dark:text-slate-200">{char.arquetipo || char.profissao}</strong> | Origem: {char.origem || 'N/A'}
                </p>
              </div>
            </div>

            {/* STATUS EM TEMPO REAL (VIDA, PE, DEFESA) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              
              {/* VIDA */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-4 sm:p-5 shadow-sm space-y-3">
                <div className="flex items-center justify-between text-xs font-mono font-bold uppercase text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1.5 text-red-600 dark:text-red-400"><Heart className="w-4 h-4 fill-red-500/20" /> Vida</span>
                  <span>{char.vidaAtual} / {char.vidaMaxima}</span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <button onClick={() => handleStatChange('vidaAtual', -1)} className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 font-mono font-bold text-slate-700 dark:text-slate-200 transition active:scale-95">-</button>
                  <div className="w-full bg-slate-100 dark:bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-200/50 dark:border-slate-800">
                    <div className="bg-red-500 h-full transition-all duration-300" style={{ width: `${Math.min(100, Math.max(0, (char.vidaAtual / char.vidaMaxima) * 100))}%` }} />
                  </div>
                  <button onClick={() => handleStatChange('vidaAtual', 1)} className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 font-mono font-bold text-slate-700 dark:text-slate-200 transition active:scale-95">+</button>
                </div>
              </div>

              {/* PE */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-4 sm:p-5 shadow-sm space-y-3">
                <div className="flex items-center justify-between text-xs font-mono font-bold uppercase text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400"><Zap className="w-4 h-4 fill-amber-500/20" /> PE</span>
                  <span>{char.peAtual} / {char.peMaximo}</span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <button onClick={() => handleStatChange('peAtual', -1)} className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 font-mono font-bold text-slate-700 dark:text-slate-200 transition active:scale-95">-</button>
                  <div className="w-full bg-slate-100 dark:bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-200/50 dark:border-slate-800">
                    <div className="bg-amber-500 h-full transition-all duration-300" style={{ width: `${Math.min(100, Math.max(0, (char.peAtual / char.peMaximo) * 100))}%` }} />
                  </div>
                  <button onClick={() => handleStatChange('peAtual', 1)} className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 font-mono font-bold text-slate-700 dark:text-slate-200 transition active:scale-95">+</button>
                </div>
              </div>

              {/* DEFESA */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-4 sm:p-5 shadow-sm flex flex-col justify-between items-center text-center">
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 flex items-center gap-1">
                  <Shield className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" /> Defesa Total
                </span>
                <span className="text-3xl font-mono font-extrabold text-slate-900 dark:text-slate-100 my-1">{char.defesaTotal}</span>
                <span className="text-[9px] font-mono text-slate-400 dark:text-slate-500">Armadura: +{char.armadura || 0} | Extra: +{char.outrosDefesa || 0}</span>
              </div>
            </div>

            {/* ATRIBUTOS */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-4 sm:p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <Sparkles className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                <h2 className="text-xs font-mono font-bold tracking-[0.2em] text-slate-900 dark:text-slate-100 uppercase">Atributos</h2>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
                {[
                  { label: 'FÍSICO', val: char.atributos?.fisico },
                  { label: 'CONHECIMENTO', val: char.atributos?.conhecimento },
                  { label: 'SABEDORIA', val: char.atributos?.sabedoria },
                  { label: 'VIGOR', val: char.atributos?.vigor },
                  { label: 'PRESENÇA', val: char.atributos?.presenca },
                ].map((attr) => {
                  const score = attr.val ?? 10;
                  const mod = getModifier(score);
                  return (
                    <div key={attr.label} className="bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800 rounded-2xl p-3">
                      <span className="block text-[9px] font-mono font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{attr.label}</span>
                      <span className="text-lg font-mono font-extrabold text-slate-900 dark:text-slate-100">{score}</span>
                      <span className="block text-xs font-mono font-bold text-slate-600 dark:text-slate-400">{mod >= 0 ? `+${mod}` : mod}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* HISTÓRIA E ANOTAÇÕES */}
            {(char.conhecimentosText || char.historia) && (
              <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-4 sm:p-6 shadow-sm space-y-4">
                {char.conhecimentosText && (
                  <div>
                    <h3 className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1 flex items-center gap-1">
                      <BookOpen className="w-3 h-3" /> Anotações & Idiomas
                    </h3>
                    <p className="text-xs text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">{char.conhecimentosText}</p>
                  </div>
                )}
                {char.historia && (
                  <div className={char.conhecimentosText ? "pt-3 border-t border-slate-100 dark:border-slate-800" : ""}>
                    <h3 className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1 flex items-center gap-1">
                      <FileText className="w-3 h-3" /> História
                    </h3>
                    <p className="text-xs text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">{char.historia}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* PAINEL DA DIREITA: PERÍCIAS (Sticky em Desktop) */}
          <div className="lg:col-span-5 xl:col-span-4 lg:sticky lg:top-6 space-y-6">
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-4 sm:p-5 shadow-sm space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <Target className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                <h2 className="text-xs font-mono font-bold tracking-[0.2em] text-slate-900 dark:text-slate-100 uppercase">Perícias Calculadas</h2>
              </div>

              <div className="space-y-3 max-h-[60vh] sm:max-h-[70vh] overflow-y-auto pr-1 custom-scrollbar">
                {(['fisico', 'conhecimento', 'presenca', 'sabedoria'] as const).map((attrKey) => {
                  const periciasDoAttr = LISTA_PERICIAS.filter((p) => p.atributo === attrKey);
                  const attrMod = modMap[attrKey];
                  return (
                    <div key={attrKey} className="bg-slate-50/70 dark:bg-slate-950/60 border border-slate-200/60 dark:border-slate-800/80 rounded-xl p-2.5 space-y-1.5">
                      <div className="flex justify-between items-center border-b border-slate-200/50 dark:border-slate-800/50 pb-1">
                        <span className="text-[10px] font-mono font-extrabold text-slate-800 dark:text-slate-200 uppercase">{attrKey}</span>
                        <span className="text-[10px] font-mono font-bold text-slate-400 dark:text-slate-500">Mod: {attrMod >= 0 ? `+${attrMod}` : attrMod}</span>
                      </div>
                      <div className="space-y-1">
                        {periciasDoAttr.map((item) => {
                          const level = (char.pericias as Record<string, ProficiencyLevel>)?.[item.nome];
                          const maestria = char.maestria ?? 2;
                          
                          let bonusTotal = attrMod;
                          if (level === 'treinado') bonusTotal += maestria;
                          if (level === 'expert') bonusTotal += maestria * 2;

                          return (
                            <div key={item.nome} className="flex items-center justify-between bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-lg px-2.5 py-1.5 text-xs hover:border-slate-300 dark:hover:border-slate-700 transition">
                              <span className="font-mono font-medium text-slate-800 dark:text-slate-200 text-[11px]">
                                {item.nome}
                              </span>
                              <div className="flex items-center gap-1.5">
                                {level && (
                                  <span className="text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                                    {level === 'treinado' ? 'T' : 'E'}
                                  </span>
                                )}
                                <span className="text-[10px] font-mono font-extrabold text-slate-900 dark:text-slate-100 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                                  {bonusTotal >= 0 ? `+${bonusTotal}` : bonusTotal}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};