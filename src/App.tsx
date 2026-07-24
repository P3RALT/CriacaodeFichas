import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { NewCharacter } from './pages/NewCharacter';
import { ViewCharacter } from './pages/ViewCharacter';
import { CreateCampaign } from './pages/CreateCampaign';
import { SearchCampaign } from './pages/SearchCampaign';
import { PrivateRoute } from './components/PrivateRoute';
import { MasterPanel } from './pages/MasterPanel';
import { PlayerCampaign } from './pages/PlayerCampaign';

export function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Rotas Públicas */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />

          {/* Rotas Protegidas do Mestre e Jogador */}
          <Route path="/mestre/:campaignId" element={<PrivateRoute><MasterPanel /></PrivateRoute>} />
          <Route path="/campaign/:campaignId" element={<PrivateRoute><PlayerCampaign /></PrivateRoute>} />
          {/* Rotas Protegidas de Campanhas */}
          <Route path="/campaign/new" element={<PrivateRoute><CreateCampaign /></PrivateRoute>} />
          <Route path="/campaign/search" element={<PrivateRoute><SearchCampaign /></PrivateRoute>} />

          {/* Rotas Protegidas de Fichas */}
          <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/character/new" element={<PrivateRoute><NewCharacter /></PrivateRoute>} />
          <Route path="/character/edit/:id" element={<PrivateRoute><NewCharacter /></PrivateRoute>} />
          <Route path="/character/:id" element={<PrivateRoute><ViewCharacter /></PrivateRoute>} />

          {/* Rota Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;