import './App.css';
import { Routes, Route } from 'react-router-dom';
import { ReactKeycloakProvider } from '@react-keycloak/web';
import { ReactQueryDevtools } from 'react-query/devtools';
import { 
  QueryClientProvider,
  QueryClient,
} from 'react-query';
import keycloak from './keycloak';
import Login from './pages/login';
import MeetingRoom from './pages/meetingRoom';
// import KeycloakPage from './keycloak';

const queryClient = new QueryClient()

export default function App() {
  return (
    <ReactKeycloakProvider authClient={keycloak}>
      <QueryClientProvider client={queryClient}>
      <Routes>
        <Route path='/' element={<Login />} />
        <Route path='/meetingRoom' element={<MeetingRoom />} />
      </Routes>
      <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </ReactKeycloakProvider>
  );
}
