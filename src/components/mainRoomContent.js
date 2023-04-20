import websocket, { Socket, connect } from 'socket.io-client';
import { useRef, useEffect, useState, useCallback, useContext } from 'react';
import { useFetcher, useNavigate, useParams } from 'react-router-dom';
import { Box, Button, IconButton, Fab, Tooltip, Backdrop, CircularProgress, Typography, AppBar, Drawer, Divider, TextField } from '@mui/material';
import { Mic, MicOff, ExitToApp, Groups2, CastForEducation, Textsms, ChevronLeft, ChevronRight, Send } from '@mui/icons-material';
import { useStateWithCallback } from '../hooks/useStateWithCallback';
import { createRecord } from '../features/api';
import { useMutation } from 'react-query';
import { styled, useTheme } from "@mui/material/styles";
import freeice from 'freeice';
import AvatarGroup from 'react-avatar-group';
import randomColor from 'randomcolor';
import context from '../context';

const drawerWidth = 300;
const AppBars = styled(AppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open }) => ({
  transition: theme.transitions.create(['margin', 'width'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    // width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    marginRight: drawerWidth
  }),
}));
const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
  justifyContent: 'flex-start',
}));

export default function MainRoomContent(pageMainRoomProps) {
    const theme = useTheme();
    const [peers, setPeers] = useStateWithCallback([]);// clients
    const wsRef = useRef(null);// socket
    const peersRef = useRef([]);
    const audioElements = useRef({});
    const connections = useRef({});
    const localMediaStream = useRef(null);
    const groupId = pageMainRoomProps.groupId;
    const {activityId:roomID} = useParams();
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
    const {stageInfo, checkingStage} = useContext(context);
    const [teamRoom, setTeamRoom] = useState(null);
    const [chatOpen, setChatOpen] = useState(false);
    const [message, setMessage] = useState("");
    const [allMessages, setAllMessages] = useState([]);

    const {mutate} = useMutation(createRecord)

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
            // Listen for grouping team id
            wsRef.current.on('openGroupDiscuss', ({team, stageId}) => {
                console.log('teamRoom', team)
                setTeamRoom(team)
                localStorage.setItem('stageId', stageId)
            })
            // Listen for messages
            wsRef.current.on('message', ({userName, message, time}) => {
                setAllMessages((prev) => [...prev, {
                    name: userName,
                    message: message,
                    time: time
                }])
            })

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
                        stageId: localStorage.getItem('stageId'),
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

    useEffect(() => {
        if(checkingStage !== undefined) {
            if(checkingStage.grouping === true && checkingStage.stageChecked === true) {
                let teamDetail = stageInfo[checkingStage.stageOrder-1].teams
                wsRef.current.emit('openGroupDiscuss', {roomId: roomID, teamDetail})
                // console.log('checkingStage', checkingStage);
                // localStorage.setItem('stageId', checkingStage.id)
            }
            console.log('stageInfo', stageInfo)
        }
    }, [checkingStage])

    const onClickGroupDiscussion = () => {
        let room = roomID;
        setBackDropOpen(true);
        localStorage.setItem('discussType', 'group');
        setTimeout(() => {
            setBackDropOpen(false)
        }, 1000)
        navigate(`/mainRoom/${groupId}/${teamRoom}`)
        wsRef.current.emit('leave', {room})
        window.location.reload(true);
    }

    const onClickBackToMain = () => {
        let room = roomID;
        setBackDropOpen(true);
        localStorage.setItem('discussType', 'all');
        setTimeout(() => {
            setBackDropOpen(false)
        }, 1000)
        setTeamRoom(null);
        navigate(`/mainRoom/${groupId}/${localStorage.getItem('mainRoomId')}`)
        wsRef.current.emit('leave', {room})
        window.location.reload(true);
    }

    const handleChatOpen = () => {
        setChatOpen(true)
    }
    const handleChatClose = () => {
        setChatOpen(false)
    }

    const onClickSendMsg = () => {
        console.log('message', message)
        if(message !== "") {
            let now = new Date()
            let minutes = (now.getMinutes() < 10 ? '0' : '') + now.getMinutes();
            let time = now.getHours() + ':' + minutes;
            wsRef.current.emit('message', {
                userId: localStorage.getItem('userId'),
                userName: localStorage.getItem('userName'),
                message: message,
                time: time.toString(),
                room: roomID
            })
            setMessage("");
        }
    }

    if(true){
        return(
            <>
            <AppBars position="fixed" open={chatOpen}></AppBars>
            <Box>
                {whoIsTalking ? 
                <Box style={{display:'flex', flexDirection:'column', alignItems:'center'}}>
                {whoIsTalking.map((member) => {
                    return(<Typography style={{color:'white', fontWeight:'semi-bold'}} key={member.id}>{member.name}正在發言…</Typography>)
                })}
                </Box>
                : ""}
                <Box style={{display:'flex', flexWrap:'wrap', gap:'0 90px', padding:'20px 160px', marginTop:'20px', overflowY:'scroll', minHeight:'75vh'}}>
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
            </Box>
                <Tooltip title="離開">
                    <Fab onClick={() => {navigate('/home')}} aria-label="leave" color="error" style={{position:'fixed', right:40, bottom:40}}>
                        <ExitToApp sx={{fontSize:32, color:'white'}} />
                    </Fab>
                </Tooltip>
                <Tooltip title="聊天室">
                    <Fab onClick={handleChatOpen} aria-label="leave" color="info" style={{position:'fixed', right:120, bottom:40}}>
                        <Textsms sx={{fontSize:30, color:'white'}} />
                    </Fab>
                </Tooltip>
                {teamRoom ? 
                <Tooltip title="前往分組討論">
                    <Fab onClick={onClickGroupDiscussion} aria-label="leave" sx={{color:'#EEF1F4'}} style={{position:'fixed', right:200, bottom:40}}>
                        <Groups2 sx={{fontSize:34, color:'#2B3143'}} />
                    </Fab>
                </Tooltip> : ""
                }
                {localStorage.getItem('discussType') === 'group' ? 
                <Tooltip title="回主會議室">
                    <Fab onClick={onClickBackToMain} aria-label="leave" sx={{color:'#EEF1F4'}} style={{position:'fixed', right:200, bottom:40}}>
                        <CastForEducation sx={{fontSize:34, color:'#2B3143'}} />
                    </Fab>
                </Tooltip> : ""
                }
                <Backdrop
                    sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
                    open={backDropOpen}
                >
                    <CircularProgress color="inherit" />
                </Backdrop>
            
            <Drawer
                sx={{
                width: drawerWidth,
                flexShrink: 0,
                "& .MuiDrawer-paper": {
                    width: drawerWidth,
                    boxSizing: "border-box"
                }
                }}
                variant="persistent"
                anchor="right"
                open={chatOpen}
                PaperProps={{
                    sx: {
                        backgroundColor: "#5A81A8",
                        color: "white",
                        borderRadius: '35px 0 0 35px'
                    }
                }}
            >
                <DrawerHeader>
                    <IconButton onClick={handleChatClose} color="secondary">
                        {theme.direction === "rtl" ? (
                        <ChevronLeft />
                        ) : (
                        <ChevronRight />
                        )}
                    </IconButton>
                </DrawerHeader>
                <Divider />
                <Box style={{display:'flex', flexDirection:'column', height:'100%'}}>
                    <Box sx={{p:'0 10px'}} style={{display:'flex', flexDirection:'column'}}>
                    {allMessages.length !== 0 && allMessages?.map((message) => (
                    message.name === localStorage.getItem('userName') ?
                    <Box sx={{mt:'20px'}} style={{alignSelf:'end', display:'flex', flexDirection:'column'}}>
                        <Typography style={{fontSize:'12px', alignSelf:'end', marginRight:'2px'}}>{message.name}</Typography>
                        <Box style={{display:'flex', alignItems:'baseline', marginTop:'2px'}}>
                            <Typography style={{marginRight:'8px', fontSize:'12px', alignSelf:'end'}}>{message.time}</Typography>
                            <Typography style={{backgroundColor:'#F6BD58', borderRadius:'6px', padding:'8px 15px', color:'black'}}>{message.message}</Typography>
                        </Box>
                    </Box> :
                    <Box sx={{mt:'20px'}}>
                        <Typography style={{fontSize:'12px', marginLeft:'2px'}}>{message.name}</Typography>
                        <Box style={{display:'flex', alignItems:'baseline', marginTop:'2px'}}>
                            <Typography style={{backgroundColor:'#EEF1F4', borderRadius:'6px', padding:'8px 15px', color:'black'}}>{message.message}</Typography>
                            <Typography style={{marginLeft:'8px', fontSize:'12px', alignSelf:'end'}}>{message.time}</Typography>
                        </Box>
                    </Box> 
                    ))}
                    </Box>
                    <Box style={{position:'fixed', width:'290px', bottom:8, display:'flex', alignItems:'center', margin:'0 5px', justifyContent:'space-around'}}>
                        <TextField 
                            onKeyDown={(ev) => {
                                if(ev.key === 'Enter'){onClickSendMsg()}
                            }} 
                            value={message} 
                            onChange={(e) => setMessage(e.target.value)} 
                            InputProps={{sx: {borderRadius:'50px', width:'230px', color:'white', maxLength: 10}}} 
                            maxRows={5} 
                            color="secondary" 
                            id="fullWidth" 
                            focused 
                        />
                        <Fab color="primary" size="small" disableFocusRipple disableRipple onClick={onClickSendMsg}><Send sx={{fontSize:22}} /></Fab>
                    </Box>
                </Box>
            </Drawer>
        </>
        );
    } else{
        return(
            <></>
        );
    }
}