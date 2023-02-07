import {
    MeetingProvider,
    useMeeting,
    useParticipant,
    MeetingConsumer,
} from "@videosdk.live/react-sdk";
import {
    useQuery
} from 'react-query';
import { getVideoSDKAuthToken } from "../features/api";


export default function MeetingRoom() {
    const videoSDKAuthTokenQuery = useQuery('token', getVideoSDKAuthToken)

    return(
        <div>
            {console.log(videoSDKAuthTokenQuery.data)}
            meeting room
        </div>
    );
}