import styles from './index.module.css'
import React, { useEffect, useState } from 'react'
import SideBar from '../../components/SideBar'
import Title from '../../components/Title'
import { useLocation } from 'react-router-dom'
import { connect } from 'react-redux'
import { activeScreenShare, getLocalPreviewAndInitRoomConnection, stopScreenShare } from '../../utils/webRTCHandler'
import ChatBox from '../../components/ChatBox'
import BtnDock from '../../components/BtnDock'
import loadingImg from '../../assets/loading.svg'
import toggleCloseImg from '../../assets/toggleClose.svg'
import toggleOpenImg from '../../assets/toggleOpen.svg'
import store from '../../store/store'
import { setCurrentMainShow } from '../../store/actions'

const Room = (props) => {

    const { roomId, isRoomHost, identity, currentMainShow } = props
    const [titleText, setTitleText] = useState('')
    const [videosToggleShow, setVideosToggleShow] = useState(false)

    const pathname = useLocation().pathname

    //依赖参数为空数组，组件加载后只执行一次，防止死循环，会有警告提示
    useEffect(() => {
        if (identity === '') {
            /** 
            *动态获取接口，设置当前定向到的URL，加入这个条件判断的原因是：使用浏览器刷新页面时，redux的state会被初始化，
            *然而路由参数却不会消失，就会导致刷新后断开上一个房间的连接然后重新创建了新房间，identity为空字符串，就进去新房间了
            *这是设计缺陷，懒得改了。
            *现在的效果是，刷新页面就回到创建页（首页）
            */
            window.location.href = window.location.origin
        } else {
            getLocalPreviewAndInitRoomConnection(isRoomHost, identity, roomId)
        }
    }, [])

    //依赖路径名，每当路由变化就执行
    useEffect(() => {
        //根据当前页生成标题文字
        if (pathname === '/room') {
            setTitleText('会议房间号码：')

            stopScreenShare()
        } else if (pathname === '/screen_share') {
            setTitleText('会议房间号码：')

            activeScreenShare()
        }
    }, [pathname])

    return (
        <div className={styles['container']}>
            <div className={styles['wrapper']}>
                <SideBar />

                <div className={styles['content']}>
                    <Title
                        text={titleText}
                        roomId={roomId}
                    />

                    <div className={styles['videos-window']}>
                        <div id='videos_portal' className={styles['videos-protal']}>

                            <div id='videos_toggle' className={styles['videos-toggle']}>
                                <img
                                    src={videosToggleShow ? toggleOpenImg : toggleCloseImg}
                                    alt='toggleImg'
                                    className={styles['toggle-btn']}
                                    onClick={() => {
                                        let videosToggle = document.getElementById('videos_toggle')
                                        if (videosToggle.classList.contains('videos-toggle-open')) {
                                            videosToggle.classList.replace('videos-toggle-open', 'videos-toggle-close')
                                            setVideosToggleShow(false)
                                        } else if (videosToggle.classList.contains('videos-toggle-close')) {
                                            videosToggle.classList.replace('videos-toggle-close', 'videos-toggle-open')
                                            setVideosToggleShow(true)
                                        } else {
                                            videosToggle.classList.add('videos-toggle-open')
                                            setVideosToggleShow(true)
                                        }
                                    }}
                                />
                                {/* 视频轨道抽屉，远程用户视频轨道会以小窗口的形式动态生成在这里 */}
                            </div>

                            <img src={loadingImg} alt='loadingImg' className={styles['loading-animation']} />

                            {/* 本地视频轨道 */}
                            <video
                                id='main_video_track'
                                className={styles['video-full-size']}
                                autoPlay
                                muted={false}
                            />

                            {/* 接收需要放大的视频的流 */}
                            <video
                                id='size_up_video_track'
                                className={styles['video-full-size']}
                                autoPlay
                                muted={false}
                                // 实现点击自己就解除放大他人的视频的效果
                                onClick={() => {
                                    let self = document.getElementById('size_up_video_track')
                                    let videosToggle = document.getElementById('videos_toggle')
                                    let wrappers = videosToggle.querySelectorAll('div')
                                    //全部视频都显示
                                    for (let i = 0; i < wrappers.length; i++) {
                                        wrappers[i].style.display = 'block'
                                    }
                                    self.srcObject = null
                                    self.style.display = 'none'
                                    store.dispatch(setCurrentMainShow('我自己')) //react刷新状态用
                                    self.removeAttribute('currentMainShow') //当前peer断开连接用来恢复主显为我自己用
                                }}
                            />

                        </div>

                        <div className={styles['main-video-track-discribe']}>当前显示：{currentMainShow}</div>

                    </div>

                    <BtnDock />
                </div>

                <ChatBox />
            </div>
        </div>
    )
}

const mapStateToProps = (state) => {
    return {
        ...state,
    }
}

export default connect(mapStateToProps)(Room)