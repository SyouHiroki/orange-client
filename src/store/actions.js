const Actions = {
    SET_IS_ROOM_HOST: 'SET_IS_ROOM_HOST',
    SET_ROOM_ID: 'SET_ROOM_ID',
    SET_IDENTITY: 'SET_IDENTITY',
    SET_PARTICIPANTS: 'SET_PARTICIPANTS',
    SET_MESSAGES: 'SET_MESSAGES',
    SET_SOCKET_ID: 'SET_SOCKET_ID',
    SET_MIC: 'SET_MIC',
    SET_CAMERA: 'SET_CAMERA',
    SET_CURRENT_MAIN_SHOW: 'SET_CURRENT_MAIN_SHOW'
}

export const setCurrentMainShow = (currentMainShow) => {
    return {
        type: Actions.SET_CURRENT_MAIN_SHOW,
        currentMainShow
    }
}

export const setMic = (mic) => {
    return {
        type: Actions.SET_MIC,
        mic
    }
}

export const setCamera = (camera) => {
    return {
        type: Actions.SET_CAMERA,
        camera
    }
}

export const setIsRootHost = (isRoomHost) => {
    return {
        type: Actions.SET_IS_ROOM_HOST,
        isRoomHost
    }
}

export const setIdentity = (identity) => {
    return {
        type: Actions.SET_IDENTITY,
        identity
    }
}

export const setRoomId = (roomId) => {
    return {
        type: Actions.SET_ROOM_ID,
        roomId
    }
}

export const setParticipants = (participants) => {
    return {
        type: Actions.SET_PARTICIPANTS,
        participants
    }
}

export const setMessages = (messages) => {
    return {
        type: Actions.SET_MESSAGES,
        messages
    }
}

export const setSocketId = (socketId) => {
    return {
        type: Actions.SET_SOCKET_ID,
        socketId
    }
}

export default Actions
