import './App.css';
import { Routes, Route } from 'react-router-dom';
import { ReactKeycloakProvider } from '@react-keycloak/web';
import keycloak from './keycloak';
import Login from './pages/login';
// import KeycloakPage from './keycloak';
export default function App() {
  return (
    <ReactKeycloakProvider authClient={keycloak}>
      <Routes>
        <Route path='/' element={<Login />} />
      </Routes>
    </ReactKeycloakProvider>
  );
}
