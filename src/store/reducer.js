import Actions from './actions'

const initState = {
    identity: '',
    isRoomHost: true,
    roomId: null,
    participants: [],
    messages: [],
    socketId: null,
    mic: true,
    camera: true,
    currentMainShow: '我自己'
}

const reducer = (state = initState, action) => {
    switch (action.type) {
        case Actions.SET_IS_ROOM_HOST:
            return {
                ...state,
                isRoomHost: action.isRoomHost
            }

        case Actions.SET_MIC:
            return {
                ...state,
                mic: action.mic
            }

        case Actions.SET_CURRENT_MAIN_SHOW:
            return {
                ...state,
                currentMainShow: action.currentMainShow
            }

        case Actions.SET_CAMERA:
            return {
                ...state,
                camera: action.camera
            }

        case Actions.SET_ROOM_ID:
            return {
                ...state,
                roomId: action.roomId
            }

        case Actions.SET_IDENTITY:
            return {
                ...state,
                identity: action.identity
            }

        case Actions.SET_PARTICIPANTS:
            return {
                ...state,
                participants: action.participants
            }

        case Actions.SET_MESSAGES:
            return {
                ...state,
                messages: action.messages
            }

        case Actions.SET_SOCKET_ID:
            return {
                ...state,
                socketId: action.socketId
            }

        default:
            return state
    }
}

export default reducer
