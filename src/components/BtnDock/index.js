import styles from './index.module.css'
import React from 'react'
import { connect } from 'react-redux'
import exitImg from '../../assets/exit.svg'
import micImg from '../../assets/mic.svg'
import cameraImg from '../../assets/camera.svg'
import micOffImg from '../../assets/micOff.svg'
import cameraOffImg from '../../assets/cameraOff.svg'
import { toggleCamera, toggleMic } from '../../utils/webRTCHandler'
import store from '../../store/store'
import { setCamera, setMic } from '../../store/actions'

const BtnDock = (props) => {

    const { mic, camera } = props

    return (
        <div className={styles['container']}>
            <img
                src={mic ? micImg : micOffImg}
                alt='micImg'
                className={`${styles['media-btn']} ${!mic ? styles['media-btn-active'] : ''}`}
                onClick={() => {
                    toggleMic(!mic)
                    store.dispatch(setMic(!mic))
                }}
            />

            <img
                src={exitImg}
                alt='exitImg'
                className={styles['exit-btn']}
                onClick={() => {
                    //动态获取接口，设置当前定向到的URL，效果就是强制回到首页断开连接
                    window.location.href = window.location.origin
                }}
            />

            <img
                src={camera ? cameraImg : cameraOffImg}
                alt='cameraImg'
                className={`${styles['media-btn']} ${!camera ? styles['media-btn-active'] : ''}`}
                onClick={() => {
                    toggleCamera(!camera)
                    store.dispatch(setCamera(!camera))
                }}
            />
        </div>
    )
}

const mapStateToProps = (state) => {
    return {
        ...state,
    }
}

export default connect(mapStateToProps)(BtnDock)