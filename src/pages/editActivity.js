import { Box } from '@mui/material';
import Header from "../components/header";
import EditActivityContent from "../components/editActivityContent";

export default function EditActivity(props) {
    return(
        <Box style={{backgroundColor:'#EEF1F4', minHeight:'100vh'}}>
            <Header />
            <EditActivityContent groupId={props.groupId} activityId={props.activityId} />
        </Box>
    );
}