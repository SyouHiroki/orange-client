import io from 'socket.io-client'
import store from '../store/store'
import { setRoomId, setParticipants, setSocketId } from '../store/actions'
import * as webRTCHandler from './webRTCHandler'

const SERVER = 'http://localhost:5000'
let socket = null;

//客户端连接 socketio 服务器
export const connectWithSocketIOServer = () => {

    socket = io(SERVER)

    socket.on('connect', () => {
        console.log('成功连接到socket.io 服务器')
        console.log(socket.id)
        store.dispatch(setSocketId(socket.id))
    })

    socket.on('room-id', (data) => {
        const { roomId } = data
        store.dispatch(setRoomId(roomId))
    })

    socket.on('room-update', (data) => {
        const { connectedUsers } = data
        store.dispatch(setParticipants(connectedUsers))
    })

    socket.on('conn-prepare', (data) => {
        const { connUserSocketId } = data
        //准备webRTC连接(应答方-false)
        webRTCHandler.prepareNewPeerConnection(connUserSocketId, false)

        //通知对方我已经准备完毕可以进行webRTC连接
        socket.emit('conn-init', { connUserSocketId: connUserSocketId })
    })

    socket.on('conn-signal', (data) => {
        webRTCHandler.handleSignalingData(data)
    })

    socket.on('conn-init', (data) => {
        const { connUserSocketId } = data
        //准备webRTC连接(发起方-true)
        webRTCHandler.prepareNewPeerConnection(connUserSocketId, true)
    })

    socket.on('user-disconected', (data) => {
        webRTCHandler.removePeerConnection(data)
    })

}

//主持人创建会议房间
export const createNewRoom = (identity) => {
    const data = {
        identity
    }
    //向服务器发送创建会议房间的数据（事件）
    socket.emit('create-new-room', data)
}

//加入会议房间
export const joinRoom = (roomId, identity) => {
    //向服务器发送加入会议房间的数据（事件）
    const data = {
        roomId,
        identity
    }

    socket.emit('join-room', data)
}

export const signalPeerData = (data) => {
    socket.emit('conn-signal', data)
}
