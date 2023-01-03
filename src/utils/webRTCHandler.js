import store from '../store/store'
import { setCurrentMainShow, setMessages } from '../store/actions'
import Peer from 'simple-peer'
import * as wss from './wss'
import { v4 as uuidv4 } from 'uuid'

let localCameraStream
let localDisplayStream = null
let peers = {}
let streams = []
const messageChannel = 'messager'

//获取本地预览及初始化房间连接
export const getLocalPreviewAndInitRoomConnection = async (
    isRoomHost,
    identity,
    roomId
) => {
    //采集本地音视频流（获取媒体输入的访问权限）
    navigator.mediaDevices
        .getUserMedia({
            audio: true,
            video: { width: '640', height: '360' }
        })
        .then((stream) => {
            localCameraStream = stream
            //预览本地视频
            showLocalVideoPreview(localCameraStream)

            //初始化房间连接
            isRoomHost ? wss.createNewRoom(identity) : wss.joinRoom(roomId, identity)
        })
        .catch((error) => {
            console.log('无法获取本地媒体流！')
            console.log(error)
        })
}

//配置STUN服务器
const getConfiguration = () => {
    return {
        iceServers: [
            {
                urls: 'stun:stun1.l.google.com:19302'
            }
        ]
    }
}


//准备webRTC连接
export const prepareNewPeerConnection = (connUserSocketId, isInitiator) => {
    const configuration = getConfiguration();
    //实例化对等连接对象
    if (localDisplayStream) { /* 假如有别人新加入房间，new对方的peer的时候就应该用自己当前的stream来new，这样子发送给对方的stream才是目前我希望发给对方的摄像头流/屏幕共享流 */
        peers[connUserSocketId] = new Peer({
            initiator: isInitiator,
            config: configuration,
            stream: localDisplayStream,
            channelName: messageChannel
        })
    } else {
        peers[connUserSocketId] = new Peer({
            initiator: isInitiator,
            config: configuration,
            stream: localCameraStream,
            channelName: messageChannel
        })
    }

    //信令数据传递
    peers[connUserSocketId].on('signal', (data) => {

        const signalData = {
            signal: data,
            connUserSocketId: connUserSocketId
        }
        wss.signalPeerData(signalData)
    })

    //获取媒体流stream
    peers[connUserSocketId].on('stream', (stream) => {
        console.log('成功获取远程Stream')
        //显示接收的stream媒体流
        addStream(stream, connUserSocketId)
        streams = [...streams, stream]
    })

    //data数据通道
    peers[connUserSocketId].on('data', (data) => {
        const messageData = JSON.parse(data)
        appendNewMessage(messageData)
    })
}

export const handleSignalingData = (data) => {
    //将信令数据添加到对等连接中
    peers[data.connUserSocketId].signal(data.signal)
}

export const removePeerConnection = (data) => {
    const { socketId } = data
    const videoElement = document.getElementById(socketId)
    const videoWrapper = document.getElementById(`${socketId}_wrapper`)
    const sizeUpVideoTrack = document.getElementById('size_up_video_track')

    if (videoElement) {
        const tracks = videoElement.srcObject.getTracks()

        tracks.forEach((track) => track.stop())

        videoElement.srcObject = null
        videoWrapper.parentNode.removeChild(videoWrapper)

        //当前被放大显示的用户如果离开房间，就恢复主要显示为我自己
        if (sizeUpVideoTrack.getAttribute('currentMainShow') === socketId) {
            let videosToggle = document.getElementById('videos_toggle')
            let wrappers = videosToggle.querySelectorAll('div')
            //全部视频都显示
            for (let i = 0; i < wrappers.length; i++) {
                wrappers[i].style.display = 'block'
            }
            sizeUpVideoTrack.srcObject = null
            sizeUpVideoTrack.style.display = 'none'
            store.dispatch(setCurrentMainShow('我自己')) //react刷新状态用
            sizeUpVideoTrack.removeAttribute('currentMainShow') //当前peer断开连接用来恢复主显为我自己用
        }

        if (peers[socketId]) {
            peers[socketId].destroy()
        }

        delete peers[socketId]
    }
}

/////////////////////////Video UI ///////////////////////////////////////

//显示本地视频
const showLocalVideoPreview = (stream) => {
    const videoElement = document.getElementById('main_video_track')

    videoElement.srcObject = stream

    //onloadedmetadata在指定视频/音频（audio/video）的元数据加载后触发。
    videoElement.onloadedmetadata = () => {
        videoElement.play()
        toggleMic(store.getState().mic)
        toggleCamera(store.getState().camera)
        videoElement.style.display = 'block'
    }

}

