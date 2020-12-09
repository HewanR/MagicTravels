import React from "react"

import "./header.css"

export default function Header() {
    return (
        <div className="header">
            <video autoPlay muted loop id="myVideo" width="100%" height="auto">
                <source src="../../images/mainHeader.mp4" type="video/mp4" />
            </video>
        </div>

    )
}