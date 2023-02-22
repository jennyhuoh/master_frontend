import Header from "../components/header";
import GroupResultContent from "../components/groupResultContent";
import { Box } from "@mui/material";

export default function GroupResult() {
     return(
        <Box style={{backgroundColor:'#EEF1F4', padding:'0', margin:'0',}}>
        <Header />
        <GroupResultContent />
        <div style={{backgroundColor:'#EEF1F4', height:'2vw'}}></div>
        </Box>
     );
}