import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const PrivateRoute = ({ children }: { children: ReactNode }) => {
  const { currentUser } = useAuth();

  // Se não houver usuário logado, redireciona para a página de Login
  return currentUser ? <>{children}</> : <Navigate to="/login" />;
};