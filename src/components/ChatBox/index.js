import styles from './index.module.css'
import React, { useState } from 'react'
import sendImg from '../../assets/send.svg'
import { connect } from 'react-redux'
import { sendMessageUsingDataChannel } from '../../utils/webRTCHandler'
import Bubble from '../Bubble'
import Title from '../Title'
import { useEffect } from 'react'

const ChatBox = (props) => {

    const [inputMessage, setInputMessage] = useState('')
    const { messages, socketId } = props

    useEffect(() => {
        const messageListWrapper = document.getElementById('message_list_wrapper')

        messageListWrapper.scrollTop = messageListWrapper.scrollHeight

    }, [messages])

    return (
        <div className={styles['container']}>
            <Title text={'聊天室'} />

            <div id='message_list_wrapper' className={styles['message-list-wrapper']}>
                {
                    //群聊消息面板
                    messages.map(item => <Bubble
                        key={item.uuid}
                        id={item.uuid} /* 扩展点：可以做撤回消息功能，根据id移除dom */
                        text={item.text}
                        isMe={item.socketId === socketId} /* 控制消息显示在左或者右 */
                        identity={item.identity}
                    />)
                }
            </div>

            <div className={styles['input-area']}>
                <div>
                    <textarea
                        className={styles['input']}
                        placeholder='输入以发送...'
                        value={inputMessage}
                        maxLength={128}
                        onChange={(evt) => { setInputMessage(evt.target.value) }}
                        onKeyDown={(evt) => {
                            if (evt.key === 'Enter') {
                                //阻止默认事件，也就阻止两下回车发送换行消息了
                                evt.preventDefault()

                                if (inputMessage !== '') {
                                    sendMessageUsingDataChannel(inputMessage)
                                    setInputMessage('')
                                }
                            }
                        }}
                    />
                </div>

                <img
                    src={sendImg}
                    alt='sendImg'
                    className={styles['send-btn']}
                    onClick={() => {
                        if (inputMessage !== '') {
                            sendMessageUsingDataChannel(inputMessage)
                            setInputMessage('')
                        }
                    }}
                />
            </div>
        </div>
    )
}

const mapStateToProps = (state) => {
    return {
        ...state,
    }
}

export default connect(mapStateToProps)(ChatBox)