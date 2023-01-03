import styles from './index.module.css'
import React from 'react'
import copyImg from '../../assets/copy.svg'

const Title = ({ text, err, roomId }) => {

    let renderText = roomId ? text + roomId : text

    return (
        <div
            className={`${styles['container']} ${err ? styles['err-color'] : ''}`}
        >
            <span>{renderText}</span>

            {
                roomId &&
                <img
                    src={copyImg}
                    alt='copyImg'
                    className={styles['btn']}
                    onClick={() => {
                        navigator.clipboard.writeText(roomId)
                    }}
                />
            }
        </div>
    )
}

export default Title