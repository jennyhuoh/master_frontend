import { useState, useEffect, useRef } from "react";
import webSocket from 'socket.io-client';
import Peer from 'simple-peer';

export default function AudioRoom() {
    const [ws, setWs] = useState(null);
    const localVideoRef = useRef();
    const [room, setRoom] = useState('');
    
    const connectWebSocket = () => {
        setWs(webSocket('http://localhost:3001'));
    }


    useEffect(() => {
        if(ws) {
            console.log('success connect!')
            initWebSocket()
        }
    }, [ws])

    const disConnectWebSocket = () => {
        ws.emit('disConnection', 'XXX')
    }

    const initWebSocket = () => {
        ws.on('getMessage', message => {
            console.log(message)
        })
        ws.on('getMessageAll', message => {
            console.log(message)
        })
        ws.on('getMessageLess', message => {
            console.log(message)
        })

        ws.on('addRoom', message => {
            console.log(message)
        })
        // 傳送disConnection關閉連線
        ws.on('disConnection', () => {
            ws.close()
        })
    }

    const changeRoom = () =>{
        // let room = event.target.value;
        console.log(room)
        if(room !== '') {
            ws.emit('addRoom', room)
        }
    }

    const sendMessage = (name) => {
        ws.emit(name, 'Got the message!')
    }

    const getUserMedia = () => {
        const constraints = {
            audio: true,
            video: true
        }
        navigator.mediaDevices.getUserMedia(constraints)
        .then(stream => {
            localVideoRef.current.srcObject = stream;
        })
        .catch(e => {
            console.log('getUserMedia Error: ', e)
        })
    }

    return(
        <div>
            <select onChange={(e) => {setRoom(e.target.value)}}>
                <option value=''>請選擇房間</option>
                <option value='room1'>房間一</option>
                <option value='room2'>房間二</option>
            </select>
            <button onClick={changeRoom}>確認選擇的房間</button>
            
            <input type='button' value='連線' onClick={connectWebSocket} />
            <input type='button' value='斷線' onClick={disConnectWebSocket} />
            <input type='button' value='送出訊息，只有自己收到' onClick={() => {sendMessage('getMessage')}} />

            <input type='button' value='送出訊息，所有人收到' onClick={() => {sendMessage('getMessageAll')}} />
            <input type='button' value='送出訊息，除了自己所有人收到' onClick={() => {sendMessage('getMessageLess')}} />
            <button onClick={() => {getUserMedia()}}>Get Access to Media</button>
            <video autoPlay ref={localVideoRef}></video>
            
        </div>
    );
}