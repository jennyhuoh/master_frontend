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
import MainRoom from './pages/mainRoom';
import AddGroup from './pages/addGroup';
import BlankPage from './components/blankPage';
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
        <Route path='/group/:groupId' element={<Child3 />} />
        <Route path='/groupResult/:discussId' element={<Child />} />
        <Route path='/mainRoom/:roomId' element={<Child2 />} />
        <Route path='/addGroup' element={<AddGroup />} />
        <Route path='/blankPage' element={<BlankPage />} />
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
  function Child2() {
    let {roomId} = useParams();
    return(
      <MainRoom roomId={roomId}/>
    );
  }
  function Child3() {
    let {groupId} = useParams();
    return(
      <DiscussGroup groupId={groupId} />
    );
  }
}
