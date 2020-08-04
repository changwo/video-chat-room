import React, {useRef, useEffect} from "react";
import styled from "styled-components";


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

    return (
        <div>

        </div>
    )


}