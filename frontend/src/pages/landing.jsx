import React from 'react'
import "../App.css"
import { Link, useNavigate } from 'react-router-dom'
export default function LandingPage() {


    const router = useNavigate();

     const generateRandomRoomId = () => {
    
        return Math.random().toString(36).substring(2, 8);
    }

    const handleJoinAsGuest = () => {
    
        const roomId = generateRandomRoomId();

        router(`/${roomId}`);
    }

    return (
        <div className='landingPageContainer'>
            <nav>
                <div className='navHeader'>
                    <h2>ChatGuard AI</h2>
                </div>
                <div className='navlist'>
                    <p onClick={handleJoinAsGuest}>Join as Guest</p>
                        
                    <p onClick={() => {
                        router("/auth")

                    }}>Register</p>
                    <div onClick={() => {
                        router("/auth")

                    }} role='button'>
                        <p>Login</p>
                    </div>
                </div>
            </nav>


            <div className="landingMainContainer">
                <div>
                    <h1><span style={{ color: "#FF9839" }}>Shielding </span> Conversations. Empowering Respect.</h1>

                    <p>Not just messages — we filter hate.</p>
                    <div role='button'>
                        <Link to={"/auth"}>Get Started</Link>
                    </div>
                </div>
                <div>

                    <img src="/mobile.png" alt="" />

                </div>
            </div>



        </div>
    )
}
