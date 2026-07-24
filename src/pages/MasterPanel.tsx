import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getCampaignById } from '../firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import {
  ShieldAlert,
  Swords,
  FileText,
  Users,
  Skull,
  FolderKanban,
  ArrowLeft
} from 'lucide-react';

// Importa as interfaces do arquivo separado
import type { CampaignData, MasterPanelProps } from '../interfaces/MasterPanel';

export const MasterPanel = ({ campaignName, currentCampaign }: MasterPanelProps) => {
  const { campaignId } = useParams<{ campaignId: string }>();
  const { currentUser } = useAuth();

  const [campaignData, setCampaignData] = useState<CampaignData | null>(currentCampaign || null);
  const [loading, setLoading] = useState(!currentCampaign);
  const [activeTab, setActiveTab] = useState<string>('overview');

  useEffect(() => {
    async function fetchCampaignData() {
      // Se os dados já vieram pelas props ou não houver ID, não busca no Firebase
      if (currentCampaign || !campaignId) return;

      try {
        setLoading(true);
        const data = await getCampaignById(campaignId);
        
        if (data) {
          // A dupla conversão 'as unknown as CampaignData' previne o erro de incompatibilidade do TS
          setCampaignData(data as unknown as CampaignData);
        }
      } catch (error) {
        console.error("Erro ao carregar campanha:", error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchCampaignData();
  }, [campaignId, currentCampaign]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-slate-400 flex items-center justify-center font-mono text-xs">
        <span className="animate-pulse tracking-widest">CARREGANDO SISTEMA...</span>
      </div>
    );
  }

  // Verifica se o usuário logado é o criador da campanha
  const isMaster = campaignData && currentUser && campaignData.criadorId === currentUser.uid;

  if (!isMaster && campaignData) {
    return (
      <div className="min-h-screen bg-black text-red-500 flex flex-col items-center justify-center font-mono gap-4 p-4">
        <ShieldAlert className="w-10 h-10" />
        <h1 className="text-sm font-bold tracking-wider uppercase">ACESSO NEGADO</h1>
        <p className="text-slate-500 text-xs text-center">Você não possui credenciais de Mestre para acessar esta campanha.</p>
        <Link 
          to="/dashboard"
          className="mt-4 px-4 py-2 bg-slate-900 border border-slate-800 text-slate-300 hover:text-white rounded-lg text-xs transition active:scale-95"
        >
          Voltar ao Dashboard
        </Link>
      </div>
    );
  }

  // Define o nome priorizando a prop, depois os dados do banco
  const displayName = campaignName || campaignData?.nome || 'Campanha Sem Nome';

  return (
    <div className="min-h-screen bg-black text-slate-200 flex flex-col font-mono selection:bg-slate-800 selection:text-white">
      {/* Topbar com Nome Atualizado e Botão de Voltar */}
      <header className="border-b border-slate-900 bg-black/90 px-6 py-4 flex justify-between items-center text-xs font-mono">
        <div className="flex items-center gap-3">
          <span className="font-bold tracking-widest text-slate-100 uppercase">L I M B O</span>
          <span className="text-slate-600">•</span>
          <span className="text-slate-500 uppercase tracking-wider text-[11px]">PAINEL DO MESTRE</span>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-slate-500 uppercase">CAMPANHA</span>
            <span className="font-bold text-slate-200">{displayName}</span>
          </div>
          
          <div className="h-4 w-px bg-slate-800"></div>
          
          <Link
            to="/dashboard"
            className="flex items-center gap-2 text-slate-400 hover:text-slate-100 bg-slate-900/50 hover:bg-slate-800 border border-slate-800/80 px-3 py-1.5 rounded-lg transition active:scale-95"
            title="Voltar para o Dashboard"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="font-bold tracking-wider">DASHBOARD</span>
          </Link>
        </div>
      </header>

      {/* Conteúdo Principal do Painel */}
      <div className="flex flex-1 overflow-hidden">
        {/* Barra Lateral de Navegação */}
        <aside className="w-64 border-r border-slate-900 bg-black/50 p-4 flex flex-col gap-2 text-xs">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition ${
              activeTab === 'overview' ? 'bg-slate-900 text-slate-100 font-bold border border-slate-800' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
            }`}
          >
            <FolderKanban className="w-4 h-4 text-slate-400" />
            <span>Visão Geral</span>
          </button>

          <button
            onClick={() => setActiveTab('scenes')}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition ${
              activeTab === 'scenes' ? 'bg-slate-900 text-slate-100 font-bold border border-slate-800' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
            }`}
          >
            <Swords className="w-4 h-4 text-slate-400" />
            <span>Cenas & Combate</span>
          </button>

          <button
            onClick={() => setActiveTab('npcs')}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition ${
              activeTab === 'npcs' ? 'bg-slate-900 text-slate-100 font-bold border border-slate-800' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
            }`}
          >
            <Skull className="w-4 h-4 text-slate-400" />
            <span>NPCs & Inimigos</span>
          </button>

          <button
            onClick={() => setActiveTab('notes')}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition ${
              activeTab === 'notes' ? 'bg-slate-900 text-slate-100 font-bold border border-slate-800' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
            }`}
          >
            <FileText className="w-4 h-4 text-slate-400" />
            <span>Laudos & Anotações</span>
          </button>

          <button
            onClick={() => setActiveTab('players')}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition ${
              activeTab === 'players' ? 'bg-slate-900 text-slate-100 font-bold border border-slate-800' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
            }`}
          >
            <Users className="w-4 h-4 text-slate-400" />
            <span>Investigadores</span>
          </button>
        </aside>

        {/* Área Central (Exibição da Tab Selecionada) */}
        <main className="flex-1 p-8 overflow-y-auto bg-black">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-base font-bold text-slate-100 uppercase tracking-wider">Visão Geral da Campanha</h2>
                <p className="text-xs text-slate-500 mt-1">Gerenciamento central e dados de controle pericial.</p>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 border border-slate-900 rounded-xl bg-slate-950/40">
                  <span className="text-[10px] text-slate-500 uppercase tracking-widest">ID do Caso</span>
                  <p className="text-xs font-bold text-slate-300 mt-1">{campaignId}</p>
                </div>
                <div className="p-4 border border-slate-900 rounded-xl bg-slate-950/40">
                  <span className="text-[10px] text-slate-500 uppercase tracking-widest">Estado</span>
                  <p className="text-xs font-bold text-emerald-500 mt-1">SINCRONIZADO</p>
                </div>
                <div className="p-4 border border-slate-900 rounded-xl bg-slate-950/40">
                  <span className="text-[10px] text-slate-500 uppercase tracking-widest">Nível de Ameaça</span>
                  <p className="text-xs font-bold text-amber-500 mt-1">PARANORMAL ALTO</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'scenes' && (
            <div className="space-y-4">
              <h2 className="text-base font-bold text-slate-100 uppercase tracking-wider">Cenas & Combate</h2>
              <p className="text-xs text-slate-500">Controle de locais e turnos de investigação.</p>
            </div>
          )}

          {activeTab === 'npcs' && (
            <div className="space-y-4">
              <h2 className="text-base font-bold text-slate-100 uppercase tracking-wider">NPCs & Inimigos</h2>
              <p className="text-xs text-slate-500">Fichas técnicas de entidades e suspeitos.</p>
            </div>
          )}

          {activeTab === 'notes' && (
            <div className="space-y-4">
              <h2 className="text-base font-bold text-slate-100 uppercase tracking-wider">Laudos & Anotações</h2>
              <p className="text-xs text-slate-500">Documentos e relatórios de autópsia/perícia.</p>
            </div>
          )}

          {activeTab === 'players' && (
            <div className="space-y-4">
              <h2 className="text-base font-bold text-slate-100 uppercase tracking-wider">Investigadores</h2>
              <p className="text-xs text-slate-500">Visão geral dos agentes vinculados ao caso.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};