import {
    MeetingProvider,
    useMeeting,
    useParticipant,
    MeetingConsumer,
    Constants,
} from "@videosdk.live/react-sdk";
import { useState } from "react";

// function JoinScreen() {
//     return null;
// }

function VideoComponent(props) {
    return null;
}

function Controls(props) {
    const { leave, toggleMic, toggleWebcam } = useMeeting();
    return(
        <div>
            <button onClick={leave}>Leave</button>
            <button onClick={toggleMic}>toggleMic</button>
            <button onClick={toggleWebcam}>toggleWebcam</button>
        </div>
    );
}

function Container(props) {
    const [joined, setJoined] = useState(false);
    const { join } = useMeeting();
    const { participants } = useMeeting();
    const joinMeeting = async () => {
        setJoined(true);
        join();
    }
    return(
        <div>
            <h3>Meeting Id: {localStorage.getItem("meetingId")}</h3>
            {joined ? (
                <div>
                    <Controls />
                    {[participants.keys()].map((participantId) => (
                        <VideoComponent participantId={participantId} />
                    ))}
                </div>
            ) : (
                <button onClick={joinMeeting}>Join</button>
            )}
        </div>
    );
}

export default function InMeetingRoom() {
    const meetingId = localStorage.getItem("meetingId");
    const [meetingMode, setMeetingMode] = useState(Constants.modes.CONFERENCE);

    return meetingId ? (
        <MeetingProvider
            config={{
                meetingId,
                micEnabled: true,
                webcamEnabled: false,
                name: "Jenny",
                mode: "CONFERENCE",
                multiStream: false
            }}
            token={localStorage.getItem("meetingToken")}
        >
            <MeetingConsumer>
                {() => <Container meetingId={meetingId} meetingMode={meetingMode} />}
            </MeetingConsumer>
        </MeetingProvider>
    ) : 
    "";
}