import websocket, { Socket, connect } from 'socket.io-client';
import Peer from 'simple-peer';
import { useRef, useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, IconButton } from '@mui/material';
import { v4 as uuid } from 'uuid';
import { Mic, MicOff, Videocam, VideocamOff } from '@mui/icons-material';
import { useStateWithCallback } from '../hooks/useStateWithCallback';
import freeice from 'freeice';
import styled from 'styled-components';

const Container = styled.div`
    padding: 20px;
    display: flex;
    height: auto;
    min-height: 100vh;
    width: 100vw;
    margin: auto;
    flex-wrap: wrap;
    background-color:#2B3143;
`;
const StyledVideo = styled.video`
    height: 100%;
    width: 100%;
`;

// const Video = (props) => {
//     // const id = uuid();
//     const ref = useRef();
//     useEffect(() => {
//         props.peer.on('stream', stream => {
//             ref.current.srcObject = stream;
//         })
//     }, []);
//     // console.log('props', props);
//     return(
//         <StyledVideo key={props.id} playsInline autoPlay ref={ref} />
//     );
// }

export default function MainRoom(pageMainRoomProps) {
    const [peers, setPeers] = useStateWithCallback([]);// clients
    // const [audio, setAudio] = useState(true);
    // const [video, setVideo] = useState(true);
    // const [userUpdate, setUserUpdate] = useState([])
    const wsRef = useRef(null);// socket
    // const userVideo = useRef();// LocalMediaStream
    const peersRef = useRef(null);
    const audioElements = useRef({});
    const connections = useRef({});
    const localMediaStream = useRef(null);

    const roomID = pageMainRoomProps.roomId
    const info = {
        roomID: pageMainRoomProps.roomId,
        userName: localStorage.getItem('userName')
    }
    const user = {
        name: localStorage.getItem('userName'),
        id: localStorage.getItem('userId'),
        email: localStorage.getItem('userEmail'),
    }
    let navigate = useNavigate();

    // const videoConstraints = {
    //     height: window.innerHeight / 1.7,
    //     width: window.innerWidth / 2,
    // }
    const addNewPeer = useCallback((newPeer, cb) => {
        console.log('add be called')
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
        peersRef.current = peers;
    }, [peers]);
    useEffect(() => {
        const initChat = async () => {
            wsRef.current = websocket('http://localhost:3001') 
            await captureMedia();
            addNewPeer(user, () => {
                const localElement = audioElements.current[user.id];
                if(localElement) {
                    // localElement.volume = 0;
                    localElement.srcObject = localMediaStream.current;
                }
            })
            wsRef.current.on('addPeer', handleNewPeer)
            wsRef.current.on('removePeer', handleRemovePeer);
            wsRef.current.on('iceCandidate', handleIceCandidate)
            wsRef.current.on('sessionDescription', handleRemoteSDP)
            // socket emit JOIN socket io
            wsRef.current.emit('joinRoom', {roomID, user})
        }
        async function captureMedia() {
            // Start capturing local audio stream
            localMediaStream.current = await navigator.mediaDevices.getUserMedia({audio: true})
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
                addNewPeer(remoteUser, () => {
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
        // wsRef.current = websocket('http://localhost:3001')
        // navigator.mediaDevices.getUserMedia({video: videoConstraints, audio: true}).then(stream => {
        //     userVideo.current.srcObject = stream;
        //     wsRef.current.emit('joinRoom', info);
        //     wsRef.current.on('allUsers', users => {
        //         console.log('users', users);
        //         const peers = [];
        //         users.forEach(userID => {
        //                 const peer = createPeer(userID, wsRef.current.id, stream);
        //                 peersRef.current.push({
        //                     peerID: userID,
        //                     peer,
        //                 })
        //                 peers.push({
        //                     peerID: userID,
        //                     peer,
        //                 });
        //         })
        //         setPeers(peers);
        //     })
        //     wsRef.current.on('userJoined', payload => {
        //         console.log('user joined payload', payload)
        //         if(payload.callerID !== undefined) {
        //             const peer = addPeer(payload.signal, payload.callerID, stream);
        //             peersRef.current.push({
        //                 peerID: payload.callerID,
        //                 peer,
        //             })
        //             const peerObj = {
        //                 peer,
        //                 peerID: payload.callerID,
        //             }
        //             setPeers(users => [...users, peerObj]);
        //         }
        //     })
        //     wsRef.current.on('userLeft', async (payload) => {
        //         console.log('userLeft', payload.message)
        //         const peerObj = peersRef.current.find((p) => p.peerID === payload.socketID);
        //         if(peerObj) {
        //             await peerObj.peer.destroy();
        //             console.log('successfully destroyed!')
        //         }
        //         const peers = peersRef.current.filter((p) => p.peerID !== payload.socketID);
        //         peersRef.current = await peers;
        //         setPeers(peers);
        //     })
        //     wsRef.current.on('receivingReturnedSignal', payload => {
        //         const item = peersRef.current.find(p => p.peerID === payload.id);
        //         console.log('receive!')
        //         item.peer.signal(payload.signal);
        //     })
        //     wsRef.current.on('changge', (payload) => {
        //         setUserUpdate(payload);
        //         console.log('changePayload', payload)
        //     })
        //     wsRef.current.on('addRoom', message => {
        //         console.log(message)
        //     })
        //     wsRef.current.on('addRoomBroadcast', message => {
        //         console.log(message);
        //     })
        // })
    }, []);



    // function createPeer(userToSignal, callerID, stream){
    //     const peer = new Peer({
    //         initiator: true,
    //         trickle: false,
    //         stream,
    //     });

    //     peer.on('signal', signal => {
    //         wsRef.current.emit('sendingSignal', { userToSignal, callerID, signal })
    //     })

    //     return peer;
    // }

    // function addPeer(incomingSignal, callerID, stream){
    //     const peer = new Peer({
    //         initiator: false,
    //         trickle: false,
    //         stream,
    //     })
    //     peer.on('signal', signal => {
    //         wsRef.current.emit('returningSignal', { signal, callerID })
    //     })

    //     peer.signal(incomingSignal);
    //     return peer;
    // }

    // const disConnectWebSocket = async () => {
    //     await Promise.all(userVideo.current.srcObject.getTracks().map(async (track) => {
    //         await track.stop();
    //     })).then(async () => {
    //         await wsRef.current.emit('disconnecttt', `${localStorage.getItem('userName')}`);
    //         await wsRef.current.disconnect();
    //         navigate('/home')
    //     })
    // }
    // const stopVideo = async () => {
    //     const videoTrack = await userVideo.current.srcObject.getVideoTracks()[0];
    //     console.log('track', videoTrack)
    //     if(videoTrack.enabled) {
    //         wsRef.current.emit('change', [...userUpdate, {
    //             id: wsRef.current.id,
    //             room: roomID,
    //             video: false,
    //             audio
    //         }])
    //         videoTrack.enabled = false;
    //         setVideo(false);
    //     } else {
    //         wsRef.current.emit('change', [...userUpdate, {
    //             id: wsRef.current.id,
    //             room: roomID,
    //             video: true,
    //             audio
    //         }])
    //         videoTrack.enabled = true;
    //         setVideo(true);
    //     }
    // }
    // const stopMic = async () => {
    //     const audioTrack = await userVideo.current.srcObject.getAudioTracks().find(track => track.kind === 'audio');
    //     console.log('audioTrack', audioTrack)
    //     if(audioTrack.enabled) {
    //         wsRef.current.emit('change', [...userUpdate, {
    //             id: wsRef.current.id,
    //             room: roomID,
    //             video,
    //             audio: false
    //         }])
    //         audioTrack.enabled = false;
    //         setAudio(false);
    //     } else {
    //         wsRef.current.emit('change', [...userUpdate, {
    //             id: wsRef.current.id,
    //             room: roomID,
    //             video,
    //             audio: true
    //         }])
    //         audioTrack.enabled = true;
    //         setAudio(true);
    //     }
    // }

    if(true){
        return(
            <Container>
                 <Box>
                    {console.log('peers', peers)}
                    {peers.map((peer) => {
                        return(
                        <div key={peer.id}>
                            <audio ref={(instance) => provideRef(instance, peer.id)} controls autoPlay />
                            <h4 style={{color:'white'}}>{peer.name}</h4>
                        </div>
                        )
                    })}
                    {/* {localStorage.getItem('role') === 'teacher' && 
                    <> */}
                    {/* {video ? 
                     <IconButton sx={{color:'white'}} onClick={stopVideo}><Videocam /></IconButton> :
                     <IconButton sx={{color:'white'}} onClick={stopVideo}><VideocamOff /></IconButton>
                    }
                    {audio ? 
                     <IconButton sx={{color:'white'}} onClick={stopMic}><Mic /></IconButton> :
                     <IconButton sx={{color:'white'}} onClick={stopMic}><MicOff /></IconButton>
                    } */}
                    {/* <Button onClick={disConnectWebSocket}>Leave</Button> */}
                </Box>
                {/* <StyledVideo muted ref={userVideo} autoPlay playsInline />
                <div>{localStorage.getItem('userName')}</div>
                {peers.map((peer, index) => {
                    console.log('peer', peer)
                    let audioTemp = true;
                    let videoTemp = true;
                    if(userUpdate) {
                        userUpdate.forEach((entry) => {
                            if(peer && peer.peerID && peer.peerID === entry.id) {
                                audioTemp = entry.audio;
                                videoTemp = entry.video;
                            }
                        })
                    }
                    return(
                    <Box key={peer.peerID} style={{backgroundColor:'pink'}}>
                        
                        <Video key={index} peer={peer.peer} id={peer.peerID} />
                        {videoTemp ? 
                        <IconButton sx={{color:'grey'}}><Videocam /></IconButton> :
                        <IconButton sx={{color:'grey'}}><VideocamOff /></IconButton>
                        } 
                        {audioTemp ? 
                        <IconButton sx={{color:'grey'}}><Mic /></IconButton> :
                        <IconButton sx={{color:'grey'}}><MicOff /></IconButton>
                        }
                    </Box>
                    );
                })} */}
                
               
            </Container>
        );
    } else{
        return(
            <></>
        );
    }
}