import styles from './index.module.css'
import React from 'react'
import logoImg from '../../assets/logo.png'
import createImg from '../../assets/create.svg'
import joinImg from '../../assets/join.svg'
import roomImg from '../../assets/room.svg'
import screenShareImg from '../../assets/screenShare.svg'
import store from '../../store/store'
import { useNavigate, useLocation } from 'react-router-dom'
import { setIsRootHost } from '../../store/actions'

const SideBar = () => {
    const navigate = useNavigate()
    const pathname = useLocation().pathname

    const CreateOrJoin = () => {
        return (
            <>
                <img
                    src={createImg}
                    alt='createImg'
                    className={`${styles['btn']} ${pathname === '/create' ? styles['btn-active'] : ''}`}
                    onClick={() => {
                        if (pathname === '/create') {
                            return
                        }

                        store.dispatch(setIsRootHost(true))
                        navigate('/create')
                    }}
                />

                <img
                    src={joinImg}
                    alt='joinImg'
                    className={`${styles['btn']} ${pathname === '/join' ? styles['btn-active'] : ''}`}
                    onClick={() => {
                        if (pathname === '/join') {
                            return
                        }

                        store.dispatch(setIsRootHost(false))
                        navigate('/join')
                    }}
                />
            </>
        )
    }

    const RoomOrScreenShare = () => {
        return (
            <>
                <img
                    src={roomImg}
                    alt='roomImg'
                    className={`${styles['btn']} ${pathname === '/room' ? styles['btn-active'] : ''}`}
                    onClick={() => {
                        if (pathname === '/room') {
                            return
                        }

                        navigate('/room')
                    }}
                />

                <img
                    src={screenShareImg}
                    alt='screenShareImg'
                    className={`${styles['btn']} ${pathname === '/screen_share' ? styles['btn-active'] : ''}`}
                    onClick={() => {
                        if (pathname === '/screen_share') {
                            return
                        }

                        navigate('/screen_share')
                    }}
                />
            </>
        )
    }

    const handleRender = () => {
        switch (pathname) {
            case '/create':
                return CreateOrJoin()
            case '/join':
                return CreateOrJoin()
            case '/room':
                return RoomOrScreenShare()
            case '/screen_share':
                return RoomOrScreenShare()

            default:
                return null
        }
    }

    return (
        <div className={styles['container']}>
            <div className={styles['logo-wrapper']}>
                <img className={styles['logo-img']} src={logoImg} alt='logoImg' />
            </div>

            <div className={styles['btn-wrapper']}>
                {handleRender()}
            </div>

            <div className={styles['placeholder-wrapper']}>{/* 留空占位 */}</div>
        </div>
    )
}

export default SideBar