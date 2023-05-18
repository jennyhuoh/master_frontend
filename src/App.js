import './App.css';
import { Routes, Route, useParams } from 'react-router-dom';
import { 
  QueryClientProvider,
  QueryClient,
} from 'react-query';
import Login from './pages/login';
import Home from './pages/home';
import DiscussGroup from './pages/discussGroup';
import GroupResult from './pages/groupResult';
import MainRoom from './pages/mainRoom';
import AddGroup from './pages/addGroup';
import DiscussResult from './pages/discussResult';
import EditActivity from './pages/editActivity';
import Register from './pages/register';

const queryClient = new QueryClient()

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Routes>
        <Route path='/' element={<Login />} />
        <Route path='/home' element={<Home />} />
        <Route path='/group/:groupId' element={<Child3 />} />
        <Route path='/groupResult/:discussId' element={<Child />} />
        <Route path='/mainRoom/:groupId/:activityId' element={<Child2 />} />
        <Route path='/addGroup' element={<AddGroup />} />
        <Route path='/discussResult/:activityId' element={<Child4 />} />
        <Route path='/group/:groupId/activity/:activityId' element={<Child5 />} />
        <Route path='/register' element={<Register />} />
      </Routes>
    </QueryClientProvider>
  );
  function Child() {
    let {discussId} = useParams();
    return(
      <GroupResult discussId={discussId}/>
    );
  }
  function Child2() {
    let {groupId, activityId} = useParams();
    return(
      <MainRoom groupId={groupId} activityId={activityId} />
    );
  }
  function Child3() {
    let {groupId} = useParams();
    return(
      <DiscussGroup groupId={groupId} />
    );
  }
  function Child4() {
    let {activityId} = useParams();
    return(
      <DiscussResult activityId={activityId} />
    );
  }
  function Child5() {
    let {groupId, activityId} = useParams();
    return(
      <EditActivity groupId={groupId} activityId={activityId} />
    );
  }
}
