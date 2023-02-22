import './App.css';
import { Routes, Route, useParams } from 'react-router-dom';
import { ReactKeycloakProvider } from '@react-keycloak/web';
import { ReactQueryDevtools } from 'react-query/devtools';
import { 
  QueryClientProvider,
  QueryClient,
} from 'react-query';
import keycloak from './keycloak';
import Login from './pages/login';
import MeetingRoom from './pages/meetingRoom';
import InMeetingRoom from './pages/inMeetingRoom';
import AudioRoom from './pages/audioRoom';
import Home from './pages/home';
import DiscussGroup from './pages/discussGroup';
import GroupResult from './pages/groupResult';
// import KeycloakPage from './keycloak';

const queryClient = new QueryClient()

export default function App() {
  return (
    <ReactKeycloakProvider authClient={keycloak}>
      <QueryClientProvider client={queryClient}>
      <Routes>
        <Route path='/' element={<Login />} />
        <Route path='/meetingRoom' element={<MeetingRoom />} />
        <Route path='/inMeetingRoom' element={<InMeetingRoom />} />
        <Route path='/audioRoom' element={<AudioRoom />} />
        <Route path='/home' element={<Home />} />
        <Route path='/discussGroup' element={<DiscussGroup />} />
        <Route path='/groupResult/:discussId' element={<Child />} />
      </Routes>
      <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </ReactKeycloakProvider>
  );
  function Child() {
    let {discussId} = useParams();
    return(
      <GroupResult discussId={discussId}/>
    );
  }
}
