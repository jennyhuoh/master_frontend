import websocket, { Socket, connect } from 'socket.io-client';
import { useRef, useEffect, useState, useCallback } from 'react';
import { useFetcher, useNavigate, useParams } from 'react-router-dom';
import { Box, Button, IconButton, Fab, Tooltip, Backdrop, CircularProgress, Typography } from '@mui/material';
import { Mic, MicOff, ExitToApp, Groups2 } from '@mui/icons-material';
import { useStateWithCallback } from '../hooks/useStateWithCallback';
import { createRecord } from '../features/api';
import { useMutation } from 'react-query';
import freeice from 'freeice';
import AvatarGroup from 'react-avatar-group';
import randomColor from 'randomcolor';

export default function MainRoomContent(pageMainRoomProps) {
    const [peers, setPeers] = useStateWithCallback([]);// clients
    const wsRef = useRef(null);// socket
    const peersRef = useRef([]);
    const audioElements = useRef({});
    const connections = useRef({});
    const localMediaStream = useRef(null);
    const groupId = pageMainRoomProps.groupId;
    const {activityId:roomID} = useParams();
    // console.log('roomId', activityId)
    // const roomID = pageMainRoomProps.activityId;
    const user = {
        name: localStorage.getItem('userName'),
        id: localStorage.getItem('userId'),
        email: localStorage.getItem('userEmail'),
    }
    let navigate = useNavigate();
    let color = randomColor()
    const [borderColor, setBorderColor] = useState(color);
    const [isMute, setMute] = useState(true);
    const [backDropOpen, setBackDropOpen] = useState(false);
    const [whoIsTalking, setWhoIsTalking] = useState(null);

    const mediaRecorder = useRef(null);
    const [recordingStatus, setRecordingStatus] = useState("inactive");
    const [audioChunks, setAudioChunks] = useState(null);
    const [audio, setAudio] = useState(null);
    const mimeType = "audio/wav";

    const {mutate} = useMutation(createRecord, {
        onSuccess: () => {

        }
    })

    const addNewPeer = useCallback((newPeer, cb) => {
        const lookingFor = peers.find((peer) => peer.id === newPeer.iD);
        console.log('lookingFor', lookingFor)
        if(lookingFor === undefined) {
            setPeers((existingPeers) => [...existingPeers, newPeer], cb);
        }
    })
    const provideRef = (instance, userId) => {
        audioElements.current[userId] = instance;
    }

    useEffect(() => {
        const initChat = async () => {
            wsRef.current = websocket('http://localhost:3001') 
            await captureMedia();
            addNewPeer({...user, muted:true}, () => {
                const localElement = audioElements.current[user.id];
                if(localElement) {
                    // localElement.volume = 1;
                    localElement.muted = true
                    localElement.srcObject = localMediaStream.current;
                }
            })
            wsRef.current.on('addPeer', handleNewPeer)
            wsRef.current.on('removePeer', handleRemovePeer);
            wsRef.current.on('iceCandidate', handleIceCandidate)
            wsRef.current.on('sessionDescription', handleRemoteSDP)
            // Listen for mute/unmute
            wsRef.current.on('mute', ({peerId, userId}) => {
                handleSetMute(true, userId)
            })
            wsRef.current.on('unMute', ({peerId, userId}) => {
                handleSetMute(false, userId)
            })
            // socket emit JOIN socket io
            wsRef.current.emit('joinRoom', {roomID, user})

        }
    
        async function captureMedia() {
            // Start capturing local audio stream
            localMediaStream.current = await navigator.mediaDevices.getUserMedia({audio: true})
            mediaRecorder.current = new MediaRecorder(localMediaStream.current, {type: mimeType})
        }
        async function handleNewPeer({peerId, createOffer, user: remoteUser}){
             console.log('here is addPeer')
            // id already connected then give warning
            if(peerId in connections.current) {
                return console.warn(`You are already connected with ${peerId} (${user.name})`)
            }
            // Store it to connections
            connections.current[peerId] = new RTCPeerConnection({
                iceServers: freeice()
            })
            // Handle new ice candidate
            connections.current[peerId].onicecandidate = (event) => {
                wsRef.current.emit('relayIce', {
                    peerId,
                    icecandidate: event.candidate
                })
            }
            // Handle on track on this connection
            connections.current[peerId].ontrack = ({ streams: [remoteStream] }) => {
                console.log('remoteUser', remoteUser)
                addNewPeer({...remoteUser, muted:true}, () => {
                    if(audioElements.current[remoteUser.id]){
                        audioElements.current[remoteUser.id].srcObject = remoteStream
                    } else {
                        let settled = false
                        const interval = setInterval(() => {
                            if(audioElements.current[remoteUser.id]){
                                audioElements.current[remoteUser.id].srcObject = remoteStream
                                settled = true
                            }
                            if(settled) {
                                clearInterval(interval);
                            }
                        }, 1000)
                    }
                })
            }
            // Add local track to remote connections
            localMediaStream.current.getTracks().forEach(track => {
                connections.current[peerId].addTrack(track, localMediaStream.current)
            })
            // Create offer
            if(createOffer) {
                const offer = await connections.current[peerId].createOffer()
                // Set as local description
                await connections.current[peerId].setLocalDescription(offer);
                // Send offer to the server
                wsRef.current.emit('relaySDP', {peerId, sessionDescription: offer})
            }
        }
        async function handleRemovePeer({peerId, userId}){
            if(connections.current[peerId]) {
                connections.current[peerId].close();
            }
            delete connections.current[peerId];
            delete audioElements.current[peerId];
            setPeers(list => list.filter(peer => peer.id !== userId))
        }
        async function handleIceCandidate({peerId, icecandidate}){
            if(icecandidate) {
                connections.current[peerId].addIceCandidate(icecandidate);
            }
        }
        async function handleRemoteSDP({peerId, sessionDescription: remoteSessionDescription}){
            connections.current[peerId].setRemoteDescription(new RTCSessionDescription(remoteSessionDescription))
            // if session description is type of offer then create an answer
            if(remoteSessionDescription.type === 'offer') {
                const connection = connections.current[peerId]
                const answer = await connection.createAnswer();
                connection.setLocalDescription(answer);
                wsRef.current.emit('relaySDP', {peerId, sessionDescription: answer})
            }
        }
        async function handleSetMute(mute, userId){
            const peerIdx = peersRef.current.map(peer => peer.id).indexOf(userId)
            // console.log('idx', peerIdx)
            const allConnectedPeers = JSON.parse(
                JSON.stringify(peersRef.current)
            );
            if(peerIdx > -1) {
                allConnectedPeers[peerIdx].muted = mute;
                setPeers(allConnectedPeers)
            }
            console.log('peersss', peers)
        }
       
        initChat();
        return () => {
            // Leaving the room
            localMediaStream.current.getTracks().forEach(track => track.stop())
            wsRef.current.emit('leave', {roomID})
            for (let peerId in connections.current) {
                connections.current[peerId].close();
                delete connections.current[peerId];
                delete audioElements.current[peerId];
            }
            wsRef.current.off('addPeer');
            wsRef.current.off('removePeer')
            wsRef.current.off('iceCandidate');
            wsRef.current.off('sessionDescription')
        }
    }, [roomID, backDropOpen]);

    useEffect(() => {
        handleMute(isMute);
    }, [isMute])
    
    // Handle mute
    const handleMute = (isMute) => {
        let settled = false;
        let interval = setInterval(() => {
            if(localMediaStream.current) {
                localMediaStream.current.getTracks()[0].enabled = !isMute; 
                if(isMute) {
                    wsRef.current.emit('mute', {roomId: roomID, userId: user.id})
                } else {
                    wsRef.current.emit('unMute', {roomId: roomID, userId: user.id})
                }
                settled = true;
             }
             if(settled) {
                clearInterval(interval);
             }
        }, 200)
    }

    const handleMuteClick = async (peerId) => {
        if(peerId !== user.id) {
            return;
        }
        // 需要多判斷是否為分組討論
        if(localStorage.getItem('discussType') === 'group'){
            if(isMute === true) {
                setRecordingStatus("recording")
                mediaRecorder.current.start()
                let localChunks = [];
                mediaRecorder.current.ondataavailable = (event) => {
                    if(typeof event.data === "undefined") {
                        console.log('e data undefined')
                    } else if(event.data.size === 0) {
                        console.log('size 0')
                    } else {
                        localChunks.push(event.data);
                    }
                }
                setAudioChunks(localChunks);
            } else if(isMute === false) {
                setRecordingStatus("inactive")
                mediaRecorder.current.stop()
                mediaRecorder.current.onstop = () => {
                    console.log('audioChunks', audioChunks)
                    const audioBlob = new Blob(audioChunks, {type: mimeType})
                    const audioUrl = URL.createObjectURL(audioBlob);
                    setAudio(audioUrl)
                    let formData = new FormData();
                    formData.append("recording", audioBlob)
                    formData.append("name", localStorage.getItem('userName'))
                    setAudioChunks([])
                    console.log('url', audioUrl)
                    console.log('blob', audioBlob)
                    mutate({
                        stageId:22,
                        teamId: roomID,
                        data: formData,
                    })
            }
            }
        }
        setMute(!isMute)
    }

    useEffect(() => {
        peersRef.current = peers;
        getTalking()
        async function getTalking() {
            if(peers !== []) {
                var members = [];
                await Promise.all(peers.map((peer) => {
                    if(peer.muted === false){
                        members.push(peer)
                    }
                }))
                setWhoIsTalking(members);
            }
        }
    }, [peers]);

    const onClickGroupDiscussion = () => {
        let room = roomID;
        setBackDropOpen(true);
        localStorage.setItem('discussType', 'group');
        setTimeout(() => {
            setBackDropOpen(false)
        }, 1000)
        navigate(`/mainRoom/${groupId}/eeb225b1-5764-4d88-b098-0a40587759ed`)
        wsRef.current.emit('leave', {room})
        window.location.reload(true);
    }

    if(true){
        return(
            <Box>
                {/* {audio && <audio src={audio} controls />} */}
                {whoIsTalking ? 
                <Box style={{display:'flex', flexDirection:'column', alignItems:'center'}}>
                {whoIsTalking.map((member) => {
                    return(<Typography style={{color:'white', fontWeight:'semi-bold'}} key={member.id}>{member.name}正在發言…</Typography>)
                })}
                </Box>
                : ""}
                <Box style={{display:'flex', flexWrap:'wrap', gap:'80px', padding:'30px 150px'}}>
                    {/* {console.log('peers', peers)} */}
                    {peers.map((peer) => {
                        return(
                        <div key={peer.id} style={{display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center'}}>
                            <div style={{position:'relative'}}>
                                <audio ref={(instance) => provideRef(instance, peer.id)} autoPlay />
                                <AvatarGroup
                                    avatars={[`${peer.name}`]}
                                    size={100}
                                    fontSize={0.3}
                                    initialCharacters={3}
                                    hideTooltip={true}
                                    avatarStyle={{border:`4px solid ${borderColor}`}}
                                />
                                {peer.muted ? 
                                (<IconButton onClick={() => handleMuteClick(peer.id)} style={{position:'absolute', bottom:0, right:0, background:'#5A81A8', boxSizing:'content-box'}}>
                                    <MicOff color="secondary" />
                                </IconButton>) :
                                (<IconButton onClick={() => handleMuteClick(peer.id)} style={{position:'absolute', bottom:0, right:0, background:'#5A81A8', boxSizing:'content-box'}}>
                                    <Mic color="secondary" />
                                </IconButton>)
                                }
                            </div>
                             <h4 style={{color:'white'}}>{peer.name}</h4>
                        </div>
                        )
                    })}
                </Box>
                <Tooltip title="離開">
                    <Fab onClick={() => {navigate('/home')}} aria-label="leave" color="error" style={{position:'absolute', right:40, bottom:40}}>
                        <ExitToApp sx={{fontSize:34, color:'white'}} />
                    </Fab>
                </Tooltip>
                <Tooltip title="前往分組討論">
                    <Fab onClick={onClickGroupDiscussion} aria-label="leave" sx={{color:'#EEF1F4'}} style={{position:'absolute', right:120, bottom:40}}>
                        <Groups2 sx={{fontSize:34, color:'#2B3143'}} />
                    </Fab>
                </Tooltip>
                <Backdrop
                    sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
                    open={backDropOpen}
                >
                    <CircularProgress color="inherit" />
                </Backdrop>
            </Box>
        );
    } else{
        return(
            <></>
        );
    }
}