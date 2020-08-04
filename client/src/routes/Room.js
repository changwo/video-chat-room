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

            socketRef.current.on("offer", handleReceiveCall);

            socketRef.current.on("answer", handleAnswer);

            socketRef.current.on("ice-candidate", handleNewICECandidateMsg);
        })
    }, [])

    const CallUser = (userID) => {
        peerRef.current = createPeer(userID);
        userStream.current.getTracks().forEach(track => peerRef.current.addTrack(track, userStream.current))
    }
    const createPeer = (userID) => {
        const peer = new RTCPeerConnection({
            iceSevers: [
                {
                    urls: "stun:stun.stunprotocol.org"
                },
                {
                    urls: 'turn:numb.viagenie.ca',
                    credentials: 'muazkh',
                    username: 'webrtc@live.com'
                }
            ]
        })
        peer.onicecandidate = handleICECandidateEvent;
        peer.ontrack = handleTrackEvent;
        peer.onnegotiationneeded = () => handleNegotiationNeededEvent(userID)

        return peer
    }

    const handleNegotiationNeededEvent = userID => {
        peerRef.current.createOffer().then(offer => {
            return peerRef.current.setLocalDescription(offer);
        }).then(() => {
            const payload = {
                target: userID,
                caller: socketRef.current.id,
                sdp: peerRef.current.localDescription
            };
            socketRef.current.emit("offer", payload)
        }).catch(e => console.log("error", e))
    }

    const handleReceiveCall = incoming => {
        peerRef.current = createPeer();
        const desc = new RTCSessionDescription(incoming.sdp)
        peerRef.current.setRemoteDescription(desc).then(() => {
            userStream.current.getTracks().forEach(track => peerRef.current.addTrack(track, userStream.current));
        }).then(() => {
            return peerRef.current.createAnswer();
        }).then(answer => {
            return peerRef.current.setLocalDescription(answer);
        }).then(() => {
            const payload = {
                target: incoming.caller,
                caller: socketRef.current.id,
                sdp: peerRef.current.localDescription
            }
            socketRef.current.emit("answer", payload);
        })
    }
    const handleAnswer = message => {
        const desc = new RTCSessionDescription(message.sdp);
        peerRef.current.setRemoteDescription(desc).catch(e => console.log("error", e));
    }

    const callUser = userID => {
        peerRef.current = createPeer(userID);
        userStream.current.getTracks().forEach(track => peerRef.current.addTrack(track, userStream.current));
    }

    const handleICECandidateEvent = e => {
        if (e.candiate) {
            const payload = {
                target: otherUser.current,
                candidate: e.candiate
            }
            socketRef.current.emit("ice-candidate", payload)
        }
    }

    const handleNewICECandidateMsg = incoming => {
        const candidate = new RTCIceCandidate(incoming);
        peerRef.current.addIceCandidate(candidate).catch(e => console.log("error", e))
    }

    const handleTrackEvent = e => {
        partnerVideo.current.srcObject = e.streams[0];
    };

    return (
        <Container>
            <Video autoPlay muted ref={userVideo}/>
            <Video autoPlay ref={partnerVideo}/>
        </Container>
    );
}

export default Room