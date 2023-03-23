import { Box } from "@mui/material";
import Header from '../components/header.js';
import GroupsInHome from "../components/groupsInHome.js";

export default function Home() {
    // console.log(localStorage.getItem('role') === 'teacher');
    if(true) {
        return(
            <Box style={{backgroundColor:'#EEF1F4', height:'100vh'}}>
                <Header />
                <GroupsInHome />
            </Box>
        );
    } else {
        return(<Box></Box>);
    }
}