//添加接收的stream媒体流并进行显示
const addStream = (stream, connUserSocketId) => {
    //使用js创建容器展示视频
    const videosContainer = document.getElementById('videos_toggle')
    const videoWrapper = document.createElement('div')
    const text = document.createElement('span')
    const videoElement = document.createElement('video')

    //标记是谁的视频
    let user = store.getState().participants.find(item => item.socketId === connUserSocketId)

    videoWrapper.classList.add('toggle-video-track-wrapper')
    videoElement.classList.add('toggle-video-track')
    videoWrapper.id = `${connUserSocketId}_wrapper`
    videoElement.id = connUserSocketId

    videoElement.autoplay = true
    videoElement.muted = false
    videoElement.srcObject = stream

    //onloadedmetadata在指定视频/音频（audio/video）的元数据加载后触发。
    videoElement.onloadedmetadata = () => {
        videoElement.play()

        //添加点击事件
        videoElement.addEventListener('click', () => {
            let videosToggle = document.getElementById('videos_toggle')
            let wrappers = videosToggle.querySelectorAll('div')

            //先全部视频都显示
            for (let i = 0; i < wrappers.length; i++) {
                wrappers[i].style.display = 'block'
            }
            //再隐藏自己
            videoWrapper.style.display = 'none'

            let sizeUpVideoTrack = document.getElementById('size_up_video_track')
            sizeUpVideoTrack.srcObject = videoElement.srcObject
            sizeUpVideoTrack.style.display = 'block'

            //标记当前放大了谁
            store.dispatch(setCurrentMainShow(user.identity)) //react刷新渲染用
            sizeUpVideoTrack.setAttribute('currentMainShow', connUserSocketId) //当前peer断开连接用来恢复主显为我自己用
        })
    }

    videosContainer.appendChild(videoWrapper)
    videoWrapper.appendChild(videoElement)
    text.innerText = user.identity
    videoWrapper.appendChild(text)
}

/////////////////////////button logic ///////////////////////////////////////
export const toggleMic = (mic) => {
    //getAudioTracks - 返回可用的音频轨道
    //enabled - 获取或设置轨道是否激活 (true|false)
    localCameraStream.getAudioTracks()[0].enabled = mic
}

export const toggleCamera = (camera) => {
    localCameraStream.getVideoTracks()[0].enabled = camera
}


////////////////////////////切换流/////////////////////////////////////////
export const toggleScreenShare = (activeScreenShare, screenSharingStream) => {
    if (!activeScreenShare) {
        //展示摄像头媒体流
        switchVideoTracks(localCameraStream)
    } else {
        //展示共享屏幕媒体流
        switchVideoTracks(screenSharingStream)
    }
}

const switchVideoTracks = (stream) => {
    //遍历所有对等连接对象
    for (let socket_id in peers) {

        for (let index in peers[socket_id].streams[0].getTracks()) {

            for (let index2 in stream.getTracks()) {

                //kind属性规定轨道的种类（eg:audio,video）
                if (peers[socket_id].streams[0].getTracks()[index].kind === stream.getTracks()[index2].kind) {
                    peers[socket_id].replaceTrack(peers[socket_id].streams[0].getTracks()[index], stream.getTracks()[index2], peers[socket_id].streams[0])
                }

            }

        }

    }

}

//将远程发送到别的peers的媒体流从摄像头切换到屏幕录制
export const activeScreenShare = async () => {

    try {
        //获取本地要共享的媒体资源
        localDisplayStream = await navigator.mediaDevices.getDisplayMedia({
            audio: true,
            video: { width: '1280', height: '720' },
        })
    } catch (error) {
        console.log('获取共享屏幕的媒体流失败');
    }

    if (localDisplayStream) {
        toggleScreenShare(true, localDisplayStream);

        //切换video的视频源
        let videoElement = document.getElementById('main_video_track')
        videoElement.srcObject = localDisplayStream
    }
}

//停止屏幕共享
export const stopScreenShare = () => {
    if (localDisplayStream) {
        toggleScreenShare(false);
        //停止共享屏幕
        localDisplayStream.getTracks().forEach((track) => track.stop());

        //交换video的视频源
        let videoElement = document.getElementById('main_video_track')
        videoElement.srcObject = localCameraStream

        //释放资源
        localDisplayStream = null
    }
}

/////////////////////////Messages ///////////////////////////////////////
const appendNewMessage = (messageData) => {
    //同步到store进行保存
    const messages = store.getState().messages
    store.dispatch(setMessages([...messages, messageData]))
}

//通过data通道发送聊天信息
export const sendMessageUsingDataChannel = (message) => {
    const { identity, socketId } = store.getState()

    //组装messageData对象
    let messageData = {
        identity,
        socketId,
        text: message,
        uuid: uuidv4()
    }

    //将本地发送的聊天信息存储到store
    appendNewMessage(messageData)

    //聊天信息发送给远程webRTC对等方
    const stringifiedMessageData = JSON.stringify(messageData)
    for (let socket_id in peers) {
        peers[socket_id].send(stringifiedMessageData)
    }

}
