import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getCampaignById } from '../firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { 
  ShieldAlert, 
  Plus, 
  Music, 
  Swords, 
  FileText, 
  Copy, 
  Check, 
  Users, 
  Skull, 
  FolderKanban, 
  Pencil,
  Trash2,
  X,
  ExternalLink,
  UserPlus,
  MapPin,
  Smile
} from 'lucide-react';

interface Scene {
  id: string;
  numero: string;
  titulo: string;
  comandoId: string;
  anotacoes: string;
  trilhas?: string[];
  combates?: string[];
}

interface NPC {
  id: string;
  nome: string;
  ocupacao: string; // Ex: Informante, Delegado, Barman
  atitude?: string; // Ex: Amigável, Hostil, Neutro, Suspeito
  localizacao?: string; // Ex: CENA 01 - Taverna
  descricao?: string; // Trejeitos, aparência
  anotacoes?: string; // Segredos, pistas que sabe
}

interface CampaignData {
  id: string;
  nome: string;
  criadorId: string;
}

interface MasterPanelProps {
  campaignName?: string;
  currentCampaign?: CampaignData;
}

export const MasterPanel = ({ campaignName, currentCampaign }: MasterPanelProps) => {
  const { campaignId } = useParams<{ campaignId: string }>();
  const { currentUser } = useAuth();
  
  // Estado da campanha (Busca dinâmica via URL/Props)
  const [campaign, setCampaign] = useState<CampaignData | null>(currentCampaign || null);
  const [loading, setLoading] = useState(!currentCampaign);

  useEffect(() => {
    const fetchCampaign = async () => {
      if (currentCampaign) {
        setCampaign(currentCampaign);
        setLoading(false);
        return;
      }

      if (campaignId) {
        try {
          const fetchedData = await getCampaignById(campaignId);
          if (fetchedData) {
            setCampaign({
              id: fetchedData.id,
              nome: fetchedData.nome,
              criadorId: fetchedData.criadorId || currentUser?.uid || 'mestre-uid-123',
            });
          }
        } catch (error) {
          console.error('Erro ao buscar campanha:', error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    fetchCampaign();
  }, [campaignId, currentCampaign, currentUser]);

  const displayName = campaignName || campaign?.nome || currentCampaign?.nome || 'Carregando...';

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeTool, setActiveTool] = useState<'cenas' | 'npcs' | 'ameacas' | 'fichas'>('cenas');

  // --- ESTADOS DE CENAS ---
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [isSceneModalOpen, setIsSceneModalOpen] = useState(false);
  const [editingSceneId, setEditingSceneId] = useState<string | null>(null);
  const [tempMusicLink, setTempMusicLink] = useState('');
  const [sceneFormData, setSceneFormData] = useState({
    numero: '',
    titulo: '',
    comandoId: '',
    anotacoes: '',
    trilhas: [] as string[],
    combates: '',
  });

  // --- ESTADOS DE NPCS ---
  const [npcs, setNpcs] = useState<NPC[]>([]);
  const [isNpcModalOpen, setIsNpcModalOpen] = useState(false);
  const [editingNpcId, setEditingNpcId] = useState<string | null>(null);
  const [npcFormData, setNpcFormData] = useState({
    nome: '',
    ocupacao: '',
    atitude: 'Neutro',
    localizacao: '',
    descricao: '',
    anotacoes: '',
  });

  // ---------------------------------------------------------------------------
  // LÓGICA DE CENAS
  // ---------------------------------------------------------------------------
  const generateCommandTag = (text: string) => {
    const slug = text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, '');
    return slug ? `!${slug}` : '!cena';
  };

  const handleCopyCommand = (comando: string) => {
    navigator.clipboard.writeText(comando);
    setCopiedId(comando);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleAddMusicLink = () => {
    if (!tempMusicLink.trim()) return;
    setSceneFormData((prev) => ({
      ...prev,
      trilhas: [...prev.trilhas, tempMusicLink.trim()],
    }));
    setTempMusicLink('');
  };

  const handleRemoveMusicLink = (indexToRemove: number) => {
    setSceneFormData((prev) => ({
      ...prev,
      trilhas: prev.trilhas.filter((_, idx) => idx !== indexToRemove),
    }));
  };

  const handleOpenCreateScene = () => {
    setEditingSceneId(null);
    setTempMusicLink('');
    const nextNumber = String(scenes.length + 1).padStart(2, '0');
    setSceneFormData({
      numero: `CENA ${nextNumber}`,
      titulo: '',
      comandoId: '',
      anotacoes: '',
      trilhas: [],
      combates: '',
    });
    setIsSceneModalOpen(true);
  };

  const handleOpenEditScene = (scene: Scene) => {
    setEditingSceneId(scene.id);
    setTempMusicLink('');
    setSceneFormData({
      numero: scene.numero,
      titulo: scene.titulo,
      comandoId: scene.comandoId,
      anotacoes: scene.anotacoes,
      trilhas: scene.trilhas || [],
      combates: scene.combates ? scene.combates.join(', ') : '',
    });
    setIsSceneModalOpen(true);
  };

  const handleSaveScene = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sceneFormData.titulo.trim()) return;

    const finalComando = sceneFormData.comandoId.trim() 
      ? (sceneFormData.comandoId.startsWith('!') ? sceneFormData.comandoId : `!${sceneFormData.comandoId}`)
      : generateCommandTag(sceneFormData.titulo);

    const combatesArray = sceneFormData.combates
      .split(',')
      .map((c) => c.trim())
      .filter((c) => c.length > 0);

    if (editingSceneId) {
      setScenes((prev) =>
        prev.map((sc) =>
          sc.id === editingSceneId
            ? {
                ...sc,
                numero: sceneFormData.numero,
                titulo: sceneFormData.titulo,
                comandoId: finalComando,
                anotacoes: sceneFormData.anotacoes,
                trilhas: sceneFormData.trilhas.length > 0 ? sceneFormData.trilhas : undefined,
                combates: combatesArray.length > 0 ? combatesArray : undefined,
              }
            : sc
        )
      );
    } else {
      const newScene: Scene = {
        id: Date.now().toString(),
        numero: sceneFormData.numero || `CENA ${String(scenes.length + 1).padStart(2, '0')}`,
        titulo: sceneFormData.titulo,
        comandoId: finalComando,
        anotacoes: sceneFormData.anotacoes,
        trilhas: sceneFormData.trilhas.length > 0 ? sceneFormData.trilhas : undefined,
        combates: combatesArray.length > 0 ? combatesArray : undefined,
      };
      setScenes((prev) => [...prev, newScene]);
    }

    setIsSceneModalOpen(false);
  };

  const handleDeleteScene = (id: string) => {
    setScenes((prev) => prev.filter((s) => s.id !== id));
  };

  // ---------------------------------------------------------------------------
  // LÓGICA DE NPCS (SIMPLIFICADA)
  // ---------------------------------------------------------------------------
  const handleOpenCreateNpc = () => {
    setEditingNpcId(null);
    setNpcFormData({
      nome: '',
      ocupacao: '',
      atitude: 'Neutro',
      localizacao: '',
      descricao: '',
      anotacoes: '',
    });
    setIsNpcModalOpen(true);
  };

  const handleOpenEditNpc = (npc: NPC) => {
    setEditingNpcId(npc.id);
    setNpcFormData({
      nome: npc.nome,
      ocupacao: npc.ocupacao || '',
      atitude: npc.atitude || 'Neutro',
      localizacao: npc.localizacao || '',
      descricao: npc.descricao || '',
      anotacoes: npc.anotacoes || '',
    });
    setIsNpcModalOpen(true);
  };

  const handleSaveNpc = (e: React.FormEvent) => {
    e.preventDefault();
    if (!npcFormData.nome.trim()) return;

    if (editingNpcId) {
      setNpcs((prev) =>
        prev.map((npc) =>
          npc.id === editingNpcId
            ? {
                ...npc,
                nome: npcFormData.nome,
                ocupacao: npcFormData.ocupacao,
                atitude: npcFormData.atitude,
                localizacao: npcFormData.localizacao,
                descricao: npcFormData.descricao,
                anotacoes: npcFormData.anotacoes,
              }
            : npc
        )
      );
    } else {
      const newNpc: NPC = {
        id: Date.now().toString(),
        nome: npcFormData.nome,
        ocupacao: npcFormData.ocupacao,
        atitude: npcFormData.atitude,
        localizacao: npcFormData.localizacao,
        descricao: npcFormData.descricao,
        anotacoes: npcFormData.anotacoes,
      };
      setNpcs((prev) => [...prev, newNpc]);
    }

    setIsNpcModalOpen(false);
  };

  const handleDeleteNpc = (id: string) => {
    setNpcs((prev) => prev.filter((n) => n.id !== id));
  };

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-black text-slate-400 flex items-center justify-center font-mono text-xs tracking-widest uppercase animate-pulse">
        Carregando Limbo...
      </div>
    );
  }

  // Trava de Segurança
  const isMaster = currentUser?.uid && (campaign?.criadorId ? campaign.criadorId === currentUser.uid : true);

  if (!isMaster) {
    return (
      <div className="min-h-screen w-full bg-black text-slate-100 flex flex-col justify-center items-center p-6 font-mono">
        <div className="max-w-md w-full bg-slate-900/80 border border-red-950 p-8 rounded-2xl text-center shadow-2xl backdrop-blur-md">
          <ShieldAlert className="w-12 h-12 text-red-500 mx-auto mb-4 animate-pulse" />
          <h1 className="text-xl font-bold uppercase tracking-widest text-red-400 mb-2">
            Acesso Restrito ao Mestre
          </h1>
          <p className="text-xs text-slate-400 leading-relaxed mb-6">
            Você não possui autorização para visualizar as preparações do Limbo desta campanha.
          </p>
          <a
            href="/dashboard"
            className="inline-block bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs uppercase font-bold tracking-wider px-5 py-3 rounded-xl transition border border-slate-700"
          >
            Voltar ao Dashboard
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-black text-slate-100 font-sans selection:bg-slate-800 flex flex-col">
      {/* Topbar com Nome Atualizado */}
      <header className="border-b border-slate-900 bg-black/90 px-6 py-4 flex justify-between items-center text-xs font-mono">
        <div className="flex items-center gap-3">
          <span className="font-bold tracking-widest text-slate-100 uppercase">L I M B O</span>
          <span className="text-slate-600">•</span>
          <span className="text-slate-500 uppercase tracking-wider text-[11px]">PAINEL DO MESTRE</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-500 uppercase">CAMPANHA</span>
          <span className="font-bold text-slate-200">{displayName}</span>
        </div>
      </header>

      <div className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 flex flex-col lg:flex-row gap-10">
        {/* SIDEBAR DE FERRAMENTAS */}
        <aside className="w-full lg:w-64 shrink-0 flex flex-col gap-6">
          <div>
            <h3 className="text-[10px] font-mono font-bold text-slate-600 uppercase tracking-widest mb-3 px-2">
              FERRAMENTAS
            </h3>

            <nav className="flex flex-col gap-1">
              <button
                onClick={() => setActiveTool('cenas')}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-mono font-medium transition ${
                  activeTool === 'cenas'
                    ? 'bg-slate-900 text-white border border-slate-800 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-950'
                }`}
              >
                <FolderKanban className="w-4 h-4 text-slate-400" />
                Preparação de Cena
              </button>

              <button
                onClick={() => setActiveTool('npcs')}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-mono font-medium transition ${
                  activeTool === 'npcs'
                    ? 'bg-slate-900 text-white border border-slate-800 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-950'
                }`}
              >
                <Users className="w-4 h-4 text-slate-400" />
                NPCs
              </button>

              <button
                onClick={() => setActiveTool('ameacas')}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-mono font-medium transition ${
                  activeTool === 'ameacas'
                    ? 'bg-slate-900 text-white border border-slate-800 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-950'
                }`}
              >
                <Skull className="w-4 h-4 text-slate-400" />
                Ameaças
              </button>

              <button
                onClick={() => setActiveTool('fichas')}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-mono font-medium transition ${
                  activeTool === 'fichas'
                    ? 'bg-slate-900 text-white border border-slate-800 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-950'
                }`}
              >
                <FileText className="w-4 h-4 text-slate-400" />
                Fichas
              </button>
            </nav>
          </div>
        </aside>

        {/* ÁREA PRINCIPAL */}
        <main className="flex-1">
          {/* VISÃO: PREPARAÇÃO DE CENA */}
          {activeTool === 'cenas' && (
            <>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-slate-100">
                    Preparação de Cena
                  </h1>
                  <p className="text-xs text-slate-500 font-mono mt-1">
                    Cenas, anotações, trilhas sonoras e combates prontos.
                  </p>
                </div>

                <button
                  onClick={handleOpenCreateScene}
                  className="inline-flex items-center justify-center gap-2 bg-slate-100 hover:bg-white text-slate-950 text-xs font-mono font-extrabold uppercase tracking-wider px-4 py-2.5 rounded-xl transition shadow-md active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  Nova Cena
                </button>
              </div>

              {scenes.length === 0 ? (
                <div className="bg-slate-950/60 border border-dashed border-slate-900 rounded-2xl p-12 text-center flex flex-col items-center justify-center">
                  <FolderKanban className="w-10 h-10 text-slate-700 mb-3" />
                  <h3 className="text-sm font-bold font-mono text-slate-300 mb-1">
                    Nenhuma cena cadastrada
                  </h3>
                  <p className="text-xs text-slate-500 font-mono max-w-sm mb-6">
                    Organize a sua sessão adicionando as cenas preparadas, trilhas e anotações.
                  </p>
                  <button
                    onClick={handleOpenCreateScene}
                    className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 text-xs font-mono font-bold px-4 py-2.5 rounded-xl transition"
                  >
                    <Plus className="w-4 h-4" />
                    Criar Primeira Cena
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {scenes.map((scene) => (
                    <div
                      key={scene.id}
                      className="bg-slate-950 border border-slate-900 rounded-2xl p-6 flex flex-col justify-between hover:border-slate-800 transition shadow-lg group relative"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-mono font-bold text-slate-600 uppercase tracking-widest">
                            {scene.numero}
                          </span>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleCopyCommand(scene.comandoId)}
                              title="Clique para copiar comando"
                              className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-slate-700 font-mono text-[11px] font-bold px-2.5 py-1 rounded-lg transition active:scale-95"
                            >
                              <span>{scene.comandoId}</span>
                              {copiedId === scene.comandoId ? (
                                <Check className="w-3 h-3 text-emerald-400" />
                              ) : (
                                <Copy className="w-3 h-3 text-slate-500 group-hover:text-slate-300" />
                              )}
                            </button>

                            <button
                              onClick={() => handleOpenEditScene(scene)}
                              title="Editar Cena"
                              className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-100 border border-slate-800 transition active:scale-95"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => handleDeleteScene(scene.id)}
                              title="Excluir Cena"
                              className="p-1.5 rounded-lg bg-slate-900 hover:bg-red-950/50 text-slate-500 hover:text-red-400 border border-slate-800 hover:border-red-900 transition active:scale-95"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <h2 className="text-lg font-bold text-slate-100 mb-4">
                          {scene.titulo}
                        </h2>

                        {scene.anotacoes && (
                          <div className="mb-4">
                            <span className="text-[10px] font-mono font-bold text-slate-600 uppercase tracking-wider block mb-1">
                              ANOTAÇÕES
                            </span>
                            <p className="text-xs text-slate-400 leading-relaxed whitespace-pre-line">
                              {scene.anotacoes}
                            </p>
                          </div>
                        )}

                        {scene.trilhas && scene.trilhas.length > 0 && (
                          <div className="mb-4">
                            <span className="text-[10px] font-mono font-bold text-slate-600 uppercase tracking-wider block mb-1.5">
                              TRILHA SONORA / PLAYLIST
                            </span>
                            <div className="flex flex-col gap-1.5">
                              {scene.trilhas.map((link, idx) => (
                                <a
                                  key={idx}
                                  href={link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-2 text-xs text-slate-300 font-mono bg-slate-900/60 hover:bg-slate-900 border border-slate-800/80 px-2.5 py-1.5 rounded-lg transition group/link"
                                >
                                  <Music className="w-3.5 h-3.5 text-slate-500 group-hover/link:text-slate-300 shrink-0" />
                                  <span className="truncate flex-1 text-[11px]">{link}</span>
                                  <ExternalLink className="w-3 h-3 text-slate-600 group-hover/link:text-slate-400 shrink-0" />
                                </a>
                              ))}
                            </div>
                          </div>
                        )}

                        {scene.combates && scene.combates.length > 0 && (
                          <div>
                            <span className="text-[10px] font-mono font-bold text-slate-600 uppercase tracking-wider block mb-2">
                              COMBATES
                            </span>
                            <div className="flex flex-wrap gap-2">
                              {scene.combates.map((combate, idx) => (
                                <span
                                  key={idx}
                                  className="inline-flex items-center gap-1 bg-slate-900 border border-slate-800/80 text-slate-300 text-[11px] font-mono px-3 py-1 rounded-full"
                                >
                                  <Swords className="w-3 h-3 text-slate-500" />
                                  {combate}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* VISÃO: NPCS */}
          {activeTool === 'npcs' && (
            <>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-slate-100">
                    Gerenciamento de NPCs
                  </h1>
                  <p className="text-xs text-slate-500 font-mono mt-1">
                    Personagens não-jogáveis rápida e simplificadamente.
                  </p>
                </div>

                <button
                  onClick={handleOpenCreateNpc}
                  className="inline-flex items-center justify-center gap-2 bg-slate-100 hover:bg-white text-slate-950 text-xs font-mono font-extrabold uppercase tracking-wider px-4 py-2.5 rounded-xl transition shadow-md active:scale-95"
                >
                  <UserPlus className="w-4 h-4" />
                  Novo NPC
                </button>
              </div>

              {npcs.length === 0 ? (
                <div className="bg-slate-950/60 border border-dashed border-slate-900 rounded-2xl p-12 text-center flex flex-col items-center justify-center">
                  <Users className="w-10 h-10 text-slate-700 mb-3" />
                  <h3 className="text-sm font-bold font-mono text-slate-300 mb-1">
                    Nenhum NPC cadastrado
                  </h3>
                  <p className="text-xs text-slate-500 font-mono max-w-sm mb-6">
                    Cadastre personagens importantes, informantes ou aliados para rápida consulta.
                  </p>
                  <button
                    onClick={handleOpenCreateNpc}
                    className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 text-xs font-mono font-bold px-4 py-2.5 rounded-xl transition"
                  >
                    <UserPlus className="w-4 h-4" />
                    Criar Primeiro NPC
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {npcs.map((npc) => (
                    <div
                      key={npc.id}
                      className="bg-slate-950 border border-slate-900 rounded-2xl p-6 flex flex-col justify-between hover:border-slate-800 transition shadow-lg group relative"
                    >
                      <div>
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 font-mono font-bold text-sm">
                              {npc.nome.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <h2 className="text-base font-bold text-slate-100 leading-tight">
                                {npc.nome}
                              </h2>
                              {npc.ocupacao && (
                                <span className="text-xs text-slate-400 font-mono">
                                  {npc.ocupacao}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleOpenEditNpc(npc)}
                              title="Editar NPC"
                              className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-100 border border-slate-800 transition active:scale-95"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteNpc(npc.id)}
                              title="Excluir NPC"
                              className="p-1.5 rounded-lg bg-slate-900 hover:bg-red-950/50 text-slate-500 hover:text-red-400 border border-slate-800 hover:border-red-900 transition active:scale-95"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* TAGS / ATITUDE / LOCALIZAÇÃO */}
                        <div className="flex flex-wrap gap-2 mb-4 font-mono text-[11px]">
                          {npc.atitude && (
                            <span className="inline-flex items-center gap-1 bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-lg text-slate-300">
                              <Smile className="w-3 h-3 text-slate-500" />
                              {npc.atitude}
                            </span>
                          )}
                          {npc.localizacao && (
                            <span className="inline-flex items-center gap-1 bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-lg text-slate-300">
                              <MapPin className="w-3 h-3 text-slate-500" />
                              {npc.localizacao}
                            </span>
                          )}
                        </div>

                        {/* APARÊNCIA / DESCRICAO */}
                        {npc.descricao && (
                          <div className="mb-3">
                            <span className="text-[10px] font-mono font-bold text-slate-600 uppercase tracking-wider block mb-1">
                              APARÊNCIA & TREJEITOS
                            </span>
                            <p className="text-xs text-slate-400 leading-relaxed font-sans">
                              {npc.descricao}
                            </p>
                          </div>
                        )}

                        {/* ANOTAÇÕES / SEGREDOS */}
                        {npc.anotacoes && (
                          <div>
                            <span className="text-[10px] font-mono font-bold text-slate-600 uppercase tracking-wider block mb-1">
                              ANOTAÇÕES / SEGREDOS
                            </span>
                            <p className="text-xs text-slate-400 leading-relaxed font-sans whitespace-pre-line">
                              {npc.anotacoes}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* OUTRAS ABAS (PLACEHOLDERS) */}
          {activeTool === 'ameacas' && (
            <div className="bg-slate-950/60 border border-dashed border-slate-900 rounded-2xl p-12 text-center">
              <Skull className="w-10 h-10 text-slate-700 mx-auto mb-3" />
              <h3 className="text-sm font-bold font-mono text-slate-300">Módulo de Ameaças</h3>
              <p className="text-xs text-slate-500 font-mono mt-1">Em breve você poderá catalogar monstros e perigos aqui.</p>
            </div>
          )}

          {activeTool === 'fichas' && (
            <div className="bg-slate-950/60 border border-dashed border-slate-900 rounded-2xl p-12 text-center">
              <FileText className="w-10 h-10 text-slate-700 mx-auto mb-3" />
              <h3 className="text-sm font-bold font-mono text-slate-300">Fichas dos Jogadores</h3>
              <p className="text-xs text-slate-500 font-mono mt-1">Visualização rápida das fichas dos Agentes participantes.</p>
            </div>
          )}
        </main>
      </div>

      {/* MODAL CRIAR / EDITAR CENA */}
      {isSceneModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-950 border border-slate-800 w-full max-w-lg rounded-2xl p-6 shadow-2xl font-mono text-slate-200 relative animate-in fade-in zoom-in duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-900">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-100">
                {editingSceneId ? 'Editar Cena' : 'Nova Cena'}
              </h3>
              <button
                onClick={() => setIsSceneModalOpen(false)}
                className="text-slate-500 hover:text-slate-200 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveScene} className="flex flex-col gap-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] text-slate-500 uppercase font-bold mb-1">
                    Número / Tag
                  </label>
                  <input
                    type="text"
                    value={sceneFormData.numero}
                    onChange={(e) => setSceneFormData({ ...sceneFormData, numero: e.target.value })}
                    placeholder="Ex: CENA 01"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-slate-600"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-slate-500 uppercase font-bold mb-1">
                    Comando ID
                  </label>
                  <input
                    type="text"
                    value={sceneFormData.comandoId}
                    onChange={(e) => setSceneFormData({ ...sceneFormData, comandoId: e.target.value })}
                    placeholder="Ex: !taverna (Auto)"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-slate-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-slate-500 uppercase font-bold mb-1">
                  Título da Cena *
                </label>
                <input
                  type="text"
                  required
                  value={sceneFormData.titulo}
                  onChange={(e) => setSceneFormData({ ...sceneFormData, titulo: e.target.value })}
                  placeholder="Ex: Encontro no Limbo"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-slate-600 font-sans font-semibold"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-500 uppercase font-bold mb-1">
                  Anotações da Cena
                </label>
                <textarea
                  rows={3}
                  value={sceneFormData.anotacoes}
                  onChange={(e) => setSceneFormData({ ...sceneFormData, anotacoes: e.target.value })}
                  placeholder="Pistas, segredos e o que acontece nesta cena..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-slate-600 font-sans"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-500 uppercase font-bold mb-1">
                  Trilhas Sonoras (Links)
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="url"
                    value={tempMusicLink}
                    onChange={(e) => setTempMusicLink(e.target.value)}
                    placeholder="https://youtube.com/..."
                    className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-slate-600"
                  />
                  <button
                    type="button"
                    onClick={handleAddMusicLink}
                    className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-bold transition"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                {sceneFormData.trilhas.map((link, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-slate-900/50 p-2 rounded-lg mb-1">
                    <span className="truncate text-[11px] text-slate-400">{link}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveMusicLink(idx)}
                      className="text-slate-600 hover:text-red-400 transition"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-[10px] text-slate-500 uppercase font-bold mb-1">
                  Combates (separados por vírgula)
                </label>
                <input
                  type="text"
                  value={sceneFormData.combates}
                  onChange={(e) => setSceneFormData({ ...sceneFormData, combates: e.target.value })}
                  placeholder="Ex: 2x Cultistas, 1x Aberração"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-slate-600"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-900 mt-2">
                <button
                  type="button"
                  onClick={() => setIsSceneModalOpen(false)}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-400 rounded-xl transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-100 hover:bg-white text-slate-950 font-bold rounded-xl transition"
                >
                  Salvar Cena
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL CRIAR / EDITAR NPC */}
      {isNpcModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-950 border border-slate-800 w-full max-w-lg rounded-2xl p-6 shadow-2xl font-mono text-slate-200 relative animate-in fade-in zoom-in duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-900">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-100">
                {editingNpcId ? 'Editar NPC' : 'Novo NPC'}
              </h3>
              <button
                onClick={() => setIsNpcModalOpen(false)}
                className="text-slate-500 hover:text-slate-200 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveNpc} className="flex flex-col gap-4 text-xs">
              <div>
                <label className="block text-[10px] text-slate-500 uppercase font-bold mb-1">
                  Nome do NPC *
                </label>
                <input
                  type="text"
                  required
                  value={npcFormData.nome}
                  onChange={(e) => setNpcFormData({ ...npcFormData, nome: e.target.value })}
                  placeholder="Ex: Veríssimo"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-slate-600 font-sans font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] text-slate-500 uppercase font-bold mb-1">
                    Ocupação / Função
                  </label>
                  <input
                    type="text"
                    value={npcFormData.ocupacao}
                    onChange={(e) => setNpcFormData({ ...npcFormData, ocupacao: e.target.value })}
                    placeholder="Ex: Informante"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-slate-600"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-slate-500 uppercase font-bold mb-1">
                    Atitude
                  </label>
                  <input
                    type="text"
                    value={npcFormData.atitude}
                    onChange={(e) => setNpcFormData({ ...npcFormData, atitude: e.target.value })}
                    placeholder="Ex: Amigável / Suspeito"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-slate-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-slate-500 uppercase font-bold mb-1">
                  Localização Habitual / Cena
                </label>
                <input
                  type="text"
                  value={npcFormData.localizacao}
                  onChange={(e) => setNpcFormData({ ...npcFormData, localizacao: e.target.value })}
                  placeholder="Ex: CENA 01 - Taverna"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-slate-600"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-500 uppercase font-bold mb-1">
                  Aparência & Trejeitos
                </label>
                <textarea
                  rows={2}
                  value={npcFormData.descricao}
                  onChange={(e) => setNpcFormData({ ...npcFormData, descricao: e.target.value })}
                  placeholder="Roupas, marcas, tom de voz..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-slate-600 font-sans"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-500 uppercase font-bold mb-1">
                  Anotações & Segredos
                </label>
                <textarea
                  rows={3}
                  value={npcFormData.anotacoes}
                  onChange={(e) => setNpcFormData({ ...npcFormData, anotacoes: e.target.value })}
                  placeholder="O que ele sabe? O que quer esconder?"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-slate-600 font-sans"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-900 mt-2">
                <button
                  type="button"
                  onClick={() => setIsNpcModalOpen(false)}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-400 rounded-xl transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-100 hover:bg-white text-slate-950 font-bold rounded-xl transition"
                >
                  Salvar NPC
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};