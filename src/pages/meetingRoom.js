import {
    useMutation,
    useQuery
} from 'react-query';
import axios from "axios";
import { useNavigate } from 'react-router-dom';
import {
    MeetingProvider,
    useMeeting,
    useParticipant,
    MeetingConsumer,
    Constants,
} from "@videosdk.live/react-sdk";
import { useState, useRef, useMemo, useEffect } from 'react';
import ReactPlayer from 'react-player';
import Header from '../components/header'
import { 
    getVideoSDKAuthToken,
    postCreateMeetingId,
    getRecordings
} from "../features/api";
import useIsRecording from '../hooks/useIsRecording';
import { OutlinedButton } from '../components/buttons/OutlineButton';
import RecordingIcon from '../icons/RecordingIcon';

function JoinScreen({getMeetingAndToken}) {
    const [meetingId, setMeetingId] = useState(null);
    const onClick = async () => {
        await getMeetingAndToken(meetingId);
    }
    return (
        <div>
            <input
                type="text"
                placeholder='Enter meeting ID'
                onChange={(e) => {
                    setMeetingId(e.target.value)
                }}
            />
            <button onClick={onClick}>Join Meeting</button>
            {"or"}
            <button onClick={onClick}>Create Meeting</button>
        </div>
    );
}

function Container(props) {
    const [joined, setJoined] = useState(false);
    const { join } = useMeeting();
    const { participants } = useMeeting();
    const joinMeeting = () => {
        setJoined(true);
        join();
    }
    return(
        <div>
            <h3>Meeting Id: {props.meetingId}</h3>
            {joined ? (
                <div>
                    <Controls token={props.token} />
                    {[...participants.keys()].map((participantId) => (
                        <VideoComponent key={participantId} participantId={participantId} />
                    ))}
                </div>
            ) : (
                <button onClick={joinMeeting}>Join Meeting</button>
            )}
        </div>
    );
}

function Controls(props) {
    const { leave, toggleMic, toggleWebcam, startRecording, stopRecording, recordingState } = useMeeting();
    const isRecording = useIsRecording();
    const isRecordinfRef = useRef(isRecording);
    const { mutateAsync } = useMutation(getRecordings, {
        onError: () => {
            alert('error happened');
        },
        onSuccess: async(res) => {
            console.log(res);
            console.log('success');
        }
    })

    useEffect(() => {
        isRecordinfRef.current = isRecording;
    }, [isRecording]);

    const { isRequestProcessing } = useMemo(() => ({
        isRequestProcessing:
            recordingState === Constants.recordingEvents.RECORDING_STARTING || recordingState === Constants.recordingEvents.RECORDING_STOPPING,
    }), [recordingState]);

    const onClickRecord = () => {
        const isRecording = isRecordinfRef.current;
        if(isRecording) {
            stopRecording();
            console.log("stop recording");
            // console.log(localStorage.getItem('meetingId'));
            // console.log(props.token)
            const data = mutateAsync({token:`${props.token}`, roomId:localStorage.getItem('meetingId')})
            console.log(data);
        } else {
            startRecording();
            console.log("start recording");
        }
    }

    return(
        <div>
            <button onClick={()=>leave()}>Leave Meeting</button>
            <button onClick={()=>toggleMic()}>Toggle Mic</button>
            <button onClick={()=>toggleWebcam()}>Toggle Webcam</button>
            <OutlinedButton
                Icon={RecordingIcon}
                onClick={onClickRecord}
                isFocused={isRecording}
                buttonText={!isRecording && "REC"}
                tooltip={
                recordingState === Constants.recordingEvents.RECORDING_STARTED
                    ? "Stop Recording"
                    : recordingState === Constants.recordingEvents.RECORDING_STARTING
                    ? "Starting Recording"
                    : recordingState === Constants.recordingEvents.RECORDING_STOPPED
                    ? "Start Recording"
                    : recordingState === Constants.recordingEvents.RECORDING_STOPPING
                    ? "Stopping Recording"
                    : "Start Recording"
                }
                lottieOption={null}
                isRequestProcessing={isRequestProcessing}
            />
        </div>
    );
}

function VideoComponent(props) {
    const micRef = useRef(null);
    const { webcamStream, micStream, webcamOn, micOn, isLocal } = useParticipant(props.participantId);
    const videoStream = useMemo(() => {
        if(webcamOn && webcamStream) {
            const mediaStream = new MediaStream();
            mediaStream.addTrack(webcamStream.track);
            return mediaStream;
        }
    }, [webcamOn, webcamStream])

    useEffect(() => {
        if(micRef.current) {
            if(micOn && micStream) {
                const mediaStream = new MediaStream();
                mediaStream.addTrack(micStream.track);

                micRef.current.srcObject = mediaStream;
                micRef.current.play().catch((error) => console.error("videoElem.current.play() failed", error));
            } else {
                micRef.current.srcObject = null;
            }
        }
    }, [micStream, micOn]);

    return(
        <div key={props.participantId}>
            {micOn && micRef && <audio ref={micRef} autoPlay muted={isLocal} />}
            {webcamOn && (
                <ReactPlayer
                    playsinline
                    pip={false}
                    light={false}
                    controls={true}
                    muted={true}
                    playing={true}
                    url={videoStream}
                    height={"100px"}
                    width={"100px"}
                    onError={(err) => {console.error(err, "Participant video error");}}
                />
            )}
        </div>
    );
}

export default function MeetingRoom() {
    const [meetingId, setMeetingId] = useState(null);
    const videoSDKAuthTokenQuery = useQuery('token', getVideoSDKAuthToken,{
        refetchOnWindowFocus: false
    })
    const { mutate } = useMutation(postCreateMeetingId, {
        onError: () => {
            alert('error happened')
        },
        onSuccess: async () =>  {     
            setMeetingId(localStorage.getItem('meetingId'))
        },
    })
    const getMeetingAndToken = async (id) => {
        id === null ?
        mutate(videoSDKAuthTokenQuery.data.data.token)
        : setMeetingId(id)
        localStorage.setItem('meetingToken', videoSDKAuthTokenQuery.data.data.token)
    };

    return(
        <div>
            <Header />
            {meetingId ? 
                <MeetingProvider
                    config={{
                        meetingId,
                        micEnabled: true,
                        webcamEnabled: false,
                        name: "Jenny",
                    }}
                    token={localStorage.getItem('meetingToken')}
                >
                    <MeetingConsumer>
                        {() => <Container meetingId={meetingId} token={videoSDKAuthTokenQuery.data.data.token} />}
                    </MeetingConsumer>
                </MeetingProvider>
                : <JoinScreen getMeetingAndToken={getMeetingAndToken} />
            }
        </div>
    );
}