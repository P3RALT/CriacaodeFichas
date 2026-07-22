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
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="text-center py-20 font-mono text-xs text-slate-400 uppercase tracking-widest">
          Carregando ficha do personagem...
        </div>
      </div>
    );
  }

  if (!char) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="text-center py-20 font-mono text-sm text-red-500">
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
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-slate-100">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* CABEÇALHO */}
        <div className="flex items-center justify-between mb-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-900 text-xs font-mono font-bold uppercase tracking-wider transition"
          >
            <ArrowLeft className="w-4 h-4" /> Dashboard
          </Link>

          <button
            onClick={() => navigate(`/character/edit/${id}`)}
            className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-mono font-bold uppercase tracking-wider px-5 py-2.5 rounded-full transition shadow-sm"
          >
            <Edit3 className="w-3.5 h-3.5" /> Editar Ficha
          </button>
        </div>

        {/* CARTÃO PRINCIPAL DO PERSONAGEM */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* PAINEL DA ESQUERDA: INFOS & STATUS */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-6">
            
            {/* CARD DE CABEÇALHO / FOTO */}
            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row items-center gap-6">
              {char.imagem ? (
                <img
                  src={char.imagem}
                  alt={char.nome}
                  className="w-28 h-28 rounded-2xl object-cover border border-slate-200 shadow-inner"
                />
              ) : (
                <div className="w-28 h-28 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400">
                  <User className="w-10 h-10" />
                </div>
              )}

              <div className="space-y-2 text-center sm:text-left flex-1">
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400">
                    Nível {char.nivel}
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                    Maestria +{char.maestria ?? 2}
                  </span>
                </div>
                <h1 className="text-2xl font-mono font-bold text-slate-900 uppercase tracking-tight">
                  {char.nome}
                </h1>
                <p className="text-xs font-mono text-slate-500">
                  <strong className="text-slate-800">{char.arquetipo || char.profissao}</strong> | Origem: {char.origem || 'N/A'}
                </p>
              </div>
            </div>

            {/* STATUS EM TEMPO REAL (VIDA, PE, DEFESA) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              
              {/* VIDA */}
              <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-sm space-y-3">
                <div className="flex items-center justify-between text-xs font-mono font-bold uppercase text-slate-500">
                  <span className="flex items-center gap-1.5 text-red-600"><Heart className="w-4 h-4 fill-red-500/20" /> Vida</span>
                  <span>{char.vidaAtual} / {char.vidaMaxima}</span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <button onClick={() => handleStatChange('vidaAtual', -1)} className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 font-mono font-bold text-slate-700 transition">-</button>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div className="bg-red-500 h-full transition-all" style={{ width: `${Math.min(100, Math.max(0, (char.vidaAtual / char.vidaMaxima) * 100))}%` }} />
                  </div>
                  <button onClick={() => handleStatChange('vidaAtual', 1)} className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 font-mono font-bold text-slate-700 transition">+</button>
                </div>
              </div>

              {/* PE */}
              <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-sm space-y-3">
                <div className="flex items-center justify-between text-xs font-mono font-bold uppercase text-slate-500">
                  <span className="flex items-center gap-1.5 text-amber-600"><Zap className="w-4 h-4 fill-amber-500/20" /> PE</span>
                  <span>{char.peAtual} / {char.peMaximo}</span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <button onClick={() => handleStatChange('peAtual', -1)} className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 font-mono font-bold text-slate-700 transition">-</button>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div className="bg-amber-500 h-full transition-all" style={{ width: `${Math.min(100, Math.max(0, (char.peAtual / char.peMaximo) * 100))}%` }} />
                  </div>
                  <button onClick={() => handleStatChange('peAtual', 1)} className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 font-mono font-bold text-slate-700 transition">+</button>
                </div>
              </div>

              {/* DEFESA */}
              <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-sm flex flex-col justify-between items-center text-center">
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1">
                  <Shield className="w-3.5 h-3.5 text-slate-500" /> Defesa Total
                </span>
                <span className="text-3xl font-mono font-extrabold text-slate-900 my-1">{char.defesaTotal}</span>
                <span className="text-[9px] font-mono text-slate-400">Armadura: +{char.armadura || 0} | Extra: +{char.outrosDefesa || 0}</span>
              </div>
            </div>

            {/* ATRIBUTOS */}
            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <Sparkles className="w-4 h-4 text-slate-400" />
                <h2 className="text-xs font-mono font-bold tracking-[0.2em] text-slate-900 uppercase">Atributos</h2>
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
                    <div key={attr.label} className="bg-slate-50 border border-slate-100 rounded-2xl p-3">
                      <span className="block text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wider">{attr.label}</span>
                      <span className="text-lg font-mono font-extrabold text-slate-900">{score}</span>
                      <span className="block text-xs font-mono font-bold text-slate-600">{mod >= 0 ? `+${mod}` : mod}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* HISTÓRIA E ANOTAÇÕES */}
            {(char.conhecimentosText || char.historia) && (
              <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-4">
                {char.conhecimentosText && (
                  <div>
                    <h3 className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1">
                      <BookOpen className="w-3 h-3" /> Anotações & Idiomas
                    </h3>
                    <p className="text-xs text-slate-700 whitespace-pre-wrap">{char.conhecimentosText}</p>
                  </div>
                )}
                {char.historia && (
                  <div className="pt-3 border-t border-slate-100">
                    <h3 className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1">
                      <FileText className="w-3 h-3" /> História
                    </h3>
                    <p className="text-xs text-slate-700 whitespace-pre-wrap">{char.historia}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* PAINEL DA DIREITA: PERÍCIAS */}
          <div className="lg:col-span-5 xl:col-span-4 space-y-6">
            <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-sm space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <Target className="w-4 h-4 text-slate-400" />
                <h2 className="text-xs font-mono font-bold tracking-[0.2em] text-slate-900 uppercase">Perícias Calculadas</h2>
              </div>

              <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
                {(['fisico', 'conhecimento', 'presenca', 'sabedoria'] as const).map((attrKey) => {
                  const periciasDoAttr = LISTA_PERICIAS.filter((p) => p.atributo === attrKey);
                  const attrMod = modMap[attrKey];
                  return (
                    <div key={attrKey} className="bg-slate-50/70 border border-slate-200/60 rounded-xl p-2.5 space-y-1.5">
                      <span className="text-[10px] font-mono font-extrabold text-slate-800 uppercase block border-b border-slate-200/50 pb-1">
                        {attrKey}
                      </span>
                      <div className="space-y-1">
                        {periciasDoAttr.map((item) => {
                          const level = (char.pericias as Record<string, ProficiencyLevel>)?.[item.nome];
                          const maestria = char.maestria ?? 2;
                          
                          let bonusTotal = attrMod;
                          
                          if (level === 'treinado') bonusTotal += maestria;
                          if (level === 'expert') bonusTotal += maestria * 2;

                          return (
                            <div key={item.nome} className="flex items-center justify-between bg-white border border-slate-200/60 rounded-lg px-2.5 py-1.5 text-xs">
                              <span className="font-mono font-medium text-slate-800 text-[11px]">
                                {item.nome}
                              </span>
                              <div className="flex items-center gap-1.5">
                                {level && (
                                  <span className="text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                                    {level === 'treinado' ? 'T' : 'E'}
                                  </span>
                                )}
                                <span className="text-[10px] font-mono font-extrabold text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded">
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