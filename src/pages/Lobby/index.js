import styles from './index.module.css'
import React, { useState, useEffect } from 'react'
import SideBar from '../../components/SideBar'
import Title from '../../components/Title'
import store from '../../store/store'
import confirmImg from '../../assets/confirm.svg'
import { useLocation, useNavigate } from 'react-router-dom'
import { getRoomExists } from '../../utils/api'
import { setCamera, setIdentity, setMic, setRoomId } from '../../store/actions'
import { connect } from 'react-redux'
import micImg from '../../assets/mic.svg'
import cameraImg from '../../assets/camera.svg'
import micOffImg from '../../assets/micOff.svg'
import cameraOffImg from '../../assets/cameraOff.svg'

const Lobby = (props) => {

    const { isRoomHost, mic, camera } = props
    const [inputIdentity, setInputIdentity] = useState('')
    const [inputRoomId, setInputRoomId] = useState('')
    const [titleText, setTitleText] = useState('')
    const [err, setErr] = useState(false)
    const navigate = useNavigate()
    const pathname = useLocation().pathname

    useEffect(() => {
        //根据当前页生成标题文字
        if (pathname === '/create') {
            setTitleText('作为主持人创建会议房间')
            setErr(false)
        } else if (pathname === '/join') {
            setTitleText('作为参与者加入会议房间')
            setErr(false)
        }
    }, [pathname])

    //加入房间
    const handleJoinRoom = async () => {
        store.dispatch(setIdentity(inputIdentity));
        if (isRoomHost) {
            navigate('/room');
        } else {
            let responseMessage = await getRoomExists(inputRoomId);
            let { roomExists, full } = responseMessage;

            if (roomExists) {
                if (full) {
                    setTitleText('会议房间人数已满，请稍后再试')
                    setErr(true)
                } else {
                    //进入房间
                    store.dispatch(setRoomId(inputRoomId))
                    navigate('/room');
                }
            } else {
                setTitleText('会议房间不存在，请检查后重试')
                setErr(true)
            }
        }
    }

    const handleConfirm = () => {
        if (inputIdentity.length > 18) {
            setTitleText('您输入的昵称长度过长')
            setErr(true)
        } else if ((inputIdentity !== '' && inputRoomId !== '' && pathname === '/join') || (inputIdentity !== '' && pathname === '/create')) {
            handleJoinRoom()
        } else {
            setTitleText('请填写完整信息以继续')
            setErr(true)
        }
    }

    return (
        <div className={styles['container']}>
            <div className={styles['wrapper']}>
                <SideBar />

                <div className={styles['content']}>

                    <Title text={titleText} err={err} />

                    <div className={styles['box']}>
                        {
                            pathname === '/join' &&
                            <input
                                type='text'
                                placeholder='请输入会议房间ID号...'
                                value={inputRoomId}
                                className={styles['input']}
                                onChange={(evt) => {
                                    setInputRoomId(evt.target.value)
                                }}
                                onKeyDown={(evt) => {
                                    if (evt.key === 'Enter') {
                                        //阻止默认事件，也就阻止两下回车发送换行消息了
                                        evt.preventDefault()

                                        handleConfirm()
                                    }
                                }}
                            />
                        }
                        <input
                            type='text'
                            placeholder='请输入您的昵称...'
                            value={inputIdentity}
                            maxLength={18}
                            className={styles['input']}
                            onChange={(evt) => {
                                setInputIdentity(evt.target.value)
                            }}
                            onKeyDown={(evt) => {
                                if (evt.key === 'Enter') {
                                    //阻止默认事件，也就阻止两下回车发送换行消息了
                                    evt.preventDefault()

                                    handleConfirm()
                                }
                            }}
                        />

                        <div>
                            <img
                                src={mic ? micImg : micOffImg}
                                alt='micImg'
                                className={`${styles['media-btn']} ${!mic ? styles['media-btn-active'] : ''}`}
                                onClick={() => {
                                    store.dispatch(setMic(!mic))
                                }}
                            />

                            <img
                                src={camera ? cameraImg : cameraOffImg}
                                alt='cameraImg'
                                className={`${styles['media-btn']} ${!camera ? styles['media-btn-active'] : ''}`}
                                onClick={() => {
                                    store.dispatch(setCamera(!camera))
                                }}
                            />
                        </div>

                        <img
                            src={confirmImg}
                            alt='confirmImg'
                            className={styles['confirm-btn']}
                            onClick={handleConfirm}
                        />
                    </div>

                </div>

            </div>
        </div>
    )
}

const mapStateToProps = (state) => {
    return {
        ...state,
    }
}

export default connect(mapStateToProps)(Lobby)