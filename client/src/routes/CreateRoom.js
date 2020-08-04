import React from "react";
import {v1 as uuid} from "uuid"
import {useHistory} from "react-router";

const CreateRoom = (props) => {
    const {push} = useHistory()

    const create = () => {
        const id = uuid()
        push(`/room/${id}`);
    }

    return (
        <button onClick={create}>Create Room</button>
    )
}

export default CreateRoom;