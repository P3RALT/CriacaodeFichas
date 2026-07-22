import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { createCharacter, getCharacterById, updateCharacter } from '../firebase/firestore';
import { Navbar } from '../components/NavBar';
import { LISTA_PERICIAS } from '../data/periciasData';
import type { ProficiencyLevel } from '../interfaces/Character';
import { 
  ArrowLeft, Save, Heart, Zap, User, Sparkles, 
  Image as ImageIcon, FileText, Shield, BookOpen, Award, Target 
} from 'lucide-react';

const getModifier = (score: number): number => Math.floor((score - 10) / 2);

const getMaestriaByLevel = (level: number): number => {
  if (level <= 4) return 2;
  if (level <= 8) return 3;
  if (level <= 12) return 4;
  if (level <= 16) return 5;
  return 6;
};

export const NewCharacter = () => {
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEditing);

  // Informações Básicas
  const [nome, setNome] = useState('');
  const [nivel, setNivel] = useState<number>(1);
  const [origem, setOrigem] = useState('');
  const [arquetipo, setArquetipo] = useState('');
  const [imagem, setImagem] = useState('');

  // Atributos Principais (Iniciam em 10)
  const [fisico, setFisico] = useState<number>(10);
  const [conhecimento, setConhecimento] = useState<number>(10);
  const [sabedoria, setSabedoria] = useState<number>(10);
  const [vigor, setVigor] = useState<number>(10);
  const [presenca, setPresenca] = useState<number>(10);

  // Perícias Selecionadas
  const [pericias, setPericias] = useState<Record<string, ProficiencyLevel>>({});

  // Defesa
  const [armadura, setArmadura] = useState<number>(0);
  const [outrosDefesa, setOutrosDefesa] = useState<number>(0);

  // Status
  const [vidaMaxima, setVidaMaxima] = useState<number>(10);
  const [vidaAtual, setVidaAtual] = useState<number>(10);
  const [peMaximo, setPeMaximo] = useState<number>(2);
  const [peAtual, setPeAtual] = useState<number>(2);

  // Textos Livres
  const [conhecimentosText, setConhecimentosText] = useState('');
  const [historia, setHistoria] = useState('');

  // --- CÁLCULOS AUTOMÁTICOS ---
  const maestria = getMaestriaByLevel(nivel);

  const modFisico = getModifier(fisico);
  const modConhecimento = getModifier(conhecimento);
  const modSabedoria = getModifier(sabedoria);
  const modPresenca = getModifier(presenca);
  const modVigor = getModifier(vigor);

  const modMap: Record<string, number> = {
    fisico: modFisico,
    conhecimento: modConhecimento,
    sabedoria: modSabedoria,
    presenca: modPresenca,
  };

  // Defesa = 10 + Mod. Físico + Armadura + Outros
  const defesaTotal = 10 + modFisico + (Number(armadura) || 0) + (Number(outrosDefesa) || 0);

  // --- REGRA DE DISTRIBUIÇÃO DE ATRIBUTOS (1 em 1) ---
  const atributosLista = [fisico, conhecimento, sabedoria, vigor, presenca];
  
  // Base de 12 pontos
  const pontosBase = 12;
  
  // Pontos ganhos ao reduzir atributos abaixo de 10 (1 por 1)
  const pontosGanhos = atributosLista.reduce((acc, val) => acc + (val < 10 ? 10 - val : 0), 0);
  
  // Pontos gastos ao aumentar atributos acima de 10 (1 por 1)
  const pontosGastos = atributosLista.reduce((acc, val) => acc + (val > 10 ? val - 10 : 0), 0);
  
  const pontosTotaisDisponiveis = pontosBase + pontosGanhos;
  const pontosRestantes = pontosBase + pontosGanhos - pontosGastos;

  // Regra de Perícias no Nível 1
  const limitePericiasNivel1 = Math.max(0, 2 + modConhecimento);
  const periciasTreinadasCount = Object.keys(pericias).length;

  // Sincroniza Vida Máxima com Vigor Bruto e PE com Maestria + Mod. Vigor
  useEffect(() => {
    if (!isEditing) {
      setVidaMaxima(vigor);
      setVidaAtual(vigor);

      const peCalculado = maestria + modVigor;
      setPeMaximo(peCalculado);
      setPeAtual(peCalculado);
    }
  }, [vigor, maestria, modVigor, isEditing]);

  // Carrega dados se estiver editando
  useEffect(() => {
    if (isEditing && id) {
      const loadCharacter = async () => {
        try {
          const char = await getCharacterById(id);
          if (char) {
            setNome(char.nome || '');
            setNivel(char.nivel ?? 1);
            setOrigem(char.origem || '');
            setArquetipo(char.arquetipo || char.profissao || '');
            setImagem(char.imagem || '');
            setVidaMaxima(char.vidaMaxima ?? 10);
            setVidaAtual(char.vidaAtual ?? 10);
            setPeMaximo(char.peMaximo ?? 2);
            setPeAtual(char.peAtual ?? 2);
            setArmadura(char.armadura ?? 0);
            setOutrosDefesa(char.outrosDefesa ?? 0);

            if (char.atributos) {
              setFisico(char.atributos.fisico ?? 10);
              setConhecimento(char.atributos.conhecimento ?? 10);
              setSabedoria(char.atributos.sabedoria ?? 10);
              setVigor(char.atributos.vigor ?? 10);
              setPresenca(char.atributos.presenca ?? 10);
            }

            if (char.pericias && typeof char.pericias === 'object') {
              setPericias(char.pericias as Record<string, ProficiencyLevel>);
            }

            setConhecimentosText(char.conhecimentosText || '');
            setHistoria(char.historia || '');
          }
        } catch (error) {
          console.error('Erro ao carregar personagem:', error);
        } finally {
          setFetching(false);
        }
      };
      loadCharacter();
    }
  }, [id, isEditing]);

  const handleTogglePericia = (nomePericia: string, level: ProficiencyLevel) => {
    setPericias((prev) => {
      const current = prev[nomePericia];
      const updated = { ...prev };
      if (current === level) {
        delete updated[nomePericia];
      } else {
        updated[nomePericia] = level;
      }
      return updated;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    if (pontosRestantes < 0) {
      alert('Você distribuiu mais pontos de atributo do que o permitido!');
      return;
    }

    setLoading(true);

    const characterData = {
      uid: currentUser.uid,
      nome,
      nivel: Number(nivel),
      maestria,
      origem,
      arquetipo,
      profissao: arquetipo,
      imagem,
      vidaMaxima: Number(vidaMaxima),
      vidaAtual: Number(vidaAtual),
      peMaximo: Number(peMaximo),
      peAtual: Number(peAtual),
      armadura: Number(armadura),
      outrosDefesa: Number(outrosDefesa),
      defesaTotal,
      atributos: {
        fisico: Number(fisico),
        conhecimento: Number(conhecimento),
        sabedoria: Number(sabedoria),
        vigor: Number(vigor),
        presenca: Number(presenca),
      },
      pericias,
      conhecimentosText,
      historia,
    };

    try {
      if (isEditing && id) {
        await updateCharacter(id, characterData);
      } else {
        await createCharacter(characterData);
      }
      navigate('/');
    } catch (error) {
      console.error('Erro ao salvar ficha:', error);
      alert('Erro ao salvar a ficha. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="text-center py-20 font-mono text-xs text-slate-400 uppercase tracking-widest">
          Carregando dados da ficha...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-slate-100">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-900 text-xs font-mono font-bold uppercase tracking-wider transition"
          >
            <ArrowLeft className="w-4 h-4" /> Voltar ao Dashboard
          </Link>

          <h1 className="text-xl font-mono font-light tracking-[0.35em] text-slate-950 uppercase">
            {isEditing ? 'EDITAR FICHA' : 'NOVA FICHA'}
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* COLUNA ESQUERDA */}
            <div className="lg:col-span-7 xl:col-span-8 space-y-6">
              
              {/* Informações Pessoais */}
              <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-slate-400" />
                    <h2 className="text-xs font-mono font-bold tracking-[0.2em] text-slate-900 uppercase">
                      Informações Pessoais
                    </h2>
                  </div>
                  <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1 rounded-full text-xs font-mono font-bold text-slate-700">
                    <Award className="w-3.5 h-3.5 text-amber-500" />
                    <span>Maestria: +{maestria}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-1.5 ml-1">
                      Nome do Personagem
                    </label>
                    <input
                      type="text" required value={nome}
                      onChange={(e) => setNome(e.target.value)}
                      placeholder="Ex: Arthur Pendelton"
                      className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 text-sm focus:outline-none focus:border-slate-400 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-1.5 ml-1">
                      Nível (1 - 20) *
                    </label>
                    <select
                      value={nivel}
                      onChange={(e) => setNivel(Number(e.target.value))}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 text-sm font-mono font-bold focus:outline-none focus:border-slate-400 transition"
                    >
                      {Array.from({ length: 20 }, (_, i) => i + 1).map((lvl) => (
                        <option key={lvl} value={lvl}>Nível {lvl}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-1.5 ml-1">
                      Profissão
                    </label>
                    <input
                      type="text" required value={arquetipo}
                      onChange={(e) => setArquetipo(e.target.value)}
                      placeholder="Engenharia, T.I, Medicina"
                      className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 text-sm focus:outline-none focus:border-slate-400 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-1.5 ml-1">
                      Origem
                    </label>
                    <input
                      type="text" required value={origem}
                      onChange={(e) => setOrigem(e.target.value)}
                      placeholder="Ex: Sedutor..."
                      className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 text-sm focus:outline-none focus:border-slate-400 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-1.5 ml-1 flex items-center gap-1">
                      <ImageIcon className="w-3 h-3 text-slate-400" /> URL da Imagem
                    </label>
                    <input
                      type="url" value={imagem}
                      onChange={(e) => setImagem(e.target.value)}
                      placeholder="https://exemplo.com/foto.jpg"
                      className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 text-sm focus:outline-none focus:border-slate-400 transition"
                    />
                  </div>
                </div>
              </div>

              {/* Pontos de Status */}
              <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-5">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                  <Heart className="w-4 h-4 text-slate-400" />
                  <h2 className="text-xs font-mono font-bold tracking-[0.2em] text-slate-900 uppercase">
                    Pontos de Status
                  </h2>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-1.5 ml-1 flex items-center gap-1">
                      <Heart className="w-3 h-3 text-red-500" /> Vida Máx.
                    </label>
                    <input
                      type="number" value={vidaMaxima}
                      onChange={(e) => setVidaMaxima(Number(e.target.value))}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 text-sm font-mono focus:outline-none focus:border-slate-400 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-1.5 ml-1">
                      Vida Atual
                    </label>
                    <input
                      type="number" value={vidaAtual}
                      onChange={(e) => setVidaAtual(Number(e.target.value))}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 text-sm font-mono focus:outline-none focus:border-slate-400 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-1.5 ml-1 flex items-center gap-1">
                      <Zap className="w-3 h-3 text-amber-500" /> PE Máx.
                    </label>
                    <input
                      type="number" value={peMaximo}
                      onChange={(e) => setPeMaximo(Number(e.target.value))}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 text-sm font-mono focus:outline-none focus:border-slate-400 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-1.5 ml-1">
                      PE Atual
                    </label>
                    <input
                      type="number" value={peAtual}
                      onChange={(e) => setPeAtual(Number(e.target.value))}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 text-sm font-mono focus:outline-none focus:border-slate-400 transition"
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100">
                  <div className="flex items-center gap-2 mb-3">
                    <Shield className="w-3.5 h-3.5 text-slate-500" />
                    <span className="text-[11px] font-mono font-bold tracking-wider text-slate-700 uppercase">
                      Cálculo de Defesa (10 + Mod. Físico + Armadura + Bônus)
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                    <div>
                      <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-2 ml-1">Bônus Armadura</label>
                      <input
                        type="number" value={armadura}
                        onChange={(e) => setArmadura(Number(e.target.value))}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-slate-800 text-sm font-mono focus:outline-none focus:border-slate-400 transition"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-2 ml-1">Bônus Extra</label>
                      <input
                        type="number" value={outrosDefesa}
                        onChange={(e) => setOutrosDefesa(Number(e.target.value))}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-slate-800 text-sm font-mono focus:outline-none focus:border-slate-400 transition"
                      />
                    </div>
                    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-2.5 text-center flex flex-col justify-center items-center h-full">
                      <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest">Defesa Total</span>
                      <span className="text-xl font-mono font-extrabold text-slate-900 mt-0.5">{defesaTotal}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tabela de Atributos */}
              <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-slate-400" />
                    <h2 className="text-xs font-mono font-bold tracking-[0.2em] text-slate-900 uppercase">Atributos Principais</h2>
                  </div>
                  <div className={`text-xs font-mono font-bold px-3 py-1 rounded-full border transition ${pontosRestantes < 0 ? 'bg-red-50 text-red-600 border-red-200' : 'bg-slate-50 text-slate-800 border-slate-200'}`}>
                    Restantes: {pontosRestantes} / {pontosTotaisDisponiveis}
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                        <th className="pb-2 pl-2">Atributo</th>
                        <th className="pb-2 text-center">Valor Bruto</th>
                        <th className="pb-2 text-center">Modificador</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs font-mono">
                      {[
                        { label: 'FÍSICO', val: fisico, set: setFisico },
                        { label: 'CONHECIMENTO', val: conhecimento, set: setConhecimento },
                        { label: 'SABEDORIA', val: sabedoria, set: setSabedoria },
                        { label: 'VIGOR', val: vigor, set: setVigor },
                        { label: 'PRESENÇA', val: presenca, set: setPresenca },
                      ].map((attr) => {
                        const mod = getModifier(attr.val);
                        return (
                          <tr key={attr.label} className="hover:bg-slate-50/50 transition">
                            <td className="py-2.5 pl-2 font-bold text-slate-800">{attr.label}</td>
                            <td className="py-4 text-center">
                              <input
                                type="number" step="1"
                                value={attr.val}
                                onChange={(e) => attr.set(Number(e.target.value))}
                                className="w-16 text-center bg-slate-50 border border-slate-200 rounded-lg py-1 font-bold text-slate-900 focus:outline-none focus:border-slate-400"
                              />
                            </td>
                            <td className="py-2.5 text-center font-extrabold text-slate-900">
                              {mod >= 0 ? `+${mod}` : mod}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Anotações e História */}
              <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                  <BookOpen className="w-4 h-4 text-slate-400" />
                  <h2 className="text-xs font-mono font-bold tracking-[0.2em] text-slate-900 uppercase">Anotações</h2>
                </div>
                <textarea
                  rows={2} value={conhecimentosText}
                  onChange={(e) => setConhecimentosText(e.target.value)}
                  placeholder="Idiomas, especializações extras..."
                  className="w-full bg-white border border-slate-200 rounded-xl p-3 text-slate-800 text-xs focus:outline-none focus:border-slate-400 transition"
                />
              </div>
              <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                  <FileText className="w-4 h-4 text-slate-400" />
                  <h2 className="text-xs font-mono font-bold tracking-[0.2em] text-slate-900 uppercase">História</h2>
                </div>
                <textarea
                  rows={3} value={historia}
                  onChange={(e) => setHistoria(e.target.value)}
                  placeholder="Seu passado..."
                  className="w-full bg-white border border-slate-200 rounded-xl p-3 text-slate-800 text-xs focus:outline-none focus:border-slate-400 transition"
                />
              </div>
            </div>

            {/* COLUNA DIREITA (Perícias Sticky) */}
            <div className="lg:col-span-5 xl:col-span-4 lg:sticky lg:top-6 space-y-6">
              <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-sm space-y-4">
                <div className="border-b border-slate-100 pb-3">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-slate-400" />
                      <h2 className="text-xs font-mono font-bold tracking-[0.2em] text-slate-900 uppercase">Perícias</h2>
                    </div>
                    {nivel === 1 && (
                      <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                        N1: {periciasTreinadasCount}/{limitePericiasNivel1}
                      </span>
                    )}
                  </div>
                  <p className="text-slate-400 text-[10px]">T (+M) ou E (+2xM)</p>
                </div>
                <div className="space-y-3 max-h-[72vh] overflow-y-auto pr-1">
                  {(['fisico', 'conhecimento', 'presenca', 'sabedoria'] as const).map((attrKey) => {
                    const periciasDoAttr = LISTA_PERICIAS.filter((p) => p.atributo === attrKey);
                    const attrMod = modMap[attrKey];
                    return (
                      <div key={attrKey} className="bg-slate-50/70 border border-slate-200/60 rounded-xl p-2.5 space-y-1.5">
                        <div className="flex justify-between items-center border-b border-slate-200/50 pb-1">
                          <span className="text-[10px] font-mono font-extrabold text-slate-800 uppercase">{attrKey}</span>
                          <span className="text-[10px] font-mono font-bold text-slate-400">Mod: {attrMod >= 0 ? `+${attrMod}` : attrMod}</span>
                        </div>
                        <div className="space-y-1">
                          {periciasDoAttr.map((item) => {
                            const level = pericias[item.nome];
                            let bonusTotal = attrMod;
                            if (level === 'treinado') bonusTotal += maestria;
                            if (level === 'expert') bonusTotal += maestria * 2;
                            return (
                              <div key={item.nome} className="flex items-center justify-between bg-white border border-slate-200/60 rounded-lg px-2.5 py-1.5 text-xs hover:border-slate-300 transition">
                                <div className="flex items-center gap-1.5">
                                  <span className="font-mono font-medium text-slate-800 text-[11px]">{item.nome}</span>
                                  <span className="text-[10px] font-mono font-extrabold text-slate-900 bg-slate-100 px-1 rounded">{bonusTotal >= 0 ? `+${bonusTotal}` : bonusTotal}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <label className="flex items-center gap-0.5 cursor-pointer select-none">
                                    <input type="checkbox" checked={level === 'treinado' || level === 'expert'} onChange={() => handleTogglePericia(item.nome, 'treinado')} className="w-3 h-3 rounded border-slate-300 text-slate-900 focus:ring-slate-400" />
                                    <span className="text-[9px] font-mono font-bold text-slate-500 uppercase">T</span>
                                  </label>
                                  <label className="flex items-center gap-0.5 cursor-pointer select-none">
                                    <input type="checkbox" checked={level === 'expert'} onChange={() => handleTogglePericia(item.nome, 'expert')} className="w-3 h-3 rounded border-slate-300 text-slate-900 focus:ring-slate-400" />
                                    <span className="text-[9px] font-mono font-bold text-slate-500 uppercase">E</span>
                                  </label>
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

          {/* Botões de Ação */}
          <div className="flex items-center justify-end gap-4 pt-4 border-t border-slate-100">
            <Link to="/" className="px-6 py-3 rounded-full border border-slate-200 text-slate-600 hover:text-slate-900 text-xs font-mono font-bold uppercase transition">Cancelar</Link>
            <button type="submit" disabled={loading || pontosRestantes < 0} className="flex items-center gap-2 bg-[#080b11] hover:bg-slate-800 text-white text-xs font-mono font-bold uppercase tracking-widest px-8 py-3.5 rounded-full transition shadow-md disabled:opacity-50">
              <Save className="w-4 h-4" />
              {loading ? 'Salvando...' : isEditing ? 'Atualizar Ficha' : 'Salvar Ficha'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};