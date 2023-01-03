import styles from './index.module.css'
import React from 'react'

const Bubble = (props) => {

    /* isMe控制消息显示在左或者右 */
    const { identity, isMe, text, id } = props

    return (
        <div id={id} className={isMe ? styles['flex-right'] : styles['flex-left']}>
            <div className={styles['bubble']}>
                <div className={styles['identity']}>{identity} :</div>
                <div className={styles['text']}>{text}</div>
            </div>
        </div>
    )
}

export default Bubble