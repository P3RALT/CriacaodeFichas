import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LogOut, User as UserIcon } from 'lucide-react';

export const Navbar = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Erro ao sair:', error);
    }
  };

  return (
    <nav className="w-full bg-white border-b border-slate-100 px-8 py-5 flex items-center justify-between">
      {/* Logotipo Limbo RPG */}
      <div className="flex items-center gap-2 text-xs font-mono tracking-[0.3em] text-slate-900 uppercase">
        <span className="w-4 h-4 rounded-full border border-slate-900 flex items-center justify-center text-[9px] font-bold">
          L
        </span>
        <span className="font-bold tracking-[0.35em]">LIMBO</span>
        <span className="text-slate-300 mx-1">•</span>
        <span className="text-slate-400 font-light tracking-[0.3em]">RPG</span>
      </div>

      {/* Usuário e Botão Sair */}
      <div className="flex items-center gap-5">
        <div className="flex items-center gap-2 text-slate-500 text-xs font-mono">
          <UserIcon className="w-3.5 h-3.5 text-slate-400" />
          <span>{currentUser?.email}</span>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 text-[10px] font-extrabold uppercase tracking-widest px-4 py-2 rounded-full transition shadow-sm"
        >
          <LogOut className="w-3.5 h-3.5" />
          Sair
        </button>
      </div>
    </nav>
  );
};