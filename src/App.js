import React, { useEffect } from 'react'
import { BrowserRouter as Router, Navigate, Route, Routes } from 'react-router-dom'
import Lobby from './pages/Lobby'
import Room from './pages/Room'
import { connectWithSocketIOServer } from './utils/wss'

function App() {
    useEffect(() => {
        connectWithSocketIOServer()
    }, [])

    return (
        <Router>
            <Routes>
                <Route path='/create' element={<Lobby />} />
                <Route path='/join' element={<Lobby />} />
                <Route path='/room' element={<Room />} />
                <Route path='/screen_share' element={<Room />} />

                <Route path='/' element={<Navigate to='/create' />} />
                <Route path='*' element={<Navigate to='/create' />} />
            </Routes>
        </Router>
    );
}

export default App;
