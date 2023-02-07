import {
    MeetingProvider,
    useMeeting,
    useParticipant,
    MeetingConsumer,
} from "@videosdk.live/react-sdk";
import {
    useMutation,
    useQuery
} from 'react-query';
import axios from "axios";
import { 
    getVideoSDKAuthToken,
    postCreateMeetingId,
} from "../features/api";

var token2 = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcGlrZXkiOiI4OGFmM2E2MC0zZGI1LTQ5ZjgtOTA0OC1kNjYxMGE3NDJmOWMiLCJwZXJtaXNzaW9ucyI6WyJhbGxvd19qb2luIl0sImlhdCI6MTY3NTc1NzQ5MSwiZXhwIjoxNzA3MjkzNDkxfQ.7h1n8cyaVBUKF_TrCND-fNu5RsUG5R4NSek3km5R0hI'
export default function MeetingRoom() {
    const videoSDKAuthTokenQuery = useQuery('token', getVideoSDKAuthToken,{
        refetchOnWindowFocus: false
    })
    const { mutate } = useMutation(postCreateMeetingId, {
        onError: () => {
            alert('error happened')
        }
    })

    const getMeetingAndToken = async () => {
        mutate(videoSDKAuthTokenQuery.data.data.token)
        // postCreateMeetingId(token2)
        // await axios.post('https://api.videosdk.live/v2/rooms', {
        //     token: `${token2}`
        // },
        // {
        //     headers: {
        //         "Content-Type": "application/json",
        //         authorization: `${token2}`,
        //     },
        // }).then((res) => console.log(res.data))
        // return true
    };

    return(
        <div>
            {console.log(videoSDKAuthTokenQuery.data)}
            meeting room
            <button onClick={getMeetingAndToken}>get</button>
        </div>
    );
}