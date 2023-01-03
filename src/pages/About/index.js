import styles from './index.module.css'
import React from 'react'
import SideBar from '../../components/SideBar'

const About = () => {
    return (
        <div className={styles['container']}>
            <div className={styles['wrapper']}>
                <SideBar />

                <div className={styles['content']}>

                </div>
            </div>
        </div>
    )
}

export default About