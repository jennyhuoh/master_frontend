import websocket from 'socket.io-client';
import Peer from 'simple-peer';
import { useRef, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const Video = (props) => {
    const ref = useRef();
    useEffect(() => {
        props.peer.on('stream', stream => {
            ref.current.srcObject = stream;
        })
    }, []);
    return(
        <video playsInline autoPlay ref={ref} />
    );
}

export default function MainRoom() {
    const [peers, setPeers] = useState([]);
    const wsRef = useRef();
    const userVideo = useRef();
    const peersRef = useRef([]);
    const { roomID } = useParams();

    useEffect(() => {
        wsRef.current = websocket('http://localhost:3001')
            navigator.mediaDevices.getUserMedia({video: true, audio: true}).then(stream => {
                userVideo.current.srcObject = stream;
                wsRef.current.emit('joinRoom', roomID);
                wsRef.current.on('allUsers', users => {
                    const peers = [];
                    users.forEach(userId => {
                        const peer = createPeer(userId, wsRef.current.id, stream);
                        peersRef.current.push({
                            peerId: userId,
                            peer,
                        })
                        peers.push(peer);
                    })
                    setPeers(peers);
                })
                wsRef.current.on('userJoined', payload => {
                    const peer = addPeer(payload.signal, payload.callerId, stream);
                    peersRef.current.push({
                        peerId: payload.callerId,
                        peer,
                    })
                    setPeers(users => [...users, peer]);
                })
                wsRef.current.on('receivingReturnedSignal', payload => {
                    const item = peersRef.current.find(p => p.peerId === payload.id);
                    item.peer.signal(payload.signal);
                })
            })
    }, []);

    function createPeer(userToSignal, callerId, stream){
        const peer = new Peer({
            initiator: true,
            trickle: false,
            stream,
        });

        peer.on('signal', signal => {
            wsRef.current.emit('sendingSignal', { userToSignal, callerId, signal })
        })

        return peer;
    }

    function addPeer(incomingSignal, callerId, stream){
        const peer = new Peer({
            initiator: false,
            trickle: false,
            stream,
        })
        peer.on('signal', signal => {
            wsRef.current.emit('returningSignal', { signal, callerId })
        })

        peer.signal(incomingSignal);
        return peer;
    }

    if(true){
        return(
            <div>
                <video muted ref={userVideo} autoPlay playsInline />
                {peers.map((peer, index) => {
                    return(
                        <Video key={index} peer={peer} />
                    );
                })}
            </div>
        );
    } else{
        return(
            <></>
        );
    }
}