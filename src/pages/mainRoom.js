import { Box } from "@mui/material";
import styled from 'styled-components';
import RoomHeader from "../components/roomHeader";

const Container = styled.div`
    height: auto;
    min-height: 100vh;
    width: 100vw;
    background-color:#2B3143;
    padding:0;
    margin:0;
`;

export default function MainRoom(props) {
    // console.log(localStorage.getItem('role') === 'teacher');
    if(true) {
        return(
            <Container>
                <RoomHeader groupId={props.groupId} activityId={props.activityId} />
            </Container>
        );
    } else {
        return(<Box></Box>);
    }
}