import { Box } from "@mui/material";
import Header from '../components/header.js';
import DiscussResultDetail from "../components/discussResultDetail.js";

export default function DiscussResult(props) {
    return(
        <Box style={{backgroundColor:'#EEF1F4', height:'100vh'}}>
            <Header />
            <DiscussResultDetail activityId={props.activityId} />
        </Box>
    );
}