import React, {useRef, useEffect} from "react";
import styled from "styled-components";
import io from "socket.io-client";


const Container = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, 300px);
  grid-auto-rows: 300px;
`

const Video = styled.video`
  width: 100%;
  height: 100%;
  object-fit: cover;
`
const Room = (props) => {
    const userVideo = useRef()
    const partnerVideo = useRef()
    const peerRef = useRef()
    const socketRef = useRef()
    const otherUser = useRef()
    const userStream = useRef()

    useEffect(() => {
        navigator.mediaDevices.getUserMedia({audio: true, video: true}).then(stream => {
            userVideo.current.srcObject = stream;
            userStream.current = stream

            socketRef.current = io.connect("/");
            socketRef.current.emit("join room", props.match.params.roomID);

            socketRef.current.on("other user", userID => {
                callUser(userID);
                otherUser.current = userID;
            })

            socketRef.current.on("user joined", userID => {
                otherUser.current = userID;
            })
        })
    }, [])

    return (
        <Container>
            <Video autoPlay muted ref={userVideo}/>
            <Video autoPlay ref={partnerVideo}/>
        </Container>
    );
}

export default Room