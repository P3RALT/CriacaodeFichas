import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { NewCharacter } from './pages/NewCharacter';
import { ViewCharacter } from './pages/ViewCharacter';
import { PrivateRoute } from './components/PrivateRoute';

export function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Rotas Públicas */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Rotas Protegidas */}
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/character/new"
            element={
              <PrivateRoute>
                <NewCharacter />
              </PrivateRoute>
            }
          />
          {/* Rota de Edição */}
          <Route
            path="/character/edit/:id"
            element={
              <PrivateRoute>
                <NewCharacter />
              </PrivateRoute>
            }
          />
          {/* Rota de Visualização */}
          <Route
            path="/character/:id"
            element={
              <PrivateRoute>
                <ViewCharacter />
              </PrivateRoute>
            }
          />

          {/* Rota Fallback (Redireciona URLs desconhecidas para o Dashboard) */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;