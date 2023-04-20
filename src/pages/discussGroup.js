import { Box } from "@mui/material";
import Header from '../components/header.js';
import DiscussGroupInfo from "../components/discussGroupInfo.js";
import ListInGroup from "../components/listInGroup.js";

export default function DiscussGroup(pageDiscussGroupProps) {
    return(
        <Box style={{backgroundColor:'#EEF1F4', padding:'0', margin:'0', minHeight:'100vh'}}>
            <Header />
            <DiscussGroupInfo groupId={pageDiscussGroupProps.groupId} />
            <ListInGroup groupId={pageDiscussGroupProps.groupId} />
            <div style={{backgroundColor:'#EEF1F4', height:'2vw'}}></div>
        </Box>
    );
    
}