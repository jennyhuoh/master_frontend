import {
    useMutation,
    useQuery
} from 'react-query';
import axios from "axios";
import { useNavigate } from 'react-router-dom';
import Header from '../components/header'
import { 
    getVideoSDKAuthToken,
    postCreateMeetingId,
} from "../features/api";

var token2 = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcGlrZXkiOiI4OGFmM2E2MC0zZGI1LTQ5ZjgtOTA0OC1kNjYxMGE3NDJmOWMiLCJwZXJtaXNzaW9ucyI6WyJhbGxvd19qb2luIl0sImlhdCI6MTY3NTc1NzQ5MSwiZXhwIjoxNzA3MjkzNDkxfQ.7h1n8cyaVBUKF_TrCND-fNu5RsUG5R4NSek3km5R0hI'
export default function MeetingRoom() {
    const navigate = useNavigate()
    const videoSDKAuthTokenQuery = useQuery('token', getVideoSDKAuthToken,{
        refetchOnWindowFocus: false
    })
    const { mutate } = useMutation(postCreateMeetingId, {
        onError: () => {
            alert('error happened')
        },
        onSuccess: async () =>  {
            navigate('/inMeetingRoom')      
        },
    })

    const getMeetingAndToken = async () => {
        localStorage.setItem('meetingToken', videoSDKAuthTokenQuery.data.data.token)
        return mutate(videoSDKAuthTokenQuery.data.data.token)
        // postCreateMeetingId(token2)
        // await axios.post('https://api.videosdk.live/api/meetings', {
        //     token: `${videoSDKAuthTokenQuery.data.data.token}`
        // },
        // {
        //     headers: {
        //         "Content-Type": "application/json",
        //         Authorization: `${videoSDKAuthTokenQuery.data.data.token}`,
        //     },
        // }).then((res) => console.log(res.data))
        // return true
    };

    return(
        <div>
            <Header />
            {console.log(videoSDKAuthTokenQuery.data)}
            meeting room
            {/* <a href='./inMeetingRoom' onClick={getMeetingAndToken}>go to meeting room</a> */}
            <button onClick={getMeetingAndToken}>join</button>
        </div>
    );
}