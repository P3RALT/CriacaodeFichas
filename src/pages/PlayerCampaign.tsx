import { useState, useMemo, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Search, Star, FileText, BookOpen, Users, FolderSearch,
  LayoutDashboard, Pin, Plus, Trash2, ArrowLeft,
  MapPin, UserCheck, Shield, X
} from 'lucide-react';

import type {
  PlayerCharacter,
  Clue,
  PersonalNote,
  JournalCategory,
  JournalEntry,
  PlayerCampaignData
} from '../interfaces/PlayerCampaign';

export const PlayerCampaign = () => {
  const { campaignId } = useParams<{ campaignId: string }>();

  // --- ESTADOS DE DADOS DA CAMPANHA ---
  const [campaign, setCampaign] = useState<PlayerCampaignData | null>(null);
  const [characters, setCharacters] = useState<PlayerCharacter[]>([]);
  const [clues, setClues] = useState<Clue[]>([]);
  const [journalCategories, setJournalCategories] = useState<JournalCategory[]>([]);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [notes, setNotes] = useState<PersonalNote[]>([]);

  // --- CONTROLES DE INTERFACE ---
  const [activeTab, setActiveTab] = useState<'home' | 'characters' | 'clues' | 'notes' | 'journal' | 'favorites'>('home');
  const [searchTerm, setSearchTerm] = useState('');
  const [favorites, setFavorites] = useState<string[]>([]);
  
  // Controle do Modal de Personagem
  const [isCharacterModalOpen, setIsCharacterModalOpen] = useState(false);
  const [newCharNome, setNewCharNome] = useState('');
  const [newCharCargo, setNewCharCargo] = useState('');
  const [newCharIdade, setNewCharIdade] = useState('');
  const [newCharStatus, setNewCharStatus] = useState<'Vivo' | 'Morto' | 'Desaparecido' | 'Desconhecido'>('Vivo');
  const [newCharFotoUrl, setNewCharFotoUrl] = useState('');
  const [newCharDescricao, setNewCharDescricao] = useState('');
  const [newCharInfoInput, setNewCharInfoInput] = useState('');
  const [newCharInfos, setNewCharInfos] = useState<string[]>([]);

  // Filtros de Pistas
  const [clueCategoryFilter, setClueCategoryFilter] = useState<string>('TODAS');
  const [clueStatusFilter, setClueStatusFilter] = useState<string>('TODOS');

  // Seleções
  const [selectedJournalCategory, setSelectedJournalCategory] = useState<string | null>(null);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);

  // --- CARREGAMENTO DOS DADOS ---
  useEffect(() => {
    if (!campaignId) return;
  }, [campaignId]);

  // Alternar Favorito
  const toggleFavorite = (id: string) => {
    setFavorites(prev =>
      prev.includes(id) ? prev.filter(favId => favId !== id) : [...prev, id]
    );
  };

  // Funções de Personagem
  const handleAddInfoToNewChar = () => {
    if (!newCharInfoInput.trim()) return;
    setNewCharInfos(prev => [...prev, newCharInfoInput.trim()]);
    setNewCharInfoInput('');
  };

  const handleRemoveInfoFromNewChar = (index: number) => {
    setNewCharInfos(prev => prev.filter((_, i) => i !== index));
  };

  const handleCreateCharacter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCharNome.trim()) return;

    const newCharacter: PlayerCharacter = {
      id: `char-${Date.now()}`,
      nome: newCharNome,
      cargo: newCharCargo || 'Indivíduo de Interesse',
      idade: newCharIdade ? Number(newCharIdade) : undefined,
      status: newCharStatus,
      fotoUrl: newCharFotoUrl || undefined,
      descricao: newCharDescricao || 'Sem descrição registrada.',
      informacoesDescobertas: newCharInfos
    };

    setCharacters(prev => [newCharacter, ...prev]);
    
    // Resetar formulário e fechar modal
    setNewCharNome('');
    setNewCharCargo('');
    setNewCharIdade('');
    setNewCharStatus('Vivo');
    setNewCharFotoUrl('');
    setNewCharDescricao('');
    setNewCharInfos([]);
    setIsCharacterModalOpen(false);
  };

  // Funções de Notas Pessoais
  const handleCreateNote = () => {
    const newNote: PersonalNote = {
      id: `note-${Date.now()}`,
      titulo: 'Nova Anotação',
      conteudo: '',
      fixada: false,
      criadoEm: new Date().toLocaleDateString('pt-BR'),
      atualizadoEm: new Date().toLocaleDateString('pt-BR')
    };
    setNotes(prev => [newNote, ...prev]);
    setSelectedNoteId(newNote.id);
  };

  const handleUpdateNote = (id: string, field: 'titulo' | 'conteudo', value: string) => {
    setNotes(prev =>
      prev.map(note =>
        note.id === id
          ? { ...note, [field]: value, atualizadoEm: new Date().toLocaleDateString('pt-BR') }
          : note
      )
    );
  };

  const handleTogglePinNote = (id: string) => {
    setNotes(prev =>
      prev.map(note => (note.id === id ? { ...note, fixada: !note.fixada } : note))
    );
  };

  const handleDeleteNote = (id: string) => {
    const updated = notes.filter(n => n.id !== id);
    setNotes(updated);
    if (selectedNoteId === id) {
      setSelectedNoteId(updated.length > 0 ? updated[0].id : null);
    }
  };

  // Pistas Filtradas
  const filteredClues = useMemo(() => {
    return clues.filter(clue => {
      const matchCat = clueCategoryFilter === 'TODAS' || clue.categoria === clueCategoryFilter;
      const matchStatus = clueStatusFilter === 'TODOS' || clue.status === clueStatusFilter;
      const matchSearch = clue.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          clue.descricao.toLowerCase().includes(searchTerm.toLowerCase());
      return matchCat && matchStatus && matchSearch;
    });
  }, [clues, clueCategoryFilter, clueStatusFilter, searchTerm]);

  // Personagens Filtrados
  const filteredCharacters = useMemo(() => {
    return characters.filter(char =>
      char.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      char.cargo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      char.descricao.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [characters, searchTerm]);

  const activeNote = notes.find(n => n.id === selectedNoteId);

  return (
    <div className="min-h-screen bg-black text-slate-200 flex flex-col font-mono selection:bg-slate-800 selection:text-white">
      {/* 1. CABEÇALHO */}
      <header className="border-b border-slate-900 bg-black/90 px-6 py-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <Link
            to="/dashboard"
            className="p-2 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-100 rounded-lg border border-slate-800 transition"
            title="Voltar ao Dashboard"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">CENTRO DE INVESTIGAÇÃO</span>
              <span className="text-slate-700">•</span>
              <span className="text-[10px] text-amber-500 font-semibold tracking-wider">SESSÃO ATIVA</span>
            </div>
            <h1 className="text-base font-bold text-slate-100 uppercase tracking-wider">
              {campaign?.nome || 'Carregando Investigação...'}
            </h1>
          </div>
        </div>

        {/* Busca Global */}
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative w-full md:w-72">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Pesquisar..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 pl-9 pr-3 py-1.5 rounded-lg focus:outline-none focus:border-slate-600 transition placeholder:text-slate-600"
            />
          </div>

          <div className="hidden lg:flex items-center gap-3 text-[11px] text-slate-400 border-l border-slate-800 pl-4">
            <div className="flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-slate-500" />
              <span>{campaign?.mestreNome || 'Mestre'}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-slate-500" />
              <span>{campaign?.quantidadeJogadores || 0} Agentes</span>
            </div>
          </div>
        </div>
      </header>

      {/* BANNER DA CAMPANHA */}
      {campaign?.bannerUrl && (
        <div className="relative h-28 border-b border-slate-900 overflow-hidden bg-slate-950">
          <img
            src={campaign.bannerUrl}
            alt="Banner da Campanha"
            className="w-full h-full object-cover opacity-20 filter grayscale contrast-125"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent p-6 flex flex-col justify-end">
            <p className="text-xs text-slate-400 max-w-3xl line-clamp-2">{campaign.descricao}</p>
          </div>
        </div>
      )}

      {/* CORPO PRINCIPAL */}
      <div className="flex flex-1 overflow-hidden">
        {/* MENU LATERAL */}
        <aside className="w-56 border-r border-slate-900 bg-black/60 p-3 flex flex-col gap-1.5 text-xs shrink-0">
          <button
            onClick={() => setActiveTab('home')}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition ${
              activeTab === 'home' ? 'bg-slate-900 text-slate-100 font-bold border border-slate-800' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
            }`}
          >
            <LayoutDashboard className="w-4 h-4 text-slate-400" />
            <span>Início</span>
          </button>

          <button
            onClick={() => setActiveTab('characters')}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition ${
              activeTab === 'characters' ? 'bg-slate-900 text-slate-100 font-bold border border-slate-800' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
            }`}
          >
            <Users className="w-4 h-4 text-slate-400" />
            <span>Personagens</span>
            {characters.length > 0 && (
              <span className="ml-auto text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded">
                {characters.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('clues')}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition ${
              activeTab === 'clues' ? 'bg-slate-900 text-slate-100 font-bold border border-slate-800' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
            }`}
          >
            <FolderSearch className="w-4 h-4 text-slate-400" />
            <span>Pistas</span>
            {clues.length > 0 && (
              <span className="ml-auto text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded">
                {clues.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('notes')}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition ${
              activeTab === 'notes' ? 'bg-slate-900 text-slate-100 font-bold border border-slate-800' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
            }`}
          >
            <FileText className="w-4 h-4 text-slate-400" />
            <span>Notas Pessoais</span>
          </button>

          <button
            onClick={() => setActiveTab('journal')}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition ${
              activeTab === 'journal' ? 'bg-slate-900 text-slate-100 font-bold border border-slate-800' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
            }`}
          >
            <BookOpen className="w-4 h-4 text-slate-400" />
            <span>Jornal</span>
          </button>

          <div className="h-px bg-slate-900 my-2"></div>

          <button
            onClick={() => setActiveTab('favorites')}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition ${
              activeTab === 'favorites' ? 'bg-amber-950/30 text-amber-200 font-bold border border-amber-900/50' : 'text-slate-400 hover:text-amber-300 hover:bg-slate-900/40'
            }`}
          >
            <Star className={`w-4 h-4 ${favorites.length > 0 ? 'text-amber-400 fill-amber-400' : 'text-slate-400'}`} />
            <span>Favoritos</span>
            {favorites.length > 0 && (
              <span className="ml-auto text-[10px] bg-amber-950/80 text-amber-300 px-1.5 py-0.5 rounded font-bold">
                {favorites.length}
              </span>
            )}
          </button>
        </aside>

        {/* ÁREA PRINCIPAL */}
        <main className="flex-1 p-6 overflow-y-auto bg-black">
          {/* TAB: INÍCIO */}
          {activeTab === 'home' && (
            <div className="space-y-6 max-w-6xl">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="p-4 border border-slate-900 rounded-xl bg-slate-950/50 flex flex-col justify-between">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Pistas Descobertas</span>
                  <p className="text-2xl font-bold text-slate-100 mt-2">{clues.length}</p>
                </div>
                <div className="p-4 border border-slate-900 rounded-xl bg-slate-950/50 flex flex-col justify-between">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Personagens Conhecidos</span>
                  <p className="text-2xl font-bold text-slate-100 mt-2">{characters.length}</p>
                </div>
                <div className="p-4 border border-slate-900 rounded-xl bg-slate-950/50 flex flex-col justify-between">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Registros de Jornal</span>
                  <p className="text-2xl font-bold text-slate-100 mt-2">{journalEntries.length}</p>
                </div>
                <div className="p-4 border border-slate-900 rounded-xl bg-slate-950/50 flex flex-col justify-between">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Minhas Notas</span>
                  <p className="text-2xl font-bold text-slate-100 mt-2">{notes.length}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-5 border border-slate-900 rounded-xl bg-slate-950/40 space-y-4">
                  <div className="flex justify-between items-center border-b border-slate-900 pb-3">
                    <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                      <FolderSearch className="w-4 h-4 text-slate-400" />
                      Últimas Pistas Adicionadas
                    </h3>
                    {clues.length > 0 && (
                      <button onClick={() => setActiveTab('clues')} className="text-[11px] text-slate-500 hover:text-slate-300">Ver todas →</button>
                    )}
                  </div>
                  {clues.length === 0 ? (
                    <p className="text-xs text-slate-600 py-4 text-center">Nenhuma pista cadastrada.</p>
                  ) : (
                    <div className="space-y-3">
                      {clues.slice(0, 3).map(clue => (
                        <div key={clue.id} className="p-3 bg-black border border-slate-900 rounded-lg text-xs space-y-1">
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-slate-200">{clue.nome}</span>
                            <span className="text-[10px] px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">{clue.categoria}</span>
                          </div>
                          <p className="text-slate-500 text-[11px] line-clamp-1">{clue.descricao}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="p-5 border border-slate-900 rounded-xl bg-slate-950/40 space-y-4">
                  <div className="flex justify-between items-center border-b border-slate-900 pb-3">
                    <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-slate-400" />
                      Últimas Atualizações do Jornal
                    </h3>
                    {journalEntries.length > 0 && (
                      <button onClick={() => setActiveTab('journal')} className="text-[11px] text-slate-500 hover:text-slate-300">Acessar Jornal →</button>
                    )}
                  </div>
                  {journalEntries.length === 0 ? (
                    <p className="text-xs text-slate-600 py-4 text-center">Nenhuma entrada no jornal.</p>
                  ) : (
                    <div className="space-y-3">
                      {journalEntries.slice(0, 3).map(entry => (
                        <div key={entry.id} className="p-3 bg-black border border-slate-900 rounded-lg text-xs space-y-1">
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-slate-200">{entry.titulo}</span>
                            <span className="text-[10px] text-slate-500">{entry.atualizadoEm}</span>
                          </div>
                          <p className="text-slate-500 text-[11px] line-clamp-1">{entry.conteudo}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB: PERSONAGENS */}
          {activeTab === 'characters' && (
            <div className="space-y-6 max-w-6xl">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-base font-bold text-slate-100 uppercase tracking-wider">Personagens & Indivíduos</h2>
                  <p className="text-xs text-slate-500 mt-1">Registros de suspeitos, testemunhas e indivíduos de interesse.</p>
                </div>
                <button
                  onClick={() => setIsCharacterModalOpen(true)}
                  className="flex items-center gap-2 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-bold rounded-lg border border-slate-800 transition shadow-sm"
                >
                  <Plus className="w-4 h-4 text-amber-400" />
                  <span>Novo Personagem</span>
                </button>
              </div>

              {filteredCharacters.length === 0 ? (
                <div className="p-12 border border-slate-900 rounded-xl bg-slate-950/30 text-center space-y-2">
                  <Users className="w-8 h-8 text-slate-700 mx-auto" />
                  <p className="text-xs text-slate-500">Nenhum personagem registrado no momento.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredCharacters.map(char => {
                    const isFav = favorites.includes(char.id);
                    return (
                      <div key={char.id} className="p-5 border border-slate-900 rounded-xl bg-slate-950/50 space-y-4 relative">
                        <button
                          onClick={() => toggleFavorite(char.id)}
                          className="absolute top-4 right-4 text-slate-600 hover:text-amber-400 transition"
                        >
                          <Star className={`w-4 h-4 ${isFav ? 'text-amber-400 fill-amber-400' : ''}`} />
                        </button>

                        <div className="flex items-start gap-4">
                          <div className="w-14 h-14 bg-slate-900 border border-slate-800 rounded-lg flex items-center justify-center text-slate-600 shrink-0 overflow-hidden">
                            {char.fotoUrl ? (
                              <img src={char.fotoUrl} alt={char.nome} className="w-full h-full object-cover" />
                            ) : (
                              <UserCheck className="w-6 h-6" />
                            )}
                          </div>
                          <div>
                            <h3 className="text-sm font-bold text-slate-100">{char.nome}</h3>
                            <p className="text-xs text-slate-400 mt-0.5">{char.cargo} {char.idade ? `(${char.idade} anos)` : ''}</p>
                            
                            <div className="mt-2 flex items-center gap-2">
                              <span className={`text-[10px] px-2 py-0.5 rounded font-bold border ${
                                char.status === 'Vivo' ? 'bg-emerald-950/60 border-emerald-800 text-emerald-400' :
                                char.status === 'Desaparecido' ? 'bg-amber-950/60 border-amber-800 text-amber-400' :
                                char.status === 'Morto' ? 'bg-red-950/60 border-red-800 text-red-400' :
                                'bg-slate-900 border-slate-800 text-slate-400'
                              }`}>
                                STATUS: {char.status.toUpperCase()}
                              </span>
                            </div>
                          </div>
                        </div>

                        <p className="text-xs text-slate-400 leading-relaxed border-t border-slate-900 pt-3">{char.descricao}</p>

                        {char.informacoesDescobertas && char.informacoesDescobertas.length > 0 && (
                          <div className="space-y-2 pt-2">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Informações Descobertas:</span>
                            <ul className="space-y-1.5 text-xs text-slate-300">
                              {char.informacoesDescobertas.map((info, idx) => (
                                <li key={idx} className="flex items-start gap-2 bg-black/60 p-2 rounded border border-slate-900">
                                  <span className="text-slate-600">•</span>
                                  <span>{info}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB: PISTAS */}
          {activeTab === 'clues' && (
            <div className="space-y-6 max-w-6xl">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-900 pb-4">
                <div>
                  <h2 className="text-base font-bold text-slate-100 uppercase tracking-wider">Mural de Pistas & Evidências</h2>
                  <p className="text-xs text-slate-500 mt-1">Registros físicos, documentos e relatórios coletados.</p>
                </div>

                <div className="flex items-center gap-3 text-xs w-full md:w-auto">
                  <select
                    value={clueCategoryFilter}
                    onChange={e => setClueCategoryFilter(e.target.value)}
                    className="bg-slate-950 border border-slate-800 text-slate-300 px-3 py-1.5 rounded-lg focus:outline-none"
                  >
                    <option value="TODAS">Todas as Categorias</option>
                    <option value="Documento">Documentos</option>
                    <option value="Objeto">Objetos</option>
                    <option value="Foto">Fotos</option>
                    <option value="Relatório">Relatórios</option>
                    <option value="Testemunho">Testemunhos</option>
                    <option value="Evidência Paranormal">Evidência Paranormal</option>
                  </select>

                  <select
                    value={clueStatusFilter}
                    onChange={e => setClueStatusFilter(e.target.value)}
                    className="bg-slate-950 border border-slate-800 text-slate-300 px-3 py-1.5 rounded-lg focus:outline-none"
                  >
                    <option value="TODOS">Todos os Status</option>
                    <option value="Confirmada">Confirmadas</option>
                    <option value="Em Investigação">Em Investigação</option>
                    <option value="Falsa Pista">Falsa Pista</option>
                  </select>
                </div>
              </div>

              {filteredClues.length === 0 ? (
                <div className="p-12 border border-slate-900 rounded-xl bg-slate-950/30 text-center space-y-2">
                  <FolderSearch className="w-8 h-8 text-slate-700 mx-auto" />
                  <p className="text-xs text-slate-500">Nenhuma pista encontrada.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredClues.map(clue => {
                    const isFav = favorites.includes(clue.id);
                    return (
                      <div key={clue.id} className="p-5 border border-slate-900 rounded-xl bg-slate-950/50 space-y-4 relative">
                        <button
                          onClick={() => toggleFavorite(clue.id)}
                          className="absolute top-4 right-4 text-slate-600 hover:text-amber-400 transition"
                        >
                          <Star className={`w-4 h-4 ${isFav ? 'text-amber-400 fill-amber-400' : ''}`} />
                        </button>

                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] px-2 py-0.5 bg-slate-900 border border-slate-800 text-slate-400 rounded uppercase font-bold">
                              {clue.categoria}
                            </span>
                            <span className={`text-[10px] px-2 py-0.5 rounded uppercase font-bold border ${
                              clue.status === 'Confirmada' ? 'bg-emerald-950/50 border-emerald-800 text-emerald-400' :
                              clue.status === 'Em Investigação' ? 'bg-amber-950/50 border-amber-800 text-amber-400' :
                              'bg-red-950/50 border-red-800 text-red-400'
                            }`}>
                              {clue.status}
                            </span>
                          </div>
                          <h3 className="text-sm font-bold text-slate-100">{clue.nome}</h3>
                        </div>

                        <p className="text-xs text-slate-400 leading-relaxed">{clue.descricao}</p>

                        <div className="border-t border-slate-900 pt-3 grid grid-cols-2 gap-2 text-[11px] text-slate-500">
                          <div className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-slate-600" />
                            <span>{clue.localEncontrado || 'N/A'}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <UserCheck className="w-3.5 h-3.5 text-slate-600" />
                            <span>Agente: {clue.quemEncontrou || 'N/A'}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB: NOTAS PESSOAIS */}
          {activeTab === 'notes' && (
            <div className="h-full flex gap-6 max-w-6xl">
              <div className="w-64 border-r border-slate-900 pr-4 space-y-3 shrink-0 flex flex-col">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Minhas Anotações</span>
                  <button
                    onClick={handleCreateNote}
                    className="p-1 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded border border-slate-800 transition"
                    title="Nova Nota"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {notes.length === 0 ? (
                  <p className="text-xs text-slate-600 text-center py-6">Nenhuma nota criada.</p>
                ) : (
                  <div className="space-y-1.5 overflow-y-auto flex-1 pr-1">
                    {notes.map(note => (
                      <button
                        key={note.id}
                        onClick={() => setSelectedNoteId(note.id)}
                        className={`w-full text-left p-2.5 rounded-lg border text-xs transition flex flex-col gap-1 ${
                          selectedNoteId === note.id
                            ? 'bg-slate-900 border-slate-700 text-slate-100 font-bold'
                            : 'bg-black/40 border-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-950'
                        }`}
                      >
                        <div className="flex justify-between items-center w-full">
                          <span className="truncate max-w-[130px]">{note.titulo || 'Sem Título'}</span>
                          {note.fixada && <Pin className="w-3 h-3 text-amber-500 fill-amber-500 shrink-0" />}
                        </div>
                        <span className="text-[10px] text-slate-600">{note.atualizadoEm}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex-1 bg-slate-950/40 border border-slate-900 rounded-xl p-6 flex flex-col gap-4">
                {activeNote ? (
                  <>
                    <div className="flex justify-between items-center border-b border-slate-900 pb-3">
                      <input
                        type="text"
                        value={activeNote.titulo}
                        onChange={e => handleUpdateNote(activeNote.id, 'titulo', e.target.value)}
                        placeholder="Título da Anotação..."
                        className="bg-transparent text-sm font-bold text-slate-100 focus:outline-none w-full"
                      />
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleTogglePinNote(activeNote.id)}
                          className={`p-1.5 rounded border transition ${
                            activeNote.fixada ? 'bg-amber-950/50 border-amber-800 text-amber-400' : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-300'
                          }`}
                        >
                          <Pin className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteNote(activeNote.id)}
                          className="p-1.5 bg-slate-900 hover:bg-red-950 border border-slate-800 hover:border-red-800 text-slate-500 hover:text-red-400 rounded transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <textarea
                      value={activeNote.conteudo}
                      onChange={e => handleUpdateNote(activeNote.id, 'conteudo', e.target.value)}
                      placeholder="Escreva suas teorias e anotações aqui..."
                      className="w-full flex-1 bg-transparent text-xs text-slate-300 focus:outline-none resize-none leading-relaxed placeholder:text-slate-700"
                    />
                  </>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-slate-600 text-xs gap-2">
                    <FileText className="w-8 h-8 text-slate-800" />
                    <span>Selecione ou crie uma nota no painel ao lado</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB: JORNAL */}
          {activeTab === 'journal' && (
            <div className="h-full flex flex-col md:flex-row gap-6 max-w-6xl">
              <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-slate-900 pb-4 md:pb-0 md:pr-4 space-y-2 shrink-0">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-3">Categorias</span>
                
                {journalCategories.length === 0 ? (
                  <p className="text-xs text-slate-600">Nenhuma categoria registrada.</p>
                ) : (
                  <div className="flex md:flex-col gap-1 overflow-x-auto md:overflow-x-visible pb-2 md:pb-0">
                    {journalCategories.map(cat => (
                      <button
                        key={cat.id}
                        onClick={() => setSelectedJournalCategory(cat.id)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-xs transition whitespace-nowrap ${
                          selectedJournalCategory === cat.id
                            ? 'bg-slate-900 text-slate-100 font-bold border border-slate-800'
                            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-950'
                        }`}
                      >
                        {cat.nome}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex-1 space-y-4 overflow-y-auto">
                {journalEntries.filter(e => e.categoriaId === selectedJournalCategory).length === 0 ? (
                  <div className="p-12 border border-slate-900 rounded-xl bg-slate-950/30 text-center">
                    <BookOpen className="w-8 h-8 text-slate-800 mx-auto mb-2" />
                    <p className="text-xs text-slate-600">Nenhum registro encontrado nesta categoria.</p>
                  </div>
                ) : (
                  journalEntries
                    .filter(entry => entry.categoriaId === selectedJournalCategory)
                    .filter(entry =>
                      entry.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      entry.conteudo.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                    .map(entry => (
                      <div key={entry.id} className="p-5 border border-slate-900 rounded-xl bg-slate-950/50 space-y-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-sm font-bold text-slate-100">{entry.titulo}</h3>
                            {entry.subtitulo && <p className="text-xs text-slate-500 mt-0.5">{entry.subtitulo}</p>}
                          </div>
                          <span className="text-[10px] text-slate-600 bg-black px-2 py-0.5 rounded border border-slate-900">
                            {entry.atualizadoEm}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">{entry.conteudo}</p>
                      </div>
                    ))
                )}
              </div>
            </div>
          )}

          {/* TAB: FAVORITOS */}
          {activeTab === 'favorites' && (
            <div className="space-y-6 max-w-6xl">
              <div>
                <h2 className="text-base font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                  Itens Favoritados
                </h2>
                <p className="text-xs text-slate-500 mt-1">Pistas e personagens favoritados para acesso rápido.</p>
              </div>

              {favorites.length === 0 ? (
                <div className="p-12 border border-slate-900 rounded-xl bg-slate-950/30 text-center space-y-3">
                  <Star className="w-8 h-8 text-slate-700 mx-auto" />
                  <p className="text-xs text-slate-500">Nenhum item adicionado aos favoritos.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {characters.filter(c => favorites.includes(c.id)).map(char => (
                    <div key={char.id} className="p-5 border border-amber-900/40 rounded-xl bg-slate-950/60 space-y-3 relative">
                      <button
                        onClick={() => toggleFavorite(char.id)}
                        className="absolute top-4 right-4 text-amber-400 hover:text-slate-500 transition"
                      >
                        <Star className="w-4 h-4 fill-amber-400" />
                      </button>
                      <span className="text-[10px] bg-amber-950/80 text-amber-300 border border-amber-800/60 px-2 py-0.5 rounded font-bold uppercase">
                        Personagem
                      </span>
                      <h3 className="text-sm font-bold text-slate-100">{char.nome}</h3>
                      <p className="text-xs text-slate-400 line-clamp-2">{char.descricao}</p>
                    </div>
                  ))}

                  {clues.filter(c => favorites.includes(c.id)).map(clue => (
                    <div key={clue.id} className="p-5 border border-amber-900/40 rounded-xl bg-slate-950/60 space-y-3 relative">
                      <button
                        onClick={() => toggleFavorite(clue.id)}
                        className="absolute top-4 right-4 text-amber-400 hover:text-slate-500 transition"
                      >
                        <Star className="w-4 h-4 fill-amber-400" />
                      </button>
                      <span className="text-[10px] bg-amber-950/80 text-amber-300 border border-amber-800/60 px-2 py-0.5 rounded font-bold uppercase">
                        Pista ({clue.categoria})
                      </span>
                      <h3 className="text-sm font-bold text-slate-100">{clue.nome}</h3>
                      <p className="text-xs text-slate-400 line-clamp-2">{clue.descricao}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* MODAL DE CRIAÇÃO DE PERSONAGEM */}
      {isCharacterModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-950 border border-slate-800 rounded-xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            {/* Cabeçalho do Modal */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-900 bg-black/40">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-amber-400" />
                <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider">Novo Registro de Personagem</h3>
              </div>
              <button
                onClick={() => setIsCharacterModalOpen(false)}
                className="text-slate-500 hover:text-slate-300 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Formulário */}
            <form onSubmit={handleCreateCharacter} className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
              <div className="space-y-1">
                <label className="text-slate-400 font-bold uppercase text-[10px]">Nome do Indivíduo *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Dr. Arthur Vance"
                  value={newCharNome}
                  onChange={e => setNewCharNome(e.target.value)}
                  className="w-full bg-black border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-slate-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-slate-400 font-bold uppercase text-[10px]">Cargo / Ocupação</label>
                  <input
                    type="text"
                    placeholder="Ex: Patologista Forense"
                    value={newCharCargo}
                    onChange={e => setNewCharCargo(e.target.value)}
                    className="w-full bg-black border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-slate-600"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400 font-bold uppercase text-[10px]">Idade</label>
                  <input
                    type="number"
                    placeholder="Ex: 42"
                    value={newCharIdade}
                    onChange={e => setNewCharIdade(e.target.value)}
                    className="w-full bg-black border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-slate-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-slate-400 font-bold uppercase text-[10px]">Status</label>
                  <select
                    value={newCharStatus}
                    onChange={e => setNewCharStatus(e.target.value as any)}
                    className="w-full bg-black border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-slate-600"
                  >
                    <option value="Vivo">Vivo</option>
                    <option value="Desaparecido">Desaparecido</option>
                    <option value="Morto">Morto</option>
                    <option value="Desconhecido">Desconhecido</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400 font-bold uppercase text-[10px]">URL da Foto (Opcional)</label>
                  <input
                    type="url"
                    placeholder="https://exemplo.com/foto.jpg"
                    value={newCharFotoUrl}
                    onChange={e => setNewCharFotoUrl(e.target.value)}
                    className="w-full bg-black border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-slate-600"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-bold uppercase text-[10px]">Descrição Geral</label>
                <textarea
                  rows={3}
                  placeholder="Detalhes físicos, histórico ou impressões iniciais..."
                  value={newCharDescricao}
                  onChange={e => setNewCharDescricao(e.target.value)}
                  className="w-full bg-black border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-slate-600 resize-none"
                />
              </div>

              <div className="space-y-2 border-t border-slate-900 pt-3">
                <label className="text-slate-400 font-bold uppercase text-[10px]">Informações Descobertas (Pistas/Fatos)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Ex: Visto perto do porto na noite do crime"
                    value={newCharInfoInput}
                    onChange={e => setNewCharInfoInput(e.target.value)}
                    className="w-full bg-black border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-slate-600"
                  />
                  <button
                    type="button"
                    onClick={handleAddInfoToNewChar}
                    className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-slate-200 rounded-lg border border-slate-800 transition shrink-0"
                  >
                    Adicionar
                  </button>
                </div>

                {newCharInfos.length > 0 && (
                  <ul className="space-y-1.5 pt-2">
                    {newCharInfos.map((info, index) => (
                      <li key={index} className="flex justify-between items-center bg-black/60 p-2 rounded border border-slate-900 text-slate-300">
                        <span className="truncate max-w-[380px]">• {info}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveInfoFromNewChar(index)}
                          className="text-slate-500 hover:text-red-400 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-900">
                <button
                  type="button"
                  onClick={() => setIsCharacterModalOpen(false)}
                  className="px-4 py-2 bg-black hover:bg-slate-900 text-slate-400 rounded-lg border border-slate-800 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-100 font-bold rounded-lg border border-slate-700 transition"
                >
                  Salvar Personagem
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};